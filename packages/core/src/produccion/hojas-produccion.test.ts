/**
 * Pruebas de la hoja de producción (G2).
 *
 * Lo que protegen: (1) que agrupe por estructura con `1 / 5` y que una
 * estructura sin referencia se identifique por índice en vez de desaparecer;
 * (2) que la orientación del palo salga como DATO y nunca como color;
 * (3) que el tipo de corte por extremo use los parámetros recibidos;
 * (4) que lleve accesorios y superficies —lo que la hoja de corte no lleva— y
 * que lo que falta se reporte con su motivo.
 *
 * Datos SINTÉTICOS.
 */
import { describe, it, expect } from 'vitest'
import { ensamblarHojaProduccion, type EstructuraEntrada } from './hojas-produccion.ts'
import { PARAMETROS_CORTE_VIDEO } from './hojas.ts'

const DOC = { numero: '000011', revision: 1 }
const P = PARAMETROS_CORTE_VIDEO

const V1: EstructuraEntrada = {
  referencia: 'V-1',
  articuloCodigo: 'GRUPO',
  descripcion: 'VENTANA 2 HOJAS CORREDERA',
  cantidad: 2,
  colorCodigo: 'K',
  colorDescripcion: 'MADERA',
  medidasMarco: { anchoMm: 1057, altoMm: 1342 },
  medidasHueco: { anchoMm: 1200, altoMm: 1500 },
  palos: [
    { articuloCodigo: 'EC3900', descripcion: 'CERCO VENTANA', cantidad: 2, largoMm: 1057, funcion: 'MH', tipoCorte: '/\\' },
    { articuloCodigo: 'EC3900', descripcion: 'CERCO VENTANA', cantidad: 2, largoMm: 1342, funcion: 'MV', tipoCorte: '/\\' },
    { articuloCodigo: 'EC3910', descripcion: 'HOJA VENTANA', cantidad: 2, largoMm: 520, funcion: 'HH', tipoCorte: '!!' },
  ],
  accesorios: [{ articuloCodigo: 'H1000', descripcion: 'CIERRE', cantidad: 2 }],
  superficies: [
    { clase: 'VIDRIO', articuloCodigo: '4164', cantidad: 2, anchoMm: 480, altoMm: 1200 },
  ],
}

describe('ensamblarHojaProduccion — agrupación por estructura', () => {
  it('numera cada estructura como i / total', () => {
    const hoja = ensamblarHojaProduccion({
      documento: DOC,
      parametros: P,
      estructuras: [V1, { ...V1, referencia: 'V-2' }, { ...V1, referencia: 'P-1' }],
    })
    expect(hoja.tipo).toBe('HOJA_DE_PRODUCCION')
    expect(hoja.referencia).toBe('000011-1')
    expect(hoja.estructuras.map((e) => `${e.indice} / ${e.total}`))
      .toEqual(['1 / 3', '2 / 3', '3 / 3'])
    expect(hoja.estructuras[0].identificacion).toBe('V-1')
  })

  it('una estructura sin Referencia (Tipo) se identifica por índice y lo avisa', () => {
    const hoja = ensamblarHojaProduccion({
      documento: DOC,
      parametros: P,
      estructuras: [{ ...V1, referencia: 'V-1' }, { ...V1, referencia: null }],
    })
    expect(hoja.estructuras).toHaveLength(2)
    expect(hoja.estructuras[1].identificacion).toBe('estructura 2')
    expect(hoja.estructuras[1].referencia).toBeNull()
    expect(hoja.estructuras[1].incidencias.join(' ')).toMatch(/no tiene Referencia \(Tipo\)/)
  })

  it('conserva color y las dos medidas, marco y hueco', () => {
    const hoja = ensamblarHojaProduccion({ documento: DOC, parametros: P, estructuras: [V1] })
    const e = hoja.estructuras[0]
    expect(e.colorCodigo).toBe('K')
    expect(e.colorDescripcion).toBe('MADERA')
    expect(e.medidasMarco).toEqual({ anchoMm: 1057, altoMm: 1342 })
    expect(e.medidasHueco).toEqual({ anchoMm: 1200, altoMm: 1500 })
    expect(e.cantidad).toBe(2)
  })

  it('reporta las medidas ausentes en vez de dar cero', () => {
    const hoja = ensamblarHojaProduccion({
      documento: DOC,
      parametros: P,
      estructuras: [{ ...V1, medidasMarco: null, medidasHueco: null }],
    })
    expect(hoja.estructuras[0].medidasMarco).toBeNull()
    expect(hoja.estructuras[0].incidencias.join(' ')).toMatch(/sin medidas de marco/)
    expect(hoja.estructuras[0].incidencias.join(' ')).toMatch(/sin medidas de hueco/)
  })
})

