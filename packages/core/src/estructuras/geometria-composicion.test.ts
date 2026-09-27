import { describe, expect, it } from 'vitest'
import { distribuirComposicion, PLANTILLAS_DISENO, type DivisionVisual,
  type EjeDivision, type NodoVisual } from './diseno.ts'
import { distribuirComposicionAcotada, resolverGeometriaComposicion } from './geometria-composicion.ts'

const hueco = (id: string): NodoVisual => ({ tipo: 'hueco', id, apertura: 'fijo' })
const division = (eje: EjeDivision, desde: 'inicio' | 'fin', mm = 240): DivisionVisual => ({
  tipo: 'division', id: 'opaca', eje, separador: 'travesano', cotaFija: { desde, mm },
  hijos: [{ proporcion: 1, nodo: hueco('a') }, { proporcion: 1, nodo: hueco('b') }],
})
const dimensiones = { anchoMm: 1800, altoMm: 2000 }

describe('cotas físicas de una composición', () => {
  it.each([
    ['vertical', 'inicio', 240], ['vertical', 'fin', 1560],
    ['horizontal', 'inicio', 240], ['horizontal', 'fin', 1760],
  ] as const)('resuelve %s desde %s sin depender de proporciones de catálogo', (eje, desde, esperado) => {
    const resultado = resolverGeometriaComposicion(division(eje, desde), 1800, 2000)
    expect(resultado.valido).toBe(true)
    if (!resultado.valido) throw new Error(resultado.motivo)
    const [primero, segundo] = resultado.geometria.hijos
    expect(primero.rect[eje === 'vertical' ? 'ancho' : 'alto']).toBe(esperado)
    expect(segundo.rect[eje === 'vertical' ? 'x' : 'y']).toBe(esperado)
  })

  it.each(['vertical', 'horizontal'] as const)('resuelve dos cotas anidadas en eje %s', eje => {
    const exterior = division(eje, 'inicio', 180)
    exterior.hijos = [exterior.hijos[0], { proporcion: 1, nodo: division(eje, 'fin', 240) }]
    const resultado = resolverGeometriaComposicion(exterior, 1800, 2000)
    expect(resultado.valido).toBe(true)
    if (!resultado.valido) throw new Error(resultado.motivo)
    const [fijoInicio, interior] = resultado.geometria.hijos
    const coord = eje === 'vertical' ? 'x' : 'y'
    const medida = eje === 'vertical' ? 'ancho' : 'alto'
    expect(fijoInicio.rect[medida]).toBe(180)
    expect(interior.rect[coord]).toBe(180)
    expect(interior.hijos[1].rect[medida]).toBe(240)
    expect(interior.hijos[1].rect[coord]).toBe(eje === 'vertical' ? 1560 : 1760)
  })

  it('resuelve una cota respecto a una rama proporcional, sin restar el trazo del padre', () => {
    const interior = division('vertical', 'inicio', 240)
    const exterior: DivisionVisual = {
      tipo: 'division', id: 'padre', eje: 'vertical', separador: 'travesano',
      hijos: [{ proporcion: 1, nodo: hueco('izq') }, { proporcion: 2, nodo: interior }],
    }
    const resultado = resolverGeometriaComposicion(exterior, 1800, 2000)
    expect(resultado.valido).toBe(true)
    if (!resultado.valido) throw new Error(resultado.motivo)
    expect(resultado.geometria.hijos[1].hijos[1].rect.x).toBe(840)
    for (const grosor of [0, 2, 18, 90]) {
      const elementos = distribuirComposicionAcotada(exterior, dimensiones,
        { x: 10, y: 20, ancho: 900, alto: 400 }, grosor)
      const separador = elementos.find(e => e.id === 'opaca-1')!
      expect(separador.x + separador.ancho / 2).toBe(430)
    }
  })

  it.each([
    { anchoMm: 0, altoMm: 2000, motivo: 'ancho-invalido' },
    { anchoMm: -1, altoMm: 2000, motivo: 'ancho-invalido' },
    { anchoMm: NaN, altoMm: 2000, motivo: 'ancho-invalido' },
    { anchoMm: Infinity, altoMm: 2000, motivo: 'ancho-invalido' },
    { anchoMm: 1800, altoMm: 0, motivo: 'alto-invalido' },
    { anchoMm: 1800, altoMm: NaN, motivo: 'alto-invalido' },
    { anchoMm: 1800, altoMm: Infinity, motivo: 'alto-invalido' },
  ])('rechaza dimensiones $anchoMm × $altoMm', ({ anchoMm, altoMm, motivo }) => {
    expect(resolverGeometriaComposicion(division('horizontal', 'inicio'), anchoMm, altoMm))
      .toEqual({ valido: false, motivo })
  })

  it.each([undefined, null, { desde: 'centro', mm: 240 }, { desde: 'inicio', mm: 0 },
    { desde: 'inicio', mm: -1 }, { desde: 'fin', mm: NaN }, { desde: 'fin', mm: Infinity },
    { desde: 'fin', mm: '240' }])('rechaza metadata de cota no interpretable: %j', cotaFija => {
    const nodo = { ...division('horizontal', 'inicio'), cotaFija } as unknown as NodoVisual
    expect(resolverGeometriaComposicion(nodo, 1800, 2000))
      .toEqual({ valido: false, motivo: 'cota-invalida' })
  })

  it.each(['vertical', 'horizontal'] as const)('exige espacio positivo en ambos lados de %s', eje => {
    const nodo = division(eje, 'fin', 240)
    expect(resolverGeometriaComposicion(nodo, 240, 240))
      .toEqual({ valido: false, motivo: 'cota-fuera-de-rango' })
    expect(resolverGeometriaComposicion(nodo, 239, 239).valido).toBe(false)
    expect(resolverGeometriaComposicion(nodo, 241, 241).valido).toBe(true)
  })

  it('rechaza cota fuera de rango en una división anidada', () => {
    const exterior = division('horizontal', 'inicio', 180)
    exterior.hijos = [exterior.hijos[0], { proporcion: 1, nodo: division('horizontal', 'fin', 240) }]
    expect(resolverGeometriaComposicion(exterior, 1800, 420))
      .toEqual({ valido: false, motivo: 'cota-fuera-de-rango' })
    expect(resolverGeometriaComposicion(exterior, 1800, 421).valido).toBe(true)
  })

  it('rechaza cotas en huecos y divisiones que no tienen dos hijos', () => {
    const huecoAcotado = { ...hueco('a'), cotaFija: { desde: 'fin', mm: 240 } } as NodoVisual
    expect(resolverGeometriaComposicion(huecoAcotado, 1800, 2000).valido).toBe(false)
    const nodo = division('horizontal', 'inicio')
    expect(resolverGeometriaComposicion({ ...nodo, hijos: nodo.hijos.slice(0, 1) }, 1800, 2000).valido)
      .toBe(false)
    expect(resolverGeometriaComposicion({ ...nodo, hijos: [...nodo.hijos, nodo.hijos[0]] }, 1800, 2000).valido)
      .toBe(false)
  })

  it.each([0, -1, NaN, Infinity])('rechaza proporción imposible %s', proporcion => {
    const nodo = division('horizontal', 'inicio')
    nodo.hijos = [{ ...nodo.hijos[0], proporcion }, nodo.hijos[1]]
    expect(resolverGeometriaComposicion(nodo, 1800, 2000).valido).toBe(false)
  })
})

