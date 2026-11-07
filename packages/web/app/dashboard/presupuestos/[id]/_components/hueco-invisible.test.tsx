import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import {
  cambiarInvisibleModulo, crearConfiguracionCerramiento, insertarModuloEnAnclaje, moduloDesdePlantilla, plantillaDiseno,
  type ConfiguracionCerramiento,
} from '@aluminior/core/estructuras'
import { DisenadorEstructura } from './disenador-estructura.tsx'
import { MiniaturaCerramiento } from './miniatura-cerramiento.tsx'

const render = (configuracion: ConfiguracionCerramiento) => renderToStaticMarkup(
  <DisenadorEstructura codigo="2" anchoMm={1200} altoMm={1200}
    configuracionInicial={configuracion} onConfiguracionChange={vi.fn()} onDimensionesChange={vi.fn()} />,
)

/** 2 (1200 × 1200) con un fijo 0 a la derecha, como el caso de Sergio. */
const dosElementos = () => insertarModuloEnAnclaje(crearConfiguracionCerramiento(plantillaDiseno('2')!),
  moduloDesdePlantilla(plantillaDiseno('0')!), { moduloId: 'modulo-1', lado: 'derecha' })

describe('elemento convertido en hueco (DS3)', () => {
  it('ofrece convertir en hueco desde el panel del elemento', () => {
    expect(render(dosElementos())).toMatch(/<button type="button" class="al-command" aria-pressed="false">Convertir en hueco<\/button>/)
  })

  it('en el lienzo queda en blanco y la lista lo marca como hueco', () => {
    const base = dosElementos()
    const fijo = base.modulos[1].id
    const html = render(cambiarInvisibleModulo(base, fijo, true))
    expect(html).toContain('al-hueco-invisible')
    expect(html).toMatch(new RegExp(`<g data-modulo-id="${fijo}"[^>]*data-invisible="true"`))
    // Solo la ventana 2 dibuja vidrio (dos hojas); el fijo convertido en hueco, ninguno.
    expect(render(base).match(/class="al-glass/g)).toHaveLength(3)
    expect(html.match(/class="al-glass/g)).toHaveLength(2)
    expect(html).toMatch(/0 de \d+ x \d+ · hueco/)
    expect(html).toContain('Ancho <b class="cifra">')
  })

  it('la miniatura no dibuja el hueco', () => {
    const normal = renderToStaticMarkup(<MiniaturaCerramiento configuracion={dosElementos()} />)
    const base = dosElementos()
    const hueco = renderToStaticMarkup(<MiniaturaCerramiento
      configuracion={cambiarInvisibleModulo(base, base.modulos[1].id, true)} />)
    expect(hueco.match(/class="al-frame"/g)?.length).toBe((normal.match(/class="al-frame"/g)?.length ?? 0) - 1)
  })
})

describe('panel del elemento en una fila', () => {
  it('con un solo elemento no repite Perfiles y Vidrio de la línea', () => {
    const html = render(crearConfiguracionCerramiento(plantillaDiseno('2')!))
    expect(html).not.toContain('>Perfiles<')
    expect(html).not.toContain('Aplicar a modelos iguales')
  })

  it('con varios elementos ofrece Perfiles y Vidrio propios', () => {
    expect(render(dosElementos())).toContain('>Perfiles<')
  })

  it('Actualizar es un botón principal visible', () => {
    expect(render(dosElementos())).toMatch(/<button type="button" class="al-command-primary" disabled="" aria-label="Actualizar elemento">Actualizar<\/button>/)
  })
})
