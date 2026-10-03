/** Banco de precios: solo copia MDB, Postgres local y salidas privadas ignoradas. */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, join, relative, sep } from 'node:path'
import { execFileSync } from 'node:child_process'
import { parseArgs } from 'node:util'
import { leerFuente } from './lib/banco-contraste/fuente.ts'
import { construirContraste } from './lib/banco-contraste/extraer.ts'
import { conectarLocal, prepararLocal, URL_LOCAL } from './lib/banco-contraste/local.ts'
import { exportarCatalogo, verificarCatalogo } from './lib/banco-contraste/catalogo.ts'
import { comprobarNoRegresion } from './lib/banco-contraste/diagnostico.ts'
import { verificarBase } from './lib/banco-contraste/verificar-base.ts'

const { positionals, values } = parseArgs({ allowPositionals: true, options: {
  mdb: { type: 'string' }, salida: { type: 'string', default: 'export_datos/banco-contraste' },
  origen: { type: 'string' }, url: { type: 'string', default: URL_LOCAL },
  informe: { type: 'string' },
} })
const accion = positionals[0], salida = resolve(values.salida!)
const rel = relative(resolve('.'), salida).split(sep).join('/')
if (!rel.startsWith('export_datos/') || rel.includes('..')) throw new Error('La salida debe estar dentro de export_datos/ ignorado')
execFileSync('git', ['check-ignore', '--quiet', salida])
mkdirSync(salida, { recursive: true })
const guardar = (n: string, v: unknown) => writeFileSync(join(salida, `${n}.json`), JSON.stringify(v, null, 2))
if (accion === 'catalogo') {
  if (!values.mdb) throw new Error('Falta --mdb <Anterior.mdb>')
  // Mismo guardado de copia que la extracción técnica antes de exportar catálogos.
  leerFuente(values.mdb)
  exportarCatalogo(values.mdb, join(salida, 'catalogo'))
} else if (accion === 'extraer') {
  if (!values.mdb) throw new Error('Falta --mdb <Anterior.mdb>')
  const fuente = leerFuente(values.mdb)
  const banco = construirContraste(fuente.tablas)
  guardar('manifiesto', fuente.manifiesto); guardar('tablas', fuente.tablas); guardar('banco', banco)
  console.log(JSON.stringify(banco.evidencia, null, 2))
} else if (accion === 'preparar') {
  if (!values.origen) throw new Error('Falta --origen <CSV de la misma copia>')
  const manifiesto = JSON.parse(readFileSync(join(salida, 'manifiesto.json'), 'utf8'))
  const fuenteHash = verificarCatalogo(values.origen, manifiesto.sha256)
  const { sql } = conectarLocal(values.url!)
  try { const r = await prepararLocal(sql, values.origen); guardar('carga-local', { ...r, fuenteHash }); console.log(JSON.stringify(r, null, 2)) }
  finally { await sql.end({ timeout: 5 }) }
} else if (accion === 'medir') {
  const { ejecutarBanco } = await import('./lib/banco-contraste/ejecutar.ts')
  const { sql, db } = conectarLocal(values.url!)
  try {
    const manifiesto = JSON.parse(readFileSync(join(salida, 'manifiesto.json'), 'utf8'))
    verificarCatalogo(values.origen ?? join(salida, 'catalogo'), manifiesto.sha256)
    const t = JSON.parse(readFileSync(join(salida, 'tablas.json'), 'utf8'))
    const verificacion = await verificarBase(sql, t)
    const firmasPrevias = join(salida, 'base-verificada.json')
    try {
      const previas = JSON.parse(readFileSync(firmasPrevias, 'utf8'))
      if (previas.fuenteHash !== manifiesto.sha256 || JSON.stringify(previas.firmas) !== JSON.stringify(verificacion.firmas)) throw new Error('El catálogo local cambió respecto a la medición anterior')
    } catch (e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e }
    guardar('base-verificada', { ...verificacion, fuenteHash: manifiesto.sha256 })
    const banco = construirContraste(t)
    const r = await ejecutarBanco(db, banco, t)
    const despues = await verificarBase(sql, t)
    if (JSON.stringify(despues.firmas) !== JSON.stringify(verificacion.firmas)) throw new Error('El catálogo cambió durante la medición; resultado descartado')
    try {
      const anteriores = JSON.parse(readFileSync(join(salida, 'resultados.json'), 'utf8'))
      comprobarNoRegresion(anteriores.mediciones, r.mediciones)
    } catch (e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e }
    guardar('resultados', r)
    if (values.informe) {
      const { escribirInforme } = await import('./lib/banco-contraste/informe.ts')
      escribirInforme(values.informe, r, manifiesto)
    }
    console.log(JSON.stringify(r.resumen, null, 2))
  } finally { await sql.end({ timeout: 5 }) }
} else throw new Error('Uso: node --import tsx scripts/banco-contraste.ts extraer|catalogo|preparar|medir [--mdb copia] [--origen CSV] [--salida export_datos/banco-contraste] [--url local] [--informe docs/paridad/BANCO-CONTRASTE-fecha.md]')
