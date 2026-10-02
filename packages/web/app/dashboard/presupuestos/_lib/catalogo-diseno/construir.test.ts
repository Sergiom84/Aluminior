import { describe, expect, it } from 'vitest'
import { construirCatalogoDiseno, type FilaNodoCatalogo } from './construir.ts'

const fila = (estructuraCodigo: string, idItem: number, tipo: number, contenidoEn: number,
  cambios: Partial<FilaNodoCatalogo> = {}): FilaNodoCatalogo => ({
  estructuraCodigo, idItem, tipo, contenidoEn, idTravesano: 0, posicionHueco: 0,
  tipoTravesano: null, invisible: false, tipoHoja: 0, numeroHoja: 0, tipoCota: 0,
  cota: '0.000', equidistantes: 0, tipoMarco: tipo === 1 ? 'NOR' : null, tipoCurva: 0, ...cambios,
})

/** Árbol sintético con la forma de una corredera de dos hojas. */
const corredera = (codigo: string) => [
  fila(codigo, 0, 1, -1),
  fila(codigo, 1, 6, 0, { idTravesano: 1, tipoTravesano: 'VI', invisible: true, equidistantes: 2 }),
  fila(codigo, 2, 2, 0, { idTravesano: 1, posicionHueco: 1 }),
  fila(codigo, 3, 2, 0, { idTravesano: 1, posicionHueco: 2 }),
  fila(codigo, 4, 3, 2, { tipoHoja: 10, numeroHoja: 1 }), fila(codigo, 5, 5, 4),
  fila(codigo, 6, 3, 3, { tipoHoja: 10, numeroHoja: 2 }), fila(codigo, 7, 5, 6),
]

const estructura = (codigo: string, familia: string | null = '001', disAnchoMm: number | null = 1200) =>
  ({ codigo, descripcion: `CORREDERA ${codigo}`, familia, disAnchoMm, disAltoMm: 1000 })

describe('catálogo de diseño desde la base', () => {
  it('genera las dibujables con su familia y medida de diseño, ordenadas por código', () => {
    const plantillas = construirCatalogoDiseno(
      [estructura('S10'), estructura('S2')],
      [...corredera('S10'), ...corredera('S2')],
    )
    expect(plantillas.map((p) => p.codigo)).toEqual(['S2', 'S10'])
    expect(plantillas[0]).toMatchObject({ familiaCodigo: '001', familia: 'CATALOGO',
      anchoMm: 1200, altoMm: 1000, composicion: { tipo: 'division', eje: 'vertical' } })
  })

  it('omite estructuras sin árbol, sin familia, sin medida o no representables', () => {
    const noRepresentable = corredera('S4').map((n) => n.idItem === 4 ? { ...n, tipoHoja: 999 } : n)
    const curva = corredera('S5').map((n) => n.idItem === 0 ? { ...n, tipoCurva: 1 } : n)
    expect(construirCatalogoDiseno(
      [estructura('S1'), estructura('S2', null), estructura('S3', '001', null), estructura('S4'), estructura('S5')],
      [...corredera('S2'), ...corredera('S3'), ...noRepresentable, ...curva],
    )).toEqual([])
  })
})
