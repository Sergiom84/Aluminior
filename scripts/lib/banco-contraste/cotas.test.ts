import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cotasDeCaso } from './cotas.ts'
import type { Caso } from './datos.ts'

// Variables sintéticas con la forma de VEstructurasVariables.
const v = (Estructura: string, SimboloVariable: string, Valor: number, extra = {}) =>
  ({ TipoDoc: 'VPRES', nDoc: 1, nLinEstr: 10, Estructura, SimboloVariable, Valor, SubestructuraSN: false, NumeroInstancia: 1, ...extra })
const caso = (variables: object[]) => ({ modelo: 'XFI', variables }) as unknown as Caso

test('toma las cotas de la estructura de la línea y deja las del compacto', () => {
  assert.deepEqual(cotasDeCaso(caso([v('XFI', 'fi', 350), v('XFI', 'FS', 0), v('COMX', 'CAJ', 155)])),
    { cotas: { FI: 350, FS: 0 }, motivos: [] })
  assert.deepEqual(cotasDeCaso(caso([])), { cotas: {}, motivos: [] })
})
test('bloquea símbolos repetidos, instancias múltiples o valores ausentes', () => {
  for (const vs of [[v('XFI', 'FI', 1), v('XFI', 'FI', 2)], [v('XFI', 'FI', 1, { NumeroInstancia: 2 })], [v('XFI', 'FI', null as unknown as number)]]) {
    assert.deepEqual(cotasDeCaso(caso(vs)).motivos, ['cotas-de-instancia-no-representables'])
  }
})
