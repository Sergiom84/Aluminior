/**
 * Lectura del catálogo de despiece completo para UNA línea de estructura.
 *
 * El motor del core es síncrono y puro; aquí se precarga todo lo que puede
 * necesitar una estructura y una serie: plantilla, ranuras de la cadena de la
 * serie, descuentos, asociaciones de la serie y de sus códigos de herraje,
 * opciones, acristalamiento, mano de obra, artículos y PVP de la tarifa.
 * Devuelve null si el catálogo nuevo no está cargado para esa combinación.
 */

import { and, eq, inArray } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import {
  clavesTipoHoja, esTipoHojaMarco, type CatalogoLinea, type FilaPlantillaCatalogo,
} from '@aluminior/core/despiece'
import { construirResoluciones, expandirCadena } from '@aluminior/core/series'
import { resolverPvpCatalogo } from '@aluminior/core/precios'
import type { ClienteEscritura } from '../../cliente-db.ts'
import { tablasMotorCatalogo } from './disponible.ts'

const n = (v: string | null | undefined) => v === null || v === undefined ? 0 : Number(v)
const vacioANull = (v: string | null) => v && v.trim() ? v : null

export interface EntradaCatalogoLinea {
  estructura: string
  serie: string
  vidrio: string | null
  tarifa: number
  /** Estructuras accesorias de la línea (compacto) cuya plantilla también se precarga. */
  adicionales?: readonly string[]
}

