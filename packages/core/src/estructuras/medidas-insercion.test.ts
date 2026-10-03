import { it, expect } from 'vitest'
import { crearConfiguracionCerramiento, plantillaDiseno, actualizarModuloCerramiento,
  decidirMedidasInsercion, medidasPrimeraVentana, insertarModuloEnAnclaje, moduloDesdePlantilla } from './index.ts'

const base = () => crearConfiguracionCerramiento(plantillaDiseno('2O')!)
it('la primera inserción usa el modelo; sin modificar no pregunta', () => {
  for (const p of ['PREGUNTAR', 'COPIAR_PRIMERA', 'MODELO'] as const) {
    expect(decidirMedidasInsercion(null, p)).toBe('MODELO')
  }
  expect(decidirMedidasInsercion(base(), 'PREGUNTAR')).toBe('MODELO')
})
it('pregunta tras modificar ancho o alto, y respeta ambas preferencias persistidas', () => {
  for (const cambios of [{ anchoMm: 800 }, { altoMm: 1800 }]) {
    const c = actualizarModuloCerramiento(base(), 'modulo-1', cambios)
    expect(decidirMedidasInsercion(c, 'PREGUNTAR')).toBe('PREGUNTAR')
    expect(decidirMedidasInsercion(c, 'COPIAR_PRIMERA')).toBe('COPIAR')
    expect(decidirMedidasInsercion(c, 'MODELO')).toBe('MODELO')
  }
})
it('usa la referencia actual incluso tras añadir a la izquierda; la edición no propaga cambios', () => {
  const original = actualizarModuloCerramiento(base(), 'modulo-1', { anchoMm: 800, altoMm: 1500 })
  const compuesto = insertarModuloEnAnclaje(original, moduloDesdePlantilla(plantillaDiseno('0')!),
    { moduloId: 'modulo-1', lado: 'izquierda' })
  const cambiado = actualizarModuloCerramiento(compuesto, 'modulo-1', { anchoMm: 950, altoMm: 1700 })
  expect(medidasPrimeraVentana(cambiado)).toEqual({ anchoMm: 950, altoMm: 1700 })
  expect(cambiado.modulos[1]).toEqual(compuesto.modulos[1])
  expect(decidirMedidasInsercion(cambiado, 'PREGUNTAR')).toBe('PREGUNTAR')
})
