import { describe, expect, it } from 'vitest'
import {
  calcularPrecioVenta,
  recalcularPreciosDeVenta,
  resolverMargen,
  type ArticuloClasificado,
  type MargenTarifa,
  type TipoMargen,
} from './margen.ts'
import { multiplicarDecimal, restarDecimal } from './decimal.ts'
import type { TarifaVenta } from './tarifa-venta.ts'

// TODOS los datos de este fichero son sintéticos y evidentemente de prueba:
// familia `FAM-A`, subfamilia `SUB-1`, tarifa 99, costes redondos. Los márgenes
// y las tarifas reales del taller son un dato del titular, aún sin confirmar.
const TARIFA: TarifaVenta = {
  codigo: 99,
  nombre: 'TARIFA DE PRUEBA',
  validaParaVentas: true,
  bloqueada: false,
}

const articulo = (parcial: Partial<ArticuloClasificado> = {}): ArticuloClasificado => ({
  codigo: 'ART-PRUEBA',
  familiaCodigo: 'FAM-A',
  subfamiliaCodigo: null,
  ...parcial,
})

// Por defecto SOBRE_COSTE: es el tipo con el que se escribieron estos casos.
// Los de SOBRE_VENTA lo piden explicitamente, para que se vea cual es cual.
const margenFamilia = (
  porcentaje: string, familiaCodigo = 'FAM-A', tipo: TipoMargen = 'SOBRE_COSTE',
): MargenTarifa => ({
  tarifaCodigo: 99, familiaCodigo, subfamiliaCodigo: null, porcentaje, tipo,
})
const margenSubfamilia = (
  porcentaje: string, subfamiliaCodigo = 'SUB-1', tipo: TipoMargen = 'SOBRE_COSTE',
): MargenTarifa => ({
  tarifaCodigo: 99, familiaCodigo: 'FAM-A', subfamiliaCodigo, porcentaje, tipo,
})

describe('resolución del margen por familia y subfamilia', () => {
  it('usa la familia cuando el artículo no tiene subfamilia', () => {
    expect(resolverMargen(TARIFA, articulo(), [margenFamilia('10')])).toEqual({
      estado: 'RESUELTO', porcentaje: '10', origen: 'FAMILIA', tipo: 'SOBRE_COSTE',
    })
  })

  // El grano fino gana: la subfamilia es el criterio que alguien configuró a
  // mano para apartarse del general.
  it('la subfamilia gana a la familia cuando existe', () => {
    const margenes = [margenFamilia('10'), margenSubfamilia('40')]
    expect(resolverMargen(TARIFA, articulo({ subfamiliaCodigo: 'SUB-1' }), margenes)).toEqual({
      estado: 'RESUELTO', porcentaje: '40', origen: 'SUBFAMILIA', tipo: 'SOBRE_COSTE',
    })
  })

  // Que el orden de las filas no decida nada: la lista invertida da lo mismo.
  it('el resultado no depende del orden de las filas', () => {
    const margenes = [margenSubfamilia('40'), margenFamilia('10')]
    expect(resolverMargen(TARIFA, articulo({ subfamiliaCodigo: 'SUB-1' }), margenes)).toEqual({
      estado: 'RESUELTO', porcentaje: '40', origen: 'SUBFAMILIA', tipo: 'SOBRE_COSTE',
    })
  })

  it('cae a la familia si la subfamilia del artículo no tiene fila', () => {
    const margenes = [margenFamilia('10'), margenSubfamilia('40', 'SUB-2')]
    expect(resolverMargen(TARIFA, articulo({ subfamiliaCodigo: 'SUB-1' }), margenes)).toEqual({
      estado: 'RESUELTO', porcentaje: '10', origen: 'FAMILIA', tipo: 'SOBRE_COSTE',
    })
  })

  // El código de subfamilia sólo es único dentro de su familia: casar sólo por
  // subfamilia traería aquí el margen de otra familia.
  it('no cruza el margen de otra familia', () => {
    const margenes = [margenFamilia('10', 'FAM-B')]
    expect(resolverMargen(TARIFA, articulo(), margenes)).toEqual({
      estado: 'NO_RESOLUBLE', motivo: 'SIN_MARGEN_CONFIGURADO',
    })
  })

  it('no cruza el margen de otra tarifa', () => {
    const margenes = [{ ...margenFamilia('10'), tarifaCodigo: 98 }]
    expect(resolverMargen(TARIFA, articulo(), margenes)).toEqual({
      estado: 'NO_RESOLUBLE', motivo: 'SIN_MARGEN_CONFIGURADO',
    })
  })

  // Sin fila no se inventa un margen por defecto: un cero implícito vendería a
  // precio de coste y nadie lo vería.
  it('familia sin margen no resuelve, y lo dice', () => {
    expect(resolverMargen(TARIFA, articulo(), [])).toEqual({
      estado: 'NO_RESOLUBLE', motivo: 'SIN_MARGEN_CONFIGURADO',
    })
  })

  it('artículo sin familia se distingue de familia sin margen', () => {
    expect(resolverMargen(TARIFA, articulo({ familiaCodigo: null }), [margenFamilia('10')])).toEqual({
      estado: 'NO_RESOLUBLE', motivo: 'ARTICULO_SIN_FAMILIA',
    })
  })

  it('una tarifa no válida para ventas no resuelve margen', () => {
    const coste = { ...TARIFA, validaParaVentas: false }
    expect(resolverMargen(coste, articulo(), [margenFamilia('10')])).toEqual({
      estado: 'NO_RESOLUBLE', motivo: 'TARIFA_NO_VALIDA_PARA_VENTAS',
    })
  })
})

