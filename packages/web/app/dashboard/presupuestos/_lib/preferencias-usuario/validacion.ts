import { compararDecimal, normalizarDecimal, signoDecimal } from '@aluminior/core/precios'

export const MAXIMO_PRECIO_HORA_COLOCACION = '999999.99'
const PATRON_DECIMAL = /^\d+(\.\d+)?$/

/** Clave estable y exclusiva del usuario para aislar sus preferencias. */
export function normalizarClaveUsuario(usuario: string | null | undefined): string | null {
  const limpio = usuario?.trim().toLowerCase()
  return limpio ? limpio : null
}

/** Valida un precio/hora en euros como texto decimal positivo con hasta 2 decimales. */
export function validarPrecioHoraColocacion(valor: string): string | null {
  const texto = valor.trim()
  if (!PATRON_DECIMAL.test(texto)) return null
  const decimales = texto.split('.')[1]?.length ?? 0
  if (decimales > 2) return null
  const normalizado = normalizarDecimal(texto, 2)
  if (signoDecimal(normalizado) <= 0) return null
  if (compararDecimal(normalizado, MAXIMO_PRECIO_HORA_COLOCACION) > 0) return null
  return normalizado
}
