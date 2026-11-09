import { describe, expect, it } from 'vitest'
import { marcasPorDia } from './marcas.ts'

describe('marcas del mes', () => {
  it('cuenta trabajos y solo las tareas pendientes con día', () => {
    const marcas = marcasPorDia(
      [{ dia: '2026-11-10' }, { dia: '2026-11-10' }, { dia: '2026-11-12' }],
      [
        { dia: '2026-11-10', hecha: false },
        { dia: '2026-11-11', hecha: false },
        { dia: '2026-11-11', hecha: true },
        { dia: null, hecha: false },
      ],
    )
    expect(Object.fromEntries(marcas)).toEqual({
      '2026-11-10': { trabajos: 2, tareas: 1 },
      '2026-11-11': { trabajos: 0, tareas: 1 },
      '2026-11-12': { trabajos: 1, tareas: 0 },
    })
  })
})
