import { describe, expect, it } from 'vitest'
import { seleccionarRegistroTarifaDinamica } from './seleccionar.ts'
import type { EntradaSeleccionRegistroTarifaDinamica, RegistroTarifaDinamica } from './tipos.ts'

const registro = (cambios: Partial<RegistroTarifaDinamica> = {}): RegistroTarifaDinamica => ({
  id: 'R1', clienteCodigo: 'C1', grupoAcabadoCodigo: 'G1', tipoArticuloCodigo: 'T1',
  tamanoCodigo: 'S1', metrajeDesde: '1', metrajeHasta: '3', ...cambios,
})
const entrada = (
  registros: readonly RegistroTarifaDinamica[], cambios: Partial<EntradaSeleccionRegistroTarifaDinamica> = {},
): EntradaSeleccionRegistroTarifaDinamica => ({
  clienteCodigo: 'C1', grupoAcabadoCodigo: 'G1', tipoArticuloCodigo: 'T1', tamanoCodigo: 'S1',
  metraje: '2', registros, ...cambios,
})
const seleccionar = (registros: readonly RegistroTarifaDinamica[], cambios: Partial<EntradaSeleccionRegistroTarifaDinamica> = {}) =>
  seleccionarRegistroTarifaDinamica(entrada(registros, cambios))
const cuatro = () => [
  registro({ id: 'EI' }), registro({ id: 'EG', metrajeDesde: '0', metrajeHasta: '0' }),
  registro({ id: 'CI', tamanoCodigo: '*' }),
  registro({ id: 'CG', tamanoCodigo: '*', metrajeDesde: '0', metrajeHasta: '0' }),
]

