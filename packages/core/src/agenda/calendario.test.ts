import { describe, expect, it } from 'vitest'
import {
  columnasSolape, diasDelMes, etiquetaSemana, fechaMadrid, finSugerido, franjas,
  rangoVisible, seleccionAgenda, semanaDe, tramoVisible,
} from './calendario.ts'

describe('calendario de taller', () => {
  it('usa el día de Madrid, no el de UTC, a última hora', () => {
    expect(fechaMadrid(new Date('2026-11-09T22:30:00Z'))).toBe('2026-11-09')
    expect(fechaMadrid(new Date('2026-11-09T23:30:00Z'))).toBe('2026-11-10')
  })

  it('empieza la semana en lunes y no acepta el 31 de febrero', () => {
    expect(semanaDe('2024-01-01')).toEqual([
      '2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04',
      '2024-01-05', '2024-01-06', '2024-01-07',
    ])
    expect(semanaDe('2024-01-07')?.[0]).toBe('2024-01-01')
    expect(diasDelMes(2024, 2)?.[0]).toEqual({ fecha: '2024-01-29', enMes: false })
    expect(diasDelMes(2024, 2)?.some((d) => d.fecha === '2024-02-29' && d.enMes)).toBe(true)
    expect(diasDelMes(2024, 2)).toHaveLength(35)
    expect(semanaDe('2024-02-31')).toBeNull()
  })

  it('cubre la jornada de 07:00 a 20:00 en medias horas', () => {
    const horas = franjas()
    expect(horas[0]).toEqual({ inicio: '07:00', fin: '07:30' })
    expect(horas.at(-1)).toEqual({ inicio: '19:30', fin: '20:00' })
    expect(horas).toHaveLength(26)
    expect(finSugerido('19:30')).toBe('20:00')
    expect(finSugerido('20:00')).toBe('20:30')
  })

  it('recorta a la jornada visible y no trata como solape dos trabajos que se tocan', () => {
    expect(tramoVisible('06:30', '08:00')).toEqual({ desde: 7 * 60, hasta: 8 * 60 })
    expect(tramoVisible('20:00', '21:00')).toBeNull()
    const puestos = columnasSolape([
      { horaInicio: '08:00', horaFin: '10:00' },
      { horaInicio: '09:00', horaFin: '11:00' },
      { horaInicio: '10:00', horaFin: '12:00' },
    ])
    expect(puestos.map((p) => p.columna)).toEqual([0, 1, 0])
    expect(puestos.every((p) => p.total === 2)).toBe(true)
  })

  it('al pedir un día inválido se queda en hoy y carga el mes visto y su semana', () => {
    expect(seleccionAgenda('2026-11-09', '2026-02-31', '2026-10')).toEqual({
      dia: '2026-11-09', mes: '2026-10',
    })
    const rango = rangoVisible('2026-11-09', '2026-11')
    expect(rango).not.toBeNull()
    expect(rango!.desde <= '2026-11-01').toBe(true)
    expect(rango!.hasta >= '2026-11-30').toBe(true)
    expect(etiquetaSemana(semanaDe('2026-11-09')!)).toBe('9–15 nov')
  })
})
