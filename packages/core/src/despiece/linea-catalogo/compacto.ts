/**
 * Accesorios de línea (`VAccesorios`): compacto de persiana, mosquitera y
 * tapajuntas. Cada uno es una estructura estándar propia (COM009, PSM001,
 * GMT004…) cuyas filas de plantilla se condicionan con `OPCformulaSelec`:
 * productos de términos `G{grupo}O{opcion}` que deben estar todos marcados
 * (`VOpciones`). Ejemplo COM009: `COMPVAL` a `L × (A+CVI+CVD)` con G1O0 (sin
 * guía central), dos paños con G1O1 y `MOCOMP` de 15 minutos sin condición;
 * GMT004: un perfil por lado (G1..G4) a `A+2*40` o `L+CAJ+2*40`.
 *
 * Medidas contrastadas en EMP0016: el alto de la línea es la ventana (corte MV =
 * Largo, 357/357) y el compacto mide ventana + cajón (`compDtoHuecoSN`, CHM
 * 5.1.2.13.1.1; 357/357). Mosquitera y tapajuntas se miden con la ventana y
 * `CAJ`, el cajón del compacto de la misma línea (0 sin compacto). Variables del
 * compacto: CVI/CVD (vuelos) y CGC (guía central). Un descuento vertical
 * adicional del compacto no tiene caso contrastado: bloquea.
 */

import { evaluar } from '../formula.ts'
import { fila, parcialVacio, type DespieceParcial } from './parcial.ts'
import type { AccesorioLineaCatalogo, CatalogoLinea, CompactoLineaCatalogo } from './tipos.ts'

const TERMINO = /^G(\d+)O(\d+)$/i

/** Términos `G{g}O{o}` de una fórmula de selección; null si no sigue la gramática observada. */
export function terminosSeleccion(formula: string | null | undefined): { grupo: number; opcion: number }[] | null {
  if (!formula?.trim()) return []
  const terminos = formula.split('*').map(t => TERMINO.exec(t.trim()))
  if (terminos.some(t => !t)) return null
  return terminos.map(t => ({ grupo: Number(t![1]), opcion: Number(t![2]) }))
}

function despiezarAccesorio(catalogo: CatalogoLinea, accesorio: AccesorioLineaCatalogo,
  contexto: Readonly<Record<string, number>>): DespieceParcial {
  const r = parcialVacio(), codigo = accesorio.estructura
  const plantilla = catalogo.plantilla(codigo)
  if (!plantilla.length) { r.incidencias.push(`accesorio ${codigo} sin plantilla`); return r }
  const marcadas = new Map<number, Set<number>>()
  for (const o of accesorio.opciones) {
    const t = terminosSeleccion(o)
    if (!t || t.length !== 1) { r.incidencias.push(`accesorio ${codigo}: opción ${o} ilegible`); return r }
    marcadas.set(t[0]!.grupo, (marcadas.get(t[0]!.grupo) ?? new Set()).add(t[0]!.opcion))
  }
  const medir = (formula: string | null) => {
    if (!formula?.trim()) return null
    try { return evaluar(formula, contexto) } catch (e) { r.incidencias.push((e as Error).message); return null }
  }
  for (const f of plantilla) {
    const terminos = terminosSeleccion(f.formulaSeleccion)
    if (!terminos) { r.incidencias.push(`accesorio ${codigo}: selección ${f.formulaSeleccion} ilegible`); continue }
    // Un grupo condicionante sin una única opción marcada no permite decidir la fila.
    const sinDecidir = terminos.find(t => marcadas.get(t.grupo)?.size !== 1)
    if (sinDecidir) { r.incidencias.push(`accesorio ${codigo}: grupo G${sinDecidir.grupo} sin una opción marcada`); continue }
    if (!terminos.every(t => marcadas.get(t.grupo)!.has(t.opcion))) continue
    if (!f.articulo || f.articulo === '0') continue
    const articulo = catalogo.articulo(f.articulo)
    if (!articulo) { r.incidencias.push(`artículo ${f.articulo} ausente del catálogo`); continue }
    r.filas.push(fila({
      origen: 'compacto', articulo: f.articulo, acabado: accesorio.acabado, cantidad: f.cantidad, funcion: f.funcion,
      largoMm: articulo.tipoMetraje === 'UD' ? null : medir(f.formulaLargo),
      anchoMm: articulo.tipoMetraje === 'M2' ? medir(f.formulaAncho) : null,
    }))
  }
  r.incidencias = [...new Set(r.incidencias)]
  return r
}

export function despiezarCompacto(
  catalogo: CatalogoLinea,
  compacto: CompactoLineaCatalogo,
  ventana: { anchoMm: number; altoMm: number },
): DespieceParcial {
  if (compacto.descuentoVerticalMm) {
    return { ...parcialVacio(), incidencias: [`accesorio ${compacto.estructura}: descuento vertical adicional sin caso contrastado`] }
  }
  return despiezarAccesorio(catalogo, compacto, { A: ventana.anchoMm, L: ventana.altoMm + compacto.altoCajonMm,
    CAJ: compacto.altoCajonMm, CVI: compacto.vueloIzquierdoMm, CVD: compacto.vueloDerechoMm, CGC: compacto.posicionGuiaCentralMm })
}

/** Mosquitera y tapajuntas: medida de la ventana y cajón del compacto de la línea. */
export function despiezarAccesoriosVentana(
  catalogo: CatalogoLinea,
  accesorios: readonly AccesorioLineaCatalogo[],
  ventana: { anchoMm: number; altoMm: number },
  compacto: CompactoLineaCatalogo | null | undefined,
): DespieceParcial {
  const r = parcialVacio()
  for (const a of accesorios) {
    const p = despiezarAccesorio(catalogo, a, { A: ventana.anchoMm, L: ventana.altoMm, CAJ: compacto?.altoCajonMm ?? 0 })
    r.filas.push(...p.filas); r.incidencias.push(...p.incidencias)
  }
  return r
}
