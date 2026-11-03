/**
 * Serie propia de la unión (E2). Los GRUPO históricos de EMP0016 unen módulos
 * con una unión cuya serie no es la del primer módulo; la configuración debe
 * poder guardarla sin convertirla en «sin unión» ni en la serie general.
 */
import { describe, expect, it } from 'vitest'
import { plantillaDiseno } from './diseno.ts'
import {
  anadirModuloCerramiento, crearConfiguracionCerramiento, esConfiguracionCerramiento,
} from './cerramiento.ts'
import { composicionExplicita } from './composicion-cerramiento.ts'
import { materialesEfectivos, materialesUnionValidos } from './materiales-cerramiento.ts'

const generales = { serieCodigo: 'GMA350', vidrioCodigo: 'VCG4' }

function dosModulosV3() {
  return composicionExplicita(
    anadirModuloCerramiento(crearConfiguracionCerramiento(plantillaDiseno('C2')!), plantillaDiseno('C2')!),
  )
}

function conSerieDeUnion(serieCodigo: string) {
  const base = dosModulosV3()
  return { ...base, uniones: base.uniones.map((union) => ({ ...union, materiales: { serieCodigo } })) }
}

describe('serie propia de la unión', () => {
  it('admite la serie de la unión en v3 y la conserva como excepción', () => {
    const configuracion = conSerieDeUnion('GMC400')
    expect(configuracion.version).toBe(3)
    expect(esConfiguracionCerramiento(configuracion)).toBe(true)
    expect(materialesEfectivos(configuracion.uniones[0], generales).serieCodigo)
      .toEqual({ valor: 'GMC400', origen: 'elemento' })
  })

  it('sin serie propia la unión sigue heredando la general', () => {
    const configuracion = dosModulosV3()
    expect(configuracion.uniones[0]).not.toHaveProperty('materiales')
    expect(materialesEfectivos(configuracion.uniones[0], generales).serieCodigo)
      .toEqual({ valor: 'GMA350', origen: 'general' })
  })

  it('rechaza materiales de unión en una configuración de cadena histórica', () => {
    const cadena = anadirModuloCerramiento(
      crearConfiguracionCerramiento(plantillaDiseno('C2')!), plantillaDiseno('C2')!)
    expect(cadena.version).toBe(1)
    expect(esConfiguracionCerramiento({
      ...cadena, uniones: [{ ...cadena.uniones[0], materiales: { serieCodigo: 'GMC400' } }],
    })).toBe(false)
  })

  it('rechaza campos que la unión no tiene y valores sin normalizar', () => {
    expect(materialesUnionValidos(undefined)).toBe(true)
    expect(materialesUnionValidos({ serieCodigo: 'GMC400' })).toBe(true)
    expect(materialesUnionValidos({})).toBe(false)
    expect(materialesUnionValidos({ serieCodigo: 'gmc400' })).toBe(false)
    expect(materialesUnionValidos({ serieCodigo: ' ' })).toBe(false)
    expect(materialesUnionValidos({ vidrioCodigo: 'VCG4' })).toBe(false)
    expect(esConfiguracionCerramiento({
      ...dosModulosV3(),
      uniones: [{ ...dosModulosV3().uniones[0], materiales: { vidrioCodigo: 'VCG4' } }],
    })).toBe(false)
  })
})
