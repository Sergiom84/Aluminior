import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it, vi } from 'vitest'
import { FilaPdf } from './fila.tsx'

// La prueba comprueba el contenido que recibe el renderer, sin rasterizar fuentes.
vi.mock('@react-pdf/renderer', () => ({
  Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  View: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  StyleSheet: { create: <T,>(estilos: T) => estilos },
}))
vi.mock('./dibujo-cerramiento', () => ({ DibujoCerramientoPdf: () => null }))

it.each(['ACABADO-ELEGIDO', null])('el contenido imprimible conserva el acabado de artículo %s', acabadoArticuloCodigo => {
  const html = renderToStaticMarkup(<FilaPdf l={{ id: 'sintetica', orden: 1, tipo: 'ARTICULO',
    acabadoArticuloCodigo, descripcion: 'Artículo sintético', referencia: null,
    anchoMm: 850.25, altoMm: 1900.5, cantidad: '2', precioUnitario: '7.0000', total: '14.00',
    valoracionCompleta: true, avisoValoracion: null, cerramiento: null }} />)
  expect(html).toContain(`Acabado: ${acabadoArticuloCodigo ?? '—'}`)
  expect(html).not.toContain('UNI')
})
