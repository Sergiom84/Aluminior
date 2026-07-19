/**
 * El rebaje de hoja y su GUARDA (anexo T de PLAN.md).
 *
 * La hoja no mide lo que mide el hueco: encaja dentro del marco. El anexo T
 * midió que ese rebaje es constante por (perfil, eje, fórmula, serie) —64
 * reglas, 93,0% de las piezas, techo del 94,4%— y que sin él el motor emite
 * la medida del hueco como si fuera el corte: 0 de 1.003 líneas con hoja
 * salían correctas.
 *
 * Lo que estas pruebas protegen no es sólo que el rebaje se reste, sino que
 * cuando NO hay regla la pieza quede sin medida. Un corte de hoja demasiado
 * largo es una hoja que no encaja y material perdido.
 */
import { describe, it, expect } from 'vitest'
import { calcularDespiece, type ComponentePlantilla } from './calcular.ts'

const hoja = (funcion: string, formula: string): ComponentePlantilla => ({
  articuloCodigo: 'GM8783M',
  cantidad: 2,
  formulaLargo: formula,
  tipoCorte: null,
  anguloIzquierdo: null,
  anguloDerecho: null,
  funcion,
})

const marco: ComponentePlantilla = {
  articuloCodigo: 'GM1000',
  cantidad: 2,
  formulaLargo: 'L',
  tipoCorte: null,
  anguloIzquierdo: null,
  anguloDerecho: null,
  funcion: 'MV',
}

const medidas = { anchoMm: 1100, altoMm: 1140 }

/** Regla medida sin una sola excepción: no debe generar aviso. */
const exacta = (mm: number) => ({ mm, muestras: 10, totalMuestras: 10 })

describe('rebaje de hoja', () => {
  it('sin tabla de reglas el motor se comporta como antes', () => {
    const r = calcularDespiece([hoja('HV', 'L')], medidas)
    expect(r.piezas[0].largoMm).toBe(1100)
    expect(r.incalculables).toBe(0)
  })

  it('resta el rebaje cuando hay regla para esa pieza', () => {
    const r = calcularDespiece([hoja('HV', 'L')], medidas, {}, {
      serie: 'GMA60RL',
      rebajeDeHoja: () => exacta(70),
    })
    expect(r.piezas[0].largoMm).toBe(1030)
    expect(r.piezas[0].incidencia).toBeNull()
  })

  it('una regla EXACTA no genera aviso', () => {
    const r = calcularDespiece([hoja('HV', 'L')], medidas, {}, {
      rebajeDeHoja: () => exacta(70),
    })
    expect(r.piezas[0].aviso).toBeNull()
    expect(r.avisos).toEqual([])
  })

  it('una regla NO exacta valora igual, pero avisa', () => {
    const r = calcularDespiece([hoja('HV', 'L')], medidas, {}, {
      rebajeDeHoja: () => ({ mm: 70, muestras: 99, totalMuestras: 100 }),
    })
    // la medida es buena y la línea se valora...
    expect(r.piezas[0].largoMm).toBe(1030)
    expect(r.incalculables).toBe(0)
    // ...pero el riesgo queda visible, nunca en silencio
    expect(r.piezas[0].aviso).toMatch(/99\/100 = 99\.0%/)
    expect(r.avisos).toHaveLength(1)
  })

  it('los avisos de la línea no se repiten', () => {
    const r = calcularDespiece(
      [hoja('HV', 'L'), hoja('HV', 'L')],
      medidas, {},
      { rebajeDeHoja: () => ({ mm: 70, muestras: 99, totalMuestras: 100 }) },
    )
    expect(r.piezas).toHaveLength(2)
    expect(r.avisos).toHaveLength(1)
  })

  it('la clave del rebaje lleva perfil, eje, fórmula y serie', () => {
    const claves: unknown[] = []
    calcularDespiece([hoja('HV', 'L')], medidas, {}, {
      serie: 'GMA60RL',
      rebajeDeHoja: (c) => { claves.push(c); return exacta(70) },
    })
    expect(claves).toEqual([{
      articuloCodigo: 'GM8783M', funcion: 'HV', formula: 'L', serie: 'GMA60RL',
    }])
  })

  it('SIN regla deja la pieza sin medida, no la medida del hueco', () => {
    const r = calcularDespiece([hoja('HV', 'L')], medidas, {}, {
      serie: 'DESCONOCIDA',
      rebajeDeHoja: () => null,
    })
    // Lo importante: NO vale 1100. Un cero silencioso o el hueco entero
    // serían una hoja mal cortada.
    expect(r.piezas[0].largoMm).toBeNull()
    expect(r.piezas[0].incidencia).toMatch(/sin regla de rebaje/)
    expect(r.incalculables).toBe(1)
  })

  it('no toca los perfiles que no son de hoja', () => {
    const r = calcularDespiece([marco], medidas, {}, {
      serie: 'GMA60RL',
      rebajeDeHoja: () => { throw new Error('no debe consultarse para el marco') },
    })
    expect(r.piezas[0].largoMm).toBe(1100)
  })

  it('un rebaje mayor que la medida avisa en vez de cortar en negativo', () => {
    const r = calcularDespiece([hoja('HH', '(A)/2')], medidas, {}, {
      serie: 'GMA60RL',
      rebajeDeHoja: () => exacta(9999),
    })
    expect(r.piezas[0].largoMm).toBeNull()
    expect(r.piezas[0].incidencia).toMatch(/rebaje mayor que la medida/)
  })

  it('una pieza sin regla no aporta metros lineales al consumo', () => {
    const r = calcularDespiece([hoja('HV', 'L')], medidas, {}, {
      rebajeDeHoja: () => null,
    })
    expect(r.consumoPorArticulo.get('GM8783M')?.metrosLineales).toBe(0)
  })

  it('reproduce el caso real del anexo T (estructura 2O)', () => {
    // HV real 1030 (motor daba 1100), HH real 532 (motor daba 570).
    const rebajes = new Map([['HV', 70], ['HH', 38]])
    const r = calcularDespiece(
      [hoja('HV', 'L'), hoja('HH', '(A)/2')],
      { anchoMm: 1100, altoMm: 1140 },
      {},
      {
        serie: 'GMA60RL',
        rebajeDeHoja: (c) => {
          const mm = rebajes.get(c.funcion)
          return mm === undefined ? null : exacta(mm)
        },
      },
    )
    expect(r.piezas.map((p) => p.largoMm)).toEqual([1030, 532])
  })
})
