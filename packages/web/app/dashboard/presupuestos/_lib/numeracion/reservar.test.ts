/**
 * `validarFechaDocumento` es la única parte pura del módulo: el resto
 * necesita PostgreSQL de verdad (lock, MAX, UNIQUE) y se prueba en
 * `reservar.integracion.test.ts`.
 */
import { describe, expect, it } from 'vitest'
import { validarFechaDocumento } from './reservar.ts'

describe('validarFechaDocumento', () => {
  it('fecha real: ejercicio son los 2 dígitos del año de la FECHA DEL DOCUMENTO', () => {
    expect(validarFechaDocumento('2026-02-28')).toEqual({ ok: true, ejercicio: 26 })
  })

  it('29 de febrero en año bisiesto es válido', () => {
    expect(validarFechaDocumento('2028-02-29')).toEqual({ ok: true, ejercicio: 28 })
  })

  it('30 de febrero no existe: inválida aunque el formato sea correcto', () => {
    const r = validarFechaDocumento('2026-02-30')
    expect(r.ok).toBe(false)
  })

  it('29 de febrero en año NO bisiesto no existe', () => {
    expect(validarFechaDocumento('2026-02-29').ok).toBe(false)
  })

  it('texto arbitrario es inválido', () => {
    expect(validarFechaDocumento('mañana').ok).toBe(false)
    expect(validarFechaDocumento('2026-13-01').ok).toBe(false)
    expect(validarFechaDocumento('').ok).toBe(false)
  })

  it('un año pasado es válido y no depende del reloj del sistema', () => {
    expect(validarFechaDocumento('1999-06-01')).toEqual({ ok: true, ejercicio: 99 })
  })
})
