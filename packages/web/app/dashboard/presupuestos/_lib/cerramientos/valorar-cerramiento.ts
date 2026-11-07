import { CATALOGO_SNAPSHOT, accesoriosEfectivosModulo, compactoEfectivoModulo, esModuloInvisible, origenInvisible, cotasEfectivasModulo, esConfiguracionCerramiento, esResultadoCerramiento, etapasVentaCerramiento,
  unionConfigurada, resolverOrigenSinUnion, medidasFabricacionCerramiento,
  type ConfiguracionCerramiento, type RedondeoVentaCerramiento, type ResultadoCerramientoV1,
  type ResultadoOrigenCerramiento } from '@aluminior/core/estructuras'
import { sumarDecimal } from '@aluminior/core/precios'
import type { ClienteEscritura } from '../cliente-db.ts'
import { valorarEstructura } from '../estructuras/valorar-estructura.ts'
import { resolverMaterialesEstructura } from '../estructuras/materiales-estructura.ts'
import { partidasValoracion } from '../estructuras/partidas-valoracion.ts'
import { completarCostesOrigen } from './origen-valorado.ts'
import { origenesGeometriaCerramiento } from './origenes-geometria.ts'
import { catalogoDespieceCargado } from '../estructuras/catalogo-despiece/cargado.ts'
import { valorarConCatalogo } from '../estructuras/catalogo-despiece/valorar-con-catalogo.ts'

export interface EntradaValoracionCerramiento {
  configuracion: ConfiguracionCerramiento
  serieCodigo: string | null
  acabadoCodigo: string | null
  /** Acabado de accesorios (Acabado2); omitido conserva UNI. */
  acabadoAccesoriosCodigo?: string | null
  vidrioCodigo: string | null
  varianteAcristalamiento: '1' | '2'
  opcionAcristalamiento?: number
  tarifa: number
  opcionesHerraje?: readonly string[]
  /** Sin selección guardada: opciones por defecto en cada módulo. */
  opcionesPorDefecto?: boolean
}

