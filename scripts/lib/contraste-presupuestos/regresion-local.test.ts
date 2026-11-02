/**
 * Regresión con GRUPO reales anonimizados (casos-regresion.json) contra el catálogo
 * real en Postgres local. Solo con ALUMINIOR_CONTRASTE_LOCAL=1: el catálogo es privado.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import type { Caso } from '../banco-contraste/datos.ts'
import type { Resultado, Causa } from './clasificar.ts'

interface CasoRegresion { descripcion: string; caso: Caso; resultado: Resultado; causas: Causa[]; guardadas: number | null }
const casos = JSON.parse(readFileSync(new URL('./casos-regresion.json', import.meta.url), 'utf8')) as CasoRegresion[]
const activo = process.env.ALUMINIOR_CONTRASTE_LOCAL === '1'

test('GRUPO reales: misma clasificación y precio que en el contraste del 02/11/2026', { skip: !activo && 'requiere ALUMINIOR_CONTRASTE_LOCAL=1 y aluminior_real_test' }, async () => {
  const { conectarLocal, URL_LOCAL } = await import('../banco-contraste/local.ts')
  const { contrastarGrupos } = await import('./ejecutar.ts')
  const { sql, db } = conectarLocal(URL_LOCAL)
  try {
    const r = await contrastarGrupos(db, casos.map(c => c.caso), () => false)
    assert.deepEqual(r.map(x => [x.id, x.clasificacion.resultado, x.clasificacion.causas, x.guardadas === null ? null : Math.round(x.guardadas * 100)]),
      casos.map(c => [c.caso.id, c.resultado, c.causas, c.guardadas === null ? null : Math.round(c.guardadas * 100)]))
  } finally { await sql.end({ timeout: 5 }) }
})

test('los casos de regresión no llevan documento, fecha ni despiece', () => {
  for (const { caso } of casos) {
    assert.equal(caso.fecha, ''); assert.equal(caso.piezas.length, 0)
    for (const e of [caso, ...(caso.elementos ?? [])]) assert.equal(e.padre.nDoc, 1)
  }
})
