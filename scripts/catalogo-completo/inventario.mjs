/** node --import tsx scripts/catalogo-completo/inventario.mjs [carpetaCSV ...] [--evidencias archivo.json] */
import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PLANTILLAS_DISENO, UNIONES_VISUALES } from '../../packages/core/src/estructuras/diseno.ts'
import { descubrirExportaciones, huellaArchivo, inventariarMdb, leerFuenteCatalogo } from './fuentes.mjs'
import { construirMatriz } from './modelo.mjs'
import { analizarArgumentos, cargarEvidencias } from './evidencias.mjs'

const raiz = fileURLToPath(new URL('../../', import.meta.url))
// Fijo bajo output: nunca exporta el catálogo real dentro de código versionable.
const destino = join(raiz, 'output', 'catalogo-completo')
const opciones = analizarArgumentos(process.argv.slice(2))
const origenes = opciones.carpetas.length ? opciones.carpetas
  : descubrirExportaciones([join(raiz, 'export_datos'), join(raiz, 'output')])
if (!origenes.length) throw new Error('No se encontró ninguna exportación con las tres tablas de catálogo')
const fuenteC2 = 'docs/paridad/fase-7/13-cierre-cotas-c2.md'
const lecturas = origenes.map(leerFuenteCatalogo)
const evidencia = cargarEvidencias(opciones.evidencias, lecturas, raiz)
const matrices = lecturas.map(lectura => construirMatriz(lectura, {
  plantillas: PLANTILLAS_DISENO, uniones: UNIONES_VISUALES,
  evidencias: evidencia.porFuente.get(lectura.fuente.id),
}))
const instalacion = inventariarMdb(process.env.PRODUCTOR_INVENTARIO_RUTA ??
  'C:/Users/sergi/Desktop/MIX/Productor/Aluminio')
const archivosCodigo = carpeta => readdirSync(join(raiz, carpeta), { withFileTypes: true })
  .flatMap(e => e.isDirectory() ? archivosCodigo(join(carpeta, e.name))
    : e.isFile() && /\.(ts|mjs)$/.test(e.name) ? [join(carpeta, e.name)] : [])
const informe = { version: 1, generadoUtc: new Date().toISOString(),
  commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: raiz, encoding: 'utf8' }).trim(),
  alcance: 'Todas las filas de las exportaciones descubiertas. No demuestra que las exportaciones agoten la instalación.',
  evidenciaOperativa: evidencia.documento,
  antecedentes: [{ codigo: 'C2', fuente: fuenteC2,
    alcance: 'GMC400, L, V410ACGP6, 1200x1200; edición/persistencia QA y precio con avisos/coste incompleto.',
    limite: 'Evidencia anterior sin hash CSV registrado; no se reasigna a exportaciones o configuraciones distintas.' }],
  procedenciaCodigo: [...archivosCodigo('packages/core/src/estructuras'),
    ...archivosCodigo('scripts/catalogo-completo'), 'scripts/lib/catalogo-diseno.mjs', fuenteC2]
    .map(ruta => huellaArchivo(join(raiz, ruta))),
  instalacion, fuentes: matrices,
}
mkdirSync(destino, { recursive: true })
writeFileSync(join(destino, 'matriz.json'), `${JSON.stringify(informe, null, 2)}\n`)
const resumen = { generadoUtc: informe.generadoUtc, commit: informe.commit,
  evidenciaOperativa: evidencia.documento,
  mdbSoloMetadatos: instalacion.archivos.length,
  fuentes: matrices.map(m => ({ fuente: m.fuente, resumen: m.resumen,
    disenos: m.disenos, familiasDeclaradas: m.familiasDeclaradas, familias: m.familias })) }
writeFileSync(join(destino, 'resumen.json'), `${JSON.stringify(resumen, null, 2)}\n`)
console.log(JSON.stringify({ destino, mdbSoloMetadatos: instalacion.archivos.length,
  fuentes: matrices.map(m => ({ fuente: m.fuente.nombre, ...m.resumen,
    familiasDeclaradas: m.familiasDeclaradas, familiasClasificadas: m.familias.length,
    ...m.disenos })) }, null, 2))
