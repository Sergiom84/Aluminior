import { describe, expect, it } from 'vitest'
import { plantillaDiseno, UNIONES_VISUALES } from './diseno.ts'
import {
  anadirModuloCerramiento, crearConfiguracionCerramiento, descripcionCerramiento,
  eliminarModuloCerramiento, esConfiguracionCerramiento, medidasCerramiento,
} from './cerramiento.ts'

describe('configuración del cerramiento', () => {
  it('mantiene la correspondencia entre módulos y uniones', () => {
    const inicial = crearConfiguracionCerramiento(plantillaDiseno('2O')!)
    const ampliado = anadirModuloCerramiento(inicial, plantillaDiseno('0')!)
    expect(ampliado.modulos).toHaveLength(2)
    expect(ampliado.uniones).toHaveLength(1)
    expect(medidasCerramiento(ampliado)).toEqual({ anchoMm: 2460, altoMm: 1200 })
    expect(esConfiguracionCerramiento(ampliado)).toBe(true)

    const reducido = eliminarModuloCerramiento(ampliado, 'modulo-1')
    expect(reducido.modulos.map((modulo) => modulo.id)).toEqual(['modulo-2'])
    expect(reducido.uniones).toHaveLength(0)
    const reampliado = anadirModuloCerramiento(reducido, plantillaDiseno('0')!)
    expect(reampliado.modulos.map((modulo) => modulo.id)).toEqual(['modulo-2', 'modulo-3'])
  })

  it('rechaza configuraciones manipuladas o sin correspondencia estructural', () => {
    const configuracion = crearConfiguracionCerramiento()
    expect(esConfiguracionCerramiento({ ...configuracion, uniones: [UNIONES_VISUALES[0]] }))
      .toBe(false)
    expect(esConfiguracionCerramiento({
      ...configuracion,
      modulos: [{ ...configuracion.modulos[0], estructuraCodigo: 'NO-EXISTE' }],
    })).toBe(false)
    expect(esConfiguracionCerramiento({
      ...configuracion,
      modulos: [configuracion.modulos[0], configuracion.modulos[0]],
      uniones: [{
        id: configuracion.modulos[0].id, codigo: 'GMU038', longitudMm: 1200, grosorMm: 60,
      }],
    })).toBe(false)
  })

  it('describe la línea agregada encadenando los códigos de los módulos', () => {
    const inicial = crearConfiguracionCerramiento(plantillaDiseno('2O')!)
    expect(descripcionCerramiento(inicial)).toBe('CERRAMIENTO SEGÚN DIBUJO · 2O')
    const ampliado = anadirModuloCerramiento(inicial, plantillaDiseno('2O')!)
    expect(descripcionCerramiento(ampliado)).toBe('CERRAMIENTO SEGÚN DIBUJO · 2O + 2O')
  })

  it('normaliza el código del módulo al describir, sin deducir la forma del texto', () => {
    const configuracion = {
      ...crearConfiguracionCerramiento(),
      modulos: [{
        id: 'modulo-1', estructuraCodigo: ' 1ofi ', anchoMm: 800, altoMm: 1500,
      }],
    }
    expect(descripcionCerramiento(configuracion)).toBe('CERRAMIENTO SEGÚN DIBUJO · 1OFI')
  })
})
