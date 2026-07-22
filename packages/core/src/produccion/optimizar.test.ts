/**
 * Pruebas del optimizador de corte 1D (anexo T.64).
 *
 * Lo que protegen: (1) que el reparto sea correcto y conservador con el
 * material; (2) que un corte imposible se reporte en vez de recortarse en
 * silencio; (3) que el kerf se descuente de verdad; (4) que las entradas
 * inválidas fallen ruidosamente, no produzcan un plan silenciosamente malo.
 *
 * Datos SINTÉTICOS: Supabase está a 0 presupuestos, así que el optimizador se
 * ejercita aquí con longitudes inventadas pero verificables a mano.
 */
import { describe, it, expect } from 'vitest'
import { optimizarCorte, LONGITUD_BARRA_POR_DEFECTO_MM } from './optimizar.ts'

describe('optimizarCorte — reparto básico', () => {
  it('llena una barra justa sin sobrante ni desperdicio', () => {
    // 3 cortes de 2000 en barra de 6000 → 1 barra exacta.
    const plan = optimizarCorte([{ longitud: 2000, cantidad: 3 }], { longitudBarra: 6000 })
    expect(plan.nBarras).toBe(1)
    expect(plan.barras[0].sobrante).toBe(0)
    expect(plan.desperdicioTotal).toBe(0)
    expect(plan.porcentajeDesperdicio).toBe(0)
    expect(plan.totalUtil).toBe(6000)
    expect(plan.barras[0].cortes).toHaveLength(3)
  })

  it('deja sobrante y abre segunda barra cuando no cabe todo', () => {
    // 3 cortes de 2500 en barra de 6000: barra1 = 2500+2500 (sobra 1000),
    // barra2 = 2500 (sobra 3500).
    const plan = optimizarCorte([{ longitud: 2500, cantidad: 3 }], { longitudBarra: 6000 })
    expect(plan.nBarras).toBe(2)
    expect(plan.barras[0].cortes).toHaveLength(2)
    expect(plan.barras[0].sobrante).toBe(1000)
    expect(plan.barras[1].cortes).toHaveLength(1)
    expect(plan.barras[1].sobrante).toBe(3500)
    // desperdicio = 2*6000 - 7500 = 4500 → 37.5%
    expect(plan.desperdicioTotal).toBe(4500)
    expect(plan.porcentajeDesperdicio).toBe(37.5)
  })

  it('FFD mete las piezas grandes primero y aprovecha los huecos', () => {
    // Barra 6000. Cortes: 4000×1, 3000×1, 2000×1, 1000×1 (total 10000).
    // FFD: 4000 → b1; 3000 → b1 (7000>6000? no) → b2; 2000 → b1 (6000 ok);
    // 1000 → b2 (4000 ok). Resultado: 2 barras.
    const plan = optimizarCorte(
      [
        { longitud: 1000, cantidad: 1 },
        { longitud: 4000, cantidad: 1 },
        { longitud: 2000, cantidad: 1 },
        { longitud: 3000, cantidad: 1 },
      ],
      { longitudBarra: 6000 },
    )
    expect(plan.nBarras).toBe(2)
    expect(plan.barras[0].cortes.map((c) => c.longitud)).toEqual([4000, 2000])
    expect(plan.barras[1].cortes.map((c) => c.longitud)).toEqual([3000, 1000])
    expect(plan.barras[0].sobrante).toBe(0)
    expect(plan.barras[1].sobrante).toBe(2000)
  })

  it('arrastra la etiqueta ref sin interpretarla', () => {
    const plan = optimizarCorte(
      [{ longitud: 1500, cantidad: 2, ref: '45°/45°' }],
      { longitudBarra: 6000 },
    )
    expect(plan.barras[0].cortes[0].ref).toBe('45°/45°')
  })
})

