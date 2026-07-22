import { createBrowserClient } from '@supabase/ssr'

/**
 * Cliente Supabase para NAVEGADOR (Client Components).
 *
 * NOTA: hoy el flujo de auth (login, logout, gate) es 100% de servidor
 * —server actions + middleware— con `SUPABASE_URL`/`SUPABASE_ANON_KEY`. Este
 * cliente se deja preparado (patrón canónico de `@supabase/ssr`) por si en el
 * futuro algún Client Component necesita hablar con Supabase directamente.
 *
 * Requiere que las claves estén expuestas al navegador con prefijo
 * `NEXT_PUBLIC_` (Next solo inyecta esas al bundle de cliente). Mientras no se
 * use, no hace falta definirlas.
 */
export function crearClienteNavegador() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
