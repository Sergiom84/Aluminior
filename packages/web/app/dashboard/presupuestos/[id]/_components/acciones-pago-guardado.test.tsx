import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }) }))
vi.mock('../../_lib/pago-presupuesto-action.ts', () => ({
  guardarPresupuestoAction: vi.fn(),
  pagarPresupuestoAction: vi.fn(),
}))

const { AccionesPagoGuardado } = await import('./acciones-pago-guardado.tsx')

const pintar = (estado: string, metodoPago: string | null = null) => renderToStaticMarkup(
  <AccionesPagoGuardado presupuestoId="11111111-1111-4111-8111-111111111111"
    estado={estado} metodoPago={metodoPago} />,
)

describe('acciones Guardar y Pagar en presupuesto', () => {
  it('en PENDIENTE ofrece Guardar y Pagar activos', () => {
    const html = pintar('PENDIENTE')
    expect(html).toContain('>Guardar</button>')
    expect(html).toContain('>Pagar</button>')
    expect(html).not.toContain('disabled')
  })

  it('en ABONADO desactiva Guardar y Pagar y muestra el método aplicado', () => {
    const metalico = pintar('ABONADO', 'METALICO')
    expect(metalico).toMatch(/<button[^>]*disabled[^>]*>Guardar<\/button>/)
    expect(metalico).toMatch(/<button[^>]*disabled[^>]*>Pagar<\/button>/)
    expect(metalico).toContain('(Metálico)')

    expect(pintar('ABONADO', 'TRANSFERENCIA')).toContain('(Transferencia)')
  })
})
