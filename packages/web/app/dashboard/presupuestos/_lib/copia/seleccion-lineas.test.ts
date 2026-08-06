import { describe, expect, it } from 'vitest'
import {
  lineaSeleccionada, seleccionDeLineas, seleccionSobrante, TODAS_LAS_LINEAS,
} from './seleccion-lineas.ts'

describe('selección de líneas', () => {
  it('«todas» incluye cualquier línea', () => {
    expect(lineaSeleccionada(TODAS_LAS_LINEAS, 'l1')).toBe(true)
    expect(seleccionSobrante(TODAS_LAS_LINEAS, ['l1'])).toEqual([])
  })

  it('el subconjunto incluye sólo lo pedido', () => {
    const seleccion = seleccionDeLineas(['l1', 'l3'])
    expect(lineaSeleccionada(seleccion, 'l1')).toBe(true)
    expect(lineaSeleccionada(seleccion, 'l2')).toBe(false)
  })

  it('la selección vacía no incluye ninguna línea', () => {
    const seleccion = seleccionDeLineas([])
    expect(lineaSeleccionada(seleccion, 'l1')).toBe(false)
  })

  it('señala los ids que no existen en el documento', () => {
    expect(seleccionSobrante(seleccionDeLineas(['l1', 'fantasma']), ['l1', 'l2']))
      .toEqual(['fantasma'])
  })
})
