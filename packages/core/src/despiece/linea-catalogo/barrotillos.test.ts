import { describe, expect, it } from 'vitest'
import { despiezarBarrotillos } from './barrotillos.ts'
import type { FilaPlantillaCatalogo } from './tipos.ts'
import type { MedidaPlantilla } from '../medidas-plantilla.ts'

const fila = (f: Partial<FilaPlantillaCatalogo> & Pick<FilaPlantillaCatalogo, 'id'>): FilaPlantillaCatalogo => ({
  articulo: 'BI', componente: 'BI', funcion: null, cantidad: 1, posicionTrabajo: 'A', tipoHoja: null, mano: null, hoja: 0,
  disVidrio: null, referenciaLargo: 25, referenciaAncho: null, formulaLargo: 'A', formulaAncho: null,
  formulaReferenciaLargo: 'REF', formulaReferenciaAncho: null, grupo: 'BI', grupoIzquierdo: 'C', grupoDerecho: 'C',
  grupoSuperior: null, grupoInferior: null, gruposAdicionales: [], perfilAdicional: null, ...f,
})
// Cristal del fijo inferior de un 1OFI real de 2026: 881,5 de largo por 784 de ancho.
const medidas = new Map<number, MedidaPlantilla>([[25, { largoMm: 881.5, anchoMm: 784, incidencia: null }]])

describe('barrotillo interior del vidrio', () => {
  it('mide el cristal que referencia: su ancho a lo ancho y su largo a lo largo, con la cantidad de barras', () => {
    const r = despiezarBarrotillos([fila({ id: 26, cantidad: 3 }), fila({ id: 27, cantidad: 2, posicionTrabajo: 'L' })], medidas, 'L')
    expect(r.incidencias).toEqual([])
    expect(r.filas.map(f => [f.articulo, f.acabado, f.cantidad, f.largoMm])).toEqual([['BI', 'L', 3, 784], ['BI', 'L', 2, 881.5]])
  })
  it('no produce pieza con cantidad 0 ni toca filas que no son barrotillo', () => {
    const r = despiezarBarrotillos([fila({ id: 27, cantidad: 0, posicionTrabajo: 'L' }), fila({ id: 9, componente: '1', articulo: '8' })], medidas, 'L')
    expect(r).toMatchObject({ filas: [], incidencias: [] })
  })
  it('sin la medida del cristal deja la incidencia y ninguna pieza', () => {
    const r = despiezarBarrotillos([fila({ id: 26, cantidad: 3, referenciaLargo: 99 })], medidas, 'L')
    expect(r.filas).toEqual([])
    expect(r.incidencias).toEqual(['barrotillo BI: cristal 99 sin medida'])
  })
})
