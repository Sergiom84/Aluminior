import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { plantillaDiseno } from '@aluminior/core/estructuras'
import { DibujoEstructura } from './dibujo-estructura'

const contar = (html: string, texto: string) => html.split(texto).length - 1
const sentidosTrazos = (html: string) => [...html.matchAll(
  /<path d="M ([\d.]+) [\d.]+ L ([\d.]+) [\d.]+ L [^"]+" class="al-opening-line"/g,
)].map((coincidencia) => Number(coincidencia[1]) < Number(coincidencia[2]) ? 'izquierda' : 'derecha')
const posiciones = (html: string, clase: string) => [...html.matchAll(
  new RegExp(`<g[^>]*class="${clase}"[^>]*><rect x="([\\d.]+)"`, 'g'),
)].map((coincidencia) => Number(coincidencia[1]))
const render = (codigo: string, compacto = false) => renderToStaticMarkup(
  <DibujoEstructura plantilla={plantillaDiseno(codigo)!} compacto={compacto} />,
)
const ejeTravesano = (altoMm: number, fiMm: number) => {
  const plantilla = plantillaDiseno('1OFI')!
  const html = renderToStaticMarkup(<DibujoEstructura plantilla={plantilla}
    anchoMm={900} altoMm={altoMm}
    modulo={{ id: 'modulo-1', estructuraCodigo: '1OFI', anchoMm: 900, altoMm, fiMm }} />)
  const coincidencia = html.match(/<rect x="[\d.]+" y="([\d.]+)" width="[\d.]+" height="([\d.]+)" class="al-traverse"/)
  if (!coincidencia) throw new Error('Travesaño no renderizado')
  return Number(coincidencia[1]) + Number(coincidencia[2]) / 2
}

describe('SVG real de manos y manillas', () => {
  it.each([
    ['1OD', ['derecha'], 1, 1],
    ['1OI', ['izquierda'], 1, 1],
    ['2', ['izquierda', 'derecha'], 1, 0],
    ['2O', ['izquierda', 'derecha'], 1, 1],
    ['1OFI', ['izquierda'], 1, 1],
    ['2O+ FIJO', ['izquierda', 'derecha'], 1, 1],
    ['1O1FL', ['derecha'], 1, 1],
  ] as const)('%s renderiza orientación, manillas y oscilo observados',
    (codigo, lados, manillas, triangulosOscilo) => {
      const html = render(codigo)
      expect(sentidosTrazos(html)).toEqual(lados)
      expect(contar(html, 'class="al-handle"')).toBe(manillas)
      expect(contar(html, 'class="al-opening-line al-opening-tilt"')).toBe(triangulosOscilo)
      expect(contar(html, 'class="al-hinge"')).toBe(codigo === '2' || codigo === '2O' || codigo === '2O+ FIJO' ? 2 : 1)
      const bisagras = posiciones(html, 'al-hinge')
      const tiradores = posiciones(html, 'al-handle')
      if (lados.length === 1) {
        expect(lados[0] === 'derecha' ? bisagras[0] > tiradores[0] : bisagras[0] < tiradores[0]).toBe(true)
      } else {
        expect(bisagras[0]).toBeLessThan(tiradores[0])
        expect(tiradores[0]).toBeLessThan(bisagras[1])
      }
    })

  it('mantiene triángulos pero omite accesorios en la variante compacta', () => {
    const html = render('2O', true)
    expect(contar(html, 'class="al-opening-line al-opening-tilt"')).toBe(1)
    expect(html).not.toContain('class="al-handle"')
    expect(html).not.toContain('class="al-hinge"')
  })

  it.each([
    [1500, 300, 377.2],
    [1800, 300, 391.3333333333333],
    [1800, 400, 367.77777777777777],
  ])('sitúa el eje 1OFI compartido para alto %s y FI %s', (altoMm, fiMm, eje) => {
    expect(ejeTravesano(altoMm, fiMm)).toBeCloseTo(eje)
  })
})
