/**
 * HOJA DE PRODUCCIÓN (G2). Documento del que fabrica, no del que corta.
 *
 * Evidencia (vídeo de Gaia, 26:42): se organiza **por estructura**
 * (`Estructura: 1 / 5`) y por cada una da referencia, descripción generada,
 * cantidad, color, **Medidas Marco** y **Hueco**, y una tabla de despiece con
 * el tipo de corte por extremo (`| - |` recto-recto, `/ - \` inglete).
 * Incluye además accesorios y medidas de cristales y persianas, que la hoja de
 * corte no lleva.
 *
 * Las filas granate son palos horizontales y las negras verticales. Aquí eso
 * sale como `orientacion`, un DATO. El color es decisión de la vista y no
 * aparece en este módulo.
 *
 * Fuera a propósito: las columnas `Pvc` y `Func.Pos.` del documento original.
 * El vídeo muestra sus valores (`MV`/`MH`/`BT`, `L`/`A`) pero no explica qué
 * significan, y modelarlas sería inventarlas.
 */

import {
  etiquetaDocumento,
  extremosDeCorte,
  identificarEstructura,
  orientacionDePalo,
  validarParametrosCorte,
  type ExtremosCorte,
  type Orientacion,
  type ParametrosCorte,
  type ReferenciaDocumento,
} from './hojas.ts'

export interface Medidas {
  anchoMm: number
  altoMm: number
}

/** Un perfil cortado de la estructura, tal como llega del despiece. */
export interface PaloEntrada {
  articuloCodigo: string
  descripcion?: string | null
  acabadoCodigo?: string | null
  cantidad: number
  /** Medida de corte en mm. null cuando el despiece no la pudo calcular. */
  largoMm: number | null
  /** Función del despiece (`MV`, `MH`, `HV`, `HH`, `TM`…). */
  funcion?: string | null
  /** Orientación ya resuelta por el origen; manda sobre la función. */
  orientacion?: Orientacion | null
  tipoCorte?: string | null
  anguloIzquierdo?: number | null
  anguloDerecho?: number | null
  /** Motivo por el que la pieza no tiene medida, propagado sin reinterpretar. */
  incidencia?: string | null
}

/** Accesorio o herraje: cuenta, no se corta. */
export interface AccesorioEntrada {
  articuloCodigo: string
  descripcion?: string | null
  acabadoCodigo?: string | null
  cantidad: number
}

/** Pieza de superficie: cristal, persiana o panel. Va por ancho × alto. */
export interface SuperficieEntrada {
  clase: 'VIDRIO' | 'PERSIANA' | 'PANEL'
  articuloCodigo: string
  descripcion?: string | null
  cantidad: number
  anchoMm: number | null
  altoMm: number | null
  incidencia?: string | null
}

export interface EstructuraEntrada {
  /** `Referencia (Tipo)` de la línea (`V-1`). null si el operador no la puso. */
  referencia?: string | null
  articuloCodigo?: string | null
  descripcion?: string | null
  cantidad: number
  colorCodigo?: string | null
  colorDescripcion?: string | null
  medidasMarco?: Medidas | null
  medidasHueco?: Medidas | null
  palos?: PaloEntrada[]
  accesorios?: AccesorioEntrada[]
  superficies?: SuperficieEntrada[]
}

export interface EntradaHojaProduccion {
  documento: ReferenciaDocumento
  parametros: ParametrosCorte
  estructuras: EstructuraEntrada[]
}

export interface PaloProduccion {
  articuloCodigo: string
  descripcion: string | null
  acabadoCodigo: string | null
  cantidad: number
  largoMm: number | null
  funcion: string | null
  /** Dato, nunca color. */
  orientacion: Orientacion
  /** De dónde sale la orientación, para poder discutirla. */
  motivoOrientacion: string
  /** Columna `I - D`: tipo de corte de cada extremo con su símbolo y su disco. */
  extremos: ExtremosCorte
  incidencia: string | null
}

