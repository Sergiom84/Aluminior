import { describe, expect, it } from 'vitest'
import {
  calcularPrecioVenta,
  recalcularPreciosDeVenta,
  resolverMargen,
  type ArticuloClasificado,
  type MargenTarifa,
} from './margen.ts'
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

const margenFamilia = (porcentaje: string, familiaCodigo = 'FAM-A'): MargenTarifa => ({
  tarifaCodigo: 99, familiaCodigo, subfamiliaCodigo: null, porcentaje,
})
const margenSubfamilia = (porcentaje: string, subfamiliaCodigo = 'SUB-1'): MargenTarifa => ({
  tarifaCodigo: 99, familiaCodigo: 'FAM-A', subfamiliaCodigo, porcentaje,
})

describe('resolución del margen por familia y subfamilia', () => {
  it('usa la familia cuando el artículo no tiene subfamilia', () => {
    expect(resolverMargen(TARIFA, articulo(), [margenFamilia('10')])).toEqual({
      estado: 'RESUELTO', porcentaje: '10', origen: 'FAMILIA',
    })
  })

  // El grano fino gana: la subfamilia es el criterio que alguien configuró a
  // mano para apartarse del general.
  it('la subfamilia gana a la familia cuando existe', () => {
    const margenes = [margenFamilia('10'), margenSubfamilia('40')]
    expect(resolverMargen(TARIFA, articulo({ subfamiliaCodigo: 'SUB-1' }), margenes)).toEqual({
      estado: 'RESUELTO', porcentaje: '40', origen: 'SUBFAMILIA',
    })
  })

  // Que el orden de las filas no decida nada: la lista invertida da lo mismo.
  it('el resultado no depende del orden de las filas', () => {
    const margenes = [margenSubfamilia('40'), margenFamilia('10')]
    expect(resolverMargen(TARIFA, articulo({ subfamiliaCodigo: 'SUB-1' }), margenes)).toEqual({
      estado: 'RESUELTO', porcentaje: '40', origen: 'SUBFAMILIA',
    })
  })

  it('cae a la familia si la subfamilia del artículo no tiene fila', () => {
    const margenes = [margenFamilia('10'), margenSubfamilia('40', 'SUB-2')]
    expect(resolverMargen(TARIFA, articulo({ subfamiliaCodigo: 'SUB-1' }), margenes)).toEqual({
      estado: 'RESUELTO', porcentaje: '10', origen: 'FAMILIA',
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
      estado: 'CALCULADO', precio: '110.0000', porcentaje: '10', origen: 'FAMILIA',
    })
  })

  it('margen cero deja el precio igual al coste, y no es lo mismo que no tener margen', () => {
    expect(calcularPrecioVenta(TARIFA, articulo(), '37.5000', [margenFamilia('0')])).toEqual({
      estado: 'CALCULADO', precio: '37.5000', porcentaje: '0', origen: 'FAMILIA',
    })
    expect(calcularPrecioVenta(TARIFA, articulo(), '37.5000', [])).toEqual({
      estado: 'NO_CALCULABLE', motivo: 'SIN_MARGEN_CONFIGURADO',
    })
  })

  // Coste cero es un coste, no un dato ausente: el precio sale cero y calculado.
  it('coste cero da precio cero calculado', () => {
    expect(calcularPrecioVenta(TARIFA, articulo(), '0.0000', [margenFamilia('50')])).toEqual({
      estado: 'CALCULADO', precio: '0.0000', porcentaje: '50', origen: 'FAMILIA',
    })
  })

  it('admite porcentaje con decimales sin perder dígitos', () => {
    expect(calcularPrecioVenta(TARIFA, articulo(), '200.0000', [margenFamilia('12.5')])).toEqual({
      estado: 'CALCULADO', precio: '225.0000', porcentaje: '12.5', origen: 'FAMILIA',
    })
  })

  // El caso que justifica el Decimal: en coma flotante 1,005 es 1,00499999…
  // y este precio redondearía a 20,1000 en vez de a 20,1100.
  it('redondea a la mitad hacia afuera, como PostgreSQL', () => {
    expect(calcularPrecioVenta(TARIFA, articulo(), '0.0201', [margenFamilia('0')])).toEqual({
      estado: 'CALCULADO', precio: '0.0201', porcentaje: '0', origen: 'FAMILIA',
    })
    expect(calcularPrecioVenta(TARIFA, articulo(), '1.00', [margenFamilia('0.005')])).toEqual({
      estado: 'CALCULADO', precio: '1.0001', porcentaje: '0.005', origen: 'FAMILIA',
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
        { articuloCodigo: 'ART-1', resultado: { estado: 'CALCULADO', precio: '110.0000', porcentaje: '10', origen: 'FAMILIA' } },
        { articuloCodigo: 'ART-2', resultado: { estado: 'CALCULADO', precio: '140.0000', porcentaje: '40', origen: 'SUBFAMILIA' } },
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
