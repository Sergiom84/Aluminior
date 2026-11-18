/**
 * Acabado por elemento (módulo y unión). Productor guarda `Acabado` y
 * `Acabado2` en cada fila hija del GRUPO; en 260289 (GRUPO 406272) una unión
 * PSU006 va en L dentro de un mirador en VS. Sin acabado propio, el elemento
 * hereda el de la línea.
 */
import { describe, expect, it } from 'vitest'
import { plantillaDiseno } from './diseno.ts'
import { anadirModuloCerramiento, crearConfiguracionCerramiento, esConfiguracionCerramiento } from './cerramiento.ts'
import { composicionExplicita } from './composicion-cerramiento.ts'
import {
  asignarMaterialesModulos, asignarMaterialesUnion, materialesEfectivos, materialesModuloValidos,
  materialesUnionValidos,
} from './materiales-cerramiento.ts'
import { descripcionGrupo } from './descripcion-grupo.ts'
import { faltasParaAceptar } from './aceptacion-cerramiento.ts'

const generales = { serieCodigo: 'ELEGANTPVC', vidrioCodigo: 'V420AGS4', acabadoCodigo: 'VS', acabadoAccesoriosCodigo: 'UNI' }

function dosModulos() {
  return composicionExplicita(
    anadirModuloCerramiento(crearConfiguracionCerramiento(plantillaDiseno('0')!), plantillaDiseno('0')!))
}

describe('acabado por elemento', () => {
  it('sin acabado propio módulo y unión heredan los de la línea', () => {
    const c = dosModulos()
    for (const elemento of [...c.modulos, ...c.uniones]) {
      const efectivo = materialesEfectivos(elemento, generales)
      expect(efectivo.acabadoCodigo).toEqual({ valor: 'VS', origen: 'general' })
      expect(efectivo.acabadoAccesoriosCodigo).toEqual({ valor: 'UNI', origen: 'general' })
    }
  })

  it('sin acabado de accesorios en la línea, el elemento no inventa uno', () => {
    const c = dosModulos()
    expect(materialesEfectivos(c.modulos[0]!, { serieCodigo: null, vidrioCodigo: null }).acabadoAccesoriosCodigo)
      .toEqual({ valor: null, origen: 'general' })
  })

  it('el acabado propio de un módulo solo afecta a ese módulo y se normaliza', () => {
    const c = asignarMaterialesModulos(dosModulos(), ['modulo-2'], { acabadoCodigo: ' l ', acabadoAccesoriosCodigo: 'l' })
    expect(c.modulos[1]!.materiales).toEqual({ acabadoCodigo: 'L', acabadoAccesoriosCodigo: 'L' })
    expect(materialesEfectivos(c.modulos[1]!, generales).acabadoCodigo).toEqual({ valor: 'L', origen: 'elemento' })
    expect(materialesEfectivos(c.modulos[0]!, generales).acabadoCodigo).toEqual({ valor: 'VS', origen: 'general' })
    expect(esConfiguracionCerramiento(c)).toBe(true)
    const limpio = asignarMaterialesModulos(c, ['modulo-2'], { acabadoCodigo: null, acabadoAccesoriosCodigo: null })
    expect(limpio.modulos[1]).not.toHaveProperty('materiales')
  })

  it('la unión guarda su acabado sin perder la serie propia, y lo quita con null', () => {
    const base = dosModulos()
    const id = base.uniones[0]!.id
    const conSerie = asignarMaterialesUnion(base, id, { serieCodigo: 'GMC400' })
    const enL = asignarMaterialesUnion(conSerie, id, { acabadoCodigo: 'l' })
    expect(enL.uniones[0]!.materiales).toEqual({ serieCodigo: 'GMC400', acabadoCodigo: 'L' })
    expect(materialesEfectivos(enL.uniones[0]!, generales).acabadoCodigo).toEqual({ valor: 'L', origen: 'elemento' })
    expect(esConfiguracionCerramiento(enL)).toBe(true)
    const sinAcabado = asignarMaterialesUnion(enL, id, { acabadoCodigo: null, serieCodigo: null })
    expect(sinAcabado.uniones[0]).not.toHaveProperty('materiales')
    expect(asignarMaterialesUnion(base, 'no-existe', { acabadoCodigo: 'L' })).toBe(base)
  })

  it('valida los campos de acabado en módulo y unión, y la unión sigue sin vidrio', () => {
    expect(materialesModuloValidos({ acabadoCodigo: 'L', acabadoAccesoriosCodigo: 'UNI' })).toBe(true)
    expect(materialesModuloValidos({ acabadoCodigo: 'l' })).toBe(false)
    expect(materialesUnionValidos({ acabadoCodigo: 'L', acabadoAccesoriosCodigo: 'UNI' })).toBe(true)
    expect(materialesUnionValidos({ acabadoCodigo: ' ' })).toBe(false)
    expect(materialesUnionValidos({ vidrioCodigo: 'V4' })).toBe(false)
  })

  it('un snapshot antiguo sin campos de acabado sigue siendo válido y hereda', () => {
    const antiguo = asignarMaterialesModulos(dosModulos(), ['modulo-1'], { serieCodigo: 'GMA350' })
    expect(JSON.parse(JSON.stringify(antiguo)).modulos[0].materiales).toEqual({ serieCodigo: 'GMA350' })
    expect(esConfiguracionCerramiento(antiguo)).toBe(true)
    expect(materialesEfectivos(antiguo.modulos[0]!, generales).acabadoCodigo).toEqual({ valor: 'VS', origen: 'general' })
  })

  it('la descripción del GRUPO dice el color de cada elemento', () => {
    const c = asignarMaterialesModulos(dosModulos(), ['modulo-2'], { acabadoCodigo: 'L' })
    const texto = descripcionGrupo(c, {
      estructuras: new Map([['0', 'FIJO']]), articulos: new Map(),
      acabados: new Map([['VS', 'LACADO VARIOS ESTANDAR'], ['L', 'L. BLANCO']]),
      serieCodigo: null, vidrioCodigo: null, acabadoCodigo: 'VS',
    })
    expect(texto.split('\n').filter(l => l.startsWith('EN COLOR'))).toEqual([
      'EN COLOR LACADO VARIOS ESTANDAR', 'EN COLOR L. BLANCO'])
  })

  it('al aceptar, el acabado propio cubre la falta de acabado general', () => {
    let c = asignarMaterialesModulos(dosModulos(), ['modulo-1', 'modulo-2'], { acabadoCodigo: 'L' })
    c = { ...c, uniones: c.uniones.map(u => ({ ...u, codigo: 'U' })) }
    const sinGeneral = { serieCodigo: 'S', vidrioCodigo: 'V', acabadoCodigo: null }
    expect(faltasParaAceptar(c, sinGeneral)).toEqual([{ tipo: 'acabado-union' }])
    const unionEnL = asignarMaterialesUnion(c, c.uniones[0]!.id, { acabadoCodigo: 'L' })
    expect(faltasParaAceptar(unionEnL, sinGeneral)).toEqual([])
  })
})
