import { describe, expect, it } from 'vitest'
import { validarArticulo } from './validacion.ts'

const base = {
  codigo: 'GM17172',
  descripcion: 'PREMARCO RPT EXTERIOR',
  familiaCodigo: '001',
  tipoMetraje: 'ML',
}

describe('validarArticulo', () => {
  it('exige la familia, como Productor', () => {
    const r = validarArticulo({ ...base, familiaCodigo: '' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errores.familiaCodigo).toEqual(['Debe indicar el campo Familia'])
  })

  it('exige la descripción, a diferencia de Productor', () => {
    const r = validarArticulo({ ...base, descripcion: '  ' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errores.descripcion).toBeDefined()
  })

  it('acepta coma decimal y deja nulos los campos deshabilitados que no llegan', () => {
    const r = validarArticulo({ ...base, tipoMetraje: 'M2', metrajeMinimo: '0,70', metrajeMultiploAncho: '6' })
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.datos.metrajeMinimo).toBe('0.70')
      expect(r.datos.metrajeMultiploAncho).toBe('6')
      expect(r.datos.metrajeMultiploLargo).toBeNull()
      expect(r.datos.subfamiliaCodigo).toBeNull()
    }
  })

  it('traduce las casillas del formulario a booleanos', () => {
    const r = validarArticulo({ ...base, apareceEnHojaCorte: 'on' })
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.datos.apareceEnHojaCorte).toBe(true)
      expect(r.datos.apareceEnHojaDespiece).toBe(false)
      expect(r.datos.controlaStock).toBe(false)
    }
  })

  it('rechaza un número mal escrito', () => {
    const r = validarArticulo({ ...base, pesoMl: '1,2,3' })
    expect(r.ok).toBe(false)
  })
})
