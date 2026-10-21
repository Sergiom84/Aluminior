/**
 * Estado del entorno de medición, solo lectura, para ejecutar antes de planificar.
 *
 * Existe para que nadie deduzca el estado del entorno de un error de su propia
 * sesión. La señal de la base es el **puerto**, no el cliente de Docker: si
 * `docker` está vetado en la sesión, el puerto sigue respondiendo la verdad.
 *
 * Uso: node --import tsx scripts/estado-entorno.ts
 */
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { connect } from 'node:net'
import { execFileSync } from 'node:child_process'
import { URL_LOCAL } from './lib/banco-contraste/local.ts'

const salida = resolve('export_datos/banco-contraste')

// Solo cola: `status --porcelain` codifica staged/unstaged en los dos primeros
// caracteres y recortarlos cambia lo que el informe dice del árbol.
function git(...args: string[]): string | null {
  try { return execFileSync('git', args, { encoding: 'utf8' }).replace(/\s+$/, '') } catch { return null }
}

function leer(nombre: string): Record<string, unknown> | null {
  try { return JSON.parse(readFileSync(join(salida, nombre), 'utf8')) } catch { return null }
}

function puertoAccesible(host: string, puerto: number, ms = 1500): Promise<boolean> {
  return new Promise(ok => {
    const s = connect({ host, port: puerto })
    const cerrar = (v: boolean) => { s.destroy(); ok(v) }
    s.setTimeout(ms)
    s.once('connect', () => cerrar(true))
    s.once('timeout', () => cerrar(false))
    s.once('error', () => cerrar(false))
  })
}

function contenedor() {
  try {
    const l = execFileSync('docker', ['ps', '--filter', 'name=aluminior_pg_test', '--format', '{{.Status}}'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
    return { consultado: true, vivo: l.length > 0, estado: l || null, motivo: null }
  } catch (e) {
    // No concluyas que está apagado: concluye que no lo puedes comprobar.
    return { consultado: false, vivo: null, estado: null, motivo: (e as Error).message.split('\n')[0] ?? 'no consultable' }
  }
}

const url = new URL(URL_LOCAL)
const base = await puertoAccesible(url.hostname, Number(url.port))
const manifiesto = leer('manifiesto.json')
const verificada = leer('base-verificada.json')
const resultados = leer('resultados.json')
const sucios = (git('status', '--porcelain') ?? '').split('\n').filter(Boolean)

const coincide = !!verificada && !!manifiesto && verificada.fuenteHash === manifiesto.sha256

console.log(JSON.stringify({
  carpeta: resolve('.'),
  rama: git('branch', '--show-current'),
  head: git('rev-parse', '--short', 'HEAD'),
  limpio: sucios.length === 0,
  sucios,
  contenedor: contenedor(),
  base: { url: `${url.protocol}//${url.hostname}:${url.port}${url.pathname}`, puertoAccesible: base },
  baseVerificada: verificada
    ? { presente: true, coincideConManifiesto: coincide, migraciones: verificada.migraciones, pvpVerificados: verificada.pvpVerificados }
    : { presente: false, coincideConManifiesto: false },
  resultados: resultados
    ? { presente: true, ejecutado: resultados.ejecutado, revisionGit: resultados.revisionGit, resumen: (resultados.resumen as { total?: unknown })?.total }
    : { presente: false },
  recomendacion: base && coincide
    ? 'basta medir: base viva y firmas coherentes'
    : base
      ? 'base viva pero sin firmas coherentes: pregunta al arquitecto antes de preparar'
      : 'puerto cerrado: la base no responde; pregunta al arquitecto antes de borrar o preparar nada',
}, null, 2))
