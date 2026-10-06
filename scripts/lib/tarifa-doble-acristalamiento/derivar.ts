/**
 * Tarifa por componentes implícita en el coste guardado del catálogo.
 *
 * Sirve de control del modelo antes de aplicar una tarifa nueva: si la tarifa
 * derivada no reproduce cada coste guardado, la estructura base + cámara +
 * vidrios no describe ese catálogo y la propuesta no es fiable.
 * Base por cámara/gas = coste de 4/cámara/4; suplemento de un vidrio =
 * coste de 4/16/vidrio − coste de 4/16/4.
 */
import {
  costeDobleAcristalamiento, restarDecimal, type ComposicionDobleAcristalamiento,
  type SuplementoCamara, type TarifaDobleAcristalamiento,
} from '../../../packages/core/src/precios/index.ts'

export interface ArticuloCompuesto {
  codigo: string
  composicion: ComposicionDobleAcristalamiento
  /** Coste guardado, con dos decimales; `null` si no tiene. */
  coste: string | null
}

export interface TarifaDerivada {
  tarifa: TarifaDobleAcristalamiento
  reproducidos: number
  discrepancias: { codigo: string; guardado: string; derivado: string | null }[]
}

const clave = (c: ComposicionDobleAcristalamiento) => `${c.exterior}|${c.camaraMm}|${c.argon}|${c.interior}`

export function derivarTarifaGuardada(articulos: readonly ArticuloCompuesto[]): TarifaDerivada {
  const coste = new Map(articulos.filter(a => a.coste !== null).map(a => [clave(a.composicion), a.coste!]))
  const base = coste.get('4|16|false|4')
  if (base === undefined) throw new Error('Falta 4/16/4 con coste: no se puede derivar la base')
  const camaras: Record<number, SuplementoCamara> = {}
  for (const mm of new Set(articulos.map(a => a.composicion.camaraMm))) {
    const sinGas = coste.get(`4|${mm}|false|4`), argon = coste.get(`4|${mm}|true|4`)
    if (sinGas === undefined) continue
    camaras[mm] = { sinGas: restarDecimal(sinGas, base, 2),
      ...(argon === undefined ? {} : { argon: restarDecimal(argon, base, 2) }) }
  }
  const vidrios: Record<string, string> = {}
  for (const a of articulos) {
    const { exterior, interior } = a.composicion
    for (const v of [exterior, interior]) {
      const x = coste.get(`4|16|false|${v}`) ?? coste.get(`${v}|16|false|4`)
      if (x !== undefined && vidrios[v] === undefined) vidrios[v] = restarDecimal(x, base, 2)
    }
  }
  const tarifa: TarifaDobleAcristalamiento = { base, camaras, vidrios }
  const discrepancias: TarifaDerivada['discrepancias'] = []
  let reproducidos = 0
  for (const a of articulos) {
    if (a.coste === null) continue
    const r = costeDobleAcristalamiento(a.composicion, tarifa)
    const derivado = r.estado === 'CALCULADO' ? r.coste : null
    if (derivado !== null && Number(derivado) === Number(a.coste)) reproducidos++
    else discrepancias.push({ codigo: a.codigo, guardado: a.coste, derivado })
  }
  return { tarifa, reproducidos, discrepancias }
}
