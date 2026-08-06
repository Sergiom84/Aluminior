/**
 * Pruebas del despunte como gasto calculado (G1).
 *
 * Lo que protegen: (1) que las cuatro cifras del diálogo original —material
 * necesario, barras a comprar, ML y retal— salgan de la misma cuenta y cuadren
 * entre sí; (2) que los dos modos de repercusión sean visiblemente distintos y
 * el modo elegido viaje en el resultado; (3) que un perfil sin precio NO se
 * valore a cero; (4) que el reparto entre líneas sume exactamente el total, sin
 * el céntimo perdido que deja redondear cada cuota por su cuenta.
 *
 * Datos SINTÉTICOS: longitudes y precios inventados pero comprobables a mano.
 */
import { describe, it, expect } from 'vitest'
import { repartirDecimal } from '../precios/decimal.ts'
import { optimizarCorte } from './optimizar.ts'
import {
  CONCEPTO_DESPUNTE,
  calcularDespunte,
  type OpcionesDespunte,
  type PerfilDespunte,
} from './despunte.ts'

const BARRA = { longitudBarra: 6000 }
const LINEA_APARTE: OpcionesDespunte = { modo: 'LINEA_APARTE' }

/** Un perfil listo para valorar, a partir de cortes sintéticos. */
function perfil(
  codigo: string,
  cortes: { longitud: number; cantidad: number }[],
  precioMetroLineal: string | null,
): PerfilDespunte {
  return { perfil: codigo, plan: optimizarCorte(cortes, BARRA), precioMetroLineal }
}

describe('calcularDespunte — las cuatro cifras', () => {
  it('cobra el retal de las barras que sobran del corte', () => {
    // 3 cortes de 2500 en barra de 6000 → 2 barras: 7,5 m útiles, 12 m comprados.
    // A 10 €/m: 75,00 necesario, 120,00 pedido, 45,00 de retal.
    const r = calcularDespunte([perfil('P1', [{ longitud: 2500, cantidad: 3 }], '10.00')], LINEA_APARTE)

    expect(r.perfiles).toHaveLength(1)
    expect(r.perfiles[0].mlNecesario).toBe('7.5000')
    expect(r.perfiles[0].mlBarras).toBe('12.0000')
    expect(r.perfiles[0].nBarras).toBe(2)
    expect(r.costePerfilesYCortes).toBe('75.00')
    expect(r.costeBarras).toBe('120.00')
    expect(r.mlBarras).toBe('12.0000')
    expect(r.importeDespunte).toBe('45.00')
  })

  it('no cobra nada cuando el aprovechamiento es del 100%', () => {
    // 3 cortes de 2000 llenan la barra exacta: no hay retal que facturar.
    const r = calcularDespunte([perfil('P1', [{ longitud: 2000, cantidad: 3 }], '10.00')], LINEA_APARTE)

    expect(r.perfiles[0].mlNecesario).toBe('6.0000')
    expect(r.perfiles[0].mlBarras).toBe('6.0000')
    expect(r.costePerfilesYCortes).toBe('60.00')
    expect(r.costeBarras).toBe('60.00')
    expect(r.importeDespunte).toBe('0.00')
  })

  it('con cero cortes no hay barras, ni ML, ni importe', () => {
    const r = calcularDespunte([perfil('P1', [], '10.00')], LINEA_APARTE)

    expect(r.perfiles[0].nBarras).toBe(0)
    expect(r.mlBarras).toBe('0.0000')
    expect(r.costeBarras).toBe('0.00')
    expect(r.importeDespunte).toBe('0.00')
  })

  it('sin ningún perfil, todo es cero y el resultado sigue siendo válido', () => {
    const r = calcularDespunte([], LINEA_APARTE)

    expect(r.perfiles).toHaveLength(0)
    expect(r.costePerfilesYCortes).toBe('0.00')
    expect(r.mlBarras).toBe('0.0000')
    expect(r.importeDespunte).toBe('0.00')
  })

  it('el total es la suma de las filas y la resta cuadra al céntimo', () => {
    // Precios con decimal para que el redondeo por fila sea visible.
    const r = calcularDespunte(
      [
        perfil('P1', [{ longitud: 2500, cantidad: 3 }], '3.333'),
        perfil('P2', [{ longitud: 1750, cantidad: 5 }], '7.77'),
      ],
      LINEA_APARTE,
    )
    const sumaFilas = r.perfiles.reduce((acc, p) => acc + Number(p.importeDespunte), 0)

    expect(Number(r.importeDespunte)).toBeCloseTo(sumaFilas, 10)
    expect(r.importeDespunte).toBe(
      (Number(r.costeBarras) - Number(r.costePerfilesYCortes)).toFixed(2),
    )
  })
})

