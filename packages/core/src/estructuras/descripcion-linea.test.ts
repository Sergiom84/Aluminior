import { describe, expect, it } from 'vitest'
import { descripcionLineaEstructura } from './descripcion-linea.ts'
import { plantillaDiseno } from './diseno.ts'

describe('descripción de línea de estructura', () => {
  it('compone medidas, color, serie y cristal como en el editor de Productor', () => {
    const plantilla = plantillaDiseno('2O')!
    expect(descripcionLineaEstructura({
      plantilla,
      anchoMm: 1200,
      altoMm: 1500,
      serie: 'ELEGANTPVC',
      vidrio: 'V420AGS4',
      acabado: 'L. BLANCO',
      varianteAcristalamiento: '2',
    })).toBe(
      'VENTANA ABATIBLE DE DOS HOJAS, UNA OSCILOBATIENTE DE MEDIDAS: 1200 x 1500 '
      + 'EN COLOR L. BLANCO PERFILERÍA: ELEGANTPVC CRISTAL: DOBLE ACRISTALAMIENTO V420AGS4',
    )
  })

  it('omite lo que el operador todavía no ha elegido', () => {
    const plantilla = plantillaDiseno('0')!
    expect(descripcionLineaEstructura({
      plantilla, anchoMm: 800, altoMm: 800,
    })).toBe('FIJO DE 1 HUECO DE MEDIDAS: 800 x 800')
  })
})
