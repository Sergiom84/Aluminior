/**
 * Caracterización de la valoración del vidrio (T.70.1).
 *
 * Estas pruebas NO describen lo que la valoración debería hacer: fijan lo que
 * hacía `acciones.ts` antes de la extracción, incluidos el orden de las
 * operaciones en coma flotante y el redondeo a diezmilésima del coste. El
 * importe esperado se calcula en cada caso con la **expresión literal de la
 * implementación anterior**, no con una constante escrita a mano: una constante
 * sólo diría que el resultado no cambió respecto a lo que yo creí que era, y lo
 * que hay que demostrar es que no cambió respecto al código que había.
 *
 * Las dos rutas originales se conservan como dos casos: la simple, un par de
 * medidas repetido por cristal, y la mixta, una medida por alojamiento.
 */

import { describe, expect, it } from 'vitest'
import { metrajeVidrioM2 } from '@aluminior/core/precios'
import type { ClienteEscritura } from '../cliente-db.ts'
import {
  prepararValoracionVidrio, resolverValoracionVidrio,
} from './valoracion-vidrio.ts'

/** Múltiplos y mínimo de un vidrio real del catálogo (PLAN.md anexo L). */
const REGLAS = { metrajeMinimo: 0.5, multiploLargoCm: 1, multiploAnchoCm: 1 }

/**
 * Doble de la conexión: primera consulta el PVP, segunda el coste.
 *
 * Depende del ORDEN de las dos lecturas, y eso es deliberado: si alguien las
 * invierte, el coste pasaría a leerse de `articulos_pvp` y estas pruebas deben
 * caer. Comprobar el texto del SQL ataría la prueba a su formato.
 */
function clienteFalso(filas: readonly unknown[][]): ClienteEscritura {
  let llamada = 0
  return {
    execute: async () => filas[llamada++] ?? [],
  } as unknown as ClienteEscritura
}

describe('valoración del vidrio, ruta simple', () => {
  // Cuatro cristales iguales: lo que la ruta simple mandaba como un solo
  // registro con `cantidad = nCristales`.
  const N = 4
  const LARGO = 1194.5
  const ANCHO = 594.5
  const PRECIO = 41.37
  const COSTE = 18.9

  it('reproduce el importe de la implementación anterior', () => {
    const metraje = metrajeVidrioM2(LARGO, ANCHO, REGLAS)
    const esperado = N * metraje * PRECIO // expresión literal anterior

    const r = prepararValoracionVidrio({
      vidrioCodigo: 'V420AGS4',
      cristales: [{ largoMm: LARGO, anchoMm: ANCHO, cantidad: N }],
      reglasMetraje: REGLAS,
      precioM2: PRECIO,
      costeM2: COSTE,
    })

    expect(r.importe).toBe(esperado)
  })

  it('escribe UNA pieza con la cantidad agregada y el coste de la anterior', () => {
    const metraje = metrajeVidrioM2(LARGO, ANCHO, REGLAS)
    const costeEsperado = Math.round(COSTE * metraje * N * 10000) / 10000

    const r = prepararValoracionVidrio({
      vidrioCodigo: 'V420AGS4',
      cristales: [{ largoMm: LARGO, anchoMm: ANCHO, cantidad: N }],
      reglasMetraje: REGLAS,
      precioM2: PRECIO,
      costeM2: COSTE,
    })

    expect(r.piezas).toEqual([{
      articuloCodigo: 'V420AGS4',
      cantidad: '4',
      largoCorteMm: '1194.5',
      anchoCorteMm: '594.5',
      anguloIzquierdo: null,
      anguloDerecho: null,
      funcion: 'VIDRIO',
      costeUnitario: '18.9',
      costeTotal: String(costeEsperado),
    }])
  })
})

