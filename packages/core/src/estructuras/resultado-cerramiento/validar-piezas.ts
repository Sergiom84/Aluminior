import { compararDecimal, multiplicarDecimal } from '../../precios/decimal.ts'
import { decimal, decimalNullable, entero, objeto, positivo, tarifa, texto,
  textoNullable, variante } from './campos.ts'
import type { HerrajeSnapshotCerramiento, PartidaValoracionCerramiento,
  PiezaSnapshotCerramiento, RanuraSnapshotCerramiento } from './tipos.ts'

export function esPieza(v: unknown): v is PiezaSnapshotCerramiento {
  return objeto(v) && entero(v.ordinal) && v.ordinal <= 2147483647 && texto(v.articuloCodigo) &&
    textoNullable(v.acabadoCodigo) && textoNullable(v.unidad) &&
    positivo(v.cantidad, 10, 3) &&
    [v.largoCorteMm, v.anchoCorteMm].every(x => x === null || positivo(x, 10, 2)) &&
    [v.anguloIzquierdo, v.anguloDerecho].every(x => decimalNullable(x, 6, 2)) &&
    textoNullable(v.funcion) && textoNullable(v.posicionTrabajo) &&
    decimalNullable(v.costeUnitario) && decimalNullable(v.costeTotal)
}
export function esRanura(v: unknown): v is RanuraSnapshotCerramiento {
  return objeto(v) && entero(v.slot) && v.slot >= 1 && v.slot <= 5 &&
    textoNullable(v.vidrioHojas) && textoNullable(v.vidrioFijos) && variante(v.variante)
}
export function esHerraje(v: unknown): v is HerrajeSnapshotCerramiento {
  return objeto(v) && texto(v.categoria) && texto(v.opcionCodigo) &&
    (v.descripcion === null || typeof v.descripcion === 'string')
}
export function esPartida(v: unknown): v is PartidaValoracionCerramiento {
  if (!objeto(v) || !entero(v.ordinal) || !texto(v.articuloCodigo) ||
    (v.grupoValoracion !== 'MATERIALES' && v.grupoValoracion !== 'VIDRIO' && v.grupoValoracion !== 'ACRISTALAMIENTO') ||
    !textoNullable(v.unidad) || !decimalNullable(v.cantidadFacturable, 14, 6) ||
    !decimalNullable(v.precioUnitario) || !decimalNullable(v.importeExacto, 26, 10) ||
    !textoNullable(v.incidencia) || !tarifa(v.tarifa) || !textoNullable(v.acabadoCodigo) ||
    (v.criterioPrecio !== 'EXACTO' && v.criterioPrecio !== 'GENERICO' &&
      v.criterioPrecio !== 'SIN_PRECIO' && v.criterioPrecio !== 'AMBIGUO')) return false
  if ((v.criterioPrecio === 'SIN_PRECIO' || v.criterioPrecio === 'AMBIGUO') &&
    (v.precioUnitario !== null || v.importeExacto !== null || v.incidencia === null)) return false
  if (v.criterioPrecio === 'GENERICO' && v.acabadoCodigo !== 'UNI') return false
  if (v.criterioPrecio === 'EXACTO' && !texto(v.acabadoCodigo)) return false
  if (v.incidencia !== null) return v.importeExacto === null
  return texto(v.unidad) && decimal(v.cantidadFacturable, 14, 6) &&
    decimal(v.precioUnitario) && decimal(v.importeExacto, 26, 10) &&
    compararDecimal(multiplicarDecimal(v.cantidadFacturable, v.precioUnitario, 10), v.importeExacto) === 0
}
