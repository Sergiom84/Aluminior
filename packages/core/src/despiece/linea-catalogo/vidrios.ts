/**
 * Vidrio, junquillos y juntas de las filas de cristal de una plantilla.
 * Tabla de hojas o de fijos según el tipo de hoja del cristal.
 */

import { evaluar, type Contexto } from '../formula.ts'
import { esTipoHojaMarco } from '../asociaciones/index.ts'
import { acristalarVidrio } from '../acristalamiento-catalogo.ts'
import type { MedidaPlantilla } from '../medidas-plantilla.ts'
import { fila, parcialVacio, type DespieceParcial } from './parcial.ts'
import type { ArticuloCatalogo, CatalogoLinea, EntradaLineaCatalogo, FilaPlantillaCatalogo, SerieCatalogo } from './tipos.ts'

const evaluarOnull = (formula: string | null, contexto: Contexto) => {
  if (!formula?.trim()) return null
  try { return evaluar(formula, contexto) } catch { return null }
}

export function despiezarVidrios(entrada: {
  catalogo: CatalogoLinea
  linea: EntradaLineaCatalogo
  serie: SerieCatalogo
  vidrio: ArticuloCatalogo | null
  cristales: readonly FilaPlantillaCatalogo[]
  medidas: ReadonlyMap<number, MedidaPlantilla>
  contexto: Contexto
  claveDescuento: (tipoHoja: string | null) => string
}): DespieceParcial {
  const { catalogo, linea, serie, vidrio, medidas, contexto } = entrada
  const r = parcialVacio()
  for (const f of entrada.cristales) {
    if (!linea.vidrio || !vidrio) { r.incidencias.push('estructura con vidrio sin vidrio elegido'); continue }
    const m = medidas.get(f.id)
    if (m?.largoMm == null || m.anchoMm == null) { r.incidencias.push(`vidrio: ${m?.incidencia ?? 'sin medida'}`); continue }
    // Vidrio o panel con el acabado principal y genérico de reserva: PAN16 118/118 en EMP0016.
    r.filas.push(fila({ origen: 'vidrio', articulo: linea.vidrio, acabado: linea.acabado, cantidad: f.cantidad,
      largoMm: m.largoMm, anchoMm: m.anchoMm }))
    const tabla = esTipoHojaMarco(f.tipoHoja) ? serie.tablaFijos : serie.tablaHojas
    const moduloLargo = evaluarOnull(f.formulaLargo, contexto)
    const moduloAncho = evaluarOnull(f.formulaAncho, contexto)
    if (m.referenciaLargoMm == null || m.referenciaAnchoMm == null || moduloLargo == null || moduloAncho == null || !tabla) {
      r.incidencias.push('acristalamiento sin referencias, módulo o tabla')
      continue
    }
    const acris = acristalarVidrio({
      grosorMm: vidrio.grosorAcristalar, referenciaLargoMm: m.referenciaLargoMm, referenciaAnchoMm: m.referenciaAnchoMm,
      moduloLargoMm: moduloLargo, moduloAnchoMm: moduloAncho, grupoIzquierdo: f.grupoIzquierdo ?? '',
      grupoDerecho: f.grupoDerecho ?? '', grupoSuperior: f.grupoSuperior ?? '', grupoInferior: f.grupoInferior ?? '',
      tipoHoja: entrada.claveDescuento(f.tipoHoja),
    }, catalogo.tablaAcristalamiento(tabla), catalogo.descuentos(linea.serie), c => !!catalogo.articulo(c))
    r.incidencias.push(...acris.incidencias)
    r.avisos.push(...acris.avisos)
    for (const p of acris.piezas) {
      r.filas.push(fila({ origen: 'acristalamiento', articulo: p.articulo, cantidad: p.cantidad, largoMm: p.largoMm,
        acabado: p.funcion === 'JUNQ' ? linea.acabado : linea.acabadoAccesorios, funcion: p.funcion }))
    }
  }
  return r
}
