/**
 * HOJA DE CORTE (G2). Documento del que corta, no del que fabrica.
 *
 * Evidencia (vídeo de Gaia, 24:50): primero un **resumen de barras** por
 * artículo-acabado —largo de barra, nº de barras, metros y **%Opt**— y después
 * el **desglose barra a barra** con el retal sobrante y la posición del palo
 * referida a la `Referencia (Tipo)` de la línea ("palo inferior de la V1").
 *
 * Lo que este documento NO lleva, y por eso no aparece aquí: accesorios,
 * medidas de cristales y persianas, tubos y solapes, ni la agrupación por
 * estructura. Eso es la hoja de producción, que es otro documento.
 *
 * Parte de un `PlanCorte` YA calculado por `optimizarCorte`. Este módulo no
 * optimiza: ensambla. Así el reparto de barras y su presentación pueden
 * evolucionar por separado.
 */

import type { PlanCorte } from './optimizar.ts'
import {
  etiquetaDocumento,
  identificarEstructura,
  redondearMm,
  validarParametrosCorte,
  type Orientacion,
  type ParametrosCorte,
  type ReferenciaDocumento,
} from './hojas.ts'

/**
 * De dónde sale un palo concreto. La hoja de corte no la deduce: se la dan,
 * emparejada por el `ref` que el optimizador arrastra sin interpretar.
 */
export interface ProcedenciaPalo {
  /** Índice 1-based de la estructura dentro del documento. */
  estructuraIndice: number
  /** `Referencia (Tipo)` de la línea (`V1`). null si la estructura no la tiene. */
  referencia: string | null
  /** Posición del palo en la estructura: `inferior`, `superior`, `derecho`… */
  posicion: string | null
  /** Orientación, si el origen la conoce. Informativa en este documento. */
  orientacion?: Orientacion | null
}

/** Un grupo del resumen: un artículo con un acabado concreto. */
export interface GrupoBarras {
  articuloCodigo: string
  descripcion?: string | null
  /** Acabado: el resumen del vídeo agrupa por artículo-acabado, no por artículo. */
  acabadoCodigo?: string | null
  acabadoDescripcion?: string | null
  /**
   * Largo de la barra que se compra, en mm. Puede ser mayor que
   * `plan.longitudBarra` si el plan se optimizó sobre la longitud aprovechable.
   */
  longitudBarraMm: number
  plan: PlanCorte
  /** `ref` del corte → procedencia. Un `ref` sin entrada se reporta, no se rellena. */
  procedencias?: ReadonlyMap<string, ProcedenciaPalo>
}

export interface EntradaHojaCorte {
  documento: ReferenciaDocumento
  parametros: ParametrosCorte
  grupos: GrupoBarras[]
}

/** Fila del resumen de barras. */
export interface FilaResumenBarras {
  articuloCodigo: string
  descripcion: string | null
  acabadoCodigo: string | null
  acabadoDescripcion: string | null
  /** `EC3900 CERCO VENTANA - MADERA`, tal como titula el documento. */
  etiqueta: string
  longitudBarraMm: number
  nBarras: number
  /** Metros de barra comprados: nº de barras × largo de barra. */
  metros: number
  /** %Opt: material útil sobre material comprado. null si no se puede calcular. */
  porcentajeOptimizacion: number | null
  /** Motivo cuando %Opt es null. */
  motivoSinOptimizacion: string | null
}

export interface PaloEnBarra {
  longitudMm: number
  /** `palo inferior de la V1`, o `palo inferior de la estructura 3`. */
  etiqueta: string
  procedencia: ProcedenciaPalo | null
  /** Por qué la trazabilidad del palo es incompleta, si lo es. */
  incidencia: string | null
}

export interface BarraDetallada {
  /** 1-based dentro de su grupo. */
  numero: number
  palos: PaloEnBarra[]
  /**
   * Retal que sobra al final de la barra, en mm, tal como lo reporta el plan.
   * Si el plan se hizo sobre la longitud aprovechable, los saneamientos de
   * punta NO están aquí: viajan aparte en `parametros`, sin mezclarse.
   */
  retalMm: number
}

export interface DesgloseGrupo {
  articuloCodigo: string
  acabadoCodigo: string | null
  etiqueta: string
  barras: BarraDetallada[]
  /** Cortes que no caben en la barra, propagados del plan con su motivo. */
  incidencias: string[]
}

export interface HojaCorte {
  /** Discriminante: este documento no es la hoja de producción ni al revés. */
  tipo: 'HOJA_DE_CORTE'
  documento: ReferenciaDocumento
  /** Cabecera `000011-1`. */
  referencia: string
  parametros: ParametrosCorte
  resumen: FilaResumenBarras[]
  desglose: DesgloseGrupo[]
  /** Todo lo que no se pudo determinar, agregado y sin repetir. */
  incidencias: string[]
}

