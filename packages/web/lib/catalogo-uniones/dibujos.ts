import { existsSync, readdirSync } from 'node:fs'
import { dirname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const NOMBRE = /^[^\\/:*?"<>|]{1,80}\.(bmp|png|jpe?g|webp)$/i
const RAIZ_REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..')

/** Carpeta pedida por el operador. No se copia al repositorio. */
export const DIBUJOS_ESTRUCTURAS_LOCAL =
  'C:\\Users\\sergi\\Desktop\\MIX\\Productor\\Aluminio\\EMP0016\\DIBUJOS\\ESTRUCTURAS'

export function carpetaSubidas() {
  return resolve(RAIZ_REPO, 'output', 'uniones-imagenes')
}

export function raicesDibujos(env = process.env.ALUMINIOR_DIBUJOS_ESTRUCTURAS): string[] {
  const candidatas = [env, DIBUJOS_ESTRUCTURAS_LOCAL, carpetaSubidas()].filter((ruta): ruta is string => Boolean(ruta))
  return [...new Set(candidatas.filter(ruta => existsSync(ruta)).map(ruta => resolve(ruta)))]
}

export function nombreDibujoValido(archivo: string) {
  return NOMBRE.test(archivo) && !archivo.includes('..')
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

export function esDibujoUnion(nombre: string) {
  return /^(GMU\d+|PSU\d+|U)\.bmp$/i.test(nombre)
}
