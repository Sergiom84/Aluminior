'use client'

import { useActionState } from 'react'
import { iniciarSesion, type EstadoLogin } from './acciones.ts'

/**
 * Página de acceso. Email + contraseña. SIN enlace de registro: las cuentas
 * las crea el admin en Supabase (decisión del titular, T.61).
 */
export default function LoginPage() {
  const [estado, accion, pendiente] = useActionState<EstadoLogin, FormData>(
    iniciarSesion,
    null,
  )

  return (
    <main
      className="flex min-h-screen items-center justify-center p-6"
      style={{ background: 'var(--al-page)' }}
    >
      <div
        className="w-full max-w-sm rounded-lg border p-8"
        style={{
          background: 'var(--al-surface)',
          borderColor: 'var(--al-border)',
          boxShadow: 'var(--al-shadow-lg)',
        }}
      >
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight">Aluminior</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--al-text-muted)' }}>
            Acceso para empleados de Aluminios Lara.
          </p>
        </div>

        <form action={accion} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span style={{ color: 'var(--al-text-muted)' }}>Correo</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className="rounded-md border px-3 py-2 text-sm outline-none"
              style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border)' }}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span style={{ color: 'var(--al-text-muted)' }}>Contraseña</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="rounded-md border px-3 py-2 text-sm outline-none"
              style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border)' }}
            />
          </label>

          {estado?.error && (
            <p
              role="alert"
              className="rounded-md border px-3 py-2 text-sm"
              style={{ background: 'var(--al-error-soft)', borderColor: 'var(--al-error)' }}
            >
              {estado.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pendiente}
            className="mt-1 rounded-md px-3 py-2 text-sm font-medium transition-opacity disabled:opacity-60"
            style={{ background: 'var(--al-accent)', color: 'var(--al-accent-contrast)' }}
          >
            {pendiente ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  )
}
