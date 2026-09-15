// Resolucion de la URL del Postgres EFIMERO de pruebas, sin depender de
// artefactos locales ignorados por git.
//
// Antes estos scripts importaban `output/ejecucion-javi/J00/runtime/config.mjs`,
// que esta en .gitignore: el script quedaba roto en cualquier otro checkout.
// Aqui la URL se resuelve por orden de prioridad y el ultimo recurso son las
// credenciales publicas del docker-compose del repo.
//
// Orden:
//   1. ALUMINIOR_TEST_DB_URL       URL completa, gana sobre todo lo demas.
//   2. ALUMINIOR_TEST_DB_PASSWORD  compone la URL con el resto de valores fijos.
//   3. output/.../J00/runtime/config.mjs  si existe (entorno J00 ya montado).
//   4. contrasena del docker-compose (`aluminior`).
//
// La guarda `validar` es deliberada: estos scripts solo deben poder apuntar al
// Postgres efimero de pruebas, nunca a la Supabase compartida.
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export const databases = ['aluminior_test', 'aluminior_etl_test', 'aluminior_javi_test']

const HOST = 'localhost'
const PUERTO = '55433'
const USUARIO = 'aluminior'

export function validar(url) {
  const u = new URL(url)
  if (!['postgres:', 'postgresql:'].includes(u.protocol)) throw new Error('Destino local rechazado')
  if (!['localhost', '127.0.0.1'].includes(u.hostname)) throw new Error('Destino local rechazado')
  if (u.port !== PUERTO) throw new Error('Destino local rechazado')
  const base = u.pathname.slice(1)
  if (!databases.includes(base) || !base.endsWith('_test')) throw new Error('Destino local rechazado')
  return url
}

const configJ00 = new URL('../../../output/ejecucion-javi/J00/runtime/config.mjs', import.meta.url)

async function contrasena() {
  if (process.env.ALUMINIOR_TEST_DB_PASSWORD) return process.env.ALUMINIOR_TEST_DB_PASSWORD
  if (existsSync(fileURLToPath(configJ00))) {
    try {
      const { secrets } = await import(configJ00.href)
      return secrets().dbPassword
    } catch {
      // Entorno J00 ausente o incompleto: seguimos con el valor del compose.
    }
  }
  return 'aluminior'
}

export async function dbUrl(name) {
  if (!databases.includes(name)) throw new Error('BD no permitida')
  if (process.env.ALUMINIOR_TEST_DB_URL) {
    const u = new URL(process.env.ALUMINIOR_TEST_DB_URL)
    u.pathname = '/' + name
    return validar(u.toString())
  }
  const pass = encodeURIComponent(await contrasena())
  return validar(`postgres://${USUARIO}:${pass}@${HOST}:${PUERTO}/${name}`)
}
