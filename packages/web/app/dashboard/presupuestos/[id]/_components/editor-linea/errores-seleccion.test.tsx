import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { ErroresSeleccion } from './errores-seleccion.tsx'

describe('errores de selección del editor', () => {
  it('muestra ambos errores como alerta fuera de las pestañas ocultas', () => {
    const html = renderToStaticMarkup(<ErroresSeleccion errores={{ opcionHerraje: ['Selección incompatible'], opcionAcristalamiento: ['Opción no disponible'] }} />)
    expect(html).toContain('role="alert"')
    expect(html).toContain('Selección incompatible')
    expect(html).toContain('Opción no disponible')
  })
  it('no muestra alerta vacía ni errores de otros campos', () => {
    expect(renderToStaticMarkup(<ErroresSeleccion errores={{ codigo: ['Otro campo'] }} />)).toBe('')
  })
})
