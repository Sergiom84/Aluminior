import { describe, expect, it } from 'vitest'
import { ordenarNotas } from './notas.ts'
import { validarEvento, validarNota } from './validar.ts'

describe('validación de agenda', () => {
  it('normaliza la hora y rechaza un fin que no es posterior', () => {
    expect(validarEvento({
      titulo: '  Medir hueco  ', dia: '2026-11-09', horaInicio: '8:15', horaFin: '9:00', observaciones: '  ',
    })).toMatchObject({ ok: true, valor: { titulo: 'Medir hueco', horaInicio: '08:15', observaciones: null } })
    expect(validarEvento({ titulo: 'Corte', dia: '2026-11-09', horaInicio: '10:00', horaFin: '10:00' }).ok).toBe(false)
    expect(validarEvento({ titulo: ' ', dia: '2026-02-31', horaInicio: '25:00', horaFin: '09:00' }).ok).toBe(false)
  })

  it('ordena de más a menos urgente y deja lo hecho al final', () => {
    expect(validarNota({ texto: 'Llamar', urgencia: '5' })).toMatchObject({ ok: true, valor: { urgencia: 5 } })
    expect(validarNota({ texto: 'Llamar', urgencia: 0 }).ok).toBe(false)
    expect(validarNota({ texto: 'Llamar', urgencia: 3, dia: '2026-11-12' })).toMatchObject({ ok: true, valor: { dia: '2026-11-12' } })
    expect(validarNota({ texto: 'Llamar', urgencia: 3, dia: '' })).toMatchObject({ ok: true, valor: { dia: null } })
    expect(validarNota({ texto: 'Llamar', urgencia: 3, dia: '2026-02-31' }).ok).toBe(false)
    expect(ordenarNotas([
      { urgencia: 2, hecha: false, creadoEn: '2026-11-09T10:00:00.000Z' },
      { urgencia: 5, hecha: true, creadoEn: '2026-11-09T12:00:00.000Z' },
      { urgencia: 5, hecha: false, creadoEn: '2026-11-09T09:00:00.000Z' },
      { urgencia: 5, hecha: false, creadoEn: '2026-11-09T11:00:00.000Z' },
    ]).map((n) => `${n.hecha ? 'hecha' : 'abierta'}-${n.urgencia}-${n.creadoEn.slice(11, 13)}`)).toEqual([
      'abierta-5-11', 'abierta-5-09', 'abierta-2-10', 'hecha-5-12',
    ])
  })
})
