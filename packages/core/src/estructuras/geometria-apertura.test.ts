import { describe, expect, it } from 'vitest'
import { distribuirComposicion, plantillaDiseno } from './diseno.ts'
import { geometriaAperturaVisual } from './geometria-apertura.ts'

const rect = { x: 10, y: 20, ancho: 100, alto: 200 }

describe('geometría física de apertura', () => {
  it.each([
    ['1OD', 'derecha', 110, 10, 1, 1],
    ['1OI', 'izquierda', 10, 110, 1, 1],
  ] as const)('%s declara bisagra %s y manilla contraria',
    (codigo, lado, bisagraX, cierreX, manillas, triangulosOscilo) => {
      const hueco = distribuirComposicion(plantillaDiseno(codigo)!.composicion, rect)[0]
      if (hueco.tipo !== 'hueco') throw new Error('Se esperaba un hueco')
      const geometria = geometriaAperturaVisual(hueco.apertura, hueco)!
      expect(geometria).toMatchObject({ ladoBisagras: lado, xBisagras: bisagraX, xCierre: cierreX })
      expect(Number(hueco.manilla)).toBe(manillas)
      expect(geometria.trazos).toHaveLength(1 + triangulosOscilo)
    })

  it.each([
    ['2', ['izquierda', 'derecha'], [false, true], [0, 0]],
    ['2O', ['izquierda', 'derecha'], [false, true], [0, 1]],
  ] as const)('%s conserva bisagras exteriores y una manilla en la hoja derecha',
    (codigo, lados, manillas, triangulosOscilo) => {
      const huecos = distribuirComposicion(plantillaDiseno(codigo)!.composicion, rect)
        .filter((elemento) => elemento.tipo === 'hueco')
      const geometria = huecos.map((hueco) => geometriaAperturaVisual(hueco.apertura, hueco)!)
      expect(geometria.map((actual) => actual.ladoBisagras)).toEqual(lados)
      expect(geometria.map((actual) => actual.xBisagras)).toEqual([10, 110])
      expect(huecos.map((hueco) => hueco.manilla)).toEqual(manillas)
      expect(geometria.map((actual) => actual.trazos.length - 1)).toEqual(triangulosOscilo)
    })

  it('expresa los trazos en coordenadas explícitas, sin invertir el sufijo', () => {
    expect(geometriaAperturaVisual('abatible-derecha', rect)?.trazos).toEqual([[
      { x: 110, y: 20 }, { x: 10, y: 120 }, { x: 110, y: 220 },
    ]])
    expect(geometriaAperturaVisual('oscilobatiente-izquierda', rect)?.trazos).toEqual([
      [{ x: 10, y: 20 }, { x: 110, y: 120 }, { x: 10, y: 220 }],
      [{ x: 10, y: 220 }, { x: 60, y: 20 }, { x: 110, y: 220 }],
    ])
  })

  it.each([
    ['1OFI', ['izquierda'], [true], [1]],
    ['2O+ FIJO', ['izquierda', 'derecha'], [false, true], [0, 1]],
    ['1O1FL', ['derecha'], [true], [1]],
  ] as const)('%s aplica la evidencia adicional sin alterar cotas',
    (codigo, lados, manillas, triangulosOscilo) => {
      const plantilla = plantillaDiseno(codigo)!
      const huecos = distribuirComposicion(plantilla.composicion, {
        x: 0, y: 0, ancho: plantilla.anchoMm, alto: plantilla.altoMm,
      }).filter((elemento) => elemento.tipo === 'hueco')
        .filter((elemento) => elemento.apertura !== 'fijo')
      const geometria = huecos.map((hueco) => geometriaAperturaVisual(hueco.apertura, hueco)!)
      expect(geometria.map((actual) => actual.ladoBisagras)).toEqual(lados)
      expect(huecos.map((hueco) => hueco.manilla)).toEqual(manillas)
      expect(geometria.map((actual) => actual.trazos.length - 1)).toEqual(triangulosOscilo)
      expect([plantilla.anchoMm, plantilla.altoMm]).toEqual({
        '1OFI': [800, 1500], '2O+ FIJO': [1200, 1500], '1O1FL': [1100, 1200],
      }[codigo])
    })

  it('impide accesorios en un fijo aunque una entrada antigua los solicite', () => {
    const [fijo] = distribuirComposicion(
      { tipo: 'hueco', id: 'fijo', apertura: 'fijo', manilla: true }, rect,
    )
    expect(fijo).toMatchObject({ tipo: 'hueco', apertura: 'fijo', manilla: false })
  })
})
