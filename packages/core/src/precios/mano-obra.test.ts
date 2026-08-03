import { describe, expect, it } from 'vitest'
import {
  articuloDeConcepto, MAXIMO_IMPORTE, minutosDeHoras, valorarManoObra,
} from './mano-obra.ts'

const base = { minutos: '90.00', precioMinuto: '0.5000', costeMinuto: '0.5000' }

/** Máximo de `precio_minuto`/`coste_minuto`: `numeric(12,4)`. */
const PRECIO_MAXIMO = '99999999.9999'
/** Máximo de `minutos`: `numeric(10,2)`, acotado por `9.999,99 h × 60`. */
const MINUTOS_MAXIMOS = '599999.40'

describe('horas a minutos', () => {
  it('convierte lo que teclea el operador', () => {
    expect(minutosDeHoras('1.50')).toBe('90.00')
    expect(minutosDeHoras('1.5')).toBe('90.00')
    expect(minutosDeHoras('0.25')).toBe('15.00')
    expect(minutosDeHoras('7')).toBe('420.00')
    expect(minutosDeHoras('0')).toBe('0.00')
  })

  // Los 11 casos históricos con minutos decimales (T.67.1) son exactamente
  // esta multiplicación. Redondear a entero cambiaría el importe.
  it('no redondea a entero, como el original', () => {
    expect(minutosDeHoras('2.37')).toBe('142.20')
    expect(minutosDeHoras('6.07')).toBe('364.20')
    expect(minutosDeHoras('2.61')).toBe('156.60')
    expect(minutosDeHoras('1.79')).toBe('107.40')
    expect(minutosDeHoras('9999.99')).toBe(MINUTOS_MAXIMOS)
  })

  it('rechaza lo que no es una duración', () => {
    expect(() => minutosDeHoras('-1')).toThrow('horas no válidas')
    expect(() => minutosDeHoras('1,5')).toThrow('decimal no válido')
    expect(() => minutosDeHoras('')).toThrow('decimal no válido')
  })

  // La valoración no toca `number` en ninguna de sus entradas.
  it('rechaza el número que el formulario podría colar sin validar', () => {
    const colar = minutosDeHoras as unknown as (v: unknown) => string
    expect(() => colar(1.5)).toThrow('se esperaba texto y llegó number')
  })

  it('asocia cada concepto con su artículo medido', () => {
    expect(articuloDeConcepto('FABRICACION_ADICIONAL')).toBe('MO')
    expect(articuloDeConcepto('COLOCACION')).toBe('MOCOL')
  })
})

