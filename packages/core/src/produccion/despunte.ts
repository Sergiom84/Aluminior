/**
 * Despunte (retal) como gasto calculado.
 *
 * Capa económica encima de `optimizar.ts`. El optimizador dice cuántas barras
 * hay que comprar para sacar los cortes; aquí se pone precio a las dos cosas y
 * se mide la diferencia:
 *
 *   - **coste de perfiles y cortes**: el material que de verdad va al hueco,
 *     los mm colocados en el plan;
 *   - **coste de barras**: lo que hay que pedir al proveedor, barras enteras;
 *   - **importe de despunte**: la resta. Es el retal.
 *
 * Motivo de negocio (vídeo oficial de Gaia, 22:24–24:10): en color madera el
 * retal no se reaprovecha, así que se factura al cliente a precio de coste.
 *
 * Dos decisiones que NO se inventan aquí:
 *
 *  1. Un perfil sin precio por metro lineal no se valora a cero: sale en
 *     `noValorables` con su motivo, como `optimizar.ts` hace con los cortes
 *     imposibles. Un cero falso se suma al total y nadie lo ve.
 *  2. Los cortes que el optimizador declaró imposibles no están en ninguna
 *     barra, así que tampoco están en ningún importe. Se arrastran hasta el
 *     resultado para que no desaparezcan por el camino.
 *
 * Todo el dinero pasa por `precios/decimal.ts`: texto decimal y aritmética
 * entera, nunca coma flotante. Función PURA: sin base de datos y sin E/S.
 */

import {
  multiplicarDecimal,
  repartirDecimal,
  restarDecimal,
  signoDecimal,
  sumarDecimal,
  type Decimal,
} from '../precios/decimal.ts'
import type { PlanCorte } from './optimizar.ts'

/** Escala del dinero: el céntimo. */
export const ESCALA_IMPORTE_DESPUNTE = 2

/**
 * Escala de los metros lineales: la décima de milímetro.
 *
 * El coste se calcula sobre el ML **ya redondeado a esta escala**, no sobre un
 * valor interno más fino, para que el importe se pueda reproducir a mano desde
 * la cifra que se ve en pantalla. Con medidas reales en mm enteros el redondeo
 * no llega a existir.
 */
export const ESCALA_ML_DESPUNTE = 4

/** Concepto de la línea aparte, tal y como lo nombra el informe de coste. */
export const CONCEPTO_DESPUNTE = 'Gasto indirecto de despunte'

/** Cómo se lleva el importe al presupuesto. Los dos modos del diálogo original. */
export type ModoRepercusion = 'REPARTIR_ENTRE_LINEAS' | 'LINEA_APARTE'

/** Un perfil con su plan de corte y su precio, si lo tiene. */
export interface PerfilDespunte {
  /** Código que identifica el perfil en el documento (artículo o artículo-acabado). */
  perfil: string
  plan: PlanCorte
  /** Barra bruta comprada; el plan puede utilizar una longitud menor tras saneamiento. */
  longitudBarraCompradaMm?: number
  /** €/m como texto decimal. `null` cuando el catálogo no da precio: no se sustituye por cero. */
  precioMetroLineal: Decimal | null
}

/** Una línea del presupuesto candidata a recibir su parte del retal. */
export interface LineaDespunte {
  id: string
  /** Importe de la línea. Es el peso del reparto proporcional. */
  base: Decimal
}

export interface PerfilValorado {
  perfil: string
  /** ML realmente necesarios: los mm colocados en el plan. */
  mlNecesario: Decimal
  /** ML de barra que hay que comprar: nº de barras × longitud de barra. */
  mlBarras: Decimal
  nBarras: number
  precioMetroLineal: Decimal
  costePerfilesYCortes: Decimal
  costeBarras: Decimal
  /** `costeBarras - costePerfilesYCortes`. El retal de este perfil. */
  importeDespunte: Decimal
}

export interface PerfilNoValorable {
  perfil: string
  mlNecesario: Decimal
  mlBarras: Decimal
  nBarras: number
  motivo: string
}

