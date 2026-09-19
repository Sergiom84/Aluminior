import { describe, expect, it } from 'vitest'
import type { ConfiguracionCerramiento } from '@aluminior/core/estructuras'
import {
  geometriaCerramientoPdf, geometriaHerrajesPdf, trazosAperturaPdf,
} from './geometria-cerramiento'

const configuracion = (primero = 1200): ConfiguracionCerramiento => ({ version: 1,
  modulos: [
    { id: 'izquierdo', estructuraCodigo: '2', anchoMm: primero, altoMm: 1000 },
    { id: 'derecho', estructuraCodigo: '1OI', anchoMm: 1200, altoMm: 1000 },
  ], uniones: [{ id: 'tubo', codigo: 'GMU038', grosorMm: 60, longitudMm: 1000 }],
})

describe('adaptador geométrico PDF', () => {
  it.each([[1200, 2460, 1260], [900, 2160, 960]])(
    'conserva mm e identidad con primer módulo de %s', (primero, total, inicioDerecho) => {
      const fuente = configuracion(primero)
      const copia = structuredClone(fuente)
      const dibujo = geometriaCerramientoPdf(fuente)
      const origen = dibujo.modulos[0].rect.x
      expect(dibujo.medidas).toEqual({ anchoMm: total, altoMm: 1000 })
      expect(dibujo.modulos.map((m) => m.id)).toEqual(['izquierdo', 'derecho'])
      expect(dibujo.uniones.map((u) => u.id)).toEqual(['tubo'])
      expect(dibujo.modulos[0].rect.ancho / dibujo.escala).toBeCloseTo(primero)
      expect((dibujo.modulos[1].rect.x - origen) / dibujo.escala).toBeCloseTo(inicioDerecho)
      expect(dibujo.uniones[0].rect.ancho / dibujo.escala).toBeCloseTo(60)
      expect((dibujo.uniones[0].rect.x - origen) / dibujo.escala).toBeCloseTo(primero)
      expect(dibujo.modulos[1].rect.ancho / dibujo.modulos[1].rect.alto).toBeCloseTo(1.2)
      expect(dibujo.modulos[0].elementos.map((e) => e.id)).toEqual(['hoja-1', 'division-hojas-1', 'hoja-2'])
      expect(fuente).toEqual(copia)
    },
  )
  it('conserva el reparto core en dos hojas: 599 + 2 + 599 mm', () => {
    const dibujo = geometriaCerramientoPdf(configuracion())
    const elementos = dibujo.modulos[0].elementos
    expect(elementos).toHaveLength(3)
    expect(elementos[0].ancho / dibujo.escala).toBeCloseTo(599)
    expect(elementos[1].ancho / dibujo.escala).toBeCloseTo(2)
    expect(elementos[2].ancho / dibujo.escala).toBeCloseTo(599)
  })
  it.each([[100, 6000], [12000, 100], [100, 100]])('encaja %s × %s sin deformar ni cortar', (anchoMm, altoMm) => {
    const dibujo = geometriaCerramientoPdf({ version: 1, modulos: [
      { id: 'extremo', estructuraCodigo: '0', anchoMm, altoMm },
    ], uniones: [] })
    const rect = dibujo.modulos[0].rect
    expect(rect.ancho / rect.alto).toBeCloseTo(anchoMm / altoMm)
    expect(rect.x).toBeGreaterThanOrEqual(8)
    expect(rect.y).toBeGreaterThanOrEqual(8)
    expect(rect.x + rect.ancho).toBeLessThanOrEqual(232)
    expect(rect.y + rect.alto).toBeLessThanOrEqual(130)
  })
  it('incluye una unión más alta sin falsear la medida de módulos', () => {
    const fuente = configuracion()
    const dibujo = geometriaCerramientoPdf({ ...fuente, uniones: [{ ...fuente.uniones[0], longitudMm: 2000 }] })
    expect(dibujo.medidas.altoMm).toBe(1000)
    expect(dibujo.uniones[0].rect.alto).toBe(122)
    expect(dibujo.modulos[0].rect.alto).toBe(61)
  })
  it('rechaza configuración o caja no representables', () => {
    expect(() => geometriaCerramientoPdf({ ...configuracion(), modulos: [] })).toThrow()
    expect(() => geometriaCerramientoPdf(configuracion(), 99)).toThrow()
    expect(() => geometriaCerramientoPdf(configuracion(), Infinity)).toThrow()
  })
  it('rechaza dimensiones cuya suma desborda aunque cada módulo sea finito', () => {
    const fuente = configuracion()
    const desbordada = { ...fuente, modulos: fuente.modulos.map((modulo) => ({
      ...modulo, anchoMm: Number.MAX_VALUE,
    })) }
    expect(() => geometriaCerramientoPdf(desbordada)).toThrow('no son representables en PDF')
  })
})

