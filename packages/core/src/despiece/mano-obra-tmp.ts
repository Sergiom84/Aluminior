/** TMP/16: selección por categoría y una aportación por concepto (fase 8/10). */
import type { ConceptoManoObraCatalogo, ElementoManoObra, MinutosFabricacion } from './mano-obra-fabricacion.ts'

export interface ContextoManoObraTmp {
  tipoPerfiles: string | null | undefined
  familia: string | null | undefined
  serie: string
}

interface ResultadoTmp {
  resuelto: boolean
  lineas: MinutosFabricacion[]
  conceptosTratados: string[]
  incidencias: string[]
}

/** No acredita el precio de un modelo: su consumidor debe limitar la cobertura. */
export function minutosTravesanosTmp(entrada: {
  elementos: readonly ElementoManoObra[]
  conceptos: readonly ConceptoManoObraCatalogo[]
  contexto: ContextoManoObraTmp
}): ResultadoTmp {
  const fallo = (causa: string): ResultadoTmp => ({ resuelto: false, lineas: [], conceptosTratados: [],
    incidencias: [`mano de obra TMP/16: ${causa}`] })
  const elementos = entrada.elementos.filter(e => e.componente === '16' || e.grupo === 'TMP')
  if (!elementos.length) return fallo('sin elementos acreditados')
  if (elementos.some(e => e.componente !== '16' || e.grupo !== 'TMP' || e.modulo)) return fallo('selectores de elemento sin contrastar')
  if (elementos.some(e => !Number.isFinite(e.cantidad) || e.cantidad < 0)) return fallo('cantidad inválida')
  const { contexto } = entrada
  const categoria = contexto.tipoPerfiles === 'A' ? '00001' : contexto.tipoPerfiles === 'C' ? '00002' : null
  if (!categoria || contexto.familia !== '001' || !contexto.serie.trim()) return fallo('contexto ausente o sin contrastar')
  const conceptos = entrada.conceptos.filter(c => c.componenteAsociado === '16' || c.grupoAsociado === 'TMP')
  if (!conceptos.length) return fallo('conceptos ausentes')
  if (new Set(conceptos.map(c => c.codigo)).size !== conceptos.length) return fallo('conceptos duplicados')
  if (conceptos.some(c => !['00001', '00002'].includes(c.categoria ?? '') || c.familiaAsociada !== contexto.familia
      || c.serieAsociada !== '*' || c.asociado !== true)) return fallo('metadatos ausentes o sin contrastar')
  const sinSelector = (s: string | null) => s === '!'
  if (conceptos.some(c => c.modulo || c.articuloAsociado ||
      !(c.categoria === '00001' && c.grupoAsociado === 'TMP' && sinSelector(c.componenteAsociado)
        || c.categoria === '00002' && c.componenteAsociado === '16' && sinSelector(c.grupoAsociado)))) {
    return fallo('combinación de selectores sin contrastar')
  }
  if (conceptos.some(c => c.conIncrementos || !Number.isFinite(c.minutos) || c.minutos < 0 || !c.articulo.trim() || !c.codigo.trim())) {
    return fallo('tiempos o artículo sin contrastar')
  }
  const seleccion = conceptos.filter(c => c.categoria === categoria)
  if (seleccion.length !== 1 || conceptos.some(c => conceptos.filter(otro => otro.categoria === c.categoria).length > 1)) {
    return fallo('selección de categoría ausente o ambigua')
  }
  const c = seleccion[0]!
  const cantidad = elementos.reduce((s, e) => s + e.cantidad, 0)
  const minutos = c.minutos * cantidad
  if (!Number.isFinite(minutos)) return fallo('minutos inválidos')
  return { resuelto: true, conceptosTratados: conceptos.map(c => c.codigo), incidencias: [],
    lineas: minutos > 0 ? [{ articulo: c.articulo, minutos, concepto: c.codigo }] : [] }
}

/** Cobertura documental estándar; no se infiere de la categoría de la serie. */
export function permiteTmpEnLinea(contexto: {
  estructura: string; serie: string; disenoEspecifico: boolean | undefined
}): boolean {
  return contexto.estructura === '03V' && ['GMA350', 'GMA65OPT'].includes(contexto.serie)
    && contexto.disenoEspecifico === false
}
