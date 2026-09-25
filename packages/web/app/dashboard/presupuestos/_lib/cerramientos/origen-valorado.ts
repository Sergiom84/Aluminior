import { sumarDecimal } from '@aluminior/core/precios'
import type { ResultadoOrigenCerramiento } from '@aluminior/core/estructuras'
import type { PiezaDespiece } from '../lineas/guardar-linea.ts'

/** Traduce cortes sin agregar ni perder la identidad local de una pieza. */
export function completarCostesOrigen(
  origen: ResultadoOrigenCerramiento, todas: readonly PiezaDespiece[],
): ResultadoOrigenCerramiento {
  // Una fórmula que resuelve cantidad 0 (p. ej. MO en GMU038) no produce pieza.
  const piezas = todas.filter(p => Number(p.cantidad) !== 0)
  const unidades = new Map<string, string | null>()
  for (const p of origen.partidasValoracion) {
    if (unidades.has(p.articuloCodigo) && unidades.get(p.articuloCodigo) !== p.unidad)
      throw new Error('Catálogo inconsistente: unidad distinta entre grupos del mismo origen')
    unidades.set(p.articuloCodigo, p.unidad)
  }
  const valido = (v: string | null | undefined) => v !== null && v !== undefined &&
    Number.isFinite(Number(v)) && Number(v) >= 0 ? v : null
  // Un corte de 0 mm es una medida que el catálogo no pudo calcular, no una pieza nula.
  const medida = (v: string | null | undefined) => v !== null && v !== undefined &&
    Number.isFinite(Number(v)) && Number(v) > 0 ? v : null
  const sinMedida = piezas.filter(p => [p.largoCorteMm, p.anchoCorteMm]
    .some(v => v !== null && v !== undefined && medida(v) === null))
  if (sinMedida.length) origen.diagnosticos = [...origen.diagnosticos, {
    codigo: 'COBERTURA_INCOMPLETA', ambito: 'FABRICACION', bloqueante: true,
    detalle: `Corte sin medida calculable: ${[...new Set(sinMedida.map(p => p.articuloCodigo))].join(', ')}`,
  }]
  origen.piezas = piezas.map((p, ordinal) => ({
    ordinal, articuloCodigo: p.articuloCodigo, acabadoCodigo: origen.acabadoCodigo,
    unidad: unidades.get(p.articuloCodigo) ?? null, cantidad: p.cantidad,
    largoCorteMm: medida(p.largoCorteMm), anchoCorteMm: medida(p.anchoCorteMm),
    anguloIzquierdo: p.anguloIzquierdo ?? null, anguloDerecho: p.anguloDerecho ?? null,
    funcion: p.funcion ?? null, posicionTrabajo: p.posicionTrabajo ?? null,
    costeUnitario: valido(p.costeUnitario), costeTotal: valido(p.costeTotal),
  }))
  const completo = piezas.length > 0 && origen.reglaMaterial !== null && sinMedida.length === 0 &&
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
