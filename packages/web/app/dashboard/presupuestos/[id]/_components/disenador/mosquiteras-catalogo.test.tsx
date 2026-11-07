import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it, vi } from 'vitest'

vi.mock('../../../_lib/acciones.ts', () => ({ anyadirLinea: vi.fn() }))

const { MosquiterasCatalogo, nombreModelo } = await import('./mosquiteras-catalogo.tsx')

const modelos = [
  { codigo: 'PSM001', descripcion: '(PS) MOSQUITERA ENROLLABLE' },
  { codigo: 'PSM004', descripcion: 'MOSQUITERA PLISADA' },
]

it('quita el prefijo de catálogo del nombre y deja intacto el resto', () => {
  expect(nombreModelo('(PS) MOSQUITERA CORREDERA')).toBe('MOSQUITERA CORREDERA')
  expect(nombreModelo('MOSQUITERA PLISADA')).toBe('MOSQUITERA PLISADA')
})

it('ofrece un modelo por artículo y los campos de medidas sin enviar el formulario exterior', () => {
  const html = renderToStaticMarkup(
    <MosquiterasCatalogo presupuestoId="p" modelos={modelos} acabados={[{ codigo: 'L', descripcion: 'L. BLANCO' }]} />)
  expect(html.match(/role="option"/g)).toHaveLength(2)
  expect(html).toContain('MOSQUITERA ENROLLABLE')
  expect(html).not.toContain('(PS)')
  expect(html).toContain('PSM004')
  for (const etiqueta of ['Ancho (mm)', 'Alto (mm)', 'Cdad.', 'Acabado', 'Ubicación', 'Añadir mosquitera']) {
    expect(html).toContain(etiqueta)
  }
  // Dentro del formulario de la línea, ningún campo propio puede viajar con él.
  expect(html).not.toMatch(/\sname="/)
  expect(html).toContain('type="button"')
  expect(html).not.toContain('type="submit"')
})
