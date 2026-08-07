/**
 * Numeración del documento destino de una copia.
 *
 * Evidencia (§8): el diálogo pide «Número de Documento Destino: Número +
 * Revisión + Serie». Si no se indica número, Productor propone el siguiente;
 * la práctica del operador es conservar el MISMO número y subir la revisión
 * (11 rev. 0 -> 11 rev. 1).
 *
 * Las dos estrategias existen y son distintas, así que se modelan las dos y se
 * obliga a elegir. Aquí no se decide cuál es «la buena»: eso lo decide quien
 * abre el diálogo.
 *
 * `presupuestos` ya soporta esto: `numero`, `revision`, `serie` y el índice
 * `presupuestos_numero_idx` sobre (numero, revision).
 */

export interface NumeracionDocumento {
  readonly numero: number
  readonly revision: number
  readonly serie: string
}

export type EstrategiaDestino = 'MISMO_NUMERO_NUEVA_REVISION' | 'NUEVO_NUMERO'

export interface ContextoNumeracion {
  /** Revisiones ya existentes de ese número y serie, incluida la del origen. */
  readonly revisionesUsadas: readonly number[]
  /**
   * Siguiente número libre, para PREVISUALIZAR únicamente. No autoriza nada:
   * `copiarPresupuesto` no lo usa, y quien lo pase aquí debe tratarlo como un
   * dato que puede quedar desfasado en cuanto otra transacción escribe.
   */
  readonly siguienteNumero?: number
}

export type ResultadoDestino =
  | { ok: true; destino: NumeracionDocumento }
  | { ok: false; errores: readonly string[] }

/**
 * Propone la numeración del destino. NO es autoridad transaccional (T.71.2):
 * es pura, no relee la base dentro de ningún lock, y `contexto` es una foto
 * tomada antes de abrir la transacción que puede quedar desfasada por una
 * escritura concurrente. Sirve sólo para una vista previa en UI; la reserva
 * real —lock, relectura y comprobación de existencia— la hace
 * `reservarNumeracion` de `_lib/numeracion/`, y es la única que
 * `copiarPresupuesto` usa para escribir.
 *
 * La revisión nueva sale de la mayor existente, no de la del origen: copiar la
 * revisión 0 de un documento que ya tiene la 1 debe dar la 2, no chocar con la
 * que ya está escrita.
 */
export function proponerDestino(
  origen: NumeracionDocumento,
  estrategia: EstrategiaDestino,
  contexto: ContextoNumeracion,
): ResultadoDestino {
  if (estrategia === 'NUEVO_NUMERO') {
    if (contexto.siguienteNumero === undefined) {
      return {
        ok: false,
        errores: ['No se puede proponer un número nuevo sin la secuencia del ejercicio'],
      }
    }
    return {
      ok: true,
      destino: { numero: contexto.siguienteNumero, revision: 0, serie: origen.serie },
    }
  }

  const maxima = Math.max(origen.revision, ...contexto.revisionesUsadas)
  return {
    ok: true,
    destino: { numero: origen.numero, revision: maxima + 1, serie: origen.serie },
  }
}

/**
 * Comprueba una numeración tecleada a mano antes de escribir nada.
 *
 * El original queda intacto y ambas revisiones conviven: por eso el destino no
 * puede coincidir con el origen ni con una revisión ya escrita.
 */
export function validarDestino(
  origen: NumeracionDocumento,
  destino: NumeracionDocumento,
  contexto: ContextoNumeracion,
): ResultadoDestino {
  const errores: string[] = []
  if (!Number.isInteger(destino.numero) || destino.numero <= 0) {
    errores.push('El número de documento destino no es válido')
  }
  if (!Number.isInteger(destino.revision) || destino.revision < 0) {
    errores.push('La revisión de destino no es válida')
  }
  if (!destino.serie.trim()) errores.push('La serie de destino no puede quedar vacía')

  const mismaNumeracion = destino.numero === origen.numero && destino.serie === origen.serie
  if (mismaNumeracion && destino.revision === origen.revision) {
    errores.push('El destino coincide con el documento origen: la copia lo sobrescribiría')
  } else if (mismaNumeracion && contexto.revisionesUsadas.includes(destino.revision)) {
    errores.push(`Ya existe la revisión ${destino.revision} del documento ${destino.numero}`)
  }

  if (errores.length) return { ok: false, errores }
  return { ok: true, destino }
}
