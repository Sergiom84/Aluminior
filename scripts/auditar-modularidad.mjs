/** Auditoría local sin ejecutar aplicación, ETL ni conectarse a ninguna BD. */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const normalizar = p => p.replaceAll('\\', '/')
const excepciones = JSON.parse(readFileSync(join(raiz, 'scripts/modularidad-excepciones.json'), 'utf8'))
const omitidos = new Set(['node_modules', '.next', 'dist', 'coverage', 'migrations'])
function archivos(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    if (omitidos.has(e.name)) return []
    const ruta = join(dir, e.name)
    return e.isDirectory() ? archivos(ruta) : /\.(?:ts|tsx|mjs|css)$/.test(e.name) ? [ruta] : []
  })
}
const rutas = [...archivos(join(raiz, 'packages')), ...archivos(join(raiz, 'scripts'))]
const errores = []
const revisables = []
const grafo = new Map()
const produccion = ruta => !/\.test\.|[\\/]pruebas[\\/]/.test(ruta)
const opciones = { moduleResolution: ts.ModuleResolutionKind.Bundler, allowImportingTsExtensions: true }
for (const ruta of rutas) {
  const fichero = normalizar(relative(raiz, ruta))
  const texto = readFileSync(ruta, 'utf8')
  const lineas = texto.trimEnd().split(/\r?\n/).length
  if (lineas >= 250) revisables.push({ fichero, lineas, excepcion: excepciones[fichero]?.motivo ?? null })
  if (lineas > 400 && (!excepciones[fichero] || lineas > excepciones[fichero].maximo)) {
    errores.push(`${fichero}: ${lineas} líneas, requiere separación o revisión explícita de cohesión`)
  }
  if (!produccion(ruta) || !fichero.startsWith('packages/') || ruta.endsWith('.css')) continue
  const ast = ts.createSourceFile(ruta, texto, ts.ScriptTarget.Latest, true)
  const dependencias = []
  for (const n of ast.statements) {
    if (!ts.isImportDeclaration(n) && !ts.isExportDeclaration(n)) continue
    const spec = n.moduleSpecifier?.text
    if (!spec) continue
    const soloTipos = n.isTypeOnly || n.importClause?.isTypeOnly ||
      (n.importClause && !n.importClause.name && ts.isNamedImports(n.importClause.namedBindings) &&
        n.importClause.namedBindings.elements.length > 0 && n.importClause.namedBindings.elements.every(e => e.isTypeOnly))
    if (soloTipos) continue
    if (fichero.startsWith('packages/core/') && !spec.startsWith('.')) {
      errores.push(`${fichero}: dependencia externa del dominio puro: ${spec}`)
    }
    if (spec.startsWith('.')) {
      const resuelto = ts.resolveModuleName(spec, ruta, opciones, ts.sys).resolvedModule?.resolvedFileName
      if (!resuelto) continue // El typecheck valida resolución; CSS y declaraciones tienen otro tratamiento.
      const destino = normalizar(relative(raiz, resuelto))
      if (destino.startsWith('scripts/')) {
        errores.push(`${fichero}: dependencia de un script de investigación: ${spec}`)
      }
      if (destino.startsWith('packages/') && fichero.split('/')[1] !== destino.split('/')[1]) {
        errores.push(`${fichero}: acceso privado entre paquetes: ${spec}`)
      }
      if (!resuelto.endsWith('.d.ts') && produccion(resuelto)) dependencias.push(resolve(resuelto))
    }
  }
  grafo.set(resolve(ruta), dependencias)
}
const vistos = new Set(), pila = [], activos = new Set()
function visitar(ruta) {
  if (activos.has(ruta)) {
    errores.push('Ciclo de ejecución: ' + [...pila.slice(pila.indexOf(ruta)), ruta]
      .map(f => normalizar(relative(raiz, f))).join(' -> '))
    return
  }
  if (vistos.has(ruta)) return
  vistos.add(ruta); activos.add(ruta); pila.push(ruta)
  for (const dependencia of grafo.get(ruta) ?? []) visitar(dependencia)
  pila.pop(); activos.delete(ruta)
}
for (const ruta of grafo.keys()) visitar(ruta)
for (const [fichero, excepcion] of Object.entries(excepciones)) {
  if (!excepcion.motivo || !statSync(join(raiz, fichero), { throwIfNoEntry: false })) {
    errores.push(`Excepción sin motivo o archivo inexistente: ${fichero}`)
  }
}
const informe = { archivos: rutas.length, modulos: grafo.size, revisables, errores }
if (process.argv.includes('--json')) console.log(JSON.stringify(informe, null, 2))
else {
  console.log(`${informe.archivos} archivos; ${informe.modulos} módulos; ${revisables.length} revisiones de tamaño; ${errores.length} infracciones.`)
  for (const error of errores) console.error(error)
}
if (errores.length) process.exitCode = 1
