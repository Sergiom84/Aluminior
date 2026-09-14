import { esConfiguracionCerramiento, esResultadoCerramiento, etapasVentaCerramiento,
  type ConfiguracionCerramiento, type ResultadoCerramientoV1,
  type ResultadoOrigenCerramiento } from '@aluminior/core/estructuras'
import { sumarDecimal } from '@aluminior/core/precios'
import type { ClienteEscritura } from '../cliente-db.ts'
import { valorarEstructura } from '../estructuras/valorar-estructura.ts'
import { resolverMaterialesEstructura } from '../estructuras/materiales-estructura.ts'
import { partidasValoracion } from '../estructuras/partidas-valoracion.ts'
import { completarCostesOrigen } from './origen-valorado.ts'

export interface EntradaValoracionCerramiento {
  configuracion: ConfiguracionCerramiento
  serieCodigo: string | null
  acabadoCodigo: string | null
  vidrioCodigo: string | null
  varianteAcristalamiento: '1' | '2'
  tarifa: number
  opcionesHerraje?: readonly string[]
}

/** Resuelve por origen; nunca multiplica el despiece por la cantidad comercial. */
export async function valorarCerramiento(cliente: ClienteEscritura,
  entrada: EntradaValoracionCerramiento,
): Promise<ResultadoCerramientoV1> {
  if (!esConfiguracionCerramiento(entrada.configuracion) || !Number.isInteger(entrada.tarifa) ||
    entrada.tarifa < 1 || entrada.tarifa > 32767) throw new Error('Configuración de valoración no válida')
  const origenes: ResultadoOrigenCerramiento[] = []
  const geometria = [
    ...entrada.configuracion.modulos.map(m => ({ tipo: 'MODULO' as const, id: m.id,
      codigo: m.estructuraCodigo, anchoMm: m.anchoMm, altoMm: m.altoMm })),
    ...entrada.configuracion.uniones.map(u => ({ tipo: 'UNION' as const, id: u.id,
      codigo: u.codigo, anchoMm: u.grosorMm, altoMm: u.longitudMm })),
  ]
  for (const g of geometria) {
    const origen: ResultadoOrigenCerramiento = {
      origen: { tipo: g.tipo, id: g.id }, codigo: g.codigo,
      serieCodigo: entrada.serieCodigo, acabadoCodigo: entrada.acabadoCodigo,
      vidrioCodigo: g.tipo === 'MODULO' ? entrada.vidrioCodigo || null : null,
      varianteAcristalamiento: entrada.varianteAcristalamiento,
      reglaMaterial: null, venta: { completo: false, importe: null },
      coste: { completo: false, importe: null }, piezas: [], partidasValoracion: [],
      acristalamiento: [], opcionesHerraje: [], diagnosticos: [],
    }
    const bloquear = (detalle: string, materialIncompleto = true) => {
      origen.diagnosticos = [...origen.diagnosticos,
        { codigo: 'MATERIAL_INCOMPLETO', ambito: 'VENTA', bloqueante: true, detalle },
        ...(materialIncompleto ? [{ codigo: 'COBERTURA_INCOMPLETA', ambito: 'FABRICACION' as const, bloqueante: true, detalle }] : [])]
    }
    const parametros = { ...entrada, trazabilidad: true, codigo: g.codigo, anchoMm: g.anchoMm, altoMm: g.altoMm,
      vidrioCodigo: origen.vidrioCodigo, opcionesHerraje: entrada.opcionesHerraje ?? [] }
    let ventaMotor: number | null = null
    let piezas: Parameters<typeof completarCostesOrigen>[1] = []
    if (g.tipo === 'UNION') {
      const material = await resolverMaterialesEstructura(cliente, parametros)
      if (!material.ok) bloquear(JSON.stringify(material.errores))
      else if (!material.estructura.esAccesorio || !material.plantillaResuelta.length ||
        material.plantillaResuelta.some(p => p.componenteDisenyo === '1')) {
        bloquear('Unión sin receta material de accesorio aplicable')
      } else {
        origen.reglaMaterial = `estructura:${g.codigo}`
        piezas = material.piezas
        ventaMotor = material.valoracion.completa ? material.valoracion.importe : null
        origen.partidasValoracion = partidasValoracion(material.valoracion.lineas,
          entrada, 'MATERIALES', material.filasPvp)
        if (!material.valoracion.completa || material.despiece.incalculables ||
          material.sinResolver.size || material.sinResolverAsoc.size) bloquear(
          `Unión ${g.id}: ${material.valoracion.lineas.filter(p => p.incidencia).map(p => `${p.articuloCodigo}: ${p.incidencia}`).join('; ') || 'Componentes sin resolver'}`,
          material.despiece.incalculables > 0 || material.valoracion.sinMedida.length > 0 ||
          material.sinResolver.size > 0 || material.sinResolverAsoc.size > 0 ||
          material.despiece.piezas.some(p => !material.mapa.has(p.articuloCodigo)))
      }
    } else {
      const valor = await valorarEstructura(cliente, parametros)
      if (!valor.ok) bloquear(JSON.stringify(valor.errores))
      else {
        piezas = valor.piezas
        ventaMotor = valor.precioUnitario
        origen.reglaMaterial = piezas.length ? `estructura:${g.codigo}` : null
        origen.partidasValoracion = valor.partidas ?? []
        origen.acristalamiento = valor.acristalamiento.map(r => ({ slot: r.slot,
          vidrioHojas: r.vidrioHojas ?? null, vidrioFijos: r.vidrioFijos ?? null, variante: r.variante === '2' ? '2' : '1' }))
        origen.opcionesHerraje = valor.opcionesHerraje.map(o => ({ categoria: o.categoria,
          opcionCodigo: o.opcionCodigo, descripcion: o.descripcion ?? null }))
        if (valor.precioUnitario === null) bloquear(valor.aviso ?? 'Estructura incompleta', valor.materialCompleto !== true)
        if (origen.opcionesHerraje.length || parametros.opcionesHerraje.length) bloquear('Herrajes seleccionados sin resolución material demostrada')
      }
    }
    const etapas = etapasVentaCerramiento(origen.partidasValoracion)
    if (etapas && ventaMotor !== null && Number(etapas.total) !== ventaMotor)
      bloquear('El metraje no se puede representar en snapshot v1 sin cambiar el importe del motor', false)
    if (!piezas.length || !origen.partidasValoracion.length) bloquear('Receta material vacía')
    if (etapas && !origen.diagnosticos.some(d => d.ambito === 'VENTA' && d.bloqueante))
      origen.venta = { completo: true, importe: etapas.total }
    else if (!origen.diagnosticos.length) bloquear('Partidas de venta incompletas')
    origenes.push(completarCostesOrigen(origen, piezas))
  }
  const total = (campo: 'venta' | 'coste', escala: number) => {
    const completo = origenes.every(o => o[campo].completo)
    return { completo, importe: completo
      ? origenes.reduce((s, o) => sumarDecimal(s, o[campo].importe!, escala), '0') : null }
  }
  const resultado: ResultadoCerramientoV1 = {
    version: 1, redondeoVenta: 'ESTRUCTURA_NUMBER_V1', configuracion: entrada.configuracion,
    motor: { codigo: 'CATALOGO_CERRAMIENTO', version: '1' }, tarifa: entrada.tarifa,
    unidadMateriales: 'COMPOSICION', ambitoManoObraManual: 'LINEA', origenes,
    ventaMateriales: total('venta', 2), costeMateriales: total('coste', 4),
  }
  if (!esResultadoCerramiento(resultado)) throw new Error('El motor produjo un snapshot incompatible')
  return resultado
}
