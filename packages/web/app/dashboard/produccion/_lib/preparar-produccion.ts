import { ensamblarHojaCorte, ensamblarHojaProduccion, optimizarCorte, calcularDespunte,
  extremosDeCorte, type GrupoBarras, type EstructuraEntrada, type CorteRequerido,
  type HojaCorte, type HojaProduccion, type ResultadoDespunte, type PlanCorte } from '@aluminior/core/produccion'
import { multiplicarDecimal, compararDecimal } from '@aluminior/core/precios'
import type { DatosProduccion, IncidenciaProduccion, ReferenciaPiezaProduccion } from './tipos.ts'
import { verificarDespiece } from './verificar-despiece.ts'
import { etiquetaLineaProduccion } from './identidad-linea'
import { parametrosSierra, validarParametrosProduccion, type ParametrosProduccion } from './parametros.ts'

export interface ConsumoProduccion {
  referencia: ReferenciaPiezaProduccion; etiqueta: string; articuloCodigo: string; acabadoCodigo: string | null
  unidad: string; cantidad: string; largoMm: string | null; anchoMm: string | null; cantidadFisica: number
  clase: 'BARRA' | 'CONSUMO_ML' | 'SUPERFICIE' | 'ACCESORIO'; apareceEnHojaDespiece: boolean
  anguloIzquierdo: string | null; anguloDerecho: string | null; posicion: string | null
}
export interface PreparacionProduccion {
  estado: 'LISTO' | 'CON_INCIDENCIAS' | 'NO_DISPONIBLE'; incidencias: IncidenciaProduccion[]
  corte: HojaCorte | null; produccion: (HojaProduccion & { consumos: ConsumoProduccion[] }) | null; despunte: ResultadoDespunte | null
  referencias: ReadonlyMap<string, ReferenciaPiezaProduccion>; consumos: ConsumoProduccion[]
  planes: { articuloCodigo: string; acabadoCodigo: string | null; plan: PlanCorte }[]
}

