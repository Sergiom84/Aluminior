import type { crearDb } from '@aluminior/db'

type Db = ReturnType<typeof crearDb>

/**
 * Conexión o transacción, indistintamente.
 *
 * Todo módulo que escriba debe aceptar este tipo en vez de abrir su propia
 * conexión: es lo que permite que varias escrituras de un mismo caso de uso
 * confirmen o se deshagan juntas. Un módulo que llamara a `crearDb()` por su
 * cuenta escribiría fuera de la transacción de quien lo invoca y dejaría
 * huérfanos al fallar.
 */
export type ClienteEscritura = Db | Parameters<Parameters<Db['transaction']>[0]>[0]
