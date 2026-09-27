import { describe, expect, it } from 'vitest'
import { medirPlantilla, type FilaMedible } from './medidas-plantilla.ts'
import type { DescuentoCorte } from './cortes-referenciados.ts'

// Tres hojas sintéticas: una de ancho FD y un módulo de dos con batiente.
// Las cotas y descuentos no proceden de documentos del taller.
const fila = (id: number, cambios: Partial<FilaMedible> = {}): FilaMedible => ({
  id, referenciaLargo: null, referenciaAncho: null, formulaLargo: 'A', formulaAncho: null,
  formulaReferenciaLargo: null, formulaReferenciaAncho: null, grupo: 'MH',
  grupoIzquierdo: 'E', grupoDerecho: 'E', grupoSuperior: null, grupoInferior: null,
  gruposAdicionales: [], tipoHoja: 'G', perfilAdicional: null, ...cambios,
})
const horizontal = (id: number, dos: boolean) => fila(id, {
  referenciaLargo: 1, formulaReferenciaLargo: dos ? '(REF-FD)/2' : 'FD', grupo: 'HP',
  grupoIzquierdo: dos ? 'TMG' : 'MV', grupoDerecho: dos ? 'MV' : 'TMG',
  gruposAdicionales: dos ? ['B'] : [], tipoHoja: dos ? '2HA1O' : '1HO',
})
const vidrio = (id: number, refAncho: number) => fila(id, {
  referenciaLargo: 3, referenciaAncho: refAncho, formulaReferenciaLargo: 'REF', formulaReferenciaAncho: 'REF',
  grupo: 'C', grupoIzquierdo: 'HP', grupoDerecho: 'HP', grupoSuperior: 'HP', grupoInferior: 'HP',
})
const plantilla = [
  fila(1), fila(2, { formulaLargo: 'L', grupo: 'MV' }),
  fila(3, { referenciaLargo: 2, formulaReferenciaLargo: 'REF', grupo: 'HP', grupoIzquierdo: 'MH', grupoDerecho: 'MH' }),
  horizontal(10, false), horizontal(11, false),
  horizontal(20, true), horizontal(21, true), horizontal(30, true), horizontal(31, true),
  ...[10, 20, 30].map(id => fila(id + 2, { referenciaLargo: id, formulaReferenciaLargo: 'REF', grupo: 'VAG' })),
  vidrio(40, 10), vidrio(41, 20), vidrio(42, 30),
]
const descuentos: DescuentoCorte[] = [
  { grupoPrincipal: 'E', grupo: 'MH', tipoHoja: 'G', mm: 0 },
  { grupoPrincipal: 'E', grupo: 'MV', tipoHoja: 'G', mm: 0 },
  { grupoPrincipal: 'E', grupo: 'VAG', tipoHoja: 'G', mm: 0 },
  { grupoPrincipal: 'MV', grupo: 'HP', tipoHoja: 'G', mm: 30 },
  { grupoPrincipal: 'TMG', grupo: 'HP', tipoHoja: 'G', mm: 18 },
  { grupoPrincipal: 'MH', grupo: 'HP', tipoHoja: 'G', mm: 30 },
  { grupoPrincipal: 'B', grupo: 'HP', tipoHoja: 'G', mm: 6 },
  { grupoPrincipal: 'HP', grupo: 'C', tipoHoja: 'G', mm: 45 },
]

describe('medidas del módulo de tres hojas con travesaño y batiente', () => {
  it('propaga ambos tamaños de hoja a perfiles y vidrios, independientemente del orden', () => {
    const medidas = medirPlantilla([...plantilla].reverse(), descuentos, { A: 1900, L: 1300, FD: 460 })
    expect([...medidas.values()].every(m => m.incidencia === null)).toBe(true)
    for (const id of [10, 11, 12]) expect(medidas.get(id)?.largoMm).toBe(412)
    for (const id of [20, 21, 22, 30, 31, 32]) expect(medidas.get(id)?.largoMm).toBe(693)
    expect(medidas.get(40)).toEqual({ largoMm: 1150, anchoMm: 322, incidencia: null, referenciaLargoMm: 1240, referenciaAnchoMm: 412 })
    for (const id of [41, 42]) {
      expect(medidas.get(id)).toEqual({ largoMm: 1150, anchoMm: 603, incidencia: null, referenciaLargoMm: 1240, referenciaAnchoMm: 693 })
    }
  })
  it('recalcula el módulo al cambiar la cota de reparto, sin fijar el ancho de la primera hoja', () => {
    const medidas = medirPlantilla(plantilla, descuentos, { A: 1900, L: 1300, FD: 520 })
    expect(medidas.get(10)?.largoMm).toBe(472)
    expect(medidas.get(20)?.largoMm).toBe(663)
    expect(medidas.get(41)?.anchoMm).toBe(573)
  })
  it('propaga el bloqueo por descuento de batiente ausente hasta el vidrio dependiente', () => {
    const medidas = medirPlantilla(plantilla, descuentos.filter(d => d.grupoPrincipal !== 'B'), { A: 1900, L: 1300, FD: 460 })
    expect(medidas.get(10)?.largoMm).toBe(412)
    for (const id of [20, 21, 22, 30, 31, 32]) {
      expect(medidas.get(id)?.largoMm).toBeNull()
      expect(medidas.get(id)?.incidencia).toMatch(/descuento ausente/)
    }
    expect(medidas.get(41)?.anchoMm).toBeNull()
    expect(medidas.get(41)?.incidencia).toMatch(/antecedente 20/)
  })
})
