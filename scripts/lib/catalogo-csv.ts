/**
 * Catálogo de Productor leído de CSV exportados de una copia verificada, con
 * la forma `CatalogoLinea` del core. Solo lectura; no carga .env ni conecta a
 * bases. Lo usa el contraste con facturas; la web tiene su propia lectura.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse/sync'
import {
  construirResoluciones, expandirCadena, type VarianteAcristalamiento,
} from '../../packages/core/src/series/resolver.ts'
import { resolverPvpCatalogo } from '../../packages/core/src/precios/pvp-catalogo.ts'
import type {
  ArticuloCatalogo, CatalogoLinea, FilaPlantillaCatalogo, SerieCatalogo,
} from '../../packages/core/src/despiece/linea-catalogo/tipos.ts'
import type { OpcionCatalogo, ReglaAsociacion } from '../../packages/core/src/despiece/asociaciones/tipos.ts'
import type { FilaTablaAcristalamiento } from '../../packages/core/src/despiece/acristalamiento-catalogo.ts'
import type { ConceptoManoObraCatalogo } from '../../packages/core/src/despiece/mano-obra-fabricacion.ts'
import type { ArticuloTarifado, IncrementoPrecio } from '../../packages/core/src/precios/importe-fila.ts'

type Fila = Record<string, string>
export const numero = (v: string | undefined) => {
  if (v === undefined || !v.trim()) return 0
  const n = Number(v.trim().replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}
const texto = (v: string | undefined) => v?.trim() || null
const agrupar = <T>(filas: T[], clave: (f: T) => string) => {
  const m = new Map<string, T[]>()
  for (const f of filas) { const k = clave(f); const l = m.get(k); if (l) l.push(f); else m.set(k, [f]) }
  return m
}

export function leerCsv(carpeta: string, nombre: string): Fila[] {
  return parse(readFileSync(join(carpeta, `${nombre}.csv`)), { columns: true, bom: true, relax_quotes: true })
}

export function catalogoDesdeCsv(carpeta: string, tarifa = '1'): CatalogoLinea {
  const leer = (n: string) => leerCsv(carpeta, n)
  const articulos = new Map<string, Fila>(leer('Articulos').map(a => [a.Codigo!.trim(), a]))
  const plantillas = agrupar(leer('EstructurasArticulos').filter(r => !r.TipoDoc?.trim()), r => r.Estructura!.trim())
  const estructuras = new Map(leer('Estructuras').map(e => [e.Codigo!.trim(), e]))
  const conjuntos = new Map(leer('Conjuntos').map(c => [c.Codigo!.trim(), c]))
  const lineasConjunto = leer('ConjuntosLin').filter(r => r.Articulo?.trim())
  const descuentos = agrupar(leer('ConjuntosDescuentos').filter(d => d.Familia?.trim() === '001'), d => d.Conjunto!.trim())
  const tiposHoja = new Map(leer('SeriesAsocV2TiposHoja').map(t => [t.id!.trim(), t.tipo!.trim()]))
  const asociaciones = agrupar(leer('ConjuntosAsoc'), r => r.Conjunto!.trim())
  const opciones = agrupar(leer('ConjuntosOpcionesHerraje'), r => r.Conjunto!.trim())
  const grupos = new Map(leer('FamiliasGruposAsoc').filter(g => g.Familia?.trim() === '001')
    .map(g => [g.Codigo!.trim(), new Set(g.Componentes!.split(';').map(s => s.trim()).filter(Boolean))]))
  const tablasAcris = agrupar(leer('TAcristalamientoLin'), r => r.TAcris!.trim())
  const pvp = agrupar(leer('ArticulosPVP').filter(p => p.Tarifa?.trim() === tarifa), p => p.Articulo!.trim())
  const incrementos = agrupar(leer('ArticulosIncrPrecio'), r => r.Articulo!.trim())
  const conceptosMO = leer('MOConceptos').map((c): ConceptoManoObraCatalogo => ({
    codigo: c.Codigo!.trim(), minutos: numero(c.TiempoFabr), articulo: texto(c.CodArticulo) ?? 'MO',
    modulo: numero(c.ModuloAsoc) > 0 ? String(numero(c.ModuloAsoc)) : null,
    articuloAsociado: texto(c.ArticuloAsoc), componenteAsociado: texto(c.ComponenteAsoc), grupoAsociado: texto(c.GrupoAsoc),
    conIncrementos: [c.TiempoPreparacion, c.AnchoTiempo, c.AltoTiempo, c.AnchoMayorMM, c.AltoMayorMM].some(v => numero(v) !== 0),
  }))

  const delegaciones = new Map<string, string[]>()
  for (const [codigo, c] of conjuntos) {
    const destinos = Object.entries(c).filter(([k, v]) => /^(SubSerieDe|herr.+)$/.test(k) && v?.trim() && v.trim() !== '0' && v.trim() !== codigo)
      .map(([, v]) => v!.trim())
    if (destinos.length) delegaciones.set(codigo, [...new Set(destinos)])
  }
  const resoluciones = new Map<string, Map<string, string>>()
  const porConjuntoLin = agrupar(lineasConjunto, r => r.Conjunto!.trim())
  const indiceSerie = (serie: string) => {
    let m = resoluciones.get(serie)
    if (!m) {
      const cadena = expandirCadena(serie, delegaciones)
      m = construirResoluciones(cadena, cadena.flatMap(c => (porConjuntoLin.get(c) ?? []).map(r => ({
        conjuntoCodigo: c, componente: r.Componente!.trim(), articuloCodigo: r.Articulo!.trim(),
      }))))
      resoluciones.set(serie, m)
    }
    return m
  }

  const articulo = (codigo: string): ArticuloCatalogo | null => {
    const a = articulos.get(codigo)
    return a ? {
      codigo, tipoMetraje: a.TipoMetraje?.trim() ?? '', componente: texto(a.Componente),
      grosorAcristalar: numero(a.TamJunqGoma), dobleAcristalamiento: a.DAcrisSN === 'True', generico: a.GenericoSN === 'True',
    } : null
  }

  return {
    plantilla: (estructura) => (plantillas.get(estructura) ?? []).map((r): FilaPlantillaCatalogo => ({
      id: numero(r.id), articulo: r.Articulo!.trim(), componente: texto(r.DisComponente), funcion: texto(r.Funcion),
      cantidad: numero(r.Cantidad), posicionTrabajo: texto(r.PosicionTrabajo), tipoHoja: texto(r.DisTipoHoja),
      mano: texto(r.DisManoID), hoja: numero(r.DisNHoja), disVidrio: texto(r.DisVidrio),
      referenciaLargo: numero(r.DisIdRefLargo) || null, referenciaAncho: numero(r.DisIdRefAncho) || null,
      formulaLargo: texto(r.FormulaLargoCorte) ?? texto(r.FormulaLargo), formulaAncho: texto(r.FormulaAnchoCorte) ?? texto(r.FormulaAncho),
      formulaReferenciaLargo: texto(r.DisFRefLargo), formulaReferenciaAncho: texto(r.DisFRefAncho),
      grupo: texto(r.DisGrupo), grupoIzquierdo: texto(r.DisGrupoI), grupoDerecho: texto(r.DisGrupoD),
      grupoSuperior: texto(r.DisGrupoSup), grupoInferior: texto(r.DisGrupoInf),
      gruposAdicionales: [texto(r.DisGrupoAdicional), texto(r.DisGrupoAd2), texto(r.DisGrupoAd3), texto(r.DisGrupoAdIndep)],
      perfilAdicional: [0, -1].includes(numero(r.DisIdPerAd)) ? null : numero(r.DisIdPerAd),
    })),
    esAccesorio: (e) => estructuras.get(e)?.AccesorioSN === 'True',
    articulo,
    serie: (codigo): SerieCatalogo | null => {
      const c = conjuntos.get(codigo)
      if (!c) return null
      const sufijos = (prefijo: RegExp) => Object.fromEntries(Object.entries(c)
        .filter(([k, v]) => prefijo.test(k) && v?.trim()).map(([k, v]) => [k.replace(prefijo, ''), v!.trim()]))
      return {
        codigo, herrajes: sufijos(/^herr/), manoObra: sufijos(/^mo(?=[0-9M])/), tablaHojas: texto(c.TablaHojas), tablaFijos: texto(c.TablaFijos),
        grosorMaximoSimple: numero(c.CorrGrosorVid), grosorMaximoDoble: numero(c.CorrGrosorVidDA),
      }
    },
    resolverComponente: (serie, componente, variante: VarianteAcristalamiento) => {
      const m = indiceSerie(serie)
      return m.get(componente) ?? m.get(`${componente}.${variante}`) ?? null
    },
    descuentos: (serie) => (descuentos.get(serie) ?? []).map(d => ({
      grupoPrincipal: d.GrupoPrinc!.trim(), grupo: d.Grupo!.trim(), tipoHoja: d.TipoHoja!.trim(), mm: numero(d.Descuento),
    })),
    nombreTipoHoja: (id) => tiposHoja.get(id) ?? null,
    asociaciones: (conjunto) => (asociaciones.get(conjunto) ?? []).map((r): ReglaAsociacion => {
      const noContrastado: string[] = []
      if (numero(r.PlHojasX) || numero(r.PlHojasY) || texto(r.PlHojasXYstr)) noContrastado.push('plano de hojas')
      if (numero(r.AltoALMin) || numero(r.AltoALMax)) noContrastado.push('alto de manilla')
      if (r.PVCrefuerzoSN === 'True') noContrastado.push('refuerzo')
      if (r.SoloPerfPpalSN === 'True') noContrastado.push('solo perfiles principales')
      if (texto(r.TablaHerrajeInsertar) || texto(r.FormulaTablaHerrAlto) || texto(r.FormulaTablaHerrAncho)) noContrastado.push('tabla de herraje')
      return {
        id: r.nLin!.trim(), conjunto, articulo: r.Articulo?.trim() ?? '', cantidad: numero(r.Cantidad),
        acabado: r.Acabado?.trim() ?? '', intervalo: numero(r.Intervalo), medidaMin: numero(r.MedidaMin),
        medidaMax: numero(r.MedidaMax), unidadesMin: numero(r.UnidadesMin), unidadesMax: numero(r.UnidadesMax),
        tipoMedida: r.TipoMedCV?.trim() || 'C', descuento: numero(r.Descuento), formulaLargo: texto(r.FormulaL),
        formulaAncho: texto(r.FormulaA), soloUna: r.SoloUnaSN === 'True', componente: r.ComponenteAsoc?.trim() || '!',
        grupo: r.GrupoAsoc?.trim() || '!', grupoAsociacion: texto(r.AsocAGrupoAsoc), modulos: texto(r.AsocAModulo),
        articuloPrincipal: texto(r.ArticuloAsoc), opcion: texto(r.nOpcion) ? String(numero(r.nOpcion)) : null,
        formulaOpcion: texto(r.FormulaOpcion), apertura: numero(r.AperturaTH), mano: texto(r.ManoID),
        posicionTrabajo: texto(r.PosTrab), asociadoA: r.AsociadoA?.trim() ?? '', noContrastado,
      }
    }),
    opciones: (conjunto) => (opciones.get(conjunto) ?? []).map((o): OpcionCatalogo => ({
      conjunto, opcion: String(numero(o.nOpcion)), porDefecto: o.SelecDefSN === 'True',
    })),
    gruposAsociacion: () => grupos,
    tablaAcristalamiento: (codigo) => (tablasAcris.get(codigo) ?? []).map((t): FilaTablaAcristalamiento => ({
      posicion: t.Pos?.trim() || '*', junquillo: texto(t.Junquillo), juntaExterior: texto(t.JuntaExt),
      juntaInterior: texto(t.JuntaInt), grosor: numero(t.Grosor),
    })),
    conceptosManoObra: () => conceptosMO,
    tarifa: (codigo, acabado): ArticuloTarifado | null => {
      const a = articulos.get(codigo)
      if (!a) return null
      const r = resolverPvpCatalogo((pvp.get(codigo) ?? []).map(p => ({ acabadoCodigo: p.Acabado!.trim(), precio: String(numero(p.PVP)) })), acabado)
      const incr: IncrementoPrecio[] = a.IncrementosPrecioSN === 'True' ? (incrementos.get(codigo) ?? []).map(i => ({
        tipo: i.TipoMetMed!.trim() as 'MET' | 'MED', desde: numero(i.MetrajeDesde), hasta: numero(i.MetrajeHasta), porcentaje: numero(i.IncrementoPorc),
      })) : []
      return {
        tipoMetraje: a.TipoMetraje?.trim() ?? '', pvp: r.estado === 'RESUELTO' ? Math.round(Number(r.precio) * 10000) / 10000 : null,
        multiploLargoCm: numero(a.MetrajeMultiploLargo), multiploAnchoCm: numero(a.MetrajeMultiploAncho),
        minimo: numero(a.MetrajeMinimo), incrementos: incr,
      }
    },
  }
}
