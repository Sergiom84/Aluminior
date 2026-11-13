/**
 * Filas de las hojas de un diseño propio. Alcance demostrado: hoja de ventana
 * abatible u oscilobatiente sola, y la pareja de dos hojas con una
 * oscilobatiente; siempre de apertura interior y a inglete.
 */
import { ARTICULO_ESCUADRA, REFERENCIA, SIN_APOYO, sobreReferencia, type Emisor } from './emisor.ts'
import { DisenoNoSoportado, type Region } from './regiones.ts'
import type { NodoDiseno } from './tipos.ts'

type Mano = 'I' | 'D'
/** Herraje de la hoja: el de una abatible, el de la oscilobatiente o el de su compañera pasiva. */
type Herraje = 'abatible' | 'oscilobatiente' | 'pasiva'

/** `SeriesAsocV2TiposHoja` de una hoja sola. `DisManoID` es la contraria a la del nombre del tipo. */
const HOJA_SOLA: Record<number, { mano: Mano; herraje: Herraje }> = {
  1: { mano: 'D', herraje: 'abatible' }, 2: { mano: 'I', herraje: 'abatible' },
  5: { mano: 'D', herraje: 'oscilobatiente' }, 6: { mano: 'I', herraje: 'oscilobatiente' },
}
/** Parejas: 8 lleva la oscilobatiente a la derecha y 9 a la izquierda. La izquierda es siempre la hoja 1. */
const PAREJA: Record<number, { oscilobatiente: 1 | 2 }> = { 8: { oscilobatiente: 2 }, 9: { oscilobatiente: 1 } }
export const esTipoPareja = (tipoHoja: number | undefined) => PAREJA[tipoHoja ?? 0] !== undefined

/** Módulos de mano de obra de la hoja (`DisVidrio` de sus filas `infMOmof`). */
const MODULOS_MO = { abatible: ['10', '29'], oscilobatiente: ['22', '37'] } as const
/** `lstAccDis`: accesorios de diseño con fila propia; `MI` es la manilla. */
const ACCESORIOS: Record<string, { articulo: string; componente: string }> = { MI: { articulo: '310', componente: '130' } }
/** Hojas a cada lado en las filas informativas (`DisVidrio`). */
const VECINAS = { sola: '0-0', pareja: '1-1' } as const

/** Filas de la hoja de las que cuelga su vidrio. */
export interface FilasHoja { vertical: number; superior: number; tipoHoja: string }

function comprobarHoja(n: NodoDiseno) {
  if ((n.clase ?? 'V') !== 'V') throw new DisenoNoSoportado('hoja que no es de ventana')
  if (n.aperturaExterior) throw new DisenoNoSoportado('hoja de apertura exterior')
  if (n.hojaInferior) throw new DisenoNoSoportado('hoja con hoja inferior')
  if (!(n.cortes ?? [1, 1, 1, 1]).every(c => c === 1)) throw new DisenoNoSoportado('hoja que no va a inglete')
  for (const a of n.accesorios ?? []) if (!ACCESORIOS[a]) throw new DisenoNoSoportado(`accesorio de diseño ${a}`)
}

interface Papel {
  mano: Mano
  herraje: Herraje
  /** `DisNHoja`: 0 en la hoja sola, 1 o 2 en la pareja. */
  numero: number
  /** En la pareja, la hoja 1 lleva el batiente y el retenedor, este con la mano de la pasiva. */
  batiente?: { manoRetenedor: Mano }
}

