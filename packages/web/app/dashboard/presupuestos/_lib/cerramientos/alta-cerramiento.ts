import {
  descripcionCerramiento, medidasCerramiento, type ConfiguracionCerramiento,
} from '@aluminior/core/estructuras'
import type { ClienteEscritura } from '../cliente-db.ts'
import { validarConfiguracionCerramiento } from './validacion.ts'
import { persistirCerramiento } from './persistir-cerramiento.ts'

/**
 * La regla del dinero, aplicada al cerramiento: hasta que exista la valoración
 * agregada de módulos, uniones, vidrio y ajustes, la línea se guarda sin precio
 * y lo dice. Nunca un cero ni un total parcial presentado como correcto.
 */
export const AVISO_VALORACION_PENDIENTE =
  'Importe incompleto: la composición se ha guardado, pero la valoración agregada del cerramiento está pendiente.'

export const MENSAJE_MIGRACION_PENDIENTE =
  'El guardado de cerramientos está preparado, pero su migración de base de datos aún no está aplicada en este entorno.'

export interface DatosAltaCerramiento {
  configuracionSerializada: string | null
  serieCodigo: string | null
  vidrioCodigo: string | null
  acabadoCodigo: string | null
  varianteAcristalamiento: '1' | '2'
  ajusteFabricacion: number
  ajusteColocacion: number
}

/** Lo que el alta de línea necesita saber del cerramiento, ya resuelto. */
export interface AltaCerramiento {
  configuracion: ConfiguracionCerramiento
  descripcion: string
  anchoMm: number
  altoMm: number
  precioUnitario: null
  aviso: string
  datos: DatosAltaCerramiento
}

export type ResultadoAltaCerramiento =
  | { ok: true; alta: AltaCerramiento }
  | { ok: false; errores: Record<string, string[]> }

/**
 * Resuelve el cerramiento antes de tocar la base de datos: valida la
 * composición recibida del configurador y deriva de ella descripción y medidas.
 *
 * Las medidas se recalculan en servidor a propósito. El formulario las muestra
 * en campos de sólo lectura, pero el navegador no es la autoridad sobre lo que
 * se guarda en el documento.
 */
export function prepararAltaCerramiento(datos: DatosAltaCerramiento): ResultadoAltaCerramiento {
  const validacion = validarConfiguracionCerramiento(datos.configuracionSerializada)
  if (!validacion.ok) {
    return { ok: false, errores: { configuracionCerramiento: [validacion.mensaje] } }
  }
  const { configuracion } = validacion
  const medidas = medidasCerramiento(configuracion)
  return {
    ok: true,
    alta: {
      configuracion,
      descripcion: descripcionCerramiento(configuracion),
      anchoMm: medidas.anchoMm,
      altoMm: medidas.altoMm,
      precioUnitario: null,
      aviso: AVISO_VALORACION_PENDIENTE,
      datos,
    },
  }
}

/**
 * Guarda el snapshot editable de una línea CERRAMIENTO recién insertada.
 *
 * Contrato: `cliente` debe ser la MISMA transacción que insertó la línea. Una
 * línea `GRUPO` sin su configuración no es un documento incompleto, es un
 * documento corrupto: no se puede volver a dibujar, ni describir, ni valorar.
 * Por eso ambas escrituras confirman juntas o no confirma ninguna.
 */
export async function guardarAltaCerramiento(
  cliente: ClienteEscritura,
  lineaId: string,
  alta: AltaCerramiento,
) {
  await persistirCerramiento(cliente, {
    lineaId,
    configuracion: alta.configuracion,
    serieCodigo: alta.datos.serieCodigo,
    vidrioCodigo: alta.datos.vidrioCodigo,
    acabadoCodigo: alta.datos.acabadoCodigo,
    varianteAcristalamiento: alta.datos.varianteAcristalamiento,
    ajusteFabricacion: alta.datos.ajusteFabricacion,
    ajusteColocacion: alta.datos.ajusteColocacion,
  })
}
