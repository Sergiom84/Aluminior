import { describe, expect, it } from 'vitest'
import { geometriaCerramiento, proyectarCerramiento } from './geometria-cerramiento.ts'
import type { ConfiguracionCerramiento } from './cerramiento.ts'

const referencia: ConfiguracionCerramiento = {
  version: 1,
  modulos: ['2O', '2O', '2O', '0', '2O', '2O'].map((estructuraCodigo, indice) => ({
    id: `m${indice + 1}`, estructuraCodigo, anchoMm: indice === 3 ? 300 : 1200, altoMm: 1020,
  })),
  uniones: [100, 60, 60, 60, 60].map((grosorMm, indice) => ({
    id: `u${indice + 1}`, codigo: indice === 0 ? 'PSU001' : 'GMU038', grosorMm, longitudMm: 1020,
  })),
}

describe('geometría común del cerramiento', () => {
  it('conserva 6640×1020 y las razones físicas 1:4 y 5:3', () => {
    const geometria = geometriaCerramiento(referencia)
    expect(geometria.anchoMm).toBe(6640)
    expect(geometria.altoContractualMm).toBe(1020)
    expect(geometria.modulos[3].rect.ancho / geometria.modulos[0].rect.ancho).toBe(.25)
    expect(geometria.uniones[0].rect.ancho / geometria.uniones[1].rect.ancho).toBeCloseTo(5 / 3, 10)
    expect(geometria.modulos.map((modulo) => modulo.rect.x)).toEqual([0, 1300, 2560, 3820, 4180, 5440])
  })

  it('usa el mismo factor sin mínimos deformantes', () => {
    const geometria = geometriaCerramiento(referencia)
    const p = proyectarCerramiento(geometria, { ancho: 900, alto: 400, margenX: 20, margenY: 20 })
    expect(p.transformar(geometria.modulos[3].rect).ancho / p.transformar(geometria.modulos[0].rect).ancho).toBeCloseTo(.25, 10)
    expect(p.transformar(geometria.uniones[0].rect).ancho / p.transformar(geometria.uniones[1].rect).ancho).toBeCloseTo(5 / 3, 10)
  })

  it('incluye una unión más larga sin cambiar el alto contractual', () => {
    const configuracion = { ...referencia, uniones: referencia.uniones.map((u, i) => i === 0 ? { ...u, longitudMm: 1600 } : u) }
    const geometria = geometriaCerramiento(configuracion)
    expect(geometria.altoContractualMm).toBe(1020)
    expect(geometria.altoVisibleMm).toBe(1600)
  })

  it('preserva módulos muy estrechos', () => {
    const configuracion = { ...referencia, modulos: referencia.modulos.map((m, i) => i === 3 ? { ...m, anchoMm: 12 } : m) }
    const geometria = geometriaCerramiento(configuracion)
    const p = proyectarCerramiento(geometria, { ancho: 375, alto: 240, margenX: 12, margenY: 12 })
    expect(p.transformar(geometria.modulos[3].rect).ancho / p.transformar(geometria.modulos[0].rect).ancho).toBeCloseTo(.01, 10)
  })

  it('mantiene alturas distintas alineadas arriba', () => {
    const configuracion = { ...referencia, modulos: referencia.modulos.map((m, i) => i === 3 ? { ...m, altoMm: 510 } : m) }
    const geometria = geometriaCerramiento(configuracion)
    const p = proyectarCerramiento(geometria, { ancho: 900, alto: 400 })
    expect(geometria.modulos.every((modulo) => modulo.rect.y === 0)).toBe(true)
    expect(p.transformar(geometria.modulos[3].rect).alto / p.transformar(geometria.modulos[0].rect).alto).toBeCloseTo(.5, 10)
  })

  it('no modifica la geometría al cambiar el viewport', () => {
    const geometria = geometriaCerramiento(referencia)
    const serializada = JSON.stringify(geometria)
    for (const viewport of [{ ancho: 1440, alto: 900 }, { ancho: 1024, alto: 768 }, { ancho: 375, alto: 812 }]) {
      expect(proyectarCerramiento(geometria, viewport).escala).toBeGreaterThan(0)
      expect(JSON.stringify(geometria)).toBe(serializada)
    }
  })

  it('rechaza viewports no representables', () => {
    const geometria = geometriaCerramiento(referencia)
    expect(() => proyectarCerramiento(geometria, { ancho: 0, alto: 400 })).toThrow()
    expect(() => proyectarCerramiento(geometria, { ancho: 400, alto: 20, margenY: 10 })).toThrow()
  })
})
