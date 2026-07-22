import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Cliente Supabase para SERVIDOR (Server Components, Server Actions, Route
 * Handlers). Lee y escribe la sesión en las cookies de la petición mediante el
 * patrón `getAll`/`setAll` de `@supabase/ssr`.
 *
 * Usa `SUPABASE_URL` y `SUPABASE_ANON_KEY` (variables de servidor, cargadas
 * desde el `.env` de la raíz por `next.config.mjs`). La clave anónima es pública
 * por diseño en Supabase: NUNCA se usa aquí la `service_role`.
 *
 * Para proteger datos SIEMPRE se valida el token con `getClaims()`/`getUser()`,
 * nunca con `getSession()` en servidor (no garantiza revalidar el JWT).
 */
export async function crearClienteServidor() {
  const url = process.env.SUPABASE_URL
  const anon = process.env.SUPABASE_ANON_KEY
  if (!url || !anon) {
    // Falla cerrado: sin configuración no hay forma de verificar la sesión.
    throw new Error('Auth no configurada: faltan SUPABASE_URL / SUPABASE_ANON_KEY.')
  }

  const cookieStore = await cookies()

  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // `setAll` llamado desde un Server Component (cookies de solo lectura).
          // No pasa nada: el middleware refresca la sesión en cada petición.
        }
      },
    },
  })
}
