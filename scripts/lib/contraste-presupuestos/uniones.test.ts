import { test } from 'node:test'
import assert from 'node:assert/strict'
import { configuracionGrupo } from '../banco-contraste/geometria.ts'
import { analizarReparto } from './uniones.ts'
import { AJUSTE_DECIMAL, CASO_3, CON_COMPACTO, MITAD_Y_MITAD, UNION_LARGA, grupo } from './fixtures.ts'

test('unión aislada de perfil: Productor resta la mitad a cada pieza, como Aluminior', () => {
  const r = analizarReparto(grupo(MITAD_Y_MITAD))
  assert.equal(r.estado, 'coincide')
  assert.deepEqual(r.uniones.map(u => [u.codigo, u.patron, u.restaPadre, u.restaHijo]), [['GMU039', 'mitad-y-mitad', 20, 20]])
})

test('caso 3 de la 0017: Productor deja 1160/360 donde Aluminior da 1170/340', () => {
  const r = analizarReparto(grupo(CASO_3))
  assert.equal(r.estado, 'difiere')
  assert.deepEqual(r.patrones, ['asimetrico'])
  assert.deepEqual(r.piezas.map(p => [p.codigo, p.prevista[0], p.guardada[0], p.invisible]),
    [['2O', 1170, 1160, false], ['0', 340, 360, true], ['2O', 1170, 1160, false]])
  // El fijo tiene dos uniones: ninguna es aislada y no entra en el recuento por unión.
  assert.equal(r.uniones.length, 0)
})

test('una unión que recorre la columna recorta todas sus piezas en Productor y solo el par anclado en Aluminior', () => {
  const r = analizarReparto(grupo(UNION_LARGA))
  assert.equal(r.estado, 'difiere')
  assert.deepEqual(r.patrones, ['union-recorre-varias-piezas'])
  const inferior = r.piezas.at(-1)!
  assert.deepEqual([inferior.prevista[0], inferior.guardada[0]], [1000, 970])
})

test('el cajón del compacto se reconoce por su resta y no cuenta como diferencia de reparto', () => {
  const r = analizarReparto(grupo(CON_COMPACTO))
  assert.equal(r.estado, 'coincide')
  assert.ok(r.piezas.every(p => p.compacto))
})

test('el ajuste a un total con decimales se separa de la asimetría', () => {
  assert.deepEqual(analizarReparto(grupo(AJUSTE_DECIMAL)).patrones, ['ajuste-decimal-al-total'])
})

test('configuracionGrupo transmite cotas FI y FS de VEstructurasVariables a cada módulo del GRUPO', () => {
  const c = grupo({
    modulos: [
      { codigo: '2OFI', hueco: [1200, 2100], guardada: [1199, 2100], cotas: { FI: 300 } },
      { codigo: '1PFS', hueco: [900, 2100], guardada: [899, 2100], cotas: { FS: 400, FI: 0 } },
      { codigo: '0', hueco: [600, 2100], guardada: [600, 2100] },
    ],
    uniones: [
      { codigo: 'PSU001', vh: 'V', de: 0, a: 1, grosor: 2, longitud: 2100 },
      { codigo: 'PSU001', vh: 'V', de: 1, a: 2, grosor: 2, longitud: 2100 },
    ],
  })
  const { configuracion, motivos } = configuracionGrupo(c, 'linea')
  assert.deepEqual(motivos, [])
  assert.deepEqual(configuracion?.modulos.map(m => m.cotas ?? null), [{ FI: 300 }, { FS: 400 }, null])
})
