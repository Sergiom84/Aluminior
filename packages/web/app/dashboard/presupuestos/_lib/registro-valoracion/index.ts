/**
 * Escribe el registro de una valoración en la salida estándar (logs de Render).
 *
 * Una línea por valoración, `[valoracion] {json}`, para filtrar por prefijo.
 * Nunca interrumpe el guardado: si algo falla al construir o escribir, se
 * descarta el registro y la línea sigue su curso.
 */
import { construirRegistroValoracion, PREFIJO_REGISTRO_VALORACION, type EntradaRegistroValoracion } from './construir.ts'

export { construirRegistroValoracion, PREFIJO_REGISTRO_VALORACION, type EntradaRegistroValoracion } from './construir.ts'

/** Admite la entrada o una función que la construye, para que también su fallo quede dentro. */
export function registrarValoracion(entrada: EntradaRegistroValoracion | (() => EntradaRegistroValoracion),
  escribir: (texto: string) => void = console.info): void {
  try {
    const datos = typeof entrada === 'function' ? entrada() : entrada
    escribir(`${PREFIJO_REGISTRO_VALORACION} ${JSON.stringify(construirRegistroValoracion(datos))}`)
  } catch {
    // El registro es diagnóstico: su fallo no puede impedir guardar la línea.
  }
}
