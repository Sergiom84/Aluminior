/**
 * Despiece y valoración completos de una línea de estructura desde catálogo.
 *
 * Estructuras de diseño: ranuras por la serie, medidas de la plantilla,
 * asociaciones (serie y herraje por grupo de hojas), vidrio, junquillos,
 * juntas y mano de obra. Estructuras estándar (uniones): lista de artículos.
 * Compacto, mosquitera y tapajuntas de la línea añaden su plantilla condicionada.
 * Después, el ajuste manual de fabricación y el importe por fila. Cualquier
 * dato ausente o regla sin contrastar deja el importe en null: nunca un total
 * parcial. Excepción medida: la pieza de un artículo de catálogo sin fila de PVP
 * para su acabado vale 0, con aviso, como en Productor (EMP0016, 48.336 de 48.359).
 * Contraste con facturas 2026: docs/paridad/fase-7/06.
 */

import { importeFila, redondearCentimos } from '../../precios/importe-fila.ts'
import { incidenciaPrecioEnTabla } from '../../precios/precio-en-tabla.ts'
import { buscarPrecioManual, tarifaConPrecioManual, type PiezaSinPrecio } from '../../precios/precio-manual.ts'
import { despiezarAccesoriosVentana, despiezarCompacto } from './compacto.ts'
import { despiezarDiseno } from './diseno.ts'
import { despiezarEstandar } from './estandar.ts'
import { fila } from './parcial.ts'
import type { CatalogoLinea, EntradaLineaCatalogo, ResultadoLineaCatalogo } from './tipos.ts'

const ARTICULO_MANO_OBRA = 'MO'
const ARTICULO_COLOCACION = 'MOCOL'
const SIN_PVP = 'sin PVP en la tarifa'
/** Prefijo del aviso de piezas valoradas a 0 por no tener fila de PVP en su acabado. */
export const AVISO_A_CERO = 'sin PVP en su acabado, valorado a 0 € como en Productor'

export function despiezarLineaCatalogo(catalogo: CatalogoLinea, entrada: EntradaLineaCatalogo): ResultadoLineaCatalogo {
  const serie = catalogo.serie(entrada.serie)
  if (!serie) return { filas: [], importe: null, incidencias: [`serie ${entrada.serie} ausente del catálogo`], avisos: [] }
  const plantilla = catalogo.plantilla(entrada.estructura)
  if (!plantilla.length) return { filas: [], importe: null, incidencias: [`estructura ${entrada.estructura} sin plantilla`], avisos: [] }

  const conDiseno = plantilla.filter(f => f.id !== 0)
  const parcial = conDiseno.length
    ? despiezarDiseno(catalogo, entrada, serie, conDiseno)
    : despiezarEstandar(catalogo, entrada, plantilla)
  const { filas, incidencias, avisos } = parcial
  const ventana = { anchoMm: entrada.anchoMm, altoMm: entrada.altoMm }
  for (const accesorio of [
    ...entrada.compacto ? [despiezarCompacto(catalogo, entrada.compacto, ventana)] : [],
    ...entrada.accesorios?.length ? [despiezarAccesoriosVentana(catalogo, entrada.accesorios, ventana, entrada.compacto)] : [],
  ]) { filas.push(...accesorio.filas); incidencias.push(...accesorio.incidencias); avisos.push(...accesorio.avisos) }

  if (entrada.minutosFabricacionAdicionales && entrada.minutosFabricacionAdicionales > 0) {
    filas.push(fila({ origen: 'mano-obra', articulo: ARTICULO_MANO_OBRA, acabado: entrada.acabadoAccesorios,
      cantidad: entrada.minutosFabricacionAdicionales, largoMm: null, funcion: 'MO' }))
  }
  if (entrada.minutosColocacion && entrada.minutosColocacion > 0) {
    filas.push(fila({ origen: 'mano-obra', articulo: ARTICULO_COLOCACION, acabado: entrada.acabadoAccesorios,
      cantidad: entrada.minutosColocacion, largoMm: null, funcion: 'MOCOL' }))
  }

  let total = 0
  const sinPrecio: PiezaSinPrecio[] = [], conPrecioManual = new Set<string>(), aCero = new Set<string>()
  for (const f of filas) {
    const articulo = catalogo.articulo(f.articulo)
    const bloqueo = incidenciaPrecioEnTabla(f.articulo, articulo?.precioEnTabla)
    let tarifa = catalogo.tarifa(f.articulo, f.acabado)
    if (articulo?.precioEnTabla === true && catalogo.precioTabla) {
      if (articulo.tipoMetraje !== 'UD') { incidencias.push(`${f.articulo}: precio por tabla para ${articulo.tipoMetraje} sin contrastar`); continue }
      const tabla = catalogo.precioTabla(f.articulo, f.acabado, f.anchoMm, f.largoMm)
      if (!tabla.completo) { incidencias.push(`${f.articulo}: ${tabla.motivo}`); continue }
      tarifa = { tipoMetraje: 'UD', pvp: tabla.precio, minimo: 0, multiploAnchoCm: 0, multiploLargoCm: 0, incrementos: [] }
    } else if (bloqueo) { incidencias.push(bloqueo); continue }
    const efectiva = tarifaConPrecioManual(tarifa, buscarPrecioManual(entrada.preciosManuales, f.articulo, f.acabado))
    if (efectiva.manual) { f.precioManual = true; conPrecioManual.add(f.articulo) }
    const r = importeFila(f, efectiva.tarifa)
    f.metraje = r.metraje
    f.precio = r.precio
    f.importe = r.importe
    if (r.incidencia === SIN_PVP && tarifa) sinPrecio.push({ articulo: f.articulo, acabado: f.acabado,
      tipoMetraje: tarifa.tipoMetraje, cantidad: f.cantidad, largoMm: f.largoMm, anchoMm: f.anchoMm })
    if (r.incidencia === SIN_PVP && tarifa?.sinFilaPvp && r.metraje !== null) {
      // Como Productor: sin fila de PVP para el acabado, la pieza vale 0 y se dice.
      f.precio = 0
      f.importe = 0
      aCero.add(`${f.articulo} en ${f.acabado || 'sin acabado'}`)
    } else if (r.incidencia) incidencias.push(`${f.articulo}: ${r.incidencia}`)
    else total += r.importe!
  }
  if (aCero.size) avisos.push(`${AVISO_A_CERO}: ${[...aCero].join(', ')}`)
  if (conPrecioManual.size) avisos.push(`precio puesto a mano: ${[...conPrecioManual].join(', ')}`)
  const unicas = [...new Set(incidencias)]
  return { filas, importe: unicas.length ? null : redondearCentimos(total), incidencias: unicas,
    avisos: [...new Set(avisos)], ...(sinPrecio.length ? { sinPrecio } : {}) }
}
