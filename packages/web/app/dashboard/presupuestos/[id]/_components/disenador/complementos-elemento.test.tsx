import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { ModuloCerramiento } from '@aluminior/core/estructuras'
import { ComplementosElemento } from './complementos-elemento.tsx'

const modulo: ModuloCerramiento = { id: 'm1', estructuraCodigo: '2O', anchoMm: 1200, altoMm: 1700 }
const catalogo = {
  compactos: [{ codigo: 'COM001', descripcion: 'CAJON DE PVC' }],
  tapajuntas: [],
  guias: [{ codigo: 'GMG010', descripcion: 'GUIA COMPACTO DE 110 MM' },
    { codigo: 'PSG001', descripcion: 'GUIA PARA RECOGEDOR 90mm', sinPrecio: true }],
}

describe('complementos del elemento', () => {
  it('muestra guías y la opción de guía central al elegir compacto', () => {
    const html = renderToStaticMarkup(createElement(ComplementosElemento, {
      modulo: { ...modulo, compacto: { estructuraCodigo: 'COM001', altoCajonMm: 185, descontarHueco: true } },
      borrador: {},
      catalogo,
      onChange: () => undefined,
    }))
    expect(html).toContain('Guía izquierda')
    expect(html).toContain('Guía derecha')
    expect(html).toContain('Guía Central')
    expect(html).toContain('>No<')
    expect(html).toContain('PSG001 · GUIA PARA RECOGEDOR 90mm (sin precio)')
    expect(html).toContain('GMG010 · GUIA COMPACTO DE 110 MM<')
    expect(html).toContain('185')
  })

  it('conserva la guía antigua guardada con el código del perfil', () => {
    const html = renderToStaticMarkup(createElement(ComplementosElemento, {
      modulo: { ...modulo, compacto: { estructuraCodigo: 'COM001', altoCajonMm: 155, guiaIzquierda: 'PSG100' } },
      borrador: {},
      catalogo,
      onChange: () => undefined,
    }))
    expect(html).toContain('<option value="PSG100" selected="">PSG100</option>')
  })
})
