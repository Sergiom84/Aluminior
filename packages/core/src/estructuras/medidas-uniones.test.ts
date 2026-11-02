import { describe, expect, it } from 'vitest'
import { plantillaDiseno } from './diseno.ts'
import { crearConfiguracionCerramiento, medidasCerramiento, type ConfiguracionCerramiento } from './cerramiento.ts'
import { insertarModuloEnAnclaje, posicionesCerramiento } from './composicion-cerramiento.ts'
import { medidasFabricacionCerramiento } from './medidas-uniones.ts'

function conUniones(config: ConfiguracionCerramiento, codigo: string, grosorMm: number): ConfiguracionCerramiento {
  return { ...config, uniones: config.uniones.map(u => ({ ...u, codigo, grosorMm })) }
}

function fila(anchos: number[], altos: number[]): ConfiguracionCerramiento {
  let config = crearConfiguracionCerramiento(plantillaDiseno('2O')!)
  config = { ...config, modulos: [{ ...config.modulos[0], anchoMm: anchos[0], altoMm: altos[0] }] }
  for (let i = 1; i < anchos.length; i++) {
    config = insertarModuloEnAnclaje(config, { estructuraCodigo: '0', anchoMm: anchos[i], altoMm: altos[i] },
      { moduloId: config.modulos[i - 1].id, lado: 'derecha' })
  }
  return config
}

describe('reparto del grosor de uniones configuradas (Productor)', () => {
  it('GMU038 entre 960 y 850: total 1810 y piezas de 930 y 820', () => {
    const config = conUniones(fila([960, 850], [960, 960]), 'GMU038', 60)
    expect(medidasCerramiento(config)).toEqual({ anchoMm: 1810, altoMm: 960 })
    const { modulos, uniones } = medidasFabricacionCerramiento(config)
    expect([...modulos.values()].map(m => m.anchoMm)).toEqual([930, 820])
    expect([...uniones.values()]).toEqual([{ longitudMm: 960 }])
  })

  it('fijo entre dos uniones pierde el grosor de ambas (700 → 640)', () => {
    const config = conUniones(fila([1000, 700, 1000], [2440, 2440, 2440]), 'GMU038', 60)
    expect(medidasCerramiento(config).anchoMm).toBe(2700)
    expect(medidasFabricacionCerramiento(config).modulos.get('modulo-2')).toEqual({ anchoMm: 640, altoMm: 2440 })
  })

  it('la unión mide el lado común: 2O + fijo 400 + 2O = 2800 con tubos de 400', () => {
    const config = conUniones(fila([1200, 400, 1200], [1200, 400, 1200]), 'GMU038', 60)
    expect(medidasCerramiento(config)).toEqual({ anchoMm: 2800, altoMm: 1200 })
    const { uniones } = medidasFabricacionCerramiento(config)
    expect([...uniones.values()]).toEqual([{ longitudMm: 400 }, { longitudMm: 400 }])
    expect(posicionesCerramiento(config).uniones.get('union-1')).toEqual({ x: 1170, y: 0, ancho: 60, alto: 400 })
  })

  it('U resta 0,5 a cada lado y el 2 × 2 de 1200 mide 2400', () => {
    let config = fila([1200, 1200], [1200, 1200])
    config = insertarModuloEnAnclaje(config, { estructuraCodigo: '0', anchoMm: 1200, altoMm: 1200 },
      { moduloId: 'modulo-1', lado: 'abajo' })
    config = conUniones(config, 'U', 1)
    expect(medidasCerramiento(config)).toEqual({ anchoMm: 2400, altoMm: 2400 })
    expect(medidasFabricacionCerramiento(config).modulos.get('modulo-1')).toEqual({ anchoMm: 1199.5, altoMm: 1199.5 })
  })

  it('un snapshot anterior sin repartoUniones conserva su geometría', () => {
    const { repartoUniones: _, ...antiguo } = conUniones(fila([960, 850], [960, 960]), 'GMU038', 60)
    expect(medidasCerramiento(antiguo).anchoMm).toBe(1870)
    expect([...medidasFabricacionCerramiento(antiguo).modulos.values()].map(m => m.anchoMm)).toEqual([960, 850])
  })

  it('sin configurar conserva la separación de 20 mm y las medidas nominales', () => {
    const config = fila([1200, 1200], [1200, 1200])
    expect(medidasCerramiento(config).anchoMm).toBe(2420)
    expect([...medidasFabricacionCerramiento(config).modulos.values()].map(m => m.anchoMm)).toEqual([1200, 1200])
  })
})
