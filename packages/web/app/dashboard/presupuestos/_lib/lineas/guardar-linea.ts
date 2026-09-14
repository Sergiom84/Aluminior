import type { ResultadoCerramientoV1 } from '@aluminior/core/estructuras'
import { escribirResultadosCerramiento } from '../cerramientos/escribir-resultados.ts'
import { conPresupuestoBloqueado, type CabeceraBloqueada } from './con-presupuesto-bloqueado.ts'
import { crearDb, schema } from '@aluminior/db'
import type { ClienteEscritura } from '../cliente-db.ts'
import { actualizarTotales } from '../totales.ts'
import { guardarAltaCerramiento, type AltaCerramiento } from '../cerramientos/index.ts'
import { persistirManoObra, type SnapshotManoObra } from '../mano-obra/index.ts'
import { bloquearPresupuesto } from './bloquear-presupuesto.ts'
import { sql } from 'drizzle-orm'

type Db = Pick<ReturnType<typeof crearDb>, 'transaction'>

export type PiezaDespiece = Omit<typeof schema.lineasDespiece.$inferInsert, 'lineaId'>
export type RanuraAcristalamiento = Omit<typeof schema.lineasAcristalamiento.$inferInsert, 'lineaId'>
export type OpcionHerrajeElegida = Omit<typeof schema.lineasOpcionesHerraje.$inferInsert, 'lineaId'>

export interface SatelitesEstructura {
  serieCodigo: string
  estructuraCodigo: string
  acabadoCodigo: string | null
  piezas: PiezaDespiece[]
  acristalamiento: RanuraAcristalamiento[]
  opcionesHerraje: OpcionHerrajeElegida[]
}

/** Campos comunes a los tres tipos. El tipo lo aporta la variante. */
export type ValoresLinea = Omit<typeof schema.lineas.$inferInsert, 'tipo' | 'orden'> & {
  /** Sólo las copias/restauraciones aportan un orden ya decidido. */
  orden?: number
}

/**
 * Qué se escribe, por tipo de línea.
 *
 * Unión discriminada a propósito: el tipo de la línea y sus tablas satélite
 * son la misma decisión, y separarlos en campos opcionales dejaba expresables
 * combinaciones corruptas —un CERRAMIENTO sin configuración, un ARTICULO con
 * ella, una línea con los dos satélites—. El compilador las rechaza ahora, en
 * vez de confiar en que cada futuro llamador se acuerde.
 */
export type EscrituraLinea =
  | { tipo: 'ARTICULO'; valores: ValoresLinea }
  | {
      tipo: 'CERRAMIENTO'
      valores: ValoresLinea
      cerramiento: AltaCerramiento
      /** Cero, una o dos filas. Resueltas antes; aquí sólo se escriben. */
      manoObra: readonly SnapshotManoObra[]
    }
  | { tipo: 'ESTRUCTURA'; valores: ValoresLinea; estructura: SatelitesEstructura }

/** Punto de sincronización exclusivo de pruebas de concurrencia. */
interface HooksGuardarLinea {
  antesDeBloquearPresupuesto?: () => Promise<void>
  despuesDeBloquearPresupuesto?: () => Promise<void>
}

/**
 * Escribe una línea de presupuesto con todo lo que la acompaña.
 *
 * Es el ÚNICO camino de escritura de una línea, y existe para que la
 * atomicidad no dependa de que quien llame se acuerde de abrir la transacción.
 * Una línea `GRUPO` sin su configuración, sin su mano de obra, o una ESTRUCTURA
 * sin su despiece, no son un documento incompleto sino uno corrupto: no se
 * pueden volver a dibujar, describir ni valorar, y en el caso de la mano de obra
 * se cobraría de menos sin que nada lo dijera. Los totales entran en la misma
 * transacción para que la cabecera no refleje una línea que no llegó a
 * confirmarse.
 *
 * Aquí no se decide nada: la valoración, la descripción y la resolución del
 * catálogo ya vienen resueltas. Esto sólo escribe.
 */
async function guardarLineaConGanchos(
  db: Db,
  entrada: EscrituraLinea,
  hooks: HooksGuardarLinea,
): Promise<string> {
  return db.transaction(async (tx) => {
    await hooks.antesDeBloquearPresupuesto?.()
    if (!await bloquearPresupuesto(tx, entrada.valores.presupuestoId)) {
      throw new Error('Presupuesto no encontrado')
    }
    await hooks.despuesDeBloquearPresupuesto?.()

    return escribirLineaPreparada(tx, entrada)
  })
}

