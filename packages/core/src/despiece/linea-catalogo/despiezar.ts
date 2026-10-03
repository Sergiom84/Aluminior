/**
 * Despiece y valoración completos de una línea de estructura desde catálogo.
 *
 * Estructuras de diseño: ranuras por la serie, medidas de la plantilla,
 * asociaciones (serie y herraje por grupo de hojas), vidrio, junquillos,
 * juntas y mano de obra. Estructuras estándar (uniones): lista de artículos.
 * Compacto, mosquitera y tapajuntas de la línea añaden su plantilla condicionada.
 * Después, el ajuste manual de fabricación y el importe por fila. Cualquier
 * dato ausente o regla sin contrastar deja el importe en null: nunca un total
 * parcial. Contraste con facturas 2026: docs/paridad/fase-7/06.
 */

import { importeFila, redondearCentimos } from '../../precios/importe-fila.ts'
import { despiezarAccesoriosVentana, despiezarCompacto } from './compacto.ts'
import { despiezarDiseno } from './diseno.ts'
import { despiezarEstandar } from './estandar.ts'
import { fila } from './parcial.ts'
import type { CatalogoLinea, EntradaLineaCatalogo, ResultadoLineaCatalogo } from './tipos.ts'

const ARTICULO_MANO_OBRA = 'MO'
const ARTICULO_COLOCACION = 'MOCOL'

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
  for (const f of filas) {
    const r = importeFila(f, catalogo.tarifa(f.articulo, f.acabado))
    f.metraje = r.metraje
    f.precio = r.precio
    f.importe = r.importe
    if (r.incidencia) incidencias.push(`${f.articulo}: ${r.incidencia}`)
    else total += r.importe!
  }
  const unicas = [...new Set(incidencias)]
  return { filas, importe: unicas.length ? null : redondearCentimos(total), incidencias: unicas, avisos: [...new Set(avisos)] }
}
