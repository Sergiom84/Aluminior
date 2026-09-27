import { describe, expect, it } from 'vitest'
import { crearConfiguracionCerramiento, esConfiguracionCerramiento } from './cerramiento.ts'
import { plantillaDiseno } from './diseno.ts'
import { distribuirModuloCerramiento } from './geometria-modulo-cerramiento.ts'

describe('cotas de catálogo en módulos persistibles', () => {
  it.each([['C2FI', 300], ['C2FS', 300], ['C2FSFI', 600]] as const)(
    '%s rechaza la frontera %s y acepta un milímetro adicional', (codigo, frontera) => {
      const config = crearConfiguracionCerramiento(plantillaDiseno(codigo)!)
      expect(esConfiguracionCerramiento(config)).toBe(true)
      for (const altoMm of [0, NaN, Infinity, frontera - 1, frontera]) {
        const imposible = { ...config, modulos: [{ ...config.modulos[0], altoMm }] }
        expect(esConfiguracionCerramiento(imposible)).toBe(false)
        expect(distribuirModuloCerramiento(imposible.modulos[0],
          { x: 0, y: 0, ancho: 120, alto: 180 })).toEqual([])
      }
      expect(esConfiguracionCerramiento({ ...config,
        modulos: [{ ...config.modulos[0], altoMm: frontera + 1 }] })).toBe(true)
    })

  it.each(['C2FI', 'C2FS', 'C2FSFI'])('%s no admite una FI editable inyectada', codigo => {
    const config = crearConfiguracionCerramiento(plantillaDiseno(codigo)!)
    expect(esConfiguracionCerramiento({ ...config, version: 2,
      modulos: [{ ...config.modulos[0], fiMm: 350 }] })).toBe(false)
  })

  it.each(['C2FI', 'C2FS', 'C2FSFI'])('%s mantiene los 300 mm a alto 1800, incluso tras serializar', codigo => {
    const config = crearConfiguracionCerramiento(plantillaDiseno(codigo)!)
    const persistido = JSON.parse(JSON.stringify({ ...config,
      modulos: [{ ...config.modulos[0], anchoMm: 1600, altoMm: 1800 }] }))
    expect(esConfiguracionCerramiento(persistido)).toBe(true)
    const elementos = distribuirModuloCerramiento(persistido.modulos[0],
      { x: 7, y: 19, ancho: 320, alto: 360 }, 18)
    const ejes = elementos.filter(e => e.tipo === 'separador' && e.eje === 'horizontal')
      .map(e => (e.y + e.alto / 2 - 19) * 5).sort((a, b) => a - b)
    expect(ejes).toEqual(codigo === 'C2FI' ? [1500] : codigo === 'C2FS' ? [300] : [300, 1500])
  })
})
