/**
 * Vocabulario común de los DOS documentos de producción (G2).
 *
 * La hoja de corte y la hoja de producción son documentos distintos, no dos
 * vistas del mismo (evidencia del vídeo de Gaia, 24:10–27:45). Lo único que
 * comparten es lo que hay aquí: la identificación del documento, los
 * parámetros físicos de la sierra y el vocabulario de corte y orientación.
 * Cada hoja vive en su propio módulo y ninguna es superconjunto de la otra.
 *
 * Aquí no hay E/S ni maquetación: funciones puras sobre datos ya calculados.
 */

/** Cabecera mínima común: `Presupuesto: 000011-1` más cliente y obra. */
export interface ReferenciaDocumento {
  /** Número del presupuesto tal como se imprime (`000011`). */
  numero: string
  /** Revisión del documento. Productor la imprime pegada al número. */
  revision: number
  clienteCodigo?: string | null
  clienteNombre?: string | null
  obra?: string | null
}

/** `000011-1`, la forma en que ambos documentos citan el presupuesto. */
export function etiquetaDocumento(doc: ReferenciaDocumento): string {
  return `${doc.numero}-${doc.revision}`
}

/**
 * Identificación mostrable de una estructura.
 *
 * Una estructura sin `Referencia (Tipo)` NO se omite: se identifica por su
 * índice dentro del documento. El vídeo señala que en Productor esas
 * estructuras salen sin identificar; aquí eso se corrige, porque un palo que
 * no se sabe de dónde sale es un palo que se corta dos veces.
 */
export function identificarEstructura(referencia: string | null | undefined, indice: number): string {
  const ref = (referencia ?? '').trim()
  return ref !== '' ? ref : `estructura ${indice}`
}