/** Resuelve por origen; nunca multiplica el despiece por la cantidad comercial. */
export async function valorarCerramiento(cliente: ClienteEscritura,
  entrada: EntradaValoracionCerramiento,
): Promise<ResultadoCerramientoV1> {
  if (!esConfiguracionCerramiento(entrada.configuracion, CATALOGO_SNAPSHOT) || !Number.isInteger(entrada.tarifa) ||
    entrada.tarifa < 1 || entrada.tarifa > 32767) throw new Error('Configuración de valoración no válida')
  const origenes: ResultadoOrigenCerramiento[] = []
  // Con el catálogo de despiece completo cargado, cada origen se valora por filas
  // como Productor (FILA_CENTIMOS); sin él, la vía anterior y su protocolo.
  const redondeo: RedondeoVentaCerramiento = await catalogoDespieceCargado(cliente) ? 'FILA_CENTIMOS' : 'ESTRUCTURA_NUMBER_V1'
  // Las uniones configuradas restan su grosor a las piezas contiguas y miden el lado común.
  // Sin serie propia la unión hereda la general; el vidrio de la unión no se hereda.
  const fabricacion = medidasFabricacionCerramiento(entrada.configuracion)
  const porModulo = new Map(entrada.configuracion.modulos.map(m => [m.id, m]))
  const geometria = origenesGeometriaCerramiento(entrada.configuracion, entrada).map(origen => {
    if (origen.tipo === 'MODULO') {
      const modulo = porModulo.get(origen.id)!
      const medidas = fabricacion.modulos.get(origen.id)!
      const compacto = compactoEfectivoModulo(modulo, entrada)
      const accesorios = accesoriosEfectivosModulo(modulo, entrada)
      const dtoCajon = modulo.compacto?.descontarHueco && compacto ? compacto.altoCajonMm : 0
      const dtoTapH = modulo.tapajuntas?.descontarHueco && modulo.tapajuntas ? 3 : 0
      const dtoTapV = modulo.tapajuntas?.descontarHueco && modulo.tapajuntas
        ? (modulo.tapajuntas.opciones?.includes('G2O1') ? 1.5 : 3) : 0
      return {
        ...origen,
        anchoMm: Math.max(1, medidas.anchoMm - dtoTapH),
        altoMm: Math.max(1, medidas.altoMm - dtoCajon - dtoTapV),
        cotas: cotasEfectivasModulo(modulo),
        compacto,
        accesorios,
      }
    }
    return { ...origen, altoMm: fabricacion.uniones.get(origen.id)!.longitudMm, cotas: null, compacto: null, accesorios: null }
  })
  for (const g of geometria) {
    const origen: ResultadoOrigenCerramiento = {
      origen: { tipo: g.tipo, id: g.id }, codigo: g.codigo,
      serieCodigo: g.materiales?.serieCodigo.valor ?? entrada.serieCodigo, acabadoCodigo: entrada.acabadoCodigo,
      vidrioCodigo: g.materiales?.vidrioCodigo.valor ?? null,
      varianteAcristalamiento: entrada.varianteAcristalamiento,
      reglaMaterial: null, venta: { completo: false, importe: null },
      coste: { completo: false, importe: null }, piezas: [], partidasValoracion: [],
      acristalamiento: [], opcionesHerraje: [], diagnosticos: [],
    }
    // Elemento invisible (DS3): precio 0 y sin despiece, como Productor; no consulta catálogo.
    if (g.tipo === 'MODULO' && esModuloInvisible(porModulo.get(g.id)!)) { origenes.push(origenInvisible(origen)); continue }
    const bloquear = (detalle: string, materialIncompleto = true) => {
      origen.diagnosticos = [...origen.diagnosticos,
        { codigo: 'MATERIAL_INCOMPLETO', ambito: 'VENTA', bloqueante: true, detalle },
        ...(materialIncompleto ? [{ codigo: 'COBERTURA_INCOMPLETA', ambito: 'FABRICACION' as const, bloqueante: true, detalle }] : [])]
    }
    // Horas y comisión del cerramiento se aplican a la línea (importesLineaCerramiento), nunca por módulo.
    const parametros = { ...entrada, horasFabricacion: null, horasColocacion: null, compacto: g.compacto, accesorios: g.accesorios,
      comisionPorc: null, cotas: g.cotas ?? undefined,
      trazabilidad: true, codigo: g.codigo, anchoMm: g.anchoMm, altoMm: g.altoMm,
      serieCodigo: origen.serieCodigo,
      vidrioCodigo: origen.vidrioCodigo, opcionesHerraje: entrada.opcionesHerraje }
    let ventaMotor: number | null = null
    let avisoMotor: string | null = null
    let piezas: Parameters<typeof completarCostesOrigen>[1] = []
    if (g.tipo === 'UNION' && !unionConfigurada(g)) {
      bloquear(`Unión ${g.id} sin configurar`)
    } else if (g.tipo === 'UNION' && redondeo === 'FILA_CENTIMOS') {
      const valor = await valorarConCatalogo(cliente, parametros)
      if (!valor || !valor.ok) bloquear(`Unión ${g.id} sin catálogo de despiece`)
      else {
        const sinUnion = resolverOrigenSinUnion(origen, { completo: valor.materialCompleto === true,
          precio: valor.precioUnitario, cantidades: valor.piezas.map(p => p.cantidad) })
        if (sinUnion) { origenes.push(sinUnion); continue }
        piezas = valor.piezas
        ventaMotor = valor.precioUnitario
        avisoMotor = valor.aviso
        origen.reglaMaterial = piezas.length ? `estructura:${g.codigo}` : null
        origen.partidasValoracion = valor.partidas ?? []
        if (valor.precioUnitario === null) bloquear(valor.aviso ?? `Unión ${g.id} incompleta`, valor.materialCompleto !== true)
      }
    } else if (g.tipo === 'UNION') {
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
          material.bloqueosPrecioTabla.size > 0 || material.despiece.piezas.some(p => !material.mapa.has(p.articuloCodigo)))
      }
    } else {
      const valor = await valorarEstructura(cliente, parametros)
      if (!valor.ok) {
        const detalle = Object.entries(valor.errores).flatMap(([campo, mensajes]) =>
          mensajes.map(mensaje => campo === 'vidrioCodigo'
            ? `Vidrio «${origen.vidrioCodigo ?? ''}»: ${mensaje}` : mensaje)).join('; ')
        bloquear(detalle)
        origen.diagnosticos = [...origen.diagnosticos, {
          codigo: 'COSTE_INCOMPLETO', ambito: 'COSTE', bloqueante: true, detalle }]
        // La validación impidió calcular: no hay evidencia de una receta vacía
        // ni de costes ausentes. Conservamos el bloqueo con su causa original.
        origenes.push(origen)
        continue
      }
      else {
        piezas = valor.piezas
        ventaMotor = valor.precioUnitario
        avisoMotor = valor.aviso
        origen.reglaMaterial = piezas.length ? `estructura:${g.codigo}` : null
        origen.partidasValoracion = valor.partidas ?? []
        origen.acristalamiento = valor.acristalamiento.map(r => ({ slot: r.slot,
          vidrioHojas: r.vidrioHojas ?? null, vidrioFijos: r.vidrioFijos ?? null, variante: r.variante === '2' ? '2' : '1' }))
        origen.opcionesHerraje = valor.opcionesHerraje.map(o => ({ categoria: o.categoria,
          opcionCodigo: o.opcionCodigo, descripcion: o.descripcion ?? null }))
        if (valor.precioUnitario === null) bloquear(valor.aviso ?? 'Estructura incompleta', valor.materialCompleto !== true)
        if (valor.motor !== 'catalogo' && (origen.opcionesHerraje.length || parametros.opcionesHerraje?.length)) {
          bloquear('Herrajes seleccionados sin resolución material demostrada')
        }
        if (redondeo === 'FILA_CENTIMOS' && valor.motor !== 'catalogo') bloquear(`Módulo ${g.codigo} sin catálogo de despiece completo`)
      }
    }
    if (ventaMotor !== null && avisoMotor) origen.diagnosticos = [...origen.diagnosticos, {
      codigo: 'AVISO_VALORACION', ambito: 'VENTA', bloqueante: false, detalle: avisoMotor,
    }]
    const etapas = etapasVentaCerramiento(origen.partidasValoracion, redondeo)
    if (etapas && ventaMotor !== null && Number(etapas.total) !== ventaMotor)
      bloquear('El metraje no se puede representar en el snapshot sin cambiar el importe del motor', false)
    if (!piezas.some(p => Number(p.cantidad) > 0) || !origen.partidasValoracion.length) bloquear('Receta material vacía')
    if (etapas && !origen.diagnosticos.some(d => d.ambito === 'VENTA' && d.bloqueante))
      origen.venta = { completo: true, importe: etapas.total }
    else if (!origen.diagnosticos.some(d => d.ambito === 'VENTA' && d.bloqueante)) bloquear('Partidas de venta incompletas')
    origenes.push(completarCostesOrigen(origen, piezas))
  }
  const total = (campo: 'venta' | 'coste', escala: number) => {
    const completo = origenes.every(o => o[campo].completo)
    return { completo, importe: completo
      ? origenes.reduce((s, o) => sumarDecimal(s, o[campo].importe!, escala), '0') : null }
  }
  const resultado: ResultadoCerramientoV1 = {
    version: 1, redondeoVenta: redondeo, configuracion: entrada.configuracion,
    motor: { codigo: 'CATALOGO_CERRAMIENTO', version: redondeo === 'FILA_CENTIMOS' ? '2' : '1' }, tarifa: entrada.tarifa,
    unidadMateriales: 'COMPOSICION', ambitoManoObraManual: 'LINEA', origenes,
    ventaMateriales: total('venta', 2), costeMateriales: total('coste', 4),
  }
  if (!esResultadoCerramiento(resultado)) throw new Error('El motor produjo un snapshot incompatible')
  return resultado
}
