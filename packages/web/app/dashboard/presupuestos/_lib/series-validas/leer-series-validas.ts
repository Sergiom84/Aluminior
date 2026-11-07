import { and, inArray } from 'drizzle-orm'
import { schema, type crearDb } from '@aluminior/db'
import { expandirCadena } from '@aluminior/core/series'
import {
  ranurasDeSerie, seriesValidas, type FilaPlantillaSerie, type SerieEvaluable, type VidrioEvaluable,
} from './series-validas.ts'

type Db = Pick<ReturnType<typeof crearDb>, 'select'>

const numero = (valor: string | number | null | undefined) => {
  const n = Number(valor)
  return Number.isFinite(n) ? n : 0
}

async function leerRanuras(db: Db, estructuras: readonly string[]): Promise<Map<string, string[]>> {
  if (!estructuras.length) return new Map()
  const filas = await db.select({
    estructura: schema.estructuraPlantillaCatalogo.estructuraCodigo,
    articulo: schema.estructuraPlantillaCatalogo.articulo,
    componente: schema.estructuraPlantillaCatalogo.componente,
    funcion: schema.estructuraPlantillaCatalogo.funcion,
  }).from(schema.estructuraPlantillaCatalogo)
    .where(inArray(schema.estructuraPlantillaCatalogo.estructuraCodigo, [...estructuras]))
  const codigos = [...new Set(filas.map((fila) => fila.articulo))]
  const [existentes, detalle] = codigos.length ? await Promise.all([
    db.select({ codigo: schema.articulos.codigo }).from(schema.articulos)
      .where(inArray(schema.articulos.codigo, codigos)),
    db.select({ codigo: schema.articulosDespiece.articuloCodigo, generico: schema.articulosDespiece.generico })
      .from(schema.articulosDespiece).where(inArray(schema.articulosDespiece.articuloCodigo, codigos)),
  ]) : [[], []]
  const existe = new Set(existentes.map((fila) => fila.codigo))
  const generico = new Map(detalle.map((fila) => [fila.codigo, fila.generico]))
  const porEstructura = new Map<string, FilaPlantillaSerie[]>()
  for (const fila of filas) {
    const lista = porEstructura.get(fila.estructura) ?? []
    lista.push({
      componente: fila.componente,
      funcion: fila.funcion,
      articuloPropioValido: existe.has(fila.articulo) && !(generico.get(fila.articulo) ?? false),
    })
    porEstructura.set(fila.estructura, lista)
  }
  return new Map([...porEstructura].map(([estructura, lista]) => [estructura, ranurasDeSerie(lista)]))
}

async function leerVidrio(db: Db, vidrio: string | null): Promise<VidrioEvaluable | null> {
  if (!vidrio) return null
  const [fila] = await db.select({
    grosorAcristalar: schema.articulosDespiece.grosorAcristalar,
    dobleAcristalamiento: schema.articulosDespiece.dobleAcristalamiento,
  }).from(schema.articulosDespiece).where(inArray(schema.articulosDespiece.articuloCodigo, [vidrio])).limit(1)
  return fila ? {
    grosorAcristalar: numero(fila.grosorAcristalar),
    dobleAcristalamiento: fila.dobleAcristalamiento ?? false,
  } : null
}

async function leerSeries(
  db: Db, series: readonly string[], ranuras: readonly string[],
): Promise<SerieEvaluable[]> {
  const delegacionesFilas = await db.select({
    conjuntoCodigo: schema.conjuntoDelegaciones.conjuntoCodigo,
    delegadoCodigo: schema.conjuntoDelegaciones.delegadoCodigo,
  }).from(schema.conjuntoDelegaciones)
  const delegaciones = new Map<string, string[]>()
  for (const fila of delegacionesFilas) {
    delegaciones.set(fila.conjuntoCodigo, [...delegaciones.get(fila.conjuntoCodigo) ?? [], fila.delegadoCodigo])
  }
  const cadenas = new Map(series.map((serie) => [serie, expandirCadena(serie, delegaciones)]))
  const conjuntos = [...new Set([...cadenas.values()].flat())]
  const claves = [...new Set(ranuras.flatMap((ranura) => [ranura, `${ranura}.1`, `${ranura}.2`]))]

  const [resoluciones, vacias, parametros] = await Promise.all([
    claves.length ? db.select({
      conjunto: schema.conjuntoResoluciones.conjuntoCodigo, componente: schema.conjuntoResoluciones.componente,
    }).from(schema.conjuntoResoluciones).where(and(
      inArray(schema.conjuntoResoluciones.conjuntoCodigo, conjuntos),
      inArray(schema.conjuntoResoluciones.componente, claves))) : [],
    claves.length ? db.select({
      conjunto: schema.conjuntoRanurasVacias.conjuntoCodigo, componente: schema.conjuntoRanurasVacias.componente,
    }).from(schema.conjuntoRanurasVacias).where(and(
      inArray(schema.conjuntoRanurasVacias.conjuntoCodigo, conjuntos),
      inArray(schema.conjuntoRanurasVacias.componente, claves))) : [],
    db.select({
      conjunto: schema.conjuntoParametrosDespiece.conjuntoCodigo,
      grosorMaximoSimple: schema.conjuntoParametrosDespiece.grosorMaximoSimple,
    }).from(schema.conjuntoParametrosDespiece).where(inArray(schema.conjuntoParametrosDespiece.conjuntoCodigo, [...series])),
  ])

  const clavesPorConjunto = new Map<string, Set<string>>()
  for (const fila of [...resoluciones, ...vacias]) {
    const conjunto = clavesPorConjunto.get(fila.conjunto) ?? new Set<string>()
    conjunto.add(fila.componente)
    clavesPorConjunto.set(fila.conjunto, conjunto)
  }
  const grosor = new Map(parametros.map((fila) => [fila.conjunto, numero(fila.grosorMaximoSimple)]))
  return series.map((codigo) => ({
    codigo,
    resueltas: new Set((cadenas.get(codigo) ?? []).flatMap((c) => [...clavesPorConjunto.get(c) ?? []])),
    grosorMaximoSimple: grosor.get(codigo) ?? 0,
  }))
}

/**
 * Series que valoran cada estructura por separado con el vidrio elegido.
 * Una estructura sin ranuras que exijan serie (o desconocida) admite todas.
 */
export async function leerSeriesValidas(
  db: Db,
  entrada: { estructuras: readonly string[]; vidrio: string | null; series: readonly string[] },
): Promise<Record<string, string[]>> {
  const ranurasPor = await leerRanuras(db, entrada.estructuras)
  const todasRanuras = [...new Set([...ranurasPor.values()].flat())]
  const resultado: Record<string, string[]> = {}
  if (!todasRanuras.length) {
    for (const estructura of entrada.estructuras) resultado[estructura] = [...entrada.series]
    return resultado
  }
  const [series, vidrio] = await Promise.all([
    leerSeries(db, entrada.series, todasRanuras), leerVidrio(db, entrada.vidrio),
  ])
  for (const estructura of entrada.estructuras) {
    resultado[estructura] = seriesValidas(series, ranurasPor.get(estructura) ?? [], vidrio)
  }
  return resultado
}
