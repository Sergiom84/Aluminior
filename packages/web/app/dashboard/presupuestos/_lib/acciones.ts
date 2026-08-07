'use server'

/**
 * Server Actions de presupuestos.
 *
 * Aquí converge todo: catálogo, estructuras, despiece y precios. El cálculo
 * ocurre SIEMPRE en servidor — si el navegador pudiera calcular precios,
 * cualquiera podría manipularlos.
 */

import { z } from 'zod'
import { eq, sql, and, or, ilike, inArray, asc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { crearDb, schema } from '@aluminior/db'
import {
  calcularDespiece, evaluar, calcularVidriosPorAlojamiento,
  type ComponentePlantilla, type NodoDisenyo,
} from '@aluminior/core/despiece'
import {
  valorarDespiece, medidasVidrio, lineaValorable,
  type DatosArticuloPrecio,
} from '@aluminior/core/precios'
import { crearClienteServidor } from '../../../../lib/supabase/servidor.ts'
import { actualizarTotales } from './totales.ts'
import { registrarFallo } from './errores.ts'
import { esquemaLinea } from './lineas/esquema-linea.ts'
import {
  guardarLinea, type OpcionHerrajeElegida, type PiezaDespiece,
  type RanuraAcristalamiento, type ValoresLinea,
} from './lineas/guardar-linea.ts'
import { prepararManoObra, type SnapshotManoObra } from './mano-obra/index.ts'
import {
  COMPONENTE_CRISTAL, emparejarVidrio, leerGalceVidrio, opcionesHerrajeDe as opcionesDeHerrajeOfrecidas,
  piezasAcristalamiento, resolverCosteAcristalamiento, resolverCosteDespiece,
  resolverOpcionesHerraje, resolverPerfiles, resolverValoracionVidrio,
  type ContextoVidrio, type CristalAcris, type GrupoOpcionesHerraje,
} from './estructuras/index.ts'
import {
  comprobarPersistenciaCerramientos, prepararAltaCerramiento,
  MENSAJE_MIGRACION_PENDIENTE, type AltaCerramiento,
} from './cerramientos/index.ts'

/**
 * Email del usuario de la sesión, para el campo `creado_por` (antes vacío por
 * no haber auth, T.61). Nunca rompe la creación: ante cualquier fallo devuelve
 * null y el presupuesto se crea igual.
 */
async function usuarioActual(): Promise<string | null> {
  try {
    const supabase = await crearClienteServidor()
    const { data, error } = await supabase.auth.getClaims()
    if (error || !data?.claims) return null
    const claims = data.claims as { email?: string; sub?: string }
    return claims.email ?? claims.sub ?? null
  } catch {
    return null
  }
}

export type Estado =
  | { ok: true; id: string; mensaje?: string }
  | { ok: false; errores: Record<string, string[]>; mensaje?: string }
  | null

export interface ClienteEncontrado {
  codigo: string
  nombre: string
  poblacion: string | null
}

/**
 * Buscador incremental del selector de cliente.
 *
 * Cada fragmento escrito debe aparecer en el nombre o nombre comercial, por
 * lo que `ser her la` encuentra `SERGIO HERNÁNDEZ LARA`. El código se busca
 * además por prefijo. Se limita en servidor para no volcar el maestro entero.
 */
export async function buscarClientes(consulta: string): Promise<ClienteEncontrado[]> {
  const texto = consulta.trim().slice(0, 120)
  const fragmentos = texto
    .split(/\s+/)
    .map((fragmento) => fragmento
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[%_]/g, '')
      .toLowerCase())
    .filter(Boolean)

  const filtroNombre = fragmentos.length
    ? and(...fragmentos.map((fragmento) => or(
        sql<boolean>`translate(lower(${schema.clientes.nombre}), 'áéíóúüñ', 'aeiouun') LIKE ${`%${fragmento}%`}`,
        sql<boolean>`translate(lower(coalesce(${schema.clientes.nombreComercial}, '')), 'áéíóúüñ', 'aeiouun') LIKE ${`%${fragmento}%`}`,
      )))
    : undefined

  const filtro = texto
    ? or(
        ilike(schema.clientes.codigo, `${texto.replace(/[%_\s]/g, '')}%`),
        filtroNombre,
      )
    : undefined

  return crearDb()
    .select({
      codigo: schema.clientes.codigo,
      nombre: schema.clientes.nombre,
      poblacion: schema.clientes.poblacion,
    })
    .from(schema.clientes)
    .where(and(eq(schema.clientes.activo, true), filtro))
    .orderBy(asc(schema.clientes.nombre))
    .limit(8)
}

