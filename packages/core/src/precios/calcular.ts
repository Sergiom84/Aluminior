/**
 * Valoración: del despiece al precio.
 *
 * El precio de un elemento configurado sale de sumar lo que cuesta cada pieza
 * que lo compone, según el artículo, su unidad de medida y la tarifa aplicable.
 *
 * Reglas heredadas del sistema original:
 *   ML  se cobra por metro lineal consumido, respetando metraje mínimo y
 *       múltiplos de corte (una barra no se parte en cualquier medida)
 *   UD  se cobra por unidades
 *   M2  se cobra por superficie
 *
 * IMPORTANTE: si falta el precio de un artículo, la línea NO se valora en cero.
 * Se devuelve como incidencia. Un presupuesto que se queda corto en silencio
 * es dinero perdido en cada venta.
 */

import type { PiezaCortada } from '../despiece/calcular.ts'

export interface DatosArticuloPrecio {
  codigo: string
  tipoMetraje: string
  /** Precio unitario según tarifa y acabado. null si no está tarifado. */
  precio: number | null
  metrajeMinimo: number | null
  metrajeMultiploLargo: number | null
}

export interface LineaValorada {
  articuloCodigo: string
  tipoMetraje: string
  /** Cantidad facturable ya ajustada (metros, unidades o m²). */
  cantidadFacturable: number
  precioUnitario: number | null
  importe: number | null
  incidencia: string | null
}

export interface ResultadoValoracion {
  lineas: LineaValorada[]
  /** Suma de lo que sí se ha podido valorar. */
  importe: number
  /** Artículos sin precio en la tarifa. El importe está incompleto si los hay. */
  sinPrecio: string[]
  completa: boolean
}

/**
 * Ajusta el consumo de un artículo por metro lineal.
 *
 * Dos correcciones del mundo real:
 *  - metraje mínimo: aunque cortes 20 cm, te cobran el mínimo
 *  - múltiplo de largo: el consumo se redondea hacia arriba al múltiplo
 */
export function ajustarMetraje(
  metros: number,
  minimo: number | null,
  multiplo: number | null,
): number {
  let m = metros
  if (multiplo && multiplo > 0) m = Math.ceil(m / multiplo) * multiplo
  if (minimo && minimo > 0 && m < minimo) m = minimo
  return m
}

export function valorarDespiece(
  piezas: PiezaCortada[],
  articulos: Map<string, DatosArticuloPrecio>,
): ResultadoValoracion {
  // Agrupar consumo por artículo antes de valorar: los mínimos y múltiplos
  // aplican al total del elemento, no a cada corte por separado.
  const porArticulo = new Map<string, { unidades: number; metros: number }>()

  for (const p of piezas) {
    const acc = porArticulo.get(p.articuloCodigo) ?? { unidades: 0, metros: 0 }
    acc.unidades += p.cantidad
    if (p.largoMm !== null) acc.metros += (p.largoMm / 1000) * p.cantidad
    porArticulo.set(p.articuloCodigo, acc)
  }

  const lineas: LineaValorada[] = []
  const sinPrecio: string[] = []
  let importe = 0

  for (const [codigo, consumo] of porArticulo) {
    const art = articulos.get(codigo)

    if (!art) {
      lineas.push({
        articuloCodigo: codigo, tipoMetraje: '?', cantidadFacturable: consumo.unidades,
        precioUnitario: null, importe: null,
        incidencia: 'artículo no encontrado en el catálogo',
      })
      sinPrecio.push(codigo)
      continue
    }

    let cantidad: number
    switch (art.tipoMetraje) {
      case 'ML':
        cantidad = ajustarMetraje(consumo.metros, art.metrajeMinimo, art.metrajeMultiploLargo)
        break
      case 'M2':
        // Sin datos de ancho por pieza, se factura por unidades. Pendiente de
        // modelar la superficie real cuando se incorporen los vidrios.
        cantidad = consumo.unidades
        break
      default:
        cantidad = consumo.unidades
    }

    if (art.precio === null) {
      lineas.push({
        articuloCodigo: codigo, tipoMetraje: art.tipoMetraje, cantidadFacturable: cantidad,
        precioUnitario: null, importe: null,
        incidencia: 'sin precio en esta tarifa',
      })
      sinPrecio.push(codigo)
      continue
    }

    const imp = cantidad * art.precio
    importe += imp
    lineas.push({
      articuloCodigo: codigo, tipoMetraje: art.tipoMetraje, cantidadFacturable: cantidad,
      precioUnitario: art.precio, importe: imp, incidencia: null,
    })
  }

  return {
    lineas,
    importe: Math.round(importe * 100) / 100,
    sinPrecio,
    completa: sinPrecio.length === 0,
  }
}
