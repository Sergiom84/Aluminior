import { it, expect } from 'vitest'
import { crearConfiguracionCerramiento, plantillaDiseno, moduloDesdePlantilla, insertarModuloEnAnclaje } from '@aluminior/core/estructuras'
import { geometriaCerramientoPdf } from './geometria-cerramiento.ts'

it('el PDF conserva el orden físico de una inserción izquierda tras serializar', () => {
  const base = crearConfiguracionCerramiento(plantillaDiseno('2O')!)
  const c = insertarModuloEnAnclaje(base, { ...moduloDesdePlantilla(plantillaDiseno('0')!), anchoMm: 800 },
    { moduloId: 'modulo-1', lado: 'izquierda' })
  const dibujo = geometriaCerramientoPdf(JSON.parse(JSON.stringify(c)))
  expect(dibujo.modulos[1].rect.x).toBeLessThan(dibujo.modulos[0].rect.x)
  expect(dibujo.modulos.every(m => m.rect.x >= 8 && m.rect.x + m.rect.ancho <= 232)).toBe(true)
  expect(dibujo.medidas).toEqual({ anchoMm: 2020, altoMm: 1200 })
  expect(dibujo.uniones[0].rect.x).toBeGreaterThan(dibujo.modulos[1].rect.x)
  expect(dibujo.uniones[0].rect.x).toBeLessThan(dibujo.modulos[0].rect.x)
})
