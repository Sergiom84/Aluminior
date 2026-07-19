/**
 * Junta perimetral de hoja (anexo S.7.2 de PLAN.md).
 *
 * La regla medida es que cada tramo de junta copia EXACTAMENTE el corte de
 * una pieza de perfil de hoja: delta 0 en 4.624 de 4.632 tramos. Lo que
 * estas pruebas protegen es tanto la copia exacta como que una junta nunca
 * salga con medida cuando la hoja que copia no la tiene.
 */
import { describe, it, expect } from 'vitest'
import { emitirJuntaPerimetral, type PiezaCortada } from './calcular.ts'

const pieza = (funcion: string, largoMm: number | null, extra: Partial<PiezaCortada> = {}): PiezaCortada => ({
  articuloCodigo: 'GM8783M',
  cantidad: 1,
  largoMm,
  formula: 'L',
  tipoCorte: null,
  anguloIzquierdo: null,
  anguloDerecho: null,
  funcion,
  incidencia: null,
  ...extra,
})

describe('junta perimetral de hoja', () => {
  it('emite una junta por pieza de hoja, con su mismo largo (delta 0)', () => {
    const juntas = emitirJuntaPerimetral(
      [pieza('HV', 1030), pieza('HH', 532)],
      'GM4055',
    )
    expect(juntas).toHaveLength(2)
    expect(juntas.map((j) => j.largoMm)).toEqual([1030, 532])
    expect(juntas.every((j) => j.articuloCodigo === 'GM4055')).toBe(true)
  })

  it('ignora los perfiles que no son de hoja', () => {
    const juntas = emitirJuntaPerimetral(
      [pieza('MV', 1100), pieza('MH', 1140), pieza('HV', 1030)],
      'GM4055',
    )
    expect(juntas).toHaveLength(1)
    expect(juntas[0].largoMm).toBe(1030)
  })

  it('sin artículo de junta no emite nada, en vez de inventarlo', () => {
    expect(emitirJuntaPerimetral([pieza('HV', 1030)], null)).toEqual([])
  })

  it('una hoja SIN medida produce una junta sin medida, no una junta a cero', () => {
    const juntas = emitirJuntaPerimetral(
      [pieza('HV', null, { incidencia: 'sin regla de rebaje de hoja' })],
      'GM4055',
    )
    expect(juntas[0].largoMm).toBeNull()
    expect(juntas[0].incidencia).toMatch(/sin regla de rebaje/)
  })

  it('conserva la cantidad de la pieza de hoja', () => {
    const juntas = emitirJuntaPerimetral([pieza('HV', 1030, { cantidad: 4 })], 'GM4055')
    expect(juntas[0].cantidad).toBe(4)
  })

  it('conserva el enlace con el ítem de diseño', () => {
    const juntas = emitirJuntaPerimetral([pieza('HV', 1030, { idItemDisenyo: 7 })], 'GM4055')
    expect(juntas[0].idItemDisenyo).toBe(7)
  })
})
