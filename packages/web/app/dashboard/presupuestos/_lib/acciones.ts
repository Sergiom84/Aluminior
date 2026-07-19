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
import {
  calcularDespiece, evaluar, calcularVidriosPorAlojamiento,
  type ComponentePlantilla, type PiezaCortada, type NodoDisenyo,
} from '@aluminior/core/despiece'
import {
  valorarDespiece, medidasVidrio, metrajeVidrioM2, type DatosArticuloPrecio,
} from '@aluminior/core/precios'
import { expandirCadena, construirResoluciones, resolverComponente } from '@aluminior/core/series'

export type Estado =
  | { ok: true; id: string }
  | { ok: false; errores: Record<string, string[]>; mensaje?: string }
  | null

interface CristalAcris {
  slot: number
  contexto: 'HOJA' | 'FIJO'
  largoMm: number
  anchoMm: number
  moduloLargoMm: number
  moduloAnchoMm: number
}

async function piezasAcristalamiento(
  db: ReturnType<typeof crearDb>,
  serieCodigo: string,
  tamJunquillo: number,
  cristales: CristalAcris[],
): Promise<{ piezas: PiezaCortada[]; avisos: string[] }> {
  const [conjunto] = await db.select({
    tablaHojas: schema.conjuntos.tablaHojas,
    tablaFijos: schema.conjuntos.tablaFijos,
  }).from(schema.conjuntos).where(eq(schema.conjuntos.codigo, serieCodigo)).limit(1)
  const piezas: PiezaCortada[] = []
  const avisos: string[] = []
  const anyadir = (articulo: string | null, largoMm: number, funcion: string) => {
    if (!articulo || largoMm <= 0) return
    piezas.push({
      articuloCodigo: articulo, cantidad: 2, largoMm: Math.round(largoMm * 100) / 100,
      formula: null, tipoCorte: null, anguloIzquierdo: null, anguloDerecho: null,
      funcion, incidencia: null,
    })
  }
  for (const cristal of cristales) {
    const tabla = (cristal.contexto === 'FIJO' ? conjunto?.tablaFijos : conjunto?.tablaHojas) || null
    const [fila] = tabla && tamJunquillo > 0
      ? await db.select().from(schema.tacrisFilas)
          .where(and(eq(schema.tacrisFilas.tabla, tabla), gte(schema.tacrisFilas.grosor, String(tamJunquillo))))
          .orderBy(asc(schema.tacrisFilas.grosor)).limit(1)
      : []
    if (!fila) {
      avisos.push(`ranura ${cristal.slot}: sin tabla de acristalamiento aplicable`)
      continue
    }
    const tablaAjustes = cristal.contexto === 'FIJO' ? schema.junquilloAjustesFijo : schema.junquilloAjustes
    const [ajuste] = await db.select().from(tablaAjustes)
      .where(eq(tablaAjustes.serieCodigo, serieCodigo)).limit(1)
    anyadir(fila.juntaExterior, cristal.moduloLargoMm, 'JEXT')
    anyadir(fila.juntaExterior, cristal.moduloAnchoMm, 'JEXT')
    anyadir(fila.juntaInterior, cristal.moduloLargoMm, 'JINT')
    anyadir(fila.juntaInterior, cristal.moduloAnchoMm, 'JINT')
    if (fila.junquillo && ajuste) {
      anyadir(fila.junquillo, cristal.largoMm + Number(ajuste.ajusteLargoMm), 'JUNQ')
      anyadir(fila.junquillo, cristal.anchoMm + Number(ajuste.ajusteAnchoMm), 'JUNQ')
    } else if (fila.junquillo) {
      avisos.push(`ranura ${cristal.slot}: sin ajuste medido de junquillo ${cristal.contexto.toLowerCase()}`)
    }
  }
  return { piezas, avisos }
}

export interface GrupoOpcionesHerraje {
  conjuntoCodigo: string
  opciones: { codigo: string; descripcion: string; porDefecto: boolean }[]
}

/**
 * Opciones de herraje aplicables a una (serie, estructura).
 *
 * El juego de conjuntos sale de `herraje_conjuntos`, MEDIDO del histórico
 * (≥3 muestras, ≥90% de consistencia). Sin regla medida devuelve null y el
 * configurador no ofrece opciones: no se adivina qué herraje lleva una
 * combinación que la empresa nunca ha fabricado.
 *
 * Las opciones ocultas (el original no las muestra) se excluyen de la
 * interfaz pero sus defaults sí se persisten al añadir la línea.
 */
