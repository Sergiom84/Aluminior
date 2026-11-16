import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { SelectorFormaPago } from './selector-forma-pago.tsx'

describe('SelectorFormaPago', () => {
  it('ofrece 01-CONTADO y 02-TRANSFERENCIA', () => {
    const html = renderToStaticMarkup(<SelectorFormaPago id="x" />)
    expect(html).toContain('>01-CONTADO<')
    expect(html).toContain('>02-TRANSFERENCIA<')
    expect(html).not.toContain('>Efectivo<')
    expect(html).not.toContain('>Transferencia<')
  })
  it('conserva un valor anterior distinto', () => {
    const giro = renderToStaticMarkup(<SelectorFormaPago id="x" valor="Giro 30 días" />)
    expect(giro).toContain('>Giro 30 días<')
    expect(giro).toContain('>01-CONTADO<')
    const efectivo = renderToStaticMarkup(<SelectorFormaPago id="x" valor="Efectivo" />)
    expect(efectivo).toContain('>Efectivo<')
    expect(efectivo).toContain('>02-TRANSFERENCIA<')
  })
})
