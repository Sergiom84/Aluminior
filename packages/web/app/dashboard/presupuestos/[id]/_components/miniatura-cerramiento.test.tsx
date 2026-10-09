import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  esConfiguracionCerramiento, insertarModuloEnAnclaje, plantillasDisponibles, registrarCatalogoDiseno,
  type ConfiguracionCerramiento, type RectVisual,
} from '@aluminior/core/estructuras'
import { MiniaturaCerramiento } from './miniatura-cerramiento.tsx'

function rectangulos(html: string, clase: string): RectVisual[] {
  return [...html.matchAll(new RegExp(
    `<rect x="([\\d.]+)" y="([\\d.]+)" width="([\\d.]+)" height="([\\d.]+)" class="${clase}"`, 'g',
  ))].map((r) => ({ x: Number(r[1]), y: Number(r[2]), ancho: Number(r[3]), alto: Number(r[4]) }))
}

const base: ConfiguracionCerramiento = {
  version: 1,
  modulos: [{ id: 'modulo-1', estructuraCodigo: '0', anchoMm: 900, altoMm: 1400 }],
  uniones: [],
}

function renderizar(configuracion: ConfiguracionCerramiento) {
  const persistida = JSON.parse(JSON.stringify(configuracion)) as ConfiguracionCerramiento
  expect(esConfiguracionCerramiento(persistida)).toBe(true)
  const antes = JSON.stringify(persistida)
  const html = renderToStaticMarkup(<MiniaturaCerramiento configuracion={persistida} />)
  expect(JSON.stringify(persistida)).toBe(antes)
  return { html, modulos: rectangulos(html, 'al-frame'), uniones: rectangulos(html, 'al-union') }
}