export type { GrupoOpcionesHerraje }

/**
 * Opciones de herraje aplicables a una (serie, estructura).
 *
 * Server action fina: la regla vive en `_lib/estructuras/herraje.ts`, junto a la
 * resolución de lo que se persiste, para que ofrecer y guardar no puedan
 * divergir. Aquí sólo se abre la conexión.
 */
export async function opcionesHerrajeDe(
  serieCodigo: string, estructuraCodigo: string,
): Promise<GrupoOpcionesHerraje[] | null> {
  return opcionesDeHerrajeOfrecidas(crearDb(), serieCodigo, estructuraCodigo)
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
  potencialCodigo: z.string().trim().optional().transform((v) => v || null),
  nombreLibre: z.string().trim().max(200).optional().transform((v) => v || null),
  obraTexto: z.string().trim().max(200).optional().transform((v) => v || null),
  tarifa: z.coerce.number().int().min(1).max(9).default(1),
  formaPago: z.string().trim().max(60).optional().transform((v) => v || null),
  observaciones: z.string().trim().max(4000).optional().transform((v) => v || null),
})

export async function crearPresupuesto(_previo: Estado, datos: FormData): Promise<Estado> {
  const p = esquemaCabecera.safeParse(Object.fromEntries(datos))
  if (!p.success) return { ok: false, errores: p.error.flatten().fieldErrors }

  const d = p.data
  // Regla del sistema original: basta con identificar al destinatario de
  // ALGUNA forma. Muchos presupuestos reales sólo llevan un nombre a mano.
  if (!d.clienteCodigo && !d.potencialCodigo && !d.nombreLibre) {
    return {
      ok: false,
      errores: { nombreLibre: ['Indica cliente, potencial o al menos un nombre'] },
    }
  }
  if (d.clienteCodigo && d.potencialCodigo) {
    return {
      ok: false,
      errores: { clienteCodigo: ['Elige cliente o potencial, no ambos'] },
    }
  }

  const db = crearDb()
  try {
    const numero = await siguienteNumero(db)
    const creadoPor = await usuarioActual()
    const [fila] = await db.insert(schema.presupuestos).values({
      numero,
      revision: 0,
      serie: 'A',
      fecha: new Date().toISOString().slice(0, 10),
      clienteCodigo: d.clienteCodigo,
      potencialCodigo: d.potencialCodigo,
      nombreLibre: d.nombreLibre,
      obraTexto: d.obraTexto,
      tarifa: d.tarifa,
      formaPago: d.formaPago,
      observaciones: d.observaciones,
      estado: 'PENDIENTE',
      creadoPor,
    }).returning({ id: schema.presupuestos.id })

    revalidatePath('/dashboard/presupuestos')
    return { ok: true, id: fila.id }
  } catch (e) {
    return { ok: false, errores: {}, mensaje: registrarFallo('crearPresupuesto', e) }
  }
}

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
  let altaCerramiento: AltaCerramiento | null = null
  if (d.tipo === 'CERRAMIENTO') {
    const resultado = prepararAltaCerramiento({
      configuracionSerializada: d.configuracionCerramiento,
      serieCodigo: d.serieCodigo,
      vidrioCodigo: d.vidrioCodigo,
      acabadoCodigo: d.acabadoCodigo,
      varianteAcristalamiento: d.varianteAcristalamiento,
    })
    if (!resultado.ok) return { ok: false, errores: resultado.errores }
    altaCerramiento = resultado.alta
  }
  const db = crearDb()

  try {
    const [presupuesto] = await db.select()
      .from(schema.presupuestos)
      .where(eq(schema.presupuestos.id, d.presupuestoId)).limit(1)
    if (!presupuesto) return { ok: false, errores: {}, mensaje: 'Presupuesto no encontrado' }

    // La UI puede ejecutarse contra un entorno cuya migración aún no se haya
    // desplegado. Comprobarlo ANTES de insertar evita una línea huérfana si el
    // satélite lineas_cerramiento todavía no existe.
    if (d.tipo === 'CERRAMIENTO') {
      if (!await comprobarPersistenciaCerramientos(db)) {
        return { ok: false, errores: {}, mensaje: MENSAJE_MIGRACION_PENDIENTE }
      }
    }

    const [{ orden }] = (await db.execute<{ orden: number }>(sql`
      SELECT COALESCE(MAX(orden), 0) + 1 AS orden FROM lineas
      WHERE presupuesto_id = ${d.presupuestoId}
    `)) as unknown as { orden: number }[]

    let descripcion = d.codigo
    let precioUnitario: number | null = null
    let aviso: string | null = null
    /** Medidas de la línea. El cerramiento las deriva de su composición. */
    let anchoLinea = d.anchoMm ?? null
    let altoLinea = d.altoMm ?? null

    /** Despiece resuelto a persistir en lineas_despiece (trazabilidad + coste). */
    let piezasAPersistir: PiezaDespiece[] = []
    let acristalamientoAPersistir: RanuraAcristalamiento[] = []
    /** Snapshots de mano de obra. Vacío mientras no se teclean horas. */
    let manoObra: SnapshotManoObra[] = []

    if (d.tipo === 'CERRAMIENTO') {
      descripcion = altaCerramiento!.descripcion
      precioUnitario = altaCerramiento!.precioUnitario
      aviso = altaCerramiento!.aviso
      anchoLinea = altaCerramiento!.anchoMm
      altoLinea = altaCerramiento!.altoMm

      // --- Mano de obra adicional (T.68) ---
      const preparada = await prepararManoObra(db, {
        horas: { fabricacion: d.horasFabricacion, colocacion: d.horasColocacion },
        tarifa: presupuesto.tarifa,
      })
      if (preparada.estado === 'MIGRACION_PENDIENTE') {
        return { ok: false, errores: {}, mensaje: preparada.mensaje }
      }
      if (preparada.estado === 'PREPARADA') {
        manoObra = preparada.filas
        // Hoy `precioUnitario` ya es null —el cerramiento no tiene valoración
        // agregada—, pero la regla queda escrita donde toca: cuando el precio
        // del GRUPO exista, un concepto sin importe seguirá dejándolo en null.
        if (!preparada.valorable) precioUnitario = null
        if (preparada.notas.length) aviso = `${aviso} ${preparada.notas.join('; ')}.`
      }
    } else if (d.tipo === 'ARTICULO') {
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
      // La regla vive en `_lib/estructuras/resolucion-perfiles.ts`: qué lee de
      // la serie, qué artículo es genérico y cómo se reparte lo que no se
      // resuelve entre perfil y asociado. Aquí sólo se consume el resultado.
      //
      // La empresa monta doble cristal en el 100% del histórico; la variante es
      // una elección visible (se informa en el aviso si interviene).
      const VARIANTE = d.varianteAcristalamiento
      const {
        plantillaResuelta, genericos, sinResolver, sinResolverAsoc, variantesAplicadas,
      } = await resolverPerfiles(db, {
        serieCodigo: d.serieCodigo,
        plantilla,
        variante: VARIANTE,
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

      // Rebaje de las piezas de hoja (anexo T). La hoja encaja DENTRO del
      // marco: sin esto el motor emite la medida del hueco y no reproduce
      // ninguna línea con hoja del histórico. Las reglas se midieron al 99%
      // de consistencia (T.17); si a una pieza le falta la suya, queda sin
      // medida y la línea entera sin valorar.
      const rebajesFilas = await db.select().from(schema.hojaRebajes)
        .where(eq(schema.hojaRebajes.serieCodigo, d.serieCodigo ?? ''))
      const rebajes = new Map(rebajesFilas.map((f) => [
        `${f.perfilCodigo}|${f.eje}|${f.formula}`,
        { mm: Number(f.rebajeMm), muestras: f.muestras, totalMuestras: f.totalMuestras },
      ]))

      const despiece = calcularDespiece(
        plantillaResuelta as ComponentePlantilla[],
        { anchoMm: d.anchoMm, altoMm: d.altoMm },
        cotas,
        {
          serie: d.serieCodigo ?? '',
          rebajeDeHoja: (c) => rebajes.get(`${c.articuloCodigo}|${c.funcion}|${c.formula}`) ?? null,
        },
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
      // No interviene en el precio de venta: un coste que falta no deja la
      // línea sin valorar. Reutiliza el mapa de artículos que ya leyó la
      // valoración; sólo añade la lectura de `articulos_coste`.
      piezasAPersistir = await resolverCosteDespiece(db, {
        piezas: despiece.piezas,
        codigos,
        mapa,
        acabadoCodigo: d.acabadoCodigo,
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
      let contextoVidrio: ContextoVidrio | null = null
      let cristalesAcris: CristalAcris[] = []
      let avisoAcris: string | null = null
      if (d.vidrioCodigo) {
        const [vidrio] = await db.select()
          .from(schema.articulos).where(eq(schema.articulos.codigo, d.vidrioCodigo)).limit(1)
        if (!vidrio || vidrio.familiaCodigo !== '050' || vidrio.tipoMetraje !== 'M2') {
          return { ok: false, errores: { vidrioCodigo: ['Vidrio no válido (debe ser familia 050, facturable por m²)'] } }
        }
        const ranuras = plantillaResuelta.filter((c) => c.componenteDisenyo === COMPONENTE_CRISTAL)
        acristalamientoAPersistir = ranuras.map((r, i) => ({
          slot: i + 1,
          vidrioHojas: r.tipoHojaDisenyo === -1 ? null : d.vidrioCodigo,
          vidrioFijos: r.tipoHojaDisenyo === -1 ? d.vidrioCodigo : null,
          variante: d.varianteAcristalamiento,
        }))
        const tipos = new Set(ranuras.map((r) => r.tipoHojaDisenyo === -1 ? 'FIJO' : 'HOJA'))
        const esMixta = tipos.size > 1
        tamJunqVidrio = Number((vidrio.tamJunquilloGoma ?? '').replace(',', '.')) || 0
        // Múltiplos y mínimo del artículo. Las dos rutas los leían por separado
        // del mismo `vidrio`, con el mismo código: una sola lectura.
        const reglasMetrajeVidrio = {
          metrajeMinimo: vidrio.metrajeMinimo === null ? null : Number(vidrio.metrajeMinimo),
          multiploLargoCm: vidrio.metrajeMultiploLargo === null ? null : Number(vidrio.metrajeMultiploLargo),
          multiploAnchoCm: vidrio.metrajeMultiploAncho === null ? null : Number(vidrio.metrajeMultiploAncho),
        }

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
            { L: d.altoMm, A: d.anchoMm, ...cotas }, nodos,
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
            // Un cristal por alojamiento, cada uno con su medida: cantidad 1.
            const valoracion = await resolverValoracionVidrio(db, {
              vidrioCodigo: d.vidrioCodigo,
              cristales: calculo.vidrios.map((v) => ({
                largoMm: v.largoMm, anchoMm: v.anchoMm, cantidad: 1,
              })),
              reglasMetraje: reglasMetrajeVidrio,
              tarifa: presupuesto.tarifa,
              acabadoCodigo: d.acabadoCodigo,
            })
            if (!valoracion.ok) {
              avisoVidrio = valoracion.aviso
            } else {
              precioUnitario = Math.round((precioUnitario + valoracion.importe) * 100) / 100
              piezasAPersistir.push(...valoracion.piezas)
            }
          }
        } else {

        // `ranuras` ya es ese mismo filtro sobre la plantilla resuelta.
        const nCristales = ranuras.length
        const emparejamiento = emparejarVidrio(despiece.piezas, nCristales)

        if (!emparejamiento.ok) {
          avisoVidrio = emparejamiento.aviso
          contextoVidrio = null
        } else {
          const { perfilCodigo: perfilRef } = emparejamiento
          contextoVidrio = emparejamiento.contexto
          const deltaGalce = await leerGalceVidrio(db, contextoVidrio, d.serieCodigo, perfilRef)
          if (deltaGalce === null) {
            avisoVidrio = `vidrio sin calcular: sin descuento de galce medido para ${d.serieCodigo} + ${perfilRef} (${contextoVidrio.toLowerCase()})`
          } else {
            const dims = medidasVidrio(
              emparejamiento.corteVerticalMm, emparejamiento.corteHorizontalMm,
              deltaGalce,
            )
            if (!dims) {
              avisoVidrio = 'vidrio sin calcular: el descuento de galce no cabe en la medida'
            } else {
              dimsVidrio = dims
              const contextoModulo = { L: d.altoMm, A: d.anchoMm, ...cotas }
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
              // Un único par de medidas repetido por cristal: una entrada con
              // la cuenta como cantidad.
              const valoracion = await resolverValoracionVidrio(db, {
                vidrioCodigo: d.vidrioCodigo,
                cristales: [{
                  largoMm: dims.largoMm, anchoMm: dims.anchoMm, cantidad: nCristales,
                }],
                reglasMetraje: reglasMetrajeVidrio,
                tarifa: presupuesto.tarifa,
                acabadoCodigo: d.acabadoCodigo,
              })
              if (!valoracion.ok) {
                avisoVidrio = valoracion.aviso
              } else {
                precioUnitario = Math.round((precioUnitario + valoracion.importe) * 100) / 100
                piezasAPersistir.push(...valoracion.piezas)
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
          const calculoAcris = await piezasAcristalamiento(db, {
            serieCodigo: d.serieCodigo,
            tamJunquillo: tamJunqVidrio,
            cristales: cristalesAcris,
          })
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

            // Coste de junquillos y juntas. Su contrato NO es el del despiece:
            // aquí el largo es obligatorio también por unidades y los ángulos
            // se descartan. Ver `coste-acristalamiento.ts`.
            piezasAPersistir.push(...await resolverCosteAcristalamiento(db, {
              piezas: valorables,
              codigos: codigosAcris,
              mapa: mapaAcris,
              acabadoCodigo: d.acabadoCodigo,
            }))
          }
        }

      const problemas: string[] = []
      if (avisoVidrio) problemas.push(avisoVidrio)
      if (avisoAcris) problemas.push(avisoAcris)
      if (!d.vidrioCodigo) problemas.push('sin vidrio elegido: el acristalamiento no se valora')
      if (sinResolver.size) {
        problemas.push(
          `${sinResolver.size} ranuras de perfil que la serie ${d.serieCodigo} no resuelve (quedan sin valorar)`,
        )
      }
      if (sinResolverAsoc.size) {
        problemas.push(
          `${sinResolverAsoc.size} ranuras de asociado sin valorar (herrajes, escuadras y mano de obra: pendiente)`,
        )
      }
      // Guarda "todo o sin valorar" (regla del dinero, T.59): función pura en
      // core, testeada. Añade los motivos de despiece/precio a los problemas.
      problemas.push(...lineaValorable({
        incalculables: despiece.incalculables,
        sinPrecio: valoracion.sinPrecio,
        variablesFaltantes: despiece.variablesFaltantes,
      }).motivos)
      if (problemas.length) {
        // Un importe parcial no es el precio de la estructura. Se conserva el
        // despiece para trazabilidad, pero la línea queda sin valorar.
        precioUnitario = null
        aviso = `Importe incompleto: ${problemas.join('; ')}.`
      }
      else {
        // Avisos INFORMATIVOS: la línea se valora, pero hay algo que el
        // presupuestador debe saber. No anulan el precio (eso lo hace
        // `problemas`), y por eso van en esta rama.
        const informativos: string[] = []
        if (variantesAplicadas > 0) {
          const nombreVariante = VARIANTE === '2' ? 'doble' : 'sencillo'
          informativos.push(`variante de cristal ${nombreVariante} en ${variantesAplicadas} componentes`)
        }
        // Reglas de rebaje no exactas (T.17, condición 1). El riesgo se
        // acepta al 99%, pero nunca en silencio.
        informativos.push(...despiece.avisos)
        if (informativos.length) aviso = `Valorado con avisos: ${informativos.join('; ')}.`
      }
    }

    const total = precioUnitario === null
      ? null
      : Math.round(precioUnitario * d.cantidad * 100) / 100

    // --- Opciones de herraje elegidas (anexo R) ---
    // Se resuelven ANTES de escribir: es lectura de catálogo, y la transacción
    // debe contener escrituras, no consultas.
    const opcionesHerraje: OpcionHerrajeElegida[] = d.tipo === 'ESTRUCTURA'
      ? await resolverOpcionesHerraje(db, {
          serieCodigo: d.serieCodigo,
          estructuraCodigo: d.codigo,
          elegidas: datos.getAll('opcionHerraje').map(String),
        })
      : []

    const valores: ValoresLinea = {
      presupuestoId: d.presupuestoId,
      orden,
      articuloCodigo: d.tipo === 'ARTICULO' ? d.codigo : null,
      descripcion,
      referencia: d.referencia,
      cantidad: String(d.cantidad),
      anchoMm: anchoLinea,
      altoMm: altoLinea,
      precioUnitario: precioUnitario === null ? null : String(precioUnitario),
      total: total === null ? null : String(total),
      valoracionCompleta: precioUnitario !== null,
      avisoValoracion: aviso,
    }

    await guardarLinea(db, d.tipo === 'CERRAMIENTO'
      ? { tipo: 'CERRAMIENTO', valores, cerramiento: altaCerramiento!, manoObra }
      : d.tipo === 'ESTRUCTURA'
        ? {
            tipo: 'ESTRUCTURA',
            valores,
            estructura: {
              serieCodigo: d.serieCodigo ?? '',
              estructuraCodigo: d.codigo,
              acabadoCodigo: d.acabadoCodigo,
              piezas: piezasAPersistir,
              acristalamiento: acristalamientoAPersistir,
              opcionesHerraje,
            },
          }
        : { tipo: 'ARTICULO', valores })

    revalidatePath(`/dashboard/presupuestos/${d.presupuestoId}`)

    return { ok: true, id: d.presupuestoId, mensaje: aviso ?? undefined }
  } catch (e) {
    return { ok: false, errores: {}, mensaje: registrarFallo('anyadirLinea', e) }
  }
}

export async function borrarLinea(lineaId: string, presupuestoId: string) {
  const db = crearDb()
  await db.transaction(async (tx) => {
    await tx.delete(schema.lineas).where(eq(schema.lineas.id, lineaId))
    await actualizarTotales(tx, presupuestoId)
  })
  revalidatePath(`/dashboard/presupuestos/${presupuestoId}`)
}

/** Recálculo de totales como acción suelta. La regla vive en `totales.ts`. */
export async function recalcularTotales(presupuestoId: string) {
  await actualizarTotales(crearDb(), presupuestoId)
}
