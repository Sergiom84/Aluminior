/**
 * Acumulador de filas de la plantilla de un diseño propio: numera, rellena
 * los campos vacíos como los guarda Productor y da forma a las filas de mano
 * de obra, que son las más repetidas.
 */
import type { FilaPlantillaCatalogo } from '../linea-catalogo/tipos.ts'

/** Filas de las que cuelgan las medidas: marco izquierdo (largo) y marco superior (ancho). */
export const REFERENCIA = { largo: 1, ancho: 3 } as const
export const ARTICULO_MANO_OBRA = '148'
export const ARTICULO_ESCUADRA = '105'
export const SIN_APOYO = { grupoIzquierdo: 'E', grupoDerecho: 'E' } as const

export type FilaParcial = Partial<FilaPlantillaCatalogo> & Pick<FilaPlantillaCatalogo, 'articulo'>

/** La fórmula de referencia mide sobre la pieza referida: `L` y `A` pasan a `REF`. */
export const sobreReferencia = (formula: string) => formula.replace(/\b[LA]\b/g, 'REF')

export interface Emisor {
  filas: FilaPlantillaCatalogo[]
  /** Añade una fila numerada y devuelve su id. */
  fila(f: FilaParcial): number
  /** Fila informativa de mano de obra; `disVidrio` es su módulo. */
  manoObra(f: Partial<FilaPlantillaCatalogo>): number
  /** Fila sin número (`id` 0) que Productor deja al final: accesorios del diseño. */
  alFinal(f: FilaParcial): void
  cerrar(): FilaPlantillaCatalogo[]
}

const completa = (id: number, f: FilaParcial): FilaPlantillaCatalogo => ({
  id, componente: null, funcion: null, cantidad: 1, posicionTrabajo: null, tipoHoja: '-1', mano: null, hoja: 0,
  disVidrio: null, referenciaLargo: null, referenciaAncho: null, formulaLargo: null, formulaAncho: null,
  formulaReferenciaLargo: null, formulaReferenciaAncho: null, grupo: null, grupoIzquierdo: null, grupoDerecho: null,
  grupoSuperior: null, grupoInferior: null, gruposAdicionales: [null, null, null, null], perfilAdicional: null, formulaSeleccion: null, ...f,
})

export function crearEmisor(): Emisor {
  const filas: FilaPlantillaCatalogo[] = [], finales: FilaPlantillaCatalogo[] = []
  const fila = (f: FilaParcial) => { filas.push(completa(filas.length + 1, f)); return filas.length }
  return {
    filas, fila,
    manoObra: f => fila({ articulo: ARTICULO_MANO_OBRA, componente: '39', funcion: 'infMOmof', posicionTrabajo: 'L', tipoHoja: '0', ...f }),
    alFinal: f => { finales.push(completa(0, f)) },
    cerrar: () => [...filas, ...finales],
  }
}
