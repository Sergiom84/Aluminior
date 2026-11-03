import { headers } from 'next/headers'
import { crearClienteServidor } from '../supabase/servidor.ts'
import { qaLocalActiva } from '../qa-local.ts'

export async function sesionValida() {
  try {
    if (qaLocalActiva({ host: (await headers()).get('host') })) return true
    const supabase = await crearClienteServidor()
    const { data, error } = await supabase.auth.getClaims()
    return !error && Boolean(data?.claims)
  } catch {
    return false
  }
}