describe('precio de venta desde el coste', () => {
  it('aplica el porcentaje sobre el coste', () => {
    expect(calcularPrecioVenta(TARIFA, articulo(), '100.0000', [margenFamilia('10')])).toEqual({
      estado: 'CALCULADO', precio: '110.0000', porcentaje: '10', origen: 'FAMILIA', tipo: 'SOBRE_COSTE',
    })
  })

  it('margen cero deja el precio igual al coste, y no es lo mismo que no tener margen', () => {
    expect(calcularPrecioVenta(TARIFA, articulo(), '37.5000', [margenFamilia('0')])).toEqual({
      estado: 'CALCULADO', precio: '37.5000', porcentaje: '0', origen: 'FAMILIA', tipo: 'SOBRE_COSTE',
    })
    expect(calcularPrecioVenta(TARIFA, articulo(), '37.5000', [])).toEqual({
      estado: 'NO_CALCULABLE', motivo: 'SIN_MARGEN_CONFIGURADO',
    })
  })

  // Coste cero es un coste, no un dato ausente: el precio sale cero y calculado.
  it('coste cero da precio cero calculado', () => {
    expect(calcularPrecioVenta(TARIFA, articulo(), '0.0000', [margenFamilia('50')])).toEqual({
      estado: 'CALCULADO', precio: '0.0000', porcentaje: '50', origen: 'FAMILIA', tipo: 'SOBRE_COSTE',
    })
  })

  it('admite porcentaje con decimales sin perder dígitos', () => {
    expect(calcularPrecioVenta(TARIFA, articulo(), '200.0000', [margenFamilia('12.5')])).toEqual({
      estado: 'CALCULADO', precio: '225.0000', porcentaje: '12.5', origen: 'FAMILIA', tipo: 'SOBRE_COSTE',
    })
  })

  // El caso que justifica el Decimal: en coma flotante 1,005 es 1,00499999…
  // y este precio redondearía a 20,1000 en vez de a 20,1100.
  it('redondea a la mitad hacia afuera, como PostgreSQL', () => {
    expect(calcularPrecioVenta(TARIFA, articulo(), '0.0201', [margenFamilia('0')])).toEqual({
      estado: 'CALCULADO', precio: '0.0201', porcentaje: '0', origen: 'FAMILIA', tipo: 'SOBRE_COSTE',
    })
    expect(calcularPrecioVenta(TARIFA, articulo(), '1.00', [margenFamilia('0.005')])).toEqual({
      estado: 'CALCULADO', precio: '1.0001', porcentaje: '0.005', origen: 'FAMILIA', tipo: 'SOBRE_COSTE',
    })
  })

  it('la tarifa no válida para ventas no calcula precio', () => {
    const coste = { ...TARIFA, validaParaVentas: false }
    expect(calcularPrecioVenta(coste, articulo(), '100.0000', [margenFamilia('10')])).toEqual({
      estado: 'NO_CALCULABLE', motivo: 'TARIFA_NO_VALIDA_PARA_VENTAS',
    })
  })
})

