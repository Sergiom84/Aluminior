/**
 * Estado del entorno de medición, solo lectura, para ejecutar antes de planificar.
 *
 * Existe para que nadie deduzca el estado del entorno de un error de su propia
 * sesión, así que tiene que arrancar en el entorno más restringido posible:
 * JavaScript plano, sin `tsx` ni `esbuild` (su worker usa `spawn` con tuberías y
 * muere con EPERM en sandboxes de Windows) y sin depender de ningún proceso
 * hijo. Rama y HEAD se leen de los ficheros de Git; el puerto, con un socket.
 * Lo que necesita un proceso hijo se intenta y, si falla, se reporta como
 * `no consultable` — nunca como «apagado».
 *
 * Uso: node scripts/estado-entorno.mjs
 */
import { readFileSync, statSync } from 'node:fs'
import { join, resolve, isAbsolute } from 'node:path'
import { connect } from 'node:net'
import { execFileSync } from 'node:child_process'

// Duplicado a propósito de scripts/lib/banco-contraste/local.ts: este script no
// importa TypeScript. `medir` sigue siendo el que valida la conexión de verdad.
const URL_BASE = 'postgres://aluminior:aluminior@127.0.0.1:55433/aluminior_real_test'
const SALIDA = resolve('export_datos/banco-contraste')

const leerTexto = ruta => { try { return readFileSync(ruta, 'utf8') } catch { return null } }
const leerJson = nombre => { try { return JSON.parse(readFileSync(join(SALIDA, nombre), 'utf8')) } catch { return null } }

/** Resuelve rama y commit leyendo .git, también cuando es un worktree. */
function git() {
  const marca = resolve('.git')
  let dir = null
  try {
    dir = statSync(marca).isDirectory() ? marca : null
    if (!dir) {
      const apunta = (leerTexto(marca) ?? '').match(/^gitdir:\s*(.+)$/m)?.[1]?.trim()
      if (apunta) dir = isAbsolute(apunta) ? apunta : resolve(apunta)
    }
  } catch { return { rama: null, head: null, motivo: 'no se encuentra .git' } }
  if (!dir) return { rama: null, head: null, motivo: 'no se resuelve el gitdir' }

  const comun = (leerTexto(join(dir, 'commondir')) ?? '').trim()
  const comunDir = comun ? (isAbsolute(comun) ? comun : resolve(dir, comun)) : dir
  const cabeza = (leerTexto(join(dir, 'HEAD')) ?? '').trim()
  const ref = cabeza.match(/^ref:\s*(.+)$/)?.[1]?.trim() ?? null
  if (!ref) return { rama: null, head: cabeza.slice(0, 7) || null, motivo: 'HEAD desacoplado' }

  let sha = (leerTexto(join(dir, ref)) ?? leerTexto(join(comunDir, ref)) ?? '').trim()
  if (!sha) {
    const empaquetadas = leerTexto(join(comunDir, 'packed-refs')) ?? ''
    sha = empaquetadas.split('\n').find(l => l.endsWith(` ${ref}`))?.split(' ')[0] ?? ''
  }
  return { rama: ref.replace(/^refs\/heads\//, ''), head: sha ? sha.slice(0, 7) : null, motivo: null }
}

/** Necesita proceso hijo: puede no estar disponible, y eso no es un estado. */
function conProcesoHijo(orden, args) {
  try {
    return { consultado: true, salida: execFileSync(orden, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).replace(/\s+$/, ''), motivo: null }
  } catch (e) {
    return { consultado: false, salida: null, motivo: String(e?.message ?? e).split('\n')[0] }
  }
}

function puertoAccesible(host, puerto, ms = 1500) {
  return new Promise(ok => {
    const s = connect({ host, port: puerto })
    const cerrar = v => { s.destroy(); ok(v) }
    s.setTimeout(ms)
    s.once('connect', () => cerrar(true))
    s.once('timeout', () => cerrar(false))
    s.once('error', () => cerrar(false))
  })
}

const url = new URL(URL_BASE)
const puerto = await puertoAccesible(url.hostname, Number(url.port))
const manifiesto = leerJson('manifiesto.json')
const verificada = leerJson('base-verificada.json')
const resultados = leerJson('resultados.json')
const coincide = !!verificada && !!manifiesto && verificada.fuenteHash === manifiesto.sha256

const sucios = conProcesoHijo('git', ['status', '--porcelain'])
const docker = conProcesoHijo('docker', ['ps', '--filter', 'name=aluminior_pg_test', '--format', '{{.Status}}'])

console.log(JSON.stringify({
  carpeta: resolve('.'),
  ...git(),
  arbol: sucios.consultado
    ? { consultado: true, limpio: sucios.salida.length === 0, sucios: sucios.salida.split('\n').filter(Boolean) }
    : { consultado: false, limpio: null, sucios: null, motivo: sucios.motivo },
  contenedor: docker.consultado
    ? { consultado: true, vivo: docker.salida.length > 0, estado: docker.salida || null, motivo: null }
    : { consultado: false, vivo: null, estado: null, motivo: docker.motivo },
  base: { url: `${url.protocol}//${url.hostname}:${url.port}${url.pathname}`, puertoAccesible: puerto },
  baseVerificada: verificada
    ? { presente: true, firmaVersion: verificada.firmaVersion ?? 1, coincideConManifiesto: coincide, migraciones: verificada.migraciones, pvpVerificados: verificada.pvpVerificados }
    : { presente: false, coincideConManifiesto: false },
  resultados: resultados
    ? { presente: true, ejecutado: resultados.ejecutado, revisionGit: resultados.revisionGit, resumen: resultados.resumen?.total }
    : { presente: false },
  // El puerto es la señal de la base. El cliente de Docker solo informa.
  recomendacion: puerto && coincide
    ? 'basta medir: base viva y firmas coherentes'
    : puerto
      ? 'base viva pero sin firmas coherentes: pregunta al arquitecto antes de preparar'
      : 'puerto cerrado: la base no responde; pregunta al arquitecto antes de borrar o preparar nada',
}, null, 2))
