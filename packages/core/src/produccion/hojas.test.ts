/**
 * Pruebas del vocabulario común de los dos documentos de producción (G2).
 *
 * Lo que protegen: (1) que los parámetros de corte sean entrada explícita y los
 * del vídeo sean exactamente los observados; (2) que el tipo de corte por
 * extremo se resuelva o se declare desconocido, nunca se suponga; (3) que la
 * orientación salga como dato y no se adivine de funciones que no la
 * determinan; (4) que una estructura sin referencia se identifique por índice.
 *
 * Datos SINTÉTICOS: no hay presupuestos reales cargados.
 */
import { describe, it, expect } from 'vitest'
import {
  PARAMETROS_CORTE_VIDEO,
  etiquetaDocumento,
  extremosDeCorte,
  identificarEstructura,
  longitudAprovechableMm,
  orientacionDePalo,
  validarParametrosCorte,
} from './hojas.ts'

const P = PARAMETROS_CORTE_VIDEO

describe('parámetros de corte', () => {
  it('los valores por defecto son los observados en el vídeo (24:50)', () => {
    expect(P).toEqual({
      saneamientoInicialMm: 30,
      saneamientoFinalMm: 30,
      discoIngleteMm: 7,
      discoRectoMm: 5,
    })
  })

  it('rechaza un parámetro negativo en vez de tratarlo como cero', () => {
    expect(() => validarParametrosCorte({ ...P, discoRectoMm: -1 }))
      .toThrow(/discoRectoMm/)
    expect(() => validarParametrosCorte({ ...P, saneamientoInicialMm: Number.NaN }))
      .toThrow(/saneamientoInicialMm/)
  })

  it('la longitud aprovechable descuenta las dos puntas', () => {
    expect(longitudAprovechableMm(6300, P)).toBe(6240)
    // Con otros parámetros da otro resultado: no hay constantes enterradas.
    expect(longitudAprovechableMm(6300, { ...P, saneamientoInicialMm: 0, saneamientoFinalMm: 0 }))
      .toBe(6300)
  })

  it('exige una barra positiva', () => {
    expect(() => longitudAprovechableMm(0, P)).toThrow(/longitudBarraMm/)
  })
})

describe('extremos de corte', () => {
  it('recto-recto lleva el disco de corte recto y el símbolo | - |', () => {
    const e = extremosDeCorte({ tipoCorte: '!!' }, P)
    expect(e.izquierdo.tipo).toBe('recto')
    expect(e.derecho.tipo).toBe('recto')
    expect(e.izquierdo.grosorDiscoMm).toBe(5)
    expect(`${e.izquierdo.simbolo} - ${e.derecho.simbolo}`).toBe('| - |')
  })

  it('inglete-inglete lleva el disco de inglete y el símbolo / - \\', () => {
    const e = extremosDeCorte({ tipoCorte: '/\\' }, P)
    expect(e.izquierdo.grosorDiscoMm).toBe(7)
    expect(e.derecho.grosorDiscoMm).toBe(7)
    expect(`${e.izquierdo.simbolo} - ${e.derecho.simbolo}`).toBe('/ - \\')
  })

  it('el corte mixto da un extremo de cada tipo, con su disco', () => {
    const e = extremosDeCorte({ tipoCorte: '!\\' }, P)
    expect([e.izquierdo.tipo, e.derecho.tipo]).toEqual(['recto', 'inglete'])
    expect([e.izquierdo.grosorDiscoMm, e.derecho.grosorDiscoMm]).toEqual([5, 7])

    const inverso = extremosDeCorte({ tipoCorte: '\\!' }, P)
    expect([inverso.izquierdo.tipo, inverso.derecho.tipo]).toEqual(['inglete', 'recto'])
  })

  it('sin tipo de corte cae a los ángulos, que sí correlacionan', () => {
    const e = extremosDeCorte({ tipoCorte: null, anguloIzquierdo: 90, anguloDerecho: 45 }, P)
    expect([e.izquierdo.tipo, e.derecho.tipo]).toEqual(['recto', 'inglete'])
    expect(e.izquierdo.motivo).toMatch(/90°/)
  })

  it('un ángulo que no es 90 ni 45 se declara desconocido, no se aproxima', () => {
    const e = extremosDeCorte({ anguloIzquierdo: 30, anguloDerecho: null }, P)
    expect(e.izquierdo.tipo).toBe('desconocido')
    expect(e.izquierdo.grosorDiscoMm).toBeNull()
    expect(e.izquierdo.motivo).toMatch(/30°/)
    expect(e.derecho.tipo).toBe('desconocido')
    expect(e.derecho.motivo).toMatch(/sin ángulo/)
  })

  it('un tipo de corte no reconocido no se interpreta a la ligera', () => {
    const e = extremosDeCorte({ tipoCorte: 'XX' }, P)
    expect(e.izquierdo.tipo).toBe('desconocido')
    expect(e.izquierdo.motivo).toMatch(/no reconocido/)
  })

  it('el grosor de disco sale de los parámetros, no de una constante', () => {
    const otros = { ...P, discoRectoMm: 3.2, discoIngleteMm: 9 }
    const e = extremosDeCorte({ tipoCorte: '!\\' }, otros)
    expect([e.izquierdo.grosorDiscoMm, e.derecho.grosorDiscoMm]).toEqual([3.2, 9])
  })
})

describe('orientación del palo', () => {
  it('marco y hoja horizontales y verticales salen del vocabulario medido', () => {
    expect(orientacionDePalo({ funcion: 'MH' }).orientacion).toBe('horizontal')
    expect(orientacionDePalo({ funcion: 'HH' }).orientacion).toBe('horizontal')
    expect(orientacionDePalo({ funcion: 'MV' }).orientacion).toBe('vertical')
    expect(orientacionDePalo({ funcion: 'HV' }).orientacion).toBe('vertical')
  })

  it('un travesaño no determina orientación: desconocida con motivo', () => {
    const r = orientacionDePalo({ funcion: 'TM' })
    expect(r.orientacion).toBe('desconocida')
    expect(r.motivo).toMatch(/TM/)
  })

  it('no deduce de la última letra: infHAesc no es horizontal', () => {
    expect(orientacionDePalo({ funcion: 'infHH' }).orientacion).toBe('desconocida')
  })

  it('la orientación aportada por el origen manda sobre la función', () => {
    const r = orientacionDePalo({ funcion: 'MV', orientacion: 'horizontal' })
    expect(r.orientacion).toBe('horizontal')
    expect(r.motivo).toMatch(/origen/)
  })
})

describe('identificación de documento y estructura', () => {
  it('el documento se cita como número-revisión', () => {
    expect(etiquetaDocumento({ numero: '000011', revision: 1 })).toBe('000011-1')
  })

  it('una estructura sin referencia se identifica por su índice', () => {
    expect(identificarEstructura('V-1', 3)).toBe('V-1')
    expect(identificarEstructura(null, 3)).toBe('estructura 3')
    expect(identificarEstructura('   ', 3)).toBe('estructura 3')
  })
})
