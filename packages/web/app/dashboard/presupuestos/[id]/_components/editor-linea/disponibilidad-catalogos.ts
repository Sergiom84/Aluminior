export type EstadoCargaCatalogo = {
  clave: string
  estado: 'PENDIENTE' | 'LISTO' | 'ERROR'
}

/** La clave vincula la respuesta al modelo/serie que se va a enviar. */
export function claveCatalogoHerraje(serie: string, estructura: string): string {
  return JSON.stringify([serie, estructura])
}

export function catalogosEstructuraListos(
  serie: string,
  estructura: string,
  herraje: EstadoCargaCatalogo | null,
  acristalamiento: EstadoCargaCatalogo | null,
): boolean {
  return herraje?.clave === claveCatalogoHerraje(serie, estructura) && herraje.estado === 'LISTO' &&
    acristalamiento?.clave === serie && acristalamiento.estado === 'LISTO'
}
