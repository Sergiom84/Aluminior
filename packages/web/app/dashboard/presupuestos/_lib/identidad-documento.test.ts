import { describe, expect, it } from 'vitest'
import { referenciaPresupuesto } from './identidad-documento.ts'

describe('referenciaPresupuesto', () => {
  it('mantiene visible la revisión inicial como parte de la identidad', () => {
    expect(referenciaPresupuesto(260011, 0)).toBe('260011 · Revisión 0')
  })

  it('distingue de forma inequívoca una revisión posterior', () => {
    expect(referenciaPresupuesto(260011, 3)).toBe('260011 · Revisión 3')
  })
})
