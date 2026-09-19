import { describe, expect, it } from 'vitest'
import {
  CATEGORIAS_ESCAPARATE, categoriaConCatalogo, categoriaInicialEscaparate,
  itemsEscaparate, paginaEscaparate,
} from './escaparate.ts'

describe('escaparate de estructuras', () => {
  it('abre en una categoría con catálogo real, no en una vacía', () => {
    const inicial = categoriaInicialEscaparate()
    expect(categoriaConCatalogo(inicial)).toBe(true)
    expect(itemsEscaparate(inicial.id).length).toBeGreaterThan(0)
  })

  it('agrupa fijos y abatibles verificados y deja el resto vacío', () => {
    expect(itemsEscaparate('fijos').map((item) => item.codigo)).toEqual(
      expect.arrayContaining(['0', '02H', '02V', '04']),
    )
    expect(itemsEscaparate('ventanas-abatibles').map((item) => item.codigo)).toEqual(
      expect.arrayContaining(['2', '1O+1F+1O']),
    )
    expect(itemsEscaparate('oscilobatientes').map(item => item.codigo)).toEqual(
      expect.arrayContaining(['2O', '1OFI']),
    )
    expect(itemsEscaparate('ventanas-abatibles').some(item => item.codigo === '2O')).toBe(false)
    expect(itemsEscaparate('correderas-perimetrales')).toEqual([])
    expect(itemsEscaparate('mosquiteras')).toEqual([])
  })

  it('pagina en 12, como la galería 4×3 de Productor', () => {
    const muchos = itemsEscaparate('ventanas-abatibles')
    expect(muchos.length).toBeGreaterThan(0)
    const primera = paginaEscaparate(muchos, 1, 4)
    expect(primera.items).toHaveLength(Math.min(4, muchos.length))
    expect(primera.pagina).toBe(1)
    const fuera = paginaEscaparate(muchos, 99, 4)
    expect(fuera.pagina).toBe(fuera.totalPaginas)
  })

  it('usa familias del catálogo y orden observado en la 0017', () => {
    expect(CATEGORIAS_ESCAPARATE.map((c) => c.nombre)).toContain('VENTANAS ABATIBLES')
    expect(CATEGORIAS_ESCAPARATE.map((c) => c.nombre)).toContain('FIJOS ABATIBLES')
    expect(CATEGORIAS_ESCAPARATE.map((c) => c.nombre)).toContain('PUERTAS PLEGABLES')
    expect(CATEGORIAS_ESCAPARATE.slice(0, 9).map(c => c.familias[0]))
      .toEqual(['001', '002', '011', '003', '020', '004', '021', '005', '006'])
  })
})