describe('selección de registro de tarifa dinámica, sin valoración comercial', () => {
  it.each([
    [0, 'EI', 'TAMANO_EXACTO_INTERVALO'], [1, 'EG', 'TAMANO_EXACTO_GENERAL'],
    [2, 'CI', 'TAMANO_COMODIN_INTERVALO'], [3, 'CG', 'TAMANO_COMODIN_GENERAL'],
  ] as const)('resuelve la precedencia %s, aunque el catálogo llegue al revés', (inicio, id, etapa) => {
    const registros = cuatro().slice(inicio).reverse()
    expect(seleccionar(registros)).toEqual({
      fuente: 'TARIFA_DINAMICA_REGISTRO', estado: 'RESUELTO', etapa,
      registro: registros.find(fila => fila.id === id), registrosAmbiguos: [], incidencias: [],
    })
  })

  it.each(['1', '3', '1.00000000000000000001', '2.99999999999999999999'])('incluye extremo o interior exacto %s', metraje => {
    expect(seleccionar([registro()], { metraje })).toMatchObject({
      estado: 'RESUELTO', etapa: 'TAMANO_EXACTO_INTERVALO', registro: { id: 'R1' },
    })
  })

  it.each(['0.99999999999999999999', '3.00000000000000000001'])('distingue exterior decimal %s sin redondear', metraje => {
    expect(seleccionar([registro()], { metraje })).toEqual({
      fuente: 'TARIFA_DINAMICA_REGISTRO', estado: 'SIN_COINCIDENCIA', etapa: null,
      registro: null, registrosAmbiguos: [], incidencias: [],
    })
  })

  it('el intervalo exacto general gana al intervalo comodín', () => {
    expect(seleccionar(cuatro().slice(1))).toMatchObject({ estado: 'RESUELTO', registro: { id: 'EG' } })
  })
  it('0/0 incluye metraje cero en la primera búsqueda exacta', () => {
    expect(seleccionar([registro({ metrajeDesde: '-0.00', metrajeHasta: '+0.000' })], { metraje: '0' }))
      .toMatchObject({ estado: 'RESUELTO', etapa: 'TAMANO_EXACTO_INTERVALO' })
  })
  it('0/0 incluye metraje cero en la búsqueda de intervalo comodín', () => {
    expect(seleccionar([registro({ tamanoCodigo: '*', metrajeDesde: '0', metrajeHasta: '0' })], { metraje: '0.000' }))
      .toMatchObject({ estado: 'RESUELTO', etapa: 'TAMANO_COMODIN_INTERVALO' })
  })
  it('no inventa una restricción de signo sobre las comparaciones decimales', () => {
    expect(seleccionar([registro({ metrajeDesde: '-3', metrajeHasta: '-1' })], { metraje: '-2' }))
      .toMatchObject({ estado: 'RESUELTO', etapa: 'TAMANO_EXACTO_INTERVALO' })
  })
  it.each(['clienteCodigo', 'grupoAcabadoCodigo', 'tipoArticuloCodigo', 'tamanoCodigo'] as const)
    ('ignora una clave ajena en %s', campo => {
      expect(seleccionar([registro({ [campo]: 'OTRO' })]).estado).toBe('SIN_COINCIDENCIA')
    })
  it.each(['clienteCodigo', 'grupoAcabadoCodigo', 'tipoArticuloCodigo', 'tamanoCodigo'] as const)
    ('no recorta ni normaliza la clave %s', campo => {
      const valor = registro()[campo]
      expect(seleccionar([registro({ [campo]: ` ${valor} ` })]).estado).toBe('SIN_COINCIDENCIA')
      expect(seleccionar([registro({ [campo]: valor.toLowerCase() })]).estado).toBe('SIN_COINCIDENCIA')
    })
  it('un catálogo vacío acredita ausencia de coincidencia', () => {
    expect(seleccionar([])).toMatchObject({ estado: 'SIN_COINCIDENCIA', registro: null, incidencias: [] })
  })
  it('ignora criterios inválidos de otras claves o tamaños', () => {
    expect(seleccionar([registro({ id: '', clienteCodigo: 'OTRO', metrajeHasta: 'inválido' }),
      registro({ id: '', tamanoCodigo: 'OTRO', metrajeHasta: 'inválido' }), registro()]))
      .toMatchObject({ estado: 'RESUELTO', registro: { id: 'R1' } })
  })

  it.each(['clienteCodigo', 'grupoAcabadoCodigo', 'tipoArticuloCodigo', 'tamanoCodigo'] as const)
    ('bloquea contexto ausente en %s', campo => {
      for (const valor of [null, '', ' ']) expect(seleccionar([registro()], { [campo]: valor }))
        .toMatchObject({ estado: 'BLOQUEADO', registro: null, incidencias: ['claves de selección ausentes o inválidas'] })
    })
  it.each([null, '', 'NaN', 'Infinity', '1e3', '1,2', 'texto'])('bloquea metraje inválido %s', metraje => {
    expect(seleccionar([registro()], { metraje })).toMatchObject({
      estado: 'BLOQUEADO', registro: null, incidencias: ['metraje ausente o inválido'],
    })
  })
  it.each(['metrajeDesde', 'metrajeHasta'] as const)('bloquea límite inválido %s', campo => {
    for (const valor of ['', 'NaN', '1e3', '1,2']) expect(seleccionar([registro({ [campo]: valor })]))
      .toMatchObject({ estado: 'BLOQUEADO', registro: null, incidencias: ['límites de metraje inválidos'] })
  })
  it('bloquea intervalos invertidos aunque otra fila pudiera resolver', () => {
    expect(seleccionar([registro({ id: 'INV', metrajeDesde: '4', metrajeHasta: '1' }), registro()]))
      .toMatchObject({ estado: 'BLOQUEADO', registro: null, incidencias: ['intervalo de metraje invertido'] })
  })
  it.each(['', ' '])('bloquea identidad de registro vacía %s', id => {
    expect(seleccionar([registro({ id })])).toMatchObject({
      estado: 'BLOQUEADO', registro: null, incidencias: ['identidad de registro ausente o duplicada'],
    })
  })
  it('bloquea identidad duplicada incluso entre etapas distintas', () => {
    expect(seleccionar([registro(), registro({ tamanoCodigo: '*', metrajeDesde: '0', metrajeHasta: '0' })]))
      .toMatchObject({ estado: 'BLOQUEADO', registro: null, incidencias: ['identidad de registro ausente o duplicada'] })
  })
  it('bloquea solapamiento de la etapa ganadora sin usar filas inferiores', () => {
    const registros = [registro({ id: 'B', metrajeDesde: '2', metrajeHasta: '4' }),
      registro({ id: 'A' }), ...cuatro().slice(1)]
    const esperado = { fuente: 'TARIFA_DINAMICA_REGISTRO', estado: 'AMBIGUO',
      etapa: 'TAMANO_EXACTO_INTERVALO', registro: null, registrosAmbiguos: ['A', 'B'], incidencias: [] }
    expect(seleccionar(registros)).toEqual(esperado)
    expect(seleccionar([...registros].reverse())).toEqual(esperado)
  })
  it.each([
    ['TAMANO_EXACTO_GENERAL', { metrajeDesde: '0', metrajeHasta: '0' }],
    ['TAMANO_COMODIN_INTERVALO', { tamanoCodigo: '*' }],
    ['TAMANO_COMODIN_GENERAL', { tamanoCodigo: '*', metrajeDesde: '0', metrajeHasta: '0' }],
  ] as const)('detecta empate en %s', (etapa, criterios) => {
    expect(seleccionar([registro({ id: 'A', ...criterios }), registro({ id: 'B', ...criterios })]))
      .toMatchObject({ estado: 'AMBIGUO', etapa, registro: null, registrosAmbiguos: ['A', 'B'] })
  })
  it('la ambigüedad en etapa inferior no invalida una fila ganadora única', () => {
    expect(seleccionar([registro(), registro({ id: 'A', tamanoCodigo: '*' }), registro({ id: 'B', tamanoCodigo: '*' })]))
      .toMatchObject({ estado: 'RESUELTO', registro: { id: 'R1' } })
  })
  it('no muta, ordena, comparte ni evalúa datos económicos ajenos a los criterios', () => {
    const fila = Object.freeze({ ...registro({ metrajeDesde: '1.00' }), precio: '123.456', formula: 'sin evaluar' })
    const registros = Object.freeze([fila])
    const datos = Object.freeze(entrada(registros))
    const antes = JSON.stringify(datos)
    const resultado = seleccionarRegistroTarifaDinamica(datos)
    expect(seleccionarRegistroTarifaDinamica(datos)).toEqual(resultado)
    expect(JSON.stringify(datos)).toBe(antes)
    expect(resultado.registro).not.toBe(fila)
    expect(resultado.registro).toEqual(registro({ metrajeDesde: '1.00' }))
    expect(resultado).not.toHaveProperty('precio')
    expect(resultado.registro).not.toHaveProperty('precio')
    expect(resultado.registro).not.toHaveProperty('formula')
  })
})
