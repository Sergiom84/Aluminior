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

type Pieza = { anchoMm: number; altoMm: number }
type Paso = Pieza & { de: number; lado: 'derecha' | 'abajo' }

/** Primer elemento y cada siguiente anclado a uno anterior (por índice); la unión i es la del paso i. */
function composicion(primero: Pieza, pasos: Paso[], uniones: [string, number][]): ConfiguracionCerramiento {
  let config = crearConfiguracionCerramiento(plantillaDiseno('2O')!)
  config = { ...config, modulos: [{ ...config.modulos[0], ...primero }] }
  for (const { de, lado, ...pieza } of pasos) {
    config = insertarModuloEnAnclaje(config, { estructuraCodigo: '0', ...pieza }, { moduloId: config.modulos[de].id, lado })
  }
  return { ...config, uniones: config.uniones.map((u, i) => uniones[i] ? { ...u, codigo: uniones[i][0], grosorMm: uniones[i][1] } : u) }
}

function fabricacion(config: ConfiguracionCerramiento) {
  const { modulos, uniones } = medidasFabricacionCerramiento(config)
  return {
    piezas: config.modulos.map(m => [modulos.get(m.id)!.anchoMm, modulos.get(m.id)!.altoMm]),
    uniones: config.uniones.map(u => uniones.get(u.id)!.longitudMm),
  }
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

describe('unión que recorre varias piezas (GR2, contraste 02/11/2026)', () => {
  it('la unión vertical recorre la columna: recorta las dos piezas y mide la junta entera', () => {
    // fijo 800 × 2000 · GMU038 · columna de 900 (500 + 1500) unida con U
    const config = composicion({ anchoMm: 800, altoMm: 2000 }, [
      { anchoMm: 900, altoMm: 500, de: 0, lado: 'derecha' },
      { anchoMm: 900, altoMm: 1500, de: 1, lado: 'abajo' },
    ], [['GMU038', 60], ['U', 1]])
    expect(fabricacion(config)).toEqual({
      piezas: [[770, 2000], [870, 499.5], [870, 1499.5]],
      // La U que cruza mide lo mismo que antes de GR2: su par, 900.
      uniones: [2000, 900],
    })
  })

  it('hipótesis: en horizontal la unión recorre la fila de debajo por simetría', () => {
    // pieza 1800 × 500 · U debajo · dos piezas de 900 × 1500 unidas con GMU038
    const config = composicion({ anchoMm: 1800, altoMm: 500 }, [
      { anchoMm: 900, altoMm: 1500, de: 0, lado: 'abajo' },
      { anchoMm: 900, altoMm: 1500, de: 1, lado: 'derecha' },
    ], [['U', 1], ['GMU038', 60]])
    expect(fabricacion(config)).toEqual({
      piezas: [[1800, 499.5], [870, 1499.5], [870, 1499.5]],
      uniones: [1800, 1500],
    })
  })

  it('hipótesis: dos uniones colineales se reparten la junta sin restar dos veces ni medir de más', () => {
    // A 1000 × 600 sobre B 1000 × 1400 con U; C a la derecha de A y D a la derecha de B, con GMU038
    const config = composicion({ anchoMm: 1000, altoMm: 600 }, [
      { anchoMm: 1000, altoMm: 1400, de: 0, lado: 'abajo' },
      { anchoMm: 900, altoMm: 600, de: 0, lado: 'derecha' },
      { anchoMm: 900, altoMm: 1400, de: 1, lado: 'derecha' },
    ], [['U', 1], ['GMU038', 60], ['GMU038', 60]])
    const { piezas, uniones } = fabricacion(config)
    // Cada pieza pierde una sola mitad (30) en ancho.
    expect(piezas.map(p => p[0])).toEqual([970, 970, 870, 870])
    // Las dos GMU038 suman la junta de 2000, cada una su tramo.
    expect([uniones[1], uniones[2]]).toEqual([600, 1400])
    // La U recorre también la junta entre C y D (no tienen unión propia).
    expect(uniones[0]).toBe(1900)
    expect(piezas.map(p => p[1])).toEqual([599.5, 1399.5, 599.5, 1399.5])
  })

  it('una unión sin configurar separa y corta el recorrido', () => {
    const config = composicion({ anchoMm: 1000, altoMm: 600 }, [
      { anchoMm: 1000, altoMm: 1400, de: 0, lado: 'abajo' },
      { anchoMm: 900, altoMm: 600, de: 0, lado: 'derecha' },
      { anchoMm: 900, altoMm: 1400, de: 1, lado: 'derecha' },
    ], [['U', 1], ['GMU038', 60]])
    expect(fabricacion(config)).toEqual({
      piezas: [[970, 599.5], [1000, 1399.5], [870, 600], [900, 1400]],
      uniones: [1000, 600, 1400],
    })
  })
  it('hipótesis: el tramo libre entre dos uniones colineales es de una sola', () => {
    // Izquierda A, B, E apiladas con U; derecha C (GMU038 con A), D bajo C con U, F (GMU038 con E)
    const config = composicion({ anchoMm: 1000, altoMm: 500 }, [
      { anchoMm: 1000, altoMm: 500, de: 0, lado: 'abajo' },
      { anchoMm: 1000, altoMm: 1000, de: 1, lado: 'abajo' },
      { anchoMm: 900, altoMm: 500, de: 0, lado: 'derecha' },
      { anchoMm: 900, altoMm: 500, de: 3, lado: 'abajo' },
      { anchoMm: 900, altoMm: 1000, de: 2, lado: 'derecha' },
    ], [['U', 1], ['U', 1], ['GMU038', 60], ['U', 1], ['GMU038', 60]])
    const { piezas, uniones } = fabricacion(config)
    expect(piezas.map(p => p[0])).toEqual([970, 970, 970, 870, 870, 870])
    // Junta de 2000: la primera GMU038 se lleva el tramo libre de B|D; la suma no pasa de 2000.
    expect([uniones[2], uniones[4]]).toEqual([1000, 1000])
  })
})
