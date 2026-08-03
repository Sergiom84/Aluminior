/**
 * Resolución de mano de obra, sin base de datos.
 *
 * El catálogo llega ya leído, así que cada caso —precio ausente, cero, negativo
 * o desbordado; coste ausente, ambiguo, negativo o desbordado— se comprueba sin
 * levantar Postgres. Lo que sí toca la base es que esas filas quepan en el
 * esquema, y eso lo prueba la suite de integración.
 */
import { describe, expect, it } from 'vitest'
import { conceptosConHoras, ACABADO_MANO_OBRA } from './conceptos.ts'
import { UNIDAD_MANO_OBRA, type ArticuloManoObra, type CatalogoManoObra } from './catalogo.ts'
import { resolverManoObra } from './resolver-mano-obra.ts'

const articulo = (parcial: Partial<ArticuloManoObra> = {}): ArticuloManoObra => ({
  descripcion: 'MANO DE OBRA', precio: '0.5000',
  costes: [{ acabadoCodigo: ACABADO_MANO_OBRA, coste: '0.5000' }],
  ...parcial,
})

const catalogo = (entradas: Record<string, ArticuloManoObra>): CatalogoManoObra =>
  new Map(Object.entries(entradas))

/** Un solo concepto de colocación, con el artículo que se le pase. */
const resolverColocacion = (mocol: ArticuloManoObra, horas = '1.50') =>
  resolverManoObra({
    conceptos: [{ concepto: 'COLOCACION', horas }],
    catalogo: catalogo({ MOCOL: mocol }),
    tarifa: 1,
  })

describe('cuántas filas genera una línea', () => {
  it('ninguna sin horas: un cero no es cero minutos de trabajo', () => {
    expect(conceptosConHoras({ fabricacion: '0', colocacion: '0.00' })).toEqual([])
  })

  it('una cuando sólo se teclea un concepto', () => {
    expect(conceptosConHoras({ fabricacion: '0', colocacion: '1.5' }))
      .toEqual([{ concepto: 'COLOCACION', horas: '1.5' }])
    expect(conceptosConHoras({ fabricacion: '2.37', colocacion: '0' }))
      .toEqual([{ concepto: 'FABRICACION_ADICIONAL', horas: '2.37' }])
  })

  it('dos cuando se teclean ambos, en orden estable', () => {
    expect(conceptosConHoras({ fabricacion: '1', colocacion: '2' }).map((c) => c.concepto))
      .toEqual(['FABRICACION_ADICIONAL', 'COLOCACION'])
  })
})

describe('artículo y snapshot de cada concepto', () => {
  it('asocia FABRICACION_ADICIONAL con MO y COLOCACION con MOCOL', () => {
    const { filas } = resolverManoObra({
      conceptos: conceptosConHoras({ fabricacion: '1', colocacion: '2' }),
      catalogo: catalogo({
        MO: articulo({ descripcion: 'MANO DE OBRA DE TALLER (MINUTOS)' }),
        MOCOL: articulo({ descripcion: 'MANO DE OBRA DE COLOCACIÓN (MINUTOS)' }),
      }),
      tarifa: 3,
    })
    expect(filas.map((f) => f.articuloCodigo)).toEqual(['MO', 'MOCOL'])
    expect(filas[0]).toMatchObject({
      concepto: 'FABRICACION_ADICIONAL',
      origen: 'MANUAL',
      horas: '1.00',
      minutos: '60.00',
      articuloDescripcion: 'MANO DE OBRA DE TALLER (MINUTOS)',
      unidad: UNIDAD_MANO_OBRA,
      acabadoCodigo: ACABADO_MANO_OBRA,
      tarifa: 3,
      precioMinuto: '0.5000',
      importe: '30.00',
      costeMinuto: '0.5000',
      costeTotal: '30.00',
      valoracionCompleta: true,
      motivoCodigo: null,
      motivoCosteCodigo: null,
    })
    expect(filas[1]).toMatchObject({ minutos: '120.00', importe: '60.00' })
  })

  // Los 11 casos históricos con minutos decimales (§13). Redondear a entero
  // cambiaría el importe respecto al original.
  it('convierte horas a minutos sin redondear a entero', () => {
    const { filas } = resolverColocacion(articulo(), '2.37')
    expect(filas[0]).toMatchObject({ horas: '2.37', minutos: '142.20', importe: '71.10' })
  })

  it('congela el código cuando el artículo ya no está en el catálogo', () => {
    const { filas } = resolverManoObra({
      conceptos: [{ concepto: 'COLOCACION', horas: '1' }],
      catalogo: catalogo({}),
      tarifa: 1,
    })
    // Sin artículo no hay descripción que congelar ni precio que aplicar. No se
    // inventa una descripción: se guarda el código, que es lo único cierto.
    expect(filas[0]).toMatchObject({
      articuloCodigo: 'MOCOL',
      articuloDescripcion: 'MOCOL',
      motivoCodigo: 'SIN_PVP',
      motivoCosteCodigo: 'SIN_COSTE',
      valoracionCompleta: false,
      importe: null,
    })
  })
})

