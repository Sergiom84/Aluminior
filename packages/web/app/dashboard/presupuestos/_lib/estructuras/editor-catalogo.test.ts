import { describe, expect, it } from 'vitest'
import type { ClienteEscritura } from '../cliente-db.ts'
import { opcionesAcristalamientoDeSerie } from './acristalamiento-serie.ts'
import { piezasAcristalamiento } from './junquillos.ts'

function clienteFalso(respuestas: unknown[][]) {
  let consultas = 0
  const cliente = { select: () => {
    const promesa = Promise.resolve(respuestas[consultas++] ?? [])
    const resultado = { then: promesa.then.bind(promesa), limit: () => promesa, orderBy: () => resultado }
    return { from: () => ({ where: () => resultado }) }
  } } as unknown as ClienteEscritura
  return { cliente, consultas: () => consultas }
}
describe('catálogo de acristalamiento 0021', () => {
  it('mantiene posiciones y nombres aunque haya huecos entre opciones', async () => {
    const { cliente } = clienteFalso([
      [{ opcion: 1, tablaHojas: 'A', tablaFijos: 'A' }, { opcion: 4, tablaHojas: 'D', tablaFijos: null }],
      [{ codigo: 'A', descripcion: 'Recto' }, { codigo: 'D', descripcion: 'Curvo' }],
    ])
    expect(await opcionesAcristalamientoDeSerie(cliente, 'S')).toEqual([
      { numero: 1, hojas: { codigo: 'A', descripcion: 'Recto' }, fijos: { codigo: 'A', descripcion: 'Recto' }, predeterminada: true },
      { numero: 4, hojas: { codigo: 'D', descripcion: 'Curvo' }, fijos: null, predeterminada: false },
    ])
  })
  it('mientras el catálogo nuevo está vacío conserva la opción original', async () => {
    const { cliente } = clienteFalso([[], [{ tablaHojas: 'A', tablaFijos: null }]])
    expect((await opcionesAcristalamientoDeSerie(cliente, 'S')).map(o => o.numero)).toEqual([1])
  })
})
describe('seguridad de valoración al cambiar de tabla de junquillos', () => {
  const entrada = { serieCodigo: 'S', tamJunquillo: 20, opcionAcristalamiento: 2,
    cristales: [{ slot: 1, contexto: 'HOJA' as const, largoMm: 900, anchoMm: 800, moduloLargoMm: 950, moduloAnchoMm: 850 }] }
  it('otra tabla no hereda un ajuste medido sólo para la tabla original', async () => {
    const { cliente, consultas } = clienteFalso([
      [{ tablaHojas: 'NUEVA', tablaFijos: 'NUEVA' }],
      [{ tablaHojas: 'ORIGINAL', tablaFijos: 'ORIGINAL' }],
      [{ junquillo: 'JUNQ-NUEVO', juntaExterior: 'JUNTA', juntaInterior: null }],
    ])
    const resultado = await piezasAcristalamiento(cliente, entrada)
    expect(resultado.avisos).toContain('ranura 1: sin ajuste medido de junquillo hoja')
    expect(resultado.piezas.map(p => p.funcion)).toEqual(['JEXT', 'JEXT'])
    expect(consultas()).toBe(3)
  })
  it('si ambas opciones usan exactamente la misma tabla conserva el ajuste probado', async () => {
    const { cliente } = clienteFalso([
      [{ tablaHojas: 'A', tablaFijos: 'A' }], [{ tablaHojas: 'A', tablaFijos: 'A' }],
      [{ junquillo: 'J', juntaExterior: null, juntaInterior: null }],
      [{ ajusteLargoMm: '10', ajusteAnchoMm: '20' }],
    ])
    const resultado = await piezasAcristalamiento(cliente, entrada)
    expect(resultado.avisos).toEqual([])
    expect(resultado.piezas.map(p => p.largoMm)).toEqual([910, 820])
  })
  it('la selección explícita 1 usa el catálogo nuevo y no una tabla antigua diferente', async () => {
    const { cliente } = clienteFalso([
      [{ tablaHojas: 'NUEVA', tablaFijos: null }], [{ tablaHojas: 'ANTIGUA', tablaFijos: null }],
      [{ junquillo: 'J', juntaExterior: null, juntaInterior: null }],
    ])
    const resultado = await piezasAcristalamiento(cliente, { ...entrada, opcionAcristalamiento: 1 })
    expect(resultado.avisos).toContain('ranura 1: sin ajuste medido de junquillo hoja')
    expect(resultado.piezas).toEqual([])
  })
  it('una opción inexistente no cae silenciosamente en la predeterminada', async () => {
    const { cliente } = clienteFalso([[], [{ tablaHojas: 'A', tablaFijos: 'A' }]])
    const resultado = await piezasAcristalamiento(cliente, entrada)
    expect(resultado.piezas).toEqual([])
    expect(resultado.avisos).toContain('ranura 1: sin tabla de acristalamiento aplicable')
  })
})
