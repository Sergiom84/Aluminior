import { describe, expect, it, vi } from 'vitest'
import { atributosCampo, bordeCampo, idMensajeError, mensajesDe } from './campos.ts'
import { MENSAJE_FALLO_GUARDADO, registrarFallo } from './errores.ts'

const BORDE = 'var(--al-border-strong)'

describe('cableado de errores de campo', () => {
  const errores = {
    cantidad: ['Cantidad: debe ser mayor que cero'],
    ajusteFabricacion: ['Fabricación: no admite negativos'],
    ajusteColocacion: ['Colocación: importe fuera de rango'],
  }

  it('marca el campo con error y lo asocia a su mensaje', () => {
    for (const campo of ['cantidad', 'ajusteFabricacion', 'ajusteColocacion']) {
      expect(atributosCampo(campo, errores)).toEqual({
        id: campo,
        name: campo,
        'aria-invalid': true,
        'aria-describedby': `${campo}-error`,
      })
      expect(mensajesDe(campo, errores)).toHaveLength(1)
      expect(bordeCampo(campo, errores, BORDE)).toBe('var(--al-error)')
    }
  })

  it('no ensucia el campo sin error', () => {
    expect(atributosCampo('serieCodigo', errores)).toEqual({
      id: 'serieCodigo', name: 'serieCodigo',
    })
    expect(mensajesDe('serieCodigo', errores)).toEqual([])
    expect(bordeCampo('serieCodigo', errores, BORDE)).toBe(BORDE)
  })

  it('usa un identificador estable, no posicional', () => {
    expect(idMensajeError('ajusteColocacion')).toBe('ajusteColocacion-error')
  })
})

describe('frontera de errores técnicos', () => {
  it('no expone el mensaje de PostgreSQL al operador', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const fallo = new Error(
      'numeric field overflow: A field with precision 12, scale 2 must round to ' +
      'an absolute value less than 10^10. violates check constraint ' +
      '"lineas_cerramiento_ajustes_check"',
    )

    const mensaje = registrarFallo('anyadirLinea', fallo)

    expect(mensaje).toBe(MENSAJE_FALLO_GUARDADO)
    expect(mensaje).not.toMatch(/numeric|constraint|lineas_cerramiento|precision/i)
    // El detalle no se pierde: va al registro del servidor.
    expect(spy).toHaveBeenCalledWith('[presupuestos] anyadirLinea', fallo)
    spy.mockRestore()
  })
})
