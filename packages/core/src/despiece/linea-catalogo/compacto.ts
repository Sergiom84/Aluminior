/**
 * Compacto de persiana dentro de una línea de estructura (`VAccesorios`).
 *
 * El compacto es una estructura estándar propia (COM009, COM005…) cuyas filas
 * de plantilla se condicionan con `OPCformulaSelec`: productos de términos
 * `G{grupo}O{opcion}` que deben estar todos marcados (`VOpciones`). Ejemplo
 * COM009: `COMPVAL` a `L × (A+CVI+CVD)` con G1O0 (sin guía central), dos paños
 * con G1O1 y una fila `MOCOMP` de 15 minutos sin condición.
 *
 * Medidas, contrastadas en EMP0016 (357/357 compactos de estructuras
 * independientes): el alto de la línea es la ventana (corte MV = Largo) y el
 * compacto mide ventana + cajón (`compDtoHuecoSN`, CHM 5.1.2.13.1.1). Variables
 * de fórmula: CVI/CVD (vuelos), CAJ (alto de cajón) y CGC (posición de la guía
 * central). Un descuento vertical adicional no tiene caso contrastado: bloquea.
 */

import { evaluar } from '../formula.ts'
import { fila, parcialVacio, type DespieceParcial } from './parcial.ts'
import type { CatalogoLinea, CompactoLineaCatalogo } from './tipos.ts'

const TERMINO = /^G(\d+)O(\d+)$/i

/** Términos `G{g}O{o}` de una fórmula de selección; null si no sigue la gramática observada. */
export function terminosSeleccion(formula: string | null | undefined): { grupo: number; opcion: number }[] | null {
  if (!formula?.trim()) return []
  const terminos = formula.split('*').map(t => TERMINO.exec(t.trim()))
  if (terminos.some(t => !t)) return null
  return terminos.map(t => ({ grupo: Number(t![1]), opcion: Number(t![2]) }))
}

export function despiezarCompacto(
  catalogo: CatalogoLinea,
  compacto: CompactoLineaCatalogo,
  ventana: { anchoMm: number; altoMm: number },
): DespieceParcial {
  const r = parcialVacio()
  const plantilla = catalogo.plantilla(compacto.estructura)
  if (!plantilla.length) { r.incidencias.push(`compacto ${compacto.estructura} sin plantilla`); return r }
  if (compacto.descuentoVerticalMm) {
    r.incidencias.push(`compacto ${compacto.estructura}: descuento vertical adicional sin caso contrastado`)
    return r
  }
  const marcadas = new Map<number, Set<number>>()
  for (const o of compacto.opciones) {
    const t = terminosSeleccion(o)
    if (!t || t.length !== 1) { r.incidencias.push(`compacto ${compacto.estructura}: opción ${o} ilegible`); return r }
    marcadas.set(t[0]!.grupo, (marcadas.get(t[0]!.grupo) ?? new Set()).add(t[0]!.opcion))
  }
  const contexto = { A: ventana.anchoMm, L: ventana.altoMm + compacto.altoCajonMm, CAJ: compacto.altoCajonMm,
    CVI: compacto.vueloIzquierdoMm, CVD: compacto.vueloDerechoMm, CGC: compacto.posicionGuiaCentralMm }
  const medir = (formula: string | null) => {
    if (!formula?.trim()) return null
    try { return evaluar(formula, contexto) } catch (e) { r.incidencias.push((e as Error).message); return null }
  }
  for (const f of plantilla) {
    const terminos = terminosSeleccion(f.formulaSeleccion)
    if (!terminos) { r.incidencias.push(`compacto ${compacto.estructura}: selección ${f.formulaSeleccion} ilegible`); continue }
    // Un grupo condicionante sin una única opción marcada no permite decidir la fila.
    const sinDecidir = terminos.find(t => marcadas.get(t.grupo)?.size !== 1)
    if (sinDecidir) { r.incidencias.push(`compacto ${compacto.estructura}: grupo G${sinDecidir.grupo} sin una opción marcada`); continue }
    if (!terminos.every(t => marcadas.get(t.grupo)!.has(t.opcion))) continue
    if (!f.articulo || f.articulo === '0') continue
    const articulo = catalogo.articulo(f.articulo)
    if (!articulo) { r.incidencias.push(`artículo ${f.articulo} ausente del catálogo`); continue }
    r.filas.push(fila({
      origen: 'compacto', articulo: f.articulo, acabado: compacto.acabado, cantidad: f.cantidad, funcion: f.funcion,
      largoMm: articulo.tipoMetraje === 'UD' ? null : medir(f.formulaLargo),
      anchoMm: articulo.tipoMetraje === 'M2' ? medir(f.formulaAncho) : null,
    }))
  }
  r.incidencias = [...new Set(r.incidencias)]
  return r
}
