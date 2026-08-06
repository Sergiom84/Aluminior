/**
 * Del coste al precio de venta: qué margen aplica y cuánto sale (G4).
 *
 * ANTES DE NADA, LA PALABRA «TARIFA» SIGNIFICA DOS COSAS AQUÍ DENTRO:
 *
 *   - `precios/tarifa.ts` es la tarifa de COMPRA: valida el fichero que manda
 *     el proveedor y protege del cargador de ETL las históricas 1/2/3.
 *   - Este módulo trabaja con la tarifa de VENTA (`precios/tarifa-venta.ts`):
 *     la lista de precios con la que se valora un presupuesto.
 *
 * Comparten numeración —hay una sola tabla de tarifas, según la documentación
 * oficial del fabricante— y las distingue una marca, `validaParaVentas`. Si
 * estás leyendo esto para tocar precios de un presupuesto, estás en el módulo
 * correcto; si vienes del ETL, el tuyo es el otro.
 *
 * EL MARGEN NO ES UN PORCENTAJE DE LA TARIFA. La documentación oficial
 * (docs.gaia-soft.com/docs/tarifas-de-precios-de-venta.md, 06/08/2026) lo
 * relaciona por FAMILIA y por SUBFAMILIA de artículos: las herramientas de
 * copia son `Copiar % Beneficio Familias` y `Copiar % Beneficio Subfamilias`,
 * dos listas distintas. Un único porcentaje por tarifa habría sido más cómodo
 * y habría dado un precio equivocado en cuanto una familia se vende con otro
 * criterio, que es justo para lo que existe el desglose.
 *
 * NO HAY MARGEN POR DEFECTO. Si no hay fila ni de subfamilia ni de familia, el
 * precio no se calcula y se dice por qué. Inventar un cero convertiría una
 * configuración incompleta en una venta a precio de coste; inventar cualquier
 * otro número sería peor. Es la misma regla que ya sigue la valoración del
 * despiece: lo que falta se reporta, no se rellena.
 *
 * Aritmética con el `Decimal` de `precios/decimal.ts` (texto, enteros
 * escalados, redondeo como PostgreSQL). Ningún `number` toca un importe.
 *
 * Funciones PURAS. La lectura de tarifas, márgenes y costes es de quien llama.
 *
 * QUÉ NO ESTÁ AQUÍ: los márgenes reales del taller. Son un dato del titular,
 * pendiente de confirmar. Este módulo modela la forma, no los números.
 */

import {
  compararDecimal,
  dividirDecimal,
  multiplicarDecimal,
  restarDecimal,
  sumarDecimal,
  type Decimal,
} from './decimal.ts'
import { admitirTarifaEnVentas, permitirActualizacionTarifa, type TarifaVenta } from './tarifa-venta.ts'

/** Escala de `articulos_pvp.precio`: `numeric(12,4)`. */
export const ESCALA_PRECIO_VENTA = 4

/**
 * Un porcentaje de beneficio configurado para una tarifa.
 *
 * `subfamiliaCodigo: null` es la fila de la FAMILIA entera. Una fila de
 * subfamilia lleva también su familia porque el código de subfamilia sólo es
 * único dentro de ella (`subfamilias.familia_codigo` en el esquema), y casar
 * sólo por subfamilia mezclaría márgenes de familias distintas.
 */
/**
 * Contra qué se mide el porcentaje. Es una opción de la familia en Productor,
 * `Tipo de Margen`, y NO es cosmética: con el mismo 20% sobre un coste de 15 €
 * el precio sale 18,00 sobre coste y 18,75 sobre venta. El fabricante publica
 * ese mismo ejemplo en `docs/precios-de-coste-y-venta.md`.
 *
 * `SOBRE_VENTA` existe porque le resulta más cómodo a quien presupuesta: si
 * sabe que aplica un 20% sobre venta, ese 20% del precio final es su beneficio,
 * sin necesidad de conocer el coste.
 */
export type TipoMargen = 'SOBRE_COSTE' | 'SOBRE_VENTA'

export interface MargenTarifa {
  tarifaCodigo: number
  familiaCodigo: string
  subfamiliaCodigo: string | null
  /** Tanto por ciento, en texto decimal. Su base la fija `tipo`. */
  porcentaje: Decimal
  tipo: TipoMargen
}

/** Lo que hace falta saber del artículo para resolver su margen. */
export interface ArticuloClasificado {
  codigo: string
  familiaCodigo: string | null
  subfamiliaCodigo: string | null
}

/** De dónde salió el porcentaje aplicado. Se conserva para poder auditarlo. */
export type OrigenMargen = 'SUBFAMILIA' | 'FAMILIA'

