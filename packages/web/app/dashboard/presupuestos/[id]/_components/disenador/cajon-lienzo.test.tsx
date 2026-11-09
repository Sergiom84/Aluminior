import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { CajonPersiana } from './cajon-lienzo.tsx'

describe('cajón en el lienzo', () => {
  it('dibuja el cajón y las guías laterales cuando están elegidas', () => {
    const html = renderToStaticMarkup(createElement(CajonPersiana, {
      rect: { x: 0, y: 0, ancho: 1200, alto: 1200 },
      altoCajonMm: 155, altoModuloMm: 1200, guiaCentral: true, conGuias: true,
    }))
    expect(html).toContain('al-cajon')
    expect(html).toContain('al-guia-persiana')
    expect(html).toContain('al-guia-central')
    expect(html).toContain('Cajón 155 mm')
  })

  it('no dibuja guías si no se han elegido', () => {
    const html = renderToStaticMarkup(createElement(CajonPersiana, {
      rect: { x: 10, y: 20, ancho: 800, alto: 1000 },
      altoCajonMm: 185, altoModuloMm: 1601, guiaCentral: false, conGuias: false,
    }))
    expect(html).toContain('al-cajon')
    expect(html).not.toContain('al-guia-persiana')
    expect(html).not.toContain('al-guia-central')
  })
})
