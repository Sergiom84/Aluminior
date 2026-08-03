import { describe, expect, it } from 'vitest'
import {
  esquemaLinea, MAXIMO_HORAS, MAXIMO_NUMERIC_10_2,
} from './esquema-linea.ts'

const base = {
  presupuestoId: '11111111-1111-4111-8111-111111111111',
  tipo: 'CERRAMIENTO',
  codigo: 'GRUPO',
}

const analizar = (extra: Record<string, string>) =>
  esquemaLinea.safeParse({ ...base, ...extra })

/** Errores por campo, como los recibe el formulario. */
const errores = (extra: Record<string, string>) => {
  const r = analizar(extra)
  return r.success ? {} : r.error.flatten().fieldErrors
}

const datos = (extra: Record<string, string>) => {
  const r = analizar(extra)
  if (!r.success) throw new Error(`esperaba válido: ${JSON.stringify(errores(extra))}`)
  return r.data
}

describe('esquema del alta de línea: rango', () => {
  it('acepta horas válidas con decimales, conservando el texto', () => {
    const d = datos({ horasFabricacion: '25.50', horasColocacion: '40' })
    expect(d.horasFabricacion).toBe('25.50')
    expect(d.horasColocacion).toBe('40')
  })

  it('acepta el límite técnico exacto de numeric(6,2)', () => {
    expect(datos({ horasFabricacion: MAXIMO_HORAS }).horasFabricacion).toBe('9999.99')
  })

  it('rechaza el exceso sobre el límite técnico, en ambos conceptos', () => {
    const fallos = errores({ horasFabricacion: '10000', horasColocacion: '99999' })
    expect(fallos.horasFabricacion).toEqual(['Fabricación: fuera de rango'])
    expect(fallos.horasColocacion).toEqual(['Colocación: fuera de rango'])
  })

  // Evidencia: en Productor son horas ADICIONALES, que se SUMAN (T.67.1). Un
  // ajuste a la baja no va por aquí: los descuentos tienen sus columnas.
  it('rechaza horas negativas', () => {
    const fallos = errores({ horasFabricacion: '-1', horasColocacion: '-0.01' })
    expect(fallos.horasFabricacion).toEqual(['Fabricación: no admite negativos'])
    expect(fallos.horasColocacion).toEqual(['Colocación: no admite negativos'])
  })

  it('acota la cantidad al rango de su columna', () => {
    expect(datos({ cantidad: String(MAXIMO_NUMERIC_10_2) }).cantidad).toBe(99_999_999.99)
    expect(errores({ cantidad: '100000000' }).cantidad).toEqual(['Cantidad: fuera de rango'])
    expect(errores({ cantidad: '0' }).cantidad).toEqual(['Cantidad: debe ser mayor que cero'])
  })

  it('acota las medidas al rango de integer', () => {
    expect(analizar({ anchoMm: '2147483647' }).success).toBe(true)
    expect(analizar({ anchoMm: '2147483648' }).success).toBe(false)
  })
})

describe('esquema del alta de línea: escala decimal', () => {
  // La columna es numeric(_,2): PostgreSQL redondearía 0,001 a 0,00 y guardaría
  // un importe distinto del tecleado. Se corta antes.
  it('rechaza más de dos decimales en lugar de dejar que se redondeen', () => {
    expect(errores({ horasFabricacion: '0.001' }).horasFabricacion)
      .toEqual(['Fabricación: máximo 2 decimales'])
    expect(errores({ horasColocacion: '1.999' }).horasColocacion)
      .toEqual(['Colocación: máximo 2 decimales'])
    expect(errores({ cantidad: '0.001' }).cantidad)
      .toEqual(['Cantidad: máximo 2 decimales'])
  })

  it('rechaza el límite técnico con un decimal de más', () => {
    expect(errores({ horasFabricacion: '9999.991' }).horasFabricacion)
      .toEqual(['Fabricación: máximo 2 decimales'])
  })

  /**
   * El punto de T.68: el texto tecleado llega a `core` sin pasar por `number`.
   * Con `.transform(Number)`, `0.07` se convertiría en `0,07000000000000001` y
   * `1.15` en `1,1499999999999999`; el importe saldría desviado del original.
   */
  it('devuelve el texto exacto, no un number, en los valores que el binario deforma', () => {
    for (const valor of ['1.15', '0.07', '8.55', '1234.29', '2.37', '1.10']) {
      const horas = datos({ horasFabricacion: valor }).horasFabricacion
      expect(typeof horas).toBe('string')
      expect(horas).toBe(valor)
    }
    // `1.10` sobreviviría a Number() como `1.1`: mismo valor, otra escala. Y
    // `String(2.675 * 1)` demuestra que la ida y vuelta no es identidad.
    expect(datos({ horasFabricacion: '1.10' }).horasFabricacion).not.toBe('1.1')
  })

  it('rechaza la notación exponencial', () => {
    expect(errores({ horasFabricacion: '1e3' }).horasFabricacion)
      .toEqual(['Fabricación: indica un número'])
    expect(errores({ cantidad: '1E2' }).cantidad).toEqual(['Cantidad: indica un número'])
  })

  it('rechaza la coma decimal en vez de adivinar si es decimal o millar', () => {
    expect(errores({ horasFabricacion: '25,50' }).horasFabricacion)
      .toEqual(['Fabricación: usa punto decimal'])
    expect(errores({ cantidad: '1,500' }).cantidad).toEqual(['Cantidad: usa punto decimal'])
  })

  it('trata el campo vacío como no tecleado y aplica el valor por defecto', () => {
    const d = datos({ horasFabricacion: '', horasColocacion: '   ', cantidad: '' })
    expect(d.horasFabricacion).toBe('0')
    expect(d.horasColocacion).toBe('0')
    expect(d.cantidad).toBe(1)
  })

  it('mantiene el valor por defecto cuando el campo no viene', () => {
    const d = datos({})
    expect(d.horasFabricacion).toBe('0')
    expect(d.horasColocacion).toBe('0')
    expect(d.cantidad).toBe(1)
  })

  it('admite cero: significa que no hay mano de obra adicional', () => {
    const d = datos({ horasFabricacion: '0', horasColocacion: '0.00' })
    expect(d.horasFabricacion).toBe('0')
    expect(d.horasColocacion).toBe('0.00')
  })

  it('devuelve los tres errores de importe a la vez para pintarlos juntos', () => {
    const fallos = errores({ cantidad: '0', horasFabricacion: '-1', horasColocacion: 'x' })
    expect(Object.keys(fallos).sort())
      .toEqual(['cantidad', 'horasColocacion', 'horasFabricacion'])
  })
})
