import { longitudAprovechableMm, type ParametrosCorte } from '@aluminior/core/produccion'

export interface ParametrosProduccion { longitudBarraMm: number; kerfMm: number; saneamientoInicialMm: number; saneamientoFinalMm: number }
export function parametrosProduccion(query: { barra?: string; kerf?: string; inicial?: string; final?: string }): ParametrosProduccion {
  const numero = (valor: string | undefined, defecto: number) => valor === undefined ? defecto
    : valor.trim() === '' ? NaN : Number(valor)
  const p = { longitudBarraMm: numero(query.barra, 6000), kerfMm: numero(query.kerf, 0),
    saneamientoInicialMm: numero(query.inicial, 0), saneamientoFinalMm: numero(query.final, 0) }
  validarParametrosProduccion(p)
  return p
}
export function parametrosSierra(p: ParametrosProduccion): ParametrosCorte {
  return { saneamientoInicialMm: p.saneamientoInicialMm, saneamientoFinalMm: p.saneamientoFinalMm,
    discoIngleteMm: p.kerfMm, discoRectoMm: p.kerfMm }
}
export function validarParametrosProduccion(p: ParametrosProduccion): number {
  const campos: [string, number, boolean][] = [
    ['Barra', p.longitudBarraMm, true], ['Kerf', p.kerfMm, false],
    ['Saneamiento inicial', p.saneamientoInicialMm, false], ['Saneamiento final', p.saneamientoFinalMm, false],
  ]
  for (const [nombre, valor, positivo] of campos) {
    if (!Number.isFinite(valor)) throw new Error(`${nombre}: indica una medida válida en mm`)
    if (positivo ? valor <= 0 : valor < 0)
      throw new Error(`${nombre}: la medida debe ser ${positivo ? 'mayor que cero' : 'cero o mayor'} en mm`)
  }
  const util = longitudAprovechableMm(p.longitudBarraMm, parametrosSierra(p))
  if (util <= 0) throw new Error('El saneamiento agota la longitud de barra')
  return util
}
