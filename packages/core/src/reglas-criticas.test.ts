import { describe, expect, it } from 'vitest'
import { ErrorFormula, evaluar } from './despiece/formula.ts'
import { calcularDespiece, type PiezaCortada } from './despiece/calcular.ts'
import { valorarDespiece } from './precios/calcular.ts'
import { construirResoluciones, expandirCadena, resolverComponente } from './series/resolver.ts'

describe('reglas críticas de valoración', () => {
  it('evalúa la coma decimal y falla si falta una variable', () => {
    expect(evaluar('L+CAJ+2*30,00', { L: 1000, CAJ: 200 })).toBe(1260)
    expect(() => evaluar('L-FS', { L: 1600 })).toThrow(ErrorFormula)
  })

  it('conserva como incalculable una pieza sin una cota necesaria', () => {
    const resultado = calcularDespiece([{
      articuloCodigo: 'MARCO', cantidad: 2, formulaLargo: 'L-FS',
      tipoCorte: '!!', anguloIzquierdo: 90, anguloDerecho: 90, funcion: 'MV',
    }], { anchoMm: 1600, altoMm: 1200 })

    expect(resultado.incalculables).toBe(1)
    expect(resultado.variablesFaltantes).toEqual(['FS'])
    expect(resultado.piezas[0].largoMm).toBeNull()
  })

  it('prioriza la serie y nunca cambia a la variante de vidrio contraria', () => {
    const cadena = expandirCadena('SERIE', new Map([
      ['SERIE', ['DELEGADA']], ['DELEGADA', ['SERIE']],
    ]))
    const resoluciones = construirResoluciones(cadena, [
      { conjuntoCodigo: 'SERIE', componente: '25', articuloCodigo: 'PERFIL-PROPIO' },
      { conjuntoCodigo: 'DELEGADA', componente: '25', articuloCodigo: 'PERFIL-DELEGADO' },
      { conjuntoCodigo: 'DELEGADA', componente: '26.1', articuloCodigo: 'SENCILLO' },
    ])

    expect(resolverComponente('25', resoluciones, '2')).toMatchObject({ articuloCodigo: 'PERFIL-PROPIO', via: 'exacto' })
    expect(resolverComponente('26', resoluciones, '2')).toMatchObject({ articuloCodigo: null, via: null })
  })

  it('no considera completa una valoración a la que le falta una tarifa', () => {
    const piezas: PiezaCortada[] = [
      { articuloCodigo: 'PERFIL', cantidad: 2, largoMm: 1200, formula: 'L', tipoCorte: '!!', anguloIzquierdo: 90, anguloDerecho: 90, funcion: 'MV', incidencia: null },
      { articuloCodigo: 'HERRAJE', cantidad: 1, largoMm: null, formula: null, tipoCorte: null, anguloIzquierdo: null, anguloDerecho: null, funcion: 'ACC', incidencia: null },
    ]
    const resultado = valorarDespiece(piezas, new Map([
      ['PERFIL', { codigo: 'PERFIL', tipoMetraje: 'ML', precio: 10, metrajeMinimo: null, metrajeMultiploLargo: 0.5 }],
    ]))

    expect(resultado.importe).toBe(25)
    expect(resultado.completa).toBe(false)
    expect(resultado.sinPrecio).toEqual(['HERRAJE'])
  })
})
