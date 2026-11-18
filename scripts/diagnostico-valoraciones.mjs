/**
 * Diagnóstico de valoraciones: qué líneas de presupuesto no tienen precio, o lo
 * tienen con piezas a 0 €, agrupadas por causa. SOLO LECTURA.
 *
 * Uso:
 *   node scripts/diagnostico-valoraciones.mjs              (todas las líneas)
 *   node scripts/diagnostico-valoraciones.mjs 260004       (un presupuesto)
 *
 * Lee `DATABASE_URL` del `.env` de la raíz y abre la conexión en modo de solo
 * lectura: cualquier escritura la rechaza PostgreSQL. Para una línea concreta,
 * el detalle de entradas está en los logs de Render, prefijo `[valoracion]`.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/** Prefijo del aviso de `despiezarLineaCatalogo` para piezas valoradas a 0 €. */
const A_CERO = 'sin PVP en su acabado, valorado a 0 € como en Productor'

/** Una causa por trozo del aviso, sin el origen ni los números, para poder agrupar. */
export function causasDeAviso(aviso) {
  if (!aviso) return []
  return [...new Set(aviso.split(/;\s*/)
    .map(t => t.replace(/^(?:MODULO|UNION)\s+[\w-]+(?:,\s*[\w-]+)*:\s*/, '')
      .replace(/^(?:Valorado con avisos|Importe incompleto):\s*/i, '')
      .replace(/\.$/, '').trim())
    .filter(Boolean)
    .map(t => t.startsWith(A_CERO) ? t : t.replace(/(?<![A-Za-z0-9])\d+(?:[.,]\d+)?(?![A-Za-z0-9])/g, 'N').replace(/\s+/g, ' ').slice(0, 160)))]
}

/**
 * Agrupa líneas `{ numero, orden, completa, aviso }` por causa. Un aviso que
 * también sale en líneas valoradas completas no explica la falta de precio y se
 * omite, salvo que sea lo único que dice la línea.
 */
export function agruparPorCausa(lineas) {
  const grupos = new Map()
  const deCompletas = new Set(lineas.filter(l => l.completa).flatMap(l => causasDeAviso(l.aviso)))
  for (const l of lineas) {
    const aCero = (l.aviso ?? '').includes(A_CERO)
    if (l.completa && !aCero) continue
    const estado = l.completa ? 'A_CERO' : 'SIN_PRECIO'
    const todas = causasDeAviso(l.aviso)
    const propias = l.completa ? todas : todas.filter(c => !deCompletas.has(c))
    const causas = propias.length ? propias : todas
    for (const causa of causas.length ? causas : ['sin aviso guardado']) {
      if (l.completa && !causa.startsWith(A_CERO)) continue
      const clave = `${estado} | ${causa}`
      const g = grupos.get(clave) ?? { estado, causa, lineas: [] }
      g.lineas.push(`${l.numero}/${l.orden}`)
      grupos.set(clave, g)
    }
  }
  return [...grupos.values()].sort((a, b) => b.lineas.length - a.lineas.length)
}

function leerEnv() {
  for (const linea of readFileSync(new URL('../.env', import.meta.url), 'utf8').split(/\r?\n/)) {
    const m = linea.match(/^\s*([A-Z_]+)=(.*)$/)
    if (m) process.env[m[1]] ??= m[2].trim().replace(/^["']|["']$/g, '')
  }
}

async function main() {
  leerEnv()
  if (!process.env.DATABASE_URL) throw new Error('Falta DATABASE_URL en .env')
  const { default: postgres } = await import('postgres')
  const sql = postgres(process.env.DATABASE_URL, { max: 1, idle_timeout: 5, connect_timeout: 20,
    connection: { default_transaction_read_only: 'on' } })
  const numero = process.argv[2] ?? null
  try {
    const filas = await sql`
      select p.numero, l.orden, l.valoracion_completa as completa, l.aviso_valoracion as aviso, l.pvp_manual as manual
      from lineas l join presupuestos p on p.id = l.presupuesto_id
      where ${numero}::text is null or p.numero::text = ${numero}
      order by p.numero, l.orden`
    const total = filas.length
    const sinPrecio = filas.filter(f => !f.completa).length
    const manual = filas.filter(f => f.manual).length
    console.log(`Líneas: ${total} · sin precio: ${sinPrecio} · con PVP manual: ${manual}`)
    for (const g of agruparPorCausa(filas)) {
      console.log(`\n[${g.estado}] ${g.lineas.length} · ${g.causa}\n  ${g.lineas.slice(0, 15).join(', ')}${g.lineas.length > 15 ? ', …' : ''}`)
    }
  } finally {
    await sql.end()
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch(e => { console.error(e.message); process.exitCode = 1 })
}
