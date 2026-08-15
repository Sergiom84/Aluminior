/**
 * Email del usuario de la sesión, para el campo `creado_por` (antes vacío por
 * no haber auth, T.61). Nunca rompe al llamador: ante cualquier fallo devuelve
 * null y quien la use sigue su curso igual.
 */

import { crearClienteServidor } from '../../../../lib/supabase/servidor.ts'
import { headers } from 'next/headers'
import { qaLocalActiva, USUARIO_QA_LOCAL } from '../../../../lib/qa-local.ts'

export async function usuarioActual(): Promise<string | null> {
  try {
    const host = (await headers()).get('host')
    if (qaLocalActiva({ host })) return USUARIO_QA_LOCAL

    const supabase = await crearClienteServidor()
    const { data, error } = await supabase.auth.getClaims()
    if (error || !data?.claims) return null
    const claims = data.claims as { email?: string; sub?: string }
    return claims.email ?? claims.sub ?? null
  } catch {
    return null
  }
}