describe('valoración de la venta', () => {
  it('valora con el precio de la tarifa', () => {
    expect(valorarManoObra(base)).toMatchObject({
      precioMinuto: '0.5000', importe: '45.00', valoracionCompleta: true, motivoCodigo: null,
    })
  })

  it('devuelve el precio en la escala de la columna, listo para persistir', () => {
    expect(valorarManoObra({ ...base, precioMinuto: '0.5' }).precioMinuto).toBe('0.5000')
    expect(valorarManoObra({ ...base, minutos: '90' }).importe).toBe('45.00')
  })

  it('redondea el importe al céntimo', () => {
    expect(valorarManoObra({ ...base, minutos: '142.20' }).importe).toBe('71.10')
    expect(valorarManoObra({
      ...base, minutos: '107.40', precioMinuto: '0.3330',
    }).importe).toBe('35.76')
  })

  /**
   * El céntimo que la coma flotante se comía. Con `number`,
   * `Math.round(2.01 * 0.5 * 100) / 100` da `1` porque `1,005` es
   * `1,00499999999999989...` en doble precisión.
   */
  it('redondea 1,005 a 1,01, no a 1,00', () => {
    expect(valorarManoObra({ ...base, minutos: '2.01' }).importe).toBe('1.01')
    expect(valorarManoObra({ ...base, minutos: '2.01' }).costeTotal).toBe('1.01')
  })

  // El precio del catálogo tiene cuatro decimales: el producto se calcula
  // entero y sólo se redondea al final.
  it('multiplica exacto con precios de cuatro decimales', () => {
    expect(valorarManoObra({
      ...base, minutos: '10.00', precioMinuto: '0.1235',
    }).importe).toBe('1.24')
    expect(valorarManoObra({
      ...base, minutos: '1.00', precioMinuto: '0.1234',
    }).importe).toBe('0.12')
    expect(valorarManoObra({
      ...base, minutos: '1.00', precioMinuto: '0.1250',
    }).importe).toBe('0.13')
  })

  // Caso histórico del §13: 2,37 h de fabricación adicional a la tarifa medida.
  it('reproduce el caso histórico 142,20 × 0,5000', () => {
    expect(valorarManoObra({
      minutos: minutosDeHoras('2.37'), precioMinuto: '0.5000', costeMinuto: '0.5000',
    })).toMatchObject({ importe: '71.10', costeTotal: '71.10', valoracionCompleta: true })
  })

  // Caso real: tarifas 2 y 3 tienen la mano de obra a 0,0000.
  it('trata el precio cero como catálogo sin rellenar, no como gratis', () => {
    expect(valorarManoObra({ ...base, precioMinuto: '0' })).toMatchObject({
      precioMinuto: '0.0000', importe: null, valoracionCompleta: false,
      motivoCodigo: 'PVP_CERO',
    })
  })

  // Caso real: MOMOSQ no tiene fila en articulos_pvp.
  it('distingue precio ausente de precio cero', () => {
    expect(valorarManoObra({ ...base, precioMinuto: null })).toMatchObject({
      precioMinuto: null, importe: null, valoracionCompleta: false, motivoCodigo: 'SIN_PVP',
    })
  })

  /**
   * Un PVP negativo es catálogo corrupto, no un descuento. Sin este código, el
   * importe negativo llegaría a PostgreSQL y el CHECK lo rechazaría con un error
   * crudo durante la escritura: pantalla rota en vez de documento sin valorar.
   */
  it('deja la venta incompleta con un precio negativo, conservándolo', () => {
    expect(valorarManoObra({ ...base, precioMinuto: '-0.5000' })).toMatchObject({
      precioMinuto: '-0.5000', importe: null, valoracionCompleta: false,
      motivoCodigo: 'PVP_NEGATIVO',
    })
    expect(valorarManoObra({ ...base, precioMinuto: '-0.0001' }).motivoCodigo)
      .toBe('PVP_NEGATIVO')
  })

  it('conserva el precio real cuando el importe no cabe en numeric(14,2)', () => {
    const resultado = valorarManoObra({
      ...base, minutos: MINUTOS_MAXIMOS, precioMinuto: '9999999.0000',
    })
    expect(resultado.motivoCodigo).toBe('IMPORTE_FUERA_RANGO')
    expect(resultado.importe).toBeNull()
    expect(resultado.valoracionCompleta).toBe(false)
    // La evidencia del catálogo defectuoso no se borra.
    expect(resultado.precioMinuto).toBe('9999999.0000')
  })

  // Los dos factores máximos que las columnas admiten: cada uno cabe, el
  // producto no. Es el desbordamiento del §3.2, con valores reales del esquema.
  it('detecta el desbordamiento con precio y minutos máximos de columna', () => {
    expect(valorarManoObra({
      ...base, minutos: MINUTOS_MAXIMOS, precioMinuto: PRECIO_MAXIMO,
    })).toMatchObject({
      precioMinuto: PRECIO_MAXIMO, importe: null, motivoCodigo: 'IMPORTE_FUERA_RANGO',
    })
  })

  /**
   * Frontera del techo de `numeric(14,2)`. El par de factores es una sonda del
   * límite, no un precio de catálogo plausible: lo que se prueba es que el
   * máximo exacto entra y que un céntimo más no.
   */
  it('acepta el importe máximo exacto y rechaza un céntimo más', () => {
    const exacto = valorarManoObra({ ...base, minutos: '2.00', precioMinuto: '499999999999.9950' })
    expect(exacto.valoracionCompleta).toBe(true)
    expect(exacto.importe).toBe(MAXIMO_IMPORTE)

    const uncentimoMas = valorarManoObra({
      ...base, minutos: '2.00', precioMinuto: '500000000000.0000',
    })
    expect(uncentimoMas.motivoCodigo).toBe('IMPORTE_FUERA_RANGO')
    expect(uncentimoMas.importe).toBeNull()
  })

  it('rechaza minutos que no valen nada', () => {
    expect(() => valorarManoObra({ ...base, minutos: '0' })).toThrow('minutos no válidos')
    expect(() => valorarManoObra({ ...base, minutos: '-5' })).toThrow('minutos no válidos')
    // Menos de medio céntimo de minuto redondea a cero: tampoco es una duración.
    expect(() => valorarManoObra({ ...base, minutos: '0.004' })).toThrow('minutos no válidos')
  })
})

describe('valoración del coste, independiente de la venta', () => {
  it('congela coste por minuto y coste total', () => {
    expect(valorarManoObra(base)).toMatchObject({
      costeMinuto: '0.5000', costeTotal: '45.00', motivoCosteCodigo: null,
    })
  })

  it('no invalida la venta cuando el coste falta', () => {
    expect(valorarManoObra({ ...base, costeMinuto: null })).toMatchObject({
      valoracionCompleta: true, importe: '45.00',
      costeMinuto: null, costeTotal: null, motivoCosteCodigo: 'SIN_COSTE',
    })
  })

  it('no elige coste cuando es ambiguo', () => {
    expect(valorarManoObra({ ...base, costeAmbiguo: true })).toMatchObject({
      valoracionCompleta: true,
      costeMinuto: null, costeTotal: null, motivoCosteCodigo: 'COSTE_AMBIGUO',
    })
  })

  it('conserva el coste negativo sin tocar la venta', () => {
    expect(valorarManoObra({ ...base, costeMinuto: '-0.5000' })).toMatchObject({
      valoracionCompleta: true, importe: '45.00',
      costeMinuto: '-0.5000', costeTotal: null, motivoCosteCodigo: 'COSTE_NEGATIVO',
    })
  })

  it('protege también el desbordamiento del coste', () => {
    const resultado = valorarManoObra({
      ...base, minutos: MINUTOS_MAXIMOS, costeMinuto: PRECIO_MAXIMO,
    })
    expect(resultado.motivoCosteCodigo).toBe('COSTE_FUERA_RANGO')
    expect(resultado.costeTotal).toBeNull()
    expect(resultado.costeMinuto).toBe(PRECIO_MAXIMO)
    // La venta sigue completa: el coste no la decide.
    expect(resultado.valoracionCompleta).toBe(true)
    expect(resultado.importe).toBe('299999.70')
  })
})
