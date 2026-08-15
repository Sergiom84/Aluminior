/** Marco de aplicación inspirado en la navegación operativa de Productor. */

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
 * Módulos visibles y enlazables. La barra horizontal conserva la pantalla útil
 * para documentos y tablas, en lugar de consumirla con un sidebar genérico.
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
    <div className="al-app-shell">
      <header className="al-appbar">
        <div className="al-brand">
          <span className="text-[15px] font-semibold tracking-tight">Aluminior</span>
          <span className="text-[10px] uppercase tracking-[0.1em]" style={{ color: 'var(--al-sidebar-text)' }}>
            Aluminios Lara
          </span>
        </div>

        <nav className="al-primary-nav" aria-label="Módulos">
          <ul className="flex">
          {MODULOS.map((m) => {
            const activo = m.id === actual.id
            return (
              <li key={m.id}>
                <Link
                  href={m.href}
                  aria-current={activo ? 'page' : undefined}
                  title={m.descripcion}
                >
                  <span>{m.nombre}</span>
                  {!m.listo && (
                    <span className="ml-1 text-[9px] uppercase" style={{ color: 'var(--al-sidebar-text)' }}>pend.</span>
                  )}
                </Link>
              </li>
            )
          })}
          </ul>
        </nav>

        <form action={cerrarSesion} className="al-session-form">
          <button type="submit" className="al-session-exit" style={{ color: 'var(--al-sidebar-text)' }}>
            Salir
          </button>
        </form>
      </header>

      <main className="al-app-main">{children}</main>
    </div>
  )
}