describe('miniatura completa de GRUPO', () => {
  it.each(['derecha', 'abajo', 'izquierda'] as const)(
    'conserva las dos medidas guardadas y la unión al insertar a la %s', (lado) => {
      const configuracion = insertarModuloEnAnclaje(base,
        { estructuraCodigo: '0', anchoMm: 600, altoMm: 800 }, { moduloId: 'modulo-1', lado })
      const { modulos, uniones } = renderizar(configuracion)
      expect(modulos).toHaveLength(2)
      expect(uniones).toHaveLength(1)
      const [primero, segundo] = modulos
      const [union] = uniones
      const escala = primero.ancho / 900
      expect(primero.alto).toBeCloseTo(1400 * escala)
      expect(segundo.ancho).toBeCloseTo(600 * escala)
      expect(segundo.alto).toBeCloseTo(800 * escala)
      if (lado === 'abajo') {
        expect(segundo.x).toBeCloseTo(primero.x)
        expect(union.y).toBeCloseTo(primero.y + primero.alto)
        expect(union.ancho).toBeCloseTo(900 * escala)
        expect(union.alto).toBeCloseTo(20 * escala)
        expect(segundo.y).toBeCloseTo(union.y + union.alto)
      } else {
        const [izquierdo, derecho] = lado === 'izquierda' ? [segundo, primero] : [primero, segundo]
        expect(segundo.y).toBeCloseTo(primero.y)
        expect(union.x).toBeCloseTo(izquierdo.x + izquierdo.ancho)
        expect(union.ancho).toBeCloseTo(20 * escala)
        expect(union.alto).toBeCloseTo(1400 * escala)
        expect(derecho.x).toBeCloseTo(union.x + union.ancho)
      }
    },
  )

  it('conserva la disposición en L con dos uniones de distinta orientación', () => {
    const fila = insertarModuloEnAnclaje(base, { estructuraCodigo: '0', anchoMm: 600, altoMm: 800 },
      { moduloId: 'modulo-1', lado: 'derecha' })
    const configuracion = insertarModuloEnAnclaje(fila,
      { estructuraCodigo: '0', anchoMm: 500, altoMm: 400 }, { moduloId: 'modulo-2', lado: 'abajo' })
    const { modulos, uniones } = renderizar(configuracion)
    expect(modulos).toHaveLength(3)
    expect(uniones).toHaveLength(2)
    const [primero, segundo, tercero] = modulos
    expect(segundo.x).toBeGreaterThan(primero.x + primero.ancho)
    expect(tercero.x).toBeCloseTo(segundo.x)
    expect(tercero.y).toBeCloseTo(segundo.y + segundo.alto + uniones[1].alto)
    expect(uniones[1].x).toBeCloseTo(segundo.x)
    expect(uniones[1].ancho).toBeCloseTo(segundo.ancho)
    expect(tercero.alto / primero.alto).toBeCloseTo(400 / 1400)
  })

  it.each([1, 2] as const)('dibuja la cadena v%s y encaja también una unión más larga que sus módulos', (version) => {
    const configuracion: ConfiguracionCerramiento = {
      version,
      modulos: [version === 1 ? base.modulos[0] : {
        ...base.modulos[0], estructuraCodigo: '1OFI', fiMm: 300,
      }, { id: 'modulo-2', estructuraCodigo: '0', anchoMm: 600, altoMm: 800 }],
      uniones: [{ id: 'union-1', codigo: 'GMU038', grosorMm: 60, longitudMm: 2000 }],
    }
    const { modulos, uniones } = renderizar(configuracion)
    expect(modulos).toHaveLength(2)
    expect(uniones).toHaveLength(1)
    const escala = modulos[0].alto / 1400
    expect(uniones[0].alto).toBeCloseTo(2000 * escala)
    expect(modulos[1].x).toBeCloseTo(modulos[0].x + 960 * escala)
    for (const rect of [...modulos, ...uniones]) {
      expect(rect.x).toBeGreaterThanOrEqual(6)
      expect(rect.y).toBeGreaterThanOrEqual(6)
      expect(rect.x + rect.ancho).toBeLessThanOrEqual(234)
      expect(rect.y + rect.alto).toBeLessThanOrEqual(154)
    }
  })

  it('identifica el conjunto para lectura y no añade controles al recorrido de teclado', () => {
    const { html } = renderizar(base)
    expect(html).toContain('role="img"')
    expect(html).toContain('aria-label="Cerramiento 0: 900 × 1400 mm"')
    expect(html).toContain('preserveAspectRatio="xMidYMid meet"')
    expect(html).not.toMatch(/tabindex|role="button"|<button|al-window-part/i)
  })

  it('dibuja las dos flechas de C2 con sus puntas continuas', () => {
    const catalogoAnterior = plantillasDisponibles()
    // Fixture sintética de la composición conocida: dos hojas deslizantes sin sentido asignado.
    registrarCatalogoDiseno([...catalogoAnterior.filter((p) => p.codigo !== 'C2'), {
      codigo: 'C2', descripcion: 'Corredera de dos hojas', familia: 'CATALOGO', familiaCodigo: '001',
      anchoMm: 1200, altoMm: 1200,
      composicion: { tipo: 'division', id: 'hojas', eje: 'vertical', separador: 'division-invisible',
        hijos: [1, 2].map((n) => ({ proporcion: 1,
          nodo: { tipo: 'hueco', id: `hoja-${n}`, apertura: 'corredera', manilla: false },
        })) },
    }])
    try {
      const { html } = renderizar({ ...base, modulos: [{ ...base.modulos[0], estructuraCodigo: 'C2' }] })
      const trazos = [...html.matchAll(/<path d="([^"]+)" class="([^"]+)"/g)]
      expect(trazos).toHaveLength(6) // Eje y dos puntas por cada hoja.
      expect(trazos.every((trazo) => trazo[2] === 'al-opening-line')).toBe(true)
      for (const eje of [trazos[0], trazos[3]]) {
        const puntos = eje[1].match(/[\d.]+/g)!.map(Number)
        expect(puntos).toHaveLength(4)
        expect(puntos[0]).toBeLessThan(puntos[2])
        expect(puntos[1]).toBe(puntos[3])
      }
    } finally {
      registrarCatalogoDiseno(catalogoAnterior)
    }
  })

  it('reserva el trazo discontinuo de 2O para el triángulo superior de la hoja oscilo', () => {
    const { html } = renderizar({ ...base, modulos: [{ ...base.modulos[0], estructuraCodigo: '2O' }] })
    const trazos = [...html.matchAll(/<path d="([^"]+)" class="([^"]+)"/g)]
    expect(trazos.map((trazo) => trazo[2])).toEqual([
      'al-opening-line', 'al-opening-line', 'al-opening-line al-opening-tilt',
    ])
    const puntos = trazos[2][1].match(/[\d.]+/g)!.map(Number)
    expect(puntos).toHaveLength(6)
    expect(puntos[1]).toBe(puntos[5])
    expect(puntos[3]).toBeLessThan(puntos[1])
    expect(puntos[2]).toBeCloseTo((puntos[0] + puntos[4]) / 2)
  })
})
