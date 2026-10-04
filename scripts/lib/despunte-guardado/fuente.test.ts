import { test } from 'node:test'
import assert from 'node:assert/strict'
import { join } from 'node:path'
import { verificarCopiaDespunte } from './fuente.ts'

test('solo acepta la copia histórica explícita de 0016, nunca la base activa ni una copia de ensayo disfrazada', () => {
  const huella = 'a'.repeat(64)
  verificarCopiaDespunte(join('fuentes', 'EMP0016', 'Anterior.mdb'), huella)
  for (const ruta of [join('EMP0016', 'aluminio.mdb'), join('EMP0017', 'Anterior.mdb'), 'Anterior.mdb'])
    assert.throws(() => verificarCopiaDespunte(ruta, huella), /no admite base activa/)
  assert.throws(() => verificarCopiaDespunte(join('EMP0016', 'Anterior.mdb'), ''), /SHA-256/)
})