describe('valoración del vidrio, ruta mixta', () => {
  // Tres alojamientos con medidas distintas, cantidad 1 cada uno.
  const CRISTALES = [
    { largoMm: 1194.5, anchoMm: 594.5, cantidad: 1 },
    { largoMm: 800, anchoMm: 400, cantidad: 1 },
    { largoMm: 305.25, anchoMm: 210.75, cantidad: 1 },
  ]
  const PRECIO = 41.37
  const COSTE = 18.9

  it('reproduce el importe de la implementación anterior', () => {
    const metrajes = CRISTALES.map((c) => metrajeVidrioM2(c.largoMm, c.anchoMm, REGLAS))
    const esperado = metrajes.reduce((a, b) => a + b, 0) * PRECIO // expresión literal anterior

    const r = prepararValoracionVidrio({
      vidrioCodigo: 'V420AGS4',
      cristales: CRISTALES,
      reglasMetraje: REGLAS,
      precioM2: PRECIO,
      costeM2: COSTE,
    })

    expect(r.importe).toBe(esperado)
  })

  it('escribe una pieza POR alojamiento, en orden y sin agregar', () => {
    const metrajes = CRISTALES.map((c) => metrajeVidrioM2(c.largoMm, c.anchoMm, REGLAS))

    const r = prepararValoracionVidrio({
      vidrioCodigo: 'V420AGS4',
      cristales: CRISTALES,
      reglasMetraje: REGLAS,
      precioM2: PRECIO,
      costeM2: COSTE,
    })

    expect(r.piezas).toHaveLength(3)
    expect(r.piezas.map((p) => p.cantidad)).toEqual(['1', '1', '1'])
    expect(r.piezas.map((p) => p.largoCorteMm)).toEqual(['1194.5', '800', '305.25'])
    // Redondeo a diezmilésima, uno a uno: el de la implementación anterior.
    expect(r.piezas.map((p) => p.costeTotal)).toEqual(
      metrajes.map((m) => String(Math.round(COSTE * m * 1 * 10000) / 10000)),
    )
  })

  it('el mínimo de metraje se aplica por cristal, no al total', () => {
    // El tercero (30,5 × 21 cm = 0,06 m²) queda por debajo del mínimo de 0,5.
    const metrajes = CRISTALES.map((c) => metrajeVidrioM2(c.largoMm, c.anchoMm, REGLAS))
    expect(metrajes[2]).toBe(0.5)

    const r = prepararValoracionVidrio({
      vidrioCodigo: 'V420AGS4',
      cristales: CRISTALES,
      reglasMetraje: REGLAS,
      precioM2: PRECIO,
      costeM2: null,
    })
    expect(r.importe).toBe(metrajes.reduce((a, b) => a + b, 0) * PRECIO)
  })
})

describe('coste ausente', () => {
  it('deja la pieza sin coste y NO toca el importe', () => {
    const cristales = [{ largoMm: 1000, anchoMm: 500, cantidad: 2 }]
    const conCoste = prepararValoracionVidrio({
      vidrioCodigo: 'V420AGS4', cristales, reglasMetraje: REGLAS, precioM2: 41.37, costeM2: 18.9,
    })
    const sinCoste = prepararValoracionVidrio({
      vidrioCodigo: 'V420AGS4', cristales, reglasMetraje: REGLAS, precioM2: 41.37, costeM2: null,
    })

    expect(sinCoste.importe).toBe(conCoste.importe)
    expect(sinCoste.piezas[0].costeUnitario).toBeNull()
    expect(sinCoste.piezas[0].costeTotal).toBeNull()
  })
})

describe('el importe NO se redondea aquí', () => {
  it('devuelve el producto crudo, para que lo redondee quien acumula', () => {
    // 3 × 0,55 m² × 41,37 €: el producto tiene más de dos decimales y debe
    // llegar entero al acumulador, que es donde estaba el redondeo a céntimo.
    const r = prepararValoracionVidrio({
      vidrioCodigo: 'V420AGS4',
      cristales: [{ largoMm: 1100, anchoMm: 500, cantidad: 3 }],
      reglasMetraje: REGLAS,
      precioM2: 41.37,
      costeM2: null,
    })
    const metraje = metrajeVidrioM2(1100, 500, REGLAS)
    expect(r.importe).toBe(3 * metraje * 41.37)
    expect(r.importe).not.toBe(Math.round(r.importe * 100) / 100)
  })
})

describe('lectura de catálogo', () => {
  const entrada = {
    vidrioCodigo: 'V420AGS4',
    cristales: [{ largoMm: 1000, anchoMm: 500, cantidad: 1 }],
    reglasMetraje: REGLAS,
    tarifa: 1,
    acabadoCodigo: 'BLA',
  }

  it('sin PVP en la tarifa: aviso literal, sin importe y sin piezas', async () => {
    const r = await resolverValoracionVidrio(clienteFalso([[]]), entrada)

    expect(r).toEqual({
      ok: false,
      aviso: 'vidrio sin valorar: V420AGS4 no tiene precio en la tarifa 1',
    })
  })

  it('no consulta el coste cuando no hay precio', async () => {
    let llamadas = 0
    const cliente = {
      execute: async () => { llamadas++; return [] },
    } as unknown as ClienteEscritura

    await resolverValoracionVidrio(cliente, entrada)

    expect(llamadas).toBe(1)
  })

  it('con PVP y sin coste: valora la venta y deja la pieza sin coste', async () => {
    const cliente = clienteFalso([[{ precio: '41.37' }], []])

    const r = await resolverValoracionVidrio(cliente, entrada)

    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.importe).toBe(metrajeVidrioM2(1000, 500, REGLAS) * 41.37)
    expect(r.piezas[0].costeUnitario).toBeNull()
  })

  it('con PVP y coste: ambos entran en la pieza', async () => {
    const cliente = clienteFalso([[{ precio: '41.37' }], [{ coste: '18.9' }]])

    const r = await resolverValoracionVidrio(cliente, entrada)

    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.piezas[0].costeUnitario).toBe('18.9')
    expect(r.piezas[0].costeTotal).toBe(
      String(Math.round(18.9 * metrajeVidrioM2(1000, 500, REGLAS) * 1 * 10000) / 10000),
    )
  })
})