describe('calcularDespunte — lo que no se puede valorar no se inventa', () => {
  it('un perfil sin precio sale como no valorable, no como coste cero', () => {
    const r = calcularDespunte(
      [
        perfil('P1', [{ longitud: 2500, cantidad: 3 }], '10.00'),
        perfil('SIN-PRECIO', [{ longitud: 2500, cantidad: 3 }], null),
      ],
      LINEA_APARTE,
    )

    expect(r.perfiles.map((p) => p.perfil)).toEqual(['P1'])
    expect(r.noValorables).toHaveLength(1)
    expect(r.noValorables[0].perfil).toBe('SIN-PRECIO')
    expect(r.noValorables[0].motivo).toContain('no tiene precio por metro lineal')
    // Se mide aunque no se valore: los ML de barra sí incluyen el perfil mudo.
    expect(r.noValorables[0].mlBarras).toBe('12.0000')
    expect(r.mlBarras).toBe('24.0000')
    // Y el importe sigue siendo sólo el del perfil que sí tiene precio.
    expect(r.importeDespunte).toBe('45.00')
  })

  it('un corte más largo que la barra viaja hasta el resultado', () => {
    const r = calcularDespunte([perfil('P1', [{ longitud: 7000, cantidad: 2 }], '10.00')], LINEA_APARTE)

    expect(r.cortesNoValorados).toHaveLength(1)
    expect(r.cortesNoValorados[0]).toMatchObject({ perfil: 'P1', longitud: 7000, cantidad: 2 })
    expect(r.cortesNoValorados[0].motivo).toContain('supera la barra')
    // No se colocó en ninguna barra, así que no se ha comprado ni cobrado nada.
    expect(r.perfiles[0].nBarras).toBe(0)
    expect(r.importeDespunte).toBe('0.00')
  })

  it('rechaza un precio negativo en vez de producir un retal negativo', () => {
    expect(() =>
      calcularDespunte([perfil('P1', [{ longitud: 2500, cantidad: 3 }], '-1.00')], LINEA_APARTE),
    ).toThrow(/negativo/)
  })
})

