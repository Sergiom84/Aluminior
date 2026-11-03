import { describe, expect, it } from 'vitest'
import { UNIONES_VISUALES, plantillaDiseno } from './diseno.ts'
import { crearConfiguracionCerramiento, esConfiguracionCerramiento, medidasCerramiento, type ConfiguracionCerramiento } from './cerramiento.ts'
import { insertarModuloEnAnclaje } from './composicion-cerramiento.ts'
import { medidasFabricacionCerramiento } from './medidas-uniones.ts'
import {
  aplicarGrosorCatalogo, CATALOGO_SNAPSHOT, fusionarCatalogoUniones, precioLinealUnion, unionAdmitida, unionOfrecida,
} from './catalogo-uniones.ts'
import { normalizarUnionesCerramiento } from './uniones-cerramiento.ts'

const QA = {
  codigo: 'QA-U60', descripcion: 'Tubo de prueba 60', grosorMm: 60, unionTipo: 0 as const,
  seriesEspecificas: true, series: ['C70'],
}

function caso2800(): ConfiguracionCerramiento {
  let config = crearConfiguracionCerramiento(plantillaDiseno('2O')!)
  config = { ...config, modulos: [{ ...config.modulos[0], anchoMm: 1200, altoMm: 1200 }] }
  config = insertarModuloEnAnclaje(config, { estructuraCodigo: '0', anchoMm: 400, altoMm: 400 },
    { moduloId: 'modulo-1', lado: 'derecha' })
  config = insertarModuloEnAnclaje(config, { estructuraCodigo: '2O', anchoMm: 1200, altoMm: 1200 },
    { moduloId: 'modulo-2', lado: 'derecha' })
  return { ...config, uniones: config.uniones.map(union => ({ ...union, codigo: 'QA-U60', grosorMm: 60 })) }
}

describe('catálogo de uniones inyectado', () => {
  it('QA-U60 en 2O + fijo 400 + 2O mide 2800 y cada tubo 400 mm', () => {
    const config = caso2800()
    expect(esConfiguracionCerramiento(config, [QA])).toBe(true)
    expect(esConfiguracionCerramiento(config)).toBe(false)
    expect(esConfiguracionCerramiento(config, CATALOGO_SNAPSHOT)).toBe(true)
    expect(medidasCerramiento(config)).toEqual({ anchoMm: 2800, altoMm: 1200 })
    expect([...medidasFabricacionCerramiento(config).uniones.values()]).toEqual([
      { longitudMm: 400 }, { longitudMm: 400 },
    ])
  })

  it('el precio de 400 mm a 10,30 €/m es 4,12 y no fabrica un cero', () => {
    expect(precioLinealUnion(0.4, 10.3)).toBe(4.12)
    expect(precioLinealUnion(0.4, Number.NaN)).toBeNull()
  })

  it('editar el grosor cambia el catálogo y no el snapshot que no se normaliza', () => {
    const config = caso2800()
    expect(normalizarUnionesCerramiento(config, [{ ...QA, grosorMm: 40 }]).uniones[0].grosorMm).toBe(40)
    expect(config.uniones[0].grosorMm).toBe(60)
    expect(aplicarGrosorCatalogo(config.uniones[0], UNIONES_VISUALES).grosorMm).toBe(60)
  })

  it('una unión de series concretas no se ofrece fuera de ellas', () => {
    expect(unionOfrecida(QA, 'C70')).toBe(true)
    expect(unionOfrecida(QA, 'RPT')).toBe(false)
    expect(unionOfrecida(QA, null)).toBe(false)
    expect(unionOfrecida({ ...QA, seriesEspecificas: false }, null)).toBe(true)
  })

  it('al escribir, un código fuera del catálogo recibido no se admite', () => {
    expect(unionAdmitida({ codigo: 'XX999', grosorMm: 60 }, [QA])).toBe(false)
    expect(unionAdmitida({ codigo: 'QA-U60', grosorMm: 60 }, [QA])).toBe(true)
    expect(unionAdmitida({ codigo: 'XX999', grosorMm: 60 }, CATALOGO_SNAPSHOT)).toBe(true)
  })

  it('el esquinero de usuario de tipo 4 admite grosor cero; otro tipo no', () => {
    const esquinero = { ...QA, codigo: 'QA-E0', grosorMm: 0, unionTipo: 4 as const }
    expect(unionAdmitida({ codigo: 'QA-E0', grosorMm: 0 }, [esquinero])).toBe(true)
    expect(unionAdmitida({ codigo: 'QA-U60', grosorMm: 0 }, [QA])).toBe(false)
  })

  it('admite grosor cero si el catálogo lo guarda así, como GMU013 de tipo 3', () => {
    const gmu013 = { codigo: 'GMU013', descripcion: 'Regulable', grosorMm: 0, unionTipo: 3 as const }
    expect(unionAdmitida({ codigo: 'GMU013', grosorMm: 0 }, [gmu013])).toBe(true)
  })

  it('rechaza grosor cero de un código nuevo y conserva la reserva', () => {
    expect(unionAdmitida({ codigo: 'QA-U60', grosorMm: 0 })).toBe(false)
    expect(unionAdmitida({ codigo: 'PSU006', grosorMm: 0 })).toBe(true)
    const fusion = fusionarCatalogoUniones([QA])
    expect(fusion.some(union => union.codigo === 'GMU038')).toBe(true)
    expect(fusion.find(union => union.codigo === 'QA-U60')?.grosorMm).toBe(60)
  })
})
