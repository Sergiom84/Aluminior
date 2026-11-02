import { test } from 'node:test'
import assert from 'node:assert/strict'
import { clasificarGrupo, type EntradaClasificacion } from './clasificar.ts'

const base = (e: Partial<EntradaClasificacion> = {}): EntradaClasificacion => ({ bloqueos: [], esperado: 100, esperadoResto: 100,
  compacto: 0, tapajuntas: 0, invisible: 0, invisibles: 0, especificos: 0,
  guardadas: { precio: 100, causas: [], motivos: [], avisos: [] }, nominales: { precio: 100, causas: [], motivos: [], avisos: [] }, ...e })

test('coincide al céntimo con medidas guardadas y nominales', () => {
  assert.deepEqual(clasificarGrupo(base()), { resultado: 'coincide', causas: [], principal: null, importes: {}, desviacion: 0, receta: 'igual' })
})

test('compacto: el resto coincide y la diferencia es el importe del compacto', () => {
  const r = clasificarGrupo(base({ esperado: 595.76, esperadoResto: 476.28, compacto: 119.48,
    guardadas: { precio: 476.28, causas: [], motivos: [], avisos: [] }, nominales: { precio: 476.28, causas: [], motivos: [], avisos: [] } }))
  assert.equal(r.resultado, 'difiere'); assert.deepEqual(r.causas, ['compacto']); assert.equal(r.importes.compacto, 119.48)
})

test('invisible: Aluminior cobra el módulo que Productor deja a 0', () => {
  const r = clasificarGrupo(base({ esperado: 1031.1, esperadoResto: 1031.1, invisible: 84.7, invisibles: 1,
    guardadas: { precio: 1115.8, causas: [], motivos: [], avisos: [] }, nominales: null }))
  assert.deepEqual([r.resultado, r.causas, r.importes.invisible], ['difiere', ['invisible'], 84.7])
})

test('reparto: con medidas guardadas coincide y desde el hueco no', () => {
  const r = clasificarGrupo(base({ nominales: { precio: 101.5, causas: [], motivos: [], avisos: [] } }))
  assert.deepEqual([r.resultado, r.principal, r.importes['reparto-uniones'], r.desviacion], ['difiere', 'reparto-uniones', 1.5, 1.5])
})

test('sin precio no hay importe: sin valorar o no reproducible, nunca cero', () => {
  const sin = clasificarGrupo(base({ guardadas: { precio: null, causas: [], motivos: ['acristalamiento-alternativo-sin-mapeo'], avisos: [] } }))
  assert.deepEqual([sin.resultado, sin.causas, sin.desviacion], ['sin-valorar', ['vidrio'], null])
  const dibujo = clasificarGrupo(base({ guardadas: { precio: null, causas: [], motivos: ['modelo-sin-plantilla-visual'], avisos: [] } }))
  assert.deepEqual([dibujo.resultado, dibujo.causas], ['no-reproducible', ['no-dibujable']])
  assert.equal(clasificarGrupo(base({ bloqueos: ['precio-manual'] })).resultado, 'excluido')
})

test('una diferencia del motor conserva la causa del diagnóstico por pieza', () => {
  const r = clasificarGrupo(base({ guardadas: { precio: 98, causas: ['pvp-o-tarifa', 'acabado-de-articulo'], motivos: [], avisos: [] }, nominales: null }))
  assert.deepEqual([r.resultado, r.causas, r.importes.tarifa], ['difiere', ['tarifa', 'acabado'], 2])
})

test('la cota FI/FS sin valor en un módulo del GRUPO es causa propia, no un corte genérico', () => {
  const r = clasificarGrupo(base({ guardadas: { precio: null, causas: [], motivos: [], avisos: [
    'Faltan costes o materiales necesarios para este origen', 'Importe incompleto: P (HV): pieza 1: Variable "FI" sin valor en el contexto — en "REF-FI"'] } }))
  assert.deepEqual([r.resultado, r.causas], ['sin-valorar', ['cota-fi-fs']])
})

test('con otra tarifa la receta puede coincidir: cortes, metrajes y cantidades iguales y solo cambia el PVP', () => {
  const tarifa = clasificarGrupo(base({ guardadas: { precio: 90, causas: ['pvp-o-tarifa', 'importe-de-fila', 'mano-de-obra', 'acabado-de-articulo'], motivos: [], avisos: [] }, nominales: null }))
  assert.deepEqual([tarifa.resultado, tarifa.receta], ['difiere', 'igual'])
  const corte = clasificarGrupo(base({ guardadas: { precio: 90, causas: ['pvp-o-tarifa', 'longitud-de-corte'], motivos: [], avisos: [] }, nominales: null }))
  assert.equal(corte.receta, 'distinta')
  assert.equal(clasificarGrupo(base({ bloqueos: ['precio-manual'] })).receta, null)
})
