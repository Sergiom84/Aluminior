/**
 * Tipo de cliente TRANSACCIONAL (T.71.4).
 *
 * `pg_advisory_xact_lock` se libera al `COMMIT`/`ROLLBACK` de la transacción
 * que lo pidió. Si `reservarNumeracion` aceptara `Db | Tx` (como
 * `ClienteEscritura` en el resto del proyecto), nada impediría llamarla con
 * una conexión suelta: el lock se soltaría en la sentencia siguiente y dejaría
 * de servir de nada. Aquí el tipo es sólo `Tx`, derivado del propio
 * `Db['transaction']`, para que ese error se vea en compilación, no en una
 * carrera de producción.
 */
import type { crearDb } from '@aluminior/db'

type Db = ReturnType<typeof crearDb>

export type Tx = Parameters<Parameters<Db['transaction']>[0]>[0]
