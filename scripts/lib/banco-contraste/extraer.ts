import { agrupar, clave, numero, pieza, si, texto, tiene, type Caso, type Fila, type Tablas } from './datos.ts'
/** Las claves se demuestran por integridad y reconciliación; jamás por orden de filas. */
export function construirContraste(t: Tablas) {
  const ls = t.VPresupuestosLin!, docs = agrupar(t.VPresupuestos!, f => texto(f.Id))
  const indice = agrupar(ls, f => clave(f.nDoc, f.nLinea))
  if ([...indice.values()].some(a => a.length !== 1)) throw new Error('Clave nDoc+nLinea duplicada')
  if ([...docs.values()].some(a => a.length !== 1)) throw new Error('Cabecera Id duplicada')
  const cfg = agrupar(t.VDatosLinEstr!.filter(f => texto(f.TipoDoc) === 'VPRES'), f => clave(f.nVDoc, f.nVLinea))
  const opt = agrupar(t.VOpcionesHerraje!.filter(f => texto(f.TipoDoc) === 'VPRES'), f => clave(f.nDoc, f.nLinEstr))
  const hijas = agrupar(ls.filter(f => tiene(f.nEstr)), f => clave(f.nDoc, f.nEstr))
  const instancias = agrupar(t.VDatosLinDetDis!.filter(f => texto(f.TipoDoc) === 'VPRES'), f => clave(f.nVDoc, f.nVLinEstr))
  const estructuras = ls.filter(f => si(f.EstructuraSN))
  let ordinal = 0
  function crear(p: Fila, tipo: Caso['tipo']): Caso {
    const k = clave(p.nDoc, p.nLinea), d = docs.get(texto(p.nDoc))?.[0]
    const configs = cfg.get(k) ?? [], c = configs.length === 1 ? configs[0]! : null
    const familias = [1, 2, 3, 4].map(i => ({ familia: texto(c?.[`Familia${i}`]), conjunto: texto(c?.[`Conjunto${i}`]) }))
    const perfiles = familias.filter(f => f.familia === '001' && f.conjunto)
    const vidrios = familias.filter(f => f.familia === '050' && f.conjunto)
    const medidas = { ancho: numero(p.Ancho), alto: numero(p.Largo) }, cantidad = numero(p.Cdad)
    const esperado = numero(p.Precio), exclusiones: string[] = []
    const hs = (hijas.get(k) ?? []).filter(f => !si(f.EstructuraSN) && !si(f.GrupoSN))
    if (si(p.RespetarPrecioSN) || si(p.PVPManualSN)) exclusiones.push('precio-manual')
    if (!(cantidad !== null && cantidad > 0) || (tipo !== 'ELEMENTO' && !(medidas.ancho! > 0 && medidas.alto! > 0))) exclusiones.push('medidas-o-cantidad-no-positivas')
    if (si(c?.DisEspecificoSN)) exclusiones.push('diseno-especifico-no-reproducible')
    if (!d || !c || esperado === null || numero(d.Tarifa) === null ||
      (tipo !== 'GRUPO' && perfiles.length !== 1)) exclusiones.push('entradas-incompletas')
    if (tipo !== 'GRUPO' && !hs.length) exclusiones.push('despiece-no-enlazado')
    if (tipo !== 'GRUPO' && hs.some(f => f.nDoc !== p.nDoc || indice.get(clave(f.nDoc, f.nEstr))?.[0] !== p)) throw new Error('Enlace no demostrado')
    return { id: `caso-${String(++ordinal).padStart(5, '0')}`, tipo, modelo: tipo === 'GRUPO' ? 'GRUPO' : texto(p.Articulo),
      fecha: texto(d?.Fecha), tarifa: numero(d?.Tarifa), padre: p, configuracion: c,
      opciones: opt.get(k) ?? [], piezas: hs.map(pieza), dimensiones: medidas, cantidad,
      serie: perfiles.length === 1 ? perfiles[0]!.conjunto : null,
      vidrio: vidrios.length === 1 ? vidrios[0]!.conjunto : null, familias,
      esperado, totalEsperado: numero(p.ImporteTotal), exclusiones: [...new Set(exclusiones)],
      // El detalle permanece en tablas.json para demostrar el enlace nVLinEstr; no reconstruimos diseños.
    }
  }
  const elementos = estructuras.filter(f => tiene(f.nGrupo)).map(p => crear(p, 'ELEMENTO'))
  const porLinea = new Map(elementos.map(c => [clave(c.padre.nDoc, c.padre.nLinea), c]))
  const cerr = agrupar(t.VCerramientos!.filter(f => texto(f.TipoDoc) === 'VPRES'), f => clave(f.nDoc, f.nLinGrupo))
  const geo = agrupar(t.VCerramientosLin!, f => texto(f.nCerr))
  const casos = estructuras.filter(f => !tiene(f.nGrupo)).map(p => crear(p, 'ESTRUCTURA'))
  for (const p of ls.filter(f => si(f.GrupoSN))) {
    const c = crear(p, 'GRUPO'), padres = cerr.get(clave(p.nDoc, p.nLinea)) ?? []
    if (padres.length !== 1) c.exclusiones.push('cerramiento-ausente-o-ambiguo')
    else {
      c.cerramiento = padres[0]!
      c.geometria = geo.get(texto(c.cerramiento.id)) ?? []
      c.elementos = c.geometria.flatMap(g => {
        const e = porLinea.get(clave(p.nDoc, g.nLinEstr))
        if (!e || texto(e.padre.nGrupo) !== texto(p.nLinea) || e.modelo !== texto(g.CodEstr)) {
          c.exclusiones.push('elemento-no-enlazado'); return []
        }
        if (si(g.DisEspecificoSN)) e.exclusiones.push('diseno-especifico-no-reproducible')
        return [e]
      })
      const geomIds = new Set(c.elementos.map(e => texto(e.padre.nLinea)))
      const adicionales = elementos.filter(e => texto(e.padre.nDoc) === texto(p.nDoc) && texto(e.padre.nGrupo) === texto(p.nLinea) && !geomIds.has(texto(e.padre.nLinea)))
      c.elementos.push(...adicionales)
      c.piezas = [...c.elementos.flatMap(e => e.piezas),
        ...ls.filter(f => texto(f.nDoc) === texto(p.nDoc) && texto(f.nGrupo) === texto(p.nLinea) && !tiene(f.nEstr) && !si(f.EstructuraSN) && !si(f.GrupoSN)).map(pieza)]
      c.exclusiones.push(...c.elementos.flatMap(e => e.exclusiones))
      if (!c.elementos.length) c.exclusiones.push('entradas-incompletas')
    }
    c.exclusiones = [...new Set(c.exclusiones)]
    casos.push(c)
  }
  const enlaces = ls.filter(f => tiene(f.nEstr))
  const huerfanas = enlaces.filter(f => !indice.has(clave(f.nDoc, f.nEstr)))
  const destinoIncorrecto = enlaces.filter(f => indice.has(clave(f.nDoc, f.nEstr)) && !si(indice.get(clave(f.nDoc, f.nEstr))![0]!.EstructuraSN))
  const sumas = estructuras.map(p => {
    const hs = hijas.get(clave(p.nDoc, p.nLinea)) ?? []
    return { tieneHijas: hs.length > 0, coincide: hs.length > 0 && hs.every(h => numero(h.ImporteTotal) !== null) &&
      numero(p.Precio) !== null && Math.abs(hs.reduce((s, h) => s + numero(h.ImporteTotal)!, 0) - numero(p.Precio)!) <= .01 + 1e-8 }
  })
  for (const e of elementos) e.exclusiones = [...new Set(e.exclusiones)]
  return { casos, elementos, evidencia: {
    documentos: t.VPresupuestos!.length, filas: ls.length, estructuras: estructuras.length,
    independientes: casos.filter(c => c.tipo === 'ESTRUCTURA').length, grupos: casos.filter(c => c.tipo === 'GRUPO').length,
    elementos: elementos.length, elementosConPrecio: elementos.filter(c => c.esperado! > 0).length,
    enlacesEstr: enlaces.length, huerfanasEstr: huerfanas.length, destinoIncorrecto: destinoIncorrecto.length,
    nLinAsocInformado: ls.filter(f => tiene(f.nLinAsoc)).length, hijasPrecioReconciliado: sumas.filter(s => s.coincide).length,
    padresSinHijas: sumas.filter(s => !s.tieneHijas).length, instanciasDiseno: instancias.size,
    configuracionesDuplicadas: [...cfg.values()].filter(a => a.length > 1).length,
    lineasSinCabecera: ls.filter(f => !docs.has(texto(f.nDoc))).length,
    gruposConElementosAdicionales: casos.filter(c => c.tipo === 'GRUPO' && (c.elementos ?? []).some(e => !(c.geometria ?? []).some(g => texto(g.nLinEstr) === texto(e.padre.nLinea)))).length,
    elementosSinGeometria: casos.filter(c => c.tipo === 'GRUPO').reduce((s, c) => s + (c.elementos ?? []).filter(e => !(c.geometria ?? []).some(g => texto(g.nLinEstr) === texto(e.padre.nLinea))).length, 0),
    anos: Object.fromEntries([...agrupar(t.VPresupuestos!, f => texto(f.Fecha).slice(0, 4))].map(([k, a]) => [k, a.length])),
  } }
}
