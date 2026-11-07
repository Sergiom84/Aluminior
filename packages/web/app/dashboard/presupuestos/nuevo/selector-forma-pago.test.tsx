import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { SelectorFormaPago } from './selector-forma-pago.tsx'

describe('SelectorFormaPago', () => {
  it('ofrece efectivo y transferencia', () => {
    const html = renderToStaticMarkup(<SelectorFormaPago id="x" />)
    expect(html).toContain('>Efectivo<')
    expect(html).toContain('>Transferencia<')
  })
  it('conserva un valor anterior distinto', () => {
    const html = renderToStaticMarkup(<SelectorFormaPago id="x" valor="Giro 30 días" />)
    expect(html).toContain('>Giro 30 días<')
  })
})
