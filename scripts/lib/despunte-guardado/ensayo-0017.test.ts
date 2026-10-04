import test from 'node:test'
import assert from 'node:assert/strict'
import { resolve } from 'node:path'
import { verificarProcedenciaEnsayo } from './ensayo-0017.ts'

const raiz = resolve('output/e1-despunte')
const copia = resolve(raiz, 'fuente/EMP0017/ensayo-e1-sintetico.mdb')
const sha = 'a'.repeat(64)
const procedencia = { empresa: '0017', fuente: resolve('fuente/EMP0017/aluminio.mdb'),
  copia, sha256: sha, sha256Antes: sha, sha256Despues: sha, bytes: 100 }

test('admite copia de ensayo con procedencia estable explícita', () => {
  assert.doesNotThrow(() => verificarProcedenciaEnsayo(procedencia, copia, raiz))
})
test('rechaza fuente cambiante, huella ausente y tamaño inválido', () => {
  for (const cambio of [{ sha256Despues: 'b'.repeat(64) }, { sha256: '' }, { bytes: 0 }])
    assert.throws(() => verificarProcedenciaEnsayo({ ...procedencia, ...cambio }, copia, raiz))
})
test('rechaza activa, histórico, empresa diferente y copia fuera del área privada', () => {
  for (const otra of [resolve(raiz, 'EMP0017/aluminio.mdb'), resolve(raiz, 'EMP0017/Anterior.mdb'),
    resolve(raiz, 'EMP0016/ensayo-e1-sintetico.mdb'), resolve('fuera/EMP0017/ensayo-e1-sintetico.mdb')])
    assert.throws(() => verificarProcedenciaEnsayo({ ...procedencia, copia: otra }, otra, raiz))
  assert.throws(() => verificarProcedenciaEnsayo({ ...procedencia, empresa: '0016' }, copia, raiz))
})
test('rechaza destino real distinto del declarado y procedencia de otra empresa', () => {
  assert.throws(() => verificarProcedenciaEnsayo({ ...procedencia, copia: copia + '.alias' }, copia, raiz))
  assert.throws(() => verificarProcedenciaEnsayo({ ...procedencia, fuente: resolve('EMP0016/aluminio.mdb') }, copia, raiz))
})
