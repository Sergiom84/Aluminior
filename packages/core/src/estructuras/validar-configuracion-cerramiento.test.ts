import { afterEach, describe, expect, it } from 'vitest'
import { crearConfiguracionCerramiento, crearConfiguracionSinDibujo } from './cerramiento.ts'
import { registrarEstructurasSinDibujo } from './sin-dibujo.ts'
import { generarPlantillaCatalogo } from './diseno-catalogo.ts'
import { plantillaDiseno, registrarCatalogoDiseno } from './diseno.ts'
import { esConfiguracionCerramiento } from './validar-configuracion-cerramiento.ts'

describe('medidas económicas del cerramiento', () => {
  afterEach(() => {
    registrarCatalogoDiseno([])
    registrarEstructurasSinDibujo([])
  })

  it.each([1, 2, 3] as const)('conserva medidas fraccionarias sin redondear en v%s', version => {
    const inicial = crearConfiguracionCerramiento(plantillaDiseno('0')!)
    const modulo = { ...inicial.modulos[0], anchoMm: 439.5, altoMm: 1200.300048828125 }
    const configuracion = { ...inicial, version, modulos: [modulo] }
    // v2 necesita una cota FI explícita para distinguirse de v1.
    if (version === 2) Object.assign(modulo, { estructuraCodigo: '1OFI', fiMm: 400.25 })
    expect(esConfiguracionCerramiento(configuracion)).toBe(true)
    expect(modulo.anchoMm).toBe(439.5)
    expect(modulo.altoMm).toBe(1200.300048828125)
  })

  it('admite precios manuales válidos y rechaza los duplicados o sin precio', () => {
    const inicial = crearConfiguracionCerramiento(plantillaDiseno('0')!)
    const precio = { articulo: 'PSG100', acabado: 'L', unidad: 'ML', precio: 12.5 }
    expect(esConfiguracionCerramiento({ ...inicial, preciosManuales: [precio] })).toBe(true)
    expect(esConfiguracionCerramiento({ ...inicial, preciosManuales: [precio, precio] })).toBe(false)
    expect(esConfiguracionCerramiento({ ...inicial, preciosManuales: [{ ...precio, precio: -1 }] })).toBe(false)
  })

  it('admite la plantilla generada por el catálogo, pero exige su registro', () => {
    const generada = generarPlantillaCatalogo({ codigo: 'QA-CATALOGO', descripcion: 'Fijo sintético',
      familiaCodigo: '001', anchoMm: 1200, altoMm: 1200, nodos: [
        { id: 0, tipo: 1, padre: -1, division: 0, posicion: 0, travesano: '', invisible: false,
          hoja: 0, numeroHoja: 0, tipoCota: 0, cota: 0, equidistantes: 0, marco: 'NOR', variantes: [] },
        { id: 1, tipo: 5, padre: 0, division: 0, posicion: 0, travesano: '', invisible: false,
          hoja: 0, numeroHoja: 0, tipoCota: 0, cota: 0, equidistantes: 0, marco: '', variantes: [] },
      ] })
    if (generada.estado !== 'dibujable') throw new Error('Fixture no dibujable')
    const configuracion = crearConfiguracionCerramiento(generada.plantilla)
    configuracion.modulos[0].anchoMm = 439.5
    expect(esConfiguracionCerramiento(configuracion)).toBe(false)
    registrarCatalogoDiseno([generada.plantilla])
    expect(esConfiguracionCerramiento(configuracion)).toBe(true)
    registrarCatalogoDiseno([])
    expect(esConfiguracionCerramiento(configuracion)).toBe(false)
  })

  it.each([NaN, Infinity, -Infinity, 0, -0.5, '439.5', null, undefined])(
    'rechaza una dimensión no numérica, no finita o no positiva: %s', valor => {
      const inicial = crearConfiguracionCerramiento(plantillaDiseno('0')!)
      for (const campo of ['anchoMm', 'altoMm']) {
        expect(esConfiguracionCerramiento({ ...inicial,
          modulos: [{ ...inicial.modulos[0], [campo]: valor }] })).toBe(false)
      }
    },
  )

  it('admite un código de catálogo sin dibujo y rechaza inventarlo en una ventana dibujable', () => {
    registrarEstructurasSinDibujo([{ codigo: '1PCMA', descripcion: 'Puerta calle', anchoMm: 800, altoMm: 2100 }])
    const puerta = crearConfiguracionSinDibujo({ codigo: '1PCMA', anchoMm: 980, altoMm: 2100 })
    expect(esConfiguracionCerramiento(puerta)).toBe(true)
    expect(puerta.modulos[0]?.sinDibujo).toBe(true)

    const dibujable = crearConfiguracionCerramiento(plantillaDiseno('0')!)
    expect(esConfiguracionCerramiento({
      ...dibujable,
      modulos: [{ ...dibujable.modulos[0], sinDibujo: true }],
    })).toBe(false)
    expect(esConfiguracionCerramiento(crearConfiguracionSinDibujo({
      codigo: 'NO-EXISTE', anchoMm: 800, altoMm: 2100,
    }))).toBe(false)
  })
})
