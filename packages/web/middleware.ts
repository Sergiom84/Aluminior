import { type NextRequest } from 'next/server'
import { actualizarSesion } from './lib/supabase/middleware.ts'

/**
 * Gate de autenticación de TODA la app (módulo #1, anexo T.61).
 *
 * Sustituye al stopgap de Basic Auth (T.60). Ahora el gate es la SESIÓN de
 * Supabase: sin sesión -> /login. Falla cerrado (ver `actualizarSesion`).
 */
export async function middleware(request: NextRequest) {
  return await actualizarSesion(request)
}

export const config = {
  /**
   * Protege todo salvo los assets internos de Next y ficheros estáticos.
   * `/login` NO se excluye aquí a propósito: el middleware la deja pasar por
   * ruta pública, pero así también gestiona el redirect a /dashboard si ya
   * hay sesión.
   */
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