/** Adapter puro: foto persistida → motores existentes. No recalcula tarifas ni escribe cargos. */
export function prepararProduccion(datos: DatosProduccion, parametros: ParametrosProduccion): PreparacionProduccion {
  const salida: PreparacionProduccion = { estado: 'NO_DISPONIBLE', incidencias: [], corte: null,
    produccion: null, despunte: null, referencias: new Map(), consumos: [], planes: [] }
  try { preparar(datos, parametros, salida) } catch (error) {
    salida.estado = 'NO_DISPONIBLE'
    salida.corte = null; salida.produccion = null; salida.despunte = null
    salida.incidencias.push({ referencia: datos.id, detalle: error instanceof Error ? error.message : 'Datos de producción no válidos', bloqueante: true })
  }
  const referenciasLegibles = new Map(salida.consumos.map(c => [JSON.stringify(c.referencia), c.etiqueta]))
  const textoOperativo = (texto: string) => {
    let legible = referenciasLegibles.get(texto) ?? texto
    for (const linea of datos.lineas)
      legible = legible.replaceAll(linea.id, etiquetaLineaProduccion(linea))
    return legible.replaceAll(datos.id, `Documento ${datos.documento.numero} · revisión ${datos.documento.revision}`)
  }
  salida.incidencias = salida.incidencias.map(i => ({ ...i,
    referencia: textoOperativo(i.referencia), detalle: textoOperativo(i.detalle) }))
  return salida
}
function preparar(datos: DatosProduccion, parametros: ParametrosProduccion, salida: PreparacionProduccion): PreparacionProduccion {
  const util = validarParametrosProduccion(parametros)
  const sierra = parametrosSierra(parametros)
  const verificado = verificarDespiece(datos)
  salida.incidencias.push(...verificado.incidencias)
  if (salida.incidencias.some(i => i.bloqueante)) return salida
  if (!verificado.piezas.length) throw new Error('Despiece vacío: producción no disponible')
  const articulos = new Map(datos.articulos.map(a => [a.codigo, a]))
  const grupos = new Map<string, { grupo: GrupoBarras; cortes: CorteRequerido[]; costes: Set<string | null> }>()
  const estructuras = new Map<string, EstructuraEntrada>()
  const referencias = new Map<string, ReferenciaPiezaProduccion>()
  let numeroCortes = 0
  for (const fila of verificado.piezas) {
    const p = fila.pieza
    const articulo = articulos.get(p.articuloCodigo)
    if (!articulo) throw new Error(`${fila.etiqueta}: artículo ${p.articuloCodigo} ausente`)
    if (compararDecimal(fila.cantidadLinea, '0') <= 0) throw new Error(`${fila.etiqueta}: cantidad de línea no positiva`)
    const cantidadTexto = multiplicarDecimal(p.cantidad, fila.cantidadLinea, 5)
    const cantidad = Number(cantidadTexto)
    if (!Number.isSafeInteger(cantidad) || cantidad <= 0) throw new Error(`${fila.etiqueta}: cantidad física fraccionaria o fuera de rango`)
    const ref = JSON.stringify(fila.referencia)
    referencias.set(ref, fila.referencia)
    const keyOrigen = JSON.stringify([fila.referencia.lineaId, fila.referencia.tipoOrigen, fila.referencia.origenId])
    const estructura = estructuras.get(keyOrigen) ?? { referencia: `${fila.referenciaLinea || fila.referencia.lineaId} · ${fila.referencia.tipoOrigen.toLowerCase()} ${fila.referencia.origenId}`,
      descripcion: fila.descripcionLinea, cantidad: Number(fila.cantidadLinea), colorCodigo: p.acabadoCodigo,
      medidasMarco: { anchoMm: fila.anchoMm, altoMm: fila.altoMm },
      palos: [], accesorios: [], superficies: [] }
    estructuras.set(keyOrigen, estructura)
    if (p.unidad === 'M2') {
      if (!p.largoCorteMm || !p.anchoCorteMm) throw new Error(`${fila.etiqueta}: superficie sin ambas medidas`)
      if (articulo.apareceEnHojaDespiece) estructura.superficies!.push({ clase: p.funcion === 'VIDRIO' ? 'VIDRIO' : 'PANEL',
        articuloCodigo: p.articuloCodigo, descripcion: articulo.descripcion, cantidad,
        anchoMm: Number(p.anchoCorteMm), altoMm: Number(p.largoCorteMm) })
    } else if (p.unidad === 'ML') {
      if (!p.largoCorteMm || Number(p.largoCorteMm) <= 0) throw new Error(`${fila.etiqueta}: perfil sin longitud`)
      if (articulo.apareceEnHojaDespiece && articulo.apareceEnHojaCorte) estructura.palos!.push({ articuloCodigo: p.articuloCodigo,
        descripcion: articulo.descripcion, acabadoCodigo: p.acabadoCodigo, cantidad, largoMm: Number(p.largoCorteMm),
        funcion: p.funcion, anguloIzquierdo: p.anguloIzquierdo === null ? null : Number(p.anguloIzquierdo),
        anguloDerecho: p.anguloDerecho === null ? null : Number(p.anguloDerecho) })
      if (articulo.apareceEnHojaCorte) {
        numeroCortes += cantidad
        if (numeroCortes > 100000) throw new Error('El documento supera la capacidad de 100000 cortes del plan')
        const key = JSON.stringify([p.articuloCodigo, p.acabadoCodigo])
        const g: { grupo: GrupoBarras; cortes: CorteRequerido[]; costes: Set<string | null> } = grupos.get(key) ?? { grupo: { articuloCodigo: p.articuloCodigo,
          descripcion: articulo.descripcion, acabadoCodigo: p.acabadoCodigo, longitudBarraMm: parametros.longitudBarraMm,
          plan: optimizarCorte([], { longitudBarra: util, kerf: parametros.kerfMm }), procedencias: new Map() }, cortes: [], costes: new Set<string | null>() }
        g.cortes.push({ longitud: Number(p.largoCorteMm), cantidad, ref })
        g.costes.add(p.costeUnitario)
        g.grupo.procedencias = new Map([...g.grupo.procedencias!, [ref, { estructuraIndice: [...estructuras.keys()].indexOf(keyOrigen) + 1,
          referencia: fila.etiqueta, posicion: p.posicionTrabajo }]])
        grupos.set(key, g)
        const extremos = extremosDeCorte({ anguloIzquierdo: p.anguloIzquierdo === null ? null : Number(p.anguloIzquierdo),
          anguloDerecho: p.anguloDerecho === null ? null : Number(p.anguloDerecho) }, sierra)
        if (extremos.izquierdo.tipo === 'desconocido' || extremos.derecho.tipo === 'desconocido')
          salida.incidencias.push({ referencia: fila.etiqueta, detalle: 'Ángulos de corte pendientes de confirmar', bloqueante: false })
      }
    } else if (p.unidad === 'UD') {
      if (articulo.apareceEnHojaDespiece) estructura.accesorios!.push({ articuloCodigo: p.articuloCodigo,
        descripcion: articulo.descripcion, acabadoCodigo: p.acabadoCodigo, cantidad })
    } else throw new Error(`${fila.etiqueta}: unidad de material no soportada`)
    const cantidadConsumo = p.unidad === 'ML'
      ? multiplicarDecimal(cantidadTexto, multiplicarDecimal(p.largoCorteMm!, '0.001', 5), 5)
      : p.unidad === 'M2' ? multiplicarDecimal(cantidadTexto,
        multiplicarDecimal(p.largoCorteMm!, p.anchoCorteMm!, 4), 4) : cantidadTexto
    salida.consumos.push({ referencia: fila.referencia, etiqueta: fila.etiqueta, articuloCodigo: p.articuloCodigo,
      clase: p.unidad === 'M2' ? 'SUPERFICIE' : p.unidad === 'UD' ? 'ACCESORIO' : articulo.apareceEnHojaCorte ? 'BARRA' : 'CONSUMO_ML',
      apareceEnHojaDespiece: articulo.apareceEnHojaDespiece,
      anguloIzquierdo: p.anguloIzquierdo, anguloDerecho: p.anguloDerecho, posicion: p.posicionTrabajo,
      acabadoCodigo: p.acabadoCodigo, unidad: p.unidad, cantidad: p.unidad === 'M2'
        ? multiplicarDecimal(cantidadConsumo, '0.000001', 8) : cantidadConsumo,
      largoMm: p.largoCorteMm, anchoMm: p.anchoCorteMm, cantidadFisica: cantidad })
  }
  for (const g of grupos.values()) {
    g.grupo.plan = optimizarCorte(g.cortes, { longitudBarra: util, kerf: parametros.kerfMm })
    for (const imposible of g.grupo.plan.imposibles) salida.incidencias.push({
      referencia: imposible.ref ?? g.grupo.articuloCodigo,
      detalle: `${imposible.cantidad} × ${imposible.longitud} mm: ${imposible.motivo}`, bloqueante: true })
  }
  salida.referencias = referencias
  salida.planes = [...grupos.values()].map(g => ({ articuloCodigo: g.grupo.articuloCodigo,
    acabadoCodigo: g.grupo.acabadoCodigo ?? null, plan: g.grupo.plan }))
  if (salida.incidencias.some(i => i.bloqueante)) return salida
  const gruposBarras = [...grupos.values()]
  salida.corte = ensamblarHojaCorte({ documento: datos.documento, parametros: sierra, grupos: gruposBarras.map(g => g.grupo) })
  salida.produccion = { ...ensamblarHojaProduccion({ documento: datos.documento, parametros: sierra, estructuras: [...estructuras.values()] }),
    consumos: salida.consumos }
  salida.despunte = calcularDespunte(gruposBarras.map(g => ({ perfil: JSON.stringify([g.grupo.articuloCodigo, g.grupo.acabadoCodigo]),
    plan: g.grupo.plan, longitudBarraCompradaMm: parametros.longitudBarraMm,
    precioMetroLineal: g.costes.size === 1 ? [...g.costes][0] : null })), { modo: 'LINEA_APARTE' })
  for (const detalle of [...salida.corte.incidencias, ...salida.produccion.incidencias])
    salida.incidencias.push({ referencia: datos.id, detalle, bloqueante: false })
  salida.estado = salida.incidencias.length ? 'CON_INCIDENCIAS' : 'LISTO'
  return salida
}
