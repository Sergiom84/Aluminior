import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'
import { CatalogoInferior } from './catalogo-inferior.tsx'

const catalogo = (elegir = false) => renderToStaticMarkup(
  <CatalogoInferior preparada={null} onPreparar={() => undefined} onArrastre={() => undefined}
    onColocar={() => undefined} onElegir={elegir ? () => undefined : undefined} />,
)

it('ofrece el código de la ventana sin que viaje con el formulario de la línea', () => {
  const html = catalogo()
  expect(html).toContain('Código')
  expect(html).toContain('>Elegir</button>')
  expect(html).toMatch(/auto[Cc]omplete="off"/)
  expect(html).not.toMatch(/\sname="/)
  expect(html).not.toContain('type="submit"')
  expect(html).not.toContain('data-foco-inicial')
})

it('en Añadir ventana el foco inicial es el código, no la familia', () => {
  const html = catalogo(true)
  expect(html.match(/data-foco-inicial/g)).toHaveLength(1)
  expect(html).toMatch(/<input[^>]*data-foco-inicial="true"/)
})