export async function leerCatalogoLinea(cliente: ClienteEscritura, e: EntradaCatalogoLinea): Promise<CatalogoLinea | null> {
  if (!await tablasMotorCatalogo(cliente)) return null
  const [plantillaFilas, [parametros], [estructura], parametrosEstructura] = await Promise.all([
    cliente.select().from(schema.estructuraPlantillaCatalogo).where(inArray(schema.estructuraPlantillaCatalogo.estructuraCodigo,
      [e.estructura, ...e.adicionales ?? []])),
    cliente.select().from(schema.conjuntoParametrosDespiece).where(eq(schema.conjuntoParametrosDespiece.conjuntoCodigo, e.serie)).limit(1),
    cliente.select({ esAccesorio: schema.estructuras.esAccesorio }).from(schema.estructuras).where(eq(schema.estructuras.codigo, e.estructura)).limit(1),
    cliente.select().from(schema.estructuraParametrosDespiece).where(eq(schema.estructuraParametrosDespiece.estructuraCodigo, e.estructura)),
  ])
  if (!plantillaFilas.some(f => f.estructuraCodigo === e.estructura) || !parametros || !estructura) return null

  const plantillas = new Map<string, FilaPlantillaCatalogo[]>()
  for (const f of plantillaFilas.sort((a, b) => a.lineaOrigen - b.lineaOrigen)) plantillas.set(f.estructuraCodigo, [...plantillas.get(f.estructuraCodigo) ?? [], {
    id: f.idPieza, articulo: f.articulo, componente: f.componente, funcion: f.funcion, cantidad: n(f.cantidad),
    posicionTrabajo: f.posicionTrabajo, tipoHoja: f.tipoHoja, mano: f.mano, hoja: f.hoja, disVidrio: f.disVidrio,
    referenciaLargo: f.referenciaLargo, referenciaAncho: f.referenciaAncho, formulaLargo: f.formulaLargo,
    formulaAncho: f.formulaAncho, formulaReferenciaLargo: f.formulaReferenciaLargo, formulaReferenciaAncho: f.formulaReferenciaAncho,
    grupo: f.grupo, grupoIzquierdo: f.grupoIzquierdo, grupoDerecho: f.grupoDerecho, grupoSuperior: f.grupoSuperior,
    grupoInferior: f.grupoInferior, gruposAdicionales: f.gruposAdicionales.map(vacioANull), perfilAdicional: f.perfilAdicional,
    formulaSeleccion: f.formulaSeleccion,
  }])
  const plantilla = plantillas.get(e.estructura)!

  const tiposHoja = new Map((await cliente.select().from(schema.tiposHojaCatalogo)).map(t => [t.id, t.tipo]))
  const herrajes = parametros.herrajes as Record<string, string>
  const conjuntosHerraje = [...new Set(plantilla.map(f => f.tipoHoja).filter(t => !esTipoHojaMarco(t))
    .map(t => clavesTipoHoja(tiposHoja.get(t!))?.herraje).filter((k): k is string => !!k)
    .map(k => herrajes[k]).filter((c): c is string => !!c))]
  const conjuntos = [e.serie, ...conjuntosHerraje]

  const delegacionesFilas = await cliente.select().from(schema.conjuntoDelegaciones)
  const delegaciones = new Map<string, string[]>()
  for (const d of delegacionesFilas) delegaciones.set(d.conjuntoCodigo, [...(delegaciones.get(d.conjuntoCodigo) ?? []), d.delegadoCodigo])
  const cadena = expandirCadena(e.serie, delegaciones)
  const [resolucionesFilas, vaciasFilas, descuentosFilas, asociacionesFilas, opcionesFilas, gruposFilas, conjuntoFila, conceptos] = await Promise.all([
    cliente.select().from(schema.conjuntoResoluciones).where(inArray(schema.conjuntoResoluciones.conjuntoCodigo, cadena)),
    cliente.select().from(schema.conjuntoRanurasVacias).where(inArray(schema.conjuntoRanurasVacias.conjuntoCodigo, cadena)),
    cliente.select().from(schema.conjuntoDescuentosCorte).where(and(
      eq(schema.conjuntoDescuentosCorte.conjuntoCodigo, e.serie), eq(schema.conjuntoDescuentosCorte.familia, '001'))),
    cliente.select().from(schema.conjuntoAsociaciones).where(inArray(schema.conjuntoAsociaciones.conjuntoCodigo, conjuntos)),
    cliente.select().from(schema.opcionesHerraje).where(inArray(schema.opcionesHerraje.conjuntoCodigo, conjuntos)),
    cliente.select().from(schema.gruposAsociacion).where(eq(schema.gruposAsociacion.familia, '001')),
    cliente.select({ tablaHojas: schema.conjuntos.tablaHojas, tablaFijos: schema.conjuntos.tablaFijos })
      .from(schema.conjuntos).where(eq(schema.conjuntos.codigo, e.serie)).limit(1),
    cliente.select().from(schema.manoObraConceptos),
  ])
  const resoluciones = construirResoluciones(cadena, [
    ...resolucionesFilas.map(r => ({ conjuntoCodigo: r.conjuntoCodigo, componente: r.componente, articuloCodigo: r.articuloCodigo })),
    ...vaciasFilas.map(r => ({ conjuntoCodigo: r.conjuntoCodigo, componente: r.componente, articuloCodigo: '0' })),
  ])
  const tablaHojas = conjuntoFila[0]?.tablaHojas ?? null, tablaFijos = conjuntoFila[0]?.tablaFijos ?? null
  const tacris = await cliente.select().from(schema.tacrisFilas)
    .where(inArray(schema.tacrisFilas.tabla, [tablaHojas, tablaFijos].filter((t): t is string => !!t).concat('')))

  const codigos = new Set<string>([...plantillaFilas.map(f => f.articulo), ...resoluciones.values(),
    ...asociacionesFilas.map(a => a.articulo), ...conceptos.map(c => c.articulo)])
  for (const t of tacris) for (const c of [t.junquillo, t.juntaExterior, t.juntaInterior]) if (c) codigos.add(c)
  if (e.vidrio) codigos.add(e.vidrio)
  // Horas manuales por unidad: fabricación y colocación.
  for (const c of ['MO', 'MOCOL']) codigos.add(c)
  const lista = [...codigos].filter(c => c && c !== '0')
  const [articulos, despiece, pvp, incrementos] = lista.length ? await Promise.all([
    cliente.select().from(schema.articulos).where(inArray(schema.articulos.codigo, lista)),
    cliente.select().from(schema.articulosDespiece).where(inArray(schema.articulosDespiece.articuloCodigo, lista)),
    cliente.select().from(schema.articulosPvp).where(and(inArray(schema.articulosPvp.articuloCodigo, lista), eq(schema.articulosPvp.tarifa, e.tarifa))),
    cliente.select().from(schema.articulosIncrementosPrecio).where(inArray(schema.articulosIncrementosPrecio.articuloCodigo, lista)),
  ]) : [[], [], [], []]
  const articuloPor = new Map(articulos.map(a => [a.codigo, a]))
  const despiecePor = new Map(despiece.map(a => [a.articuloCodigo, a]))
  const agrupar = <T>(filas: T[], clave: (f: T) => string) => {
    const m = new Map<string, T[]>(); for (const f of filas) m.set(clave(f), [...(m.get(clave(f)) ?? []), f]); return m
  }
  const pvpPor = agrupar(pvp, p => p.articuloCodigo), incrementosPor = agrupar(incrementos, i => i.articuloCodigo)
  const asociacionesPor = agrupar(asociacionesFilas, a => a.conjuntoCodigo)
  const grupos = new Map(gruposFilas.map(g => [g.codigo, new Set(g.componentes)]))

  return {
    plantilla: codigo => plantillas.get(codigo) ?? [],
    esAccesorio: codigo => codigo === e.estructura && estructura.esAccesorio,
    articulo: codigo => {
      const a = articuloPor.get(codigo), d = despiecePor.get(codigo)
      return a ? { codigo, tipoMetraje: a.tipoMetraje, componente: d?.componente ?? null, grosorAcristalar: n(d?.grosorAcristalar),
        dobleAcristalamiento: d?.dobleAcristalamiento ?? false, generico: d?.generico ?? false } : null
    },
    serie: codigo => codigo === e.serie ? {
      codigo, herrajes, manoObra: parametros.manoObra as Record<string, string>, tablaHojas, tablaFijos,
      grosorMaximoSimple: n(parametros.grosorMaximoSimple), grosorMaximoDoble: n(parametros.grosorMaximoDoble),
    } : null,
    resolverComponente: (_serie, componente, variante) =>
      resoluciones.get(componente) ?? resoluciones.get(`${componente}.${variante}`) ?? null,
    descuentos: () => descuentosFilas.map(d => ({ grupoPrincipal: d.grupoPrincipal, grupo: d.grupo, tipoHoja: d.tipoHoja, mm: n(d.descuentoMm) })),
    nombreTipoHoja: id => tiposHoja.get(id) ?? null,
    asociaciones: conjunto => (asociacionesPor.get(conjunto) ?? []).map(a => ({
      id: a.id, conjunto: a.conjuntoCodigo, articulo: a.articulo, cantidad: n(a.cantidad), acabado: a.acabado,
      intervalo: n(a.intervalo), medidaMin: n(a.medidaMin), medidaMax: n(a.medidaMax), unidadesMin: n(a.unidadesMin),
      unidadesMax: n(a.unidadesMax), tipoMedida: a.tipoMedida, descuento: n(a.descuento), formulaLargo: a.formulaLargo,
      formulaAncho: a.formulaAncho, soloUna: a.soloUna, componente: a.componente, grupo: a.grupo,
      grupoAsociacion: a.grupoAsociacion, modulos: a.modulos, articuloPrincipal: a.articuloPrincipal, opcion: a.opcion,
      formulaOpcion: a.formulaOpcion, apertura: a.apertura, mano: a.mano, posicionTrabajo: a.posicionTrabajo,
      asociadoA: a.asociadoA, noContrastado: a.noContrastado,
    })),
    opciones: conjunto => opcionesFilas.filter(o => o.conjuntoCodigo === conjunto)
      .map(o => ({ conjunto, opcion: String(Number(o.opcionCodigo)), porDefecto: o.porDefecto })),
    gruposAsociacion: () => grupos,
    tablaAcristalamiento: codigo => tacris.filter(t => t.tabla === codigo).map(t => ({
      posicion: t.posicion, junquillo: t.junquillo, juntaExterior: t.juntaExterior, juntaInterior: t.juntaInterior, grosor: n(t.grosor),
    })),
    conceptosManoObra: () => conceptos.map(c => ({
      codigo: c.codigo, minutos: n(c.minutos), articulo: c.articulo, modulo: c.modulo, articuloAsociado: c.articuloAsociado,
      componenteAsociado: c.componenteAsociado, grupoAsociado: c.grupoAsociado, conIncrementos: c.conIncrementos,
      categoria: c.categoria,
    })),
    tipoPerfil: codigo => parametrosEstructura.find(p => p.estructuraCodigo === codigo)?.tipoPerfil ?? null,
    tarifa: (codigo, acabado) => {
      const a = articuloPor.get(codigo)
      if (!a) return null
      const r = resolverPvpCatalogo((pvpPor.get(codigo) ?? []).map(p => ({ acabadoCodigo: p.acabadoCodigo, precio: p.precio })), acabado)
      return {
        tipoMetraje: a.tipoMetraje, pvp: r.estado === 'RESUELTO' ? Number(r.precio) : null,
        multiploLargoCm: n(a.metrajeMultiploLargo), multiploAnchoCm: n(a.metrajeMultiploAncho), minimo: n(a.metrajeMinimo),
        incrementos: despiecePor.get(codigo)?.incrementosPrecio
          ? (incrementosPor.get(codigo) ?? []).map(i => ({ tipo: i.tipo as 'MET' | 'MED', desde: n(i.desde), hasta: n(i.hasta), porcentaje: n(i.porcentaje) }))
          : [],
      }
    },
  }
}
