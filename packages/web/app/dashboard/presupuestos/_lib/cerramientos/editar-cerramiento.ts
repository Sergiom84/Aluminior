import { and, eq } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import type { ClienteEscritura } from '../cliente-db.ts'
import { actualizarTotales } from '../totales.ts'
import { prepararManoObra, persistirManoObra, type SnapshotManoObra } from '../mano-obra/index.ts'
import { prepararAltaCerramiento, type AltaCerramiento } from './alta-cerramiento.ts'

type Db = ReturnType<typeof crearDb>

export interface EntradaEdicionCerramiento {
  presupuestoId: string
  lineaId: string
  configuracionSerializada: string | null
  serieCodigo: string | null
  vidrioCodigo: string | null
  acabadoCodigo: string | null
  varianteAcristalamiento: '1' | '2'
  referencia: string | null
  cantidad: number
  horasFabricacion: string
  horasColocacion: string
}

export type ResultadoEdicionCerramiento =
  | { ok: true; aviso: string }
  | { ok: false; errores: Record<string, string[]>; mensaje?: string }

export interface EdicionCerramientoPreparada {
  presupuestoId: string
  lineaId: string
  referencia: string | null
  cantidad: number
  alta: AltaCerramiento
  manoObra: readonly SnapshotManoObra[]
  aviso: string
}

/** Caso de uso completo: valida, resuelve la mano de obra y delega una única escritura atómica. */
export async function actualizarCerramiento(
  db: Db,
  entrada: EntradaEdicionCerramiento,
): Promise<ResultadoEdicionCerramiento> {
  const alta = prepararAltaCerramiento({
    configuracionSerializada: entrada.configuracionSerializada,
    serieCodigo: entrada.serieCodigo,
    vidrioCodigo: entrada.vidrioCodigo,
    acabadoCodigo: entrada.acabadoCodigo,
    varianteAcristalamiento: entrada.varianteAcristalamiento,
  })
  if (!alta.ok) return alta

  const [documento] = await db.select({ tarifa: schema.presupuestos.tarifa })
    .from(schema.presupuestos)
    .where(eq(schema.presupuestos.id, entrada.presupuestoId)).limit(1)
  if (!documento) return { ok: false, errores: {}, mensaje: 'Presupuesto no encontrado' }

  const manoObra = await prepararManoObra(db, {
    horas: { fabricacion: entrada.horasFabricacion, colocacion: entrada.horasColocacion },
    tarifa: documento.tarifa,
  })
  if (manoObra.estado === 'MIGRACION_PENDIENTE') {
    return { ok: false, errores: {}, mensaje: manoObra.mensaje }
  }
  const filas = manoObra.estado === 'PREPARADA' ? manoObra.filas : []
  const notas = manoObra.estado === 'PREPARADA' ? manoObra.notas : []
  const aviso = [alta.alta.aviso, ...notas].join(' ')

  const escrito = await escribirEdicionCerramiento(db, {
    presupuestoId: entrada.presupuestoId,
    lineaId: entrada.lineaId,
    referencia: entrada.referencia,
    cantidad: entrada.cantidad,
    alta: alta.alta,
    manoObra: filas,
    aviso,
  })
  return escrito ? { ok: true, aviso } : {
    ok: false, errores: {}, mensaje: 'La línea no pertenece al presupuesto o no es un cerramiento',
  }
}

/**
 * Escritura preparada exportada para probar el límite transaccional real.
 * Conserva id y orden; sustituye los satélites y recalcula la cabecera juntos.
 */
export async function escribirEdicionCerramiento(
  db: Db,
  entrada: EdicionCerramientoPreparada,
): Promise<boolean> {
  return db.transaction(async (tx) => {
    const [linea] = await tx.select({ id: schema.lineas.id })
      .from(schema.lineas)
      .where(and(
        eq(schema.lineas.id, entrada.lineaId),
        eq(schema.lineas.presupuestoId, entrada.presupuestoId),
        eq(schema.lineas.tipo, 'CERRAMIENTO'),
      )).limit(1)
    if (!linea) return false

    await tx.update(schema.lineas).set({
      descripcion: entrada.alta.descripcion,
      referencia: entrada.referencia,
      cantidad: String(entrada.cantidad),
      anchoMm: entrada.alta.anchoMm,
      altoMm: entrada.alta.altoMm,
      precioUnitario: null,
      total: null,
      valoracionCompleta: false,
      avisoValoracion: entrada.aviso,
    }).where(eq(schema.lineas.id, entrada.lineaId))

    await actualizarSatelite(tx, entrada.lineaId, entrada.alta)
    await tx.delete(schema.lineasManoObra)
      .where(eq(schema.lineasManoObra.lineaId, entrada.lineaId))
    await persistirManoObra(tx, entrada.lineaId, entrada.manoObra)
    await actualizarTotales(tx, entrada.presupuestoId)
    return true
  })
}

async function actualizarSatelite(
  tx: ClienteEscritura,
  lineaId: string,
  alta: AltaCerramiento,
) {
  const resultado = await tx.update(schema.lineasCerramiento).set({
    version: alta.configuracion.version,
    configuracion: alta.configuracion as unknown as Record<string, unknown>,
    serieCodigo: alta.datos.serieCodigo,
    vidrioCodigo: alta.datos.vidrioCodigo,
    acabadoCodigo: alta.datos.acabadoCodigo,
    varianteAcristalamiento: alta.datos.varianteAcristalamiento,
  }).where(eq(schema.lineasCerramiento.lineaId, lineaId)).returning({
    lineaId: schema.lineasCerramiento.lineaId,
  })
  if (!resultado.length) throw new Error('El cerramiento no tiene configuración editable')
}
