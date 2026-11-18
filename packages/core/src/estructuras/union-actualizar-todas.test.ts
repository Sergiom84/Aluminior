/**
 * «Actualizar todas las uniones» del panel de unión de Productor.
 *
 * Observado (fase-4/01, 26–27/09/2026): tras pulsarlo, todas las juntas pasan
 * al código elegido y su grosor de catálogo. El panel de unión ofrece código,
 * `Acabado`/`Acabado2`, longitud y tipo; no tiene serie. Hipótesis adoptada:
 * se copian el código y los dos acabados, y cada unión conserva su longitud,
 * que es la de su propio lado.
 */
import { describe, expect, it } from 'vitest'
import { plantillaDiseno } from './diseno.ts'
import { anadirModuloCerramiento, crearConfiguracionCerramiento, esConfiguracionCerramiento } from './cerramiento.ts'
import { composicionExplicita } from './composicion-cerramiento.ts'
import { asignarMaterialesUnion } from './materiales-cerramiento.ts'
import { actualizarTodasLasUniones } from './uniones-cerramiento.ts'

function tresModulos() {
  const p = plantillaDiseno('0')!
  const base = composicionExplicita(anadirModuloCerramiento(anadirModuloCerramiento(crearConfiguracionCerramiento(p), p), p))
  return { ...base, uniones: base.uniones.map((u, i) => ({ ...u, longitudMm: 1000 + i * 400 })) }
}

describe('actualizarTodasLasUniones', () => {
  it('copia código, grosor de catálogo y acabados; conserva longitud y serie de cada unión', () => {
    const base = tresModulos()
    const [primera, segunda] = base.uniones.map(u => u.id) as [string, string]
    const conSerie = asignarMaterialesUnion(base, segunda, { serieCodigo: 'GMC400', acabadoCodigo: 'VS' })
    const origen = asignarMaterialesUnion(
      { ...conSerie, uniones: conSerie.uniones.map(u => u.id === primera ? { ...u, codigo: 'PSU006', grosorMm: 0 } : u) },
      primera, { acabadoCodigo: 'L', acabadoAccesoriosCodigo: 'UNI' })

    const c = actualizarTodasLasUniones(origen, primera)

    expect(c.uniones.map(u => [u.codigo, u.grosorMm, u.longitudMm])).toEqual([['PSU006', 0, 1000], ['PSU006', 0, 1400]])
    expect(c.uniones[1]!.materiales).toEqual({ serieCodigo: 'GMC400', acabadoCodigo: 'L', acabadoAccesoriosCodigo: 'UNI' })
    expect(esConfiguracionCerramiento(c)).toBe(true)
  })

  it('el grosor sale del catálogo del código copiado, no de la unión origen', () => {
    const base = tresModulos()
    const primera = base.uniones[0]!.id
    const origen = { ...base, uniones: base.uniones.map(u =>
      u.id === primera ? { ...u, codigo: 'GMU038', grosorMm: 7 } : { ...u, codigo: 'PSU001', grosorMm: 2 }) }
    expect(actualizarTodasLasUniones(origen, primera).uniones[1]).toMatchObject({ codigo: 'GMU038', grosorMm: 60 })
  })

  it('origen sin acabado propio deja a las demás «según línea» sin tocar su serie', () => {
    const base = tresModulos()
    const [primera, segunda] = base.uniones.map(u => u.id) as [string, string]
    const otra = asignarMaterialesUnion(base, segunda, { acabadoCodigo: 'L' })
    expect(actualizarTodasLasUniones(otra, primera).uniones[1]).not.toHaveProperty('materiales')
    const conSerie = asignarMaterialesUnion(otra, segunda, { serieCodigo: 'GMC400' })
    expect(actualizarTodasLasUniones(conSerie, primera).uniones[1]!.materiales).toEqual({ serieCodigo: 'GMC400' })
  })

  it('una unión que no existe no cambia nada', () => {
    const base = tresModulos()
    expect(actualizarTodasLasUniones(base, 'no-existe')).toBe(base)
  })
})