export type EscrituraValorada = Extract<EscrituraLinea, { tipo: 'CERRAMIENTO' }> & {
  resultado: ResultadoCerramientoV1
}

/** Preparar catálogo y escribir bajo la misma cabecera bloqueada. */
export async function guardarLineaValorada(db: Db, presupuestoId: string,
  preparar: (tx: ClienteEscritura, cabecera: CabeceraBloqueada) => Promise<EscrituraValorada>,
): Promise<string> {
  return conPresupuestoBloqueado(db, presupuestoId, async (tx, cabecera) => {
    const entrada = await preparar(tx, cabecera)
    if (entrada.valores.presupuestoId !== presupuestoId) throw new Error('Presupuesto de escritura diferente')
    return escribirLineaPreparada(tx, entrada)
  })
}

async function escribirLineaPreparada(tx: ClienteEscritura, entrada: EscrituraLinea | EscrituraValorada) {
    const orden = entrada.valores.orden ?? await siguienteOrden(
      tx,
      entrada.valores.presupuestoId,
    )
    const [linea] = await tx.insert(schema.lineas)
      .values({ ...entrada.valores, orden, tipo: entrada.tipo })
      .returning({ id: schema.lineas.id })
    if (!linea) throw new Error('No se pudo crear la línea')

    if (entrada.tipo === 'CERRAMIENTO') {
      await guardarAltaCerramiento(tx, linea.id, entrada.cerramiento)
      if ('resultado' in entrada) await escribirResultadosCerramiento(tx, linea.id, entrada.resultado, entrada.manoObra)
      else await persistirManoObra(tx, linea.id, entrada.manoObra)
    } else if (entrada.tipo === 'ESTRUCTURA') {
      await escribirEstructura(tx, linea.id, entrada.estructura)
    }

    await actualizarTotales(tx, entrada.valores.presupuestoId)
    return linea.id
}

/** Camino de producción: no permite introducir pausas dentro de la transacción. */
export async function guardarLinea(db: Db, entrada: EscrituraLinea): Promise<string> {
  return guardarLineaConGanchos(db, entrada, {})
}

/**
 * Sólo pruebas. Fuerza una intercalación observable sin cambiar el algoritmo
 * ni abrir una transacción distinta de la que se ejecuta en producción.
 */
export async function guardarLineaParaPruebas(
  db: Db,
  entrada: EscrituraLinea,
  hooks: HooksGuardarLinea,
): Promise<string> {
  return guardarLineaConGanchos(db, entrada, hooks)
}

async function siguienteOrden(
  cliente: ClienteEscritura,
  presupuestoId: string,
): Promise<number> {
  const [fila] = (await cliente.execute<{ orden: number }>(sql`
    SELECT COALESCE(MAX(orden), 0)::int + 1 AS orden
    FROM lineas
    WHERE presupuesto_id = ${presupuestoId}
  `)) as unknown as { orden: number }[]

  if (!fila) throw new Error('No se pudo calcular el orden de la línea')
  return fila.orden
}

async function escribirEstructura(
  cliente: ClienteEscritura,
  lineaId: string,
  estructura: SatelitesEstructura,
) {
  await cliente.insert(schema.lineasEstructura).values({
    lineaId,
    serieCodigo: estructura.serieCodigo,
    estructuraCodigo: estructura.estructuraCodigo,
    acabadoCodigo: estructura.acabadoCodigo,
  })
  if (estructura.piezas.length) {
    await cliente.insert(schema.lineasDespiece)
      .values(estructura.piezas.map((pieza) => ({ lineaId, ...pieza })))
  }
  if (estructura.acristalamiento.length) {
    await cliente.insert(schema.lineasAcristalamiento)
      .values(estructura.acristalamiento.map((ranura) => ({ lineaId, ...ranura })))
  }
  if (estructura.opcionesHerraje.length) {
    await cliente.insert(schema.lineasOpcionesHerraje)
      .values(estructura.opcionesHerraje.map((opcion) => ({ lineaId, ...opcion })))
  }
}
