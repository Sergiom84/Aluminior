import { eq, inArray } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import { calcularDespiece, type ComponentePlantilla } from '@aluminior/core/despiece'
import { valorarDespiece, type DatosArticuloPrecio } from '@aluminior/core/precios'
import type { ClienteEscritura } from '../cliente-db.ts'
import type { EntradaValoracionEstructura } from './valorar-estructura.ts'
import { resolverCosteDespiece } from './coste-despiece.ts'
import { resolverPerfiles } from './resolucion-perfiles.ts'
import {
  leerPvpArticulos, precioDe, pvpPorArticuloDe,
} from './pvp-articulos.ts'


const error = (errores: Record<string, string[]>) => ({ ok: false as const, errores })

/** Carga y cálculo material compartido; las ranuras de vidrio no son materiales. */
export async function resolverMaterialesEstructura(cliente: ClienteEscritura, entrada: EntradaValoracionEstructura) {
  const [estructura] = await cliente.select()
    .from(schema.estructuras).where(eq(schema.estructuras.codigo, entrada.codigo)).limit(1)
  if (!estructura) return error({ codigo: ['Estructura no encontrada'] })

  if (!entrada.anchoMm || !entrada.altoMm) {
    return error({ anchoMm: ['Indica ancho y alto del hueco'] })
  }
  if (!entrada.serieCodigo) {
    return error({ serieCodigo: ['Indique Serie primero'] })
  }
  const [serie] = await cliente.select()
    .from(schema.series).where(eq(schema.series.codigo, entrada.serieCodigo)).limit(1)
  if (!serie) return error({ serieCodigo: ['Serie no encontrada'] })

  const plantilla = await cliente.select({
    articuloCodigo: schema.estructuraComponentes.articuloCodigo,
    cantidad: schema.estructuraComponentes.cantidad,
    formulaLargo: schema.estructuraComponentes.formulaLargo,
    formulaAncho: schema.estructuraComponentes.formulaAncho,
    tipoCorte: schema.estructuraComponentes.tipoCorte,
    anguloIzquierdo: schema.estructuraComponentes.anguloIzquierdo,
    anguloDerecho: schema.estructuraComponentes.anguloDerecho,
    funcion: schema.estructuraComponentes.funcion,
    medidaMinima: schema.estructuraComponentes.medidaMinima,
    medidaMaxima: schema.estructuraComponentes.medidaMaxima,
    componenteDisenyo: schema.estructuraComponentes.componenteDisenyo,
    idItemDisenyo: schema.estructuraComponentes.idItemDisenyo,
    grupoDisenyo: schema.estructuraComponentes.grupoDisenyo,
    tipoHojaDisenyo: schema.estructuraComponentes.tipoHojaDisenyo,
  }).from(schema.estructuraComponentes)
    .where(eq(schema.estructuraComponentes.estructuraCodigo, entrada.codigo))

  const {
    plantillaResuelta, genericos, sinResolver, sinResolverAsoc, variantesAplicadas,
  } = await resolverPerfiles(cliente, {
    serieCodigo: entrada.serieCodigo,
    plantilla,
    variante: entrada.varianteAcristalamiento,
  })

  const cotasFilas = await cliente.select({
    simbolo: schema.estructuraCotas.simbolo,
    valor: schema.estructuraCotas.valorPorDefecto,
  }).from(schema.estructuraCotas)
    .where(eq(schema.estructuraCotas.estructuraCodigo, entrada.codigo))
  const cotas: Record<string, number> = {}
  for (const c of cotasFilas) cotas[c.simbolo] ??= Number(c.valor ?? 0)

  const rebajesFilas = await cliente.select().from(schema.hojaRebajes)
    .where(eq(schema.hojaRebajes.serieCodigo, entrada.serieCodigo))
  const rebajes = new Map(rebajesFilas.map((f) => [
    `${f.perfilCodigo}|${f.eje}|${f.formula}`,
    { mm: Number(f.rebajeMm), muestras: f.muestras, totalMuestras: f.totalMuestras },
  ]))
  const despiece = calcularDespiece(
    plantillaResuelta.filter(c => c.componenteDisenyo !== '1') as ComponentePlantilla[],
    { anchoMm: entrada.anchoMm, altoMm: entrada.altoMm },
    cotas,
    {
      serie: entrada.serieCodigo,
      rebajeDeHoja: (c) => rebajes.get(`${c.articuloCodigo}|${c.funcion}|${c.formula}`) ?? null,
    },
  )

  const codigos = [...new Set(despiece.piezas.map((x) => x.articuloCodigo))]
  const articulos = codigos.length
    ? await cliente.select({
        codigo: schema.articulos.codigo,
        tipoMetraje: schema.articulos.tipoMetraje,
        metrajeMinimo: schema.articulos.metrajeMinimo,
        metrajeMultiploLargo: schema.articulos.metrajeMultiploLargo,
      }).from(schema.articulos).where(inArray(schema.articulos.codigo, codigos))
    : []
  // El PVP se lee aparte y se resuelve en `resolverPvpCatalogo` (T.73). Antes
  // era una subconsulta con `ORDER BY ... acabado_codigo LIMIT 1`, que sin
  // acabado exacto cobraba el precio del primer acabado por orden de código.
  const filasPvp = await leerPvpArticulos(cliente, codigos, entrada.tarifa)
  const pvp = pvpPorArticuloDe(
    filasPvp,
    entrada.acabadoCodigo,
  )
  const mapa = new Map<string, DatosArticuloPrecio>(
    articulos.map((a) => [a.codigo, {
      codigo: a.codigo,
      tipoMetraje: a.tipoMetraje,
      precio: precioDe(pvp.get(a.codigo)),
      metrajeMinimo: a.metrajeMinimo === null ? null : Number(a.metrajeMinimo),
      metrajeMultiploLargo: a.metrajeMultiploLargo === null
        ? null : Number(a.metrajeMultiploLargo),
    }]),
  )
  despiece.incalculables = despiece.piezas.filter(p => p.largoMm === null &&
    (mapa.get(p.articuloCodigo)?.tipoMetraje !== 'UD' || p.formula !== null)).length
  const valoracion = valorarDespiece(despiece.piezas, mapa)
  const precioUnitario = valoracion.importe
  const piezas = await resolverCosteDespiece(cliente, {
    piezas: despiece.piezas,
    codigos,
    mapa,
    acabadoCodigo: entrada.acabadoCodigo,
  })

  return { ok: true as const, estructura, plantillaResuelta, genericos, sinResolver, sinResolverAsoc, variantesAplicadas, cotas, despiece, valoracion, precioUnitario, piezas, pvp, mapa, filasPvp }
}
