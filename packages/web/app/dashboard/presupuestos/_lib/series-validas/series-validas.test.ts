import { describe, expect, it } from 'vitest'
import { ranurasDeSerie, serieResuelve, seriesParaGrupo, seriesValidas, type SerieEvaluable } from './series-validas.ts'

const serie = (codigo: string, claves: string[], grosorMaximoSimple = 0): SerieEvaluable =>
  ({ codigo, resueltas: new Set(claves), grosorMaximoSimple })

const sencillo = serie('GMC800', ['21.1', '22.1', '23.1', '10'])
const doble = serie('GMC800D', ['21.2', '22.2', '23.2', '10'])
const ranuras = ['21', '22', '23', '10']

describe('series válidas', () => {
  it('sin vidrio se exige la variante de doble cristal', () => {
    expect(seriesValidas([sencillo, doble], ranuras, null)).toEqual(['GMC800D'])
  })

  it('un vidrio dentro del rango sencillo exige la variante sencilla', () => {
    const conRango = serie('GMC800', ['21.1', '22.1', '23.1', '10'], 12)
    expect(seriesValidas([conRango, doble], ranuras, { grosorAcristalar: 6, dobleAcristalamiento: false }))
      .toEqual(['GMC800'])
  })

  it('un vidrio grueso fuerza la variante doble aunque la serie tenga variante sencilla', () => {
    const conRango = serie('GMC800', ['21.1', '22.1', '23.1', '10'], 12)
    expect(seriesValidas([conRango], ranuras, { grosorAcristalar: 28, dobleAcristalamiento: true })).toEqual([])
  })

  it('la clave exacta vale para cualquier variante', () => {
    expect(serieResuelve(serie('X', ['21', '22', '23', '10']), ranuras, null)).toBe(true)
  })

  it('una ranura sin resolver descarta la serie', () => {
    expect(serieResuelve(serie('X', ['21.2', '22.2', '10']), ranuras, null)).toBe(false)
  })

  it('sin ranuras todas las series valen', () => {
    expect(seriesValidas([sencillo, doble], [], null)).toEqual(['GMC800', 'GMC800D'])
  })
})

describe('ranuras que exige la serie', () => {
  it('ignora el cristal, los informativos y los artículos propios válidos', () => {
    expect(ranurasDeSerie([
      { componente: '1', funcion: 'HV', articuloPropioValido: false },
      { componente: '21', funcion: 'HV', articuloPropioValido: false },
      { componente: '22', funcion: 'infMO', articuloPropioValido: false },
      { componente: '23', funcion: 'AccX', articuloPropioValido: false },
      { componente: '24', funcion: 'HH', articuloPropioValido: true },
      { componente: null, funcion: 'HH', articuloPropioValido: false },
    ])).toEqual(['21'])
  })

  it('no repite una ranura', () => {
    expect(ranurasDeSerie([
      { componente: '21', funcion: 'HV', articuloPropioValido: false },
      { componente: '21', funcion: 'HH', articuloPropioValido: false },
    ])).toEqual(['21'])
  })
})

describe('lista del grupo', () => {
  const todas = ['A', 'B', 'C']
  const por = { C2: ['A', 'B'], ABAT: ['B', 'C'], VACIA: ['A'] }

  it('sin datos no restringe', () => {
    expect(seriesParaGrupo(todas, por, ['DESCONOCIDA'])).toEqual(todas)
    expect(seriesParaGrupo(todas, por, [])).toEqual(todas)
  })

  it('una estructura: sus series', () => {
    expect(seriesParaGrupo(todas, por, ['C2', 'C2'])).toEqual(['A', 'B'])
  })

  it('varias estructuras: las comunes', () => {
    expect(seriesParaGrupo(todas, por, ['C2', 'ABAT'])).toEqual(['B'])
  })

  it('sin series comunes ofrece las que sirven a alguna', () => {
    expect(seriesParaGrupo(todas, por, ['ABAT', 'VACIA'])).toEqual(['A', 'B', 'C'])
  })
})
