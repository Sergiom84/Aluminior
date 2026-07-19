/**
 * Cálculo de despiece: de una estructura y unas medidas, a la lista de piezas.
 *
 * Este es el corazón del sistema. Toma la plantilla de la estructura, evalúa
 * las fórmulas con las medidas del hueco y las cotas, y devuelve qué hay que
 * cortar y de qué medida.
 *
 * Principio de diseño: NUNCA inventar un valor. Si una fórmula no se puede
 * resolver, la pieza sale marcada como incalculable con el motivo. Un cero
 * silencioso en una medida de corte es material desperdiciado y una ventana
 * que no encaja.
 */

import { evaluar, variablesDe, type Contexto } from './formula.ts'

/** Plantilla de un componente, tal como viene del catálogo. */
export interface ComponentePlantilla {
  articuloCodigo: string
  cantidad: string | number | null
  formulaLargo: string | null
  tipoCorte: string | null
  anguloIzquierdo: string | number | null
  anguloDerecho: string | number | null
  funcion: string | null
  /** Rango de medidas en que aplica; fuera de él, el componente no entra. */
  medidaMinima?: string | number | null
  medidaMaxima?: string | number | null
  /** Nodo de diseÃ±o (DisIdIt), necesario para emparejar perfiles y vidrios. */
  idItemDisenyo?: number | null
  grupoDisenyo?: string | null
}

/** Pieza resultante, ya con su medida de corte. */
export interface PiezaCortada {
  articuloCodigo: string
  cantidad: number
  /** Medida de corte en mm. null si no se pudo calcular. */
  largoMm: number | null
  formula: string | null
  tipoCorte: string | null
  anguloIzquierdo: number | null
  anguloDerecho: number | null
  funcion: string | null
  idItemDisenyo?: number | null
  grupoDisenyo?: string | null
  /** Motivo por el que no se pudo calcular, si aplica. */
  incidencia: string | null
}

export interface ResultadoDespiece {
  piezas: PiezaCortada[]
  /** Piezas cuya medida no se pudo determinar. */
  incalculables: number
  /** Variables que faltaron, agrupadas. */
  variablesFaltantes: string[]
  /** Metros lineales totales por artículo, para valorar. */
  consumoPorArticulo: Map<string, { unidades: number; metrosLineales: number }>
}

/** Funciones cuyo corte lleva rebaje: la hoja encaja DENTRO del marco. */
const FUNCIONES_HOJA = new Set(['HV', 'HH'])

/** Clave de una regla de rebaje. Ver `rebajeDeHoja`. */
export interface ClaveRebaje {
  /** Perfil REAL, ya resuelto desde el genérico. */
  articuloCodigo: string
  funcion: string
  formula: string
  serie: string
}

export interface OpcionesDespiece {
  /** Serie (conjunto) de la línea; forma parte de la clave del rebaje. */
  serie?: string
  /**
   * Rebaje de hoja en mm, o null si no hay regla medida para esa pieza.
   *
   * La hoja no mide lo que mide el hueco: encaja dentro del marco y va
   * rebajada. El anexo T midió que ese rebaje es constante por
   * (perfil, eje, fórmula, serie) en 64 reglas que cubren el 93,0% de las
   * piezas, con un techo del 94,4% (lo que falta no está en los datos).
   *
   * Devolver `null` NO significa "sin rebaje": significa "no lo sé". La
   * pieza queda entonces sin medida y con incidencia, para que la línea no
   * se valore. Emitir la medida del hueco como si fuera el corte es
   * exactamente el error que el anexo T encontró en producción.
   */
  rebajeDeHoja?: (clave: ClaveRebaje) => number | null
}

/**
 * Junta perimetral de hoja: una pieza por cada pieza de perfil de hoja, con
 * EXACTAMENTE su mismo largo.
 *
 * Medido en el anexo S.7.2: no va en metros lineales, como se creyó al
 * principio, sino en tramos; y el delta contra el corte del perfil de hoja
 * es **0** en las 21 reglas estables, 4.624 de 4.632 tramos. Una versión
 * anterior de ese anexo afirmaba un ajuste por serie (−64/−90, −44/−70…):
 * era un artefacto de medición y quedó corregido.
 *
 * El artículo de junta sale de la fila `'!' HOJAS` de `ConjuntosAsoc`; el
 * motor no lo adivina, se lo dan. Si no se conoce, no se emite nada: es
 * preferible una junta ausente y visible a una junta inventada.
 *
 * Las piezas de hoja sin medida (por ejemplo, sin regla de rebaje) propagan
 * su incidencia a la junta, que tampoco tendrá medida. Copiar un largo
 * desconocido no lo vuelve conocido.
 *
 * ⚠️ NO CONECTAR A PRODUCCIÓN TODAVÍA (anexo T.14). S.7.2 validó el LARGO
 * de cada tramo (delta 0), pero nunca el RECUENTO. Al ejecutar esta función
 * contra el histórico, los largos casan al 94,2% pero se emiten 840 tramos
 * de más: no todas las piezas de hoja llevan junta. Falta medir cuáles.
 * Emitir juntas de más infla el presupuesto con material que no se usa.
 */
