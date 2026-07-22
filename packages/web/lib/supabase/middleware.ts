import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/** Rutas públicas: sólo el login y su server action. Todo lo demás exige sesión. */
function esRutaPublica(pathname: string): boolean {
  return pathname === '/login'
}

/**
 * Gate de sesión (sustituye al Basic Auth del stopgap T.60).
 *
 * Refresca la sesión de Supabase (patrón `updateSession` de `@supabase/ssr`) y
 * decide el acceso:
 *   - sin sesión y ruta protegida  -> redirect a /login
 *   - con sesión y ruta /login     -> redirect a /dashboard
 *
 * FALLA CERRADO: si la auth no está configurada o la verificación del token
 * lanza, se trata como "sin sesión" y se redirige a /login. Nunca deja pasar
 * ante la duda (la app sirve NIF de clientes).
 *
 * La verificación usa `getClaims()`, que valida la firma del JWT contra las
 * claves públicas del proyecto (JWKS). NUNCA `getSession()` en servidor.
 */
export async function actualizarSesion(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl

  let supabaseResponse = NextResponse.next({ request })

  const url = process.env.SUPABASE_URL
  const anon = process.env.SUPABASE_ANON_KEY

  // Sin configuración no se puede verificar nada -> falla cerrado.
  if (!url || !anon) {
    if (esRutaPublica(pathname)) return supabaseResponse
    const destino = request.nextUrl.clone()
    destino.pathname = '/login'
    return NextResponse.redirect(destino)
  }

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }
        supabaseResponse = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options)
        }
      },
    },
  })

  // IMPORTANTE: no metas lógica entre crear el cliente y getClaims(); un fallo
  // aquí podría dejar sesiones sin refrescar y cerrar sesión a destiempo.
  let haySesion = false
  try {
    const { data, error } = await supabase.auth.getClaims()
    haySesion = !error && !!data?.claims
  } catch {
    haySesion = false // falla cerrado
  }

  // Ya autenticado y visitando /login -> al dashboard.
  if (haySesion && pathname === '/login') {
    const destino = request.nextUrl.clone()
    destino.pathname = '/dashboard'
    return NextResponse.redirect(destino)
  }

  // Sin sesión y ruta protegida -> al login.
  if (!haySesion && !esRutaPublica(pathname)) {
    const destino = request.nextUrl.clone()
    destino.pathname = '/login'
    return NextResponse.redirect(destino)
  }

  return supabaseResponse
}
