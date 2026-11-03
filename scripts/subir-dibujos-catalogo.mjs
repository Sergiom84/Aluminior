/**
 * Sube los BMP de catálogo de ESTRUCTURAS a dibujo_catalogo.
 * No imprime la cadena de conexión ni el contenido. No toca VPresupuestosLin.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import postgres from 'postgres'

const ENV = 'C:\\Users\\sergi\\Desktop\\Aplicaciones\\Aluminior\\.env'
const CARPETA = 'C:\\Users\\sergi\\Desktop\\MIX\\Productor\\Aluminio\\EMP0016\\DIBUJOS\\ESTRUCTURAS'
const NOMBRE = /^[^\\/:*?"<>|]{1,80}\.bmp$/i

for (const linea of readFileSync(ENV, 'utf8').split('\n')) {
  const m = linea.match(/^\s*([A-Z_]+)=(.*)$/)
  if (m) process.env[m[1]] ??= m[2].trim().replace(/^"|"$/g, '')
}
const url = process.env.DATABASE_URL
if (!url) throw new Error('Falta DATABASE_URL')
const destino = new URL(url)
if (!/supabase/.test(destino.hostname) || /localhost|127\.0\.0\.1/.test(destino.hostname)) {
  throw new Error('Destino rechazado')
}

const archivos = readdirSync(CARPETA).filter(nombre => NOMBRE.test(nombre) && !nombre.includes('_mini.'))
const sql = postgres(url, { max: 1, ssl: 'require', connect_timeout: 30, idle_timeout: 20 })
try {
  const partes = readFileSync(new URL('../packages/db/migrations/0035_dibujo_catalogo.sql', import.meta.url), 'utf8')
    .split('--> statement-breakpoint').map(parte => parte.trim()).filter(Boolean)
  for (const parte of partes) await sql.unsafe(parte)
  let subidos = 0
  for (let i = 0; i < archivos.length; i += 25) {
    const lote = archivos.slice(i, i + 25)
    await sql.begin(async tx => {
      for (const nombre of lote) {
        const ruta = join(CARPETA, nombre)
        const contenido = readFileSync(ruta)
        await tx`
          INSERT INTO dibujo_catalogo (nombre, tipo, bytes, contenido)
          VALUES (${nombre}, 'image/bmp', ${contenido.length}, ${contenido})
          ON CONFLICT (nombre) DO UPDATE SET
            tipo = EXCLUDED.tipo, bytes = EXCLUDED.bytes, contenido = EXCLUDED.contenido`
        subidos++
      }
    })
  }
  const [resumen] = await sql`SELECT count(*)::int AS n, coalesce(sum(bytes), 0)::bigint AS bytes FROM dibujo_catalogo`
  const muestra = await sql`
    SELECT nombre, bytes, octet_length(contenido)::int AS largo
    FROM dibujo_catalogo WHERE nombre IN ('GMU001.bmp', 'PSU001.bmp') ORDER BY nombre`
  const disco = Object.fromEntries(muestra.map(fila => [fila.nombre, statSync(join(CARPETA, fila.nombre)).size]))
  const rls = await sql`SELECT relrowsecurity FROM pg_class WHERE relname = 'dibujo_catalogo'`
  console.log(JSON.stringify({
    host: destino.hostname.split('.')[0],
    archivos: archivos.length,
    subidos,
    filas: resumen.n,
    bytes: Number(resumen.bytes),
    rls: rls[0]?.relrowsecurity ?? false,
    muestra: muestra.map(fila => ({
      nombre: fila.nombre,
      coincide: fila.largo === disco[fila.nombre] && fila.bytes === disco[fila.nombre],
    })),
  }))
} finally {
  await sql.end({ timeout: 5 })
}
