import { ErrorOperacionCerramiento } from './error-operativo.ts'
import type { ResultadoCerramientoV1 } from '@aluminior/core/estructuras'
import { conPresupuestoBloqueado } from '../lineas/con-presupuesto-bloqueado.ts'
import { prepararLineaValorada } from './preparar-linea-valorada.ts'
import { escribirResultadosCerramiento } from './escribir-resultados.ts'
import { and, eq } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import type { ClienteEscritura } from '../cliente-db.ts'
import { actualizarTotales } from '../totales.ts'
import { persistirManoObra, type SnapshotManoObra } from '../mano-obra/index.ts'
import { prepararAltaCerramiento, type AltaCerramiento } from './alta-cerramiento.ts'

type Db = Pick<ReturnType<typeof crearDb>, 'transaction'>

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

  return conPresupuestoBloqueado(db, entrada.presupuestoId, async (tx, documento) => {
    const linea = await lineaEditable(tx, entrada)
    if (!linea) return { ok: false, errores: {}, mensaje: 'La línea no pertenece al presupuesto o no es un cerramiento' }
    const preparada = await prepararLineaValorada(tx, alta.alta, { ...entrada, tarifa: documento.tarifa })
    await escribirEdicionPreparada(tx, { ...entrada, alta: alta.alta,
      manoObra: preparada.manoObra, aviso: preparada.aviso ?? '',
      resultado: preparada.resultado, importes: preparada.importes })
    return { ok: true, aviso: preparada.aviso ?? 'Cerramiento actualizado' }
  })
}

/**
 * Escritura preparada exportada para probar el límite transaccional real.
 * Conserva id y orden; sustituye los satélites y recalcula la cabecera juntos.
 */
export async function escribirEdicionCerramiento(
  db: Db,
  entrada: EdicionCerramientoPreparada,
): Promise<boolean> {
  return conPresupuestoBloqueado(db, entrada.presupuestoId, tx => escribirEdicionPreparada(tx, entrada))
}

type EdicionValorada = EdicionCerramientoPreparada & {
  resultado: ResultadoCerramientoV1
  importes: { precioUnitario: string | null; total: string | null; valoracionCompleta: boolean }
}

async function lineaEditable(tx: ClienteEscritura, entrada: { lineaId: string; presupuestoId: string }) {
  const [linea] = await tx.select().from(schema.lineas).where(and(
    eq(schema.lineas.id, entrada.lineaId), eq(schema.lineas.presupuestoId, entrada.presupuestoId),
    eq(schema.lineas.tipo, 'CERRAMIENTO'),
  )).limit(1)
  if (linea && (Number(linea.descuento) !== 0 || Number(linea.descuento2) !== 0 || linea.pvpManual))
    throw new ErrorOperacionCerramiento('La revaloración de un cerramiento con descuentos o precio manual no está disponible')
  return linea
}

async function escribirEdicionPreparada(tx: ClienteEscritura,
  entrada: EdicionCerramientoPreparada | EdicionValorada,
): Promise<boolean> {
    if (!await lineaEditable(tx, entrada)) return false
    if (!('resultado' in entrada)) {
      const [actual] = await tx.select({ lineaId: schema.lineasCerramientoResultados.lineaId })
        .from(schema.lineasCerramientoResultados)
        .where(eq(schema.lineasCerramientoResultados.lineaId, entrada.lineaId)).limit(1)
      if (actual) throw new ErrorOperacionCerramiento('La línea valorada requiere una revaloración completa')
    }
    await tx.update(schema.lineas).set({
      descripcion: entrada.alta.descripcion,
      referencia: entrada.referencia,
      cantidad: String(entrada.cantidad),
      anchoMm: entrada.alta.anchoMm,
      altoMm: entrada.alta.altoMm,
      ...('resultado' in entrada ? entrada.importes : { precioUnitario: null, total: null, valoracionCompleta: false }),
      avisoValoracion: entrada.aviso,
    }).where(eq(schema.lineas.id, entrada.lineaId))

    await actualizarSatelite(tx, entrada.lineaId, entrada.alta)
    if ('resultado' in entrada) await escribirResultadosCerramiento(tx, entrada.lineaId, entrada.resultado, entrada.manoObra)
    else {
    await tx.delete(schema.lineasManoObra)
      .where(eq(schema.lineasManoObra.lineaId, entrada.lineaId))
    await persistirManoObra(tx, entrada.lineaId, entrada.manoObra)
    }
    await actualizarTotales(tx, entrada.presupuestoId)
    return true
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
