import { describe, expect, it } from 'vitest'
import { opcionesAcristalamiento } from './acristalamiento.ts'

describe('opciones de acristalamiento de la serie (CHM 5.1.2.12.5 y 5.3.1.3.2.4)', () => {
  it('la opción 1 es la predeterminada y se omiten las posiciones vacías', () => {
    const opciones = opcionesAcristalamiento([
      { hojas: 'GM02', fijos: 'GM02' },
      { hojas: '', fijos: null },
      { hojas: 'GM03', fijos: 'GM03' },
      { hojas: null, fijos: null },
      { hojas: '0', fijos: '0' },
    ], new Map([['GM02', 'RECTO CLIP 20MM']]))
    expect(opciones.map((o) => [o.numero, o.predeterminada])).toEqual([[1, true], [3, false]])
    expect(opciones[0].hojas).toEqual({ codigo: 'GM02', descripcion: 'RECTO CLIP 20MM' })
    expect(opciones[1].hojas).toEqual({ codigo: 'GM03', descripcion: null })
  })

  it('una opción sin tabla de fijos se ofrece sin inventarla', () => {
    const [opcion] = opcionesAcristalamiento([{ hojas: 'GM08', fijos: null }])
    expect(opcion).toMatchObject({ numero: 1, fijos: null })
  })

  it('nunca ofrece más de cinco opciones', () => {
    const muchas = Array.from({ length: 7 }, (_, i) => ({ hojas: `T${i}`, fijos: `T${i}` }))
    expect(opcionesAcristalamiento(muchas)).toHaveLength(5)
  })
})
