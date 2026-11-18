import { describe, expect, it } from 'vitest'
import { agruparPorCausa, causasDeAviso } from './diagnostico-valoraciones.mjs'

// Avisos reales guardados en Render el 18/11/2026 (presupuestos 260001 y 260005).
const C2FI = 'MODULO modulo-1: Importe incompleto: GM487 (FH): pieza 7: perfil adicional pendiente de resolver; GM492 (FH): pieza 8: perfil adicional pendiente de resolver; GM487: sin largo; GM492: sin largo.; MODULO modulo-1: Faltan costes o materiales necesarios para este origen'
const MIRADOR = 'MODULO modulo-1: Valorado con avisos: vidrio de 28 mm por encima del rango de doble acristalamiento de la serie.; UNION union-1: Importe incompleto: PSESQCOM: sin PVP en la tarifa.; UNION union-3: Importe incompleto: PSESQCOM: sin PVP en la tarifa.'

describe('diagnóstico de valoraciones', () => {
  it('parte el aviso en causas sin origen ni números', () => {
    const c = causasDeAviso(C2FI)
    expect(c).toContain('GM487 (FH): pieza N: perfil adicional pendiente de resolver')
    expect(c).toContain('GM492: sin largo')
    expect(c).toContain('Faltan costes o materiales necesarios para este origen')
    expect(causasDeAviso(MIRADOR)).toContain('PSESQCOM: sin PVP en la tarifa')
    expect(causasDeAviso(null)).toEqual([])
  })
  it('agrupa solo líneas sin precio o con piezas a 0 €', () => {
    const grupos = agruparPorCausa([
      { numero: 260001, orden: 1, completa: true, aviso: 'MODULO modulo-1: Valorado con avisos: vidrio de 28 mm por encima del rango de doble acristalamiento de la serie.' },
      { numero: 260001, orden: 2, completa: false, aviso: C2FI },
      { numero: 260005, orden: 1, completa: false, aviso: MIRADOR },
      { numero: 260004, orden: 16, completa: false, aviso: null },
      { numero: 260008, orden: 1, completa: true,
        aviso: 'UNION union-1: Valorado con avisos: sin PVP en su acabado, valorado a 0 € como en Productor: PSESQCOM en VS' },
    ])
    expect(grupos.find(g => g.causa === 'PSESQCOM: sin PVP en la tarifa')?.lineas).toEqual(['260005/1'])
    expect(grupos.find(g => g.causa === 'sin aviso guardado')?.lineas).toEqual(['260004/16'])
    expect(grupos.filter(g => g.estado === 'A_CERO').map(g => g.lineas)).toEqual([['260008/1']])
    expect(grupos.flatMap(g => g.lineas)).not.toContain('260001/1')
    // El aviso del vidrio sale también en una línea completa: no explica el mirador.
    expect(grupos.find(g => g.causa.startsWith('vidrio de N mm'))).toBeUndefined()
  })
})
