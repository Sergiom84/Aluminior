import { fragmentosBusqueda } from '../../../../lib/busqueda-clientes.ts'
import {
  interpretarFecha, interpretarImporte, type FechaConsulta, type ImporteConsulta,
} from '../busqueda-listado.ts'
import type { TipoBusqueda } from './tipos.ts'

/**
 * Traduce el texto escrito a lo que se va a comparar, según el tipo elegido.
 *
 * - nombre, calle y obra: fragmentos sin acentos ni mayúsculas; todos deben
 *   aparecer en el mismo campo, en cualquier orden.
 * - codigo: el texto sin espacios ni comodines. El número de presupuesto y el
 *   código de cliente casan por prefijo; la referencia interna, por contenido.
 * - telefono: solo las cifras, al menos tres.
 * - fecha: dd/mm/aaaa (o dd/mm/aa, o aaaa-mm-dd) es ese día; dd/mm es ese día
 *   de cualquier año; mm/aaaa es el mes; aaaa es el año.
 * - precio: «2176,09», «2.176,09» y «2176.09» son exactos al céntimo; un
 *   importe sin decimales («2176» o «2.176») casa con todo ese euro.
 */
export type PlanBusqueda =
  | { tipo: 'nombre' | 'calle' | 'obra'; fragmentos: string[] }
  | { tipo: 'codigo'; texto: string }
  | { tipo: 'telefono'; digitos: string }
  | { tipo: 'fecha'; fecha: FechaConsulta }
  | { tipo: 'precio'; importe: ImporteConsulta }
  | { tipo: TipoBusqueda; error: string }

const LONGITUD_MAXIMA = 120
export const MINIMO_CIFRAS_TELEFONO = 3

/** Fragmentos normalizados, sin el carácter de escape de LIKE. */
export function fragmentosConsulta(consulta: string): string[] {
  return fragmentosBusqueda(consulta).map((fragmento) => fragmento.replace(/\\/g, '')).filter(Boolean)
}

export function digitosTelefono(consulta: string): string {
  return consulta.replace(/\D/g, '')
}

export function textoCodigo(consulta: string): string {
  return consulta.replace(/[\s%_\\]/g, '')
}

/** `null` cuando no hay nada que buscar: el listado se muestra sin filtrar. */
export function planBusqueda(tipo: TipoBusqueda, consulta: string): PlanBusqueda | null {
  const texto = consulta.trim().slice(0, LONGITUD_MAXIMA)
  if (!texto) return null

  switch (tipo) {
    case 'nombre':
    case 'calle':
    case 'obra': {
      const fragmentos = fragmentosConsulta(texto)
      return fragmentos.length ? { tipo, fragmentos } : { tipo, error: 'Texto no válido.' }
    }
    case 'codigo': {
      const limpio = textoCodigo(texto)
      return limpio ? { tipo, texto: limpio } : { tipo, error: 'Código no válido.' }
    }
    case 'telefono': {
      const digitos = digitosTelefono(texto)
      return digitos.length >= MINIMO_CIFRAS_TELEFONO
        ? { tipo, digitos }
        : { tipo, error: `Escribe al menos ${MINIMO_CIFRAS_TELEFONO} cifras.` }
    }
    case 'fecha': {
      const fecha = interpretarFecha(texto)
      return fecha ? { tipo, fecha } : { tipo, error: 'Fecha no reconocida.' }
    }
    case 'precio': {
      const importe = interpretarImporte(texto)
      return importe ? { tipo, importe } : { tipo, error: 'Precio no reconocido.' }
    }
  }
}
