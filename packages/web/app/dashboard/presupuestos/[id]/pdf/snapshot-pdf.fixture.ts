import type { ResultadoCerramientoV1, ResultadoOrigenCerramiento } from '@aluminior/core/estructuras'

/** Sólo contrato sintético de persistencia, no demuestra valoración de catálogo. */
export function snapshotSintetico(): ResultadoCerramientoV1 {
  const origen = (id: string, tipo: 'MODULO' | 'UNION', codigo: string): ResultadoOrigenCerramiento => ({
    origen: { id, tipo }, codigo, serieCodigo: 'QA-J03', acabadoCodigo: 'L', vidrioCodigo: 'QA-VIDRIO',
    varianteAcristalamiento: '2', reglaMaterial: 'QA-RECETA-EXPLICITA-v1',
    venta: { completo: true, importe: '20.00' }, coste: { completo: true, importe: '8.0000' },
    piezas: [{ ordinal: 0, articuloCodigo: 'QA-PERFIL', acabadoCodigo: 'L', unidad: 'ML',
      cantidad: '2', largoCorteMm: '1000', anchoCorteMm: null,
      anguloIzquierdo: '45', anguloDerecho: '45', funcion: 'MV', posicionTrabajo: null,
      costeUnitario: '4', costeTotal: '8' }],
    partidasValoracion: [{ ordinal: 0, grupoValoracion: 'MATERIALES', articuloCodigo: 'QA-PERFIL', unidad: 'ML',
      cantidadFacturable: '2', precioUnitario: '10', importeExacto: '20', incidencia: null,
      tarifa: 1, acabadoCodigo: 'L', criterioPrecio: 'EXACTO' }],
    acristalamiento: [{ slot: 1, vidrioHojas: null, vidrioFijos: 'QA-VIDRIO', variante: '2' }],
    opcionesHerraje: [{ categoria: 'QA-CATEGORIA', opcionCodigo: 'QA-OPCION', descripcion: null }],
    diagnosticos: [],
  })
  return {
    version: 1, redondeoVenta: 'ESTRUCTURA_NUMBER_V1', motor: { codigo: 'QA-J03', version: '1' }, tarifa: 1,
    unidadMateriales: 'COMPOSICION', ambitoManoObraManual: 'LINEA',
    configuracion: { version: 1, modulos: [
      { id: 'modulo-1', estructuraCodigo: '0', anchoMm: 1000, altoMm: 800 },
      { id: 'modulo-2', estructuraCodigo: '0', anchoMm: 700, altoMm: 800 },
    ], uniones: [{ id: 'union-1', codigo: 'GMU038', longitudMm: 800, grosorMm: 60 }] },
    origenes: [origen('modulo-1', 'MODULO', '0'), origen('modulo-2', 'MODULO', '0'),
      origen('union-1', 'UNION', 'GMU038')],
    ventaMateriales: { completo: true, importe: '60.00' },
    costeMateriales: { completo: true, importe: '24.0000' },
  }
}

