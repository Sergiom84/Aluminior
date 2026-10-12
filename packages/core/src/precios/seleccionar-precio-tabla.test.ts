import { describe, expect, it } from 'vitest'
import {
  seleccionarPrecioTabla,
  type EntradaPrecioTabla,
  type FilaPrecioTabla,
  type PoliticasPrecioTabla,
} from './seleccionar-precio-tabla.ts'

// Catálogo sintético: dos escalones de ancho y un único largo.
const politicas: PoliticasPrecioTabla = {
  noMedidasInferiores: false,
  noMedidasSuperiores: false,
  soloMedidasAncho: false,
  soloMedidasLargo: false,
  noPrecioCero: false,
}
const fila = (anchoMm: number, precio: number, cambios: Partial<FilaPrecioTabla> = {}): FilaPrecioTabla => ({
  articuloCodigo: 'ART-TABLA', acabadoCodigo: 'ACABADO-A', tarifa: 'T1',
  anchoMm, largoMm: 2000, precio, ...cambios,
})
const filas = [fila(1000, 80), fila(1500, 120)]
const entrada = (cambios: Partial<EntradaPrecioTabla> = {}): EntradaPrecioTabla => ({
  articuloCodigo: 'ART-TABLA', acabadoCodigo: 'ACABADO-A', tarifa: 'T1',
  anchoMm: 850, largoMm: 1900, politicas, filas, ...cambios,
})
const resolver = (cambios: Partial<EntradaPrecioTabla> = {}) => seleccionarPrecioTabla(entrada(cambios))
const sinPrecio = (motivo: string) => ({
  completo: false, precio: null, datos: null, fuente: 'ARTICULOS_PRECIO_TABLA_PVP', motivo,
})

describe('seleccionarPrecioTabla: escalones de ancho con largo único', () => {
  it.each([
    [850, 1900, 80, 1000],
    [1350, 1990, 120, 1500],
    [1000, 2000, 80, 1000],
    [1000.001, 2000, 120, 1500],
    [1500, 2000, 120, 1500],
  ])('pieza %s × %s toma precio %s de ancho %s', (anchoMm, largoMm, precio, anchoTabla) => {
    expect(resolver({ anchoMm, largoMm })).toEqual({
      completo: true, precio, datos: fila(anchoTabla, precio),
      fuente: 'ARTICULOS_PRECIO_TABLA_PVP', motivo: null,
    })
  })

  it.each([[1500.001, 2000], [1000, 2000.001], [1501, 2001]])(
    'no redondea ni cubre una pieza fuera de tabla: %s × %s', (anchoMm, largoMm) => {
      expect(resolver({ anchoMm, largoMm })).toEqual(sinPrecio('Medidas fuera de la tabla de precios'))
    },
  )

  it('elige el menor ancho elegible, aunque el escalón siguiente sea más barato', () => {
    expect(resolver({ filas: [fila(1500, 50), fila(1000, 80)] })).toMatchObject({
      completo: true, precio: 80, datos: { anchoMm: 1000 },
    })
  })

  it('el cero explícito de una fila sí es un precio encontrado', () => {
    expect(resolver({ filas: [fila(1000, 0)] })).toEqual({
      completo: true, precio: 0, datos: fila(1000, 0),
      fuente: 'ARTICULOS_PRECIO_TABLA_PVP', motivo: null,
    })
  })

  it('no depende del orden ni modifica el catálogo inyectado', () => {
    const congeladas = Object.freeze(filas.map((f) => Object.freeze({ ...f })))
    expect(resolver({ filas: congeladas })).toEqual(resolver({ filas: [...congeladas].reverse() }))
    expect(congeladas).toEqual(filas)
    const resultado = resolver({ filas: congeladas })
    if (resultado.completo) expect(resultado.datos).not.toBe(congeladas[0])
  })
})