/** Un corte que el optimizador no pudo colocar, arrastrado con su perfil. */
export interface CorteNoValorado {
  perfil: string
  longitud: number
  cantidad: number
  ref?: string
  motivo: string
}

export interface LineaRepercutida {
  id: string
  base: Decimal
  importe: Decimal
}

export type Repercusion =
  | {
      modo: 'REPARTIR_ENTRE_LINEAS'
      lineas: LineaRepercutida[]
      /** Lo que no se ha podido repartir. `0.00` cuando el reparto se hizo entero. */
      noRepercutido: Decimal
      /** Presente sólo cuando no se ha repartido, explicando por qué. */
      motivo?: string
    }
  | {
      modo: 'LINEA_APARTE'
      linea: { concepto: string; importe: Decimal }
    }

export interface ResultadoDespunte {
  perfiles: PerfilValorado[]
  noValorables: PerfilNoValorable[]
  cortesNoValorados: CorteNoValorado[]
  /** Coste del material realmente necesario. Sólo perfiles valorables. */
  costePerfilesYCortes: Decimal
  /** Coste de las barras que hay que comprar al proveedor. */
  costeBarras: Decimal
  /** ML de barra a comprar, incluidos los perfiles sin precio: medir no exige valorar. */
  mlBarras: Decimal
  /** `costeBarras - costePerfilesYCortes`. */
  importeDespunte: Decimal
  repercusion: Repercusion
}

export interface OpcionesDespunte {
  modo: ModoRepercusion
  /** Líneas del documento. Sólo se usan en `REPARTIR_ENTRE_LINEAS`. */
  lineas?: readonly LineaDespunte[]
  /** Texto de la línea aparte. Por defecto `CONCEPTO_DESPUNTE`. */
  concepto?: string
}

const CERO_IMPORTE = '0.00'

/**
 * mm (número, como los maneja el optimizador) a metros (decimal exacto).
 *
 * El paso por texto con 3 decimales es donde muere la coma flotante: a partir
 * de ahí ya no hay `number` en ningún importe. La milésima de mm es la misma
 * precisión con la que `optimizar.ts` cierra sus cuentas.
 */
function metros(mm: number): Decimal {
  if (!Number.isFinite(mm) || mm < 0) {
    throw new Error(`longitud en mm no válida: ${mm}`)
  }
  return multiplicarDecimal(mm.toFixed(3), '0.001', ESCALA_ML_DESPUNTE)
}

function sumar(valores: readonly Decimal[]): Decimal {
  return valores.reduce(
    (acc, v) => sumarDecimal(acc, v, ESCALA_IMPORTE_DESPUNTE),
    CERO_IMPORTE,
  )
}

/**
 * Calcula el despunte de un documento y lo repercute según el modo elegido.
 *
 * Los totales se obtienen sumando importes **ya redondeados al céntimo**, no
 * redondeando una suma de valores finos: así el total de la pantalla es
 * exactamente la suma de las filas del detalle, y la identidad
 * `importeDespunte = costeBarras - costePerfilesYCortes` se cumple al céntimo.
 */
