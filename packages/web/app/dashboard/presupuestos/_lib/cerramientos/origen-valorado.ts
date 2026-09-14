import { sumarDecimal } from '@aluminior/core/precios'
import type { ResultadoOrigenCerramiento } from '@aluminior/core/estructuras'
import type { PiezaDespiece } from '../lineas/guardar-linea.ts'

/** Traduce cortes sin agregar ni perder la identidad local de una pieza. */
export function completarCostesOrigen(
  origen: ResultadoOrigenCerramiento, piezas: readonly PiezaDespiece[],
): ResultadoOrigenCerramiento {
  const unidades = new Map<string, string | null>()
  for (const p of origen.partidasValoracion) {
    if (unidades.has(p.articuloCodigo) && unidades.get(p.articuloCodigo) !== p.unidad)
      throw new Error('Catálogo inconsistente: unidad distinta entre grupos del mismo origen')
    unidades.set(p.articuloCodigo, p.unidad)
  }
  const valido = (v: string | null | undefined) => v !== null && v !== undefined &&
    Number.isFinite(Number(v)) && Number(v) >= 0 ? v : null
  origen.piezas = piezas.map((p, ordinal) => ({
    ordinal, articuloCodigo: p.articuloCodigo, acabadoCodigo: origen.acabadoCodigo,
    unidad: unidades.get(p.articuloCodigo) ?? null, cantidad: p.cantidad,
    largoCorteMm: p.largoCorteMm ?? null, anchoCorteMm: p.anchoCorteMm ?? null,
    anguloIzquierdo: p.anguloIzquierdo ?? null, anguloDerecho: p.anguloDerecho ?? null,
    funcion: p.funcion ?? null, posicionTrabajo: p.posicionTrabajo ?? null,
    costeUnitario: valido(p.costeUnitario), costeTotal: valido(p.costeTotal),
  }))
  const completo = piezas.length > 0 && origen.reglaMaterial !== null &&
    origen.venta.completo && origen.piezas.every(p => p.costeTotal !== null)
  // Una ausencia material bloquea la cobertura del coste; un precio ausente no.
  const costeConocido = piezas.length > 0 && origen.reglaMaterial !== null &&
    origen.piezas.every(p => p.costeTotal !== null) &&
    !origen.diagnosticos.some(d => d.ambito === 'FABRICACION' && d.bloqueante)
  origen.coste = { completo: completo || costeConocido, importe: costeConocido
    ? origen.piezas.reduce((s, p) => sumarDecimal(s, p.costeTotal!, 4), '0.0000') : null }
  if (!origen.coste.completo) origen.diagnosticos = [...origen.diagnosticos, {
    codigo: 'COSTE_INCOMPLETO', ambito: 'COSTE', bloqueante: true,
    detalle: 'Faltan costes o materiales necesarios para este origen',
  }]
  return origen
}
