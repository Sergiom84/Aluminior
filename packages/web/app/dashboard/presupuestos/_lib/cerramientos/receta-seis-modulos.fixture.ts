import type { ConfiguracionCerramiento } from '@aluminior/core/estructuras'

/** Entradas de aceptación; catálogo J04 sintético, sin atribución industrial. */
export function recetaSeisModulos(): ConfiguracionCerramiento {
  return {
    version: 1,
    modulos: Array.from({ length: 6 }, (_, i) => ({
      id: `m${i + 1}`, estructuraCodigo: i === 3 ? '0' : '2O',
      anchoMm: i === 3 ? 300 : 1200, altoMm: 1020,
    })),
    uniones: Array.from({ length: 5 }, (_, i) => ({
      id: `u${i + 1}`, codigo: i === 0 ? 'PSU001' : 'GMU038',
      grosorMm: i === 0 ? 100 : 60, longitudMm: 1020,
    })),
  }
}
