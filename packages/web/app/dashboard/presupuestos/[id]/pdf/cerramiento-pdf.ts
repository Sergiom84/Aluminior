import {
  esConfiguracionCerramiento, esResultadoCerramiento, medidasCerramiento,
  type ConfiguracionCerramiento,
} from '@aluminior/core/estructuras'
import type { CerramientoPdf } from './tipos'

export class DatosPdfIncoherentes extends Error {}

export interface EntradaCerramientoPdf {
  configuracion: unknown
  version: number
  resultado: { version: number; resultado: unknown } | null
  anchoMm: number | null
  altoMm: number | null
  manoObra: CerramientoPdf['manoObra']
}

function identidad(configuracion: ConfiguracionCerramiento) {
  return JSON.stringify([configuracion.version,
    configuracion.modulos.map(m => [m.id, m.estructuraCodigo, m.anchoMm, m.altoMm,
      Object.hasOwn(m, 'fiMm') ? m.fiMm : 'FI_AUSENTE']),
    configuracion.uniones.map(u => [u.id, u.codigo, u.grosorMm, u.longitudMm])])
}

/** Sólo proyecta datos persistidos; nunca consulta catálogo ni reconstruye importes. */
export function adaptarCerramientoPdf(entrada: EntradaCerramientoPdf): CerramientoPdf {
  const { configuracion, resultado } = entrada
  if (!esConfiguracionCerramiento(configuracion) || entrada.version !== configuracion.version) {
    throw new DatosPdfIncoherentes('Configuración de cerramiento no válida')
  }
  if (resultado && (!esResultadoCerramiento(resultado.resultado) ||
    resultado.version !== resultado.resultado.version ||
    identidad(configuracion) !== identidad(resultado.resultado.configuracion))) {
    throw new DatosPdfIncoherentes('Snapshot de cerramiento no válido o distinto de su configuración')
  }
  const medidas = medidasCerramiento(configuracion)
  if ((entrada.anchoMm !== null && entrada.anchoMm !== medidas.anchoMm) ||
      (entrada.altoMm !== null && entrada.altoMm !== medidas.altoMm)) {
    throw new DatosPdfIncoherentes('Medidas de línea distintas de su configuración')
  }
  return { configuracion, estadoSnapshot: resultado ? 'con-snapshot' : 'anterior-sin-snapshot',
    manoObra: entrada.manoObra.map(({ concepto, horas, importe, valoracionCompleta }) =>
      ({ concepto, horas, importe, valoracionCompleta })) }
}