/**
 * La demostración de que el texto no pasa por `number` en ningún punto del
 * camino formulario → catálogo → importe.
 *
 * El caso es alcanzable desde el formulario, no una sonda de laboratorio:
 * `1,01 h` son `60,60 min`, y a `1,0250 €/min` el importe exacto es `62,115`,
 * que redondea a `62,12`... salvo que se calcule con `number`. Ahí `1.025` vale
 * `1,02499999999999991118`, el producto sale `62,11499999999999` y
 * `Math.round(v * 100) / 100` devuelve `62,11`. Un céntimo de diferencia en una
 * línea, sobre las 7.245 del histórico.
 */
describe('sin pérdida decimal de extremo a extremo', () => {
  const PRECIO_QUE_LA_COMA_FLOTANTE_DEFORMA = '1.0250'

  it('resuelve el importe exacto donde number pierde un céntimo', () => {
    const { filas } = resolverColocacion(
      articulo({
        precio: PRECIO_QUE_LA_COMA_FLOTANTE_DEFORMA,
        costes: [{ acabadoCodigo: 'UNI', coste: PRECIO_QUE_LA_COMA_FLOTANTE_DEFORMA }],
      }),
      '1.01',
    )
    expect(filas[0].minutos).toBe('60.60')
    expect(filas[0].importe).toBe('62.12')
    expect(filas[0].costeTotal).toBe('62.12')

    // El mismo cálculo con la aritmética que se sustituyó, para que la prueba
    // falle si alguien vuelve a meter `number` por el camino.
    expect(Math.round(60.60 * 1.025 * 100) / 100).toBe(62.11)
  })

  it('devuelve texto, nunca number, en todas las columnas decimales', () => {
    const { filas } = resolverColocacion(articulo())
    const decimales = [
      'horas', 'minutos', 'precioMinuto', 'importe', 'costeMinuto', 'costeTotal',
    ] as const
    for (const campo of decimales) expect(typeof filas[0][campo]).toBe('string')
  })

  // El esquema exige `minutos = ROUND(horas * 60, 2)` y PostgreSQL redondearía
  // `horas` al guardarla. Sin normalizar antes de convertir, la fila no entra.
  it('lleva las horas a la escala de su columna antes de convertir', () => {
    const { filas } = resolverColocacion(articulo(), '0.0335')
    expect(filas[0].horas).toBe('0.03')
    expect(filas[0].minutos).toBe('1.80')
  })
})

