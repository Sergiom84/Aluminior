/**
 * Estado puro de la confirmación de «Copiar como revisión» (T.72.1.1).
 *
 * El proyecto no tiene testing-library ni jsdom instalados (ver
 * `vitest.config.ts` de `@aluminior/web`): el componente no se puede probar
 * disparando eventos DOM. Este reducer, en cambio, se prueba sin DOM ninguno
 * y el componente sólo lo conecta a los eventos reales.
 */

export type EstadoConfirmacion =
  | { readonly fase: 'INACTIVO' }
  | { readonly fase: 'ARMADO' }
  | { readonly fase: 'ENVIANDO' }
  | { readonly fase: 'ERROR'; readonly mensaje: string }

export type AccionConfirmacion =
  | { readonly tipo: 'ARMAR' }
  | { readonly tipo: 'CANCELAR' }
  | { readonly tipo: 'ENVIAR' }
  | { readonly tipo: 'EXITO' }
  | { readonly tipo: 'FALLO'; readonly mensaje: string }

export const ESTADO_INICIAL: EstadoConfirmacion = { fase: 'INACTIVO' }

/**
 * Un fallo deja la confirmación en `ERROR`, no en `INACTIVO`: el mensaje y la
 * posibilidad de reintentar o cancelar siguen visibles.
 *
 * `ENVIAR` sólo transiciona desde `ARMADO` o `ERROR` (reintento); desde
 * `INACTIVO` o ya `ENVIANDO` no hace nada — es la guarda de doble envío, y no
 * depende de que la interfaz recuerde deshabilitar el botón a tiempo.
 */
export function reducirConfirmacion(
  estado: EstadoConfirmacion, accion: AccionConfirmacion,
): EstadoConfirmacion {
  switch (accion.tipo) {
    case 'ARMAR':
      return estado.fase === 'INACTIVO' ? { fase: 'ARMADO' } : estado
    case 'CANCELAR':
      return estado.fase === 'ENVIANDO' ? estado : { fase: 'INACTIVO' }
    case 'ENVIAR':
      return estado.fase === 'ARMADO' || estado.fase === 'ERROR' ? { fase: 'ENVIANDO' } : estado
    case 'EXITO':
      return estado.fase === 'ENVIANDO' ? { fase: 'INACTIVO' } : estado
    case 'FALLO':
      return estado.fase === 'ENVIANDO' ? { fase: 'ERROR', mensaje: accion.mensaje } : estado
    default:
      return estado
  }
}
