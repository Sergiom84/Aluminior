import { describe, expect, it } from 'vitest'
import {
  alojamientoDeVidrio, limitesDeHueco, articuloDeLimite, articuloDeHoja,
  calcularVidriosPorAlojamiento,
  type NodoDisenyo,
} from './huecos.ts'

function mapa(nodos: NodoDisenyo[]) {
  return new Map(nodos.map((n) => [n.idItem, n]))
}

const base = (parcial: Partial<NodoDisenyo> & Pick<NodoDisenyo, 'idItem' | 'tipo'>): NodoDisenyo => ({
  contenidoEn: null, idTravesano: null, posicionHueco: null,
  tipoTravesano: null, invisible: false, ...parcial,
})

describe('geometrÃ­a de huecos', () => {
  it('reconstruye marco + travesaÃ±o en el fijo inferior de 2OFI', () => {
    const nodos = mapa([
      base({ idItem: 0, tipo: 1 }),
      base({ idItem: 1, tipo: 6, contenidoEn: 0, tipoTravesano: 'HB' }),
      base({ idItem: 3, tipo: 2, contenidoEn: 0, idTravesano: 1, posicionHueco: 2 }),
      base({ idItem: 15, tipo: 5, contenidoEn: 3 }),
    ])
    expect(alojamientoDeVidrio(nodos, 15)).toEqual({ huecoId: 3, hojaId: null })
    const l = limitesDeHueco(nodos, 3)
    expect(l?.superior).toMatchObject({ clase: 'TRAVESANO', idItem: 1, orientacion: 'H' })
    expect(l?.inferior).toMatchObject({ clase: 'MARCO', orientacion: 'H' })
    expect(l?.izquierdo).toMatchObject({ clase: 'MARCO', orientacion: 'V' })
    expect(l?.derecho).toMatchObject({ clase: 'MARCO', orientacion: 'V' })
  })

  it('conserva una divisiÃ³n invisible en el alojamiento de una hoja', () => {
    const nodos = mapa([
      base({ idItem: 0, tipo: 1 }),
      base({ idItem: 4, tipo: 6, contenidoEn: 0, tipoTravesano: 'VI', invisible: true }),
      base({ idItem: 5, tipo: 2, contenidoEn: 0, idTravesano: 4, posicionHueco: 1 }),
      base({ idItem: 7, tipo: 3, contenidoEn: 5 }),
      base({ idItem: 13, tipo: 5, contenidoEn: 7 }),
    ])
    expect(alojamientoDeVidrio(nodos, 13)).toEqual({ huecoId: 5, hojaId: 7 })
    expect(limitesDeHueco(nodos, 5)?.derecho).toMatchObject({
      clase: 'INVISIBLE', orientacion: 'V', idItem: 4,
    })
  })

  it('liga travesano y hoja a sus nodos exactos', () => {
    const limite = { clase: 'TRAVESANO' as const, orientacion: 'H' as const, idItem: 7, tipoTravesano: 'H' }
    const piezas = [
      { articuloCodigo: 'MARCO', funcion: 'MH', idItemDisenyo: 1, grupoDisenyo: null },
      { articuloCodigo: 'TRAV-7', funcion: 'TM', idItemDisenyo: 7, grupoDisenyo: null },
      { articuloCodigo: 'TRAV-8', funcion: 'TM', idItemDisenyo: 8, grupoDisenyo: null },
      { articuloCodigo: 'HOJA', funcion: 'HH', idItemDisenyo: 4, grupoDisenyo: 'HP' },
    ]
    expect(articuloDeLimite(piezas, limite)).toBe('TRAV-7')
    expect(articuloDeHoja(piezas, 4, 'HH')).toBe('HOJA')
    expect(articuloDeHoja(piezas, 5, 'HH')).toBeNull()
  })

  it('calcula todas las ranuras o rechaza el conjunto completo', () => {
    const nodos = mapa([
      base({ idItem: 0, tipo: 1 }),
      base({ idItem: 1, tipo: 6, contenidoEn: 0, tipoTravesano: 'HB' }),
      base({ idItem: 3, tipo: 2, contenidoEn: 0, idTravesano: 1, posicionHueco: 2 }),
      base({ idItem: 15, tipo: 5, contenidoEn: 3 }),
    ])
    const piezas = [
      { articuloCodigo: 'M', funcion: 'MH' },
      { articuloCodigo: 'M', funcion: 'MV' },
      { articuloCodigo: 'T', funcion: 'TM', idItemDisenyo: 1 },
    ]
    const ranuras = [{ idItemDisenyo: 15, formulaLargo: 'L/2', formulaAncho: 'A' }]
    const reglas = [
      { eje: 'L' as const, limite1: 'M', limite2: 'T', perfilHoja: '', deltaMm: 50 },
      { eje: 'A' as const, limite1: 'M', limite2: 'M', perfilHoja: '', deltaMm: 80 },
    ]
    expect(calcularVidriosPorAlojamiento(ranuras, { L: 1600, A: 1200 }, nodos, piezas, reglas)).toEqual({
      ok: true,
      vidrios: [{ slot: 1, contexto: 'FIJO', largoMm: 750, anchoMm: 1120, moduloLargoMm: 800, moduloAnchoMm: 1200 }],
    })
    expect(calcularVidriosPorAlojamiento(ranuras, { L: 1600, A: 1200 }, nodos, piezas, reglas.slice(0, 1))).toMatchObject({
      ok: false, slot: 1, motivo: 'sin regla histórica estable',
    })
  })
})
