/**
 * Pruebas de la hoja de corte (G2).
 *
 * Lo que protegen: (1) que el resumen exponga %Opt por artículo-acabado y el
 * desglose el retal por barra; (2) que la posición del palo se refiera a la
 * `Referencia (Tipo)` y, si no la hay, al índice de la estructura; (3) que un
 * corte sin procedencia o un plan inconsistente se reporten en vez de
 * rellenarse; (4) que este documento no lleve nada de la hoja de producción.
 *
 * Datos SINTÉTICOS, verificables a mano. Los planes se generan con el
 * optimizador real para que el fixture no sea un plan imposible.
 */
import { describe, it, expect } from 'vitest'
import { optimizarCorte } from './optimizar.ts'
import { ensamblarHojaCorte, type ProcedenciaPalo } from './hojas-corte.ts'
import { PARAMETROS_CORTE_VIDEO, longitudAprovechableMm } from './hojas.ts'

const DOC = { numero: '000011', revision: 1, clienteNombre: 'CLIENTE SINTÉTICO', obra: 'OBRA' }
const P = PARAMETROS_CORTE_VIDEO

function procedencias(entradas: Record<string, ProcedenciaPalo>): ReadonlyMap<string, ProcedenciaPalo> {
  return new Map(Object.entries(entradas))
}

describe('ensamblarHojaCorte — resumen de barras', () => {
  it('una barra llena da 100% de optimización y retal cero', () => {
    const plan = optimizarCorte([{ longitud: 2000, cantidad: 3, ref: 'a' }], { longitudBarra: 6000 })
    const hoja = ensamblarHojaCorte({
      documento: DOC,
      parametros: P,
      grupos: [{
        articuloCodigo: 'EC3900',
        descripcion: 'CERCO VENTANA',
        acabadoDescripcion: 'MADERA',
        longitudBarraMm: 6000,
        plan,
        procedencias: procedencias({
          a: { estructuraIndice: 1, referencia: 'V1', posicion: 'inferior' },
        }),
      }],
    })

    expect(hoja.tipo).toBe('HOJA_DE_CORTE')
    expect(hoja.referencia).toBe('000011-1')
    expect(hoja.resumen).toHaveLength(1)
    const fila = hoja.resumen[0]
    expect(fila.etiqueta).toBe('EC3900 CERCO VENTANA - MADERA')
    expect(fila.nBarras).toBe(1)
    expect(fila.metros).toBe(6)
    expect(fila.porcentajeOptimizacion).toBe(100)
    expect(hoja.desglose[0].barras[0].retalMm).toBe(0)
    expect(hoja.incidencias).toEqual([])
  })

  it('%Opt se mide contra la barra COMPRADA, no contra la aprovechable', () => {
    // El plan se optimiza sobre 6000 − 30 − 30 = 5940 mm, pero se compran
    // barras de 6000: dos cortes de 2000 aprovechan 4000/6000 = 66,67%.
    const util = longitudAprovechableMm(6000, P)
    expect(util).toBe(5940)
    const plan = optimizarCorte([{ longitud: 2000, cantidad: 2, ref: 'a' }], { longitudBarra: util })

    const hoja = ensamblarHojaCorte({
      documento: DOC,
      parametros: P,
      grupos: [{ articuloCodigo: 'EC3910', longitudBarraMm: 6000, plan }],
    })
    expect(hoja.resumen[0].porcentajeOptimizacion).toBe(66.67)
    // El retal del plan es el de la longitud aprovechable; los saneamientos
    // viajan aparte, sin mezclarse con el sobrante.
    expect(hoja.desglose[0].barras[0].retalMm).toBe(1940)
    expect(hoja.parametros.saneamientoInicialMm).toBe(30)
  })

  it('un plan hecho sobre barras más largas que las compradas no inventa %Opt', () => {
    const plan = optimizarCorte([{ longitud: 6500, cantidad: 1, ref: 'a' }], { longitudBarra: 7000 })
    const hoja = ensamblarHojaCorte({
      documento: DOC,
      parametros: P,
      grupos: [{ articuloCodigo: 'EC2348', longitudBarraMm: 6000, plan }],
    })
    expect(hoja.resumen[0].porcentajeOptimizacion).toBeNull()
    expect(hoja.resumen[0].motivoSinOptimizacion).toMatch(/7000 mm/)
    expect(hoja.incidencias.join(' ')).toMatch(/mayores que la barra/)
  })

  it('un grupo sin cortes no rompe el porcentaje', () => {
    const plan = optimizarCorte([], { longitudBarra: 6000 })
    const hoja = ensamblarHojaCorte({
      documento: DOC,
      parametros: P,
      grupos: [{ articuloCodigo: 'EC0000', longitudBarraMm: 6000, plan }],
    })
    expect(hoja.resumen[0].nBarras).toBe(0)
    expect(hoja.resumen[0].metros).toBe(0)
    expect(hoja.resumen[0].porcentajeOptimizacion).toBeNull()
    expect(hoja.resumen[0].motivoSinOptimizacion).toMatch(/ninguna barra/)
  })

  it('exige una longitud de barra positiva', () => {
    const plan = optimizarCorte([{ longitud: 1000, cantidad: 1 }], { longitudBarra: 6000 })
    expect(() => ensamblarHojaCorte({
      documento: DOC,
      parametros: P,
      grupos: [{ articuloCodigo: 'X', longitudBarraMm: 0, plan }],
    })).toThrow(/longitudBarraMm/)
  })
})

