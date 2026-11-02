import { test } from 'node:test'
import assert from 'node:assert/strict'
import { prepararVariante, esperadoResto, descontarCajon } from './variantes.ts'
import { analizarReparto } from './uniones.ts'
import { CASO_3, CON_COMPACTO, grupo } from './fixtures.ts'

test('el compacto se aparta con su importe y el resto del GRUPO se puede valorar', () => {
  const c = grupo({ ...CON_COMPACTO, precio: 10 + 10 + 1 + 81.45 }), v = prepararVariante(c)
  assert.deepEqual(v.bloqueos, [])
  assert.deepEqual([v.compactos.elementos, v.compactos.importe], [1, 81.45])
  assert.equal(v.variante.elementos!.some(e => e.modelo === 'COM009'), false)
  assert.equal(v.variante.accesorios!.length, 0)
  assert.ok(Math.abs(esperadoResto(c, v) - 21) < 1e-9)
  assert.equal(v.reconciliado, true)
})

test('el fijo invisible del caso 3 se identifica por diseño específico y precio 0, sin bloquear', () => {
  const v = prepararVariante(grupo(CASO_3))
  assert.deepEqual(v.invisibles, ['modulo-3'])
  assert.equal(v.especificos, 0)
  assert.deepEqual(v.bloqueos, [])
  assert.equal(v.reconciliado, true)
})

test('la valoración nominal conserva la resta del cajón que hizo Productor', () => {
  const c = grupo(CON_COMPACTO), r = analizarReparto(c)
  const altos = descontarCajon(c, r.piezas).geometria!.filter(g => !g.EsUnionSN).map(g => g.AltoHueco)
  assert.deepEqual(altos, [1100, 1100])
})
