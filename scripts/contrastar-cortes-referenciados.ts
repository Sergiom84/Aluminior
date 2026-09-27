/**
 * Solo lectura. Uso: npx tsx scripts/contrastar-cortes-referenciados.ts <carpeta CSV>
 * No carga .env, no conecta a bases y no imprime documentos ni datos personales.
 * Mide C2/C3 GMC400: relación entre cortes OBSERVADOS, nunca predicción de precio.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse/sync'
import { contrastarReferencias, type PiezaReferencia } from './lib/contraste-referencias-corte.ts'

const carpeta = process.argv[2]
if (!carpeta) throw new Error('Indica explícitamente la carpeta de CSV de solo lectura')
type Fila = Record<string, string>
const leer = (nombre: string): Fila[] => parse(readFileSync(join(carpeta, `${nombre}.csv`)), {
  columns: true, bom: true,
})
const numero = (v: string | undefined) => v?.trim()
  ? Number(v.replace(/\./g, '').replace(',', '.')) : NaN
const clave = (...partes: (string | undefined)[]) => JSON.stringify(partes)
const configuraciones = new Map(leer('VDatosLinEstr').filter(r => r.TipoDoc === 'VPRES')
  .map(r => [clave(r.nVDoc, r.nVLinea), r]))
const lineas = leer('VPresupuestosLin')
const padres = new Map(lineas.filter(r => ['C2', 'C3'].includes(r.Articulo!)
  && r.EstructuraSN === 'True'
  && configuraciones.get(clave(r.nDoc, r.nLinea))?.Conjunto1 === 'GMC400')
  .map(r => [clave(r.nDoc, r.nLinea), r]))
const detalles = new Map<string, Fila[]>()
for (const d of leer('VDatosLinDetDis').filter(r => r.TipoDoc === 'VPRES')) {
  const k = clave(d.nVDoc, d.nVLinea)
  detalles.set(k, [...(detalles.get(k) ?? []), d])
}
const piezas: PiezaReferencia[] = []
const seleccionadas = new Set<PiezaReferencia>()
let enlacesNoUnivocos = 0
let hojasHorizontales = 0
for (const r of lineas) {
  if (!padres.has(clave(r.nDoc, r.nEstr))) continue
  const seleccionada = r.Articulo === 'GM451' && r.Funcion === 'HH'
  if (seleccionada) hojasHorizontales++
  const candidatos = detalles.get(clave(r.nDoc, r.nLinea)) ?? []
  if (candidatos.length !== 1) {
    if (seleccionada) enlacesNoUnivocos++
    continue
  }
  const d = candidatos[0]!
  const pieza: PiezaReferencia = {
    documento: r.nDoc!, estructura: r.nEstr!, id: d.DisId!,
    referencia: d.DisIdRefLargo && d.DisIdRefLargo !== '0' ? d.DisIdRefLargo : null,
    formula: d.DisFRefLargo?.trim() || null,
    largo: numero(r.LargoCorte?.trim() ? r.LargoCorte : r.Largo),
    descuentoInicio: numero(r.DtoLIni), descuentoFin: numero(r.DtoLFin),
  }
  piezas.push(pieza)
  if (seleccionada) seleccionadas.add(pieza)
}
const resultados = contrastarReferencias(piezas).filter(r => seleccionadas.has(r.pieza))
const resumen: Record<string, number> = {}
for (const r of resultados) {
  const estado = r.estado === 'comparada'
    ? Math.abs(r.diferencia) <= 0.01 ? 'coincide-0.01mm' : 'difiere' : r.estado
  resumen[estado] = (resumen[estado] ?? 0) + 1
}
console.log(JSON.stringify({
  alcance: 'Relación retrospectiva, no predicción independiente',
  estructuras: padres.size, hojasHorizontales,
  sinReferenciaOFormula: seleccionadas.size - resultados.length,
  enlacesNoUnivocos, resumen,
}, null, 2))
