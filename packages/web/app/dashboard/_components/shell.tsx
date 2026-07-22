/**
 * Shell modular del dashboard.
 *
 * Misma estructura que F-Gestor-IA: navegación lateral fija + conmutación de
 * módulo por parámetro de consulta (`?module=`). Mantener el módulo en la URL
 * hace que cada vista sea enlazable y compartible, que en un ERP importa: se
 * pasan enlaces a pantallas concretas entre compañeros.
 */

import Link from 'next/link'
import { cerrarSesion } from '../../login/acciones.ts'

export interface Modulo {
  id: string
  nombre: string
  descripcion: string
  /** Ruta real. Los módulos sin implementar caen en el marcador de posición. */
  href: string
  listo: boolean
}

/**
 * Módulos de Aluminior. Equivalen a los menús del sistema original
 * (Ficheros · Compras · Ventas · Utilidades), reagrupados por cómo se usan
 * en el día a día en vez de por cómo estaban en el menú heredado.
 */
export const MODULOS: Modulo[] = [
  { id: 'inicio', nombre: 'Inicio', descripcion: 'Resumen de actividad', href: '/dashboard', listo: true },
  { id: 'articulos', nombre: 'Artículos', descripcion: 'Materiales, familias y tarifas', href: '/dashboard/articulos', listo: true },
  { id: 'clientes', nombre: 'Clientes', descripcion: 'Clientes, potenciales y obras', href: '/dashboard/clientes', listo: true },
  { id: 'estructuras', nombre: 'Estructuras', descripcion: 'Tipos de hueco configurables', href: '/dashboard/estructuras', listo: true },
  { id: 'presupuestos', nombre: 'Presupuestos', descripcion: 'Presupuestos y ofertas', href: '/dashboard/presupuestos', listo: true },
  { id: 'produccion', nombre: 'Producción', descripcion: 'Despiece, corte y fabricación', href: '/dashboard/produccion', listo: true },
  { id: 'compras', nombre: 'Compras', descripcion: 'Proveedores, pedidos y costes', href: '/dashboard/compras', listo: true },
  { id: 'informes', nombre: 'Informes', descripcion: 'Listados y estadísticas', href: '/dashboard?module=informes', listo: false },
]

export function Shell({
  moduloActivo,
  children,
}: {
  moduloActivo: string
  children: React.ReactNode
}) {
  const actual = MODULOS.find((m) => m.id === moduloActivo) ?? MODULOS[0]

  return (
    <div className="flex min-h-screen">
      <nav
        className="flex w-60 shrink-0 flex-col"
        style={{ background: 'var(--al-sidebar)' }}
        aria-label="Módulos"
      >
        <div className="px-5 py-5">
          <span className="text-lg font-semibold tracking-tight text-white">
            Aluminior
          </span>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--al-sidebar-text)' }}>
            Aluminios Lara
          </p>
        </div>

        <ul className="flex flex-1 flex-col gap-0.5 px-2">
          {MODULOS.map((m) => {
            const activo = m.id === actual.id
            return (
              <li key={m.id}>
                <Link
                  href={m.href}
                  aria-current={activo ? 'page' : undefined}
                  className="flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors"
                  style={{
                    background: activo ? 'var(--al-accent)' : 'transparent',
                    color: activo
                      ? 'var(--al-accent-contrast)'
                      : 'var(--al-sidebar-text)',
                  }}
                >
                  <span>{m.nombre}</span>
                  {/* Marca honesta de lo que aún no existe. */}
                  {!m.listo && (
                    <span
                      className="rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide"
                      style={{ background: 'rgb(255 255 255 / 0.08)', color: 'var(--al-sidebar-text)' }}
                    >
                      pend.
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="flex items-baseline gap-3 border-b px-8 py-5"
          style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border)' }}
        >
          <h1 className="text-xl font-semibold">{actual.nombre}</h1>
          <p className="text-sm" style={{ color: 'var(--al-text-muted)' }}>
            {actual.descripcion}
          </p>
          {/* Logout: server action que limpia la sesión de Supabase (T.61). */}
          <form action={cerrarSesion} className="ml-auto">
            <button
              type="submit"
              className="rounded-md border px-3 py-1.5 text-sm transition-colors"
              style={{ borderColor: 'var(--al-border)', color: 'var(--al-text-muted)' }}
            >
              Salir
            </button>
          </form>
        </header>

        <main className="min-w-0 flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