describe('venta que no se puede valorar', () => {
  it('SIN_PVP cuando el artículo no tiene fila en la tarifa', () => {
    const { filas, guarda } = resolverColocacion(articulo({ precio: null }))
    expect(filas[0]).toMatchObject({
      precioMinuto: null, importe: null, valoracionCompleta: false, motivoCodigo: 'SIN_PVP',
    })
    expect(guarda[0]).toEqual({
      concepto: 'COLOCACION', motivoCodigo: 'SIN_PVP', motivoCosteCodigo: null,
    })
  })

  // Caso real: tarifas 2 y 3 tienen la mano de obra a 0,0000.
  it('PVP_CERO conservando el cero, que dice "tarifa sin rellenar"', () => {
    const { filas } = resolverColocacion(articulo({ precio: '0.0000' }))
    expect(filas[0]).toMatchObject({
      precioMinuto: '0.0000', importe: null, motivoCodigo: 'PVP_CERO',
    })
  })

  it('PVP_NEGATIVO conservando el precio corrupto', () => {
    const { filas } = resolverColocacion(articulo({ precio: '-0.5000' }))
    expect(filas[0]).toMatchObject({
      precioMinuto: '-0.5000', importe: null, motivoCodigo: 'PVP_NEGATIVO',
    })
  })

  it('IMPORTE_FUERA_RANGO conservando el precio real', () => {
    const { filas } = resolverColocacion(
      articulo({ precio: '9999999.0000' }), '9999.99',
    )
    expect(filas[0]).toMatchObject({
      minutos: '599999.40', precioMinuto: '9999999.0000',
      importe: null, motivoCodigo: 'IMPORTE_FUERA_RANGO',
    })
  })
})

describe('coste, que no invalida la venta', () => {
  it('SIN_COSTE cuando el artículo no tiene ninguna fila', () => {
    const { filas } = resolverColocacion(articulo({ costes: [] }))
    expect(filas[0]).toMatchObject({
      valoracionCompleta: true, importe: '45.00',
      costeMinuto: null, costeTotal: null, motivoCosteCodigo: 'SIN_COSTE',
    })
  })

  it('COSTE_AMBIGUO con varios costes distintos y ninguno del acabado aplicado', () => {
    const { filas, guarda } = resolverColocacion(articulo({
      costes: [
        { acabadoCodigo: 'L', coste: '0.5000' },
        { acabadoCodigo: 'ANOD', coste: '0.7500' },
      ],
    }))
    expect(filas[0]).toMatchObject({
      valoracionCompleta: true, costeMinuto: null, costeTotal: null,
      motivoCosteCodigo: 'COSTE_AMBIGUO',
    })
    expect(guarda[0].motivoCodigo).toBeNull()
  })

  it('usa el coste único aunque el acabado aplicado no tenga fila', () => {
    const { filas } = resolverColocacion(articulo({
      costes: [
        { acabadoCodigo: 'L', coste: '0.5000' },
        { acabadoCodigo: 'ANOD', coste: '0.5000' },
      ],
    }))
    expect(filas[0]).toMatchObject({ costeMinuto: '0.5000', motivoCosteCodigo: null })
  })

  it('COSTE_NEGATIVO conservando el coste corrupto', () => {
    const { filas } = resolverColocacion(articulo({
      costes: [{ acabadoCodigo: 'UNI', coste: '-0.5000' }],
    }))
    expect(filas[0]).toMatchObject({
      valoracionCompleta: true, importe: '45.00',
      costeMinuto: '-0.5000', costeTotal: null, motivoCosteCodigo: 'COSTE_NEGATIVO',
    })
  })

  it('COSTE_FUERA_RANGO sin tocar el importe de venta', () => {
    const { filas } = resolverColocacion(
      articulo({ costes: [{ acabadoCodigo: 'UNI', coste: '9999999.0000' }] }),
      '9999.99',
    )
    expect(filas[0]).toMatchObject({
      valoracionCompleta: true, importe: '299999.70',
      costeMinuto: '9999999.0000', costeTotal: null, motivoCosteCodigo: 'COSTE_FUERA_RANGO',
    })
  })
})