describe('ensamblarHojaCorte — posición del palo', () => {
  it('nombra el palo por la Referencia (Tipo) de la línea', () => {
    const plan = optimizarCorte([{ longitud: 1200, cantidad: 1, ref: 'v1-inf' }], { longitudBarra: 6000 })
    const hoja = ensamblarHojaCorte({
      documento: DOC,
      parametros: P,
      grupos: [{
        articuloCodigo: 'EC3900',
        longitudBarraMm: 6000,
        plan,
        procedencias: procedencias({
          'v1-inf': { estructuraIndice: 1, referencia: 'V1', posicion: 'inferior' },
        }),
      }],
    })
    expect(hoja.desglose[0].barras[0].palos[0].etiqueta).toBe('palo inferior de la V1')
  })

  it('una estructura sin referencia se identifica por su índice, no se omite', () => {
    const plan = optimizarCorte([{ longitud: 1200, cantidad: 1, ref: 'x' }], { longitudBarra: 6000 })
    const hoja = ensamblarHojaCorte({
      documento: DOC,
      parametros: P,
      grupos: [{
        articuloCodigo: 'EC3900',
        longitudBarraMm: 6000,
        plan,
        procedencias: procedencias({
          x: { estructuraIndice: 4, referencia: null, posicion: 'superior' },
        }),
      }],
    })
    const palo = hoja.desglose[0].barras[0].palos[0]
    expect(palo.etiqueta).toBe('palo superior de la estructura 4')
    expect(palo.procedencia?.estructuraIndice).toBe(4)
  })

  it('un corte sin procedencia se reporta con su motivo, no se rellena', () => {
    const plan = optimizarCorte(
      [{ longitud: 1200, cantidad: 1, ref: 'huerfano' }, { longitud: 900, cantidad: 1 }],
      { longitudBarra: 6000 },
    )
    const hoja = ensamblarHojaCorte({
      documento: DOC,
      parametros: P,
      grupos: [{ articuloCodigo: 'EC3900', longitudBarraMm: 6000, plan }],
    })
    const palos = hoja.desglose[0].barras[0].palos
    expect(palos.every((p) => p.procedencia === null)).toBe(true)
    expect(palos.map((p) => p.etiqueta)).toEqual([
      'palo de procedencia desconocida',
      'palo de procedencia desconocida',
    ])
    expect(hoja.incidencias.join(' ')).toMatch(/"huerfano" no tiene procedencia/)
    expect(hoja.incidencias.join(' ')).toMatch(/sin referencia de origen/)
  })

  it('una procedencia sin posición avisa en vez de inventarla', () => {
    const plan = optimizarCorte([{ longitud: 1200, cantidad: 1, ref: 'x' }], { longitudBarra: 6000 })
    const hoja = ensamblarHojaCorte({
      documento: DOC,
      parametros: P,
      grupos: [{
        articuloCodigo: 'EC3900',
        longitudBarraMm: 6000,
        plan,
        procedencias: procedencias({ x: { estructuraIndice: 2, referencia: 'P1', posicion: null } }),
      }],
    })
    const palo = hoja.desglose[0].barras[0].palos[0]
    expect(palo.etiqueta).toBe('palo de la P1')
    expect(palo.incidencia).toMatch(/posición/)
  })

  it('propaga los cortes imposibles del plan con su motivo', () => {
    const plan = optimizarCorte([{ longitud: 9000, cantidad: 2 }], { longitudBarra: 6000 })
    const hoja = ensamblarHojaCorte({
      documento: DOC,
      parametros: P,
      grupos: [{ articuloCodigo: 'EC3366', longitudBarraMm: 6000, plan }],
    })
    expect(hoja.desglose[0].barras).toHaveLength(0)
    expect(hoja.desglose[0].incidencias.join(' ')).toMatch(/2 × 9000 mm sin cortar/)
  })
})

describe('ensamblarHojaCorte — es otro documento', () => {
  it('no lleva accesorios, superficies ni agrupación por estructura', () => {
    const plan = optimizarCorte([{ longitud: 1000, cantidad: 1, ref: 'a' }], { longitudBarra: 6000 })
    const hoja = ensamblarHojaCorte({
      documento: DOC,
      parametros: P,
      grupos: [{ articuloCodigo: 'EC3900', longitudBarraMm: 6000, plan }],
    })
    const claves = Object.keys(hoja)
    expect(claves).not.toContain('estructuras')
    expect(claves).not.toContain('accesorios')
    expect(claves).not.toContain('superficies')
    expect(claves).toContain('resumen')
  })
})
