/**
 * Cableado accesible entre un campo del formulario y el error que le devuelve
 * la acción. La asociación es estable —`<nombre>-error`— para que el lector de
 * pantalla anuncie el mensaje correcto aunque cambien orden o composición.
 */
export type ErroresCampo = Record<string, string[] | undefined>

export interface AtributosCampo {
  id: string
  name: string
  'aria-invalid'?: true
  'aria-describedby'?: string
}

export const idMensajeError = (nombre: string) => `${nombre}-error`

export function mensajesDe(nombre: string, errores: ErroresCampo): string[] {
  return errores[nombre]?.filter(Boolean) ?? []
}

export function atributosCampo(nombre: string, errores: ErroresCampo): AtributosCampo {
  const conError = mensajesDe(nombre, errores).length > 0
  return {
    id: nombre,
    name: nombre,
    ...(conError
      ? { 'aria-invalid': true as const, 'aria-describedby': idMensajeError(nombre) }
      : {}),
  }
}

/** Borde de error sin tocar el resto del estilo del campo. */
export function bordeCampo(
  nombre: string, errores: ErroresCampo, borde: string,
): string {
  return mensajesDe(nombre, errores).length ? 'var(--al-error)' : borde
}