export function emitirJuntaPerimetral(
  piezas: PiezaCortada[],
  articuloJunta: string | null,
): PiezaCortada[] {
  if (!articuloJunta) return []
  return piezas
    .filter((p) => FUNCIONES_HOJA.has(p.funcion ?? ''))
    .map((p) => ({
      articuloCodigo: articuloJunta,
      cantidad: p.cantidad,
      largoMm: p.largoMm,
      formula: null,
      tipoCorte: null,
      anguloIzquierdo: null,
      anguloDerecho: null,
      funcion: 'JUNTA',
      idItemDisenyo: p.idItemDisenyo ?? null,
      grupoDisenyo: p.grupoDisenyo ?? null,
      incidencia: p.largoMm === null
        ? `junta sin medida: la hoja que copia tampoco la tiene (${p.incidencia ?? 'sin motivo'})`
        : null,
    }))
}

function aNumero(v: string | number | null | undefined): number | null {
  if (v === null || v === undefined) return null
  const n = typeof v === 'number' ? v : Number(String(v).replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

/**
 * Calcula el despiece de una estructura.
 *
 * @param plantilla  Componentes del catálogo para esa estructura
 * @param medidas    Ancho (L) y alto (A) del hueco, en mm
 * @param cotas      Valores de las cotas simbólicas: FI, FS, TD…
 */
export function calcularDespiece(
  plantilla: ComponentePlantilla[],
  medidas: { anchoMm: number; altoMm: number },
  cotas: Record<string, number> = {},
  opciones: OpcionesDespiece = {},
): ResultadoDespiece {
  const contexto: Contexto = {
    L: medidas.anchoMm,
    A: medidas.altoMm,
    ...cotas,
  }

  const piezas: PiezaCortada[] = []
  const faltantes = new Set<string>()
  const consumo = new Map<string, { unidades: number; metrosLineales: number }>()

  for (const c of plantilla) {
    const cantidad = aNumero(c.cantidad) ?? 1

    // Componentes condicionales: sólo entran dentro de su rango de medida.
    //
    // ⚠️ TRAMPA LATENTE (anexo T.16). Hoy esto es código muerto: ninguna de
    // las 15.263 filas de plantilla del catálogo trae MedidaMin/MedidaMax,
    // así que el filtro nunca se activa. Pero la referencia que usa —el
    // máximo de las dos medidas— es la que el anexo S.6 REFUTÓ para los
    // asociados: la correcta es la fórmula del propio componente evaluada
    // con las cotas reales. Si alguien rellena estos campos al ampliar el
    // ETL, esto empezará a incluir o excluir perfiles en silencio y por el
    // motivo equivocado. Corregirlo entonces, con datos con los que probarlo.
    const min = aNumero(c.medidaMinima)
    const max = aNumero(c.medidaMaxima)
    const referencia = Math.max(medidas.anchoMm, medidas.altoMm)
    if (min !== null && min > 0 && referencia < min) continue
    if (max !== null && max > 0 && referencia > max) continue

    let largoMm: number | null = null
    let incidencia: string | null = null

    if (c.formulaLargo) {
      try {
        largoMm = evaluar(c.formulaLargo, contexto)
        if (!Number.isFinite(largoMm)) {
          largoMm = null
          incidencia = 'resultado no numérico'
        } else if (largoMm < 0) {
          // Medida negativa: la fórmula es correcta pero las cotas no encajan
          // en el hueco. Hay que avisar, no cortar en negativo.
          incidencia = `medida negativa (${Math.round(largoMm)} mm): revisa las cotas`
          largoMm = null
        }
      } catch {
        const faltan = variablesDe(c.formulaLargo).filter((v) => !(v in contexto))
        faltan.forEach((v) => faltantes.add(v))
        incidencia = faltan.length
          ? `faltan valores: ${faltan.join(', ')}`
          : 'fórmula no evaluable'
      }
    } else {
      incidencia = 'sin fórmula de largo'
    }

    // Rebaje de hoja (anexo T). Sólo aplica a HV/HH y sólo si el llamante
    // aporta la tabla de reglas; sin ella el motor se comporta como antes.
    if (largoMm !== null && opciones.rebajeDeHoja && FUNCIONES_HOJA.has(c.funcion ?? '')) {
      const rebaje = opciones.rebajeDeHoja({
        articuloCodigo: c.articuloCodigo,
        funcion: c.funcion ?? '',
        formula: c.formulaLargo ?? '',
        serie: opciones.serie ?? '',
      })
      if (rebaje === null) {
        // No hay regla medida. No se inventa un rebaje ni se deja la medida
        // del hueco: la pieza queda sin medida y la línea, sin valorar.
        incidencia = 'sin regla de rebaje de hoja para (perfil, eje, fórmula, serie)'
        largoMm = null
      } else {
        largoMm -= rebaje
        if (largoMm < 0) {
          incidencia = `rebaje mayor que la medida (${Math.round(largoMm)} mm): revisa la regla`
          largoMm = null
        }
      }
    }

    piezas.push({
      articuloCodigo: c.articuloCodigo,
      cantidad,
      largoMm,
      formula: c.formulaLargo,
      tipoCorte: c.tipoCorte,
      anguloIzquierdo: aNumero(c.anguloIzquierdo),
      anguloDerecho: aNumero(c.anguloDerecho),
      funcion: c.funcion,
      idItemDisenyo: c.idItemDisenyo ?? null,
      grupoDisenyo: c.grupoDisenyo ?? null,
      incidencia,
    })

    const acc = consumo.get(c.articuloCodigo) ?? { unidades: 0, metrosLineales: 0 }
    acc.unidades += cantidad
    if (largoMm !== null) acc.metrosLineales += (largoMm / 1000) * cantidad
    consumo.set(c.articuloCodigo, acc)
  }

  return {
    piezas,
    incalculables: piezas.filter((p) => p.largoMm === null).length,
    variablesFaltantes: [...faltantes].sort(),
    consumoPorArticulo: consumo,
  }
}
