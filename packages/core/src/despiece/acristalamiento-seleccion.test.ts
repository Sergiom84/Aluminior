import { describe, expect, it } from 'vitest'
import { acristalarVidrio, type FilaTablaAcristalamiento, type VidrioParaAcristalar } from './acristalamiento-catalogo.ts'

const vidrio: VidrioParaAcristalar = {
  grosorMm: 16, referenciaLargoMm: 800, referenciaAnchoMm: 500,
  moduloLargoMm: 900, moduloAnchoMm: 600, tipoHoja: 'G',
  grupoIzquierdo: 'H', grupoDerecho: 'H', grupoSuperior: 'H', grupoInferior: 'H',
}
const descuentos = ['JH', 'JV'].map(grupo => ({ grupoPrincipal: 'H', grupo, tipoHoja: 'G', mm: 20 }))
const fila: FilaTablaAcristalamiento = {
  posicion: '*', grosor: 16, junquillo: 'J1', juntaExterior: 'GE', juntaInterior: 'GI',
}
const calcular = (tabla: FilaTablaAcristalamiento[], grosorMm = 16) =>
  acristalarVidrio({ ...vidrio, grosorMm }, tabla, descuentos, () => true)

describe('selección inequívoca de acristalamiento', () => {
  it.each(['junquillo', 'juntaExterior', 'juntaInterior'] as const)(
    'bloquea dos alternativas con igual grosor y distinto %s sin depender del orden', campo => {
      const otra = { ...fila, [campo]: 'OTRO' }
      for (const tabla of [[fila, otra], [otra, fila]]) {
        const r = calcular(tabla)
        expect(r.piezas).toEqual([])
        expect(r.incidencias).toEqual(['selección de acristalamiento ambigua para grosor 16 mm'])
      }
    },
  )

  it('acepta filas repetidas equivalentes y no duplica piezas', () => {
    const vacia = { ...fila, juntaExterior: null }
    expect(calcular([vacia, { ...vacia, juntaExterior: '0' }])).toEqual(calcular([vacia]))
    expect(calcular([fila, { ...fila }]).piezas).toHaveLength(6)
  })

  it('no bloquea por alternativas de un grosor que no se ha elegido', () => {
    const r = calcular([fila, { ...fila, grosor: 20 }, { ...fila, grosor: 20, junquillo: 'J2' }])
    expect(r.incidencias).toEqual([])
    expect(r.piezas).toHaveLength(6)
  })

  it.each([0, -1, NaN, Infinity])('rechaza grosor de vidrio no válido: %s', grosor => {
    const r = calcular([fila], grosor)
    expect(r.piezas).toEqual([])
    expect(r.incidencias).toHaveLength(1)
  })

  it.each([NaN, Infinity, -1])('rechaza grosor no válido de catálogo: %s', grosor => {
    const r = calcular([fila, { ...fila, grosor }])
    expect(r.piezas).toEqual([])
    expect(r.incidencias).toEqual(['tabla de acristalamiento con grosor no válido'])
  })
})
