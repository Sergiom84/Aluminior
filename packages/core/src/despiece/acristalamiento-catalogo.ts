/**
 * Junquillos y juntas de acristalamiento a partir del catálogo.
 *
 * Tabla manual (`TAcristalamientoLin`, posición `*`): fila con el menor
 * `Grosor` ≥ grosor del vidrio. Su grosor es el galce menos junquillo y juntas
 * (GM02: 36,5 − 10,5 − 4,5 − 6 = 15,5).
 *
 * Junquillo, dos por dimensión:
 *   horizontal = referencia de ancho del vidrio − dto(izquierdo→JH) − dto(derecho→JH)
 *   vertical   = referencia de largo del vidrio − dto(superior→JV) − dto(inferior→JV)
 * Juntas exterior e interior, dos por dimensión, a la medida del módulo
 * (fórmulas del vidrio sin descuentos).
 *
 * Contrastado con facturas 2026 (GMA350 fijo y hoja, ELEGANTPVC): fase-7/06.
 * Productor omite sin aviso juntas cuyo artículo no existe (V1000); aquí se
 * omiten igual y se informa. Tablas automáticas y por posición: sin contrastar.
 */

import type { DescuentoCorte } from './cortes-referenciados.ts'

export interface FilaTablaAcristalamiento {
  posicion: string
  junquillo: string | null
  juntaExterior: string | null
  juntaInterior: string | null
  grosor: number
}

export interface VidrioParaAcristalar {
  /** Grosor del vidrio (`TamJunqGoma`). */
  grosorMm: number
  referenciaLargoMm: number
  referenciaAnchoMm: number
  moduloLargoMm: number
  moduloAnchoMm: number
  grupoIzquierdo: string
  grupoDerecho: string
  grupoSuperior: string
  grupoInferior: string
  /** Clave de tipo de hoja para los descuentos. */
  tipoHoja: string
}

export interface PiezaAcristalamiento {
  articulo: string
  cantidad: number
  largoMm: number
  funcion: 'JUNQ' | 'JEXT' | 'JINT'
}

export interface ResultadoAcristalamiento {
  piezas: PiezaAcristalamiento[]
  incidencias: string[]
  avisos: string[]
}

function descuento(descuentos: readonly DescuentoCorte[], principal: string, grupo: string, tipoHoja: string): number | null {
  const candidatas = descuentos.filter(d => d.grupoPrincipal === principal && d.grupo === grupo)
  const especificas = candidatas.filter(d => d.tipoHoja === tipoHoja)
  const aplicables = especificas.length ? especificas : candidatas.filter(d => d.tipoHoja === 'G')
  return aplicables.length === 1 && Number.isFinite(aplicables[0]!.mm) ? aplicables[0]!.mm : null
}

export function acristalarVidrio(
  vidrio: VidrioParaAcristalar,
  tabla: readonly FilaTablaAcristalamiento[],
  descuentos: readonly DescuentoCorte[],
  existeArticulo: (codigo: string) => boolean,
): ResultadoAcristalamiento {
  const incidencias: string[] = []
  const avisos: string[] = []
  const piezas: PiezaAcristalamiento[] = []
  if (!tabla.length) return { piezas, incidencias: ['tabla de acristalamiento sin filas: generación automática sin contrastar'], avisos }
  if (tabla.some(f => f.posicion !== '*')) return { piezas, incidencias: ['tabla de acristalamiento por posiciones sin contrastar'], avisos }
  const fila = [...tabla].sort((a, b) => a.grosor - b.grosor).find(f => f.grosor >= vidrio.grosorMm - 1e-9)
  if (!fila) return { piezas, incidencias: [`sin junquillo para vidrio de ${vidrio.grosorMm} mm`], avisos }

  const junquillo = fila.junquillo && fila.junquillo !== '0' ? fila.junquillo : null
  if (junquillo) {
    if (!existeArticulo(junquillo)) incidencias.push(`junquillo ${junquillo} ausente del catálogo`)
    else {
      const t = vidrio.tipoHoja
      const dI = descuento(descuentos, vidrio.grupoIzquierdo, 'JH', t)
      const dD = descuento(descuentos, vidrio.grupoDerecho, 'JH', t)
      const dS = descuento(descuentos, vidrio.grupoSuperior, 'JV', t)
      const dF = descuento(descuentos, vidrio.grupoInferior, 'JV', t)
      if (dI === null || dD === null || dS === null || dF === null) incidencias.push(`descuento de junquillo ausente o ambiguo (${junquillo})`)
      else {
        const horizontal = vidrio.referenciaAnchoMm - dI - dD
        const vertical = vidrio.referenciaLargoMm - dS - dF
        if (!(horizontal > 0) || !(vertical > 0)) incidencias.push(`junquillo ${junquillo} con medida no positiva`)
        else piezas.push(
          { articulo: junquillo, cantidad: 2, largoMm: horizontal, funcion: 'JUNQ' },
          { articulo: junquillo, cantidad: 2, largoMm: vertical, funcion: 'JUNQ' },
        )
      }
    }
  }
  for (const [articulo, funcion] of [[fila.juntaExterior, 'JEXT'], [fila.juntaInterior, 'JINT']] as const) {
    if (!articulo || articulo === '0') continue
    if (!existeArticulo(articulo)) { avisos.push(`junta ${articulo} sin artículo en catálogo: se omite como en Productor`); continue }
    piezas.push(
      { articulo, cantidad: 2, largoMm: vidrio.moduloAnchoMm, funcion },
      { articulo, cantidad: 2, largoMm: vidrio.moduloLargoMm, funcion },
    )
  }
  return { piezas, incidencias, avisos }
}
