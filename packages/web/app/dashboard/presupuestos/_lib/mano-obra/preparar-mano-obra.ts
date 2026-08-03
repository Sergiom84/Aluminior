/**
 * Caso de uso: de las horas tecleadas a todo lo que la línea necesita.
 *
 * Encapsula la secuencia completa —qué conceptos hay, si el entorno puede
 * guardarlos, qué dice el catálogo, cómo se valoran y qué queda sin valorar—
 * para que la server action no la conozca. La acción coordina: pide esto,
 * aplica el resultado a los valores de la línea y delega en `guardarLinea`.
 *
 * No abre conexiones: recibe `ClienteEscritura`, así que puede leer dentro de
 * la transacción de quien la llame.
 */

import { articuloDeConcepto, lineaValorable } from '@aluminior/core/precios'
import type { ClienteEscritura } from '../cliente-db.ts'
import { conceptosConHoras, type HorasTecleadas } from './conceptos.ts'
import { leerCatalogoManoObra } from './catalogo.ts'
import { resolverManoObra, type SnapshotManoObra } from './resolver-mano-obra.ts'
import {
  comprobarPersistenciaManoObra, MENSAJE_MIGRACION_MANO_OBRA,
} from './persistir-mano-obra.ts'

/**
 * Los tres desenlaces, distinguidos por el compilador.
 *
 * `SIN_HORAS` no es «preparada con cero filas»: es el caso en el que no se ha
 * tocado el catálogo ni la migración, y la acción no tiene nada que aplicar.
 * Separarlo evita que un olvido lo confunda con una preparación vacía.
 */
export type PreparacionManoObra =
  | { estado: 'SIN_HORAS' }
  | { estado: 'MIGRACION_PENDIENTE'; mensaje: string }
  | {
      estado: 'PREPARADA'
      /** Una o dos filas, listas para escribir. */
      filas: SnapshotManoObra[]
      /** false = algún concepto no tiene importe; la línea no se valora. */
      valorable: boolean
      /** Motivos y advertencias, ya en texto para el operador. */
      notas: string[]
    }

export interface EntradaPreparacion {
  horas: HorasTecleadas
  /** Tarifa del documento, no la del artículo. */
  tarifa: number
}

export async function prepararManoObra(
  cliente: ClienteEscritura,
  entrada: EntradaPreparacion,
): Promise<PreparacionManoObra> {
  const conceptos = conceptosConHoras(entrada.horas)
  if (!conceptos.length) return { estado: 'SIN_HORAS' }

  // Comprobar ANTES de insertar nada evita una línea huérfana en un despliegue
  // que todavía no tenga la 0018. Sólo aplica cuando de verdad hay filas que
  // escribir: sin horas, esta tabla no se toca.
  if (!await comprobarPersistenciaManoObra(cliente)) {
    return { estado: 'MIGRACION_PENDIENTE', mensaje: MENSAJE_MIGRACION_MANO_OBRA }
  }

  const catalogo = await leerCatalogoManoObra(
    cliente,
    conceptos.map((c) => articuloDeConcepto(c.concepto)),
    entrada.tarifa,
  )
  const { filas, guarda } = resolverManoObra({ conceptos, catalogo, tarifa: entrada.tarifa })

  // La regla del dinero, por la misma puerta que el despiece: un concepto sin
  // importe deja la línea sin valorar. Los problemas de COSTE no la tumban
  // —no cambian lo que se cobra— pero se dicen, porque callarlos dejaría el
  // margen mal calculado sin que nadie lo supiera.
  const veredicto = lineaValorable({ incalculables: 0, sinPrecio: [], manoObra: guarda })

  return {
    estado: 'PREPARADA',
    filas,
    valorable: veredicto.valorable,
    notas: [...veredicto.motivos, ...veredicto.advertencias],
  }
}
