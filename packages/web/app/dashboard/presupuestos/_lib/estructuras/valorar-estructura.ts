import { eq, inArray, sql } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import { calcularDespiece, type ComponentePlantilla } from '@aluminior/core/despiece'
import { lineaValorable, valorarDespiece, type DatosArticuloPrecio } from '@aluminior/core/precios'
import type { ClienteEscritura } from '../cliente-db.ts'
import type {
  OpcionHerrajeElegida, PiezaDespiece, RanuraAcristalamiento,
} from '../lineas/guardar-linea.ts'
import { resolverAcristalamientoEstructura } from './acristalamiento-estructura.ts'
import { resolverCosteDespiece } from './coste-despiece.ts'
import { resolverOpcionesHerraje } from './herraje.ts'
import { resolverPerfiles } from './resolucion-perfiles.ts'

export interface EntradaValoracionEstructura {
  codigo: string
  serieCodigo: string | null
  anchoMm: number | null
  altoMm: number | null
  vidrioCodigo: string | null
  varianteAcristalamiento: '1' | '2'
  acabadoCodigo: string | null
  tarifa: number
  opcionesHerraje: readonly string[]
}

export type ResultadoValoracionEstructura =
  | { ok: false; errores: Record<string, string[]> }
  | {
      ok: true
      descripcion: string
      precioUnitario: number | null
      aviso: string | null
      piezas: PiezaDespiece[]
      acristalamiento: RanuraAcristalamiento[]
      opcionesHerraje: OpcionHerrajeElegida[]
    }

/**
 * Caso de uso completo de valoración de UNA estructura.
 *
 * Extraído de la server action sin cambiar consultas, precedencias, redondeos
 * ni mensajes. La acción valida el formulario y coordina; este módulo lee el
 * catálogo, calcula y devuelve todos los satélites listos para persistir.
 */
export async function valorarEstructura(
  cliente: ClienteEscritura,
  entrada: EntradaValoracionEstructura,
): Promise<ResultadoValoracionEstructura> {
  const [estructura] = await cliente.select()
    .from(schema.estructuras).where(eq(schema.estructuras.codigo, entrada.codigo)).limit(1)
  if (!estructura) return { ok: false, errores: { codigo: ['Estructura no encontrada'] } }

  if (!entrada.anchoMm || !entrada.altoMm) {
    return { ok: false, errores: { anchoMm: ['Indica ancho y alto del hueco'] } }
  }
  if (!entrada.serieCodigo) {
    return { ok: false, errores: { serieCodigo: ['Indique Serie primero'] } }
  }
  const [serie] = await cliente.select()
    .from(schema.series).where(eq(schema.series.codigo, entrada.serieCodigo)).limit(1)
  if (!serie) return { ok: false, errores: { serieCodigo: ['Serie no encontrada'] } }

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
    plantillaResuelta as ComponentePlantilla[],
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
        precio: sql<string | null>`(
          SELECT p.precio FROM articulos_pvp p
          WHERE p.articulo_codigo = ${schema.articulos.codigo}
            AND p.tarifa = ${entrada.tarifa}
          ORDER BY (p.acabado_codigo = ${entrada.acabadoCodigo ?? ''}) DESC, p.acabado_codigo
          LIMIT 1
        )`,
      }).from(schema.articulos).where(inArray(schema.articulos.codigo, codigos))
    : []
  const mapa = new Map<string, DatosArticuloPrecio>(
    articulos.map((a) => [a.codigo, {
      codigo: a.codigo,
      tipoMetraje: a.tipoMetraje,
      precio: a.precio === null ? null : Number(a.precio),
      metrajeMinimo: a.metrajeMinimo === null ? null : Number(a.metrajeMinimo),
      metrajeMultiploLargo: a.metrajeMultiploLargo === null
        ? null : Number(a.metrajeMultiploLargo),
    }]),
  )
  const valoracion = valorarDespiece(despiece.piezas, mapa)
  let precioUnitario: number | null = valoracion.importe
  const piezas = await resolverCosteDespiece(cliente, {
    piezas: despiece.piezas,
    codigos,
    mapa,
    acabadoCodigo: entrada.acabadoCodigo,
  })

  const acristalamiento = await resolverAcristalamientoEstructura(cliente, {
    serieCodigo: entrada.serieCodigo,
    estructuraCodigo: entrada.codigo,
    vidrioCodigo: entrada.vidrioCodigo,
    varianteAcristalamiento: entrada.varianteAcristalamiento,
    acabadoCodigo: entrada.acabadoCodigo,
    anchoMm: entrada.anchoMm,
    altoMm: entrada.altoMm,
    tarifa: entrada.tarifa,
    plantillaResuelta,
    genericos,
    cotas,
    despiece,
    precioInicial: precioUnitario,
  })
  if (!acristalamiento.ok) return acristalamiento
  precioUnitario = acristalamiento.precio
  piezas.push(...acristalamiento.piezas)

  const problemas = [...acristalamiento.problemas]
  if (sinResolver.size) {
    problemas.push(
      `${sinResolver.size} ranuras de perfil que la serie ${entrada.serieCodigo} no resuelve (quedan sin valorar)`,
    )
  }
  if (sinResolverAsoc.size) {
    problemas.push(
      `${sinResolverAsoc.size} ranuras de asociado sin valorar (herrajes, escuadras y mano de obra: pendiente)`,
    )
  }
  problemas.push(...lineaValorable({
    incalculables: despiece.incalculables,
    sinPrecio: valoracion.sinPrecio,
    variablesFaltantes: despiece.variablesFaltantes,
  }).motivos)

  let aviso: string | null = null
  if (problemas.length) {
    precioUnitario = null
    aviso = `Importe incompleto: ${problemas.join('; ')}.`
  } else {
    const informativos: string[] = []
    if (variantesAplicadas > 0) {
      const nombreVariante = entrada.varianteAcristalamiento === '2' ? 'doble' : 'sencillo'
      informativos.push(
        `variante de cristal ${nombreVariante} en ${variantesAplicadas} componentes`,
      )
    }
    informativos.push(...despiece.avisos)
    if (informativos.length) aviso = `Valorado con avisos: ${informativos.join('; ')}.`
  }

  const opcionesHerraje = await resolverOpcionesHerraje(cliente, {
    serieCodigo: entrada.serieCodigo,
    estructuraCodigo: entrada.codigo,
    elegidas: entrada.opcionesHerraje,
  })
  return {
    ok: true,
    descripcion: estructura.descripcion,
    precioUnitario,
    aviso,
    piezas,
    acristalamiento: acristalamiento.acristalamiento,
    opcionesHerraje,
  }
}
