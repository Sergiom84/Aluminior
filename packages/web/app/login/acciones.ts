'use server'

import { redirect } from 'next/navigation'
import { crearClienteServidor } from '../../lib/supabase/servidor.ts'

export type EstadoLogin = { error: string } | null

/**
 * Inicia sesión con email + contraseña (`signInWithPassword`).
 *
 * NO hay registro público (decisión del titular, T.61): las cuentas las crea
 * el admin en el panel de Supabase. Por eso el mensaje de error es genérico:
 * no distingue "usuario no existe" de "contraseña incorrecta".
 */
export async function iniciarSesion(_previo: EstadoLogin, datos: FormData): Promise<EstadoLogin> {
  const email = String(datos.get('email') ?? '').trim()
  const password = String(datos.get('password') ?? '')
  if (!email || !password) {
    return { error: 'Introduce el correo y la contraseña.' }
  }

  const supabase = await crearClienteServidor()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return { error: 'Correo o contraseña incorrectos.' }
  }

  // Fuera del try: `redirect` lanza NEXT_REDIRECT a propósito.
  redirect('/dashboard')
}

/** Cierra la sesión y vuelve al login. */
export async function cerrarSesion() {
  const supabase = await crearClienteServidor()
  await supabase.auth.signOut()
  redirect('/login')
}
