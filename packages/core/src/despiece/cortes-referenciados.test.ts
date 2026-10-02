import { describe, expect, it } from 'vitest'
import { resolverCortesReferenciados, type DescuentoCorte, type NodoCorteReferenciado } from './cortes-referenciados.ts'
import { calcularDespiece, type ComponentePlantilla } from './calcular.ts'

// Catálogo sintético. Valores deliberadamente distintos a los del taller.
const nodo = (cambios: Partial<NodoCorteReferenciado> = {}): NodoCorteReferenciado => ({
  id: 1, referencia: null, formula: 'A', formulaReferencia: null, grupo: 'M',
  grupoInicio: 'E', grupoFin: 'E', tipoHoja: 'G', perfilAdicional: -1, ...cambios,
})
const hija = nodo({ id: 2, referencia: 1, formula: 'A/2', formulaReferencia: 'REF/2',
  grupo: 'H', grupoInicio: 'M', grupoFin: 'M', tipoHoja: 'DOS' })
const descuentos: DescuentoCorte[] = [
  { grupoPrincipal: 'E', grupo: 'M', tipoHoja: 'G', mm: 30 },
  { grupoPrincipal: 'M', grupo: 'H', tipoHoja: 'DOS', mm: -2 },
]
const pieza: ComponentePlantilla = { articuloCodigo: 'SINTETICO', cantidad: 2,
  formulaLargo: 'A/2', funcion: 'HH', tipoCorte: null, anguloIzquierdo: null, anguloDerecho: null }

describe('corte independiente por referencias y descuentos de catálogo', () => {
  it('evalúa el antecedente antes de dividir, sin depender del orden', () => {
    const r = resolverCortesReferenciados([hija, nodo()], descuentos, { A: 1000 })
    expect(r.get(1)?.largoMm).toBe(940)
    expect(r.get(2)?.largoMm).toBe(474)
  })
  it('propaga cambios de dimensión y descuenta después de la división', () => {
    const r = resolverCortesReferenciados([nodo(), hija], descuentos, { A: 1400 })
    expect(r.get(2)?.largoMm).toBe(674)
  })
  it('prefiere tipo específico y usa G solo si no existe', () => {
    const general = { grupoPrincipal: 'M', grupo: 'H', tipoHoja: 'G', mm: 10 }
    expect(resolverCortesReferenciados([nodo(), hija], [...descuentos, general], { A: 1000 }).get(2)?.largoMm).toBe(474)
    expect(resolverCortesReferenciados([nodo(), hija], [descuentos[0]!, general], { A: 1000 }).get(2)?.largoMm).toBe(450)
  })
  it.each([
    ['referencia ausente', [hija]],
    ['identificador duplicado', [nodo(), nodo(), hija]],
    ['ciclo', [nodo({ referencia: 2, formulaReferencia: 'REF' }), hija]],
    ['perfil alternativo', [nodo({ perfilAdicional: 63 }), hija]],
    ['fórmula REF ausente', [nodo(), { ...hija, formulaReferencia: null }]],
    ['id REF ausente', [nodo(), { ...hija, referencia: null }]],
  ])('bloquea %s y no usa la fórmula plana de respaldo', (_, nodos) => {
    expect(resolverCortesReferenciados(nodos as NodoCorteReferenciado[], descuentos, { A: 1000 }).get(2)?.largoMm).toBeNull()
  })
  it('no convierte descuento ausente, ambiguo o no finito en cero', () => {
    for (const filas of [[], [...descuentos, descuentos[0]!], [{ ...descuentos[0]!, mm: NaN }]]) {
      expect(resolverCortesReferenciados([nodo(), hija], filas, { A: 1000 }).get(2)?.largoMm).toBeNull()
    }
    expect(resolverCortesReferenciados([nodo()], [{ ...descuentos[0]!, mm: 0 }], { A: 1000 }).get(1)?.largoMm).toBe(1000)
  })
  it('rechaza una dimensión no positiva y variables ausentes', () => {
    expect(resolverCortesReferenciados([nodo()], descuentos, { A: 10 }).get(1)?.largoMm).toBeNull()
    expect(resolverCortesReferenciados([nodo()], descuentos, {}).get(1)?.largoMm).toBeNull()
  })
  it('integra catálogo sin restar por segunda vez el rebaje histórico', () => {
    const r = calcularDespiece([pieza], { anchoMm: 1000, altoMm: 900 }, {}, {
      corteDeCatalogo: () => ({ largoMm: 474, incidencia: null }),
      rebajeDeHoja: () => { throw new Error('No debe consultar el rebaje histórico') },
    })
    expect(r.piezas[0]?.largoMm).toBe(474)
    expect(r.consumoPorArticulo.get('SINTETICO')?.metrosLineales).toBeCloseTo(0.948)
  })
  it('un fallo de catálogo impide usar un rebaje histórico disponible', () => {
    const r = calcularDespiece([pieza], { anchoMm: 1000, altoMm: 900 }, {}, {
      corteDeCatalogo: () => ({ largoMm: null, incidencia: 'antecedente ausente' }),
      rebajeDeHoja: () => ({ mm: 20, muestras: 10, totalMuestras: 10 }),
    })
    expect(r.piezas[0]).toMatchObject({ largoMm: null, incidencia: 'antecedente ausente' })
    expect(r.incalculables).toBe(1)
  })
})

describe('división del hueco por grupos adicionales', () => {
  const marco = nodo({ id: 3, formula: 'A', grupo: 'MH', grupoInicio: 'E', grupoFin: 'E' })
  const hojaHorizontal = (gruposAdicionales: (string | null)[], cambios: Partial<NodoCorteReferenciado> = {}) => nodo({
    id: 9, referencia: 3, formula: '(A)/2', formulaReferencia: '(REF)/2', grupo: 'HP',
    grupoInicio: 'MV', grupoFin: 'MV', tipoHoja: '2HA1O', gruposAdicionales, ...cambios,
  })
  const tabla: DescuentoCorte[] = [
    { grupoPrincipal: 'E', grupo: 'MH', tipoHoja: 'G', mm: 0 },
    { grupoPrincipal: 'MV', grupo: 'HP', tipoHoja: 'G', mm: 30 },
    { grupoPrincipal: 'B', grupo: 'HP', tipoHoja: 'G', mm: 6 },
    { grupoPrincipal: 'HVL', grupo: 'HP', tipoHoja: 'G', mm: -10 },
    { grupoPrincipal: 'HVC', grupo: 'HP', tipoHoja: 'G', mm: -12 },
  ]
  it('reparte el batiente central entre las dos hojas', () => {
    expect(resolverCortesReferenciados([marco, hojaHorizontal(['B', null])], tabla, { A: 1500 }).get(9)?.largoMm).toBe(717)
  })
  it('resta completos los descuentos de las verticales de corredera', () => {
    expect(resolverCortesReferenciados([marco, hojaHorizontal(['HVL', 'HVC'])], tabla, { A: 1500 }).get(9)?.largoMm).toBe(712)
  })
  it.each([
    ['otros grupos', hojaHorizontal(['B', 'B3'])],
    ['batiente con extremos distintos', hojaHorizontal(['B'], { grupoFin: 'TMG' })],
    ['descuento adicional ausente', hojaHorizontal(['HVL'], { tipoHoja: 'X' }), [tabla[0]!, tabla[1]!]],
  ])('bloquea %s', (_, hoja, filas = tabla) => {
    const r = resolverCortesReferenciados([marco, hoja as NodoCorteReferenciado], filas as DescuentoCorte[], { A: 1500 }).get(9)
    expect(r?.largoMm).toBeNull()
  })
})
