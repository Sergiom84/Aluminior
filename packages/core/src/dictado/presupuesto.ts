import type { MedidaDictada } from './datos.ts'

export const LIMITE_OBRA = 200
export const LIMITE_OBSERVACIONES = 4000

export interface RevisionDictado {
  nombre: string
  telefono: string
  direccion: string
  queMontar: string
  medidas: MedidaDictada[]
  transcripcion: string
}

export interface CamposAlta {
  nombreLibre: string
  obraTexto: string
  observaciones: string
}

export function textoMedida(m: MedidaDictada): string {
  const cota = (v: number | null) => (v === null ? '?' : String(v))
  const base = m.ancho === null && m.alto === null ? '' : `${cota(m.ancho)} x ${cota(m.alto)} mm`
  return [base, m.nota ?? ''].filter(Boolean).join(' ')
}

function recortar(valor: string, limite: number): string {
  const letras = [...valor]
  return letras.length <= limite ? valor : `${letras.slice(0, limite - 1).join('')}…`
}

/**
 * Campos de la cabecera de alta. La obra cabe en 200 caracteres; si lo que
 * quiere montar es más largo, va entero a observaciones. El importe no sale
 * de aquí: el presupuesto nace sin valorar.
 */
export function camposAltaDictado(r: RevisionDictado): CamposAlta {
  const queMontar = r.queMontar.trim()
  const lineas: string[] = []
  if (r.telefono.trim()) lineas.push(`Teléfono: ${r.telefono.trim()}`)
  if (r.direccion.trim()) lineas.push(`Dirección: ${r.direccion.trim()}`)
  if ([...queMontar].length > LIMITE_OBRA) lineas.push(`Qué quiere montar: ${queMontar}`)
  const medidas = r.medidas.map(textoMedida).filter(Boolean)
  if (medidas.length) lineas.push(`Medidas:\n${medidas.map((m) => `- ${m}`).join('\n')}`)
  const transcripcion = r.transcripcion.trim()
  if (transcripcion) lineas.push(`Dictado:\n${transcripcion}`)
  return {
    nombreLibre: recortar(r.nombre.trim(), 200),
    obraTexto: recortar(queMontar, LIMITE_OBRA),
    observaciones: recortar(lineas.join('\n\n'), LIMITE_OBSERVACIONES),
  }
}
