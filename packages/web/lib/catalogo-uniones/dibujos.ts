import { existsSync, readdirSync } from 'node:fs'
import { resolve, sep } from 'node:path'
import { esDibujoUnion, nombreDibujoValido } from './nombres-dibujo.ts'

export { esDibujoUnion, nombreDibujoValido }

/** Carpeta pedida por el operador. No se copia al repositorio. */
export const DIBUJOS_ESTRUCTURAS_LOCAL =
  'C:\\Users\\sergi\\Desktop\\MIX\\Productor\\Aluminio\\EMP0016\\DIBUJOS\\ESTRUCTURAS'

export function raicesDibujos(env = process.env.ALUMINIOR_DIBUJOS_ESTRUCTURAS): string[] {
  const candidatas = [env, DIBUJOS_ESTRUCTURAS_LOCAL].filter((ruta): ruta is string => Boolean(ruta))
  return [...new Set(candidatas.filter(ruta => existsSync(ruta)).map(ruta => resolve(ruta)))]
}

/** Resuelve un nombre suelto dentro de una raíz permitida. Rechaza rutas. */
export function resolverDibujo(archivo: string, raices: readonly string[]): string | null {
  if (!nombreDibujoValido(archivo)) return null
  for (const raiz of raices) {
    const base = resolve(raiz)
    const candidato = resolve(base, archivo)
    if (candidato.startsWith(base + sep) && existsSync(candidato)) return candidato
  }
  return null
}

export function listarDibujos(raices = raicesDibujos()): string[] {
  const nombres = new Set<string>()
  for (const raiz of raices) {
    for (const entrada of readdirSync(raiz, { withFileTypes: true })) {
      if (!entrada.isFile() || entrada.name.includes('_mini.')) continue
      if (nombreDibujoValido(entrada.name)) nombres.add(entrada.name)
    }
  }
  return [...nombres].sort((a, b) => a.localeCompare(b, 'es'))
}
