/**
 * Estructuras estándar (sin diseño): uniones, esquineros y accesorios cuya
 * plantilla es una lista de artículos con fórmulas, sin identificadores de
 * diseño. Esquinero PSU006: PSESQCOM a `L` y 10 minutos de mano de obra.
 * No reciben asociaciones de serie (0 de 60 uniones facturadas las llevan).
 */

import { evaluar } from '../formula.ts'
import { fila, parcialVacio, type DespieceParcial } from './parcial.ts'
import type { CatalogoLinea, EntradaLineaCatalogo, FilaPlantillaCatalogo } from './tipos.ts'

export function despiezarEstandar(
  catalogo: CatalogoLinea,
  entrada: EntradaLineaCatalogo,
  plantilla: readonly FilaPlantillaCatalogo[],
): DespieceParcial {
  const r = parcialVacio()
  const contexto = { ...(entrada.cotas ?? {}), A: entrada.anchoMm, L: entrada.altoMm }
  const medir = (formula: string | null) => {
    if (!formula?.trim()) return null
    try { return evaluar(formula, contexto) } catch (e) { r.incidencias.push((e as Error).message); return null }
  }
  for (const f of plantilla) {
    if (!f.articulo || f.articulo === '0') continue
    const articulo = catalogo.articulo(f.articulo)
    if (!articulo) { r.incidencias.push(`artículo ${f.articulo} ausente del catálogo`); continue }
    const largoMm = articulo.tipoMetraje === 'UD' ? null : medir(f.formulaLargo)
    const anchoMm = articulo.tipoMetraje === 'M2' ? medir(f.formulaAncho) : null
    r.filas.push(fila({
      origen: 'plantilla', articulo: f.articulo, acabado: articulo.tipoMetraje === 'UD' ? entrada.acabadoAccesorios : entrada.acabado,
      cantidad: f.cantidad, largoMm, anchoMm, funcion: f.funcion,
    }))
  }
  return r
}
