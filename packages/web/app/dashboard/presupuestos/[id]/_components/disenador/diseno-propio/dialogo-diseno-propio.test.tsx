import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import {
  actualizarDisenoPropioModuloCerramiento, cambiarBarrotilloHuecoDisenoPropio,
  cambiarInvisibleModulo, cambiarVidrioHuecoDisenoPropio,
  crearConfiguracionCerramiento, dividirHuecoDisenoPropio,
  plantillaDiseno, sembrarDisenoPropioModulo,
} from '@aluminior/core/estructuras'
import { DisenadorEstructura } from '../../disenador-estructura.tsx'
import { configuracionTrasAceptarDiseno } from './aplicar-diseno.ts'
import { DialogoDisenoPropio } from './dialogo-diseno-propio.tsx'
import { PanelTravesanoDiseno } from './panel-travesano-diseno.tsx'

vi.mock('../../../../_lib/vidrios/acciones.ts', () => ({ buscarVidrios: vi.fn(async () => []) }))

describe('editor `Diseño V3` en el configurador (DS4 paso 3)', () => {
  it('muestra `Diseño específico` en el elemento seleccionado, marca cuando está activo y lo oculta en un hueco invisible', () => {
    const base = crearConfiguracionCerramiento(plantillaDiseno('0')!)
    const htmlNormal = renderToStaticMarkup(
      <DisenadorEstructura codigo="0" anchoMm={1200} altoMm={1200}
        configuracionInicial={base} onConfiguracionChange={vi.fn()} onDimensionesChange={vi.fn()} />,
    )
    expect(htmlNormal).toContain('>Diseño específico</button>')

    const sembrado = sembrarDisenoPropioModulo(base.modulos[0]!)!
    const dividido = dividirHuecoDisenoPropio(sembrado, 0, { posicion: 'HB', tipoCota: 2, cotaMm: 400 })
    const activa = actualizarDisenoPropioModuloCerramiento(base, 'modulo-1', dividido)
    const htmlActiva = renderToStaticMarkup(
      <DisenadorEstructura codigo="0" anchoMm={1200} altoMm={1200}
        configuracionInicial={activa} onConfiguracionChange={vi.fn()} onDimensionesChange={vi.fn()} />,
    )
    expect(htmlActiva).toContain('data-excepcion="true"')
    expect(htmlActiva).toContain('>Diseño específico (activo)</button>')

    const invisible = cambiarInvisibleModulo(base, 'modulo-1', true)
    const htmlInvisible = renderToStaticMarkup(
      <DisenadorEstructura codigo="0" anchoMm={1200} altoMm={1200}
        configuracionInicial={invisible} onConfiguracionChange={vi.fn()} onDimensionesChange={vi.fn()} />,
    )
    expect(htmlInvisible).not.toContain('Diseño específico')
  })

  it('renderiza el diálogo sobre un fijo, sobre un diseño con vidrio propio + barrotillo BI y sobre una familia aún no soportada', () => {
    const base = crearConfiguracionCerramiento(plantillaDiseno('0')!)
    const htmlFijo = renderToStaticMarkup(
      <DialogoDisenoPropio modulo={base.modulos[0]!} vidrioGeneral="VCG4"
        onCerrar={vi.fn()} onAceptar={vi.fn()} onRestablecer={vi.fn()} />,
    )
    expect(htmlFijo).toContain('Diseño específico · 0 (1200 × 1200 mm)')
    expect(htmlFijo).toContain('Hoja en hueco')
    expect(htmlFijo).toContain('Barrotillo interior (BI)')
    expect(htmlFijo).toContain('Añadir travesaño')
    expect(htmlFijo).toContain('>Aceptar diseño</button>')
    expect(htmlFijo).not.toContain('>Restablecer catálogo</button>')

    const conVidrio = cambiarVidrioHuecoDisenoPropio(sembrarDisenoPropioModulo(base.modulos[0]!)!, 0, 'VGS616AL33I')
    const conBi = cambiarBarrotilloHuecoDisenoPropio(conVidrio, 0, { horizontales: 2, verticales: 1 })
    const moduloEditado = actualizarDisenoPropioModuloCerramiento(base, 'modulo-1', conBi).modulos[0]!
    const htmlEditado = renderToStaticMarkup(
      <DialogoDisenoPropio modulo={moduloEditado} vidrioGeneral="VCG4"
        onCerrar={vi.fn()} onAceptar={vi.fn()} onRestablecer={vi.fn()} />,
    )
    expect(htmlEditado).toContain('Hueco 1 · VGS616AL33I · BI')
    expect(htmlEditado).toContain('class="al-muntin"')
    expect(htmlEditado).toContain('>Restablecer catálogo</button>')

    const corredera = crearConfiguracionCerramiento(plantillaDiseno('C2')!).modulos[0]!
    const htmlNoSoportado = renderToStaticMarkup(
      <DialogoDisenoPropio modulo={corredera} vidrioGeneral="VCG4"
        onCerrar={vi.fn()} onAceptar={vi.fn()} onRestablecer={vi.fn()} />,
    )
    expect(htmlNoSoportado).toContain('C2 no admite Diseño V3.')
  })

  it('muestra `Cota por (mm)` en un travesaño con cota variable (`1OFI`) y alerta cuando una cota no cabe', () => {
    const htmlVariable = renderToStaticMarkup(
      <PanelTravesanoDiseno
        division={{
          divisionId: 1, elementoVisualId: 'division-1-1', contenidaEn: 0,
          posicion: 'HB', tipoCota: 1, huecos: 2, cotaMm: 500, simbolo: 'FI',
          anchoContenedorMm: 800, altoContenedorMm: 2000,
        }}
        indice={1} valido onCambiar={vi.fn()} onEliminar={vi.fn()} />,
    )
    expect(htmlVariable).toContain('Cota Variable')
    expect(htmlVariable).toContain('value="FI"')
    expect(htmlVariable).toContain('Cota por (mm)')
    expect(htmlVariable).not.toContain('Cota para travesaño no válida.')

    const htmlInvalido = renderToStaticMarkup(
      <PanelTravesanoDiseno
        division={{
          divisionId: 1, elementoVisualId: 'division-1-1', contenidaEn: 0,
          posicion: 'HB', tipoCota: 2, huecos: 2, cotaMm: 1400, simbolo: null,
          anchoContenedorMm: 1200, altoContenedorMm: 1200,
        }}
        indice={1} valido={false} onCambiar={vi.fn()} onEliminar={vi.fn()} />,
    )
    expect(htmlInvalido).toContain('Cota para travesaño no válida.')
  })

  it('no da por guardado un diseño que el núcleo rechaza', () => {
    const base = crearConfiguracionCerramiento(plantillaDiseno('0')!)
    const puerta = {
      nodos: [
        { id: 0, tipo: 1, contenidoEn: -1, tipoMarco: 'PTA', cortes: [1, 1, 1, 1] as const },
        { id: 1, tipo: 5, contenidoEn: 0, vidrio: null },
      ],
    }
    expect(configuracionTrasAceptarDiseno(base, 'modulo-1', puerta, [])).toBeNull()
    expect(base.modulos[0]?.disenoPropio).toBeUndefined()

    const valido = dividirHuecoDisenoPropio(sembrarDisenoPropioModulo(base.modulos[0]!)!, 0, { posicion: 'HB', tipoCota: 2, cotaMm: 400 })
    const guardada = configuracionTrasAceptarDiseno(base, 'modulo-1', valido, [])
    expect(guardada?.modulos[0]?.disenoPropio).toBeDefined()
    expect(guardada).not.toBe(base)
  })
})
