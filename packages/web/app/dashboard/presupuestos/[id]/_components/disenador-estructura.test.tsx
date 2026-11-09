import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { crearConfiguracionCerramiento, insertarModuloEnAnclaje, moduloDesdePlantilla, plantillaDiseno,
  type ConfiguracionCerramiento } from '@aluminior/core/estructuras'
import { DisenadorEstructura } from './disenador-estructura.tsx'
import { siguienteUnionId } from './disenador/opciones-cerramiento.tsx'

const render = (configuracion: ConfiguracionCerramiento) => renderToStaticMarkup(
  <DisenadorEstructura codigo="1OFI" anchoMm={900} altoMm={1500}
    configuracionInicial={configuracion} onConfiguracionChange={vi.fn()}
    onDimensionesChange={vi.fn()} />,
)

describe('configurador con la disposición de Productor', () => {
  it('abre vacío con familias y miniaturas, sin elementos, y expone las pestañas unificadas en la barra', () => {
    const html = renderToStaticMarkup(<DisenadorEstructura codigo="2O" anchoMm={1200} altoMm={1200} vacio
      onConfiguracionChange={vi.fn()} onDimensionesChange={vi.fn()} />)
    expect(html).toContain('CERRAMIENTO · 0 ELEMENTOS')
    expect(html).toContain('VENTANAS ABATIBLES')
    expect(html).toContain('draggable="true"')
    expect(html).toContain('aria-label="Añadir primera ventana"')
    expect(html).toContain('Código')
    expect(html).toContain('>Elegir</button>')
    expect(html).toContain('Medidas de nuevas ventanas')
    expect(html).toContain('>Uniones</button>')
    expect(html).toContain('>Opc.Herraje</button>')
    expect(html).toContain('>Cargos Adic.</button>')
    expect(html).toContain('>Acristalamiento</button>')
    expect(html).not.toContain('al-chain-drawing')
  })

  it('abre con Deshacer y Rehacer en la barra, desactivados y con su atajo', () => {
    const html = renderToStaticMarkup(<DisenadorEstructura codigo="2O" anchoMm={1200} altoMm={1200}
      onConfiguracionChange={vi.fn()} onDimensionesChange={vi.fn()} />)
    expect(html).toMatch(/<button type="button" disabled="" aria-keyshortcuts="Control\+Z" title="Deshacer \(Ctrl\+Z\)">Deshacer<\/button>/)
    expect(html).toMatch(/<button type="button" disabled="" aria-keyshortcuts="Control\+Y Control\+Shift\+Z" title="Rehacer \(Ctrl\+Y\)">Rehacer<\/button>/)
  })

  it('lista elementos y uniones en orden de creación, habilita Uniones (1) en la barra y marca la unión sin configurar', () => {
    const base = crearConfiguracionCerramiento(plantillaDiseno('2')!)
    const configuracion = insertarModuloEnAnclaje(base, moduloDesdePlantilla(plantillaDiseno('0')!),
      { moduloId: 'modulo-1', lado: 'abajo' })
    const html = render(configuracion)
    expect(html).toMatch(/>0<\/span><span>2 de 1200 x 1200/)
    expect(html).toMatch(/>2<\/span><span>\*\(UNION NO CONFIG\.\)/)
    expect(html).toContain('data-pendiente="true"')
    expect(html).toMatch(/<button type="button" aria-pressed="false" data-pendiente="true" title="Seleccionar la siguiente unión del cerramiento">Uniones \(1\)<\/button>/)
    expect(html).toContain('aria-label="Añadir ventana a la izquierda"')
    expect(html).toContain('aria-label="Añadir ventana a la derecha"')
    expect(html).toMatch(/<button type="button" class="al-insertar-ventana al-insertar-debajo" aria-label="Añadir ventana debajo">/)
    expect(html).toContain('Ancho <b class="cifra">1200</b> mm × Alto <b class="cifra">2420</b> mm')
  })

  it('siguienteUnionId prioriza la primera unión sin configurar y recorre circularmente las uniones', () => {
    const base = crearConfiguracionCerramiento(plantillaDiseno('2')!)
    const conDos = insertarModuloEnAnclaje(base, moduloDesdePlantilla(plantillaDiseno('2')!),
      { moduloId: 'modulo-1', lado: 'derecha' })
    const conTres = insertarModuloEnAnclaje(conDos, moduloDesdePlantilla(plantillaDiseno('0')!),
      { moduloId: 'modulo-1', lado: 'abajo' })
    const configuradaPrimera: ConfiguracionCerramiento = {
      ...conTres,
      uniones: [
        { ...conTres.uniones[0], codigo: 'UNIR90', grosorMm: 20 },
        conTres.uniones[1],
      ],
    }
    expect(siguienteUnionId(configuradaPrimera, null)).toBe(conTres.uniones[1].id)
    expect(siguienteUnionId(configuradaPrimera, conTres.uniones[0].id)).toBe(conTres.uniones[1].id)
    expect(siguienteUnionId(configuradaPrimera, conTres.uniones[1].id)).toBe(conTres.uniones[0].id)
  })
})

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
