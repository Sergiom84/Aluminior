/**
 * Campos de metraje habilitados según el tipo, observados en Productor:
 * ML deshabilita el múltiplo de ancho, Unidades deshabilita múltiplos y
 * largo, M2 los habilita todos. El peso se expresa por metro o por unidad.
 */

export type TipoMetraje = 'ML' | 'UD' | 'M2'

export interface CamposMetraje {
  multiploAncho: boolean
  multiploLargo: boolean
  metrajeMinimo: boolean
  unidadPeso: 'Kg./ML' | 'Kg./UD'
  unidadMinimo: 'ML' | 'UD' | 'M2'
}

export function camposMetraje(tipo: TipoMetraje): CamposMetraje {
  switch (tipo) {
    case 'M2':
      return { multiploAncho: true, multiploLargo: true, metrajeMinimo: true, unidadPeso: 'Kg./ML', unidadMinimo: 'M2' }
    case 'UD':
      return { multiploAncho: false, multiploLargo: false, metrajeMinimo: true, unidadPeso: 'Kg./UD', unidadMinimo: 'UD' }
    default:
      return { multiploAncho: false, multiploLargo: true, metrajeMinimo: true, unidadPeso: 'Kg./ML', unidadMinimo: 'ML' }
  }
}

/** Siguiente código numérico tras el mayor existente («Obtener Código Siguiente»). */
export function siguienteCodigoNumerico(mayor: string | number | null): string {
  const n = mayor === null ? 0 : Number(mayor)
  return String(Number.isFinite(n) ? Math.trunc(n) + 1 : 1)
}
