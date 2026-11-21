import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

vi.mock('../../_lib/preferencias-usuario-action.ts', () => ({
  guardarPrecioColocacionDefecto: vi.fn(),
}))

const { CampoPrecioColocacion } = await import('./campo-precio-colocacion.tsx')

const pintar = (precioInicial: string, precioDefecto: string) => renderToStaticMarkup(
  <CampoPrecioColocacion
    presupuestoId="11111111-1111-4111-8111-111111111111"
    precioInicial={precioInicial}
    precioDefecto={precioDefecto}
    claseEntrada="w-full"
    estiloEntrada={{ borderColor: 'gray' }} />,
)

describe('campo Precio colocación (€/h)', () => {
  it('muestra 30 por defecto sin pregunta cuando coincide con la preferencia del usuario', () => {
    const html = pintar('30.00', '30.00')
    expect(html).toContain('Precio colocación (€/h)')
    expect(html).toContain('name="precioHoraColocacion"')
    expect(html).toContain('value="30"')
    expect(html).not.toContain('¿Quieres dejar este precio por defecto?')
  })

  it('pregunta si dejar el precio por defecto cuando difiere del del usuario', () => {
    const html = pintar('40.00', '30.00')
    expect(html).toContain('value="40"')
    expect(html).toContain('¿Quieres dejar este precio por defecto?')
    expect(html).toContain('>Sí</button>')
    expect(html).toContain('>No</button>')
  })
})
