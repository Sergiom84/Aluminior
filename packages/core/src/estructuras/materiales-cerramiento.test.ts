import { describe, expect, it } from 'vitest'
import { plantillaDiseno } from './diseno.ts'
import {
  crearConfiguracionCerramiento, esConfiguracionCerramiento, moduloDesdePlantilla,
} from './cerramiento.ts'
import { insertarModuloEnAnclaje } from './composicion-cerramiento.ts'
import { asignarMaterialesModulos, materialesEfectivos, modelosIguales } from './materiales-cerramiento.ts'

/** A1 y A2 iguales (2O), B1 distinto (0), como en el plan de fase 4. */
function a1a2b1() {
  const nuevo = (codigo: string) => moduloDesdePlantilla(plantillaDiseno(codigo)!)
  let c = crearConfiguracionCerramiento(plantillaDiseno('2O')!)
  c = insertarModuloEnAnclaje(c, nuevo('2O'), { moduloId: 'modulo-1', lado: 'derecha' })
  return insertarModuloEnAnclaje(c, nuevo('0'), { moduloId: 'modulo-2', lado: 'derecha' })
}
const generales = { serieCodigo: 'ELEGANTPVC', vidrioCodigo: 'V420AGS4' }
const serie = (c: ReturnType<typeof a1a2b1>, id: string) =>
  materialesEfectivos(c.modulos.find((m) => m.id === id)!, generales).serieCodigo

describe('materiales por elemento', () => {
  it('sin excepciones todos heredan el general', () => {
    const c = a1a2b1()
    expect(c.modulos.map((m) => serie(c, m.id))).toEqual(Array(3).fill({ valor: 'ELEGANTPVC', origen: 'general' }))
  })

  it('el cambio individual solo afecta a A1', () => {
    const c = asignarMaterialesModulos(a1a2b1(), ['modulo-1'], { serieCodigo: 'gma350' })
    expect(serie(c, 'modulo-1')).toEqual({ valor: 'GMA350', origen: 'elemento' })
    expect(serie(c, 'modulo-2').origen).toBe('general')
    expect(serie(c, 'modulo-3').origen).toBe('general')
    expect(esConfiguracionCerramiento(c)).toBe(true)
  })

  it('los modelos iguales son exactamente los de la misma estructura', () => {
    const c = a1a2b1()
    expect(modelosIguales(c, 'modulo-1')).toEqual(['modulo-1', 'modulo-2'])
    expect(modelosIguales(c, 'modulo-3')).toEqual(['modulo-3'])
    const colectivo = asignarMaterialesModulos(c, modelosIguales(c, 'modulo-1'), { vidrioCodigo: 'PAN16' })
    expect(colectivo.modulos.map((m) => m.materiales?.vidrioCodigo)).toEqual(['PAN16', 'PAN16', undefined])
  })

  it('la excepción sobrevive a un cambio del general y null vuelve a heredar', () => {
    const c = asignarMaterialesModulos(a1a2b1(), ['modulo-2'], { vidrioCodigo: 'PAN16' })
    const otroGeneral = { ...generales, vidrioCodigo: 'V6' }
    expect(materialesEfectivos(c.modulos[1], otroGeneral).vidrioCodigo.valor).toBe('PAN16')
    expect(materialesEfectivos(c.modulos[0], otroGeneral).vidrioCodigo.valor).toBe('V6')
    const generico = asignarMaterialesModulos(c, ['modulo-2'], { vidrioCodigo: null })
    expect(generico.modulos[1]).not.toHaveProperty('materiales')
  })

  it('convierte una cadena histórica a v3 y rechaza materiales en v1', () => {
    const cadena = crearConfiguracionCerramiento(plantillaDiseno('2O')!)
    const c = asignarMaterialesModulos(cadena, ['modulo-1'], { serieCodigo: 'GMA350' })
    expect(c.version).toBe(3)
    expect(esConfiguracionCerramiento({ ...cadena, modulos: [{ ...cadena.modulos[0], materiales: { serieCodigo: 'X' } }] }))
      .toBe(false)
    expect(esConfiguracionCerramiento({ ...c, modulos: [{ ...c.modulos[0], materiales: { acabado: 'L' } }] }))
      .toBe(false)
  })
})
