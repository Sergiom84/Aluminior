import { describe, expect, it } from 'vitest'
import {
  compararDecimal, dividirDecimal, multiplicarDecimal, normalizarDecimal, signoDecimal,
} from './decimal.ts'

describe('normalización a una escala', () => {
  /**
   * El caso que obliga a que este módulo exista: con `number`, `1,005` es
   * `1,00499999999999989...` y `Math.round(1.005 * 100) / 100` da `1`.
   */
  it('redondea a la mitad hacia afuera, como ROUND(numeric, n)', () => {
    expect(normalizarDecimal('1.005', 2)).toBe('1.01')
    expect(normalizarDecimal('2.675', 2)).toBe('2.68')
    expect(normalizarDecimal('1.015', 2)).toBe('1.02')
    expect(normalizarDecimal('-1.005', 2)).toBe('-1.01')
    expect(normalizarDecimal('1.004', 2)).toBe('1.00')
  })

  it('rellena la escala en lugar de dejar el texto como venga', () => {
    expect(normalizarDecimal('0.5', 4)).toBe('0.5000')
    expect(normalizarDecimal('90', 2)).toBe('90.00')
    expect(normalizarDecimal('-0.5', 4)).toBe('-0.5000')
    expect(normalizarDecimal('0.000', 2)).toBe('0.00')
    expect(normalizarDecimal('12', 0)).toBe('12')
    expect(normalizarDecimal(' 1.5 ', 2)).toBe('1.50')
  })

  /**
   * La frontera es el módulo entero, no sólo su aritmética: un `number` ya llega
   * corrompido y ninguna operación posterior lo arregla. Se rechaza en tiempo de
   * ejecución además de en los tipos, porque el valor viene de la base o de un
   * formulario, donde TypeScript no alcanza.
   */
  it('rechaza number, aunque los tipos ya lo impidan', () => {
    const colar = normalizarDecimal as unknown as (v: unknown, e: number) => string
    expect(() => colar(1.005, 2)).toThrow('se esperaba texto y llegó number')
    expect(() => colar(90, 2)).toThrow('se esperaba texto y llegó number')
    expect(() => colar(Number.NaN, 2)).toThrow('se esperaba texto y llegó number')
    expect(() => colar(null, 2)).toThrow('decimal no válido')
  })

  it('rechaza lo que no es un decimal', () => {
    expect(() => normalizarDecimal('', 2)).toThrow('decimal no válido')
    expect(() => normalizarDecimal('1,5', 2)).toThrow('decimal no válido')
    expect(() => normalizarDecimal('abc', 2)).toThrow('decimal no válido')
    // Notación exponencial: `numeric` no la produce y sería la puerta trasera
    // por la que volvería a entrar un `String(numero)`.
    expect(() => normalizarDecimal('1e21', 2)).toThrow('decimal no válido')
    expect(() => normalizarDecimal('1e-7', 8)).toThrow('decimal no válido')
  })
})

describe('producto exacto', () => {
  it('no pierde el céntimo que pierde la coma flotante', () => {
    // 10 × 0,1235 = 1,2349999999999999 en doble precisión, y redondea a 1,23.
    expect(multiplicarDecimal('10.00', '0.1235', 2)).toBe('1.24')
    expect(multiplicarDecimal('2.01', '0.5000', 2)).toBe('1.01')
    expect(multiplicarDecimal('1.10', '1.10', 2)).toBe('1.21')
  })

  it('redondea una sola vez, al final', () => {
    // Cuatro decimales de precio por dos de minutos: 8 dígitos exactos antes
    // del único redondeo.
    expect(multiplicarDecimal('107.40', '0.3330', 2)).toBe('35.76')
    expect(multiplicarDecimal('1.00', '0.1234', 2)).toBe('0.12')
    expect(multiplicarDecimal('1.00', '0.1250', 2)).toBe('0.13')
  })

  it('trabaja por encima del entero seguro de JavaScript', () => {
    // 2^53 - 1 es 9.007.199.254.740.991: cualquier producto de este tamaño
    // sería aproximado con `number`.
    // 599.999,40 × 99.999.999,9999 = 59.999.939.999.940,00006 exacto.
    expect(multiplicarDecimal('599999.40', '99999999.9999', 2))
      .toBe('59999939999940.00')
  })

  it('conserva el signo', () => {
    expect(multiplicarDecimal('90.00', '-0.5000', 2)).toBe('-45.00')
    expect(multiplicarDecimal('90.00', '0.0000', 2)).toBe('0.00')
  })
})

describe('comparación y signo', () => {
  it('compara escalas distintas sin restar en coma flotante', () => {
    expect(compararDecimal('999999999999.99', '999999999999.99')).toBe(0)
    expect(compararDecimal('999999999999.99', '1000000000000.00')).toBe(-1)
    expect(compararDecimal('1000000000000.00', '999999999999.99')).toBe(1)
    expect(compararDecimal('0.5', '0.5000')).toBe(0)
  })

  it('distingue cero, positivo y negativo', () => {
    expect(signoDecimal('0.0000')).toBe(0)
    expect(signoDecimal('-0.0000')).toBe(0)
    expect(signoDecimal('-0.0001')).toBe(-1)
    expect(signoDecimal('0.0001')).toBe(1)
  })
})

describe('dividirDecimal', () => {
  it('divide exacto cuando el cociente cierra', () => {
    expect(dividirDecimal('15', '0.8', 4)).toBe('18.7500')
    expect(dividirDecimal('10', '4', 2)).toBe('2.50')
  })

  // Dividir no cierra: 10/3 es periodico y aqui el redondeo es inevitable,
  // no un detalle de presentacion. Se redondea a la mitad hacia afuera.
  it('redondea el cociente periodico a la escala pedida', () => {
    expect(dividirDecimal('10', '3', 4)).toBe('3.3333')
    expect(dividirDecimal('20', '3', 4)).toBe('6.6667')
    expect(dividirDecimal('1', '3', 0)).toBe('0')
    expect(dividirDecimal('2', '3', 0)).toBe('1')
  })

  it('respeta el signo de los dos operandos', () => {
    expect(dividirDecimal('-10', '4', 2)).toBe('-2.50')
    expect(dividirDecimal('10', '-4', 2)).toBe('-2.50')
    expect(dividirDecimal('-10', '-4', 2)).toBe('2.50')
  })

  it('divide entre un decimal sin perder digitos', () => {
    expect(dividirDecimal('1', '0.0001', 4)).toBe('10000.0000')
  })

  // Cero silencioso convertido en precio: el fallo mas caro posible aqui.
  it('lanza al dividir entre cero', () => {
    expect(() => dividirDecimal('10', '0', 2)).toThrow(/cero/)
    expect(() => dividirDecimal('10', '0.00', 2)).toThrow(/cero/)
  })
})
