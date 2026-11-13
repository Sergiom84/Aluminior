/**
 * Contraste masivo de GRUPO reales contra el motor de Aluminior.
 * Requiere `banco-contraste.ts extraer` sobre una copia; solo Postgres local y salida ignorada.
 * `--reclasificar` repite la clasificación y el resumen con las valoraciones guardadas.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join, resolve, relative, sep } from 'node:path'
import { execFileSync } from 'node:child_process'
import { parseArgs } from 'node:util'
import { conectarLocal, URL_LOCAL } from './lib/banco-contraste/local.ts'
import { clave, si, texto, type Caso } from './lib/banco-contraste/datos.ts'
import { gruposDeExportacion } from './lib/contraste-presupuestos/exportacion.ts'
import { clasificarGrupo } from './lib/contraste-presupuestos/clasificar.ts'
import { leerPlantillasDocumento } from './lib/contraste-presupuestos/plantillas-documento.ts'
import { resumirContraste } from './lib/contraste-presupuestos/resumen.ts'
import type { ContrasteGrupo } from './lib/contraste-presupuestos/ejecutar.ts'

const { values } = parseArgs({ options: { salida: { type: 'string' }, julio: { type: 'string' },
  url: { type: 'string', default: URL_LOCAL }, reclasificar: { type: 'boolean', default: false } } })
if (!values.salida) throw new Error('Uso: node --import tsx scripts/contraste-presupuestos.ts --salida export_datos/<extracción> [--julio export_datos/EMP0016] [--reclasificar]')
const salida = resolve(values.salida)
const rel = relative(resolve('.'), salida).split(sep).join('/')
if (!rel.startsWith('export_datos/') || rel.includes('..')) throw new Error('La salida debe estar dentro de export_datos/ ignorado')
execFileSync('git', ['check-ignore', '--quiet', salida])
const banco = JSON.parse(readFileSync(join(salida, 'banco.json'), 'utf8')) as { casos: Caso[] }
const grupos = banco.casos.filter(c => c.tipo === 'GRUPO')
const julio = values.julio ? gruposDeExportacion(values.julio) : null
const nuevo = (c: Caso) => julio !== null && !julio.has(clave(c.padre.nDoc, c.padre.nLinea))

let resultados: ContrasteGrupo[]
if (values.reclasificar) {
  resultados = (JSON.parse(readFileSync(join(salida, 'contraste-grupos.json'), 'utf8')) as ContrasteGrupo[])
    .map(g => ({ ...g, clasificacion: clasificarGrupo(g.entrada) }))
} else {
  const { contrastarGrupos } = await import('./lib/contraste-presupuestos/ejecutar.ts')
  const { sql, db } = conectarLocal(values.url!)
  try { resultados = await contrastarGrupos(db, grupos, nuevo, leerPlantillasDocumento(salida)) } finally { await sql.end({ timeout: 5 }) }
}
const resumen = { ...resumirContraste(resultados), revisionGit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  ejecutado: new Date().toISOString(), conJulio: julio !== null, gruposEnJulio: julio?.size ?? null,
  gruposConGeometria: grupos.filter(c => (c.geometria ?? []).some(g => !si(g.EsUnionSN))).length,
  fuente: texto(JSON.parse(readFileSync(join(salida, 'manifiesto.json'), 'utf8')).sha256) }
writeFileSync(join(salida, 'contraste-grupos.json'), JSON.stringify(resultados, null, 2))
writeFileSync(join(salida, 'contraste-resumen.json'), JSON.stringify(resumen, null, 2))
console.log(JSON.stringify(resumen, null, 2))
