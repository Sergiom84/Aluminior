/**
 * Salvaguardas del cargador de tarifa (T.59): las reglas puras que protegen la
 * BD compartida. Los efectos de escritura (dry-run no escribe, upsert idempotente,
 * rollback) se verifican en el propio cargador contra la BD; aquí se blindan las
 * decisiones que los gobiernan: tarifas históricas protegidas, validación de fila,
 * y el diff (que hace la carga idempotente).
 */
import { describe, it, expect } from 'vitest'
import {
  tarifaProtegida, tarifaDestinoValida, precioEnRango, normalizarAcabado,
  parsePrecio, esFechaVigencia, validarFilaTarifa, diffTarifa, type FilaTarifa,
} from './tarifa.ts'

describe('tarifas históricas protegidas', () => {
  it('1/2/3 están protegidas y no son destino válido', () => {
    for (const t of [1, 2, 3]) {
      expect(tarifaProtegida(t)).toBe(true)
      expect(tarifaDestinoValida(t)).toBe(false)
    }
  })
  it('una tarifa nueva (2026) es destino válido', () => {
    expect(tarifaProtegida(2026)).toBe(false)
    expect(tarifaDestinoValida(2026)).toBe(true)
  })
  it('rechaza destinos no enteros o no positivos', () => {
    for (const t of [0, -5, 1.5, NaN]) expect(tarifaDestinoValida(t)).toBe(false)
  })
})

describe('validación de precio y campos', () => {
  it('precioEnRango: 0 < p < 100000', () => {
    expect(precioEnRango(10)).toBe(true)
    expect(precioEnRango(99999)).toBe(true)
    expect(precioEnRango(0)).toBe(false)
    expect(precioEnRango(-1)).toBe(false)
    expect(precioEnRango(100000)).toBe(false)
  })
  it('parsePrecio acepta coma o punto; null si no numérico', () => {
    expect(parsePrecio('8,55')).toBeCloseTo(8.55)
    expect(parsePrecio(' 12.5 ')).toBeCloseTo(12.5)
    expect(parsePrecio('abc')).toBeNull()
  })
  it('normalizarAcabado: vacío o * -> UNI', () => {
    expect(normalizarAcabado('')).toBe('UNI')
    expect(normalizarAcabado('*')).toBe('UNI')
    expect(normalizarAcabado(' L ')).toBe('L')
  })
  it('esFechaVigencia acepta ISO y DD/MM/YYYY y vacío', () => {
    expect(esFechaVigencia('2026-01-01')).toBe(true)
    expect(esFechaVigencia('01/01/2026')).toBe(true)
    expect(esFechaVigencia('')).toBe(true)
    expect(esFechaVigencia('ayer')).toBe(false)
  })
})

describe('validarFilaTarifa (nunca inventa, regla 3)', () => {
  it('fila válida se normaliza', () => {
    const r = validarFilaTarifa({ articulo: 'GM306', acabado: '*', precio: '8,55', fecha_vigencia: '2026-01-01' })
    expect(r).toEqual({ ok: true, fila: { articulo: 'GM306', acabado: 'UNI', precio: 8.55, fecha: '2026-01-01' } })
  })
  it('rechaza clave/precio ausente', () => {
    expect(validarFilaTarifa({ articulo: '', precio: '10' }).ok).toBe(false)
    expect(validarFilaTarifa({ articulo: 'GM306', precio: '' }).ok).toBe(false)
  })
  it('rechaza precio fuera de rango con motivo', () => {
    const r = validarFilaTarifa({ articulo: 'GM306', precio: '999999' })
    expect(r).toMatchObject({ ok: false, motivo: 'rango' })
  })
  it('rechaza fecha inválida', () => {
    expect(validarFilaTarifa({ articulo: 'GM306', precio: '10', fecha_vigencia: 'ayer' }))
      .toMatchObject({ ok: false, motivo: 'fecha' })
  })
})

describe('diffTarifa (idempotencia)', () => {
  const fila = (articulo: string, precio: number): [string, FilaTarifa] =>
    [`${articulo}|UNI`, { articulo, acabado: 'UNI', precio, fecha: '2026-01-01' }]

  it('clave nueva = alta', () => {
    const d = diffTarifa(new Map([fila('GM306', 8.55)]), new Map())
    expect(d.altas).toEqual(['GM306|UNI'])
    expect(d.cambios).toEqual([])
  })
  it('re-cargar el mismo fichero = todo iguales (idempotente)', () => {
    const validas = new Map([fila('GM306', 8.55)])
    const existentes = new Map([['GM306|UNI', 8.55]])
    const d = diffTarifa(validas, existentes)
    expect(d.iguales).toEqual(['GM306|UNI'])
    expect(d.altas).toEqual([])
    expect(d.cambios).toEqual([])
  })
  it('precio distinto = cambio', () => {
    const d = diffTarifa(new Map([fila('GM306', 9.00)]), new Map([['GM306|UNI', 8.55]]))
    expect(d.cambios).toHaveLength(1)
    expect(d.altas).toEqual([])
  })
})
