/**
 * Filas de una hoja metida en el marco o en un hueco de un diseño propio.
 * Alcance demostrado: una hoja de ventana abatible u oscilobatiente, de
 * apertura interior y a inglete.
 */
import { ARTICULO_ESCUADRA, REFERENCIA, SIN_APOYO, sobreReferencia, type Emisor } from './emisor.ts'
import { DisenoNoSoportado, type Region } from './regiones.ts'
import type { NodoDiseno } from './tipos.ts'

interface TipoHoja {
  /** `DisManoID` de sus filas: Productor guarda la contraria a la del nombre del tipo. */
  mano: 'I' | 'D'
  oscilobatiente: boolean
}
/** `SeriesAsocV2TiposHoja`: 1 y 2 abatible izquierdas y derechas; 5 y 6 oscilobatiente. */
const TIPOS: Record<number, TipoHoja> = {
  1: { mano: 'D', oscilobatiente: false }, 2: { mano: 'I', oscilobatiente: false },
  5: { mano: 'D', oscilobatiente: true }, 6: { mano: 'I', oscilobatiente: true },
}
/** Módulos de mano de obra de la hoja (`DisVidrio` de sus filas `infMOmof`). */
const MODULOS_MO = { abatible: ['10', '29'], oscilobatiente: ['22', '37'] } as const
/** `lstAccDis`: accesorios de diseño con fila propia; `MI` es la manilla. */
const ACCESORIOS: Record<string, { articulo: string; componente: string }> = { MI: { articulo: '310', componente: '130' } }
/** Hojas a cada lado en las filas informativas: una hoja sola no tiene ninguna. */
const HOJAS_VECINAS = '0-0'

/** Filas de la hoja de las que cuelga su vidrio. */
export interface FilasHoja { vertical: number; superior: number; tipoHoja: string }

function comprobarHoja(n: NodoDiseno): TipoHoja {
  const tipo = TIPOS[n.tipoHoja ?? 0]
  if (!tipo) throw new DisenoNoSoportado(`hoja de tipo ${n.tipoHoja ?? 0}`)
  if ((n.clase ?? 'V') !== 'V') throw new DisenoNoSoportado('hoja que no es de ventana')
  if (n.aperturaExterior) throw new DisenoNoSoportado('hoja de apertura exterior')
  if (n.hojaInferior) throw new DisenoNoSoportado('hoja con hoja inferior')
  if (!(n.cortes ?? [1, 1, 1, 1]).every(c => c === 1)) throw new DisenoNoSoportado('hoja que no va a inglete')
  for (const a of n.accesorios ?? []) if (!ACCESORIOS[a]) throw new DisenoNoSoportado(`accesorio de diseño ${a}`)
  return tipo
}

/** `enMarco`: la hoja ocupa el marco entero y no un hueco entre travesaños. */
export function emitirHoja(e: Emisor, n: NodoDiseno, r: Region, enMarco: boolean): FilasHoja {
  const tipo = comprobarHoja(n), tipoHoja = String(n.tipoHoja)
  const hoja = { tipoHoja, mano: tipo.mano, grupo: 'HP' }
  const enLargo = { posicionTrabajo: 'L', referenciaLargo: REFERENCIA.largo, formulaLargo: r.largo, formulaReferenciaLargo: sobreReferencia(r.largo), grupoIzquierdo: r.superior, grupoDerecho: r.inferior }
  const enAncho = { posicionTrabajo: 'A', referenciaLargo: REFERENCIA.ancho, formulaLargo: r.ancho, formulaReferenciaLargo: sobreReferencia(r.ancho), grupoIzquierdo: r.izquierda, grupoDerecho: r.derecha }

  const vertical = e.fila({ ...hoja, ...enLargo, articulo: '10', componente: '25', funcion: 'HV' })
  e.fila({ ...hoja, ...enLargo, articulo: '10', componente: '25', funcion: 'HV' })
  const superior = e.fila({ ...hoja, ...enAncho, articulo: '15', componente: '26', funcion: 'HH' })
  e.fila({ ...hoja, ...enAncho, articulo: '15', componente: '26', funcion: 'HH' })
  e.fila({ ...hoja, ...enAncho, articulo: '73', componente: '51', funcion: 'infHH', cantidad: 2 })
  if (n.vierteaguas) {
    e.fila({ ...hoja, ...SIN_APOYO, articulo: '47', componente: '29', funcion: 'HH', posicionTrabajo: 'A', referenciaLargo: superior, formulaLargo: r.ancho, formulaReferenciaLargo: 'REF', grupo: 'VAG' })
  }
  e.fila({ ...hoja, ...enAncho, ...(tipo.oscilobatiente ? { articulo: '91', componente: 'OBC' } : { articulo: '205', componente: 'PRC' }), funcion: 'HH' })
  e.fila({ ...hoja, ...enLargo, articulo: '72', componente: '50', funcion: 'infHV', cantidad: 2, disVidrio: HOJAS_VECINAS })
  if (tipo.oscilobatiente) {
    e.fila({ ...hoja, ...enLargo, articulo: '92', componente: 'OBM', funcion: 'HV' })
    e.fila({ ...hoja, ...enLargo, articulo: '93', componente: 'OBCR', funcion: 'HV' })
  }
  e.fila({ ...hoja, ...enLargo, articulo: ARTICULO_ESCUADRA, componente: '58', funcion: 'infHAesc', cantidad: 4, grupo: null })
  if (!tipo.oscilobatiente) {
    e.fila({ ...hoja, ...enLargo, articulo: '85', componente: '52', funcion: 'infHAB', disVidrio: HOJAS_VECINAS, grupo: null })
    e.fila({ ...hoja, ...enLargo, articulo: '89', componente: '56', funcion: 'infHAB', disVidrio: HOJAS_VECINAS })
  }
  // Zona de apertura: informativa, mide el hueco que ocupa la hoja.
  const apertura = { tipoHoja, articulo: '156', componente: '71', funcion: 'infZApert', cantidad: 2, disVidrio: HOJAS_VECINAS, ...(enMarco ? SIN_APOYO : {}) }
  e.fila({ ...apertura, posicionTrabajo: 'L', formulaLargo: r.largo })
  e.fila({ ...apertura, posicionTrabajo: 'A', formulaLargo: r.ancho })
  for (const modulo of MODULOS_MO[tipo.oscilobatiente ? 'oscilobatiente' : 'abatible']) {
    e.manoObra({ tipoHoja, disVidrio: modulo, referenciaLargo: REFERENCIA.largo, formulaLargo: r.largo, formulaAncho: r.ancho, formulaReferenciaLargo: sobreReferencia(r.largo) })
  }
  for (const a of n.accesorios ?? []) {
    e.alFinal({ ...ACCESORIOS[a]!, ...SIN_APOYO, tipoHoja, funcion: `AccDis${a}`, posicionTrabajo: 'L', formulaLargo: r.largo })
  }
  return { vertical, superior, tipoHoja }
}
