/**
 * Caracterización del emparejamiento del vidrio (T.70.2).
 *
 * Fijan lo que hacía `acciones.ts` antes de la extracción, incluidas las tres
 * asimetrías declaradas en la cabecera del módulo: el filtro por perfil sólo en
 * la rama de hoja, el recuento de cristales exigido sólo ahí, y las hojas
 * deducidas dividiendo entre dos.
 */

import { describe, expect, it } from 'vitest'
import type { PiezaCortada } from '@aluminior/core/despiece'
import { emparejarVidrio } from './emparejamiento-vidrio.ts'

const AVISO =
  'vidrio sin calcular: emparejamiento ambiguo para esta estructura (¿mezcla hojas y fijos?)'

/** Pieza mínima: sólo importan función, artículo, largo y cantidad. */
function pieza(
  funcion: string,
  articuloCodigo: string,
  largoMm: number | null,
  cantidad = 1,
): PiezaCortada {
  return {
    articuloCodigo, cantidad, largoMm, formula: null, tipoCorte: null,
    anguloIzquierdo: null, anguloDerecho: null, funcion, incidencia: null,
  } as PiezaCortada
}

describe('estructura con hojas', () => {
  // Una hoja: dos HV y dos HH del mismo perfil. Un cristal.
  const UNA_HOJA = [
    pieza('HV', 'P100', 1200, 2),
    pieza('HH', 'P100', 600, 2),
  ]

  it('toma el corte de la hoja y marca contexto HOJA', () => {
    expect(emparejarVidrio(UNA_HOJA, 1)).toEqual({
      ok: true,
      contexto: 'HOJA',
      perfilCodigo: 'P100',
      corteVerticalMm: 1200,
      corteHorizontalMm: 600,
    })
  })

  it('dos hojas iguales y dos cristales cuadran', () => {
    const dos = [pieza('HV', 'P100', 1200, 4), pieza('HH', 'P100', 600, 4)]
    const r = emparejarVidrio(dos, 2)
    expect(r.ok).toBe(true)
  })

  it('el recuento que NO cuadra deja el vidrio sin calcular', () => {
    // Dos hojas (4 HV / 2) pero tres ranuras de cristal: mezcla hojas y fijos.
    const dos = [pieza('HV', 'P100', 1200, 4), pieza('HH', 'P100', 600, 4)]
    expect(emparejarVidrio(dos, 3)).toEqual({ ok: false, aviso: AVISO })
  })

  it('dos perfiles verticales distintos son ambiguos', () => {
    const mezcla = [
      pieza('HV', 'P100', 1200), pieza('HV', 'P200', 1200),
      pieza('HH', 'P100', 600, 2),
    ]
    expect(emparejarVidrio(mezcla, 1)).toEqual({ ok: false, aviso: AVISO })
  })

  it('dos cortes verticales distintos son ambiguos', () => {
    const mezcla = [
      pieza('HV', 'P100', 1200), pieza('HV', 'P100', 900),
      pieza('HH', 'P100', 600, 2),
    ]
    expect(emparejarVidrio(mezcla, 1)).toEqual({ ok: false, aviso: AVISO })
  })

  it('conserva el filtro por perfil en el corte horizontal', () => {
    // El HH de otro perfil NO cuenta: si contara, habría dos cortes y sería
    // ambiguo. Es la asimetría (1) del módulo.
    const conIntruso = [
      pieza('HV', 'P100', 1200, 2),
      pieza('HH', 'P100', 600, 2),
      pieza('HH', 'P999', 555, 2),
    ]
    const r = emparejarVidrio(conIntruso, 1)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.corteHorizontalMm).toBe(600)
  })

  it('ignora las piezas sin medida de corte', () => {
    const conNulo = [
      pieza('HV', 'P100', 1200, 2), pieza('HV', 'P100', null),
      pieza('HH', 'P100', 600, 2),
    ]
    const r = emparejarVidrio(conNulo, 1)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.corteVerticalMm).toBe(1200)
  })
})

describe('estructura sin hojas', () => {
  const CERCO = [
    pieza('MV', 'C100', 1500, 2),
    pieza('MH', 'C100', 800, 2),
  ]

  it('toma el corte del cerco y marca contexto FIJO', () => {
    expect(emparejarVidrio(CERCO, 1)).toEqual({
      ok: true,
      contexto: 'FIJO',
      perfilCodigo: 'C100',
      corteVerticalMm: 1500,
      corteHorizontalMm: 800,
    })
  })

  it('NO exige que el recuento de cristales cuadre', () => {
    // Asimetría (2): en el cerco fijo no hay comprobación de recuento, así que
    // tres ranuras con un solo cerco siguen valiendo.
    const r = emparejarVidrio(CERCO, 3)
    expect(r.ok).toBe(true)
  })

  it('NO filtra el corte horizontal por perfil', () => {
    // Asimetría (1) por el otro lado: un MH de otro perfil SÍ cuenta, y al
    // haber dos cortes distintos el emparejamiento pasa a ser ambiguo.
    const conIntruso = [...CERCO, pieza('MH', 'C999', 555, 2)]
    expect(emparejarVidrio(conIntruso, 1)).toEqual({ ok: false, aviso: AVISO })
  })
})

describe('casos que no dependen de la rama', () => {
  it('sin ranuras de cristal no hay emparejamiento', () => {
    const conHoja = [pieza('HV', 'P100', 1200, 2), pieza('HH', 'P100', 600, 2)]
    expect(emparejarVidrio(conHoja, 0)).toEqual({ ok: false, aviso: AVISO })
  })

  it('un despiece vacío es ambiguo, no un fallo', () => {
    expect(emparejarVidrio([], 1)).toEqual({ ok: false, aviso: AVISO })
  })
})
