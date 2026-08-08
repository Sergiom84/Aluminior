/**
 * Estado puro de "Copiar…" con sus dos destinos (T.72.1, T.72.2).
 *
 * El proyecto no tiene testing-library ni jsdom instalados (ver
 * `vitest.config.ts` de `@aluminior/web`): el componente no se puede probar
 * disparando eventos DOM. Este reducer, en cambio, se prueba sin DOM ninguno
 * y el componente sólo lo conecta a los eventos reales.
 */

export type Operacion = 'REVISION' | 'NUEVO'

export type EstadoConfirmacion =
  | { readonly fase: 'INACTIVO' }
  | { readonly fase: 'ELIGIENDO' }
  | { readonly fase: 'ENVIANDO'; readonly operacion: Operacion }
  | { readonly fase: 'ERROR'; readonly operacion: Operacion; readonly mensaje: string }

export type AccionConfirmacion =
  | { readonly tipo: 'ARMAR' }
  | { readonly tipo: 'CANCELAR' }
  | { readonly tipo: 'ENVIAR'; readonly operacion: Operacion }
  | { readonly tipo: 'EXITO' }
  | { readonly tipo: 'FALLO'; readonly mensaje: string }

export const ESTADO_INICIAL: EstadoConfirmacion = { fase: 'INACTIVO' }

/**
 * Un fallo deja la confirmación en `ERROR`, no en `INACTIVO`: conserva la
 * operación que falló (revisión o nuevo), el mensaje, y la posibilidad de
 * reintentar ESA operación o cancelar.
 *
 * `ENVIAR` sólo transiciona desde `ELIGIENDO` o `ERROR` (reintento); desde
 * `INACTIVO` o ya `ENVIANDO` no hace nada — es la guarda de doble envío, y no
 * depende de que la interfaz recuerde deshabilitar el botón a tiempo.
 */
export function reducirConfirmacion(
  estado: EstadoConfirmacion, accion: AccionConfirmacion,
): EstadoConfirmacion {
  switch (accion.tipo) {
    case 'ARMAR':
      return estado.fase === 'INACTIVO' ? { fase: 'ELIGIENDO' } : estado
    case 'CANCELAR':
      return estado.fase === 'ENVIANDO' ? estado : { fase: 'INACTIVO' }
    case 'ENVIAR':
      return estado.fase === 'ELIGIENDO' || estado.fase === 'ERROR'
        ? { fase: 'ENVIANDO', operacion: accion.operacion }
        : estado
    case 'EXITO':
      return estado.fase === 'ENVIANDO' ? { fase: 'INACTIVO' } : estado
    case 'FALLO':
      return estado.fase === 'ENVIANDO'
        ? { fase: 'ERROR', operacion: estado.operacion, mensaje: accion.mensaje }
        : estado
    default:
      return estado
  }
}
