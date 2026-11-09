import { normalizarTelefono } from './telefono.ts'

/** Medida en milímetros. Lo que no se dijo queda en null, nunca en cero. */
export interface MedidaDictada {
  ancho: number | null
  alto: number | null
  nota: string | null
}

export interface DatosDictado {
  nombre: string | null
  telefono: string | null
  direccion: string | null
  queMontar: string | null
  medidas: MedidaDictada[]
}

export const LIMITE_TEXTO_DICTADO = 8000
const MAX_MEDIDAS = 30
const MM_MIN = 100
const MM_MAX = 10000

/** Esquema que se pide al modelo. El resultado se vuelve a validar aquí. */
export const ESQUEMA_DICTADO = {
  type: 'object',
  additionalProperties: false,
  required: ['nombre', 'telefono', 'direccion', 'queMontar', 'medidas'],
  properties: {
    nombre: { type: ['string', 'null'] },
    telefono: { type: ['string', 'null'] },
    direccion: { type: ['string', 'null'] },
    queMontar: { type: ['string', 'null'] },
    medidas: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['ancho', 'alto', 'nota'],
        properties: {
          ancho: { type: ['integer', 'null'] },
          alto: { type: ['integer', 'null'] },
          nota: { type: ['string', 'null'] },
        },
      },
    },
  },
} as const

function texto(valor: unknown, limite: number): string | null {
  if (typeof valor !== 'string') return null
  const limpio = valor.replace(/\s+/g, ' ').trim()
  if (!limpio) return null
  return [...limpio].slice(0, limite).join('')
}

function milimetros(valor: unknown): number | null {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) return null
  const entero = Math.round(valor)
  return entero >= MM_MIN && entero <= MM_MAX ? entero : null
}

/**
 * Sanea la respuesta del modelo: nada de lo que devuelva entra sin pasar por
 * aquí. Un campo dudoso queda vacío para que el operador lo rellene.
 */
export function sanearDictado(bruto: unknown): DatosDictado {
  const entrada = (bruto && typeof bruto === 'object' ? bruto : {}) as Record<string, unknown>
  const lista = Array.isArray(entrada.medidas) ? entrada.medidas : []
  const medidas: MedidaDictada[] = []
  for (const item of lista.slice(0, MAX_MEDIDAS)) {
    const m = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>
    const medida = { ancho: milimetros(m.ancho), alto: milimetros(m.alto), nota: texto(m.nota, 120) }
    if (medida.ancho || medida.alto || medida.nota) medidas.push(medida)
  }
  const telefono = texto(entrada.telefono, 30)
  return {
    nombre: texto(entrada.nombre, 200),
    telefono: normalizarTelefono(telefono) ?? telefono,
    direccion: texto(entrada.direccion, 300),
    queMontar: texto(entrada.queMontar, 1000),
    medidas,
  }
}