describe('recálculo masivo de una tarifa', () => {
  const lote = [
    { articulo: articulo({ codigo: 'ART-1' }), coste: '100.0000' },
    { articulo: articulo({ codigo: 'ART-2', subfamiliaCodigo: 'SUB-1' }), coste: '100.0000' },
  ]

  it('aplica el margen que corresponde a cada artículo', () => {
    const salida = recalcularPreciosDeVenta(TARIFA, lote, [margenFamilia('10'), margenSubfamilia('40')])
    expect(salida).toEqual({
      estado: 'APLICADO',
      completo: true,
      sinMargen: [],
      lineas: [
        { articuloCodigo: 'ART-1', resultado: { estado: 'CALCULADO', precio: '110.0000', porcentaje: '10', origen: 'FAMILIA', tipo: 'SOBRE_COSTE' } },
        { articuloCodigo: 'ART-2', resultado: { estado: 'CALCULADO', precio: '140.0000', porcentaje: '40', origen: 'SUBFAMILIA', tipo: 'SOBRE_COSTE' } },
      ],
    })
  })

  // El bloqueo es exactamente para esto: frenar la actualización masiva antes
  // de calcular nada, no después.
  it('una tarifa bloqueada rechaza el recálculo entero', () => {
    const salida = recalcularPreciosDeVenta({ ...TARIFA, bloqueada: true }, lote, [margenFamilia('10')])
    expect(salida).toEqual({ estado: 'RECHAZADO', motivo: 'TARIFA_BLOQUEADA' })
  })

  it('una tarifa no válida para ventas rechaza el recálculo entero', () => {
    const salida = recalcularPreciosDeVenta({ ...TARIFA, validaParaVentas: false }, lote, [margenFamilia('10')])
    expect(salida).toEqual({ estado: 'RECHAZADO', motivo: 'TARIFA_NO_VALIDA_PARA_VENTAS' })
  })

  it('los artículos sin margen no desaparecen: marcan el lote como incompleto', () => {
    const salida = recalcularPreciosDeVenta(TARIFA, lote, [margenSubfamilia('40')])
    expect(salida).toMatchObject({ estado: 'APLICADO', completo: false, sinMargen: ['ART-1'] })
  })
})

// El fabricante publica este ejemplo exacto en su documentacion
// (docs/precios-de-coste-y-venta.md): mismo coste, mismo porcentaje, dos
// precios distintos. Es la prueba de que el tipo de margen no es cosmetico.
describe('tipo de margen: sobre coste frente a sobre venta', () => {
  const sobreVenta = (porcentaje: string) => margenFamilia(porcentaje, 'FAM-A', 'SOBRE_VENTA')

  it('un 20% sobre coste de 15 da 18,00', () => {
    expect(calcularPrecioVenta(TARIFA, articulo(), '15', [margenFamilia('20')])).toEqual({
      estado: 'CALCULADO', precio: '18.0000', porcentaje: '20',
      origen: 'FAMILIA', tipo: 'SOBRE_COSTE',
    })
  })

  it('el mismo 20% sobre venta de 15 da 18,75', () => {
    expect(calcularPrecioVenta(TARIFA, articulo(), '15', [sobreVenta('20')])).toEqual({
      estado: 'CALCULADO', precio: '18.7500', porcentaje: '20',
      origen: 'FAMILIA', tipo: 'SOBRE_VENTA',
    })
  })

  // Y el beneficio resultante es el porcentaje del precio final, que es
  // justamente para lo que existe esta modalidad: 18,75 - 15 = 3,75 = 20% de 18,75.
  it('el beneficio sobre venta es el porcentaje del precio final', () => {
    const r = calcularPrecioVenta(TARIFA, articulo(), '15', [sobreVenta('20')])
    if (r.estado !== 'CALCULADO') throw new Error('deberia calcular')
    expect(restarDecimal(r.precio, '15', 4)).toBe('3.7500')
    expect(multiplicarDecimal(r.precio, '0.20', 4)).toBe('3.7500')
  })

  it('el tipo viaja en la resolucion, no solo en el precio', () => {
    expect(resolverMargen(TARIFA, articulo(), [sobreVenta('30')])).toEqual({
      estado: 'RESUELTO', porcentaje: '30', origen: 'FAMILIA', tipo: 'SOBRE_VENTA',
    })
  })

  // Un 100% sobre venta dejaria el coste en cero: no hay precio que devolver.
  // Se reporta al resolver, antes de que nadie intente dividir.
  it('rechaza el margen sobre venta del 100% o mas', () => {
    for (const p of ['100', '120', '100.0001']) {
      expect(resolverMargen(TARIFA, articulo(), [sobreVenta(p)])).toEqual({
        estado: 'NO_RESOLUBLE', motivo: 'MARGEN_SOBRE_VENTA_IMPOSIBLE',
      })
    }
  })

  // El mismo 100% sobre COSTE es perfectamente valido: duplica el precio.
  it('un 100% sobre coste si es valido', () => {
    const r = calcularPrecioVenta(TARIFA, articulo(), '15', [margenFamilia('100')])
    expect(r).toMatchObject({ estado: 'CALCULADO', precio: '30.0000' })
  })

  // Un cociente periodico redondea a la escala de precio, no explota.
  it('redondea el cociente periodico a la escala de precio', () => {
    expect(calcularPrecioVenta(TARIFA, articulo(), '10', [sobreVenta('70')])).toMatchObject({
      estado: 'CALCULADO', precio: '33.3333',
    })
  })
})