describe('símbolos con coordenadas declaradas y sentido del diseñador', () => {
  const rect = { x: 10, y: 20, ancho: 100, alto: 200 }
  it('fijo sin símbolo', () => expect(trazosAperturaPdf('fijo', rect)).toEqual([]))
  it('abatible derecha', () => expect(trazosAperturaPdf('abatible-derecha', rect))
    .toEqual(['M 110 20 L 10 120 L 110 220']))
  it('abatible izquierda', () => expect(trazosAperturaPdf('abatible-izquierda', rect))
    .toEqual(['M 10 20 L 110 120 L 10 220']))
  it.each(['izquierda', 'derecha'] as const)('oscilo %s añade triángulo vertical', (mano) => {
    expect(trazosAperturaPdf(`oscilobatiente-${mano}`, rect)).toEqual([
      mano === 'derecha' ? 'M 110 20 L 10 120 L 110 220' : 'M 10 20 L 110 120 L 10 220',
      'M 10 220 L 60 20 L 110 220',
    ])
  })

  it('sitúa bisagras y manilla en lados contrarios dentro del rectángulo de hoja', () => {
    const herrajes = geometriaHerrajesPdf('oscilobatiente-derecha', true, rect)!
    expect(herrajes.bisagras.map((bisagra) => bisagra.x)).toEqual([108.2, 108.2])
    expect(herrajes.manilla?.x).toBe(10.6)
    for (const accesorio of [...herrajes.bisagras, herrajes.manilla!]) {
      expect(accesorio.x).toBeGreaterThanOrEqual(rect.x)
      expect(accesorio.y).toBeGreaterThanOrEqual(rect.y)
      expect(accesorio.x + accesorio.ancho).toBeLessThanOrEqual(rect.x + rect.ancho)
      expect(accesorio.y + accesorio.alto).toBeLessThanOrEqual(rect.y + rect.alto)
    }
  })

  it.each(['izquierda', 'derecha'] as const)('mantiene manilla %s fuera del vidrio', (mano) => {
    const herrajes = geometriaHerrajesPdf(`abatible-${mano}`, true, rect)!
    const vidrio = { x1: rect.x + 3, x2: rect.x + rect.ancho - 3 }
    const manilla = herrajes.manilla!
    expect(manilla.x + manilla.ancho <= vidrio.x1 || manilla.x >= vidrio.x2).toBe(true)
  })

  it('reduce herrajes en huecos mínimos sin desbordar y respeta ausencia de manilla', () => {
    const pequeno = { x: 2, y: 3, ancho: 4, alto: 5 }
    const herrajes = geometriaHerrajesPdf('abatible-izquierda', false, pequeno)!
    expect(herrajes.manilla).toBeNull()
    for (const bisagra of herrajes.bisagras) {
      expect(bisagra.x).toBeGreaterThanOrEqual(pequeno.x)
      expect(bisagra.y).toBeGreaterThanOrEqual(pequeno.y)
      expect(bisagra.x + bisagra.ancho).toBeLessThanOrEqual(pequeno.x + pequeno.ancho)
      expect(bisagra.y + bisagra.alto).toBeLessThanOrEqual(pequeno.y + pequeno.alto)
    }
  })
})