/** Perfiles y herraje de una hoja en su hueco `r`. */
function emitirPerfiles(e: Emisor, n: NodoDiseno, r: Region, p: Papel): FilasHoja {
  comprobarHoja(n)
  const tipoHoja = String(n.tipoHoja), pareja = p.numero > 0, vecinas = pareja ? VECINAS.pareja : VECINAS.sola
  const hoja = { tipoHoja, mano: p.mano, hoja: p.numero, grupo: 'HP' }
  const enLargo = { posicionTrabajo: 'L', referenciaLargo: REFERENCIA.largo, formulaLargo: r.largo, formulaReferenciaLargo: sobreReferencia(r.largo), grupoIzquierdo: r.superior, grupoDerecho: r.inferior }
  // Los horizontales de una pareja llevan además el grupo del batiente.
  const enAncho = {
    posicionTrabajo: 'A', referenciaLargo: REFERENCIA.ancho, formulaLargo: r.ancho, formulaReferenciaLargo: sobreReferencia(r.ancho),
    grupoIzquierdo: r.izquierda, grupoDerecho: r.derecha, ...(pareja ? { gruposAdicionales: ['B', null, null, null] } : {}),
  }
  const vertical = e.fila({ ...hoja, ...enLargo, articulo: '10', componente: '25', funcion: 'HV' })
  e.fila({ ...hoja, ...enLargo, articulo: '10', componente: '25', funcion: 'HV' })
  const superior = e.fila({ ...hoja, ...enAncho, articulo: '15', componente: '26', funcion: 'HH' })
  e.fila({ ...hoja, ...enAncho, articulo: '15', componente: '26', funcion: 'HH' })
  e.fila({ ...hoja, ...enAncho, articulo: '73', componente: '51', funcion: 'infHH', cantidad: 2 })
  if (n.vierteaguas) {
    e.fila({ ...hoja, ...SIN_APOYO, articulo: '47', componente: '29', funcion: 'HH', posicionTrabajo: 'A', referenciaLargo: superior, formulaLargo: r.ancho, formulaReferenciaLargo: 'REF', grupo: 'VAG' })
  }
  if (p.herraje === 'abatible') e.fila({ ...hoja, ...enAncho, articulo: '205', componente: 'PRC', funcion: 'HH' })
  if (p.herraje === 'oscilobatiente') e.fila({ ...hoja, ...enAncho, articulo: '91', componente: 'OBC', funcion: 'HH' })
  e.fila({ ...hoja, ...enLargo, articulo: '72', componente: '50', funcion: 'infHV', cantidad: 2, disVidrio: vecinas })
  if (p.batiente) {
    e.fila({ ...hoja, ...SIN_APOYO, articulo: '28', componente: 'B', funcion: 'BT', posicionTrabajo: 'L', referenciaLargo: vertical, formulaLargo: r.largo, formulaReferenciaLargo: 'REF', grupo: 'B' })
  }
  if (p.herraje === 'oscilobatiente') {
    e.fila({ ...hoja, ...enLargo, articulo: '92', componente: 'OBM', funcion: 'HV' })
    e.fila({ ...hoja, ...enLargo, articulo: '93', componente: 'OBCR', funcion: 'HV' })
  }
  if (p.herraje === 'pasiva') {
    e.fila({ ...hoja, ...enLargo, articulo: '94', componente: 'OBP', funcion: 'HV' })
    e.fila({ ...hoja, ...enAncho, articulo: '168', componente: 'OBPH', funcion: 'HH' })
  }
  e.fila({ ...hoja, ...enLargo, articulo: ARTICULO_ESCUADRA, componente: '58', funcion: 'infHAesc', cantidad: 4, grupo: null })
  if (p.herraje === 'abatible') {
    e.fila({ ...hoja, ...enLargo, articulo: '85', componente: '52', funcion: 'infHAB', disVidrio: vecinas, grupo: null })
    e.fila({ ...hoja, ...enLargo, articulo: '89', componente: '56', funcion: 'infHAB', disVidrio: vecinas })
  }
  if (p.batiente) e.fila({ ...hoja, ...enLargo, mano: p.batiente.manoRetenedor, articulo: '85', componente: '52', funcion: 'infHAB', disVidrio: vecinas, grupo: null })
  for (const a of n.accesorios ?? []) {
    e.alFinal({ ...ACCESORIOS[a]!, ...SIN_APOYO, tipoHoja, funcion: `AccDis${a}`, posicionTrabajo: 'L', formulaLargo: r.largo })
  }
  return { vertical, superior, tipoHoja }
}

