'use server'

/**
 * Server Actions de presupuestos.
 *
 * Borde de los casos de uso de presupuestos. La valoración de estructuras se
 * delega en `_lib/estructuras`; el cálculo sigue ocurriendo SIEMPRE en servidor.
 */

import { z } from 'zod'
import { eq, sql, and, or, ilike, asc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { crearDb, schema } from '@aluminior/db'
import { actualizarTotales } from './totales.ts'
import { usuarioActual } from './usuario-actual.ts'
import { registrarFallo } from './errores.ts'
import { esquemaLinea } from './lineas/esquema-linea.ts'
import { crearPresupuestoAlta } from './presupuestos/crear-presupuesto.ts'
import { fechaLocalMadrid } from './fecha-local.ts'
import {
  guardarLinea, type OpcionHerrajeElegida, type PiezaDespiece,
  type RanuraAcristalamiento, type ValoresLinea,
} from './lineas/guardar-linea.ts'
import { prepararManoObra, type SnapshotManoObra } from './mano-obra/index.ts'
import {
  opcionesHerrajeDe as opcionesDeHerrajeOfrecidas, valorarEstructura,
  type GrupoOpcionesHerraje,
} from './estructuras/index.ts'
import {
  comprobarPersistenciaCerramientos, prepararAltaCerramiento,
  MENSAJE_MIGRACION_PENDIENTE, type AltaCerramiento,
} from './cerramientos/index.ts'

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
  const fecha = fechaLocalMadrid()
  try {
    const creadoPor = await usuarioActual()
    // Parseo, validación, usuario y revalidate se quedan aquí; reservar el
    // número y escribir la cabecera es responsabilidad de
    // `presupuestos/crear-presupuesto.ts` (T.71.4).
    const resultado = await crearPresupuestoAlta(db, {
      serie: 'A',
      fecha,
      clienteCodigo: d.clienteCodigo,
      potencialCodigo: d.potencialCodigo,
      nombreLibre: d.nombreLibre,
      obraTexto: d.obraTexto,
      tarifa: d.tarifa,
      formaPago: d.formaPago,
      observaciones: d.observaciones,
      creadoPor,
    })
    if (!resultado.ok) return { ok: false, errores: {}, mensaje: resultado.errores.join('; ') }

    revalidatePath('/dashboard/presupuestos')
    return { ok: true, id: resultado.id }
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
    let opcionesHerraje: OpcionHerrajeElegida[] = []
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
      const resultado = await valorarEstructura(db, {
        codigo: d.codigo,
        serieCodigo: d.serieCodigo,
        anchoMm: d.anchoMm ?? null,
        altoMm: d.altoMm ?? null,
        vidrioCodigo: d.vidrioCodigo,
        varianteAcristalamiento: d.varianteAcristalamiento,
        acabadoCodigo: d.acabadoCodigo,
        tarifa: presupuesto.tarifa,
        opcionesHerraje: datos.getAll('opcionHerraje').map(String),
      })
      if (!resultado.ok) return { ok: false, errores: resultado.errores }
      descripcion = resultado.descripcion
      precioUnitario = resultado.precioUnitario
      aviso = resultado.aviso
      piezasAPersistir = resultado.piezas
      acristalamientoAPersistir = resultado.acristalamiento
      opcionesHerraje = resultado.opcionesHerraje
    }
    const total = precioUnitario === null
      ? null
      : Math.round(precioUnitario * d.cantidad * 100) / 100

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
