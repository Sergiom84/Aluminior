/**
 * Perfila un CSV exportado: por cada columna, cuántas filas tienen valor útil,
 * cuántos valores distintos, y una muestra.
 *
 * Sirve para reducir tablas de 132 columnas a las que de verdad se usan antes
 * de modelarlas. Sustituye al perfilador en PowerShell, demasiado lento para
 * ficheros de decenas de MB.
 *
 * Uso: node scripts/perfilar.mjs EstructurasDiseño EstructurasArticulos
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse/sync'

for (const linea of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = linea.match(/^\s*([A-Z_]+)=(.*)$/)
  if (m) process.env[m[1]] ??= m[2].trim()
}

const ORIGEN = process.env.RUTA_CSV_ORIGEN
const DESTINO = new URL('../esquema/perfil/', import.meta.url).pathname.replace(/^\//, '')

/** Valores que en el origen significan "sin dato". */
const VACIOS = new Set(['', '0', 'False', '0,00', '0,000'])

/** Tablas cuyas muestras pueden contener datos de terceros: se omiten. */
const CON_DATOS_PERSONALES = new Set([
  'Clientes', 'ClientesObras', 'ClientesPotenciales', 'Proveedores',
  'Acreedores', 'VPresupuestos', 'VFacturas', 'VAlbaranes', 'VPedidos',
])

function localizar(tabla) {
  const directa = join(ORIGEN, `${tabla}.csv`)
  if (existsSync(directa)) return directa
  const patron = new RegExp('^' + tabla.replace(/[^\w]/g, '.') + '\\.csv$', 'i')
  const hit = readdirSync(ORIGEN).find((f) => patron.test(f))
  return hit ? join(ORIGEN, hit) : null
}

for (const tabla of process.argv.slice(2)) {
  const ruta = localizar(tabla)
  if (!ruta) {
    console.log(`${tabla}: CSV no encontrado`)
    continue
  }

  const filas = parse(readFileSync(ruta), {
    columns: true, bom: true, skip_empty_lines: true, relax_quotes: true,
  })
  if (!filas.length) {
    console.log(`${tabla}: vacío`)
    continue
  }

  const columnas = Object.keys(filas[0])
  const omitirMuestra = CON_DATOS_PERSONALES.has(tabla)
  const resultado = []

  for (const col of columnas) {
    let conValor = 0
    const distintos = new Set()
    for (const f of filas) {
      const v = f[col]
      if (v != null && !VACIOS.has(v.trim())) {
        conValor++
        if (distintos.size < 1000) distintos.add(v)
      }
    }
    let muestra = omitirMuestra
      ? '[omitido: datos de terceros]'
      : [...distintos].slice(0, 3).join(' | ').slice(0, 60)

    resultado.push({
      Columna: col,
      ConValor: conValor,
      PctUso: Math.round((1000 * conValor) / filas.length) / 10,
      Distintos: distintos.size,
      Muestra: muestra,
    })
  }

  resultado.sort((a, b) => b.ConValor - a.ConValor)

  const csv = [
    'Columna,ConValor,PctUso,Distintos,Muestra',
    ...resultado.map((r) =>
      [r.Columna, r.ConValor, r.PctUso, r.Distintos, `"${String(r.Muestra).replace(/"/g, '""')}"`].join(','),
    ),
  ].join('\n')

  writeFileSync(join(DESTINO, `${tabla.replace(/[^\w]/g, '_')}.csv`), csv, 'utf8')

  const usadas = resultado.filter((r) => r.ConValor > 0).length
  console.log(
    `${tabla}: ${filas.length} filas, ${columnas.length} columnas -> ${usadas} con datos (${Math.round((100 * usadas) / columnas.length)}%)`,
  )
}
