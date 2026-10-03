import { describe, expect, it } from 'vitest'
import { esResultadoCerramiento } from './validar.ts'
import { snapshotSintetico } from './snapshot.fixture.ts'
import { resolverOrigenSinUnion } from './sin-union.ts'

function sinUnion() {
  const s = snapshotSintetico()
  Object.assign(s.configuracion.uniones[0], { codigo: 'U', grosorMm: 1 })
  Object.assign(s.origenes[2], { codigo: 'U', reglaMaterial: 'SIN_UNION_U', vidrioCodigo: null,
    venta: { completo: true, importe: '0.00' }, coste: { completo: true, importe: '0.0000' },
    piezas: [], partidasValoracion: [], acristalamiento: [], opcionesHerraje: [], diagnosticos: [] })
  s.ventaMateriales.importe = '40.00'
  s.costeMateriales.importe = '16.0000'
  return s
}

describe('U representa SIN UNION, con procedencia explícita y sin piezas', () => {
  it('exige la receta resuelta de U; ausencia, incidencias o cantidades no nulas no acreditan cero', () => {
    const origen = sinUnion().origenes[2]
    const prueba = { completo: true, precio: 0, cantidades: ['0', '0.000'] }
    expect(resolverOrigenSinUnion(origen, prueba)).not.toBeNull()
    for (const cambio of [{ completo: false }, { precio: null }, { precio: 1 },
      { cantidades: [] }, { cantidades: ['1'] }, { cantidades: ['desconocida'] }]) {
      expect(resolverOrigenSinUnion(origen, { ...prueba, ...cambio })).toBeNull()
    }
    expect(resolverOrigenSinUnion({ ...origen, codigo: 'GMU038' }, prueba)).toBeNull()
    expect(resolverOrigenSinUnion({ ...origen, origen: { ...origen.origen, tipo: 'MODULO' } }, prueba)).toBeNull()
  })

  it.each(['ESTRUCTURA_NUMBER_V1', 'FILA_CENTIMOS'] as const)('conserva cero explícito en %s', redondeoVenta => {
    const s = sinUnion(); s.redondeoVenta = redondeoVenta
    expect(esResultadoCerramiento(JSON.parse(JSON.stringify(s)))).toBe(true)
  })

  it('no transforma una receta material ausente en cero', () => {
    const s = sinUnion()
    s.configuracion.uniones[0].codigo = 'GMU038'; s.origenes[2].codigo = 'GMU038'
    expect(esResultadoCerramiento(s)).toBe(false)
    s.configuracion.uniones[0].codigo = 'U'; s.origenes[2].codigo = 'U'
    s.origenes[2].reglaMaterial = null
    expect(esResultadoCerramiento(s)).toBe(false)
  })

  it('rechaza importes, material, herrajes o bloqueos contradictorios', () => {
    for (const campo of ['venta', 'coste'] as const) {
      const s = sinUnion(); s.origenes[2][campo].importe = '1'
      expect(esResultadoCerramiento(s)).toBe(false)
    }
    for (const campo of ['piezas', 'partidasValoracion', 'acristalamiento', 'opcionesHerraje'] as const) {
      const s = sinUnion()
      Object.assign(s.origenes[2], { [campo]: snapshotSintetico().origenes[2][campo] })
      expect(esResultadoCerramiento(s)).toBe(false)
    }
    const s = sinUnion()
    s.origenes[2].diagnosticos = [{ codigo: 'COBERTURA_INCOMPLETA', ambito: 'VENTA', bloqueante: true, detalle: 'Sin receta' }]
    expect(esResultadoCerramiento(s)).toBe(false)
  })
})
