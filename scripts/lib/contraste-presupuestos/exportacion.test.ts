import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolve } from 'node:path'
import { filasCsv } from './exportacion.ts'
import { esCopiaPermitida } from '../banco-contraste/fuente.ts'

test('CSV del ETL: comillas, comas decimales y saltos de línea dentro del campo', () => {
  const filas = filasCsv('﻿"nDoc","nLinea","GrupoSN","Texto"\r\n"1","2","True","a, ""b""\nc"\r\n"1","3","False","12,5"\r\n')
  assert.deepEqual(filas, [{ nDoc: '1', nLinea: '2', GrupoSN: 'True', Texto: 'a, "b"\nc' },
    { nDoc: '1', nLinea: '3', GrupoSN: 'False', Texto: '12,5' }])
})

test('la fuente admite Anterior.mdb o una copia con nombre propio en export_datos, nunca aluminio.mdb', () => {
  const raiz = resolve('/repo')
  assert.equal(esCopiaPermitida(resolve('/productor/EMP0016/Anterior.mdb'), raiz), true)
  assert.equal(esCopiaPermitida(resolve('/repo/export_datos/c/EMP0016/copia-20261031.mdb'), raiz), true)
  assert.equal(esCopiaPermitida(resolve('/repo/export_datos/c/aluminio.mdb'), raiz), false)
  assert.equal(esCopiaPermitida(resolve('/productor/EMP0016/aluminio.mdb'), raiz), false)
  assert.equal(esCopiaPermitida(resolve('/repo/otra/copia.mdb'), raiz), false)
})
