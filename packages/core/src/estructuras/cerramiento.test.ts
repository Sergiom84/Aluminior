import { describe, expect, it } from 'vitest'
import { plantillaDiseno, UNIONES_VISUALES } from './diseno.ts'
import {
  actualizarFiModuloCerramiento, actualizarModuloCerramiento, anadirModuloCerramiento,
  cambiarEstructuraModuloCerramiento, crearConfiguracionCerramiento, descripcionCerramiento,
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

  it('crea cada módulo 1OFI nuevo con FI 300 y versión 2', () => {
    const inicial = crearConfiguracionCerramiento(plantillaDiseno('1OFI')!)
    const ampliado = anadirModuloCerramiento(inicial, plantillaDiseno('1OFI')!)

    expect(ampliado.version).toBe(2)
    expect(ampliado.modulos.map((modulo) => modulo.fiMm)).toEqual([300, 300])
    expect(esConfiguracionCerramiento(ampliado)).toBe(true)
  })

  it('edita FI por módulo, conserva el valor al cambiar altura y serializa exactamente', () => {
    const inicial = anadirModuloCerramiento(
      crearConfiguracionCerramiento(plantillaDiseno('1OFI')!),
      plantillaDiseno('1OFI')!,
    )
    const editado = actualizarFiModuloCerramiento(inicial, 'modulo-2', 400)
    const alto = actualizarModuloCerramiento(editado, 'modulo-2', { altoMm: 1800 })
    const recuperado = JSON.parse(JSON.stringify(alto)) as unknown

    expect(alto.modulos.map((modulo) => modulo.fiMm)).toEqual([300, 400])
    expect(esConfiguracionCerramiento(recuperado)).toBe(true)
    expect(recuperado).toEqual(alto)
  })

  it('mantiene v1 y su ausencia de FI al guardar cambios ajenos', () => {
    const legado = {
      version: 1 as const,
      modulos: [{ id: 'modulo-1', estructuraCodigo: '1OFI', anchoMm: 900, altoMm: 1500 }],
      uniones: [],
    }
    const editado = actualizarModuloCerramiento(legado, 'modulo-1', { anchoMm: 950 })

    expect(editado.version).toBe(1)
    expect(Object.hasOwn(editado.modulos[0], 'fiMm')).toBe(false)
    expect(esConfiguracionCerramiento(editado)).toBe(true)
  })

  it('convierte v1 solo al editar FI y rechaza FI geométricamente inválido', () => {
    const legado = {
      version: 1 as const,
      modulos: [{ id: 'modulo-1', estructuraCodigo: '1OFI', anchoMm: 900, altoMm: 1500 }],
      uniones: [],
    }
    const convertido = actualizarFiModuloCerramiento(legado, 'modulo-1', 400)
    expect(convertido.version).toBe(2)
    expect(convertido.modulos[0].fiMm).toBe(400)
    expect(esConfiguracionCerramiento(convertido)).toBe(true)

    const demasiadoAlto = actualizarModuloCerramiento(convertido, 'modulo-1', { altoMm: 400 })
    expect(demasiadoAlto.modulos[0].fiMm).toBe(400)
    expect(esConfiguracionCerramiento(demasiadoAlto)).toBe(false)
  })

  it('al seleccionar 1OFI asigna FI y al salir elimina su significado específico', () => {
    const base = crearConfiguracionCerramiento(plantillaDiseno('2O')!)
    const unoFi = cambiarEstructuraModuloCerramiento(base, 'modulo-1', plantillaDiseno('1OFI')!)
    const otra = cambiarEstructuraModuloCerramiento(unoFi, 'modulo-1', plantillaDiseno('2O')!)

    expect(unoFi).toMatchObject({ version: 2, modulos: [{ estructuraCodigo: '1OFI', fiMm: 300 }] })
    expect(Object.hasOwn(otra.modulos[0], 'fiMm')).toBe(false)
    expect(otra.version).toBe(1)
    expect(esConfiguracionCerramiento(otra)).toBe(true)
  })
})