export async function opcionesHerrajeDe(
  serieCodigo: string, estructuraCodigo: string,
): Promise<GrupoOpcionesHerraje[] | null> {
  if (!serieCodigo || !estructuraCodigo) return null
  const db = crearDb()
  const [regla] = await db.select({ conjuntos: schema.herrajeConjuntos.conjuntos })
    .from(schema.herrajeConjuntos)
    .where(and(
      eq(schema.herrajeConjuntos.serieCodigo, serieCodigo),
      eq(schema.herrajeConjuntos.estructuraCodigo, estructuraCodigo),
    )).limit(1)
  if (!regla) return null

  const codigos = regla.conjuntos.split('+')
  const filas = await db.select()
    .from(schema.opcionesHerraje)
    .where(inArray(schema.opcionesHerraje.conjuntoCodigo, codigos))

  const grupos: GrupoOpcionesHerraje[] = []
  for (const conjuntoCodigo of codigos) {
    const opciones = filas
      .filter((f) => f.conjuntoCodigo === conjuntoCodigo && !f.oculta)
      .sort((a, b) => Number(a.opcionCodigo) - Number(b.opcionCodigo))
      .map((f) => ({ codigo: f.opcionCodigo, descripcion: f.descripcion, porDefecto: f.porDefecto }))
    if (opciones.length) grupos.push({ conjuntoCodigo, opciones })
  }
  return grupos.length ? grupos : null
}

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
  varianteAcristalamiento: z.enum(['1', '2']).default('2'),
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
    let acristalamientoAPersistir: {
      slot: number
      vidrioHojas: string | null
      vidrioFijos: string | null
      variante: '1' | '2'
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
        idItemDisenyo: schema.estructuraComponentes.idItemDisenyo,
        grupoDisenyo: schema.estructuraComponentes.grupoDisenyo,
        tipoHojaDisenyo: schema.estructuraComponentes.tipoHojaDisenyo,
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
      const VARIANTE = d.varianteAcristalamiento
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
      let cristalesAcris: CristalAcris[] = []
      let avisoAcris: string | null = null
      if (d.vidrioCodigo) {
        const [vidrio] = await db.select()
          .from(schema.articulos).where(eq(schema.articulos.codigo, d.vidrioCodigo)).limit(1)
        if (!vidrio || vidrio.familiaCodigo !== '050' || vidrio.tipoMetraje !== 'M2') {
          return { ok: false, errores: { vidrioCodigo: ['Vidrio no válido (debe ser familia 050, facturable por m²)'] } }
        }
        const ranuras = plantillaResuelta.filter((c) => c.componenteDisenyo === '1')
        acristalamientoAPersistir = ranuras.map((r, i) => ({
          slot: i + 1,
          vidrioHojas: r.tipoHojaDisenyo === -1 ? null : d.vidrioCodigo,
          vidrioFijos: r.tipoHojaDisenyo === -1 ? d.vidrioCodigo : null,
          variante: d.varianteAcristalamiento,
        }))
        const tipos = new Set(ranuras.map((r) => r.tipoHojaDisenyo === -1 ? 'FIJO' : 'HOJA'))
        const esMixta = tipos.size > 1
        tamJunqVidrio = Number((vidrio.tamJunquilloGoma ?? '').replace(',', '.')) || 0

        if (esMixta) {
          const nodosFilas = await db.select().from(schema.estructuraDisenoNodos)
            .where(eq(schema.estructuraDisenoNodos.estructuraCodigo, d.codigo))
          const nodos = new Map<number, NodoDisenyo>(nodosFilas.map((n) => [n.idItem, {
            idItem: n.idItem, tipo: n.tipo, contenidoEn: n.contenidoEn,
            idTravesano: n.idTravesano, posicionHueco: n.posicionHueco,
            tipoTravesano: n.tipoTravesano, invisible: n.invisible,
          }]))
          const reglasFilas = await db.select().from(schema.vidrioDescuentosAlojamiento)
          const calculo = calcularVidriosPorAlojamiento(
            ranuras.map((r) => ({
              idItemDisenyo: r.idItemDisenyo,
              formulaLargo: r.formulaLargo,
              formulaAncho: r.formulaAncho,
            })),
            { L: d.anchoMm, A: d.altoMm, ...cotas }, nodos,
            despiece.piezas.filter((pieza) => !genericos.has(pieza.articuloCodigo)),
            reglasFilas.map((r) => ({
              eje: r.eje as 'L' | 'A', limite1: r.limite1, limite2: r.limite2,
              perfilHoja: r.perfilHoja, deltaMm: Number(r.deltaMm),
            })),
          )
          if (!calculo.ok) {
            avisoVidrio = `vidrio sin calcular: ranura ${calculo.slot}, ${calculo.motivo}`
          } else {
            cristalesAcris = calculo.vidrios
            const opcionesMetraje = {
              metrajeMinimo: vidrio.metrajeMinimo === null ? null : Number(vidrio.metrajeMinimo),
              multiploLargoCm: vidrio.metrajeMultiploLargo === null ? null : Number(vidrio.metrajeMultiploLargo),
              multiploAnchoCm: vidrio.metrajeMultiploAncho === null ? null : Number(vidrio.metrajeMultiploAncho),
            }
            const metrajes = calculo.vidrios.map((v) => metrajeVidrioM2(v.largoMm, v.anchoMm, opcionesMetraje))
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
              precioUnitario = Math.round((precioUnitario + metrajes.reduce((a, b) => a + b, 0) * Number(pvpVidrio.precio)) * 100) / 100
              const [costeVidrio] = (await db.execute<{ coste: string }>(sql`
                SELECT coste FROM articulos_coste WHERE articulo_codigo = ${d.vidrioCodigo}
                ORDER BY (acabado_codigo = ${d.acabadoCodigo ?? ''}) DESC,
                         (acabado_codigo = '*') DESC, acabado_codigo LIMIT 1
              `)) as unknown as { coste: string }[]
              const costeM2 = costeVidrio ? Number(costeVidrio.coste) : null
              for (let i = 0; i < calculo.vidrios.length; i++) {
                const v = calculo.vidrios[i]
                piezasAPersistir.push({
                  articuloCodigo: d.vidrioCodigo, cantidad: '1',
                  largoCorteMm: String(v.largoMm), anchoCorteMm: String(v.anchoMm),
                  anguloIzquierdo: null, anguloDerecho: null, funcion: 'VIDRIO',
                  costeUnitario: costeM2 === null ? null : String(costeM2),
                  costeTotal: costeM2 === null ? null : String(Math.round(costeM2 * metrajes[i] * 10000) / 10000),
                })
              }
            }
          }
        } else {

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
              const contextoModulo = { L: d.anchoMm, A: d.altoMm, ...cotas }
              cristalesAcris = ranuras.flatMap((r, i) => {
                try {
                  if (!r.formulaLargo || !r.formulaAncho) return []
                  return [{
                    slot: i + 1, contexto: contextoVidrio!, largoMm: dims.largoMm, anchoMm: dims.anchoMm,
                    moduloLargoMm: evaluar(r.formulaLargo, contextoModulo),
                    moduloAnchoMm: evaluar(r.formulaAncho, contextoModulo),
                  }]
                } catch { return [] }
              })
              if (cristalesAcris.length !== ranuras.length) {
                avisoAcris = 'junquillos/juntas sin calcular: fórmulas de módulo incompletas'
              }
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
      }

      // --- Junquillos y juntas por grosor del vidrio (PLAN.md anexo M) ---
      // La TablaHojas de la serie da, para el menor grosor >= TamJunqGoma del
      // vidrio, el junquillo y las juntas. Longitudes: juntas = dimensiones
      // del módulo del cristal (fórmulas de la ranura); junquillo = medida
      // del vidrio + ajuste MEDIDO del histórico. Artículos fuera del
      // catálogo (marcador V1000 "sin junquillos") no generan pieza.
      if (cristalesAcris.length) {
          const calculoAcris = await piezasAcristalamiento(db, d.serieCodigo, tamJunqVidrio, cristalesAcris)
          const piezasAcris = calculoAcris.piezas
          if (calculoAcris.avisos.length) {
            avisoAcris = `junquillos/juntas sin calcular: ${calculoAcris.avisos.join('; ')}`
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
        const nombreVariante = VARIANTE === '2' ? 'doble' : 'sencillo'
        aviso = `Valorado con variante de cristal ${nombreVariante} en ${variantesAplicadas} componentes.`
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

        if (acristalamientoAPersistir.length) {
          await db.insert(schema.lineasAcristalamiento).values(
            acristalamientoAPersistir.map((a) => ({ lineaId: linea.id, ...a })),
          )
        }

        // --- Opciones de herraje elegidas (anexo R) ---
        // Se persisten para trazabilidad y para la futura selección de
        // asociados; hoy no afectan a la valoración. Solo se aceptan
        // opciones del catálogo de los conjuntos medidos para esta
        // (serie, estructura); las ocultas entran con su default.
        const [reglaHerraje] = await db.select({ conjuntos: schema.herrajeConjuntos.conjuntos })
          .from(schema.herrajeConjuntos)
          .where(and(
            eq(schema.herrajeConjuntos.serieCodigo, d.serieCodigo ?? ''),
            eq(schema.herrajeConjuntos.estructuraCodigo, d.codigo),
          )).limit(1)
        if (reglaHerraje) {
          const catalogo = await db.select()
            .from(schema.opcionesHerraje)
            .where(inArray(schema.opcionesHerraje.conjuntoCodigo, reglaHerraje.conjuntos.split('+')))
          const porClave = new Map(catalogo.map((f) => [`${f.conjuntoCodigo}|${f.opcionCodigo}`, f]))
          const elegidas = new Map<string, typeof catalogo[number]>()
          for (const v of datos.getAll('opcionHerraje')) {
            const fila = porClave.get(String(v))
            if (fila && !fila.oculta) elegidas.set(`${fila.conjuntoCodigo}|${fila.opcionCodigo}`, fila)
          }
          for (const fila of catalogo) {
            if (fila.oculta && fila.porDefecto) {
              elegidas.set(`${fila.conjuntoCodigo}|${fila.opcionCodigo}`, fila)
            }
          }
          if (elegidas.size) {
            await db.insert(schema.lineasOpcionesHerraje).values(
              [...elegidas.values()].map((f) => ({
                lineaId: linea.id,
                categoria: f.conjuntoCodigo,
                opcionCodigo: f.opcionCodigo,
                descripcion: f.descripcion,
              })),
            )
          }
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
