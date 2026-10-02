/** Análisis de relaciones, sin asumir que la factura conserva el diseño completo. */
const clave = (...partes) => JSON.stringify(partes.map(p => String(p ?? '').trim()))
const texto = valor => String(valor ?? '').trim()
const si = valor => ['true', '1', '-1'].includes(texto(valor).toLowerCase())
const agrupar = (filas, obtenerClave) => {
  const resultado = new Map()
  for (const fila of filas) {
    const k = obtenerClave(fila)
    if (!resultado.has(k)) resultado.set(k, [])
    resultado.get(k).push(fila)
  }
  return resultado
}
const sumar = (mapa, claveValor) => mapa.set(claveValor, (mapa.get(claveValor) ?? 0) + 1)
const ordenar = mapa => [...mapa].map(([codigo, casos]) => ({ codigo, casos }))
  .sort((a, b) => b.casos - a.casos || a.codigo.localeCompare(b.codigo))

export function analizarCoberturaFacturas(fuentes) {
  const { facturas, lineas, configuraciones, detalle_diseno: detalle,
    diseno, cerramientos, uniones, opciones_herraje: opciones = [],
    catalogo_estructuras: catalogoEstructuras = [], catalogo_series: catalogoSeries = [],
    asociaciones_estructura_serie: asociaciones = [],
    catalogo_acabados: catalogoAcabados = [],
    catalogo_acristalamiento: catalogoAcristalamiento = [],
    catalogo_tipos_hoja: catalogoTiposHoja = [],
    albaranes = [], lineas_albaran: lineasAlbaran = [],
    presupuestos = [], lineas_presupuesto: lineasPresupuesto = [] } = fuentes
  const ids = new Set(facturas.map(f => texto(f.Id)))
  if (ids.size !== facturas.length || ids.has('')) throw new Error('Facturas duplicadas o sin Id')
  if (lineas.some(l => !ids.has(texto(l.nDoc)))) throw new Error('Línea ajena a las facturas exportadas')
  const lineasPorDocumento = agrupar(lineas, l => texto(l.nDoc))
  const lineasPorClave = agrupar(lineas, l => clave(l.nDoc, l.nLinea))
  const configuracionesPorClave = agrupar(configuraciones, c => clave(c.nVDoc, c.nVLinea))
  const detallePorEstructura = agrupar(detalle, d => clave(d.nVDoc, d.nVLinEstr))
  const disenoPorClave = agrupar(diseno, d => clave(d.nDoc, d.nLinEstr))
  const opcionesPorClave = agrupar(opciones, o => clave(o.nDoc, o.nLinEstr))
  const cerramientosPorDocumento = agrupar(cerramientos, c => texto(c.nDoc))
  const unionesPorCerramiento = agrupar(uniones, u => texto(u.nCerr))
  const estructurasCatalogadas = new Set(catalogoEstructuras.map(e => texto(e.Codigo)))
  const seriesCatalogadas = new Set(catalogoSeries.map(s => texto(s.Serie)))
  const albaranesPorNumero = agrupar(albaranes, a => texto(a.Numero))
  const lineasAlbaranPorClave = agrupar(lineasAlbaran, a => clave(a.nDoc, a.nLinea))
  const presupuestosPorNumero = agrupar(presupuestos, p => texto(p.Numero))
  const lineasPresupuestoPorClave = agrupar(lineasPresupuesto, p => clave(p.nDoc, p.nLinea))
  const series = new Map(), estructuras = new Map(), tiposHoja = new Map()
  const tiposUnion = new Map(), acabados = new Map(), opcionesHerraje = new Map(), matriz = new Map()
  const motivos = new Map(), estados = new Map()
  const casos = []
  let facturasConEstructura = 0
  let facturasSinLineas = 0
  let facturasConUnion = 0
  let lineasOrigenAlbaran = 0
  let lineasConAmbosEnlacesAlbaran = 0
  let enlacesAlbaranExactos = 0
  let enlacesAlbaranArticuloDistinto = 0
  let enlacesAlbaranAmbiguos = 0
  let albaranesConPresupuestoOrigen = 0
  let albaranesConPresupuestoVerificado = 0
  let enlacesPresupuestoExactos = 0
  let enlacesPresupuestoArticuloDistinto = 0
  let enlacesPresupuestoSinLinea = 0
  let lineasConPrecioODescuentoManual = 0
  let facturasConDescuento = 0
  const tarifasFactura = new Map(), tiposIvaFactura = new Map()

  for (const albaran of albaranes) {
    if (texto(albaran.nDocOrigen)) albaranesConPresupuestoOrigen++
    if ((presupuestosPorNumero.get(texto(albaran.nDocOrigen)) ?? []).length === 1) {
      albaranesConPresupuestoVerificado++
    }
  }

  for (const factura of facturas) {
    const doc = texto(factura.Id)
    sumar(tarifasFactura, texto(factura.Tarifa) || '(sin tarifa)')
    sumar(tiposIvaFactura, texto(factura.IVAPorc) || '(sin IVA de cabecera)')
    if ([factura.DescuentoPorc, factura.Descuento, factura.DescuentoPPporc,
      factura.DescuentoPP].some(v => Number(texto(v).replace(',', '.')) > 0)) {
      facturasConDescuento++
    }
    const filas = lineasPorDocumento.get(doc) ?? []
    const padres = filas.filter(l => si(l.EstructuraSN))
    if (!filas.length) facturasSinLineas++
    if (padres.length) facturasConEstructura++
    for (const linea of filas) {
      if (si(linea.PVPManualSN) || si(linea.RespetarPrecioSN)
        || si(linea.TarifaManualSN) || si(linea.DescuentoManualSN)) {
        lineasConPrecioODescuentoManual++
      }
      if (texto(linea.nAlbaran)) lineasOrigenAlbaran++
      if (texto(linea.nAlbaran) && texto(linea.nLinAlb)) {
        lineasConAmbosEnlacesAlbaran++
        const cabecera = albaranesPorNumero.get(texto(linea.nAlbaran)) ?? []
        const origen = cabecera.length === 1
          ? lineasAlbaranPorClave.get(clave(cabecera[0].Id, linea.nLinAlb)) ?? [] : []
        if (cabecera.length === 1 && origen.length === 1) {
          enlacesAlbaranExactos++
          if (texto(origen[0].Articulo) !== texto(linea.Articulo)) enlacesAlbaranArticuloDistinto++
          const presupuesto = presupuestosPorNumero.get(texto(cabecera[0].nDocOrigen)) ?? []
          const lineaPresupuesto = presupuesto.length === 1
            ? lineasPresupuestoPorClave.get(clave(presupuesto[0].Id, origen[0].nLinOrig)) ?? [] : []
          if (lineaPresupuesto.length === 1) {
            enlacesPresupuestoExactos++
            if (texto(lineaPresupuesto[0].Articulo) !== texto(origen[0].Articulo)) {
              enlacesPresupuestoArticuloDistinto++
            }
          } else enlacesPresupuestoSinLinea++
        } else if (cabecera.length > 1 || origen.length > 1) enlacesAlbaranAmbiguos++
      }
    }
    const cerramientosDoc = cerramientosPorDocumento.get(doc) ?? []
    const unionesDoc = cerramientosDoc.flatMap(c => unionesPorCerramiento.get(texto(c.id)) ?? [])
      .filter(u => si(u.EsUnionSN))
    if (unionesDoc.length) facturasConUnion++
    for (const u of unionesDoc) sumar(tiposUnion, clave(u.CodEstr, u.UnionVH))

    for (const padre of padres) {
      const k = clave(doc, padre.nLinea)
      const cfg = configuracionesPorClave.get(k) ?? []
      const hijas = filas.filter(l => texto(l.nEstr) === texto(padre.nLinea)
        && texto(l.nLinea) !== texto(padre.nLinea))
      const detalleCaso = detallePorEstructura.get(k) ?? []
      const disenoCaso = disenoPorClave.get(k) ?? []
      const opcionesCaso = opcionesPorClave.get(k) ?? []
      const problemas = []
      if ((lineasPorClave.get(k) ?? []).length !== 1) problemas.push('linea-padre-ambigua')
      if (cfg.length !== 1) problemas.push(cfg.length ? 'configuracion-ambigua' : 'sin-configuracion-factura')
      if (!hijas.length) problemas.push('sin-despiece-factura')
      if (!disenoCaso.length) problemas.push('sin-diseno-en-factura')
      if (!detalleCaso.length) problemas.push('sin-detalle-diseno-en-factura')
      if (si(padre.PVPManualSN) || si(padre.RespetarPrecioSN)
        || si(padre.TarifaManualSN) || si(padre.DescuentoManualSN)) problemas.push('precio-o-descuento-manual')
      if (si(cfg[0]?.DisEspecificoSN)) problemas.push('diseno-especifico')
      const serie = texto(cfg[0]?.Conjunto1)
      const estructura = texto(padre.Articulo)
      if (!estructurasCatalogadas.has(estructura)) problemas.push('estructura-fuera-de-catalogo')
      if (serie && !seriesCatalogadas.has(serie)) problemas.push('serie-fuera-de-catalogo')
      if (!serie) problemas.push('serie-no-resuelta')
      for (const problema of problemas) sumar(motivos, problema)
      sumar(estructuras, estructura || '(sin código)')
      sumar(series, serie || '(sin serie resuelta)')
      sumar(matriz, clave(estructura || '(sin código)', serie || '(sin serie resuelta)'))
      sumar(acabados, texto(padre.Acabado) || '(sin acabado)')
      for (const d of disenoCaso) if (texto(d.TipoHoja)) sumar(tiposHoja, texto(d.TipoHoja))
      for (const o of opcionesCaso) if (si(o.SelecSN)) sumar(opcionesHerraje, clave(o.Conjunto, o.nOpcion))
      // Estos estados son independientes: la existencia del histórico no prueba
      // capacidad de cálculo ni coincidencia con el motor actual.
      const catalogado = estructurasCatalogadas.has(estructura)
        && (!serie || seriesCatalogadas.has(serie))
      sumar(estados, catalogado ? 'catalogado' : 'pendiente')
      casos.push({ facturaId: doc, lineaId: texto(padre.nLinea), estructura, serie,
        acabado: texto(padre.Acabado), catalogado, calculable: false, contrastado: false,
        motivos: problemas,
        lineasDespiece: hijas.length, filasDiseno: disenoCaso.length,
        filasDetalleDiseno: detalleCaso.length, opcionesHerraje: opcionesCaso.length,
        albaranId: texto(padre.nAlbaran) || null,
        albaranLineaId: texto(padre.nLinAlb) || null })
    }
  }
  return {
    resumen: {
      facturas: facturas.length, lineas: lineas.length, facturasSinLineas,
      facturasConEstructura, estructurasFacturadas: casos.length,
      facturasConDescuento, lineasConPrecioODescuentoManual,
      tarifasFactura: ordenar(tarifasFactura), tiposIvaFactura: ordenar(tiposIvaFactura),
      facturasConUnion, lineasOrigenAlbaran, lineasConAmbosEnlacesAlbaran,
      enlacesAlbaranExactos, enlacesAlbaranArticuloDistinto, enlacesAlbaranAmbiguos,
      albaranesConPresupuestoOrigen, albaranesConPresupuestoVerificado,
      enlacesPresupuestoExactos, enlacesPresupuestoArticuloDistinto,
      enlacesPresupuestoSinLinea,
      configuraciones: configuraciones.length, detalleDiseno: detalle.length,
      diseno: diseno.length, cerramientos: cerramientos.length, uniones: uniones.length,
      opcionesHerraje: opciones.length, estructurasCatalogo: catalogoEstructuras.length,
      seriesCatalogo: catalogoSeries.length, asociacionesCatalogo: asociaciones.length,
      acabadosCatalogo: catalogoAcabados.length,
      acristalamientosCatalogo: catalogoAcristalamiento.length,
      tiposHojaCatalogo: catalogoTiposHoja.length,
      estructurasSinFactura: catalogoEstructuras.filter(e => !estructuras.has(texto(e.Codigo))).length,
      asociacionesConCasoDirecto: asociaciones.filter(a => matriz.has(clave(a.Estructura, a.Serie))).length,
      estados: Object.fromEntries(estados),
      motivos: Object.fromEntries(motivos), estructuras: ordenar(estructuras),
      series: ordenar(series), tiposHoja: ordenar(tiposHoja),
      tiposUnion: ordenar(tiposUnion), acabados: ordenar(acabados),
      matrizEstructuraSerie: ordenar(matriz),
      inventarioEstructuras: catalogoEstructuras.map(e => ({ codigo: texto(e.Codigo),
        familia: texto(e.Familia), casos: estructuras.get(texto(e.Codigo)) ?? 0,
        estado: estructuras.has(texto(e.Codigo)) ? 'facturado' : 'pendiente-de-caso' })),
      inventarioSeries: catalogoSeries.map(s => ({ codigo: texto(s.Serie),
        casos: series.get(texto(s.Serie)) ?? 0,
        estado: series.has(texto(s.Serie)) ? 'facturado' : 'pendiente-de-caso' })),
      inventarioAsociaciones: asociaciones.map(a => ({ estructura: texto(a.Estructura),
        serie: texto(a.Serie), casos: matriz.get(clave(a.Estructura, a.Serie)) ?? 0,
        estado: matriz.has(clave(a.Estructura, a.Serie)) ? 'facturado' : 'pendiente-de-verificacion' })),
      opcionesSeleccionadas: ordenar(opcionesHerraje),
      calculables: 0, contrastados: 0,
    },
    casos,
  }
}