describe('optimizarCorte — cortes imposibles', () => {
  it('un corte más largo que la barra se reporta, no se recorta', () => {
    const plan = optimizarCorte(
      [{ longitud: 7000, cantidad: 2 }, { longitud: 1000, cantidad: 1 }],
      { longitudBarra: 6000 },
    )
    // El de 1000 sí se coloca; el de 7000 va a imposibles con su motivo.
    expect(plan.nBarras).toBe(1)
    expect(plan.imposibles).toHaveLength(1)
    expect(plan.imposibles[0]).toMatchObject({ longitud: 7000, cantidad: 2 })
    expect(plan.imposibles[0].motivo).toMatch(/supera la barra/)
    // No se inventó ningún corte de 7000: sólo el de 1000 cuenta como útil.
    expect(plan.totalUtil).toBe(1000)
  })

  it('el corte igual a la barra sin kerf sí cabe (borde exacto)', () => {
    const plan = optimizarCorte([{ longitud: 6000, cantidad: 1 }], { longitudBarra: 6000 })
    expect(plan.nBarras).toBe(1)
    expect(plan.imposibles).toHaveLength(0)
    expect(plan.barras[0].sobrante).toBe(0)
  })
})

describe('optimizarCorte — kerf (ancho de sierra)', () => {
  it('descuenta el kerf por corte y puede forzar una barra extra', () => {
    // Barra 6000, kerf 10. Cada corte de 2000 consume 2010.
    // 3 cortes → 2010*3 = 6030 > 6000: sólo 2 caben en la primera (4020,
    // sobra 1980), la tercera abre barra 2 (sobra 3990).
    const plan = optimizarCorte(
      [{ longitud: 2000, cantidad: 3 }],
      { longitudBarra: 6000, kerf: 10 },
    )
    expect(plan.nBarras).toBe(2)
    expect(plan.barras[0].cortes).toHaveLength(2)
    expect(plan.barras[0].sobrante).toBe(1980)
    expect(plan.barras[1].sobrante).toBe(3990)
    // Útil = suma de longitudes reales (sin kerf) = 6000; el kerf es desperdicio.
    expect(plan.totalUtil).toBe(6000)
    expect(plan.desperdicioTotal).toBe(6000) // 2*6000 - 6000
  })

  it('un corte que sólo excede la barra por el kerf es imposible', () => {
    const plan = optimizarCorte(
      [{ longitud: 6000, cantidad: 1 }],
      { longitudBarra: 6000, kerf: 5 },
    )
    expect(plan.imposibles).toHaveLength(1)
    expect(plan.nBarras).toBe(0)
  })
})

describe('optimizarCorte — validación de entradas (nunca un plan silenciosamente malo)', () => {
  it('rechaza longitud de barra no positiva', () => {
    expect(() => optimizarCorte([{ longitud: 1000, cantidad: 1 }], { longitudBarra: 0 }))
      .toThrow(/longitudBarra/)
  })

  it('rechaza kerf negativo', () => {
    expect(() => optimizarCorte([{ longitud: 1000, cantidad: 1 }], { longitudBarra: 6000, kerf: -1 }))
      .toThrow(/kerf/)
  })

  it('rechaza longitud de corte no positiva', () => {
    expect(() => optimizarCorte([{ longitud: 0, cantidad: 1 }], { longitudBarra: 6000 }))
      .toThrow(/longitud de corte/)
  })

  it('rechaza cantidad no entera (las piezas no se parten)', () => {
    expect(() => optimizarCorte([{ longitud: 1000, cantidad: 1.5 }], { longitudBarra: 6000 }))
      .toThrow(/cantidad/)
  })

  it('cantidad 0 no aporta piezas', () => {
    const plan = optimizarCorte([{ longitud: 1000, cantidad: 0 }], { longitudBarra: 6000 })
    expect(plan.nBarras).toBe(0)
    expect(plan.totalUtil).toBe(0)
    expect(plan.porcentajeDesperdicio).toBe(0)
  })

  it('lista vacía produce un plan vacío coherente', () => {
    const plan = optimizarCorte([], { longitudBarra: 6000 })
    expect(plan.nBarras).toBe(0)
    expect(plan.barras).toEqual([])
    expect(plan.desperdicioTotal).toBe(0)
  })

  it('expone la longitud de barra por defecto para la UI', () => {
    expect(LONGITUD_BARRA_POR_DEFECTO_MM).toBe(6000)
  })
})
