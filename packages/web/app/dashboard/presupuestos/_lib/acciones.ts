'use server'

/**
 * Server Actions de presupuestos.
 *
 * Aquí converge todo: catálogo, estructuras, despiece y precios. El cálculo
 * ocurre SIEMPRE en servidor — si el navegador pudiera calcular precios,
 * cualquiera podría manipularlos.
 */

import { z } from 'zod'
import { eq, sql, and, inArray, asc, gte } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { crearDb, schema } from '@aluminior/db'
import { calcularDespiece, evaluar, type ComponentePlantilla, type PiezaCortada } from '@aluminior/core/despiece'
import {
  valorarDespiece, medidasVidrio, metrajeVidrioM2, type DatosArticuloPrecio,
} from '@aluminior/core/precios'
import { expandirCadena, construirResoluciones, resolverComponente } from '@aluminior/core/series'

export type Estado =
  | { ok: true; id: string }
  | { ok: false; errores: Record<string, string[]>; mensaje?: string }
  | null

/** Siguiente número, con el patrón AASSSS del original: 260418 = nº 418 de 2026. */
async function siguienteNumero(db: ReturnType<typeof crearDb>): Promise<number> {
  const anyo = new Date().getFullYear() % 100
  const [f] = (await db.execute<{ max: number | null }>(sql`
    SELECT MAX(numero) AS max FROM presupuestos
    WHERE numero >= ${anyo * 10000} AND numero < ${(anyo + 1) * 10000}
  `)) as unknown as { max: number | null }[]
  return f?.max ? Number(f.max) + 1 : anyo * 10000 + 1
}

const esquemaCabecera = z.object({
  clienteCodigo: z.string().trim().optional().transform((v) => v || null),
  nombreLibre: z.string().trim().max(200).optional().transform((v) => v || null),
  obraTexto: z.string().trim().max(200).optional().transform((v) => v || null),
  tarifa: z.coerce.number().int().min(1).max(9).default(1),
  formaPago: z.string().trim().max(60).optional().transform((v) => v || null),
})

export async function crearPresupuesto(_previo: Estado, datos: FormData): Promise<Estado> {
  const p = esquemaCabecera.safeParse(Object.fromEntries(datos))
  if (!p.success) return { ok: false, errores: p.error.flatten().fieldErrors }

  const d = p.data
  // Regla del sistema original: basta con identificar al destinatario de
  // ALGUNA forma. Muchos presupuestos reales sólo llevan un nombre a mano.
  if (!d.clienteCodigo && !d.nombreLibre) {
    return {
      ok: false,
      errores: { nombreLibre: ['Indica un cliente o al menos un nombre'] },
    }
  }

  const db = crearDb()
  try {
    const numero = await siguienteNumero(db)
    const [fila] = await db.insert(schema.presupuestos).values({
      numero,
      revision: 0,
      serie: 'A',
      fecha: new Date().toISOString().slice(0, 10),
      clienteCodigo: d.clienteCodigo,
      nombreLibre: d.nombreLibre,
      obraTexto: d.obraTexto,
      tarifa: d.tarifa,
      formaPago: d.formaPago,
      estado: 'PENDIENTE',
    }).returning({ id: schema.presupuestos.id })

    revalidatePath('/dashboard/presupuestos')
    return { ok: true, id: fila.id }
  } catch (e) {
    return { ok: false, errores: {}, mensaje: (e as Error).message }
  }
}

const esquemaLinea = z.object({
  presupuestoId: z.string().uuid(),
  tipo: z.enum(['ARTICULO', 'ESTRUCTURA']),
  codigo: z.string().trim().min(1, 'Elige un artículo o una estructura'),
  referencia: z.string().trim().max(60).optional().transform((v) => v || null),
  /** Serie de perfiles. Prerrequisito del tipo ESTRUCTURA: sin ella no hay
   * artículos reales, y sin artículos reales no hay precio. */
  serieCodigo: z.string().trim().optional().transform((v) => v || null),
  /** Vidrio del acristalamiento (familia 050, facturable por m²). Opcional:
   * sin él, el cristal queda "sin valorar". */
  vidrioCodigo: z.string().trim().optional().transform((v) => v || null),
  cantidad: z.coerce.number().positive().default(1),
  anchoMm: z.coerce.number().int().min(0).optional(),
  altoMm: z.coerce.number().int().min(0).optional(),
  acabadoCodigo: z.string().trim().optional().transform((v) => v || null),
})

