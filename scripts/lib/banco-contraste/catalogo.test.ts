import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { TABLAS_CATALOGO } from './catalogo.ts'

/** Tablas de personas que el banco técnico no carga (`prepararLocal` las sustituye por vacías). */
const PERSONAS = new Set(['Clientes', 'ClientesObras', 'Proveedores'])

function ficheros(dir: string): string[] {
  return readdirSync(dir).flatMap(n => {
    const ruta = join(dir, n)
    if (statSync(ruta).isDirectory()) return ficheros(ruta)
    return /\.ts$/.test(n) && !/\.test\.ts$/.test(n) ? [ruta] : []
  })
}

test('el catálogo del banco exporta todas las tablas que carga el ETL', () => {
  const fuentes = ficheros(new URL('../../../packages/etl/src', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'))
  const leidas = new Set<string>()
  for (const f of fuentes) for (const m of readFileSync(f, 'utf8').matchAll(/\bcargar\(\s*'([^']+)'/g)) leidas.add(m[1]!)
  // El barrido tiene que encontrar algo: una ruta mal resuelta no puede pasar en verde.
  assert.ok(fuentes.length > 20, `solo ${fuentes.length} ficheros en packages/etl/src`)
  assert.ok(leidas.size > 15, `solo ${leidas.size} tablas leídas`)
  assert.ok(leidas.has('EstructurasOpcOpciones'))
  const faltan = [...leidas].filter(t => !PERSONAS.has(t) && !TABLAS_CATALOGO.includes(t)).sort()
  assert.deepEqual(faltan, [])
})
