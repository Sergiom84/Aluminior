/**
 * `ejercicioDeFecha` es la única parte pura del módulo: el resto necesita
 * PostgreSQL de verdad (lock, MAX, UNIQUE) y se prueba en
 * `reservar.integracion.test.ts`.
 */
import { describe, expect, it } from 'vitest'
import { ejercicioDeFecha } from './reservar.ts'

describe('ejercicioDeFecha', () => {
  it('toma los 2 dígitos del año de la FECHA DEL DOCUMENTO', () => {
    expect(ejercicioDeFecha('2026-01-15')).toBe(26)
    expect(ejercicioDeFecha('2031-12-31')).toBe(31)
  })

  it('no depende del reloj del sistema: una fecha pasada da su propio ejercicio', () => {
    expect(ejercicioDeFecha('1999-06-01')).toBe(99)
  })
})