function etiquetaGrupo(g: GrupoBarras): string {
  const articulo = [g.articuloCodigo, g.descripcion?.trim()].filter(Boolean).join(' ')
  const acabado = (g.acabadoDescripcion ?? g.acabadoCodigo ?? '').trim()
  return acabado !== '' ? `${articulo} - ${acabado}` : articulo
}

function etiquetaPalo(p: ProcedenciaPalo): string {
  const estructura = identificarEstructura(p.referencia, p.estructuraIndice)
  const posicion = (p.posicion ?? '').trim()
  return posicion !== ''
    ? `palo ${posicion} de la ${estructura}`
    : `palo de la ${estructura}`
}

/** Ensambla la hoja de corte. Pura: mismos datos, mismo documento. */
export function ensamblarHojaCorte(entrada: EntradaHojaCorte): HojaCorte {
  validarParametrosCorte(entrada.parametros)

  const resumen: FilaResumenBarras[] = []
  const desglose: DesgloseGrupo[] = []
  const incidencias = new Set<string>()

  for (const grupo of entrada.grupos) {
    const { longitudBarraMm, plan } = grupo
    if (!Number.isFinite(longitudBarraMm) || longitudBarraMm <= 0) {
      throw new Error(
        `longitudBarraMm debe ser un número positivo en ${grupo.articuloCodigo}, recibido: ${longitudBarraMm}`,
      )
    }

    const etiqueta = etiquetaGrupo(grupo)
    const comprado = redondearMm(plan.nBarras * longitudBarraMm)

    // %Opt = material útil sobre material comprado. Si el plan se optimizó
    // sobre una barra MÁS LARGA que la que se compra, los datos no cuadran y
    // el porcentaje no se calcula: se reporta, no se maquilla.
    let porcentajeOptimizacion: number | null = null
    let motivoSinOptimizacion: string | null = null
    if (plan.longitudBarra > longitudBarraMm) {
      motivoSinOptimizacion =
        `el plan se hizo sobre barras de ${plan.longitudBarra} mm, mayores que la barra de ${longitudBarraMm} mm que se compra`
      incidencias.add(`${etiqueta}: ${motivoSinOptimizacion}`)
    } else if (comprado <= 0) {
      motivoSinOptimizacion = 'no hay ninguna barra en el plan'
    } else {
      porcentajeOptimizacion = Math.round((plan.totalUtil / comprado) * 10000) / 100
    }

    resumen.push({
      articuloCodigo: grupo.articuloCodigo,
      descripcion: grupo.descripcion ?? null,
      acabadoCodigo: grupo.acabadoCodigo ?? null,
      acabadoDescripcion: grupo.acabadoDescripcion ?? null,
      etiqueta,
      longitudBarraMm,
      nBarras: plan.nBarras,
      metros: Math.round((comprado / 1000) * 1000) / 1000,
      porcentajeOptimizacion,
      motivoSinOptimizacion,
    })

    const incidenciasGrupo: string[] = []
    for (const imposible of plan.imposibles) {
      const texto = `${etiqueta}: ${imposible.cantidad} × ${imposible.longitud} mm sin cortar — ${imposible.motivo}`
      incidenciasGrupo.push(texto)
      incidencias.add(texto)
    }

    const barras: BarraDetallada[] = plan.barras.map((barra, i) => ({
      numero: i + 1,
      retalMm: barra.sobrante,
      palos: barra.cortes.map((corte) => {
        const procedencia = corte.ref !== undefined
          ? grupo.procedencias?.get(corte.ref) ?? null
          : null
        if (procedencia === null) {
          const motivo = corte.ref === undefined
            ? `${etiqueta}: un corte de ${corte.longitud} mm llega sin referencia de origen`
            : `${etiqueta}: la referencia "${corte.ref}" no tiene procedencia conocida`
          incidenciasGrupo.push(motivo)
          incidencias.add(motivo)
          return {
            longitudMm: corte.longitud,
            etiqueta: 'palo de procedencia desconocida',
            procedencia: null,
            incidencia: motivo,
          }
        }
        const sinPosicion = (procedencia.posicion ?? '').trim() === ''
        if (sinPosicion) {
          incidencias.add(
            `${etiqueta}: ${identificarEstructura(procedencia.referencia, procedencia.estructuraIndice)} aporta un palo sin posición`,
          )
        }
        return {
          longitudMm: corte.longitud,
          etiqueta: etiquetaPalo(procedencia),
          procedencia,
          incidencia: sinPosicion ? 'el origen no indica la posición del palo' : null,
        }
      }),
    }))

    desglose.push({
      articuloCodigo: grupo.articuloCodigo,
      acabadoCodigo: grupo.acabadoCodigo ?? null,
      etiqueta,
      barras,
      incidencias: incidenciasGrupo,
    })
  }

  return {
    tipo: 'HOJA_DE_CORTE',
    documento: entrada.documento,
    referencia: etiquetaDocumento(entrada.documento),
    parametros: entrada.parametros,
    resumen,
    desglose,
    incidencias: [...incidencias],
  }
}
