import { compararDecimal, normalizarDecimal, sumarDecimal } from '../../precios/decimal.ts'
import { configuracionTieneFiExplicito, esConfiguracionCerramiento } from '../cerramiento.ts'
import { decimal, objeto, tarifa, texto, textoNullable, unicos, variante } from './campos.ts'
import { esHerraje, esPartida, esPieza, esRanura } from './validar-piezas.ts'
import { etapasVentaCerramiento } from './etapas-venta.ts'
import type { DiagnosticoCerramiento, ImporteSnapshot, ResultadoCerramientoV1,
  ResultadoOrigenCerramiento } from './tipos.ts'

function esImporte(v: unknown, escala = 4): v is ImporteSnapshot {
  return objeto(v) && typeof v.completo === 'boolean' &&
    (v.completo ? decimal(v.importe, 12, escala) : v.importe === null)
}
function esDiagnostico(v: unknown): v is DiagnosticoCerramiento {
  return objeto(v) && texto(v.codigo) && texto(v.detalle) && typeof v.bloqueante === 'boolean' &&
    (v.ambito === 'VENTA' || v.ambito === 'COSTE' || v.ambito === 'FABRICACION')
}
function igualSuma(importe: string | null, partes: readonly (string | null)[], escala = 4): boolean {
  return importe !== null && partes.every((p): p is string => p !== null) &&
    compararDecimal(importe, normalizarDecimal(
      partes.reduce((suma, parte) => sumarDecimal(suma, parte, 10), '0'), escala)) === 0
}
function esResultadoOrigen(v: unknown): v is ResultadoOrigenCerramiento {
  if (!objeto(v) || !objeto(v.origen) || (v.origen.tipo !== 'MODULO' && v.origen.tipo !== 'UNION') ||
    !texto(v.origen.id) || !texto(v.codigo) || !textoNullable(v.serieCodigo) ||
    !textoNullable(v.acabadoCodigo) || !textoNullable(v.vidrioCodigo) ||
    !variante(v.varianteAcristalamiento) || !textoNullable(v.reglaMaterial) ||
    !esImporte(v.venta, 2) || !esImporte(v.coste) ||
    !Array.isArray(v.piezas) || !v.piezas.every(esPieza) ||
    !Array.isArray(v.partidasValoracion) || !v.partidasValoracion.every(esPartida) ||
    !Array.isArray(v.acristalamiento) || !v.acristalamiento.every(esRanura) ||
    !Array.isArray(v.opcionesHerraje) || !v.opcionesHerraje.every(esHerraje) ||
    !Array.isArray(v.diagnosticos) || !v.diagnosticos.every(esDiagnostico)) return false
  if (!unicos(v.piezas, p => p.ordinal) || !unicos(v.partidasValoracion, p => p.ordinal) ||
    !unicos(v.acristalamiento, p => p.slot) ||
    !unicos(v.opcionesHerraje, p => [p.categoria, p.opcionCodigo])) return false
  const diagnosticos = v.diagnosticos
  const bloquea = (ambito: string) => diagnosticos.some(d => d.bloqueante && d.ambito === ambito)
  if (v.venta.completo) {
    if (!v.reglaMaterial || !v.piezas.length || !v.partidasValoracion.length || bloquea('VENTA') ||
      etapasVentaCerramiento(v.partidasValoracion)?.total !==
        normalizarDecimal(v.venta.importe!, 2)) return false
  } else if (!bloquea('VENTA')) return false
  if (v.coste.completo) {
    if (!v.reglaMaterial || !v.piezas.length || bloquea('COSTE') ||
      !igualSuma(v.coste.importe, v.piezas.map(p => p.costeTotal))) return false
  } else if (!bloquea('COSTE')) return false
  return true
}

/** Guarda de datos leídos: nunca consulta catálogo ni regenera resultados históricos. */
export function esResultadoCerramiento(v: unknown): v is ResultadoCerramientoV1 {
  if (!objeto(v) || !objeto(v.configuracion) ||
    !Array.isArray(v.configuracion.modulos) || !v.configuracion.modulos.every(objeto) ||
    !Array.isArray(v.configuracion.uniones) || !v.configuracion.uniones.every(objeto)) return false
  if (v.version !== 1 || v.redondeoVenta !== 'ESTRUCTURA_NUMBER_V1' || !esConfiguracionCerramiento(v.configuracion) ||
    configuracionTieneFiExplicito(v.configuracion) ||
    !objeto(v.motor) || !texto(v.motor.codigo) || !texto(v.motor.version) || !tarifa(v.tarifa) ||
    v.unidadMateriales !== 'COMPOSICION' || v.ambitoManoObraManual !== 'LINEA' ||
    !Array.isArray(v.origenes) || !v.origenes.every(esResultadoOrigen) ||
    !esImporte(v.ventaMateriales, 2) || !esImporte(v.costeMateriales)) return false
  const geometria = [
    ...v.configuracion.modulos.map(m => ({ tipo: 'MODULO', id: m.id, codigo: m.estructuraCodigo })),
    ...v.configuracion.uniones.map(u => ({ tipo: 'UNION', id: u.id, codigo: u.codigo })),
  ]
  if (geometria.some(g => !texto(g.id)) || v.origenes.length !== geometria.length ||
    !unicos(v.origenes, o => [o.origen.tipo, o.origen.id])) return false
  if (!v.origenes.every(o => geometria.some(g => g.tipo === o.origen.tipo &&
    g.id === o.origen.id && g.codigo === o.codigo))) return false
  if (v.origenes.some(o => o.partidasValoracion.some(p => p.tarifa !== v.tarifa))) return false
  for (const [total, campo] of [[v.ventaMateriales, 'venta'], [v.costeMateriales, 'coste']] as const) {
    const completos = v.origenes.every(o => o[campo].completo)
    if (total.completo !== completos ||
      (completos && !igualSuma(total.importe, v.origenes.map(o => o[campo].importe), campo === 'venta' ? 2 : 4))) return false
  }
  return true
}
