/**
 * Prueba de TIPOS (T.71.4): `reservarNumeracion` sólo acepta una transacción
 * abierta (`Tx`), nunca `Db`. No es una prueba de vitest —no hay
 * `describe`/`it`, y este fichero no matchea `**\/*.test.ts`— es una
 * comprobación que hace `tsc --noEmit`: si `reservarNumeracion` volviera a
 * aceptar `Db` (por ejemplo, ensanchando `Tx` de vuelta a `ClienteEscritura`),
 * el `@ts-expect-error` deja de ser necesario y el typecheck falla con
 * "Unused '@ts-expect-error' directive".
 */
import type { crearDb } from '@aluminior/db'
import { reservarNumeracion, type EntradaNumeracion } from './index.ts'

declare const db: ReturnType<typeof crearDb>

// @ts-expect-error reservarNumeracion exige una transacción (Tx), no una conexión suelta (Db).
void reservarNumeracion(db, { modo: 'MANUAL', serie: 'A', numero: 1, revision: 0 })

/**
 * El contrato público de `EntradaNumeracion` (el que sale de `index.ts`) no
 * debe tener el gancho de pausa: si volviera a aparecer, la propiedad dejaría
 * de ser un error de acceso y el `@ts-expect-error` de abajo quedaría sin usar.
 */
declare const entradaNumeroNuevo: Extract<EntradaNumeracion, { modo: 'NUMERO_NUEVO' }>
// @ts-expect-error `pausaTrasLecturaMs`/`_pausaTrasLecturaMs` no forma parte del contrato público.
void entradaNumeroNuevo.pausaTrasLecturaMs
// @ts-expect-error ídem, con guion bajo.
void entradaNumeroNuevo._pausaTrasLecturaMs
