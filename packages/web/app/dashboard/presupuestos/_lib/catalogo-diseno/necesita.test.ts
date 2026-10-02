import { afterEach, describe, expect, it } from 'vitest'
import { registrarCatalogoDiseno } from '@aluminior/core/estructuras'
import { necesitaCatalogoDiseno } from './necesita.ts'

const con = (...codigos: string[]) => JSON.stringify({
  version: 3, modulos: codigos.map((estructuraCodigo, i) => ({ id: `modulo-${i + 1}`, estructuraCodigo })),
})

describe('necesidad de leer el catálogo antes de validar', () => {
  afterEach(() => registrarCatalogoDiseno([]))

  it('no la tiene una entrada malformada o sin módulos', () => {
    expect(necesitaCatalogoDiseno('{"version":9}')).toBe(false)
    expect(necesitaCatalogoDiseno('no es json')).toBe(false)
    expect(necesitaCatalogoDiseno(null)).toBe(false)
  })

  it('no la tiene una composición de plantillas verificadas', () => {
    expect(necesitaCatalogoDiseno(con('2O', '0'))).toBe(false)
  })

  it('la tiene si usa una estructura aún no registrada', () => {
    expect(necesitaCatalogoDiseno(con('2O', 'C2'))).toBe(true)
  })
})