/**
 * Añade una línea y la valora.
 *
 * ARTICULO   precio directo de la tarifa
 * ESTRUCTURA se calcula el despiece con las medidas y las cotas por defecto,
 *            y se suma el coste de todas las piezas
 */
export async function anyadirLinea(_previo: Estado, datos: FormData): Promise<Estado> {
  const p = esquemaLinea.safeParse(Object.fromEntries(datos))
  if (!p.success) return { ok: false, errores: p.error.flatten().fieldErrors }

  const d = p.data
  const db = crearDb()

  try {
    const [presupuesto] = await db.select()
      .from(schema.presupuestos)
      .where(eq(schema.presupuestos.id, d.presupuestoId)).limit(1)
    if (!presupuesto) return { ok: false, errores: {}, mensaje: 'Presupuesto no encontrado' }

    const [{ orden }] = (await db.execute<{ orden: number }>(sql`
      SELECT COALESCE(MAX(orden), 0) + 1 AS orden FROM lineas
      WHERE presupuesto_id = ${d.presupuestoId}
    `)) as unknown as { orden: number }[]

    let descripcion = d.codigo
    let precioUnitario: number | null = null
    let aviso: string | null = null

    /** Despiece resuelto a persistir en lineas_despiece (trazabilidad + coste). */
    let piezasAPersistir: {
      articuloCodigo: string
      cantidad: string
      largoCorteMm: string | null
      anchoCorteMm?: string | null
      anguloIzquierdo: string | null
      anguloDerecho: string | null
      funcion: string | null
      costeUnitario: string | null
      costeTotal: string | null
    }[] = []

    if (d.tipo === 'ARTICULO') {
      const [art] = await db.select()
        .from(schema.articulos).where(eq(schema.articulos.codigo, d.codigo)).limit(1)
      if (!art) return { ok: false, errores: { codigo: ['Artículo no encontrado'] } }
      descripcion = art.descripcion

      const precios = await db.select({ precio: schema.articulosPvp.precio })
        .from(schema.articulosPvp)
        .where(and(
          eq(schema.articulosPvp.articuloCodigo, d.codigo),
          eq(schema.articulosPvp.tarifa, presupuesto.tarifa),
          d.acabadoCodigo ? eq(schema.articulosPvp.acabadoCodigo, d.acabadoCodigo) : undefined,
        ))
        .limit(1)

      if (precios.length) precioUnitario = Number(precios[0].precio)
      else aviso = 'Importe incompleto: el artículo no tiene precio en esta tarifa.'
    } else {
      const [est] = await db.select()
        .from(schema.estructuras).where(eq(schema.estructuras.codigo, d.codigo)).limit(1)
      if (!est) return { ok: false, errores: { codigo: ['Estructura no encontrada'] } }
      descripcion = est.descripcion

      if (!d.anchoMm || !d.altoMm) {
        return { ok: false, errores: { anchoMm: ['Indica ancho y alto del hueco'] } }
      }

      // Regla heredada del original: "Indique Serie primero". Sin serie no hay
      // artículos reales, y sin artículos reales no hay precio.
      if (!d.serieCodigo) {
        return { ok: false, errores: { serieCodigo: ['Indique Serie primero'] } }
      }
      const [serie] = await db.select()
        .from(schema.series).where(eq(schema.series.codigo, d.serieCodigo)).limit(1)
      if (!serie) return { ok: false, errores: { serieCodigo: ['Serie no encontrada'] } }

      const plantilla = await db.select({
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
      }).from(schema.estructuraComponentes)
        .where(eq(schema.estructuraComponentes.estructuraCodigo, d.codigo))

      // --- Resolución genérico -> perfil real (PLAN.md anexo J) ---
      // Cadena de conjuntos de la serie (la tabla completa de delegaciones es
      // pequeña: ~700 filas) y resoluciones de esos conjuntos.
      const delegacionesFilas = await db.select({
        conjuntoCodigo: schema.conjuntoDelegaciones.conjuntoCodigo,
        delegadoCodigo: schema.conjuntoDelegaciones.delegadoCodigo,
      }).from(schema.conjuntoDelegaciones)
      const delegaciones = new Map<string, string[]>()
      for (const f of delegacionesFilas) {
        const lista = delegaciones.get(f.conjuntoCodigo) ?? []
        lista.push(f.delegadoCodigo)
        delegaciones.set(f.conjuntoCodigo, lista)
      }
      const cadena = expandirCadena(d.serieCodigo, delegaciones)
      const resolucionesFilas = await db.select({
        conjuntoCodigo: schema.conjuntoResoluciones.conjuntoCodigo,
        componente: schema.conjuntoResoluciones.componente,
        articuloCodigo: schema.conjuntoResoluciones.articuloCodigo,
      }).from(schema.conjuntoResoluciones)
        .where(inArray(schema.conjuntoResoluciones.conjuntoCodigo, cadena))
      const resoluciones = construirResoluciones(cadena, resolucionesFilas)

      // Qué artículos de la plantilla son ranuras genéricas (descripción
      // "(**…**)"): son los que DEBEN sustituirse para poder valorar.
      const codigosPlantilla = [...new Set(plantilla.map((c) => c.articuloCodigo))]
      const genericos = new Set(
        (codigosPlantilla.length
          ? await db.select({ codigo: schema.articulos.codigo })
              .from(schema.articulos)
              .where(and(
                inArray(schema.articulos.codigo, codigosPlantilla),
                sql`${schema.articulos.descripcion} LIKE '(**%'`,
              ))
          : []
        ).map((a) => a.codigo),
      )

      // La empresa monta doble cristal en el 100% del histórico; la variante
      // es una elección visible (se informa en el aviso si interviene).
      const VARIANTE = '2' as const
      let variantesAplicadas = 0
      const sinResolver = new Set<string>()

      const plantillaResuelta = plantilla.map((c) => {
        if (!c.componenteDisenyo) {
          if (genericos.has(c.articuloCodigo)) sinResolver.add(c.articuloCodigo)
          return c
        }
        const res = resolverComponente(c.componenteDisenyo, resoluciones, VARIANTE)
        if (res.articuloCodigo) {
          if (res.via === 'variante') variantesAplicadas++
          return { ...c, articuloCodigo: res.articuloCodigo }
        }
        if (genericos.has(c.articuloCodigo)) sinResolver.add(c.articuloCodigo)
        return c
      })

      const cotasFilas = await db.select({
        simbolo: schema.estructuraCotas.simbolo,
        valor: schema.estructuraCotas.valorPorDefecto,
      }).from(schema.estructuraCotas)
        .where(eq(schema.estructuraCotas.estructuraCodigo, d.codigo))

      const cotas: Record<string, number> = {}
      for (const c of cotasFilas) {
        cotas[c.simbolo] ??= Number(c.valor ?? 0)
      }

      const despiece = calcularDespiece(
        plantillaResuelta as ComponentePlantilla[],
        { anchoMm: d.anchoMm, altoMm: d.altoMm },
        cotas,
      )

      // Valoración: precios de los artículos que componen el despiece
      const codigos = [...new Set(despiece.piezas.map((x) => x.articuloCodigo))]
      const arts = codigos.length
        ? await db.select({
            codigo: schema.articulos.codigo,
            tipoMetraje: schema.articulos.tipoMetraje,
            metrajeMinimo: schema.articulos.metrajeMinimo,
            metrajeMultiploLargo: schema.articulos.metrajeMultiploLargo,
            precio: sql<string | null>`(
              SELECT p.precio FROM articulos_pvp p
              WHERE p.articulo_codigo = ${schema.articulos.codigo}
                AND p.tarifa = ${presupuesto.tarifa}
              ORDER BY (p.acabado_codigo = ${d.acabadoCodigo ?? ''}) DESC, p.acabado_codigo
              LIMIT 1
            )`,
          }).from(schema.articulos).where(inArray(schema.articulos.codigo, codigos))
        : []

      const mapa = new Map<string, DatosArticuloPrecio>(
        arts.map((a) => [a.codigo, {
          codigo: a.codigo,
          tipoMetraje: a.tipoMetraje,
          precio: a.precio === null ? null : Number(a.precio),
          metrajeMinimo: a.metrajeMinimo === null ? null : Number(a.metrajeMinimo),
          metrajeMultiploLargo: a.metrajeMultiploLargo === null ? null : Number(a.metrajeMultiploLargo),
        }]),
      )

      const valoracion = valorarDespiece(despiece.piezas, mapa)
      precioUnitario = valoracion.importe

      // --- Coste real por pieza, para persistir el despiece con trazabilidad ---
      // El coste depende del acabado. Si la línea no fija acabado y el
      // artículo tiene costes distintos por acabado, se deja null: un coste
      // ambiguo no se adivina.
      const costes = codigos.length
        ? await db.select({
            articuloCodigo: schema.articulosCoste.articuloCodigo,
            acabadoCodigo: schema.articulosCoste.acabadoCodigo,
            coste: schema.articulosCoste.coste,
          }).from(schema.articulosCoste)
            .where(inArray(schema.articulosCoste.articuloCodigo, codigos))
        : []
      const costePorArticulo = new Map<string, number | null>()
      {
        const porArt = new Map<string, Map<string, number>>()
        for (const c of costes) {
          let m = porArt.get(c.articuloCodigo)
          if (!m) porArt.set(c.articuloCodigo, (m = new Map()))
          const v = Number(c.coste)
          if (!m.has(c.acabadoCodigo)) m.set(c.acabadoCodigo, v)
        }
        for (const [art, porAcabado] of porArt) {
          if (d.acabadoCodigo && porAcabado.has(d.acabadoCodigo)) {
            costePorArticulo.set(art, porAcabado.get(d.acabadoCodigo)!)
            continue
          }
          const distintos = new Set(porAcabado.values())
          costePorArticulo.set(art, distintos.size === 1 ? [...distintos][0] : null)
        }
      }

      piezasAPersistir = despiece.piezas.map((pz) => {
        const art = mapa.get(pz.articuloCodigo)
        const coste = costePorArticulo.get(pz.articuloCodigo) ?? null
        let costeTotal: number | null = null
        if (coste !== null) {
          if (art?.tipoMetraje === 'ML') {
            costeTotal = pz.largoMm !== null ? coste * (pz.largoMm / 1000) * pz.cantidad : null
          } else {
            costeTotal = coste * pz.cantidad
          }
        }
        return {
          articuloCodigo: pz.articuloCodigo,
          cantidad: String(pz.cantidad),
          largoCorteMm: pz.largoMm !== null ? String(pz.largoMm) : null,
          anguloIzquierdo: pz.anguloIzquierdo !== null ? String(pz.anguloIzquierdo) : null,
          anguloDerecho: pz.anguloDerecho !== null ? String(pz.anguloDerecho) : null,
          funcion: pz.funcion,
          costeUnitario: coste !== null ? String(coste) : null,
          costeTotal: costeTotal !== null ? String(Math.round(costeTotal * 10000) / 10000) : null,
        }
      })

      // --- Vidrio (PLAN.md anexo L) ---
      // medida = corte de hoja − delta medido del histórico; metraje con
      // múltiplos (cm) y mínimo del artículo; precio por m² de la tarifa.
      // Cualquier ambigüedad -> "vidrio sin calcular", nunca un precio a ojo.
      let avisoVidrio: string | null = null
      /** Medidas del vidrio si se pudieron calcular (para junquillos/juntas). */
      let dimsVidrio: { largoMm: number; anchoMm: number } | null = null
      let tamJunqVidrio = 0
      /** HOJA = vidrio alojado en hojas; FIJO = en cerco fijo. */
      let contextoVidrio: 'HOJA' | 'FIJO' | null = null
      if (d.vidrioCodigo) {
        const [vidrio] = await db.select()
          .from(schema.articulos).where(eq(schema.articulos.codigo, d.vidrioCodigo)).limit(1)
        if (!vidrio || vidrio.familiaCodigo !== '050' || vidrio.tipoMetraje !== 'M2') {
          return { ok: false, errores: { vidrioCodigo: ['Vidrio no válido (debe ser familia 050, facturable por m²)'] } }
        }

        // Emparejamiento inequívoco del vidrio con su alojamiento:
        //  - con hojas (HV/HH): vidrio de HOJA, descontado del corte de hoja
        //  - sin hojas: vidrio de FIJO, descontado del corte del CERCO (MV/MH)
        const hvs = despiece.piezas.filter((pz) => pz.funcion === 'HV' && pz.largoMm !== null)
        const nCristales = plantillaResuelta.filter((c) => c.componenteDisenyo === '1').length

        let perfilRef: string | null = null
        let corteV: number | null = null
        let corteH: number | null = null
        if (hvs.length > 0) {
          contextoVidrio = 'HOJA'
          const artsHV = new Set(hvs.map((pz) => pz.articuloCodigo))
          const cortesHV = new Set(hvs.map((pz) => pz.largoMm))
          perfilRef = artsHV.size === 1 ? [...artsHV][0] : null
          const cortesHH = new Set(
            despiece.piezas
              .filter((pz) => pz.funcion === 'HH' && pz.articuloCodigo === perfilRef && pz.largoMm !== null)
              .map((pz) => pz.largoMm),
          )
          // Un cristal por hoja: si la estructura mezcla hojas y fijos, el
          // recuento no cuadra y NO se extrapola el vidrio de hoja a los
          // fijos (sería un precio inventado para esos huecos).
          const nHojas = Math.round(hvs.reduce((acc, pz) => acc + pz.cantidad, 0) / 2)
          if (perfilRef && cortesHV.size === 1 && cortesHH.size === 1 && nCristales === nHojas) {
            corteV = [...cortesHV][0]
            corteH = [...cortesHH][0]
          }
        } else {
          contextoVidrio = 'FIJO'
          const mvs = despiece.piezas.filter((pz) => pz.funcion === 'MV' && pz.largoMm !== null)
          const artsMV = new Set(mvs.map((pz) => pz.articuloCodigo))
          const cortesMV = new Set(mvs.map((pz) => pz.largoMm))
          const cortesMH = new Set(
            despiece.piezas.filter((pz) => pz.funcion === 'MH' && pz.largoMm !== null).map((pz) => pz.largoMm),
          )
          perfilRef = artsMV.size === 1 ? [...artsMV][0] : null
          if (perfilRef && cortesMV.size === 1 && cortesMH.size === 1) {
            corteV = [...cortesMV][0]
            corteH = [...cortesMH][0]
          }
        }

        if (!perfilRef || corteV === null || corteH === null || nCristales === 0) {
          avisoVidrio = 'vidrio sin calcular: emparejamiento ambiguo para esta estructura (¿mezcla hojas y fijos?)'
          contextoVidrio = null
        } else {
          const tablaGalce = contextoVidrio === 'FIJO' ? schema.vidrioGalceFijo : schema.vidrioGalce
          const [galce] = await db.select()
            .from(tablaGalce)
            .where(and(
              eq(tablaGalce.serieCodigo, d.serieCodigo),
              eq(tablaGalce.perfilCodigo, perfilRef),
            )).limit(1)
          if (!galce) {
            avisoVidrio = `vidrio sin calcular: sin descuento de galce medido para ${d.serieCodigo} + ${perfilRef} (${contextoVidrio.toLowerCase()})`
          } else {
            const dims = medidasVidrio(corteV, corteH, Number(galce.deltaMm))
            if (!dims) {
              avisoVidrio = 'vidrio sin calcular: el descuento de galce no cabe en la medida'
            } else {
              dimsVidrio = dims
              tamJunqVidrio = Number((vidrio.tamJunquilloGoma ?? '').replace(',', '.')) || 0
              const metraje = metrajeVidrioM2(dims.largoMm, dims.anchoMm, {
                metrajeMinimo: vidrio.metrajeMinimo === null ? null : Number(vidrio.metrajeMinimo),
                multiploLargoCm: vidrio.metrajeMultiploLargo === null ? null : Number(vidrio.metrajeMultiploLargo),
                multiploAnchoCm: vidrio.metrajeMultiploAncho === null ? null : Number(vidrio.metrajeMultiploAncho),
              })
              const [pvpVidrio] = (await db.execute<{ precio: string }>(sql`
                SELECT precio FROM articulos_pvp
                WHERE articulo_codigo = ${d.vidrioCodigo} AND tarifa = ${presupuesto.tarifa}
                ORDER BY (acabado_codigo = ${d.acabadoCodigo ?? ''}) DESC,
                         (acabado_codigo = '*') DESC, acabado_codigo
                LIMIT 1
              `)) as unknown as { precio: string }[]
              if (!pvpVidrio) {
                avisoVidrio = `vidrio sin valorar: ${d.vidrioCodigo} no tiene precio en la tarifa ${presupuesto.tarifa}`
              } else {
                const importeVidrio = nCristales * metraje * Number(pvpVidrio.precio)
                precioUnitario = Math.round((precioUnitario + importeVidrio) * 100) / 100

                const [costeVidrio] = (await db.execute<{ coste: string }>(sql`
                  SELECT coste FROM articulos_coste
                  WHERE articulo_codigo = ${d.vidrioCodigo}
                  ORDER BY (acabado_codigo = ${d.acabadoCodigo ?? ''}) DESC,
                           (acabado_codigo = '*') DESC, acabado_codigo
                  LIMIT 1
                `)) as unknown as { coste: string }[]
                const costeM2 = costeVidrio ? Number(costeVidrio.coste) : null
                piezasAPersistir.push({
                  articuloCodigo: d.vidrioCodigo,
                  cantidad: String(nCristales),
                  largoCorteMm: String(dims.largoMm),
                  anchoCorteMm: String(dims.anchoMm),
                  anguloIzquierdo: null,
                  anguloDerecho: null,
                  funcion: 'VIDRIO',
                  costeUnitario: costeM2 !== null ? String(costeM2) : null,
                  costeTotal: costeM2 !== null
                    ? String(Math.round(costeM2 * metraje * nCristales * 10000) / 10000)
                    : null,
                })
              }
            }
          }
        }
      }

      // --- Junquillos y juntas por grosor del vidrio (PLAN.md anexo M) ---
      // La TablaHojas de la serie da, para el menor grosor >= TamJunqGoma del
      // vidrio, el junquillo y las juntas. Longitudes: juntas = dimensiones
      // del módulo del cristal (fórmulas de la ranura); junquillo = medida
      // del vidrio + ajuste MEDIDO del histórico. Artículos fuera del
      // catálogo (marcador V1000 "sin junquillos") no generan pieza.
      let avisoAcris: string | null = null
      if (dimsVidrio && contextoVidrio) {
        const [cjSerie] = await db.select({
          tablaHojas: schema.conjuntos.tablaHojas,
          tablaFijos: schema.conjuntos.tablaFijos,
        }).from(schema.conjuntos).where(eq(schema.conjuntos.codigo, d.serieCodigo)).limit(1)
        const tablaAcris = (contextoVidrio === 'FIJO' ? cjSerie?.tablaFijos : cjSerie?.tablaHojas) || null
        const [filaAcris] = tablaAcris && tamJunqVidrio > 0
          ? await db.select().from(schema.tacrisFilas)
              .where(and(
                eq(schema.tacrisFilas.tabla, tablaAcris),
                gte(schema.tacrisFilas.grosor, String(tamJunqVidrio)),
              ))
              .orderBy(asc(schema.tacrisFilas.grosor)).limit(1)
          : []

        if (!filaAcris) {
          avisoAcris = 'junquillos/juntas sin calcular: sin tabla de acristalamiento aplicable'
        } else {
          // Dimensiones del módulo de cada ranura de cristal, por sus fórmulas
          const contexto = { L: d.anchoMm, A: d.altoMm, ...cotas }
          const modulos: { l: number; a: number }[] = []
          for (const c of plantillaResuelta.filter((x) => x.componenteDisenyo === '1')) {
            try {
              const l = c.formulaLargo ? evaluar(c.formulaLargo, contexto) : NaN
              const a = c.formulaAncho ? evaluar(c.formulaAncho, contexto) : NaN
              if (Number.isFinite(l) && Number.isFinite(a) && l > 0 && a > 0) modulos.push({ l, a })
            } catch { /* fórmula no evaluable: cuenta como módulo ausente */ }
          }
          const tablaAjustes = contextoVidrio === 'FIJO' ? schema.junquilloAjustesFijo : schema.junquilloAjustes
          const [ajuste] = await db.select().from(tablaAjustes)
            .where(eq(tablaAjustes.serieCodigo, d.serieCodigo)).limit(1)

          const piezasAcris: PiezaCortada[] = []
          const anyadir = (articulo: string | null, largoMm: number, funcion: string) => {
            if (!articulo || largoMm <= 0) return
            piezasAcris.push({
              articuloCodigo: articulo, cantidad: 2, largoMm: Math.round(largoMm * 100) / 100,
              formula: null, tipoCorte: null, anguloIzquierdo: null, anguloDerecho: null,
              funcion, incidencia: null,
            })
          }
          for (const m of modulos) {
            anyadir(filaAcris.juntaExterior, m.l, 'JEXT')
            anyadir(filaAcris.juntaExterior, m.a, 'JEXT')
            anyadir(filaAcris.juntaInterior, m.l, 'JINT')
            anyadir(filaAcris.juntaInterior, m.a, 'JINT')
            if (filaAcris.junquillo && ajuste) {
              anyadir(filaAcris.junquillo, dimsVidrio.largoMm + Number(ajuste.ajusteLargoMm), 'JUNQ')
              anyadir(filaAcris.junquillo, dimsVidrio.anchoMm + Number(ajuste.ajusteAnchoMm), 'JUNQ')
            }
          }
          if (modulos.length === 0) {
            avisoAcris = 'juntas sin calcular: fórmulas del módulo de cristal no evaluables'
          } else if (filaAcris.junquillo && !ajuste) {
            avisoAcris = `junquillo sin calcular: sin ajuste medido para la serie ${d.serieCodigo}`
          }

          if (piezasAcris.length) {
            const codigosAcris = [...new Set(piezasAcris.map((p) => p.articuloCodigo))]
            const artsAcris = await db.select({
              codigo: schema.articulos.codigo,
              tipoMetraje: schema.articulos.tipoMetraje,
              metrajeMinimo: schema.articulos.metrajeMinimo,
              metrajeMultiploLargo: schema.articulos.metrajeMultiploLargo,
              precio: sql<string | null>`(
                SELECT p.precio FROM articulos_pvp p
                WHERE p.articulo_codigo = ${schema.articulos.codigo}
                  AND p.tarifa = ${presupuesto.tarifa}
                ORDER BY (p.acabado_codigo = ${d.acabadoCodigo ?? ''}) DESC,
                         (p.acabado_codigo = '*') DESC, p.acabado_codigo
                LIMIT 1
              )`,
            }).from(schema.articulos).where(inArray(schema.articulos.codigo, codigosAcris))
            const mapaAcris = new Map<string, DatosArticuloPrecio>(
              artsAcris.map((a) => [a.codigo, {
                codigo: a.codigo,
                tipoMetraje: a.tipoMetraje,
                precio: a.precio === null ? null : Number(a.precio),
                metrajeMinimo: a.metrajeMinimo === null ? null : Number(a.metrajeMinimo),
                metrajeMultiploLargo: a.metrajeMultiploLargo === null ? null : Number(a.metrajeMultiploLargo),
              }]),
            )
            // El marcador "sin junquillos" no existe en el catálogo: se omite.
            const valorables = piezasAcris.filter((p) => mapaAcris.has(p.articuloCodigo))
            const valAcris = valorarDespiece(valorables, mapaAcris)
            precioUnitario = Math.round((precioUnitario + valAcris.importe) * 100) / 100
            if (valAcris.sinPrecio.length) {
              avisoAcris = `${valAcris.sinPrecio.length} artículos de acristalamiento sin precio en la tarifa`
            }

            const costesAcris = await db.select({
              articuloCodigo: schema.articulosCoste.articuloCodigo,
              acabadoCodigo: schema.articulosCoste.acabadoCodigo,
              coste: schema.articulosCoste.coste,
            }).from(schema.articulosCoste)
              .where(inArray(schema.articulosCoste.articuloCodigo, codigosAcris))
            const costeAcris = new Map<string, number | null>()
            {
              const porArt = new Map<string, Map<string, number>>()
              for (const c of costesAcris) {
                let m = porArt.get(c.articuloCodigo)
                if (!m) porArt.set(c.articuloCodigo, (m = new Map()))
                if (!m.has(c.acabadoCodigo)) m.set(c.acabadoCodigo, Number(c.coste))
              }
              for (const [art, porAcabado] of porArt) {
                if (d.acabadoCodigo && porAcabado.has(d.acabadoCodigo)) {
                  costeAcris.set(art, porAcabado.get(d.acabadoCodigo)!)
                  continue
                }
                const distintos = new Set(porAcabado.values())
                costeAcris.set(art, distintos.size === 1 ? [...distintos][0] : null)
              }
            }
            for (const pz of valorables) {
              const coste = costeAcris.get(pz.articuloCodigo) ?? null
              const esML = mapaAcris.get(pz.articuloCodigo)?.tipoMetraje === 'ML'
              const costeTotal = coste !== null && pz.largoMm !== null
                ? (esML ? coste * (pz.largoMm / 1000) * pz.cantidad : coste * pz.cantidad)
                : null
              piezasAPersistir.push({
                articuloCodigo: pz.articuloCodigo,
                cantidad: String(pz.cantidad),
                largoCorteMm: pz.largoMm !== null ? String(pz.largoMm) : null,
                anguloIzquierdo: null,
                anguloDerecho: null,
                funcion: pz.funcion,
                costeUnitario: coste !== null ? String(coste) : null,
                costeTotal: costeTotal !== null ? String(Math.round(costeTotal * 10000) / 10000) : null,
              })
            }
          }
        }
      }

      const problemas: string[] = []
      if (avisoVidrio) problemas.push(avisoVidrio)
      if (avisoAcris) problemas.push(avisoAcris)
      if (!d.vidrioCodigo) problemas.push('sin vidrio elegido: el acristalamiento no se valora')
      if (sinResolver.size) {
        problemas.push(
          `${sinResolver.size} ranuras genéricas que la serie ${d.serieCodigo} no resuelve (quedan sin valorar)`,
        )
      }
      if (despiece.incalculables > 0) {
        problemas.push(
          `${despiece.incalculables} piezas sin medida` +
          (despiece.variablesFaltantes.length ? ` (faltan ${despiece.variablesFaltantes.join(', ')})` : ''),
        )
      }
      if (valoracion.sinPrecio.length) {
        problemas.push(`${valoracion.sinPrecio.length} artículos sin precio en la tarifa`)
      }
      if (problemas.length) {
        // Un importe parcial no es el precio de la estructura. Se conserva el
        // despiece para trazabilidad, pero la línea queda sin valorar.
        precioUnitario = null
        aviso = `Importe incompleto: ${problemas.join('; ')}.`
      }
      else if (variantesAplicadas > 0) {
        aviso = `Valorado con variante de doble cristal en ${variantesAplicadas} componentes (el criterio de la empresa).`
      }
    }

    const total = precioUnitario === null
      ? null
      : Math.round(precioUnitario * d.cantidad * 100) / 100

    await db.insert(schema.lineas).values({
      presupuestoId: d.presupuestoId,
      orden,
      tipo: d.tipo,
      articuloCodigo: d.tipo === 'ARTICULO' ? d.codigo : null,
      descripcion,
      referencia: d.referencia,
      cantidad: String(d.cantidad),
      anchoMm: d.anchoMm ?? null,
      altoMm: d.altoMm ?? null,
      precioUnitario: precioUnitario === null ? null : String(precioUnitario),
      total: total === null ? null : String(total),
      valoracionCompleta: precioUnitario !== null,
      avisoValoracion: aviso,
    })

    if (d.tipo === 'ESTRUCTURA') {
      const [linea] = await db.select({ id: schema.lineas.id })
        .from(schema.lineas)
        .where(and(
          eq(schema.lineas.presupuestoId, d.presupuestoId),
          eq(schema.lineas.orden, orden),
        )).limit(1)

      if (linea) {
        await db.insert(schema.lineasEstructura).values({
          lineaId: linea.id,
          serieCodigo: d.serieCodigo ?? '',
          estructuraCodigo: d.codigo,
          acabadoCodigo: d.acabadoCodigo,
        })

        if (piezasAPersistir.length) {
          await db.insert(schema.lineasDespiece).values(
            piezasAPersistir.map((pz) => ({ lineaId: linea.id, ...pz })),
          )
        }

        if (d.vidrioCodigo) {
          await db.insert(schema.lineasAcristalamiento).values({
            lineaId: linea.id,
            slot: 1,
            vidrioHojas: d.vidrioCodigo,
          })
        }
      }
    }

    await recalcularTotales(d.presupuestoId)
    revalidatePath(`/dashboard/presupuestos/${d.presupuestoId}`)

    return aviso
      ? { ok: false, errores: {}, mensaje: aviso }
      : { ok: true, id: d.presupuestoId }
  } catch (e) {
    return { ok: false, errores: {}, mensaje: (e as Error).message }
  }
}

export async function borrarLinea(lineaId: string, presupuestoId: string) {
  const db = crearDb()
  await db.delete(schema.lineas).where(eq(schema.lineas.id, lineaId))
  await recalcularTotales(presupuestoId)
  revalidatePath(`/dashboard/presupuestos/${presupuestoId}`)
}

/**
 * Recalcula los totales desde las líneas.
 *
 * Se hace en SQL, en una sola sentencia: si se hiciera leyendo y escribiendo
 * desde la aplicación, dos usuarios editando a la vez dejarían el documento
 * descuadrado.
 */
export async function recalcularTotales(presupuestoId: string) {
  const db = crearDb()
  await db.execute(sql`
    UPDATE presupuestos p SET
      subtotal       = t.suma,
      base_imponible = t.suma,
      cuota_iva      = ROUND(t.suma * p.tipo_iva / 100, 2),
      total          = t.suma + ROUND(t.suma * p.tipo_iva / 100, 2)
    FROM (
      SELECT COALESCE(SUM(total), 0) AS suma FROM lineas WHERE presupuesto_id = ${presupuestoId}
    ) t
    WHERE p.id = ${presupuestoId}
  `)
}
