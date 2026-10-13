import { describe, expect, it } from 'vitest'
import { crearResolvedorCotasInstancia, type FilaCotasCsv } from './cotas-instancia.ts'
import { calcularDespiece } from '../../packages/core/src/despiece/calcular.ts'

// Entradas sintéticas. Ningún valor ni identificador procede del taller.
const identidad = { tipoDoc: 'VFAC', documento: 'doc-demo', linea: 'lin-demo', estructura: 'DEMO' }
const medida = (cambios: FilaCotasCsv = {}): FilaCotasCsv => ({
  TipoDoc: identidad.tipoDoc, nDoc: identidad.documento, nLinEstr: identidad.linea,
  Estructura: identidad.estructura, nDA: '1', Medida: '417,25', ...cambios,
})
const definicion = (cambios: FilaCotasCsv = {}): FilaCotasCsv => ({
  Estructura: 'DEMO', nDA: '1', SimboloDA: 'FI', MedidaStd: '99', ...cambios,
})
const resolver = (medidas = [medida()], defs = [definicion()]) => crearResolvedorCotasInstancia(medidas, defs)

describe('entrada documental VMedidasDA → EstructurasDA', () => {
  it('conserva valor decimal y procedencia de ambas tablas sin usar el estándar', () => {
    const r = resolver()(identidad)
    expect(r).toEqual({ estado: 'valida', cotas: { FI: 417.25 }, incidencias: [], trazas: [{
      identidad, nDA: '1', simbolo: 'FI', medida: 417.25, medidaOriginal: '417,25',
      filaMedidas: 2, filasDefinicion: [2],
    }] })
  })
  it.each([
    { TipoDoc: 'VPRES' }, { TipoDoc: 'VALB' }, { nDoc: 'otro' }, { nLinEstr: 'otra' },
  ])('no mezcla cotas de otra identidad: %j', cambio => {
    const r = resolver([medida(cambio)])(identidad)
    expect(r).toEqual({ estado: 'sin-entrada', cotas: {}, incidencias: [], trazas: [] })
  })
  it('rechaza una estructura incompatible dentro de la misma línea', () => {
    expect(resolver([medida({ Estructura: 'OTRA' })])(identidad)).toMatchObject({ estado: 'invalida', cotas: {} })
  })
  it('no usa definiciones de otra estructura ni sustituye la ausencia con MedidaStd', () => {
    expect(resolver([], [definicion()])(identidad)).toMatchObject({ estado: 'sin-entrada', cotas: {} })
    expect(resolver([medida()], [definicion({ Estructura: 'OTRA' })])(identidad)).toMatchObject({ estado: 'invalida', cotas: {} })
  })
  it.each(['', ' ', 'NaN', 'Infinity', '-Infinity', '1e999', 'foo', '0xff', '1,2,3'])('no transforma %j en cero', Medida => {
    expect(resolver([medida({ Medida })])(identidad)).toMatchObject({ estado: 'invalida', cotas: {} })
  })
  it('conserva el cero explícito', () => {
    expect(resolver([medida({ Medida: '0' })])(identidad)).toMatchObject({ estado: 'valida', cotas: { FI: 0 } })
  })
  it.each(['A', 'l', ' rEf ', '', 'FI;L', '__proto__'])('rechaza el símbolo %j', SimboloDA => {
    expect(resolver([medida()], [definicion({ SimboloDA })])(identidad)).toMatchObject({ estado: 'invalida', cotas: {} })
  })
  it('rechaza definiciones incompatibles para un mismo nDA', () => {
    const r = resolver([medida()], [definicion(), definicion({ SimboloDA: 'TD' })])(identidad)
    expect(r).toMatchObject({ estado: 'invalida', cotas: {} })
  })
  it('acepta duplicados compatibles y conserva todas sus referencias', () => {
    const r = resolver([medida(), medida({ Medida: '417.25' })], [definicion(), definicion({ SimboloDA: ' fi ' })])(identidad)
    expect(r).toMatchObject({ estado: 'valida', cotas: { FI: 417.25 } })
    expect(r.trazas.map(t => [t.filaMedidas, t.filasDefinicion])).toEqual([[2, [2, 3]], [3, [2, 3]]])
  })
  it('rechaza valores incompatibles entre distintos nDA del mismo símbolo normalizado', () => {
    const r = resolver([medida(), medida({ nDA: '2', Medida: '400' })],
      [definicion(), definicion({ nDA: '2', SimboloDA: ' fi ' })])(identidad)
    expect(r).toMatchObject({ estado: 'invalida', cotas: {}, incidencias: ['cotas: valores incompatibles para FI'] })
  })
  it('descarta todo el conjunto si una de sus entradas es inválida', () => {
    const r = resolver([medida(), medida({ nDA: '2', Medida: '' })],
      [definicion(), definicion({ nDA: '2', SimboloDA: 'TD' })])(identidad)
    expect(r.estado).toBe('invalida')
    expect(r.cotas).toEqual({})
    expect(r.incidencias).toEqual(['cotas: medida no finita o inválida para TD'])
  })
  it.each(['tipoDoc', 'documento', 'linea', 'estructura'])('requiere %s en la identidad', campo => {
    expect(resolver()({ ...identidad, [campo]: '' })).toMatchObject({ estado: 'invalida', cotas: {} })
  })
  it('normaliza espacios de identidad y mayúsculas del tipo documental', () => {
    expect(resolver()({ ...identidad, tipoDoc: ' vfac ', documento: ' doc-demo ' })).toMatchObject({ estado: 'valida' })
  })
})

describe('cotas de entrada aplicadas a cortes calculados', () => {
  const piezas = ['L-FI', 'A-TD', 'F'].map((formulaLargo, i) => ({
    articuloCodigo: `SINTETICO-${i}`, cantidad: 1, formulaLargo,
    funcion: 'HH', tipoCorte: null, anguloIzquierdo: null, anguloDerecho: null,
  }))
  const defs = ['FI', 'TD', 'F'].map((SimboloDA, i) => definicion({ nDA: String(i + 1), SimboloDA }))
  const filas = ['417.25', '315', '275.5'].map((Medida, i) => medida({ nDA: String(i + 1), Medida }))
  const calcular = (filasEntrada: FilaCotasCsv[]) => calcularDespiece(piezas,
    { anchoMm: 1530, altoMm: 1780 }, resolver(filasEntrada, defs)(identidad).cotas)
  it('elimina el bloqueo FI/TD/F y calcula cada dimensión desde su entrada', () => {
    const r = calcular(filas)
    expect(r.incalculables).toBe(0)
    expect(r.piezas.map(p => p.largoMm)).toEqual([1362.75, 1215, 275.5])
  })
  it('cambiar FI altera solo el corte que depende de FI', () => {
    expect(calcular([medida({ Medida: '500' }), ...filas.slice(1)]).piezas.map(p => p.largoMm))
      .toEqual([1280, 1215, 275.5])
  })
  it('sin entrada conserva tres bloqueos, sin imputar cero o catálogo', () => {
    const r = calcular([])
    expect(r.incalculables).toBe(3)
    expect(r.variablesFaltantes).toEqual(['F', 'FI', 'TD'])
    expect(r.piezas.map(p => p.largoMm)).toEqual([null, null, null])
  })
})
