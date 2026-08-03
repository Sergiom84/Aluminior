import { describe, expect, it } from 'vitest'
import { MensajeError } from './mensaje-error.tsx'

/** Se inspecciona el elemento devuelto: no hace falta DOM para esto. */
const render = (campo: string, errores: Record<string, string[] | undefined>) =>
  MensajeError({ campo, errores }) as { props: Record<string, unknown> } | null

describe('mensaje de error de campo', () => {
  it('se anuncia y se asocia al campo por el mismo id que usa aria-describedby', () => {
    const elemento = render('horasFabricacion', {
      horasFabricacion: ['Fabricación: no admite negativos'],
    })
    expect(elemento?.props.id).toBe('horasFabricacion-error')
    expect(elemento?.props.role).toBe('alert')
    expect(elemento?.props.children).toBe('Fabricación: no admite negativos')
  })

  it('no pinta nada sin error', () => {
    expect(render('cantidad', {})).toBeNull()
  })
})
