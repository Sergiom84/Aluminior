/**
 * Pestaña `Gastos` de la cabecera: `Comisión` % y `Sumar Comisión`.
 *
 * Con `Sumar Comisión`, el precio de las líneas de estructura y GRUPO lleva el
 * factor (1 + comisión/100) y el despiece queda en base (BANCO-CONTRASTE,
 * iteración 6). Los artículos no lo llevan: en EMP0016 todos los artículos de
 * documentos con comisión tienen precio manual y no hay evidencia.
 *
 * La tabla llega con la migración 0027; sin ella se lee comisión 0 sin sumar.
 */
import { and, eq, inArray, isNotNull, or, sql } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import { compararDecimal } from '@aluminior/core/precios'
import type { ClienteEscritura } from '../cliente-db.ts'
import type { GastosPresupuesto } from './esquema.ts'

export const GASTOS_SIN_COMISION: GastosPresupuesto = { comisionPorc: '0.00', sumarComision: false }

/** Tipos de línea cuyo precio multiplica la comisión sumada. */
export const TIPOS_CON_COMISION = ['ESTRUCTURA', 'CERRAMIENTO'] as const

export async function gastosDisponibles(cliente: ClienteEscritura): Promise<boolean> {
  const filas = await cliente.execute<{ tabla: string | null }>(
    sql`SELECT to_regclass('public.presupuestos_gastos')::text AS tabla`)
  return Boolean(filas[0]?.tabla)
}

export async function leerGastos(cliente: ClienteEscritura, presupuestoId: string): Promise<GastosPresupuesto> {
  if (!await gastosDisponibles(cliente)) return GASTOS_SIN_COMISION
  const [fila] = await cliente.select({ comisionPorc: schema.presupuestosGastos.comisionPorc,
    sumarComision: schema.presupuestosGastos.sumarComision })
    .from(schema.presupuestosGastos).where(eq(schema.presupuestosGastos.presupuestoId, presupuestoId)).limit(1)
  return fila ?? GASTOS_SIN_COMISION
}

/** Porcentaje que se aplica al precio de línea, o null si no se suma. */
export function comisionSumada(gastos: GastosPresupuesto): string | null {
  return gastos.sumarComision && compararDecimal(gastos.comisionPorc, '0') !== 0 ? gastos.comisionPorc : null
}

export function mismaComision(a: string | null, b: string | null): boolean {
  return a === null || b === null ? a === b : compararDecimal(a, b) === 0
}

export async function comisionDeLineas(cliente: ClienteEscritura, presupuestoId: string): Promise<string | null> {
  return comisionSumada(await leerGastos(cliente, presupuestoId))
}

/** Líneas cuyo importe guardado ya incluye la comisión sumada actual. */
export async function hayLineasConComision(cliente: ClienteEscritura, presupuestoId: string): Promise<boolean> {
  const filas = await cliente.select({ id: schema.lineas.id }).from(schema.lineas).where(and(
    eq(schema.lineas.presupuestoId, presupuestoId),
    inArray(schema.lineas.tipo, [...TIPOS_CON_COMISION]),
    or(isNotNull(schema.lineas.precioUnitario), isNotNull(schema.lineas.total)),
  )).limit(1)
  return filas.length > 0
}

export async function escribirGastos(cliente: ClienteEscritura, presupuestoId: string, gastos: GastosPresupuesto) {
  await cliente.insert(schema.presupuestosGastos).values({ presupuestoId, ...gastos })
    .onConflictDoUpdate({ target: schema.presupuestosGastos.presupuestoId, set: gastos })
}

/** La copia arrastra la cabecera completa: sin esto, sus líneas llevarían una comisión que la cabecera no tiene. */
export async function copiarGastos(cliente: ClienteEscritura, origenId: string, destinoId: string) {
  if (!await gastosDisponibles(cliente)) return
  await cliente.execute(sql`
    INSERT INTO presupuestos_gastos (presupuesto_id, comision_porc, sumar_comision)
    SELECT ${destinoId}, comision_porc, sumar_comision FROM presupuestos_gastos WHERE presupuesto_id = ${origenId}`)
}
