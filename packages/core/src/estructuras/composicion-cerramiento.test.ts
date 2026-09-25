import { describe, expect, it } from 'vitest'
import { plantillaDiseno } from './diseno.ts'
import {
  actualizarModuloCerramiento, anadirModuloCerramiento, crearConfiguracionCerramiento,
  eliminarModuloCerramiento, esConfiguracionCerramiento, medidasCerramiento, moduloDesdePlantilla,
  type ConfiguracionCerramiento,
} from './cerramiento.ts'
import {
  anclajeLibreMasProximo, anclajesLibresCerramiento, composicionExplicita, dependientesModulo,
  insertarModuloEnAnclaje, posicionesCerramiento, UNION_SIN_CONFIGURAR,
} from './composicion-cerramiento.ts'
import { geometriaCerramiento } from './geometria-cerramiento.ts'

const nuevo = (codigo: string) => moduloDesdePlantilla(plantillaDiseno(codigo)!)
const libres = (configuracion: ConfiguracionCerramiento) =>
  anclajesLibresCerramiento(configuracion).map((a) => `${a.moduloId}:${a.lado}`)

/** Secuencia observada en Productor 0017 el 25/09/2026. */
function casoObservado() {
  const inicial = crearConfiguracionCerramiento(plantillaDiseno('2')!)
  const abajo = insertarModuloEnAnclaje(inicial, { ...nuevo('1OD'), anchoMm: 800 },
    { moduloId: 'modulo-1', lado: 'abajo' })
  return insertarModuloEnAnclaje(abajo, { ...nuevo('1OD'), anchoMm: 800 },
    { moduloId: 'modulo-2', lado: 'derecha' })
}

