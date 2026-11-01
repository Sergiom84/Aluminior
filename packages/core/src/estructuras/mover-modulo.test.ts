import { describe, expect, it } from 'vitest'
import { plantillaDiseno } from './diseno.ts'
import { crearConfiguracionCerramiento, esConfiguracionCerramiento, medidasCerramiento, moduloDesdePlantilla,
  type ConfiguracionCerramiento } from './cerramiento.ts'
import { anclajesCerramiento, insertarModuloEnAnclaje, posicionesCerramiento } from './composicion-cerramiento.ts'
import { anclajesParaMover, moverModuloCerramiento } from './mover-modulo.ts'

const nuevo = (codigo: string) => moduloDesdePlantilla(plantillaDiseno(codigo)!)
const rect = (c: ConfiguracionCerramiento, id: string) => posicionesCerramiento(c).modulos.get(id)

/** Recorrido de las capturas de Sergio: 2O, fijo debajo, 2O a la derecha y fijo debajo de esta. */
function dosPorDos() {
  let c = crearConfiguracionCerramiento(plantillaDiseno('2O')!)
  c = insertarModuloEnAnclaje(c, nuevo('0'), { moduloId: 'modulo-1', lado: 'abajo' })
  c = insertarModuloEnAnclaje(c, nuevo('2O'), { moduloId: 'modulo-1', lado: 'derecha' })
  return insertarModuloEnAnclaje(c, nuevo('0'), { moduloId: 'modulo-3', lado: 'abajo' })
}

function movida(resultado: ReturnType<typeof moverModuloCerramiento>) {
  if (!resultado.ok) throw new Error(resultado.motivo)
  return resultado.configuracion
}

describe('recolocar un elemento en otro anclaje', () => {
  it('mueve una hoja del árbol conservando su identidad, medidas y materiales', () => {
    const base = dosPorDos()
    const c = movida(moverModuloCerramiento(base, 'modulo-4', { moduloId: 'modulo-3', lado: 'derecha' }))
    expect(rect(c, 'modulo-4')).toEqual({ x: 2440, y: 0, ancho: 1200, alto: 1200 })
    expect(c.modulos.find((m) => m.id === 'modulo-4')).toMatchObject({ estructuraCodigo: '0', anchoMm: 1200 })
    expect(c.uniones).toHaveLength(3)
    expect(esConfiguracionCerramiento(c)).toBe(true)
  })

  it('las piezas colgadas del movido se quedan fijas, re-ancladas a un vecino', () => {
    const base = dosPorDos()
    const c = movida(moverModuloCerramiento(base, 'modulo-3', { moduloId: 'modulo-2', lado: 'abajo' }))
    expect(rect(c, 'modulo-4')).toEqual(rect(base, 'modulo-4'))
    expect(rect(c, 'modulo-2')).toEqual(rect(base, 'modulo-2'))
    expect(anclajesCerramiento(c).get('modulo-4')).toMatchObject({ moduloId: 'modulo-2', lado: 'derecha' })
    expect(rect(c, 'modulo-3')).toEqual({ x: 0, y: 2440, ancho: 1200, alto: 1200 })
    expect(medidasCerramiento(c)).toEqual({ anchoMm: 2420, altoMm: 3640 })
    expect(c.uniones.every((u) => u.longitudMm > 0)).toBe(true)
    expect(esConfiguracionCerramiento(JSON.parse(JSON.stringify(c)))).toBe(true)
  })

  it('rechaza el movimiento si una pieza colgada no puede quedarse en su sitio', () => {
    let c = crearConfiguracionCerramiento(plantillaDiseno('2O')!)
    c = insertarModuloEnAnclaje(c, nuevo('0'), { moduloId: 'modulo-1', lado: 'derecha' })
    c = insertarModuloEnAnclaje(c, nuevo('0'), { moduloId: 'modulo-2', lado: 'abajo' })
    const r = moverModuloCerramiento(c, 'modulo-2', { moduloId: 'modulo-1', lado: 'abajo' })
    expect(r).toEqual({ ok: false, motivo: 'Hay elementos colgados de este que no pueden quedarse fijos en su sitio.' })
  })

  it('el primer elemento no se mueve y no se suelta sobre sí mismo ni encima de otro', () => {
    const base = dosPorDos()
    expect(moverModuloCerramiento(base, 'modulo-1', { moduloId: 'modulo-4', lado: 'derecha' }).ok).toBe(false)
    expect(moverModuloCerramiento(base, 'modulo-4', { moduloId: 'modulo-4', lado: 'derecha' }).ok).toBe(false)
    expect(moverModuloCerramiento(base, 'modulo-2', { moduloId: 'modulo-1', lado: 'derecha' }))
      .toEqual({ ok: false, motivo: 'No cabe ahí sin solapar otro elemento.' })
  })

  it('soltar en su propio anclaje no cambia nada', () => {
    const base = dosPorDos()
    expect(moverModuloCerramiento(base, 'modulo-4', { moduloId: 'modulo-3', lado: 'abajo' }))
      .toEqual({ ok: true, configuracion: base })
  })
})

describe('anclajes para mover', () => {
  it('ofrece solo destinos válidos distintos del actual, en coordenadas del conjunto', () => {
    const base = dosPorDos()
    const destinos = anclajesParaMover(base, 'modulo-4')
    expect(destinos.length).toBeGreaterThan(0)
    expect(destinos.some((a) => a.moduloId === 'modulo-3' && a.lado === 'abajo')).toBe(false)
    expect(destinos).toContainEqual({ moduloId: 'modulo-3', lado: 'derecha', x: 2420, y: 0 })
    expect(destinos.every((a) => moverModuloCerramiento(base, 'modulo-4', a).ok)).toBe(true)
    expect(anclajesParaMover(base, 'modulo-1')).toEqual([])
  })
})
