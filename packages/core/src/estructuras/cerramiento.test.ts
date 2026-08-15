import { describe, expect, it } from 'vitest'
import { plantillaDiseno, UNIONES_VISUALES } from './diseno.ts'
import {
  actualizarModuloCerramiento, anadirModuloCerramiento, crearConfiguracionCerramiento, descripcionCerramiento,
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

  it('añade a la derecha con la altura del módulo adyacente ya editado', () => {
    const dosModulos = anadirModuloCerramiento(
      crearConfiguracionCerramiento(plantillaDiseno('2O')!),
      plantillaDiseno('0')!,
    )
    const alto = actualizarModuloCerramiento(dosModulos, 'modulo-2', { altoMm: 1400 })

    const ampliado = anadirModuloCerramiento(alto, plantillaDiseno('0')!)

    expect(ampliado.modulos.map((modulo) => modulo.altoMm)).toEqual([1200, 1400, 1400])
    expect(ampliado.uniones.map((union) => union.longitudMm)).toEqual([1200, 1400])
  })

  it('sincroniza una unión cuando sus módulos vuelven a compartir altura', () => {
    const inicial = anadirModuloCerramiento(
      crearConfiguracionCerramiento(plantillaDiseno('2O')!),
      plantillaDiseno('0')!,
    )
    const primeroAlto = actualizarModuloCerramiento(inicial, 'modulo-1', { altoMm: 1400 })

    expect(primeroAlto.uniones[0].longitudMm).toBe(1200)

    const ambosAltos = actualizarModuloCerramiento(primeroAlto, 'modulo-2', { altoMm: 1400 })
    expect(ambosAltos.uniones[0].longitudMm).toBe(1400)
  })

  it('conserva la longitud manual de la unión mientras las alturas son distintas', () => {
    const inicial = anadirModuloCerramiento(
      crearConfiguracionCerramiento(plantillaDiseno('2O')!),
      plantillaDiseno('0')!,
    )
    const manual = {
      ...inicial,
      uniones: [{ ...inicial.uniones[0], longitudMm: 1100 }],
    }

    const desigual = actualizarModuloCerramiento(manual, 'modulo-2', { altoMm: 1500 })

    expect(desigual.modulos.map((modulo) => modulo.altoMm)).toEqual([1200, 1500])
    expect(desigual.uniones[0].longitudMm).toBe(1100)
  })

  it('no altera una longitud manual al editar sólo el ancho', () => {
    const inicial = anadirModuloCerramiento(
      crearConfiguracionCerramiento(plantillaDiseno('2O')!),
      plantillaDiseno('0')!,
    )
    const manual = {
      ...inicial,
      uniones: [{ ...inicial.uniones[0], longitudMm: 1100 }],
    }

    const anchoEditado = actualizarModuloCerramiento(manual, 'modulo-1', { anchoMm: 900 })

    expect(anchoEditado.modulos[0].anchoMm).toBe(900)
    expect(anchoEditado.uniones[0].longitudMm).toBe(1100)
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
