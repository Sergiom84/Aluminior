import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }) }))
vi.mock('../_lib/borrar-presupuesto-action.ts', () => ({ eliminarPresupuesto: vi.fn() }))

const { EliminarPresupuestoBoton, textoConfirmacionBorrado } = await import('./eliminar-presupuesto-boton.tsx')

const pintar = (estado: string) => renderToStaticMarkup(
  <EliminarPresupuestoBoton presupuestoId="11111111-1111-4111-8111-111111111111"
    numero={260012} revision={0} estado={estado} origen="detalle" />)

describe('botón Eliminar presupuesto', () => {
  it('la confirmación nombra el documento completo y avisa de que no se deshace', () => {
    expect(textoConfirmacionBorrado(260012, 0))
      .toBe('¿Eliminar el presupuesto 260012 · Revisión 0? No se puede deshacer.')
  })

  it('un presupuesto pendiente ofrece Eliminar activo', () => {
    const html = pintar('PENDIENTE')
    expect(html).toContain('>Eliminar</button>')
    expect(html).not.toContain('disabled')
  })

  it.each(['ACEPTADO', 'RECHAZADO', 'ANULADO'])('un presupuesto %s lo muestra desactivado', (estado) => {
    expect(pintar(estado)).toMatch(/<button[^>]*disabled[^>]*>Eliminar<\/button>/)
  })
})