describe('composición bidimensional', () => {
  it('ofrece la esquina superior derecha y la inferior izquierda de un elemento', () => {
    const inicial = crearConfiguracionCerramiento(plantillaDiseno('2')!)
    expect(anclajesLibresCerramiento(inicial)).toEqual([
      { moduloId: 'modulo-1', lado: 'derecha', x: 1200, y: 0 },
      { moduloId: 'modulo-1', lado: 'abajo', x: 0, y: 1200 },
    ])
  })

  it('reproduce los globales observados 1200 × 2420 y 1620 × 2420', () => {
    const inicial = crearConfiguracionCerramiento(plantillaDiseno('2')!)
    const abajo = insertarModuloEnAnclaje(inicial, { ...nuevo('1OD'), anchoMm: 800 },
      { moduloId: 'modulo-1', lado: 'abajo' })
    expect(medidasCerramiento(abajo)).toEqual({ anchoMm: 1200, altoMm: 2420 })
    expect(abajo.uniones[0]).toEqual({ id: 'union-1', codigo: '', grosorMm: 20, longitudMm: 1200 })

    const final = casoObservado()
    expect(medidasCerramiento(final)).toEqual({ anchoMm: 1620, altoMm: 2420 })
    expect(final.version).toBe(3)
    expect(esConfiguracionCerramiento(final)).toBe(true)
    expect(posicionesCerramiento(final).modulos.get('modulo-3')).toEqual({ x: 820, y: 1220, ancho: 800, alto: 1200 })
  })

  it('deja de ofrecer los anclajes usados y no crea uniones con otros vecinos', () => {
    const final = casoObservado()
    expect(libres(final)).toEqual(['modulo-1:derecha', 'modulo-2:abajo', 'modulo-3:derecha', 'modulo-3:abajo'])
    expect(final.uniones).toHaveLength(2)
  })

  it('omite el anclaje cubierto por otro elemento y rechaza inserciones que solapan', () => {
    const final = casoObservado()
    const derecha = insertarModuloEnAnclaje(final, nuevo('2'), { moduloId: 'modulo-1', lado: 'derecha' })
    expect(libres(derecha)).not.toContain('modulo-4:abajo')
    const base = casoObservado()
    // A la derecha de 0 con 3000 de alto invadiría el elemento 3 (x 820–1620, y 1220–2420).
    expect(insertarModuloEnAnclaje(base, { ...nuevo('2'), altoMm: 3000 },
      { moduloId: 'modulo-1', lado: 'derecha' })).toBe(base)
    expect(insertarModuloEnAnclaje(base, { ...nuevo('2'), anchoMm: 3000 },
      { moduloId: 'modulo-3', lado: 'derecha' }).modulos).toHaveLength(4)
  })

  it('rechaza un anclaje ocupado o inexistente sin cambiar nada', () => {
    const final = casoObservado()
    expect(insertarModuloEnAnclaje(final, nuevo('0'), { moduloId: 'modulo-1', lado: 'abajo' })).toBe(final)
    expect(insertarModuloEnAnclaje(final, nuevo('0'), { moduloId: 'modulo-9', lado: 'derecha' })).toBe(final)
  })

  it('ajusta al anclaje libre más próximo solo dentro del radio', () => {
    const final = casoObservado()
    expect(anclajeLibreMasProximo(final, { x: 1180, y: 30 }, 300)?.moduloId).toBe('modulo-1')
    expect(anclajeLibreMasProximo(final, { x: 5000, y: 5000 }, 300)).toBeNull()
  })

  it('dibuja la unión inferior horizontal y la lateral vertical', () => {
    const geometria = geometriaCerramiento(casoObservado())
    expect(geometria.uniones.map((u) => u.rect)).toEqual([
      { x: 0, y: 1200, ancho: 1200, alto: 20 },
      { x: 800, y: 1220, ancho: 20, alto: 1200 },
    ])
  })

  it('elimina un elemento con sus dependientes y conserva el primero', () => {
    const final = casoObservado()
    expect(dependientesModulo(final, 'modulo-2')).toEqual(['modulo-3'])
    const reducido = eliminarModuloCerramiento(final, 'modulo-2')
    expect(reducido.modulos.map((m) => m.id)).toEqual(['modulo-1'])
    expect(reducido.uniones).toEqual([])
    expect(eliminarModuloCerramiento(final, 'modulo-1')).toBe(final)
    expect(esConfiguracionCerramiento(reducido)).toBe(true)
  })

  it('convierte una cadena histórica sin mover nada', () => {
    const cadena = anadirModuloCerramiento(crearConfiguracionCerramiento(plantillaDiseno('2O')!),
      plantillaDiseno('0')!)
    const explicita = composicionExplicita(cadena)
    expect(explicita.version).toBe(3)
    expect(explicita.modulos[1].anclaje).toEqual({ moduloId: 'modulo-1', lado: 'derecha', unionId: 'union-1' })
    expect(geometriaCerramiento(explicita).modulos).toEqual(geometriaCerramiento(cadena).modulos)
    expect(esConfiguracionCerramiento(explicita)).toBe(true)
  })

  it('sincroniza la longitud de una unión inferior al igualar anchos', () => {
    const final = casoObservado()
    const igual = actualizarModuloCerramiento(final, 'modulo-2', { anchoMm: 1200 })
    expect(igual.uniones[0].longitudMm).toBe(1200)
    const distinto = actualizarModuloCerramiento(final, 'modulo-1', { anchoMm: 1000 })
    expect(distinto.uniones[0].longitudMm).toBe(1200)
  })

  it('rechaza anclajes incoherentes en v3 y anclajes en versiones de cadena', () => {
    const final = casoObservado()
    const repetido = { ...final, modulos: final.modulos.map((m, i) => i === 2
      ? { ...m, anclaje: { ...m.anclaje!, moduloId: 'modulo-1', lado: 'abajo' as const } } : m) }
    expect(esConfiguracionCerramiento(repetido)).toBe(false)
    const haciaDelante = { ...final, modulos: [final.modulos[0], final.modulos[2], final.modulos[1]] }
    expect(esConfiguracionCerramiento(haciaDelante)).toBe(false)
    expect(esConfiguracionCerramiento({ ...final, version: 1 })).toBe(false)
  })

  it('acepta la unión sin configurar pero no un código fuera de catálogo', () => {
    const final = casoObservado()
    expect(final.uniones.every((u) => u.codigo === UNION_SIN_CONFIGURAR.codigo)).toBe(true)
    const invalida = { ...final, uniones: final.uniones.map((u) => ({ ...u, codigo: 'XX999' })) }
    expect(esConfiguracionCerramiento(invalida)).toBe(false)
  })
})