export interface EstructuraProduccion {
  /** 1-based: el documento imprime `Estructura: 1 / 5`. */
  indice: number
  total: number
  referencia: string | null
  /** `V-1`, o `estructura 3` cuando la línea no tiene referencia. */
  identificacion: string
  articuloCodigo: string | null
  descripcion: string | null
  cantidad: number
  colorCodigo: string | null
  colorDescripcion: string | null
  medidasMarco: Medidas | null
  medidasHueco: Medidas | null
  palos: PaloProduccion[]
  accesorios: AccesorioEntrada[]
  superficies: SuperficieEntrada[]
  incidencias: string[]
}

export interface HojaProduccion {
  /** Discriminante: este documento no es la hoja de corte ni al revés. */
  tipo: 'HOJA_DE_PRODUCCION'
  documento: ReferenciaDocumento
  referencia: string
  parametros: ParametrosCorte
  estructuras: EstructuraProduccion[]
  incidencias: string[]
}

/** Ensambla la hoja de producción. Pura: mismos datos, mismo documento. */
export function ensamblarHojaProduccion(entrada: EntradaHojaProduccion): HojaProduccion {
  validarParametrosCorte(entrada.parametros)

  const total = entrada.estructuras.length
  const incidencias = new Set<string>()

  const estructuras = entrada.estructuras.map((e, i) => {
    const indice = i + 1
    // Una estructura sin referencia NO se omite: se identifica por su índice.
    const identificacion = identificarEstructura(e.referencia, indice)
    const incidenciasEstructura: string[] = []

    const anota = (texto: string) => {
      const completo = `${identificacion}: ${texto}`
      incidenciasEstructura.push(completo)
      incidencias.add(completo)
    }

    if ((e.referencia ?? '').trim() === '') {
      anota('la línea no tiene Referencia (Tipo); se identifica por su índice')
    }
    if (!e.medidasMarco) anota('sin medidas de marco')
    if (!e.medidasHueco) anota('sin medidas de hueco')

    const palos = (e.palos ?? []).map((p): PaloProduccion => {
      const { orientacion, motivo } = orientacionDePalo(p)
      if (orientacion === 'desconocida') {
        anota(`${p.articuloCodigo}: orientación desconocida (${motivo})`)
      }
      const extremos = extremosDeCorte(p, entrada.parametros)
      if (extremos.izquierdo.tipo === 'desconocido' || extremos.derecho.tipo === 'desconocido') {
        anota(`${p.articuloCodigo}: tipo de corte desconocido (${extremos.izquierdo.motivo})`)
      }
      if (p.largoMm === null) {
        anota(`${p.articuloCodigo}: sin medida de corte — ${p.incidencia ?? 'sin motivo declarado'}`)
      }
      return {
        articuloCodigo: p.articuloCodigo,
        descripcion: p.descripcion ?? null,
        acabadoCodigo: p.acabadoCodigo ?? null,
        cantidad: p.cantidad,
        largoMm: p.largoMm,
        funcion: p.funcion ?? null,
        orientacion,
        motivoOrientacion: motivo,
        extremos,
        incidencia: p.incidencia ?? null,
      }
    })

    const superficies = e.superficies ?? []
    for (const s of superficies) {
      if (s.anchoMm === null || s.altoMm === null) {
        anota(`${s.articuloCodigo}: ${s.clase.toLowerCase()} sin medidas — ${s.incidencia ?? 'sin motivo declarado'}`)
      }
    }

    return {
      indice,
      total,
      referencia: e.referencia ?? null,
      identificacion,
      articuloCodigo: e.articuloCodigo ?? null,
      descripcion: e.descripcion ?? null,
      cantidad: e.cantidad,
      colorCodigo: e.colorCodigo ?? null,
      colorDescripcion: e.colorDescripcion ?? null,
      medidasMarco: e.medidasMarco ?? null,
      medidasHueco: e.medidasHueco ?? null,
      palos,
      accesorios: e.accesorios ?? [],
      superficies,
      incidencias: incidenciasEstructura,
    }
  })

  return {
    tipo: 'HOJA_DE_PRODUCCION',
    documento: entrada.documento,
    referencia: etiquetaDocumento(entrada.documento),
    parametros: entrada.parametros,
    estructuras,
    incidencias: [...incidencias],
  }
}