export type MotivoSinMargen =
  | 'TARIFA_NO_VALIDA_PARA_VENTAS'
  | 'ARTICULO_SIN_FAMILIA'
  | 'SIN_MARGEN_CONFIGURADO'
  /**
   * Margen sobre venta del 100% o más: el beneficio se comería el precio entero
   * y la fórmula divide entre cero o cambia de signo. No hay precio que
   * devolver, así que se reporta en vez de inventar uno.
   */
  | 'MARGEN_SOBRE_VENTA_IMPOSIBLE'

export type ResolucionMargen =
  | { estado: 'RESUELTO'; porcentaje: Decimal; origen: OrigenMargen; tipo: TipoMargen }
  | { estado: 'NO_RESOLUBLE'; motivo: MotivoSinMargen }

/**
 * Qué margen aplica a un artículo dentro de una tarifa.
 *
 * La subfamilia GANA a la familia cuando hay fila para ella: es el grano más
 * fino que el operador ha configurado a mano, y la familia es el criterio
 * general del que quiso apartarse. Que el artículo tenga subfamilia pero ésta
 * no tenga fila no es un fallo: se cae a la familia, que es el comportamiento
 * de dos listas donde la segunda es opcional.
 *
 * Una tarifa que no vale para ventas se rechaza aquí también, no sólo al
 * calcular: resolver el margen de una tarifa de coste no significa nada.
 */
export function resolverMargen(
  tarifa: TarifaVenta,
  articulo: ArticuloClasificado,
  margenes: readonly MargenTarifa[],
): ResolucionMargen {
  if (admitirTarifaEnVentas(tarifa).estado === 'RECHAZADA') {
    return { estado: 'NO_RESOLUBLE', motivo: 'TARIFA_NO_VALIDA_PARA_VENTAS' }
  }
  if (articulo.familiaCodigo === null) {
    // Sin familia no hay nada contra lo que casar: ni siquiera se puede caer al
    // criterio general. Es distinto de «hay familia y nadie le puso margen», y
    // se investiga distinto, así que el motivo es otro.
    return { estado: 'NO_RESOLUBLE', motivo: 'ARTICULO_SIN_FAMILIA' }
  }

  const deLaTarifa = margenes.filter(
    (m) => m.tarifaCodigo === tarifa.codigo && m.familiaCodigo === articulo.familiaCodigo,
  )

  if (articulo.subfamiliaCodigo !== null) {
    const deSubfamilia = deLaTarifa.find((m) => m.subfamiliaCodigo === articulo.subfamiliaCodigo)
    if (deSubfamilia) return resuelto(deSubfamilia, 'SUBFAMILIA')
  }

  const deFamilia = deLaTarifa.find((m) => m.subfamiliaCodigo === null)
  if (deFamilia) return resuelto(deFamilia, 'FAMILIA')

  return { estado: 'NO_RESOLUBLE', motivo: 'SIN_MARGEN_CONFIGURADO' }
}

/**
 * Empaqueta la fila encontrada, comprobando antes que sea aplicable.
 *
 * El único caso imposible es el margen sobre venta del 100% o más: `1 - %/100`
 * vale cero o negativo, y ahí no hay precio. Se detecta al resolver y no al
 * dividir, para que quien pregunte «¿qué margen aplica?» ya reciba el problema.
 */
function resuelto(fila: MargenTarifa, origen: OrigenMargen): ResolucionMargen {
  if (fila.tipo === 'SOBRE_VENTA' && compararDecimal(fila.porcentaje, '100') >= 0) {
    return { estado: 'NO_RESOLUBLE', motivo: 'MARGEN_SOBRE_VENTA_IMPOSIBLE' }
  }
  return { estado: 'RESUELTO', porcentaje: fila.porcentaje, origen, tipo: fila.tipo }
}

export type PrecioVenta =
  | {
      estado: 'CALCULADO'
      precio: Decimal
      porcentaje: Decimal
      origen: OrigenMargen
      tipo: TipoMargen
    }
  | { estado: 'NO_CALCULABLE'; motivo: MotivoSinMargen }

/**
 * Del coste al precio, según contra qué mida el porcentaje su familia:
 *
 *   SOBRE_COSTE:  precio = coste × (1 + %/100)
 *   SOBRE_VENTA:  precio = coste / (1 − %/100)
 *
 * Con 15 € de coste y un 20%, eso son 18,00 y 18,75 respectivamente. Aplicar la
 * primera fórmula a una familia configurada con la segunda no es un decimal de
 * diferencia: es vender por debajo del margen que el operador cree tener.
 *
 * Dividir el porcentaje entre cien es desplazar la coma —exacto, sin división—
 * y la suma o resta contra uno no descarta ningún dígito. En `SOBRE_COSTE` el
 * único redondeo sigue siendo el de la escala de salida; en `SOBRE_VENTA` el
 * cociente redondea ahí también, porque dividir no cierra.
 */
