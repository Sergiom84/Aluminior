/**
 * Descuento de galce del vidrio: hoja consulta `vidrio_galce`, fijo consulta
 * `vidrio_galce_fijo` (el vidrio de un fijo se descuenta del corte del CERCO,
 * no de una hoja). Extraído de `acciones.ts` en T.70.2 SIN cambiar
 * comportamiento: misma coincidencia exacta por (serie, perfil), mismo
 * `limit(1)`, ausencia de fila sigue devolviendo `null`.
 *
 * El aviso de "sin descuento de galce medido" y la llamada a `medidasVidrio`
 * siguen en `acciones.ts`: este módulo sólo resuelve el delta.
 */

import { and, eq } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import type { ClienteEscritura } from '../cliente-db.ts'

/**
 * Delta de galce en mm para (serie, perfil) en el contexto dado.
 * `null` si no hay fila medida.
 */
export async function leerGalceVidrio(
  cliente: ClienteEscritura,
  contexto: 'HOJA' | 'FIJO',
  serieCodigo: string,
  perfilCodigo: string,
): Promise<number | null> {
  const tabla = contexto === 'FIJO' ? schema.vidrioGalceFijo : schema.vidrioGalce
  const [galce] = await cliente.select().from(tabla)
    .where(and(
      eq(tabla.serieCodigo, serieCodigo),
      eq(tabla.perfilCodigo, perfilCodigo),
    )).limit(1)
  return galce ? Number(galce.deltaMm) : null
}
