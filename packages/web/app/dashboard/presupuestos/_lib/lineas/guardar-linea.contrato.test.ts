/**
 * Contrato de `EscrituraLinea`, comprobado en typecheck.
 *
 * Las combinaciones de abajo son las que dejarían una línea corrupta si el
 * tipo volviese a tener satélites opcionales. `@ts-expect-error` invierte la
 * prueba: si alguna dejara de ser un error, `npm run typecheck` falla.
 */
import { describe, expect, it } from 'vitest'
import type { EscrituraLinea, ValoresLinea } from './guardar-linea.ts'
import type { AltaCerramiento } from '../cerramientos/index.ts'

const valores = {} as ValoresLinea
const cerramiento = {} as AltaCerramiento
const estructura = {
  serieCodigo: '', estructuraCodigo: '', acabadoCodigo: null,
  piezas: [], acristalamiento: [], opcionesHerraje: [],
}

// Válidas: cada tipo con lo que le corresponde.
const articulo: EscrituraLinea = { tipo: 'ARTICULO', valores }
const conCerramiento: EscrituraLinea = { tipo: 'CERRAMIENTO', valores, cerramiento }
const conEstructura: EscrituraLinea = { tipo: 'ESTRUCTURA', valores, estructura }

// @ts-expect-error CERRAMIENTO sin su configuración: la línea no se podría dibujar.
const sinConfiguracion: EscrituraLinea = { tipo: 'CERRAMIENTO', valores }

// @ts-expect-error ESTRUCTURA sin su despiece.
const sinDespiece: EscrituraLinea = { tipo: 'ESTRUCTURA', valores }

// @ts-expect-error ARTICULO con configuración de cerramiento.
const articuloConfigurado: EscrituraLinea = { tipo: 'ARTICULO', valores, cerramiento }

// @ts-expect-error Los dos satélites a la vez.
const ambos: EscrituraLinea = { tipo: 'CERRAMIENTO', valores, cerramiento, estructura }

describe('contrato de escritura de línea', () => {
  it('sólo admite el satélite que corresponde al tipo', () => {
    expect([articulo, conCerramiento, conEstructura].map((e) => e.tipo))
      .toEqual(['ARTICULO', 'CERRAMIENTO', 'ESTRUCTURA'])
    expect([sinConfiguracion, sinDespiece, articuloConfigurado, ambos]).toHaveLength(4)
  })
})
