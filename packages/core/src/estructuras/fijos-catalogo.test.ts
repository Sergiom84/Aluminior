import { describe, expect, it } from 'vitest'
import { crearConfiguracionCerramiento, esConfiguracionCerramiento } from './cerramiento.ts'
import { plantillaDiseno, PLANTILLAS_DISENO } from './diseno.ts'
import { geometriaCerramiento, proyectarCerramiento } from './geometria-cerramiento.ts'
import { itemsEscaparate } from './escaparate.ts'

describe('fijos equidistantes operativos', () => {
  it('conserva el modelo inicial y no habilita árboles pendientes', () => {
    expect(PLANTILLAS_DISENO[0].codigo).toBe('0')
    expect(plantillaDiseno('04F')).toBeNull()
    expect(plantillaDiseno('C3FT')).toBeNull()
  })

  it.each([
    ['03H', 'fijos', 3, 1, 2], ['03V', 'fijos', 1, 3, 2],
    ['06', 'fijos', 3, 2, 5], ['CF', 'fijos-corredera', 1, 1, 0],
    ['CFT', 'fijos-corredera', 1, 2, 1], ['FC', 'fijos-corredera', 1, 1, 0],
  ] as const)('%s conserva distribución, medidas y selección al reabrir', (codigo, categoria, filas, columnas, travesanos) => {
    const plantilla = plantillaDiseno(codigo)!
    expect(itemsEscaparate(categoria).map(p => p.codigo)).toContain(codigo)
    const base = crearConfiguracionCerramiento(plantilla)
    const original = JSON.stringify(base)
    for (const [anchoMm, altoMm] of [[1200, 900], [1630, 1510], [750, 500]]) {
      const configuracion = JSON.parse(original)
      Object.assign(configuracion.modulos[0], { anchoMm, altoMm })
      expect(esConfiguracionCerramiento(configuracion)).toBe(true)
      const geometria = geometriaCerramiento(configuracion)
      expect([geometria.anchoMm, geometria.altoContractualMm]).toEqual([anchoMm, altoMm])
      const piezas = geometria.modulos[0].elementos
      const vidrios = piezas.filter(e => e.tipo === 'hueco')
      expect(vidrios).toHaveLength(filas * columnas)
      expect(piezas.filter(e => e.tipo === 'separador')).toHaveLength(travesanos)
      expect(new Set(vidrios.map(e => e.id)).size).toBe(filas * columnas)
      expect(new Set(vidrios.map(e => e.y)).size).toBe(filas)
      expect(new Set(vidrios.map(e => e.x)).size).toBe(columnas)
      for (const vidrio of vidrios) {
        expect(vidrio.apertura).toBe('fijo')
        expect(vidrio.manilla).toBe(false)
        expect(vidrio.ancho).toBeCloseTo((anchoMm - 12 * (columnas - 1)) / columnas)
        expect(vidrio.alto).toBeCloseTo((altoMm - 12 * (filas - 1)) / filas)
      }
      const proyectar = proyectarCerramiento(geometria, { ancho: 180, alto: 120 }).transformar
      for (const pieza of piezas) {
        const p = proyectar(pieza)
        expect(p.x).toBeGreaterThanOrEqual(0)
        expect(p.y).toBeGreaterThanOrEqual(0)
        expect(p.x + p.ancho).toBeLessThanOrEqual(180.000001)
        expect(p.y + p.alto).toBeLessThanOrEqual(120.000001)
      }
    }
    expect(JSON.stringify(base)).toBe(original)
  })
})
