import { describe, expect, it } from 'vitest'
import { filtroListadoClientes, fragmentosBusqueda, normalizarFragmento } from './busqueda-clientes.ts'

describe('fragmentos de búsqueda de cliente', () => {
  it('quita acentos, comodines y trata c/ como calle', () => {
    expect(normalizarFragmento('C/')).toBe('calle')
    expect(normalizarFragmento('Álv%_arez')).toBe('alvarez')
    expect(fragmentosBusqueda('  Calle   MAYOR  ')).toEqual(['calle', 'mayor'])
  })

  it('no convierte un fragmento suelto que no es abreviatura', () => {
    expect(normalizarFragmento('c')).toBe('c')
    expect(fragmentosBusqueda('')).toEqual([])
    expect(filtroListadoClientes('   ')).toBeUndefined()
  })
})
