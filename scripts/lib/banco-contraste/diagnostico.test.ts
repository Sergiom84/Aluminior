import { test } from 'node:test'
import assert from 'node:assert/strict'
import { comprobarNoRegresion, delta, diagnosticoBanco } from './diagnostico.ts'
import type { Medicion } from './datos.ts'
const m = (id: string, obtenido: number | null, estado: Medicion['estado'] = 'distinto'): Medicion => ({
  id, modelo: '2O', tipo: 'ESTRUCTURA', fecha: '', esperado: 100, obtenido, estado,
  diferencia: obtenido === null ? null : obtenido - 100, causas: ['segundo-acabado-sin-mapeo', 'pieza-ausente'],
  avisos: [], piezas: [], tarifaPosterior: null,
})
test('intervalos excluyentes en céntimos y bloqueo primario por línea', () => {
  const r = diagnosticoBanco([m('a', 101), m('b', 105), m('c', 110), m('d', 111), m('e', null, 'sin valorar')])
  assert.deepEqual(r.distribucion.map(d => d.lineas), [1, 1, 1, 1, 0])
  assert.deepEqual(r.principales.map(p => p.lineas), [4, 1])
  assert.equal(r.bloqueos.at(-1)?.causa, 'segundo-acabado-sin-mapeo')
})
test('ganar una igualdad no compensa perder otra ni excluirla', () => {
  assert.throws(() => comprobarNoRegresion([m('a', 100, 'igual')], [m('b', 100, 'igual')]), /Regresión/)
  assert.throws(() => comprobarNoRegresion([m('a', 100, 'igual')], [m('a', 105)]), /Regresión/)
  comprobarNoRegresion([m('a', 100, 'igual')], [m('a', 100, 'igual'), m('b', 100, 'igual')])
})
test('el delta ve los dos sentidos, la ausencia y el importe sin cambio de estado', () => {
  const d = delta(
    [m('a', 100, 'igual'), m('b', null, 'sin valorar'), m('c', 110), m('d', 100, 'igual')],
    [m('a', 105), m('b', 120), m('c', 115), m('e', 100, 'igual')],
  )
  assert.deepEqual(d.igualdadesPerdidas, ['a', 'd'])
  assert.deepEqual(d.igualdadesGanadas, ['e'])
  assert.deepEqual(d.cambiosDeEstado.find(c => c.id === 'b'), { id: 'b', antes: 'sin valorar', ahora: 'distinto' })
  assert.deepEqual(d.cambiosDeEstado.find(c => c.id === 'd'), { id: 'd', antes: 'igual', ahora: 'ausente' })
  assert.deepEqual(d.importesCambiados, [{ id: 'c', antes: 110, ahora: 115 }])
  assert.equal(d.sinCambio, false)
})
test('el delta no inventa cambios cuando la medición es idéntica', () => {
  const med = [m('a', 100, 'igual'), m('b', null, 'sin valorar')]
  const d = delta(med, med)
  assert.equal(d.sinCambio, true)
  assert.deepEqual([d.igualdadesGanadas, d.igualdadesPerdidas, d.cambiosDeEstado, d.importesCambiados], [[], [], [], []])
})
