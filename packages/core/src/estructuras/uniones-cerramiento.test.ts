import { describe, expect, it } from 'vitest'
import { UNIONES_VISUALES, plantillaDiseno } from './diseno.ts'
import { crearConfiguracionCerramiento, esConfiguracionCerramiento, medidasCerramiento } from './cerramiento.ts'
import { insertarModuloEnAnclaje, posicionesCerramiento } from './composicion-cerramiento.ts'
import { normalizarUnionesCerramiento } from './uniones-cerramiento.ts'

function pareja(lado: 'derecha' | 'abajo', codigo: string, grosorMm: number) {
  const base = insertarModuloEnAnclaje(crearConfiguracionCerramiento(plantillaDiseno('2O')!),
    { estructuraCodigo: '0', anchoMm: 800, altoMm: 1200 }, { moduloId: 'modulo-1', lado })
  return { ...base, uniones: base.uniones.map(u => ({ ...u, codigo, grosorMm })) }
}

describe('uniones contrastadas con Productor', () => {
  it.each(['PSU006', 'PSU007', 'PSU008', 'PSU009'])('admite el esquinero %s sin separación', codigo => {
    const config = pareja('derecha', codigo, 0)
    expect(esConfiguracionCerramiento(config)).toBe(true)
    expect(medidasCerramiento(config)).toEqual({ anchoMm: 2000, altoMm: 1200 })
    expect(posicionesCerramiento(config).modulos.get('modulo-2')?.x).toBe(1200)
    expect(esConfiguracionCerramiento(JSON.parse(JSON.stringify(config)))).toBe(true)
  })

  it('admite grosor cero también en el anclaje inferior', () => {
    const config = pareja('abajo', 'PSU006', 0)
    expect(esConfiguracionCerramiento(config)).toBe(true)
    expect(medidasCerramiento(config)).toEqual({ anchoMm: 1200, altoMm: 2400 })
  })

  it.each(['GMU038', 'PSU001', 'U', '', 'INEXISTENTE'])('rechaza cero fuera de UnionTipo 4: %s', codigo => {
    expect(esConfiguracionCerramiento(pareja('derecha', codigo, 0))).toBe(false)
  })

  it.each([-1, NaN, Infinity])('rechaza grosor inválido %s incluso en esquineros', grosor => {
    expect(esConfiguracionCerramiento(pareja('derecha', 'PSU006', grosor))).toBe(false)
  })

  it.each(UNIONES_VISUALES)('toma el grosor de $codigo del catálogo al editar', union => {
    const historico = pareja('derecha', union.codigo, 100)
    expect(esConfiguracionCerramiento(historico)).toBe(true)
    const actual = normalizarUnionesCerramiento(historico)
    expect(actual.uniones[0].grosorMm).toBe(union.grosorMm)
    expect(historico.uniones[0].grosorMm).toBe(100)
    expect(esConfiguracionCerramiento(actual)).toBe(true)
  })
})
