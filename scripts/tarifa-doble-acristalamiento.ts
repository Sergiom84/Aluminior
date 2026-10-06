/**
 * Propuesta de coste/PVP de los dobles acristalamientos con una tarifa de
 * proveedor nueva. Solo lectura: CSV exportados de una copia del catálogo y la
 * tarifa transcrita (JSON privado). Escribe en una subcarpeta ignorada de
 * output/ la propuesta completa y un CSV por tarifa de venta con el formato de
 * `etl:tarifa`, que se carga aparte y en dry-run, nunca sobre 1/2/3.
 *
 *   npx tsx scripts/tarifa-doble-acristalamiento.ts \
 *     --tarifa export_datos/tarifas-proveedor/<proveedor>.json [--catalogo export_datos/EMP0016]
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { parseArgs } from 'node:util'
import { normalizarDecimal, parsearComposicion, type TarifaDobleAcristalamiento } from '../packages/core/src/precios/index.ts'
import { parse } from 'csv-parse/sync'
import { derivarTarifaGuardada } from './lib/tarifa-doble-acristalamiento/derivar.ts'
import { construirPropuesta, medirFactores, resumirPropuesta, type ArticuloConPvp } from './lib/tarifa-doble-acristalamiento/propuesta.ts'

const { values } = parseArgs({ options: { tarifa: { type: 'string' },
  catalogo: { type: 'string', default: 'export_datos/EMP0016' }, salida: { type: 'string' } } })
if (!values.tarifa) throw new Error('Se exige --tarifa <json de la tarifa del proveedor>')
const tarifa = JSON.parse(readFileSync(values.tarifa, 'utf8')) as TarifaDobleAcristalamiento & {
  proveedor: string; fecha: string; sha256: string; hipotesis: string[]; condiciones: unknown; incrementosSuperficie: unknown }
const salida = resolve(values.salida ?? join('output/tarifa-doble-acristalamiento', basename(values.tarifa, '.json')))
mkdirSync(salida, { recursive: true })
execFileSync('git', ['check-ignore', '--quiet', salida])

const leerCsv = (carpeta: string, nombre: string): Record<string, string>[] =>
  parse(readFileSync(join(carpeta, `${nombre}.csv`)), { columns: true, bom: true, relax_quotes: true })
const decimal = (v: string | undefined) => v && v.trim() ? normalizarDecimal(v.trim().replace(',', '.'), 2) : null
const carpeta = values.catalogo!
const coste = new Map<string, string | null>(leerCsv(carpeta, 'ArticulosCoste').map(c => [c.Articulo!.trim(), decimal(c.Coste)]))
const pvp = new Map<string, Record<string, string>>()
for (const p of leerCsv(carpeta, 'ArticulosPVP')) {
  const v = decimal(p.PVP); if (v === null) continue
  const m = pvp.get(p.Articulo!.trim()) ?? {}; m[p.Tarifa!.trim()] = v; pvp.set(p.Articulo!.trim(), m)
}
const vidrios = leerCsv(carpeta, 'Articulos').filter(a => a.Familia?.trim() === '050')
const articulos: ArticuloConPvp[] = []
for (const a of vidrios) {
  const composicion = parsearComposicion(a.Descripcion ?? ''); if (!composicion) continue
  const codigo = a.Codigo!.trim()
  articulos.push({ codigo, composicion, coste: coste.get(codigo) ?? null, pvp: pvp.get(codigo) ?? {} })
}
const metrajes = new Set(vidrios.filter(a => parsearComposicion(a.Descripcion ?? ''))
  .map(a => `${decimal(a.MetrajeMinimo)}|${a.MetrajeMultiploAncho}|${a.MetrajeMultiploLargo}`))

const guardada = derivarTarifaGuardada(articulos)
const factores = medirFactores(articulos)
const filas = construirPropuesta(articulos, tarifa, factores)
const resumen = { proveedor: tarifa.proveedor, fecha: tarifa.fecha, tarifaSha256: tarifa.sha256,
  catalogo: resolve(carpeta), vidriosFamilia050: vidrios.length, compuestos: articulos.length,
  modeloGuardado: { reproducidos: guardada.reproducidos, discrepancias: guardada.discrepancias.length,
    base: guardada.tarifa.base, camaras: guardada.tarifa.camaras, vidrios: guardada.tarifa.vidrios },
  factores, metrajeActual: [...metrajes], condicionesNuevas: tarifa.condiciones,
  incrementosNuevos: tarifa.incrementosSuperficie, hipotesis: tarifa.hipotesis, ...resumirPropuesta(filas) }

const tarifas = factores.map(f => f.tarifa)
const cabecera = ['articulo', 'coste_actual', 'coste_nuevo', 'motivo', 'detalle',
  ...tarifas.flatMap(t => [`pvp${t}_actual`, `pvp${t}_nuevo`])]
const csv = (filasCsv: (string | null)[][]) => filasCsv.map(f => f.map(v => v === null ? '' : /[",;]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v).join(',')).join('\n') + '\n'
writeFileSync(join(salida, 'propuesta.csv'), csv([cabecera, ...filas.map(f => [f.codigo, f.costeActual, f.costeNuevo, f.motivo, f.detalle,
  ...tarifas.flatMap(t => [f.pvpActual[t], f.pvpNuevo[t]])])]))
for (const t of tarifas)
  writeFileSync(join(salida, `pvp-tarifa-${t}-para-cargador.csv`), csv([['articulo', 'acabado', 'precio', 'fecha_vigencia'],
    ...filas.filter(f => f.pvpNuevo[t] !== null).map(f => [f.codigo, 'UNI', f.pvpNuevo[t], tarifa.fecha])]))
writeFileSync(join(salida, 'resumen.json'), JSON.stringify(resumen, null, 2))
console.log(JSON.stringify({ salida, ...resumen, modeloGuardado: { reproducidos: guardada.reproducidos,
  discrepancias: guardada.discrepancias.length }, hipotesis: undefined, incrementosNuevos: undefined }, null, 2))
