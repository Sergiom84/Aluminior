/**
 * Pruebas de CARACTERIZACIÓN de junquillos y juntas, sin base de datos.
 *
 * No describen lo que el acristalamiento debería hacer: describen lo que hacía
 * dentro de `acciones.ts` antes de extraerlo (T.69.5), incluidas las omisiones
 * silenciosas que nadie eligió a propósito. Su trabajo es que la extracción no
 * mueva ningún corte sin que se note.
 *
 * Lo que aquí NO se puede probar —qué tabla se elige para cada alojamiento y
 * qué fila gana para el grosor del vidrio— vive en SQL y lo cubre
 * `junquillos.integracion.test.ts` contra PostgreSQL de verdad.
 */
import { describe, expect, it } from 'vitest'
import {
  piezasDeRanura, type AjusteJunquillo, type CristalAcris, type FilaAcristalamiento,
} from './junquillos.ts'

const cristal = (extra: Partial<CristalAcris> = {}): CristalAcris => ({
  slot: 1,
  contexto: 'HOJA',
  largoMm: 1000,
  anchoMm: 500,
  moduloLargoMm: 1100,
  moduloAnchoMm: 600,
  ...extra,
})

const fila = (extra: Partial<FilaAcristalamiento> = {}): FilaAcristalamiento => ({
  junquillo: 'JUNQ01',
  juntaExterior: 'JEXT01',
  juntaInterior: 'JINT01',
  ...extra,
})

const ajuste = (largo: string, ancho: string): AjusteJunquillo =>
  ({ ajusteLargoMm: largo, ajusteAnchoMm: ancho })

/** Vista compacta de una pieza, que es lo que estas pruebas comparan. */
const resumen = (piezas: { articuloCodigo: string; funcion: string | null; largoMm: number | null; cantidad: number }[]) =>
  piezas.map((p) => [p.funcion, p.articuloCodigo, p.largoMm, p.cantidad])

describe('medidas de cada función', () => {
  // Las juntas rodean el MÓDULO; el junquillo se corta a la medida del VIDRIO
  // más el ajuste medido. Cambiar cuál usa cuál cambia todos los cortes.
  it('las juntas usan el módulo y el junquillo el vidrio más su ajuste', () => {
    const { piezas, avisos } = piezasDeRanura(cristal(), fila(), ajuste('-28', '16'))
    expect(resumen(piezas)).toEqual([
      ['JEXT', 'JEXT01', 1100, 2],
      ['JEXT', 'JEXT01', 600, 2],
      ['JINT', 'JINT01', 1100, 2],
      ['JINT', 'JINT01', 600, 2],
      ['JUNQ', 'JUNQ01', 972, 2],
      ['JUNQ', 'JUNQ01', 516, 2],
    ])
    expect(avisos).toEqual([])
  })

  // Dos cortes por dimensión: los cuatro lados del cristal. No se agrupa aunque
  // el artículo se repita, y el orden es juntas antes que junquillos.
  it('emite cantidad 2 por dimensión, sin agrupar, en orden', () => {
    const { piezas } = piezasDeRanura(cristal(), fila(), ajuste('0', '0'))
    expect(piezas).toHaveLength(6)
    expect(piezas.every((p) => p.cantidad === 2)).toBe(true)
    expect(piezas.map((p) => p.funcion)).toEqual([
      'JEXT', 'JEXT', 'JINT', 'JINT', 'JUNQ', 'JUNQ',
    ])
  })

  it('redondea las longitudes a dos decimales', () => {
    const { piezas } = piezasDeRanura(
      cristal({ largoMm: 1000.456, anchoMm: 500.454, moduloLargoMm: 1100.005, moduloAnchoMm: 600.994 }),
      fila({ juntaInterior: null }),
      ajuste('0.1', '0.2'),
    )
    expect(piezas.map((p) => p.largoMm)).toEqual([1100.01, 600.99, 1000.56, 500.65])
  })

  it('el resto de la pieza es el del despiece, con los nulos que le tocan', () => {
    const { piezas } = piezasDeRanura(
      cristal(), fila({ juntaExterior: null, juntaInterior: null }), ajuste('0', '0'),
    )
    expect(piezas[0]).toEqual({
      articuloCodigo: 'JUNQ01', cantidad: 2, largoMm: 1000, funcion: 'JUNQ',
      formula: null, tipoCorte: null, anguloIzquierdo: null, anguloDerecho: null,
      incidencia: null,
    })
  })
})

describe('omisiones silenciosas, conservadas', () => {
  // El marcador "sin junquillos" (V1000) y los huecos del catálogo llegan como
  // artículo nulo: no generan corte y tampoco aviso.
  it('un artículo nulo no genera pieza ni aviso', () => {
    const { piezas, avisos } = piezasDeRanura(
      cristal(), fila({ juntaExterior: null, juntaInterior: null, junquillo: null }), null,
    )
    expect(piezas).toEqual([])
    expect(avisos).toEqual([])
  })

  // Protege de un ajuste que se come la medida, pero lo hace sin decirlo: la
  // pieza desaparece del despiece y nada lo señala.
  it('una longitud no positiva se omite, en silencio', () => {
    const { piezas, avisos } = piezasDeRanura(
      cristal({ largoMm: 28, anchoMm: 20, moduloLargoMm: 0, moduloAnchoMm: -5 }),
      fila(),
      ajuste('-28', '-40'),
    )
    // Módulo 0 y −5 fuera; junquillo largo 28−28=0 fuera; ancho 20−40=−20 fuera.
    expect(piezas).toEqual([])
    expect(avisos).toEqual([])
  })

  it('el cero exacto no genera pieza', () => {
    const { piezas } = piezasDeRanura(
      cristal({ moduloLargoMm: 0, moduloAnchoMm: 600 }),
      fila({ juntaInterior: null, junquillo: null }),
      null,
    )
    expect(resumen(piezas)).toEqual([['JEXT', 'JEXT01', 600, 2]])
  })
})

describe('avisos', () => {
  it('sin fila aplicable no hay piezas y la ranura avisa con su número', () => {
    const { piezas, avisos } = piezasDeRanura(cristal({ slot: 3 }), null, ajuste('0', '0'))
    expect(piezas).toEqual([])
    expect(avisos).toEqual(['ranura 3: sin tabla de acristalamiento aplicable'])
  })

  // El junquillo se pierde, pero las juntas NO: son independientes del ajuste.
  it('con junquillo y sin ajuste se conservan las juntas y avisa', () => {
    const { piezas, avisos } = piezasDeRanura(cristal({ slot: 2 }), fila(), null)
    expect(resumen(piezas)).toEqual([
      ['JEXT', 'JEXT01', 1100, 2],
      ['JEXT', 'JEXT01', 600, 2],
      ['JINT', 'JINT01', 1100, 2],
      ['JINT', 'JINT01', 600, 2],
    ])
    expect(avisos).toEqual(['ranura 2: sin ajuste medido de junquillo hoja'])
  })

  it('el aviso nombra el alojamiento en minúsculas', () => {
    const { avisos } = piezasDeRanura(cristal({ slot: 5, contexto: 'FIJO' }), fila(), null)
    expect(avisos).toEqual(['ranura 5: sin ajuste medido de junquillo fijo'])
  })

  // No falta nada que medir: sin junquillo, el ajuste ausente no es un problema.
  it('un junquillo nulo sin ajuste no produce aviso', () => {
    const { piezas, avisos } = piezasDeRanura(cristal(), fila({ junquillo: null }), null)
    expect(piezas).toHaveLength(4)
    expect(avisos).toEqual([])
  })
})
