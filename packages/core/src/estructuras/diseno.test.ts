import { describe, expect, it } from 'vitest'
import {
  buscarHueco, distribuirComposicion, plantillaDiseno, primerHueco,
  unirCerramientos, UNIONES_VISUALES,
} from './diseno.ts'

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
      'oscilobatiente-derecha', 'fijo', 'fijo', 'oscilobatiente-izquierda',
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
})
