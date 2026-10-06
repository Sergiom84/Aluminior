import { describe, expect, it } from 'vitest'
import { derivarTarifaGuardada, type ArticuloCompuesto } from './derivar.ts'
import { construirPropuesta, medirFactores, resumirPropuesta, type ArticuloConPvp } from './propuesta.ts'

const art = (codigo: string, exterior: string, camaraMm: number, argon: boolean, interior: string,
  coste: string | null, pvp: Record<string, string> = {}): ArticuloConPvp =>
  ({ codigo, composicion: { exterior, camaraMm, argon, interior }, coste, pvp })

// Catálogo sintético con la misma estructura que el guardado: base 20, cámara 20 +2, argón +5, vidrios.
const catalogo: ArticuloConPvp[] = [
  art('A', '4', 16, false, '4', '20.00', { '1': '40.00', '3': '30.00' }),
  art('B', '4', 20, false, '4', '22.00', { '1': '44.00', '3': '33.00' }),
  art('C', '4', 20, true, '4', '27.00', { '1': '54.00', '3': '40.50' }),
  art('D', '4', 16, false, 'X', '30.00', { '1': '60.00', '3': '45.00' }),
  art('E', '4', 16, false, 'Y', '25.50', { '1': '51.00', '3': '38.25' }),
  art('F', 'X', 20, true, 'Y', '42.50', { '1': '85.00', '3': '63.75' }),
]

describe('tarifa implícita en el coste guardado', () => {
  it('reproduce todos los costes cuando la estructura es aditiva', () => {
    const r = derivarTarifaGuardada(catalogo)
    expect(r.reproducidos).toBe(6)
    expect(r.discrepancias).toEqual([])
    expect(r.tarifa.vidrios).toEqual({ '4': '0.00', X: '10.00', Y: '5.50' })
  })

  it('señala los costes que la estructura no explica', () => {
    const r = derivarTarifaGuardada([...catalogo, art('G', 'X', 16, false, 'X', '41.00')])
    expect(r.discrepancias).toEqual([{ codigo: 'G', guardado: '41.00', derivado: '40.00' }])
  })

  it('exige la composición base para derivar', () => {
    const sinBase: ArticuloCompuesto[] = catalogo.slice(1)
    expect(() => derivarTarifaGuardada(sinBase)).toThrow()
  })
})

describe('propuesta con tarifa nueva', () => {
  it('mide el factor PVP/coste por tarifa y cuántos PVP reproduce', () => {
    expect(medirFactores(catalogo)).toEqual([
      { tarifa: '1', factor: '2', reproducidos: 6, total: 6 },
      { tarifa: '3', factor: '1.5', reproducidos: 6, total: 6 },
    ])
  })

  it('calcula coste y PVP nuevos y deja sin precio lo que la tarifa remite a consultar', () => {
    const nueva = { base: '25.00', argonM2: '4.00', camaras: { 16: { sinGas: '0' }, 20: { sinGas: '1.00' } },
      vidrios: { '4': '0', X: '12.00', Y: null } }
    const filas = construirPropuesta(catalogo, nueva, medirFactores(catalogo))
    expect(filas.find(f => f.codigo === 'C')).toMatchObject({ costeNuevo: '30.00', pvpNuevo: { '1': '60.00', '3': '45.00' } })
    expect(filas.find(f => f.codigo === 'F')).toMatchObject({ costeNuevo: null, motivo: 'VIDRIO_A_CONSULTAR',
      pvpNuevo: { '1': null, '3': null }, pvpActual: { '1': '85.00' } })
    const resumen = resumirPropuesta(filas)
    expect(resumen).toMatchObject({ articulos: 6, conCosteNuevo: 4, sinCoste: { VIDRIO_A_CONSULTAR: 2 },
      vidriosSinPrecio: { Y: 2 }, suben: 4, bajan: 0 })
  })
})