describe('proyección de cotas físicas', () => {
  it.each(['vertical', 'horizontal'] as const)('conserva %s al cambiar escala, origen y grosor', eje => {
    const nodo = division(eje, 'fin', 240)
    for (const [ancho, alto] of [[900, 400], [90, 1000], [1800, 2000]]) {
      for (const grosor of [2, 18, 90]) {
        const elementos = distribuirComposicionAcotada(nodo, dimensiones, { x: 31, y: 47, ancho, alto }, grosor)
        const separador = elementos.find(e => e.tipo === 'separador')!
        const centro = eje === 'vertical' ? separador.x + separador.ancho / 2 : separador.y + separador.alto / 2
        const esperado = eje === 'vertical' ? 31 + 1560 * ancho / 1800 : 47 + 1760 * alto / 2000
        expect(centro).toBeCloseTo(esperado, 9)
        expect(elementos.every(e => e.ancho >= 0 && e.alto >= 0)).toBe(true)
      }
    }
  })

  it('proyecta divisiones perpendiculares sobre sus propios ejes físicos', () => {
    const exterior = division('horizontal', 'inicio', 180)
    exterior.hijos = [exterior.hijos[0], { proporcion: 1, nodo: division('vertical', 'fin', 240) }]
    const elementos = distribuirComposicionAcotada(exterior, dimensiones,
      { x: 10, y: 20, ancho: 900, alto: 400 }, 24)
    const separadores = elementos.filter(e => e.tipo === 'separador')
    expect(separadores.find(e => e.eje === 'horizontal')!.y + 12).toBe(56)
    expect(separadores.find(e => e.eje === 'vertical')!.x + 12).toBe(790)
  })

  it('reduce únicamente el grosor gráfico cuando queda un hueco físico de un milímetro', () => {
    const elementos = distribuirComposicionAcotada(division('horizontal', 'inicio', 240),
      { anchoMm: 1000, altoMm: 241 }, { x: 0, y: 0, ancho: 100, alto: 24.1 }, 12)
    const separador = elementos.find(e => e.tipo === 'separador')!
    expect(separador.y + separador.alto / 2).toBeCloseTo(24, 9)
    expect(elementos.every(e => e.alto >= 0 && e.ancho >= 0 && Number.isFinite(e.y))).toBe(true)
    expect(separador.alto).toBeCloseTo(0.1, 9)
  })

  it.each([0, NaN, Infinity])('no dibuja una caja de representación inválida de ancho %s', ancho => {
    expect(distribuirComposicionAcotada(division('horizontal', 'inicio'), dimensiones,
      { x: 0, y: 0, ancho, alto: 100 })).toEqual([])
  })

  it('no dibuja una cota imposible', () => {
    expect(distribuirComposicionAcotada(division('horizontal', 'inicio', 2000), dimensiones,
      { x: 0, y: 0, ancho: 100, alto: 100 })).toEqual([])
  })

  it('conserva exactamente las 22 composiciones previas sin metadata de cota', () => {
    const tieneCota = (nodo: NodoVisual): boolean => nodo.tipo === 'division' &&
      (Object.hasOwn(nodo, 'cotaFija') || nodo.hijos.some(h => tieneCota(h.nodo)))
    const previas = PLANTILLAS_DISENO.filter(p => !tieneCota(p.composicion))
    expect(previas).toHaveLength(22)
    for (const plantilla of previas) for (const grosor of [2, 12, 30]) {
      const rect = { x: 17, y: 39, ancho: 123, alto: 321 }
      expect(distribuirComposicionAcotada(plantilla.composicion, dimensiones, rect, grosor))
        .toEqual(distribuirComposicion(plantilla.composicion, rect, grosor))
    }
  })
})
