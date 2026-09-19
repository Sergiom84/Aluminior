import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { crearConfiguracionCerramiento, plantillaDiseno,
  type ConfiguracionCerramiento } from '@aluminior/core/estructuras'
import { DisenadorEstructura } from './disenador-estructura.tsx'

const render = (configuracion: ConfiguracionCerramiento) => renderToStaticMarkup(
  <DisenadorEstructura codigo="1OFI" anchoMm={900} altoMm={1500}
    configuracionInicial={configuracion} onConfiguracionChange={vi.fn()}
    onDimensionesChange={vi.fn()} />,
)

describe('campo FI del configurador', () => {
  it('muestra el default explícito con etiqueta y unidad', () => {
    const html = render(crearConfiguracionCerramiento(plantillaDiseno('1OFI')!))

    expect(html).toContain('FIJO INFERIOR')
    expect(html).toContain('value="300"')
    expect(html).toContain('<span>mm</span>')
  })

  it('mantiene distinguible la ausencia de FI en una v1', () => {
    const html = render({
      version: 1,
      modulos: [{ id: 'modulo-1', estructuraCodigo: '1OFI', anchoMm: 900, altoMm: 1500 }],
      uniones: [],
    })

    expect(html).toContain('FIJO INFERIOR')
    expect(html).toMatch(/type="number" step="any" value=""/)
    expect(html).not.toContain('value="300"')
  })
})
