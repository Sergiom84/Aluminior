import { crearDb, schema } from '@aluminior/db'
import type { ClienteEscritura } from '../cliente-db.ts'
import { actualizarTotales } from '../totales.ts'
import { guardarAltaCerramiento, type AltaCerramiento } from '../cerramientos/index.ts'

type Db = ReturnType<typeof crearDb>

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
export type ValoresLinea = Omit<typeof schema.lineas.$inferInsert, 'tipo'>

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
  | { tipo: 'CERRAMIENTO'; valores: ValoresLinea; cerramiento: AltaCerramiento }
  | { tipo: 'ESTRUCTURA'; valores: ValoresLinea; estructura: SatelitesEstructura }

/**
 * Escribe una línea de presupuesto con todo lo que la acompaña.
 *
 * Es el ÚNICO camino de escritura de una línea, y existe para que la
 * atomicidad no dependa de que quien llame se acuerde de abrir la transacción.
 * Una línea `GRUPO` sin su configuración, o una ESTRUCTURA sin su despiece, no
 * son un documento incompleto sino uno corrupto: no se pueden volver a
 * dibujar, describir ni valorar. Los totales entran en la misma transacción
 * para que la cabecera no refleje una línea que no llegó a confirmarse.
 *
 * Aquí no se decide nada: la valoración, la descripción y la resolución del
 * catálogo ya vienen resueltas. Esto sólo escribe.
 */
export async function guardarLinea(db: Db, entrada: EscrituraLinea): Promise<string> {
  return db.transaction(async (tx) => {
    const [linea] = await tx.insert(schema.lineas)
      .values({ ...entrada.valores, tipo: entrada.tipo })
      .returning({ id: schema.lineas.id })
    if (!linea) throw new Error('No se pudo crear la línea')

    if (entrada.tipo === 'CERRAMIENTO') {
      await guardarAltaCerramiento(tx, linea.id, entrada.cerramiento)
    } else if (entrada.tipo === 'ESTRUCTURA') {
      await escribirEstructura(tx, linea.id, entrada.estructura)
    }

    await actualizarTotales(tx, entrada.valores.presupuestoId)
    return linea.id
  })
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
