export type ReferenciaFi1Ofi = Readonly<{
  desde: 'exterior-inferior-marco-contenedor'
  hasta: 'eje-horizontal-travesano'
}>

export type MotivoGeometriaFi1OfiInvalida =
  | 'ancho-invalido'
  | 'alto-invalido'
  | 'fi-ausente'
  | 'fi-invalido'
  | 'fi-fuera-de-rango'

export type ResultadoGeometriaFi1Ofi =
  | Readonly<{
      valido: true
      dimensionesExteriores: Readonly<{
        anchoMm: number
        altoMm: number
      }>
      origen: 'superior-izquierda'
      ejeY: number
      fiMm: number
      referenciaFi: ReferenciaFi1Ofi
    }>
  | Readonly<{
      valido: false
      motivo: MotivoGeometriaFi1OfiInvalida
    }>

const REFERENCIA_FI_1OFI: ReferenciaFi1Ofi = Object.freeze({
  desde: 'exterior-inferior-marco-contenedor',
  hasta: 'eje-horizontal-travesano',
})

function esDimensionExteriorValida(valor: unknown): valor is number {
  return typeof valor === 'number' && Number.isFinite(valor) && valor > 0
}

export function resolverGeometriaFi1Ofi(
  anchoMm: unknown,
  altoMm: unknown,
  fiMm?: unknown,
): ResultadoGeometriaFi1Ofi {
  if (!esDimensionExteriorValida(anchoMm)) {
    return { valido: false, motivo: 'ancho-invalido' }
  }

  if (!esDimensionExteriorValida(altoMm)) {
    return { valido: false, motivo: 'alto-invalido' }
  }

  if (fiMm === undefined) {
    return { valido: false, motivo: 'fi-ausente' }
  }

  if (typeof fiMm !== 'number' || !Number.isFinite(fiMm)) {
    return { valido: false, motivo: 'fi-invalido' }
  }

  if (fiMm <= 0 || fiMm >= altoMm) {
    return { valido: false, motivo: 'fi-fuera-de-rango' }
  }

  return {
    valido: true,
    dimensionesExteriores: { anchoMm, altoMm },
    origen: 'superior-izquierda',
    ejeY: altoMm - fiMm,
    fiMm,
    referenciaFi: REFERENCIA_FI_1OFI,
  }
}
