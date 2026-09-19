import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { ConfiguracionCerramiento } from '@aluminior/core/estructuras'

vi.mock('@react-pdf/renderer', () => ({
  G: 'g', Path: 'path', Rect: 'rect', Svg: 'svg', Text: 'span', View: 'div',
}))

import { DibujoCerramientoPdf } from './dibujo-cerramiento'

const configuracion = (codigo: string): ConfiguracionCerramiento => ({
  version: 1,
  modulos: [{ id: 'modulo-1', estructuraCodigo: codigo, anchoMm: 1200, altoMm: 1200 }],
  uniones: [],
})
const contar = (html: string, texto: string) => html.split(texto).length - 1
const posicionesHerraje = (html: string) => [...html.matchAll(
  /<rect x="([\d.]+)" y="[\d.]+" width="[\d.]+" height="[\d.]+" fill="#334155"/g,
)].map((coincidencia) => Number(coincidencia[1]))
const sentidosTrazos = (html: string) => [...html.matchAll(/<path [^>]+stroke="#475569"[^>]*>/g)]
  .map((coincidencia) => coincidencia[0])
  .filter((etiqueta) => !etiqueta.includes('stroke-dasharray'))
  .map((etiqueta) => {
    const puntos = etiqueta.match(/d="M ([\d.]+) [\d.]+ L ([\d.]+) [\d.]+ L/)?.slice(1).map(Number)
    if (!puntos) throw new Error('Trazo PDF sin coordenadas')
    return puntos[0] < puntos[1] ? 'izquierda' : 'derecha'
  })

describe('árbol de primitivas PDF de manos y manillas', () => {
  it.each([
    ['1OD', ['derecha'], 2, 3], ['1OI', ['izquierda'], 2, 3],
    ['2', ['izquierda', 'derecha'], 2, 5], ['2O', ['izquierda', 'derecha'], 3, 5],
    ['1OFI', ['izquierda'], 2, 3], ['2O+ FIJO', ['izquierda', 'derecha'], 3, 5],
    ['1O1FL', ['derecha'], 2, 3],
  ] as const)('%s conserva trazos y accesorios observados', (codigo, lados, trazos, herrajes) => {
    const html = renderToStaticMarkup(<DibujoCerramientoPdf configuracion={configuracion(codigo)} />)
    expect(contar(html, 'stroke="#475569"')).toBe(trazos)
    expect(contar(html, 'fill="#334155"')).toBe(herrajes)
    expect(sentidosTrazos(html)).toEqual(lados)
    const xs = posicionesHerraje(html)
    if (lados.length === 1) {
      expect(lados[0] === 'derecha' ? xs[0] > xs[2] : xs[0] < xs[2]).toBe(true)
    } else {
      expect(xs[0]).toBeLessThan(xs[4])
      expect(xs[4]).toBeLessThan(xs[2])
    }
    const primitivas = [...html.matchAll(/<path [^>]+stroke="#475569"[^>]*>/g)]
      .map((coincidencia) => coincidencia[0].includes('stroke-dasharray'))
    expect(primitivas).toEqual(Array.from({ length: trazos }, (_, indice) =>
      trazos > lados.length && indice === trazos - 1))
  })

  it('produce un árbol SVG real con accesorios dentro de la hoja', () => {
    const html = renderToStaticMarkup(<DibujoCerramientoPdf configuracion={configuracion('1OD')} />)
    expect(html).toContain('<svg')
    expect(html).toContain('<path')
    expect(html).toContain('<rect')
  })
})