export function calcularPrecioVenta(
  tarifa: TarifaVenta,
  articulo: ArticuloClasificado,
  coste: Decimal,
  margenes: readonly MargenTarifa[],
): PrecioVenta {
  const margen = resolverMargen(tarifa, articulo, margenes)
  if (margen.estado === 'NO_RESOLUBLE') {
    return { estado: 'NO_CALCULABLE', motivo: margen.motivo }
  }

  const fraccion = dividirEntreCien(margen.porcentaje)
  const decimales = decimalesDe(fraccion)
  const precio =
    margen.tipo === 'SOBRE_COSTE'
      ? multiplicarDecimal(coste, sumarDecimal('1', fraccion, decimales), ESCALA_PRECIO_VENTA)
      : dividirDecimal(coste, restarDecimal('1', fraccion, decimales), ESCALA_PRECIO_VENTA)

  return {
    estado: 'CALCULADO',
    precio,
    porcentaje: margen.porcentaje,
    origen: margen.origen,
    tipo: margen.tipo,
  }
}

/** Una línea del recálculo masivo: el artículo y su desenlace. */
export interface LineaRecalculo {
  articuloCodigo: string
  resultado: PrecioVenta
}

export type RecalculoTarifa =
  | { estado: 'RECHAZADO'; motivo: 'TARIFA_BLOQUEADA' | 'TARIFA_NO_VALIDA_PARA_VENTAS' }
  | { estado: 'APLICADO'; lineas: LineaRecalculo[]; sinMargen: string[]; completo: boolean }

/**
 * Recalcula desde el coste los precios de venta de una tarifa entera.
 *
 * Comprueba el bloqueo ANTES de calcular nada: es el proceso masivo que el
 * bloqueo existe para frenar, y devolver un lote de precios «que no se van a
 * escribir» invita a que alguien los escriba igualmente.
 *
 * Los artículos sin margen no salen a precio de coste ni desaparecen: salen con
 * su motivo y marcan el lote como incompleto, igual que la valoración del
 * despiece hace con los artículos sin precio.
 */
export function recalcularPreciosDeVenta(
  tarifa: TarifaVenta,
  articulos: readonly { articulo: ArticuloClasificado; coste: Decimal }[],
  margenes: readonly MargenTarifa[],
): RecalculoTarifa {
  const permiso = permitirActualizacionTarifa(tarifa)
  if (permiso.estado === 'DENEGADA') return { estado: 'RECHAZADO', motivo: permiso.motivo }

  const admision = admitirTarifaEnVentas(tarifa)
  if (admision.estado === 'RECHAZADA') return { estado: 'RECHAZADO', motivo: admision.motivo }

  const lineas: LineaRecalculo[] = []
  const sinMargen: string[] = []
  for (const { articulo, coste } of articulos) {
    const resultado = calcularPrecioVenta(tarifa, articulo, coste, margenes)
    if (resultado.estado === 'NO_CALCULABLE') sinMargen.push(articulo.codigo)
    lineas.push({ articuloCodigo: articulo.codigo, resultado })
  }
  return { estado: 'APLICADO', lineas, sinMargen, completo: sinMargen.length === 0 }
}

/**
 * `valor / 100` desplazando la coma, sin dividir y sin perder dígitos.
 *
 * `decimal.ts` no expone división, y con razón: dividir no cierra y obliga a
 * decidir un redondeo. Entre cien no hace falta ninguna de las dos cosas, así
 * que se hace aquí en local en vez de abrir una división genérica en el módulo
 * compartido para un solo uso.
 */
function dividirEntreCien(valor: Decimal): Decimal {
  const partes = /^([+-]?)(\d+)(?:\.(\d+))?$/.exec(valor.trim())
  if (!partes) throw new Error(`porcentaje no válido: ${valor}`)
  const [, signo, entera, decimales = ''] = partes
  const digitos = (entera + decimales).padStart(decimales.length + 3, '0')
  const escala = decimales.length + 2
  const corte = digitos.length - escala
  return `${signo === '-' ? '-' : ''}${digitos.slice(0, corte)}.${digitos.slice(corte)}`
}

/** Cuántos decimales trae el texto. Sirve para sumar sin descartar ninguno. */
function decimalesDe(valor: Decimal): number {
  const punto = valor.indexOf('.')
  return punto === -1 ? 0 : valor.length - punto - 1
}
