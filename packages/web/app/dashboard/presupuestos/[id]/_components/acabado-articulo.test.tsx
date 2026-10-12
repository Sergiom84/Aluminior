import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it, vi } from 'vitest'
import { LineaPresupuesto } from './linea-presupuesto.tsx'

vi.mock('./boton-borrar-linea.tsx', () => ({ BotonBorrarLinea: () => null }))
vi.mock('./editar-articulo.tsx', () => ({ EditarArticulo: () => null }))
vi.mock('./editar-cerramiento.tsx', () => ({ EditarCerramiento: () => null }))

it.each(['ACABADO-ELEGIDO', null])('la fila reabierta muestra el acabado persistido %s', acabadoArticuloCodigo => {
  const html = renderToStaticMarkup(<table><tbody><LineaPresupuesto editable={false}
    linea={{ id: 'sintetica', orden: 1, tipo: 'ARTICULO', articuloCodigo: 'QA-ARTICULO', acabadoArticuloCodigo,
      descripcion: 'Artículo sintético', referencia: null, anchoMm: 850.25, altoMm: 1900.5, cantidad: '2',
      precioUnitario: '7.0000', descuento: '0', total: '14.00', valoracionCompleta: true, avisoValoracion: null }}
    resultado={null} manoObra={[]} presupuestoId="presupuesto-sintetico" despiece={[]}
    edicion={null} series={[]} acabados={[]} /></tbody></table>)
  const celdas = Array.from(html.matchAll(/<td[^>]*>(.*?)<\/td>/g), m => m[1])
  expect(celdas[3]).toBe(acabadoArticuloCodigo ?? '—')
  expect(html).not.toContain('UNI')
})
