import { describe, expect, it } from 'vitest'
import { validarCotasEntrada } from './cotas-entrada.ts'
import { valorarEstructura, type EntradaValoracionEstructura } from './valorar-estructura.ts'
import type { ClienteEscritura } from '../cliente-db.ts'

describe('cotas explícitas del caso de uso', () => {
  it('permite ausencia, cero y decimales con símbolos normalizados', () => {
    expect(validarCotasEntrada(undefined)).toEqual({ ok: true, cotas: {} })
    expect(validarCotasEntrada({ ' fi ': 275.5, TD: 0, F: 320 })).toEqual({ ok: true, cotas: { FI: 275.5, TD: 0, F: 320 } })
  })
  it('acepta duplicados compatibles y rechaza los incompatibles', () => {
    expect(validarCotasEntrada({ FI: 2, fi: 2 })).toEqual({ ok: true, cotas: { FI: 2 } })
    expect(validarCotasEntrada({ FI: 2, fi: 3 }).ok).toBe(false)
  })
  it.each([null, [], 3, { FI: NaN }, { FI: Infinity }, { FI: '3' }, { A: 10 }, { ' l ': 10 },
    { Ref: 20 }, { 'FI+TD': 2 }, { '': 10 }])('rechaza %j antes de consultar la base', async cotas => {
    const cliente = new Proxy({}, { get: () => { throw new Error('No debe leer la base') } }) as ClienteEscritura
    const entrada = { cotas } as unknown as EntradaValoracionEstructura
    expect(validarCotasEntrada(cotas).ok).toBe(false)
    expect(await valorarEstructura(cliente, entrada)).toMatchObject({ ok: false, errores: { cotas: expect.any(Array) } })
  })
})