export function calcularDespunte(
  perfiles: readonly PerfilDespunte[],
  opciones: OpcionesDespunte,
): ResultadoDespunte {
  const valorados: PerfilValorado[] = []
  const noValorables: PerfilNoValorable[] = []
  const cortesNoValorados: CorteNoValorado[] = []
  const mlDeBarras: Decimal[] = []

  for (const { perfil, plan, precioMetroLineal, longitudBarraCompradaMm } of perfiles) {
    const comprada = longitudBarraCompradaMm ?? plan.longitudBarra
    if (!Number.isFinite(comprada) || comprada <= 0 || comprada < plan.longitudBarra)
      throw new Error(`longitud de barra comprada no válida en ${perfil}`)
    const mlNecesario = metros(plan.totalUtil)
    const mlBarras = metros(plan.nBarras * comprada)
    mlDeBarras.push(mlBarras)

    for (const imposible of plan.imposibles) {
      cortesNoValorados.push({ perfil, ...imposible })
    }

    if (precioMetroLineal === null) {
      noValorables.push({
        perfil,
        mlNecesario,
        mlBarras,
        nBarras: plan.nBarras,
        motivo: `el perfil ${perfil} no tiene precio por metro lineal`,
      })
      continue
    }
    if (signoDecimal(precioMetroLineal) < 0) {
      throw new Error(`precio por metro lineal negativo en ${perfil}: ${precioMetroLineal}`)
    }

    const costePerfilesYCortes = multiplicarDecimal(
      mlNecesario, precioMetroLineal, ESCALA_IMPORTE_DESPUNTE,
    )
    const costeBarras = multiplicarDecimal(
      mlBarras, precioMetroLineal, ESCALA_IMPORTE_DESPUNTE,
    )
    valorados.push({
      perfil,
      mlNecesario,
      mlBarras,
      nBarras: plan.nBarras,
      precioMetroLineal,
      costePerfilesYCortes,
      costeBarras,
      importeDespunte: restarDecimal(costeBarras, costePerfilesYCortes, ESCALA_IMPORTE_DESPUNTE),
    })
  }

  const costePerfilesYCortes = sumar(valorados.map((v) => v.costePerfilesYCortes))
  const costeBarras = sumar(valorados.map((v) => v.costeBarras))
  const importeDespunte = restarDecimal(costeBarras, costePerfilesYCortes, ESCALA_IMPORTE_DESPUNTE)
  const mlBarras = mlDeBarras.reduce(
    (acc, ml) => sumarDecimal(acc, ml, ESCALA_ML_DESPUNTE),
    '0.0000',
  )

  return {
    perfiles: valorados,
    noValorables,
    cortesNoValorados,
    costePerfilesYCortes,
    costeBarras,
    mlBarras,
    importeDespunte,
    repercusion: repercutir(importeDespunte, opciones),
  }
}

/**
 * Los dos modos dan resultados distintos y explícitos, y el modo viaja dentro
 * del resultado: quien lo reciba no tiene que recordar con qué se calculó.
 */
function repercutir(importe: Decimal, opciones: OpcionesDespunte): Repercusion {
  if (opciones.modo === 'LINEA_APARTE') {
    return {
      modo: 'LINEA_APARTE',
      linea: { concepto: opciones.concepto ?? CONCEPTO_DESPUNTE, importe },
    }
  }
  if (opciones.modo !== 'REPARTIR_ENTRE_LINEAS') {
    throw new Error(`modo de repercusión desconocido: ${String(opciones.modo)}`)
  }

  const lineas = opciones.lineas ?? []
  const sinRepartir = (motivo: string): Repercusion => ({
    modo: 'REPARTIR_ENTRE_LINEAS', lineas: [], noRepercutido: importe, motivo,
  })

  if (!lineas.length) return sinRepartir('el documento no tiene líneas entre las que repartir')
  if (lineas.some((l) => signoDecimal(l.base) < 0)) {
    // Una base negativa (un descuento en línea) no define ninguna proporción:
    // repartir sobre ella devolvería un cargo negativo a esa línea. Se dice.
    return sinRepartir('alguna línea tiene base negativa y el reparto proporcional no está definido')
  }
  if (signoDecimal(sumar(lineas.map((l) => l.base))) === 0) {
    return sinRepartir('las bases de las líneas suman cero y no hay proporción que aplicar')
  }

  // `repartirDecimal` reparte por mayor resto: la suma de las partes es
  // exactamente el importe total, sin descuadre por redondeo.
  const partes = repartirDecimal(
    importe, lineas.map((l) => l.base), ESCALA_IMPORTE_DESPUNTE,
  )
  return {
    modo: 'REPARTIR_ENTRE_LINEAS',
    lineas: lineas.map((l, i) => ({ id: l.id, base: l.base, importe: partes[i] })),
    noRepercutido: CERO_IMPORTE,
  }
}
