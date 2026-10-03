import { describe, it, expect } from 'vitest'
import { crearConfiguracionCerramiento, insertarModuloEnAnclaje, moduloDesdePlantilla,
  plantillaDiseno, anclajesExtremosCerramiento, posicionesCerramiento, medidasCerramiento,
  esConfiguracionCerramiento, geometriaCerramiento, actualizarModuloCerramiento,
  eliminarModuloConDependientes } from './index.ts'

const nuevo = () => moduloDesdePlantilla(plantillaDiseno('2O')!)
const inicial = () => crearConfiguracionCerramiento(plantillaDiseno('2O')!)

describe('inserción en ambos extremos', () => {
  it('conserva la primera ventana como referencia y normaliza dibujo, unión y medidas', () => {
    const base = inicial()
    const c = insertarModuloEnAnclaje(base, { ...nuevo(), anchoMm: 800 },
      { moduloId: 'modulo-1', lado: 'izquierda' })
    expect(c.modulos[0]).toEqual(base.modulos[0])
    expect(posicionesCerramiento(c).modulos.get('modulo-2')).toEqual({ x: 0, y: 0, ancho: 800, alto: 1200 })
    expect(posicionesCerramiento(c).modulos.get('modulo-1')?.x).toBe(820)
    expect(geometriaCerramiento(c).uniones[0].rect).toEqual({ x: 800, y: 0, ancho: 20, alto: 1200 })
    expect(medidasCerramiento(c)).toEqual({ anchoMm: 2020, altoMm: 1200 })
    expect(esConfiguracionCerramiento(JSON.parse(JSON.stringify(c)))).toBe(true)
    expect(anclajesExtremosCerramiento(c).map(a => [a.moduloId, a.lado])).toEqual([
      ['modulo-2', 'izquierda'], ['modulo-1', 'derecha'],
    ])
  })
  it('continúa por ambos extremos sin reordenar IDs ni alterar las medidas anteriores', () => {
    let c = inicial()
    for (const lado of ['izquierda', 'derecha', 'izquierda'] as const) {
      const destino = anclajesExtremosCerramiento(c).find(a => a.lado === lado)!
      c = insertarModuloEnAnclaje(c, nuevo(), destino)
    }
    expect(c.modulos.map(m => m.id)).toEqual(['modulo-1', 'modulo-2', 'modulo-3', 'modulo-4'])
    expect(medidasCerramiento(c).anchoMm).toBe(4860)
    expect(esConfiguracionCerramiento(c)).toBe(true)
    expect(eliminarModuloConDependientes(c, 'modulo-2').modulos.map(m => m.id)).toEqual(['modulo-1', 'modulo-3'])
  })
  it('preserva ramas verticales y evita solapamientos al añadir a la izquierda', () => {
    const base = insertarModuloEnAnclaje(inicial(), nuevo(), { moduloId: 'modulo-1', lado: 'abajo' })
    const c = insertarModuloEnAnclaje(base, { ...nuevo(), altoMm: 2500 }, { moduloId: 'modulo-1', lado: 'izquierda' })
    expect(posicionesCerramiento(c).modulos.get('modulo-2')).toEqual({ x: 1220, y: 1220, ancho: 1200, alto: 1200 })
    expect(esConfiguracionCerramiento(c)).toBe(true)
    expect(insertarModuloEnAnclaje(c, { ...nuevo(), altoMm: 2500 },
      { moduloId: 'modulo-2', lado: 'izquierda' })).toBe(c)
  })
  it('actualiza la unión izquierda al igualar altos sin tocar las otras ventanas', () => {
    const c = insertarModuloEnAnclaje(inicial(), { ...nuevo(), altoMm: 900 },
      { moduloId: 'modulo-1', lado: 'izquierda' })
    const cambiado = actualizarModuloCerramiento(c, 'modulo-1', { altoMm: 900 })
    expect(cambiado.uniones[0].longitudMm).toBe(900)
    expect(cambiado.modulos[1]).toEqual(c.modulos[1])
  })
})
