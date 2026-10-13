import { describe, expect, it } from 'vitest'
import { seleccionarDespunteCondicional, type ContextoDespunteCondicional, type ReglaDespunteCondicional } from './condicional.ts'

const contexto: ContextoDespunteCondicional = { estructuraCodigo: 'E2', familiaCodigo: 'F1', serieCodigo: 'S1' }
const regla = (cambios: Partial<ReglaDespunteCondicional> = {}): ReglaDespunteCondicional => ({
  id: 'R1', prioridad: 1, estructuras: 'E1;E2', familias: 'F1', series: 'S1', acabados: 'A1;A2', ...cambios,
})
const seleccionar = (reglas: readonly ReglaDespunteCondicional[], actual = contexto) =>
  seleccionarDespunteCondicional({ activo: true, contexto: actual, reglas })

describe('selección condicional independiente del despunte global', () => {
  it('queda inactiva por defecto o por parámetro explícito', () => {
    expect(seleccionarDespunteCondicional({ contexto, reglas: [regla()] })).toMatchObject({ estado: 'INACTIVO', acabados: [] })
    expect(seleccionarDespunteCondicional({ activo: false, contexto, reglas: [regla({ acabados: null })] }))
      .toMatchObject({ estado: 'INACTIVO', acabados: [] })
  })

  it('compara sin distinguir mayúsculas y devuelve acabados sin normalizarlos', () => {
    expect(seleccionar([regla({ acabados: 'AcA; ACB' })], {
      estructuraCodigo: 'e2', familiaCodigo: 'f1', serieCodigo: 's1',
    })).toMatchObject({ estado: 'RESUELTO', reglaId: 'R1', acabados: ['AcA', ' ACB'] })
  })

  it.each([
    { estructuraCodigo: 'E3' }, { estructuraCodigo: 'E' }, { familiaCodigo: 'F2' }, { serieCodigo: 'S2' },
  ])('exige los filtros conjuntamente y sin coincidencia parcial: %o', cambios => {
    expect(seleccionar([regla()], { ...contexto, ...cambios })).toMatchObject({ estado: 'SIN_COINCIDENCIA', acabados: [] })
  })

  it('no quita espacios de los filtros ni de sus códigos', () => {
    expect(seleccionar([regla({ estructuras: 'E1; E2' })])).toMatchObject({ estado: 'SIN_COINCIDENCIA', acabados: [] })
    expect(seleccionar([regla()], { ...contexto, estructuraCodigo: ' E2' })).toMatchObject({ estado: 'SIN_COINCIDENCIA', acabados: [] })
  })

  it.each([null, ''])('un filtro %s no limita', lista => {
    expect(seleccionar([regla({ estructuras: lista, familias: lista, series: lista })], {
      estructuraCodigo: null, familiaCodigo: null, serieCodigo: null,
    })).toMatchObject({ estado: 'RESUELTO', acabados: ['A1', 'A2'] })
  })

  it('familia ausente incumple únicamente cuando existe su filtro', () => {
    expect(seleccionar([regla()], { ...contexto, familiaCodigo: null })).toMatchObject({ estado: 'SIN_COINCIDENCIA' })
    expect(seleccionar([regla({ familias: null })], { ...contexto, familiaCodigo: null })).toMatchObject({ estado: 'RESUELTO' })
  })

  it('elige la mayor prioridad coincidente y no una regla superior que incumple', () => {
    const reglas = [regla(), regla({ id: 'R2', prioridad: 9, acabados: 'A9' }),
      regla({ id: 'R3', prioridad: 20, estructuras: 'E3', acabados: 'A20' })]
    expect(seleccionar(reglas)).toMatchObject({ estado: 'RESUELTO', reglaId: 'R2', acabados: ['A9'] })
    expect(seleccionar([...reglas].reverse())).toEqual(seleccionar(reglas))
  })

  it('un empate de prioridad máxima no elige acabados ni depende del orden', () => {
    const reglas = [regla(), regla({ id: 'R2', prioridad: 9, acabados: 'A9' }),
      regla({ id: 'R3', prioridad: 9, acabados: 'B9' })]
    const resultado = seleccionar(reglas)
    expect(resultado).toMatchObject({ estado: 'AMBIGUO', reglaId: null, acabados: [], reglasAmbiguas: ['R2', 'R3'] })
    expect(seleccionar([...reglas].reverse())).toMatchObject({ estado: 'AMBIGUO', reglaId: null, acabados: [] })
  })

  it('un empate inferior no bloquea una regla máxima única', () => {
    expect(seleccionar([regla(), regla({ id: 'R2' }), regla({ id: 'R3', prioridad: 2, acabados: 'A3' })]))
      .toMatchObject({ estado: 'RESUELTO', reglaId: 'R3', acabados: ['A3'] })
  })

  it.each([null, '', ' ', 'A1;;A2'])('bloquea configuración de acabados ausente o vacía: %s', acabados => {
    expect(seleccionar([regla({ acabados })])).toMatchObject({ estado: 'BLOQUEADO', reglaId: null, acabados: [] })
  })

  it.each([NaN, Infinity, -Infinity])('bloquea prioridad no finita: %s', prioridad => {
    expect(seleccionar([regla({ prioridad })])).toMatchObject({ estado: 'BLOQUEADO', acabados: [] })
  })

  it('bloquea identidades de regla ausentes o duplicadas', () => {
    expect(seleccionar([regla({ id: '' })])).toMatchObject({ estado: 'BLOQUEADO', acabados: [] })
    expect(seleccionar([regla(), regla({ prioridad: 5 })])).toMatchObject({ estado: 'BLOQUEADO', acabados: [] })
  })

  it('sin reglas no inventa una coincidencia', () => {
    expect(seleccionar([])).toMatchObject({ estado: 'SIN_COINCIDENCIA', reglaId: null, acabados: [] })
  })

  it('no muta el contexto ni reordena reglas ni acumula acabados', () => {
    const reglas = Object.freeze([Object.freeze(regla({ id: 'R2', prioridad: 2 })), Object.freeze(regla())])
    const actual = Object.freeze({ ...contexto })
    const foto = JSON.stringify({ reglas, actual })
    const primero = seleccionar(reglas, actual)
    expect(seleccionar(reglas, actual)).toEqual(primero)
    expect(JSON.stringify({ reglas, actual })).toBe(foto)
  })
})
