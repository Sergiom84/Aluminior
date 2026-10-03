/**
 * Valoración de una estructura con el motor de catálogo completo (fase-7/06).
 *
 * Mismo contrato que `valorarEstructura`, para que alta de línea y cerramientos
 * lo persistan igual: precio (null si falta algo), aviso, piezas con coste,
 * ranuras de vidrio, opciones marcadas y partidas por fila (redondeo
 * `FILA_CENTIMOS`). Devuelve null si el catálogo nuevo no está cargado para
 * esa estructura y serie: entonces decide la vía anterior.
 */

import { eq, inArray } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import {
  clavesTipoHoja, despiezarLineaCatalogo, esTipoHojaMarco, opcionesMarcadas, type CatalogoLinea,
  type FilaDespieceCatalogo, type SeleccionGuardada,
} from '@aluminior/core/despiece'
import { multiplicarDecimal, normalizarDecimal, type DatosArticuloPrecio } from '@aluminior/core/precios'
import type { PartidaValoracionCerramiento } from '@aluminior/core/estructuras'
import type { ClienteEscritura } from '../../cliente-db.ts'
import type { OpcionHerrajeElegida, PiezaDespiece, RanuraAcristalamiento } from '../../lineas/guardar-linea.ts'
import { costePorArticuloDe, leerCostesArticulos } from '../coste-articulos.ts'
import { prepararPiezasDespiece } from '../coste-despiece.ts'
import type { EntradaValoracionEstructura, ResultadoValoracionEstructura } from '../valorar-estructura.ts'
import { leerCatalogoLinea } from './leer-catalogo.ts'

const GRUPO: Record<FilaDespieceCatalogo['origen'], PartidaValoracionCerramiento['grupoValoracion']> = {
  plantilla: 'MATERIALES', asociado: 'MATERIALES', 'mano-obra': 'MATERIALES', compacto: 'MATERIALES', vidrio: 'VIDRIO',
  acristalamiento: 'ACRISTALAMIENTO',
}
const decimal = (v: number | null | undefined, escala: number) =>
  v === null || v === undefined || !Number.isFinite(v) ? null : normalizarDecimal(v.toFixed(escala), escala)

/** Horas tecleadas a dos decimales -> minutos exactos (6,07 h = 364,2 min, SPEC-MANO-DE-OBRA §13). */
const minutos = (horas: string | null | undefined) => {
  if (!horas?.trim()) return 0
  const valor = Number(multiplicarDecimal(normalizarDecimal(horas, 2), '60', 2))
  if (!Number.isFinite(valor) || valor < 0) throw new Error('Horas manuales no válidas')
  return valor
}

interface OpcionVisible { conjunto: string; opcion: string; oculta: boolean; porDefecto: boolean; descripcion: string }

/** Conjuntos de asociaciones de la línea: la serie y el herraje de cada grupo de hojas. */
export function conjuntosDeLinea(catalogo: CatalogoLinea, estructura: string, serie: string): string[] {
  const parametros = catalogo.serie(serie)
  if (!parametros) return []
  const herrajes = catalogo.plantilla(estructura).map(f => f.tipoHoja).filter(t => !esTipoHojaMarco(t))
    .map(t => clavesTipoHoja(catalogo.nombreTipoHoja(t!))?.herraje).filter((k): k is string => !!k)
    .map(k => parametros.herrajes[k]).filter((c): c is string => !!c)
  return [serie, ...new Set(herrajes)]
}

/**
 * Selección que ve el motor: en los conjuntos con opciones visibles manda el
 * formulario (lo no marcado queda desmarcado) y las ocultas toman su valor por
 * defecto; los conjuntos sin opciones visibles usan el catálogo (`SelecDefSN`).
 */
export function seleccionGuardada(conjuntos: readonly string[], elegidas: readonly string[],
  opciones: readonly OpcionVisible[]): SeleccionGuardada[] {
  const marcadas = new Set(elegidas.map(k => { const [c, o] = k.split('|'); return `${c}|${String(Number(o))}` }))
  return conjuntos.flatMap(conjunto => {
    const propias = opciones.filter(o => o.conjunto === conjunto)
    if (!propias.some(o => !o.oculta)) return []
    return propias.map(o => ({ conjunto, opcion: o.opcion,
      marcada: o.oculta ? o.porDefecto : marcadas.has(`${conjunto}|${o.opcion}`) }))
  })
}