/** Zona de apertura: informativa, mide el hueco entero que ocupan la hoja o la pareja. */
function emitirZonaApertura(e: Emisor, tipoHoja: string, r: Region, enMarco: boolean, vecinas: string) {
  const apertura = { tipoHoja, articulo: '156', componente: '71', funcion: 'infZApert', cantidad: 2, disVidrio: vecinas, ...(enMarco ? SIN_APOYO : {}) }
  // Una pareja de filas por hoja o conjunto, como en los documentos. Cuatro plantillas del
  // catálogo (`1O+1F+1O`, `1O+2F+1O`, `3O`, `10101`) juntan en una la fila de largo de
  // varias hojas; es informativa y no cambia el precio.
  e.fila({ ...apertura, posicionTrabajo: 'L', formulaLargo: r.largo })
  e.fila({ ...apertura, posicionTrabajo: 'A', formulaLargo: r.ancho })
}

/** Hoja sola en el marco entero (`enMarco`) o en un hueco entre travesaños. */
export function emitirHoja(e: Emisor, n: NodoDiseno, r: Region, enMarco: boolean): FilasHoja {
  const tipo = HOJA_SOLA[n.tipoHoja ?? 0]
  if (!tipo) throw new DisenoNoSoportado(`hoja de tipo ${n.tipoHoja ?? 0}`)
  const filas = emitirPerfiles(e, n, r, { ...tipo, numero: 0 })
  emitirZonaApertura(e, filas.tipoHoja, r, enMarco, VECINAS.sola)
  for (const modulo of MODULOS_MO[tipo.herraje === 'oscilobatiente' ? 'oscilobatiente' : 'abatible']) {
    e.manoObra({ tipoHoja: filas.tipoHoja, disVidrio: modulo, referenciaLargo: REFERENCIA.largo, formulaLargo: r.largo, formulaAncho: r.ancho, formulaReferenciaLargo: sobreReferencia(r.largo) })
  }
  return filas
}

export interface HojaDePareja { nodo: NodoDiseno; region: Region }

/**
 * Una hoja de la pareja (`numero` 1 izquierda, 2 derecha). Con la primera salen además la
 * zona de apertura y la mano de obra del conjunto, que miden el hueco `conjunto` de las dos.
 */
export function emitirHojaDePareja(e: Emisor, h: HojaDePareja, numero: 1 | 2, conjunto: Region, enMarco: boolean): FilasHoja {
  const pareja = PAREJA[h.nodo.tipoHoja ?? 0]
  if (!pareja) throw new DisenoNoSoportado(`pareja de hojas de tipo ${h.nodo.tipoHoja ?? 0}`)
  const mano: Mano = numero === 1 ? 'I' : 'D', manoPasiva: Mano = pareja.oscilobatiente === 1 ? 'D' : 'I'
  const filas = emitirPerfiles(e, h.nodo, h.region, {
    mano, numero, herraje: pareja.oscilobatiente === numero ? 'oscilobatiente' : 'pasiva',
    ...(numero === 1 ? { batiente: { manoRetenedor: manoPasiva } } : {}),
  })
  if (numero === 2) return filas
  emitirZonaApertura(e, filas.tipoHoja, conjunto, enMarco, VECINAS.pareja)
  const manoObra = { tipoHoja: filas.tipoHoja, hoja: 1, referenciaLargo: REFERENCIA.largo, formulaLargo: h.region.largo, formulaReferenciaLargo: sobreReferencia(h.region.largo) }
  e.manoObra({ ...manoObra, disVidrio: '22', formulaAncho: h.region.ancho })
  e.manoObra({ ...manoObra, disVidrio: '10', formulaAncho: h.region.ancho })
  e.manoObra({ ...manoObra, disVidrio: '37', formulaAncho: conjunto.ancho })
  return filas
}
