import { describe, expect, it } from 'vitest'
import { crearConfiguracionCerramiento, esConfiguracionCerramiento } from './cerramiento.ts'
import { distribuirComposicion, plantillaDiseno } from './diseno.ts'
import { itemsEscaparate } from './escaparate.ts'
import { geometriaAperturaVisual } from './geometria-apertura.ts'

describe('C2 en el catálogo del configurador', () => {
  it('ofrece C2 en su familia, conserva las dos hojas y permite reabrir el JSON', () => {
    const plantilla = plantillaDiseno('C2')!
    expect(itemsEscaparate('correderas-no-perimetrales').map(p => p.codigo))
      .toEqual(['C2', 'C2FI', 'C2FS', 'C2FSFI'])
    expect(plantilla).toMatchObject({ anchoMm: 1200, altoMm: 1200, familiaCodigo: '001' })
    const configuracion = crearConfiguracionCerramiento(plantilla)
    expect(esConfiguracionCerramiento(JSON.parse(JSON.stringify(configuracion)))).toBe(true)
    expect(configuracion.modulos[0].estructuraCodigo).toBe('C2')
    const elementos = distribuirComposicion(plantilla.composicion, { x: 0, y: 0, ancho: 1200, alto: 1200 })
    expect(elementos.map(e => [e.tipo, e.ancho, e.alto])).toEqual([
      ['hueco', 599, 1200], ['separador', 2, 1200], ['hueco', 599, 1200],
    ])
    expect(elementos.filter(e => e.tipo === 'hueco').map(e => [e.apertura, e.manilla]))
      .toEqual([['corredera', false], ['corredera', false]])
    expect(elementos[1]).toMatchObject({ clase: 'division-invisible' })
  })

  it('representa las dos puntas horizontales sin afirmar sentido ni bisagras', () => {
    const g = geometriaAperturaVisual('corredera', { x: 10, y: 20, ancho: 100, alto: 200 })!
    expect(g.bisagras).toBe(false)
    expect(g.trazos).toEqual([
      [{ x: 30, y: 120 }, { x: 90, y: 120 }],
      [{ x: 38, y: 112 }, { x: 30, y: 120 }, { x: 38, y: 128 }],
      [{ x: 82, y: 112 }, { x: 90, y: 120 }, { x: 82, y: 128 }],
    ])
  })
})
