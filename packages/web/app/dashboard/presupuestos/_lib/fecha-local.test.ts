import { describe, expect, it } from 'vitest'
import { fechaLocalMadrid } from './fecha-local.ts'

describe('fechaLocalMadrid', () => {
  it('verano (UTC+2): un instante ya del día siguiente en Madrid pero no en UTC', () => {
    const instante = new Date('2026-07-15T22:30:00.000Z')
    expect(instante.toISOString().slice(0, 10)).toBe('2026-07-15')
    expect(fechaLocalMadrid(instante)).toBe('2026-07-16')
  })

  it('invierno (UTC+1): un instante ya del día siguiente en Madrid pero no en UTC', () => {
    const instante = new Date('2026-01-15T23:30:00.000Z')
    expect(instante.toISOString().slice(0, 10)).toBe('2026-01-15')
    expect(fechaLocalMadrid(instante)).toBe('2026-01-16')
  })
})
