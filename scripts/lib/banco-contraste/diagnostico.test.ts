import { test } from 'node:test'
import assert from 'node:assert/strict'
import { comprobarNoRegresion, diagnosticoBanco } from './diagnostico.ts'
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
