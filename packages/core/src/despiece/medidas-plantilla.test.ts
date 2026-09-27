import { describe, expect, it } from 'vitest'
import { medirPlantilla, type FilaMedible } from './medidas-plantilla.ts'
import type { DescuentoCorte } from './cortes-referenciados.ts'

// Plantilla sintética de dos hojas correderas; valores distintos a los del taller.
const fila = (cambios: Partial<FilaMedible> & Pick<FilaMedible, 'id'>): FilaMedible => ({
  referenciaLargo: null, referenciaAncho: null, formulaLargo: 'L', formulaAncho: null,
  formulaReferenciaLargo: null, formulaReferenciaAncho: null, grupo: null, grupoIzquierdo: null,
  grupoDerecho: null, grupoSuperior: null, grupoInferior: null, gruposAdicionales: [], tipoHoja: 'G',
  perfilAdicional: null, ...cambios,
})
const plantilla: FilaMedible[] = [
  fila({ id: 1, grupo: 'MV', grupoIzquierdo: 'E', grupoDerecho: 'E' }),
  fila({ id: 3, formulaLargo: 'A', grupo: 'MH', grupoIzquierdo: 'MV', grupoDerecho: 'MV' }),
  fila({ id: 7, formulaLargo: '(A)/2', referenciaLargo: 3, formulaReferenciaLargo: '(REF)/2', grupo: 'HH',
    grupoIzquierdo: 'MV', grupoDerecho: 'MV', tipoHoja: '2HC' }),
  fila({ id: 11, referenciaLargo: 1, formulaReferenciaLargo: 'REF', grupo: 'HVL', grupoIzquierdo: 'MH', grupoDerecho: 'MH', tipoHoja: '2HC' }),
  fila({ id: 28, referenciaLargo: 11, referenciaAncho: 7, formulaAncho: '(A)/2', formulaReferenciaLargo: 'REF',
    formulaReferenciaAncho: 'REF', grupo: 'C', grupoIzquierdo: 'HVL', grupoDerecho: 'HVC', grupoSuperior: 'HH',
    grupoInferior: 'HH', tipoHoja: '2HC' }),
  fila({ id: 17, referenciaLargo: 1, formulaReferenciaLargo: 'REF' }),
  fila({ id: 5, formulaLargo: 'A' }),
]
const descuentos: DescuentoCorte[] = [
  { grupoPrincipal: 'E', grupo: 'MV', tipoHoja: 'G', mm: 0 },
  { grupoPrincipal: 'MV', grupo: 'MH', tipoHoja: 'G', mm: 20 },
  { grupoPrincipal: 'MV', grupo: 'HH', tipoHoja: '2HC', mm: 1 },
  { grupoPrincipal: 'MH', grupo: 'HVL', tipoHoja: 'G', mm: 25 },
  { grupoPrincipal: 'HH', grupo: 'C', tipoHoja: 'G', mm: 40 },
  { grupoPrincipal: 'HVL', grupo: 'C', tipoHoja: '2HC', mm: 30 },
  { grupoPrincipal: 'HVC', grupo: 'C', tipoHoja: '2HC', mm: 32 },
]

describe('medirPlantilla', () => {
  const medidas = medirPlantilla(plantilla, descuentos, { A: 1200, L: 1400 })
  it('corta perfiles por referencia y extremos', () => {
    expect(medidas.get(3)?.largoMm).toBe(1160)
    expect(medidas.get(7)?.largoMm).toBe(578)
    expect(medidas.get(11)?.largoMm).toBe(1350)
  })
  it('mide el vidrio en dos dimensiones con sus extremos propios', () => {
    expect(medidas.get(28)).toEqual({ largoMm: 1270, anchoMm: 516, incidencia: null, referenciaLargoMm: 1350, referenciaAnchoMm: 578 })
  })
  it('mide los informativos sin grupo con la referencia sin descuentos o su fórmula', () => {
    expect(medidas.get(17)?.largoMm).toBe(1400)
    expect(medidas.get(5)?.largoMm).toBe(1200)
  })
  it('no inventa una medida cuando falta un descuento', () => {
    const sinVidrio = medirPlantilla(plantilla, descuentos.filter(d => d.grupo !== 'C' || d.grupoPrincipal !== 'HVC'), { A: 1200, L: 1400 })
    expect(sinVidrio.get(28)?.anchoMm).toBeNull()
    expect(sinVidrio.get(28)?.incidencia).toMatch(/descuento ausente/)
  })
})
