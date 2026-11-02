import { afterEach, describe, expect, it } from 'vitest'
import { cambiarEstructuraModuloCerramiento, crearConfiguracionCerramiento } from './cerramiento.ts'
import { cotasEfectivasModulo } from './cotas-cerramiento.ts'
import { generarPlantillaCatalogo } from './diseno-catalogo.ts'
import { plantillaDiseno, registrarCatalogoDiseno } from './diseno.ts'
import { esConfiguracionCerramiento } from './validar-configuracion-cerramiento.ts'

function plantillaSintetica(codigo: string) {
  const generada = generarPlantillaCatalogo({ codigo, descripcion: `Sintética ${codigo}`,
    familiaCodigo: '001', anchoMm: 1200, altoMm: 2100, nodos: [
      { id: 0, tipo: 1, padre: -1, division: 0, posicion: 0, travesano: '', invisible: false,
        hoja: 0, numeroHoja: 0, tipoCota: 0, cota: 0, equidistantes: 0, marco: 'NOR', variantes: [] },
      { id: 1, tipo: 5, padre: 0, division: 0, posicion: 0, travesano: '', invisible: false,
        hoja: 0, numeroHoja: 0, tipoCota: 0, cota: 0, equidistantes: 0, marco: '', variantes: [] },
    ] })
  if (generada.estado !== 'dibujable') throw new Error('Plantilla sintética no dibujable')
  return generada.plantilla
}

describe('cotas FI/FS por módulo de cerramiento', () => {
  afterEach(() => registrarCatalogoDiseno([]))

  it('admite cotas FI/FS/TD/F/FD en módulos v3 y conserva validez sin ellas', () => {
    registrarCatalogoDiseno([plantillaSintetica('2OFI'), plantillaSintetica('1FS'), plantillaSintetica('2O+1OFI')])
    const base = { ...crearConfiguracionCerramiento(plantillaDiseno('2OFI')!), version: 3 as const }
    const conFi = { ...base, modulos: [{ ...base.modulos[0], cotas: { FI: 300 } }] }
    const conFs = { ...base, modulos: [{ ...base.modulos[0], estructuraCodigo: '1FS', cotas: { FS: 400 } }] }
    const conTd = { ...base, modulos: [{ ...base.modulos[0], estructuraCodigo: '2O+1OFI', anchoMm: 2000, cotas: { FI: 300, TD: 700 } }] }
    expect(esConfiguracionCerramiento(base)).toBe(true)
    expect(esConfiguracionCerramiento(conFi)).toBe(true)
    expect(esConfiguracionCerramiento(conFs)).toBe(true)
    expect(esConfiguracionCerramiento(conTd)).toBe(true)
    expect(cotasEfectivasModulo(base.modulos[0])).toBeNull()
    expect(cotasEfectivasModulo(conFi.modulos[0])).toEqual({ FI: 300 })
    expect(cotasEfectivasModulo(conFs.modulos[0])).toEqual({ FS: 400 })
    expect(cotasEfectivasModulo(conTd.modulos[0])).toEqual({ FI: 300, TD: 700 })
  })

  it('expone fiMm de 1OFI como cota FI y limpia cotas al cambiar de estructura', () => {
    const base = { ...crearConfiguracionCerramiento(plantillaDiseno('1OFI')!), version: 3 as const }
    const conFiMm = { ...base.modulos[0], fiMm: 350 }
    expect(cotasEfectivasModulo(conFiMm)).toEqual({ FI: 350 })
    const conCotas = { ...base, modulos: [{ ...base.modulos[0], cotas: { FI: 300, FS: 300 } }] }
    const cambiada = cambiarEstructuraModuloCerramiento(conCotas, base.modulos[0].id, plantillaDiseno('2O')!)
    expect(cambiada.modulos[0].cotas).toBeUndefined()
  })

  it.each([1, 2] as const)('rechaza cotas de módulo en snapshots v%s para preservar compatibilidad', version => {
    const base = crearConfiguracionCerramiento(plantillaDiseno('1OFI')!)
    const modulo = { ...base.modulos[0], ...(version === 2 ? { fiMm: 400 } : {}), cotas: { FI: 400 } }
    expect(esConfiguracionCerramiento({ ...base, version, modulos: [modulo] })).toBe(false)
  })

  it.each([
    {},
    { FI: 0 },
    { FI: -10 },
    { FI: 1200 },
    { FS: 1500 },
    { TD: 1200 },
    { FI: Number.NaN },
    { CAJ: 155 },
  ])('rechaza cotas inválidas o fuera de rango: %o', cotas => {
    const base = { ...crearConfiguracionCerramiento(plantillaDiseno('0')!), version: 3 as const }
    expect(esConfiguracionCerramiento({ ...base,
      modulos: [{ ...base.modulos[0], anchoMm: 1200, altoMm: 1200, cotas: cotas as never }] })).toBe(false)
  })
})