export async function valorarConCatalogo(
  cliente: ClienteEscritura,
  entrada: EntradaValoracionEstructura,
): Promise<ResultadoValoracionEstructura | null> {
  if (!entrada.serieCodigo || entrada.anchoMm === null || entrada.altoMm === null ||
    !(entrada.altoMm > 0) || !(entrada.anchoMm >= 0)) return null
  const catalogo = await leerCatalogoLinea(cliente, {
    estructura: entrada.codigo, serie: entrada.serieCodigo, vidrio: entrada.vidrioCodigo, tarifa: entrada.tarifa,
    adicionales: entrada.compacto ? [entrada.compacto.estructura] : [],
  })
  if (!catalogo) return null
  const [estructura] = await cliente.select({ descripcion: schema.estructuras.descripcion })
    .from(schema.estructuras).where(eq(schema.estructuras.codigo, entrada.codigo)).limit(1)
  const conjuntos = conjuntosDeLinea(catalogo, entrada.codigo, entrada.serieCodigo)
  const opciones: OpcionVisible[] = (await cliente.select().from(schema.opcionesHerraje)
    .where(inArray(schema.opcionesHerraje.conjuntoCodigo, conjuntos)))
    .map(o => ({ conjunto: o.conjuntoCodigo, opcion: String(Number(o.opcionCodigo)), oculta: o.oculta,
      porDefecto: o.porDefecto, descripcion: o.descripcion }))
  const guardadas = seleccionGuardada(conjuntos, entrada.opcionesHerraje, opciones)
  const acabado = entrada.acabadoCodigo ?? 'UNI'
  const resultado = despiezarLineaCatalogo(catalogo, {
    estructura: entrada.codigo, serie: entrada.serieCodigo, anchoMm: entrada.anchoMm, altoMm: entrada.altoMm,
    vidrio: entrada.vidrioCodigo, acabado, acabadoAccesorios: entrada.acabadoAccesoriosCodigo || 'UNI', opcionesGuardadas: guardadas,
    compacto: entrada.compacto ?? null, cotas: entrada.cotas ?? undefined,
    minutosFabricacionAdicionales: minutos(entrada.horasFabricacion), minutosColocacion: minutos(entrada.horasColocacion),
  })

  const codigos = [...new Set(resultado.filas.map(f => f.articulo))]
  const mapa = new Map<string, DatosArticuloPrecio>(codigos.map(c => {
    const t = catalogo.tarifa(c, acabado)
    return [c, { codigo: c, tipoMetraje: t?.tipoMetraje ?? '?', precio: t?.pvp ?? null, metrajeMinimo: null, metrajeMultiploLargo: null }]
  }))
  const costes = costePorArticuloDe(await leerCostesArticulos(cliente, codigos), entrada.acabadoCodigo)
  const piezas: PiezaDespiece[] = prepararPiezasDespiece({
    piezas: resultado.filas.map(f => ({ articuloCodigo: f.articulo, cantidad: f.cantidad, largoMm: f.largoMm, formula: null,
      tipoCorte: null, anguloIzquierdo: null, anguloDerecho: null, funcion: f.funcion, incidencia: null })),
    mapa, costePorArticulo: costes,
  }).map((p, i) => ({ ...p, acabadoCodigo: resultado.filas[i]!.acabado,
    anchoCorteMm: resultado.filas[i]!.anchoMm === null ? null : String(resultado.filas[i]!.anchoMm) }))

  const acristalamiento: RanuraAcristalamiento[] = catalogo.plantilla(entrada.codigo).filter(f => f.componente === '1')
    .map((f, i) => ({ slot: i + 1, variante: entrada.varianteAcristalamiento,
      vidrioHojas: esTipoHojaMarco(f.tipoHoja) ? null : entrada.vidrioCodigo,
      vidrioFijos: esTipoHojaMarco(f.tipoHoja) ? entrada.vidrioCodigo : null }))
  const marcadas = opcionesMarcadas(conjuntos, opciones, guardadas)
  const opcionesHerraje: OpcionHerrajeElegida[] = opciones.filter(o => marcadas.get(o.conjunto)?.has(o.opcion))
    .map(o => ({ categoria: o.conjunto, opcionCodigo: o.opcion, descripcion: o.descripcion }))

  const partidas: PartidaValoracionCerramiento[] = resultado.filas.map((f, ordinal) => {
    const t = catalogo.tarifa(f.articulo, f.acabado)
    const cantidad = decimal(f.metraje, 6), precio = decimal(t?.pvp, 4)
    const valorada = cantidad !== null && precio !== null && f.importe !== null
    return { ordinal, grupoValoracion: GRUPO[f.origen], articuloCodigo: f.articulo, unidad: t?.tipoMetraje ?? null,
      cantidadFacturable: cantidad, precioUnitario: valorada ? precio : null,
      importeExacto: valorada ? multiplicarDecimal(cantidad!, precio!, 10) : null,
      incidencia: valorada ? null : 'Sin importe de catálogo', tarifa: entrada.tarifa,
      criterioPrecio: valorada ? 'EXACTO' : 'SIN_PRECIO', acabadoCodigo: valorada ? f.acabado : null }
  })

  const aviso = resultado.incidencias.length
    ? `Importe incompleto: ${resultado.incidencias.join('; ')}.`
    : resultado.avisos.length ? `Valorado con avisos: ${resultado.avisos.join('; ')}.` : null
  return {
    ok: true, descripcion: estructura?.descripcion ?? entrada.codigo, precioUnitario: resultado.importe, aviso, piezas,
    acristalamiento, opcionesHerraje, partidas: entrada.trazabilidad ? partidas : [],
    materialCompleto: resultado.incidencias.length === 0, motor: 'catalogo',
  }
}
