import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { esDibujoUnion, listarDibujos, resolverDibujo } from '../../../../../lib/catalogo-uniones/dibujos.ts'

const raiz = mkdtempSync(join(tmpdir(), 'dibujos-union-'))

afterEach(() => rmSync(raiz, { recursive: true, force: true }))

describe('dibujos de unión', () => {
  it('resuelve un nombre dentro de la raíz y rechaza una ruta', () => {
    writeFileSync(join(raiz, 'GMU038.bmp'), 'x')
    expect(resolverDibujo('GMU038.bmp', [raiz])).toBe(join(raiz, 'GMU038.bmp'))
    expect(resolverDibujo('../GMU038.bmp', [raiz])).toBeNull()
    expect(resolverDibujo('GMU038.bmp', [join(raiz, 'no-existe')])).toBeNull()
  })

  it('lista los bmp y distingue las uniones de los cerramientos', () => {
    mkdirSync(raiz, { recursive: true })
    writeFileSync(join(raiz, 'GMU001.bmp'), 'x')
    writeFileSync(join(raiz, '2O.bmp'), 'x')
    writeFileSync(join(raiz, '2O_mini.bmp'), 'x')
    expect(listarDibujos([raiz])).toEqual(['2O.bmp', 'GMU001.bmp'])
    expect(esDibujoUnion('GMU001.bmp')).toBe(true)
    expect(esDibujoUnion('2O.bmp')).toBe(false)
  })
})