describe('ensamblarHojaProduccion — orientación como dato', () => {
  it('distingue palos horizontales y verticales sin hablar de color', () => {
    const hoja = ensamblarHojaProduccion({ documento: DOC, parametros: P, estructuras: [V1] })
    const palos = hoja.estructuras[0].palos
    expect(palos.map((p) => p.orientacion)).toEqual(['horizontal', 'vertical', 'horizontal'])
    expect(JSON.stringify(hoja)).not.toMatch(/granate|color(?!Codigo|Descripcion)/i)
  })

  it('una función que no determina la orientación no se adivina', () => {
    const hoja = ensamblarHojaProduccion({
      documento: DOC,
      parametros: P,
      estructuras: [{
        ...V1,
        palos: [{ articuloCodigo: 'EC3366', cantidad: 1, largoMm: 800, funcion: 'TM', tipoCorte: '!!' }],
      }],
    })
    const palo = hoja.estructuras[0].palos[0]
    expect(palo.orientacion).toBe('desconocida')
    expect(palo.motivoOrientacion).toMatch(/TM/)
    expect(hoja.incidencias.join(' ')).toMatch(/orientación desconocida/)
  })

  it('acepta la orientación que aporte el origen cuando la conoce', () => {
    const hoja = ensamblarHojaProduccion({
      documento: DOC,
      parametros: P,
      estructuras: [{
        ...V1,
        palos: [{ articuloCodigo: 'EC3366', cantidad: 1, largoMm: 800, funcion: 'TM', orientacion: 'horizontal', tipoCorte: '!!' }],
      }],
    })
    expect(hoja.estructuras[0].palos[0].orientacion).toBe('horizontal')
    expect(hoja.incidencias).toEqual([])
  })
})

describe('ensamblarHojaProduccion — columna I - D', () => {
  it('da el tipo y el grosor de disco de cada extremo con los parámetros recibidos', () => {
    const hoja = ensamblarHojaProduccion({ documento: DOC, parametros: P, estructuras: [V1] })
    const [horizontal, , hoja1] = hoja.estructuras[0].palos
    expect(horizontal.extremos.izquierdo.tipo).toBe('inglete')
    expect(horizontal.extremos.izquierdo.grosorDiscoMm).toBe(7)
    expect(`${horizontal.extremos.izquierdo.simbolo} - ${horizontal.extremos.derecho.simbolo}`)
      .toBe('/ - \\')
    expect(hoja1.extremos.derecho.tipo).toBe('recto')
    expect(hoja1.extremos.derecho.grosorDiscoMm).toBe(5)
  })

  it('un corte sin tipo ni ángulo se declara desconocido y se reporta', () => {
    const hoja = ensamblarHojaProduccion({
      documento: DOC,
      parametros: P,
      estructuras: [{
        ...V1,
        palos: [{ articuloCodigo: 'EC9999', cantidad: 1, largoMm: 500, funcion: 'MH' }],
      }],
    })
    const palo = hoja.estructuras[0].palos[0]
    expect(palo.extremos.izquierdo.tipo).toBe('desconocido')
    expect(palo.extremos.izquierdo.grosorDiscoMm).toBeNull()
    expect(hoja.incidencias.join(' ')).toMatch(/tipo de corte desconocido/)
  })

  it('rechaza parámetros de corte inválidos', () => {
    expect(() => ensamblarHojaProduccion({
      documento: DOC,
      parametros: { ...P, discoIngleteMm: -7 },
      estructuras: [V1],
    })).toThrow(/discoIngleteMm/)
  })
})

describe('ensamblarHojaProduccion — es otro documento', () => {
  it('lleva accesorios y superficies, y ningún resumen de barras', () => {
    const hoja = ensamblarHojaProduccion({ documento: DOC, parametros: P, estructuras: [V1] })
    const e = hoja.estructuras[0]
    expect(e.accesorios).toEqual([{ articuloCodigo: 'H1000', descripcion: 'CIERRE', cantidad: 2 }])
    expect(e.superficies[0]).toMatchObject({ clase: 'VIDRIO', anchoMm: 480, altoMm: 1200 })
    const claves = Object.keys(hoja)
    expect(claves).not.toContain('resumen')
    expect(claves).not.toContain('desglose')
    expect(JSON.stringify(hoja)).not.toMatch(/porcentajeOptimizacion|retalMm/)
  })

  it('una superficie sin medidas se reporta, no se completa', () => {
    const hoja = ensamblarHojaProduccion({
      documento: DOC,
      parametros: P,
      estructuras: [{
        ...V1,
        superficies: [{ clase: 'PERSIANA', articuloCodigo: 'PER1', cantidad: 1, anchoMm: null, altoMm: null, incidencia: 'sin cajón definido' }],
      }],
    })
    expect(hoja.estructuras[0].superficies[0].anchoMm).toBeNull()
    expect(hoja.incidencias.join(' ')).toMatch(/persiana sin medidas — sin cajón definido/)
  })

  it('un palo sin medida de corte propaga el motivo del despiece', () => {
    const hoja = ensamblarHojaProduccion({
      documento: DOC,
      parametros: P,
      estructuras: [{
        ...V1,
        palos: [{
          articuloCodigo: 'EC3910', cantidad: 1, largoMm: null, funcion: 'HV', tipoCorte: '/\\',
          incidencia: 'sin regla de rebaje de hoja para (perfil, eje, fórmula, serie)',
        }],
      }],
    })
    const palo = hoja.estructuras[0].palos[0]
    expect(palo.largoMm).toBeNull()
    expect(palo.incidencia).toMatch(/rebaje/)
    expect(hoja.incidencias.join(' ')).toMatch(/sin medida de corte — sin regla de rebaje/)
  })
})
