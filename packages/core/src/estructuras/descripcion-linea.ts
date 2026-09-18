import type { PlantillaDiseno } from './diseno.ts'

export interface DatosDescripcionLinea {
  readonly plantilla: PlantillaDiseno
  readonly anchoMm: number
  readonly altoMm: number
  readonly serie?: string | null
  readonly vidrio?: string | null
  readonly acabado?: string | null
  readonly varianteAcristalamiento?: '1' | '2'
}

/**
 * Texto de línea al estilo del editor de Productor. Es una previsualización
 * para el operador; la descripción persistida la decide el servidor.
 */
export function descripcionLineaEstructura(datos: DatosDescripcionLinea): string {
  const partes = [
    datos.plantilla.descripcion,
    `DE MEDIDAS: ${datos.anchoMm} x ${datos.altoMm}`,
  ]
  if (datos.acabado?.trim()) partes.push(`EN COLOR ${datos.acabado.trim()}`)
  if (datos.serie?.trim()) partes.push(`PERFILERÍA: ${datos.serie.trim()}`)
  const cristal = datos.varianteAcristalamiento === '1'
    ? 'CRISTAL SENCILLO'
    : 'DOBLE ACRISTALAMIENTO'
  if (datos.vidrio?.trim()) partes.push(`CRISTAL: ${cristal} ${datos.vidrio.trim()}`)
  else if (datos.varianteAcristalamiento) partes.push(`CRISTAL: ${cristal}`)
  return partes.join(' ')
}
