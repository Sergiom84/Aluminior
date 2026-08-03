import { describe, expect, it } from 'vitest'
import {
  esquemaLinea, MAXIMO_NUMERIC_10_2, MAXIMO_NUMERIC_12_2,
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
  it('acepta un ajuste válido con decimales', () => {
    const d = datos({ ajusteFabricacion: '25.50', ajusteColocacion: '40' })
    expect(d.ajusteFabricacion).toBe(25.5)
    expect(d.ajusteColocacion).toBe(40)
  })

  it('acepta el límite técnico exacto de numeric(12,2)', () => {
    expect(datos({ ajusteFabricacion: String(MAXIMO_NUMERIC_12_2) }).ajusteFabricacion)
      .toBe(9_999_999_999.99)
  })

  it('rechaza el exceso sobre el límite técnico, en ambos ajustes', () => {
    const fallos = errores({ ajusteFabricacion: '10000000000', ajusteColocacion: '99999999999' })
    expect(fallos.ajusteFabricacion).toEqual(['Fabricación: fuera de rango'])
    expect(fallos.ajusteColocacion).toEqual(['Colocación: fuera de rango'])
  })

  // Evidencia: CHECK `lineas_cerramiento_ajustes_check` (migración 0017) y el
  // campo equivalente de Productor, que son horas ADICIONALES.
  it('rechaza ajustes negativos', () => {
    const fallos = errores({ ajusteFabricacion: '-1', ajusteColocacion: '-0.01' })
    expect(fallos.ajusteFabricacion).toEqual(['Fabricación: no admite negativos'])
    expect(fallos.ajusteColocacion).toEqual(['Colocación: no admite negativos'])
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
    expect(errores({ ajusteFabricacion: '0.001' }).ajusteFabricacion)
      .toEqual(['Fabricación: máximo 2 decimales'])
    expect(errores({ ajusteColocacion: '1.999' }).ajusteColocacion)
      .toEqual(['Colocación: máximo 2 decimales'])
    expect(errores({ cantidad: '0.001' }).cantidad)
      .toEqual(['Cantidad: máximo 2 decimales'])
  })

  it('rechaza el límite técnico con un decimal de más', () => {
    expect(errores({ ajusteFabricacion: '9999999999.991' }).ajusteFabricacion)
      .toEqual(['Fabricación: máximo 2 decimales'])
  })

  it('no da falso negativo con decimales que la coma flotante no representa exacto', () => {
    for (const valor of ['1.15', '0.07', '8.55', '1234.29']) {
      expect(datos({ ajusteFabricacion: valor }).ajusteFabricacion).toBe(Number(valor))
    }
  })

  it('rechaza la notación exponencial', () => {
    expect(errores({ ajusteFabricacion: '1e3' }).ajusteFabricacion)
      .toEqual(['Fabricación: indica un número'])
    expect(errores({ cantidad: '1E2' }).cantidad).toEqual(['Cantidad: indica un número'])
  })

  it('rechaza la coma decimal en vez de adivinar si es decimal o millar', () => {
    expect(errores({ ajusteFabricacion: '25,50' }).ajusteFabricacion)
      .toEqual(['Fabricación: usa punto decimal'])
    expect(errores({ cantidad: '1,500' }).cantidad).toEqual(['Cantidad: usa punto decimal'])
  })

  it('trata el campo vacío como no tecleado y aplica el valor por defecto', () => {
    const d = datos({ ajusteFabricacion: '', ajusteColocacion: '   ', cantidad: '' })
    expect(d.ajusteFabricacion).toBe(0)
    expect(d.ajusteColocacion).toBe(0)
    expect(d.cantidad).toBe(1)
  })

  it('mantiene el valor por defecto cuando el campo no viene', () => {
    const d = datos({})
    expect(d.ajusteFabricacion).toBe(0)
    expect(d.ajusteColocacion).toBe(0)
    expect(d.cantidad).toBe(1)
  })

  it('devuelve los tres errores de importe a la vez para pintarlos juntos', () => {
    const fallos = errores({ cantidad: '0', ajusteFabricacion: '-1', ajusteColocacion: 'x' })
    expect(Object.keys(fallos).sort())
      .toEqual(['ajusteColocacion', 'ajusteFabricacion', 'cantidad'])
  })
})
