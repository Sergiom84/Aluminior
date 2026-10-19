import { describe, expect, it } from 'vitest'
import type { ConfiguracionCerramiento } from '@aluminior/core/estructuras'
import { origenesGeometriaCerramiento } from './origenes-geometria.ts'

const generales = { serieCodigo: 'GMA350', vidrioCodigo: 'VCG4' }

const configuracion = (materiales?: { serieCodigo: string }): ConfiguracionCerramiento => ({
  version: 3,
  modulos: [
    { id: 'modulo-1', estructuraCodigo: 'C2', anchoMm: 1200, altoMm: 1200 },
    {
      id: 'modulo-2', estructuraCodigo: 'C2', anchoMm: 1200, altoMm: 1200,
      anclaje: { moduloId: 'modulo-1', unionId: 'union-1', lado: 'derecha' },
      materiales: { serieCodigo: 'GMC400' },
    },
  ],
  uniones: [{
    id: 'union-1', codigo: 'GMU038', grosorMm: 60, longitudMm: 2440,
    ...(materiales ? { materiales } : {}),
  }],
})

describe('orígenes de geometría del cerramiento', () => {
  it('hereda la serie general cuando la unión no guarda la suya', () => {
    const union = origenesGeometriaCerramiento(configuracion(), generales)[2]!
    expect(union.tipo).toBe('UNION')
    expect(union.materiales.serieCodigo).toEqual({ valor: 'GMA350', origen: 'general' })
  })

  it('valora la unión de otra serie con la suya, no con la del primer módulo', () => {
    const union = origenesGeometriaCerramiento(configuracion({ serieCodigo: 'GMC400' }), generales)[2]!
    expect(union.materiales.serieCodigo).toEqual({ valor: 'GMC400', origen: 'elemento' })
  })

  it('nunca da vidrio a la unión', () => {
    for (const config of [configuracion(), configuracion({ serieCodigo: 'GMC400' })]) {
      const union = origenesGeometriaCerramiento(config, generales)[2]!
      expect(union.materiales.vidrioCodigo).toEqual({ valor: null, origen: 'elemento' })
    }
  })

  it('conserva el orden y los materiales efectivos de los módulos', () => {
    const origenes = origenesGeometriaCerramiento(configuracion({ serieCodigo: 'GMC400' }), generales)
    expect(origenes.map(origen => origen.tipo)).toEqual(['MODULO', 'MODULO', 'UNION'])
    expect(origenes[0]!.materiales.serieCodigo).toEqual({ valor: 'GMA350', origen: 'general' })
    expect(origenes[1]!.materiales.serieCodigo).toEqual({ valor: 'GMC400', origen: 'elemento' })
    expect(origenes[0]!.materiales.vidrioCodigo).toEqual({ valor: 'VCG4', origen: 'general' })
  })

  it('mide la unión con su grosor como ancho y su longitud como alto', () => {
    const union = origenesGeometriaCerramiento(configuracion(), generales)[2]!
    expect([union.anchoMm, union.altoMm]).toEqual([60, 2440])
  })
})
