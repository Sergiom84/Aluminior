import captura from './fixture-j04.json'
import { esResultadoCerramiento } from '@aluminior/core/estructuras'
import type { DatosProduccion, FilaDespieceProduccion } from './tipos.ts'

/** Captura sintética ejecutada J04 (140,83/53,6720), nunca datos del negocio real. */
export function fixtureProduccion(): DatosProduccion {
  const r: unknown = structuredClone(captura)
  if (!esResultadoCerramiento(r)) throw new Error('Captura sintética J04 no válida')
  const lineaId = '00000000-0000-4000-8000-000000000002'
  const piezas: FilaDespieceProduccion[] = r.origenes.flatMap(o => o.piezas.map(p => ({
    id: `${o.origen.id}-${p.ordinal}`, lineaId, origenTipo: o.origen.tipo, origenId: o.origen.id,
    origenOrdinal: p.ordinal, articuloCodigo: p.articuloCodigo, acabadoCodigo: p.acabadoCodigo,
    cantidad: p.cantidad, largoCorteMm: p.largoCorteMm, anchoCorteMm: p.anchoCorteMm,
    anguloIzquierdo: p.anguloIzquierdo, anguloDerecho: p.anguloDerecho, funcion: p.funcion,
    posicionTrabajo: p.posicionTrabajo, costeUnitario: p.costeUnitario, costeTotal: p.costeTotal,
  })))
  return { id: '00000000-0000-4000-8000-000000000001', documento: { numero: '260005', revision: 1, obra: 'Ensayo sintético J08' },
    lineas: [{ id: lineaId, orden: 1, tipo: 'CERRAMIENTO', cantidad: '2', descripcion: 'Cerramiento sintético J04',
      referencia: 'QA-J08', anchoMm: 1960, altoMm: 800, configuracion: r.configuracion,
      versionConfiguracion: 1, resultado: r, versionResultado: 1, piezas }],
    articulos: ['P', 'J', 'U', 'V', 'T', 'E', 'I'].map(s => ({ codigo: `QA-J04-${s}`,
      descripcion: `Material sintético ${s}`, apareceEnHojaCorte: ['P', 'J', 'U'].includes(s), apareceEnHojaDespiece: true })) }
}
