'use server'

/**
 * Server Actions de presupuestos.
 *
 * Aquí converge todo: catálogo, estructuras, despiece y precios. El cálculo
 * ocurre SIEMPRE en servidor — si el navegador pudiera calcular precios,
 * cualquiera podría manipularlos.
 */

import { z } from 'zod'
import { eq, sql, and, inArray } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { crearDb, schema } from '@aluminior/db'
import { calcularDespiece, type ComponentePlantilla } from '@aluminior/core/despiece'
import { valorarDespiece, type DatosArticuloPrecio } from '@aluminior/core/precios'

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
    let precioUnitario = 0
    let aviso: string | null = null

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
      else aviso = 'El artículo no tiene precio en esta tarifa; la línea queda a cero.'
    } else {
      const [est] = await db.select()
        .from(schema.estructuras).where(eq(schema.estructuras.codigo, d.codigo)).limit(1)
      if (!est) return { ok: false, errores: { codigo: ['Estructura no encontrada'] } }
      descripcion = est.descripcion

      if (!d.anchoMm || !d.altoMm) {
        return { ok: false, errores: { anchoMm: ['Indica ancho y alto del hueco'] } }
      }

      const plantilla = await db.select({
        articuloCodigo: schema.estructuraComponentes.articuloCodigo,
        cantidad: schema.estructuraComponentes.cantidad,
        formulaLargo: schema.estructuraComponentes.formulaLargo,
        tipoCorte: schema.estructuraComponentes.tipoCorte,
        anguloIzquierdo: schema.estructuraComponentes.anguloIzquierdo,
        anguloDerecho: schema.estructuraComponentes.anguloDerecho,
        funcion: schema.estructuraComponentes.funcion,
        medidaMinima: schema.estructuraComponentes.medidaMinima,
        medidaMaxima: schema.estructuraComponentes.medidaMaxima,
      }).from(schema.estructuraComponentes)
        .where(eq(schema.estructuraComponentes.estructuraCodigo, d.codigo))

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
        plantilla as ComponentePlantilla[],
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
              ORDER BY p.acabado_codigo LIMIT 1
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

      const problemas: string[] = []
      if (despiece.incalculables > 0) {
        problemas.push(
          `${despiece.incalculables} piezas sin medida` +
          (despiece.variablesFaltantes.length ? ` (faltan ${despiece.variablesFaltantes.join(', ')})` : ''),
        )
      }
      if (valoracion.sinPrecio.length) {
        problemas.push(`${valoracion.sinPrecio.length} artículos sin precio en la tarifa`)
      }
      if (problemas.length) aviso = `Importe incompleto: ${problemas.join('; ')}.`
    }

    const total = Math.round(precioUnitario * d.cantidad * 100) / 100

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
      precioUnitario: String(precioUnitario),
      total: String(total),
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
          serieCodigo: '',
          estructuraCodigo: d.codigo,
          acabadoCodigo: d.acabadoCodigo,
        })
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
