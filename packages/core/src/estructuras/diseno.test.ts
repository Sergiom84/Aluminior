import { describe, expect, it } from 'vitest'
import {
  buscarHueco, distribuirComposicion, plantillaDiseno, primerHueco, PLANTILLAS_DISENO,
  unirCerramientos, UNIONES_VISUALES,
} from './diseno.ts'
import { esConfiguracionCerramiento, medidasCerramiento } from './cerramiento.ts'

const rect = { x: 0, y: 0, ancho: 1200, alto: 1200 }

describe('vocabulario visual de estructuras', () => {
  it('trata el código como identificador opaco', () => {
    expect(plantillaDiseno(' 2o ')?.descripcion).toContain('OSCILOBATIENTE')
    expect(plantillaDiseno('C312')).toBeNull()
  })

  it('reconstruye un fijo de cuatro huecos con tres travesaños', () => {
    const elementos = distribuirComposicion(plantillaDiseno('04')!.composicion, rect)
    expect(elementos.filter((e) => e.tipo === 'hueco')).toHaveLength(4)
    expect(elementos.filter((e) => e.tipo === 'separador')).toHaveLength(3)
    expect(elementos.filter((e) => e.tipo === 'separador').map((e) => e.eje).sort())
      .toEqual(['horizontal', 'vertical', 'vertical'])
  })

  it('conserva la cota relativa del fijo inferior', () => {
    const elementos = distribuirComposicion(plantillaDiseno('1OFI')!.composicion, rect)
    const superior = elementos.find((e) => e.tipo === 'hueco' && e.id === 'hoja-superior')
    const inferior = elementos.find((e) => e.tipo === 'hueco' && e.id === 'fijo-inferior')
    expect(superior?.alto).toBeGreaterThan(inferior?.alto ?? Infinity)
    expect(elementos.some((e) => e.tipo === 'separador' && e.eje === 'horizontal')).toBe(true)
  })

  it('conserva la composición verificada de cuatro módulos', () => {
    const plantilla = plantillaDiseno('1O+2F+1O')!
    const huecos = distribuirComposicion(plantilla.composicion, rect)
      .filter((e) => e.tipo === 'hueco')
    expect(huecos.map((e) => e.apertura)).toEqual([
      'oscilobatiente-izquierda', 'fijo', 'fijo', 'oscilobatiente-derecha',
    ])
    expect(primerHueco(plantilla.composicion).id).toBe('hoja-izquierda')
    expect(buscarHueco(plantilla.composicion, 'fijo-central-2')?.apertura).toBe('fijo')
  })

  it('anida dos hojas sobre un fijo inferior', () => {
    const elementos = distribuirComposicion(plantillaDiseno('2O+ FIJO')!.composicion, rect)
    const huecos = elementos.filter((e) => e.tipo === 'hueco')
    const separadores = elementos.filter((e) => e.tipo === 'separador')
    expect(huecos.map((e) => e.id)).toEqual([
      'hoja-izquierda', 'hoja-derecha', 'fijo-inferior',
    ])
    expect(separadores.map((e) => [e.eje, e.clase])).toEqual([
      ['vertical', 'division-invisible'],
      ['horizontal', 'travesano'],
    ])
  })

  it('modela una unión como separador distinto del travesaño interno', () => {
    const fijo = plantillaDiseno('0')!.composicion
    const unido = unirCerramientos(fijo, fijo, UNIONES_VISUALES[0])
    const separador = distribuirComposicion(unido, rect)
      .find((e) => e.tipo === 'separador')
    expect(separador).toMatchObject({ clase: 'union', eje: 'vertical' })
  })

  it('no pierde superficie al repartir un fijo vertical', () => {
    const elementos = distribuirComposicion(plantillaDiseno('02V')!.composicion, rect)
    const anchoTotal = elementos.reduce((suma, e) => suma + e.ancho, 0)
    expect(anchoTotal).toBe(1200)
  })

  it.each([
    ['0', 1200, 1200, ['fijo'], []],
    ['02H', 1200, 1200, ['fijo', 'fijo'], ['horizontal:travesano']],
    ['02V', 1200, 1200, ['fijo', 'fijo'], ['vertical:travesano']],
    ['04', 1200, 1200, ['fijo', 'fijo', 'fijo', 'fijo'],
      ['vertical:travesano', 'horizontal:travesano', 'vertical:travesano']],
    ['1OFI', 800, 1500, ['oscilobatiente-izquierda', 'fijo'], ['horizontal:travesano']],
    ['1O1FL', 1100, 1200, ['oscilobatiente-derecha', 'fijo'], ['vertical:travesano']],
    ['1O2FL', 1400, 1200, ['fijo', 'oscilobatiente-derecha', 'fijo'],
      ['vertical:travesano', 'vertical:travesano']],
    ['1O+1F+1O', 2100, 1200, ['oscilobatiente-izquierda', 'fijo', 'oscilobatiente-derecha'],
      ['vertical:division-invisible', 'vertical:division-invisible']],
    ['1O+2F+1O', 2800, 1200,
      ['oscilobatiente-izquierda', 'fijo', 'fijo', 'oscilobatiente-derecha'],
      ['vertical:division-invisible', 'vertical:division-invisible', 'vertical:division-invisible']],
    ['2O+ FIJO', 1200, 1500,
      ['abatible-izquierda', 'oscilobatiente-derecha', 'fijo'],
      ['vertical:division-invisible', 'horizontal:travesano']],
  ] as const)('conserva regresión física de %s', (codigo, ancho, alto, aperturas, separadores) => {
    const plantilla = plantillaDiseno(codigo)!
    const elementos = distribuirComposicion(plantilla.composicion, rect)
    expect([plantilla.anchoMm, plantilla.altoMm]).toEqual([ancho, alto])
    expect(elementos.filter((e) => e.tipo === 'hueco').map((e) => e.apertura)).toEqual(aperturas)
    expect(elementos.filter((e) => e.tipo === 'separador')
      .map((e) => `${e.eje}:${e.clase}`)).toEqual(separadores)
  })

  it('reconstruye una configuración v1 antigua sin mutarla ni cambiar medidas', () => {
    const jsonV1 = '{"version":1,"modulos":[{"id":"modulo-1","estructuraCodigo":"2O","anchoMm":1200,"altoMm":1200}],"uniones":[]}'
    const configuracion: unknown = JSON.parse(jsonV1)
    expect(esConfiguracionCerramiento(configuracion)).toBe(true)
    if (!esConfiguracionCerramiento(configuracion)) throw new Error('fixture v1 inválido')
    expect(medidasCerramiento(configuracion)).toEqual({ anchoMm: 1200, altoMm: 1200 })
    expect(distribuirComposicion(plantillaDiseno(configuracion.modulos[0].estructuraCodigo)!.composicion, rect)
      .filter((e) => e.tipo === 'hueco').map((e) => [e.apertura, e.manilla])).toEqual([
        ['abatible-izquierda', false], ['oscilobatiente-derecha', true],
      ])
    expect(JSON.stringify(configuracion)).toBe(jsonV1)
    expect(PLANTILLAS_DISENO).toHaveLength(14)
  })

  it.each([
    ['0', [[0, 0, 1200, 1200]], []],
    ['02H', [[0, 0, 1200, 594], [0, 606, 1200, 594]], [[0, 594, 1200, 12]]],
    ['02V', [[0, 0, 594, 1200], [606, 0, 594, 1200]], [[594, 0, 12, 1200]]],
    ['04', [[0, 0, 594, 594], [606, 0, 594, 594], [0, 606, 594, 594], [606, 606, 594, 594]],
      [[594, 0, 12, 594], [0, 594, 1200, 12], [594, 606, 12, 594]]],
    ['1O2FL', [[0, 0, 252, 1200], [264, 0, 672, 1200], [948, 0, 252, 1200]],
      [[252, 0, 12, 1200], [936, 0, 12, 1200]]],
    ['1O+1F+1O', [[0, 0, 398.666667, 1200], [400.666667, 0, 398.666667, 1200],
      [801.333333, 0, 398.666667, 1200]],
      [[398.666667, 0, 2, 1200], [799.333333, 0, 2, 1200]]],
    ['1O+2F+1O', [[0, 0, 298.5, 1200], [300.5, 0, 298.5, 1200],
      [601, 0, 298.5, 1200], [901.5, 0, 298.5, 1200]],
      [[298.5, 0, 2, 1200], [599, 0, 2, 1200], [899.5, 0, 2, 1200]]],
  ] as const)('mantiene coordenadas interiores independientes de %s', (codigo, huecos, separadores) => {
    const coordenadas = (elementos: ReturnType<typeof distribuirComposicion>) => elementos
      .map((elemento) => [elemento.x, elemento.y, elemento.ancho, elemento.alto]
        .map((valor) => Math.round(valor * 1e6) / 1e6))
    const elementos = distribuirComposicion(plantillaDiseno(codigo)!.composicion, rect)
    expect(coordenadas(elementos.filter((elemento) => elemento.tipo === 'hueco'))).toEqual(huecos)
    expect(coordenadas(elementos.filter((elemento) => elemento.tipo === 'separador'))).toEqual(separadores)
  })
})