describe('la clave artículo, acabado y tarifa es exacta', () => {
  it('la ausencia de filas sigue sin precio, nunca cero', () => {
    expect(resolver({ filas: [] })).toEqual(sinPrecio(
      'Precio por medidas no disponible para el artículo, acabado y tarifa',
    ))
  })

  it.each([
    { articuloCodigo: 'ART-OTRO' },
    { acabadoCodigo: 'ACABADO-B' },
    { acabadoCodigo: 'UNI' },
    { acabadoCodigo: '*' },
    { tarifa: 'T2' },
    { tarifa: ' T1 ' },
    { articuloCodigo: 'art-tabla' },
  ])('no busca reservas ni normaliza la clave: %j', (cambios) => {
    expect(resolver(cambios)).toEqual(sinPrecio(
      'Precio por medidas no disponible para el artículo, acabado y tarifa',
    ))
  })

  it('ignora otras claves, aunque tengan dimensiones o precios inválidos', () => {
    const ajenas = [
      fila(1000, -1, { articuloCodigo: 'ART-OTRO' }),
      fila(1000, 1, { acabadoCodigo: 'ACABADO-B', largoMm: 3000 }),
      fila(Number.NaN, 0, { tarifa: 'T2' }),
    ]
    expect(resolver({ filas: [...ajenas, ...filas] })).toEqual(resolver())
  })

  it.each(['articuloCodigo', 'acabadoCodigo', 'tarifa'] as const)(
    'una clave %s ausente no representa un comodín', (campo) => {
      expect(resolver({ [campo]: ' ' })).toEqual(sinPrecio('Artículo, acabado o tarifa no disponibles'))
    },
  )
})

describe('el soporte exige las cinco políticas explícitamente false', () => {
  const campos = Object.keys(politicas) as (keyof PoliticasPrecioTabla)[]

  it.each(campos)('la restricción %s activa conserva la valoración incompleta', (campo) => {
    expect(resolver({ politicas: { ...politicas, [campo]: true } })).toEqual(sinPrecio(
      'Restricciones de precio por medidas pendientes de verificar',
    ))
  })

  it.each(campos)('la política %s desconocida no se asume false', (campo) => {
    for (const desconocida of [undefined, null]) {
      expect(resolver({ politicas: { ...politicas, [campo]: desconocida } })).toEqual(sinPrecio(
        'Configuración de precio por medidas no disponible',
      ))
    }
  })

  it.each([undefined, null, {}])('configuración ausente o vacía: %j', (configuracion) => {
    expect(resolver({ politicas: configuracion })).toEqual(sinPrecio(
      'Configuración de precio por medidas no disponible',
    ))
  })
})

describe('los casos fuera de evidencia conservan precio null', () => {
  it('varios largos bloquean aunque solo uno cubra la pieza', () => {
    expect(resolver({ filas: [...filas, fila(500, 40, { largoMm: 1000 })] })).toEqual(sinPrecio(
      'Tabla con varios largos pendiente de verificar',
    ))
  })

  it.each([80, 90])('una dimensión repetida bloquea incluso con precio %s', (precio) => {
    expect(resolver({ filas: [...filas, fila(1000, precio)] })).toEqual(sinPrecio(
      'Tabla con medidas duplicadas pendiente de verificar',
    ))
  })

  it('también bloquea duplicados que no cubren la pieza', () => {
    expect(resolver({ anchoMm: 1200, filas: [...filas, fila(1000, 80)] })).toEqual(sinPrecio(
      'Tabla con medidas duplicadas pendiente de verificar',
    ))
  })

  it.each([null, 0, -1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'rechaza dimensión solicitada no positiva o no finita: %s', (medida) => {
      expect(resolver({ anchoMm: medida })).toEqual(sinPrecio('Medidas de la pieza no válidas'))
      expect(resolver({ largoMm: medida })).toEqual(sinPrecio('Medidas de la pieza no válidas'))
    },
  )

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'rechaza dimensión de catálogo no positiva o no finita: %s', (medida) => {
      expect(resolver({ filas: [fila(medida, 80)] })).toEqual(sinPrecio('Datos de la tabla de precios no válidos'))
      expect(resolver({ filas: [fila(1000, 80, { largoMm: medida })] })).toEqual(sinPrecio(
        'Datos de la tabla de precios no válidos',
      ))
    },
  )

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'rechaza precio de catálogo negativo o no finito: %s', (precio) => {
      expect(resolver({ filas: [fila(1000, precio)] })).toEqual(sinPrecio('Datos de la tabla de precios no válidos'))
    },
  )

  it('un escalón inválido no elegible también impide certificar la tabla', () => {
    expect(resolver({ anchoMm: 1200, filas: [fila(1000, -1), fila(1500, 120)] })).toEqual(sinPrecio(
      'Datos de la tabla de precios no válidos',
    ))
  })
})
