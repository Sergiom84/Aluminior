export interface Resultado {
  tabla: string
  leidas: number
  insertadas: number
  descartadas: number
  excluidas: number
  motivos: Map<string, number>
}

/**
 * Descarte: la fila DEBERÍA haber entrado y no pudo. Es un problema.
 */
export function descartar(r: Resultado, motivo: string) {
  r.descartadas++
  r.motivos.set(`descartada: ${motivo}`, (r.motivos.get(`descartada: ${motivo}`) ?? 0) + 1)
}

/**
 * Exclusión: la fila NO pertenece a esta tabla y se filtra a propósito.
 * No es un error y no debe hacer fallar la carga. La distinción importa:
 * si todo se cuenta igual, un descarte real se esconde entre el ruido.
 */
export function excluir(r: Resultado, motivo: string) {
  r.excluidas++
  r.motivos.set(`excluida: ${motivo}`, (r.motivos.get(`excluida: ${motivo}`) ?? 0) + 1)
}