describe('calcularDespunte — modos de repercusión', () => {
  const perfiles = [perfil('P1', [{ longitud: 5000, cantidad: 1 }], '10.00')] // 5 m útiles, 6 m barra → 10,00 €
  const tresLineas = [
    { id: 'L1', base: '1.00' },
    { id: 'L2', base: '1.00' },
    { id: 'L3', base: '1.00' },
  ]

  it('en línea aparte el importe va entero a un concepto propio', () => {
    const r = calcularDespunte(perfiles, LINEA_APARTE)

    expect(r.importeDespunte).toBe('10.00')
    expect(r.repercusion).toEqual({
      modo: 'LINEA_APARTE',
      linea: { concepto: CONCEPTO_DESPUNTE, importe: '10.00' },
    })
  })

  it('admite un concepto propio para la línea aparte', () => {
    const r = calcularDespunte(perfiles, { modo: 'LINEA_APARTE', concepto: 'Retal color madera' })

    expect(r.repercusion).toMatchObject({ linea: { concepto: 'Retal color madera' } })
  })

  it('repartido entre líneas, la suma es exactamente el importe total', () => {
    // 10,00 entre tres partes iguales: 3,33 tres veces pierde un céntimo.
    const r = calcularDespunte(perfiles, {
      modo: 'REPARTIR_ENTRE_LINEAS', lineas: tresLineas,
    })
    if (r.repercusion.modo !== 'REPARTIR_ENTRE_LINEAS') throw new Error('modo inesperado')

    expect(r.repercusion.lineas.map((l) => l.importe)).toEqual(['3.34', '3.33', '3.33'])
    const suma = r.repercusion.lineas.reduce(
      (acc, l) => acc + Math.round(Number(l.importe) * 100), 0,
    )
    expect(suma).toBe(1000)
    expect(r.repercusion.noRepercutido).toBe('0.00')
  })

  it('reparte en proporción a la base de cada línea', () => {
    const r = calcularDespunte(perfiles, {
      modo: 'REPARTIR_ENTRE_LINEAS',
      lineas: [{ id: 'L1', base: '75.00' }, { id: 'L2', base: '25.00' }],
    })
    if (r.repercusion.modo !== 'REPARTIR_ENTRE_LINEAS') throw new Error('modo inesperado')

    expect(r.repercusion.lineas).toEqual([
      { id: 'L1', base: '75.00', importe: '7.50' },
      { id: 'L2', base: '25.00', importe: '2.50' },
    ])
  })

  it('los dos modos dan resultados distintos con los mismos datos', () => {
    const aparte = calcularDespunte(perfiles, LINEA_APARTE).repercusion
    const repartido = calcularDespunte(perfiles, {
      modo: 'REPARTIR_ENTRE_LINEAS', lineas: tresLineas,
    }).repercusion

    expect(aparte.modo).toBe('LINEA_APARTE')
    expect(repartido.modo).toBe('REPARTIR_ENTRE_LINEAS')
    expect(repartido).not.toEqual(aparte)
  })

  it('sin líneas, sin bases o con base negativa, dice que no ha repartido', () => {
    const casos: OpcionesDespunte[] = [
      { modo: 'REPARTIR_ENTRE_LINEAS' },
      { modo: 'REPARTIR_ENTRE_LINEAS', lineas: [{ id: 'L1', base: '0.00' }] },
      { modo: 'REPARTIR_ENTRE_LINEAS', lineas: [{ id: 'L1', base: '-5.00' }] },
    ]
    for (const opciones of casos) {
      const { repercusion } = calcularDespunte(perfiles, opciones)
      if (repercusion.modo !== 'REPARTIR_ENTRE_LINEAS') throw new Error('modo inesperado')
      expect(repercusion.lineas).toEqual([])
      expect(repercusion.noRepercutido).toBe('10.00')
      expect(repercusion.motivo).toBeTruthy()
    }
  })

  it('rechaza un modo desconocido en vez de elegir uno por su cuenta', () => {
    expect(() =>
      calcularDespunte(perfiles, { modo: 'OTRO' as unknown as 'LINEA_APARTE' }),
    ).toThrow(/modo de repercusión desconocido/)
  })
})

/**
 * El reparto vive en `precios/decimal.ts` porque es aritmética de dinero, no
 * despunte. Se prueba aquí por ser el único consumidor actual; si aparece un
 * segundo, estos casos se mudan a `decimal.test.ts`.
 */
describe('repartirDecimal — el último céntimo', () => {
  it('reparte los restos a las partes con mayor resto, y la suma cuadra', () => {
    expect(repartirDecimal('10.00', ['1', '1', '1'], 2)).toEqual(['3.34', '3.33', '3.33'])
    expect(repartirDecimal('0.05', ['1', '1', '1', '1'], 2))
      .toEqual(['0.02', '0.01', '0.01', '0.01'])
    expect(repartirDecimal('100.00', ['3', '1'], 2)).toEqual(['75.00', '25.00'])
  })

  it('reparte un importe negativo con el mismo criterio y signo cambiado', () => {
    expect(repartirDecimal('-10.00', ['1', '1', '1'], 2)).toEqual(['-3.34', '-3.33', '-3.33'])
  })

  it('rechaza lo que no define ninguna proporción', () => {
    expect(() => repartirDecimal('10.00', [], 2)).toThrow(/no hay partes/)
    expect(() => repartirDecimal('10.00', ['0', '0'], 2)).toThrow(/suman cero/)
    expect(() => repartirDecimal('10.00', ['1', '-1'], 2)).toThrow(/negativo/)
  })
})
