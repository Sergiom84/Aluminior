import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { Caso, Medicion, Pieza } from '../banco-contraste/datos.ts'
import { contrastarReglas, medirCobertura, serieCaso } from './medir.ts'

const pieza: Pieza = { articulo: 'PERFIL-SINTETICO', funcion: 'MV', acabado: 'L', cantidad: 2,
  largo: 1000, ancho: 0, coste: 1, costeTotal: 2, precio: 5, importe: 10, metraje: 2, unidad: 'ML' }
const caso = (id = 'caso'): Caso => ({ id, tipo: 'ESTRUCTURA', modelo: 'MODELO-SINTETICO',
  serie: 'SERIE-SINTETICA', fecha: '2026-01-01', tarifa: 1, padre: {}, configuracion: null,
  opciones: [], piezas: [pieza], dimensiones: { ancho: 1000, alto: 1200 }, cantidad: 1,
  vidrio: null, familias: [], esperado: 10, totalEsperado: 10, exclusiones: [] })
const medicion = (c: Caso): Medicion => ({ id: c.id, tipo: c.tipo, modelo: c.modelo, fecha: c.fecha,
  estado: 'igual', esperado: c.esperado!, obtenido: 10, diferencia: 0, causas: [], avisos: [],
  piezas: c.piezas.map(p => ({ ...p })), tarifaPosterior: false })

test('un precio igual puede esconder corte distinto; no se convierte en coincidencia física', () => {
  const c = caso(), m = medicion(c); m.piezas[0]!.largo = 1100
  const r = medirCobertura([c], [m])
  assert.equal(r.total.precioIgual, 1)
  assert.equal(r.total.fisicoIgual, 0)
  assert.equal(r.total.reglas.cortes.difiere, 1)
})
test('conserva duplicados, función y unidad como controles independientes', () => {
  const c = caso(); c.piezas = [pieza, pieza]
  const m = medicion(c); m.piezas.pop()
  assert.equal(contrastarReglas(c, m).piezas, 'difiere')
  assert.equal(contrastarReglas(c, m).cortes, 'sin contraste')
  const c2 = caso(), m2 = medicion(c2); m2.piezas[0]!.funcion = 'HH'
  assert.equal(contrastarReglas(c2, m2).piezas, 'coincide')
  assert.equal(contrastarReglas(c2, m2).funciones, 'difiere')
  m2.piezas[0]!.funcion = 'MV'; m2.piezas[0]!.unidad = 'M2'
  assert.equal(contrastarReglas(c2, m2).unidades, 'difiere')
  assert.equal(contrastarReglas(c2, m2).cortes, 'sin contraste')
})
test('incompletos, errores, vacío y nulos no producen igualdad aunque precio/causas parezcan buenos', () => {
  const c = caso(), m = medicion(c)
  for (const estado of ['sin valorar', 'error'] as const) {
    m.estado = estado
    assert.ok(Object.values(contrastarReglas(c, m)).every(x => x === 'sin contraste'))
  }
  m.estado = 'igual'; m.piezas = []
  assert.ok(Object.values(contrastarReglas(c, m)).every(x => x === 'sin contraste'))
  m.piezas = [{ ...pieza, coste: null, metraje: null, unidad: '' }]
  assert.equal(contrastarReglas(c, m).costes, 'sin contraste')
  assert.equal(contrastarReglas(c, m).metraje, 'sin contraste')
  assert.equal(contrastarReglas(c, m).unidades, 'sin contraste')
  m.piezas = [{ ...pieza, acabado: '' }]
  assert.equal(contrastarReglas(c, m).acabados, 'sin contraste')
})
test('avisos y cero explícito no crean material; función MO se normaliza sin eliminar accesorios', () => {
  const c = caso(); c.piezas.push({ ...pieza, articulo: '133' }, { ...pieza, articulo: '0' }, { ...pieza, cantidad: 0 })
  const m = medicion(c); m.piezas = [{ ...pieza }]
  assert.equal(contrastarReglas(c, m).piezas, 'coincide')
  c.piezas = [{ ...pieza, funcion: '' }]; m.piezas = [{ ...pieza, funcion: 'JUNQ' }]
  assert.equal(contrastarReglas(c, m).piezas, 'coincide')
  assert.equal(contrastarReglas(c, m).funciones, 'sin contraste')
  c.piezas = [{ ...pieza, articulo: 'MOCOL', funcion: '' }]
  m.piezas = [{ ...c.piezas[0]!, funcion: 'MO' }]
  assert.equal(contrastarReglas(c, m).piezas, 'coincide')
})
test('GRUPO mixto cuenta una sola línea; elementos solo informan variantes', () => {
  const c = caso(); c.tipo = 'GRUPO'; c.modelo = 'GRUPO'; c.serie = null
  c.elementos = [caso('elemento1'), { ...caso('elemento2'), serie: 'OTRA-SERIE' }]
  assert.equal(serieCaso(c), 'GRUPO: OTRA-SERIE + SERIE-SINTETICA')
  const r = medirCobertura([c], [medicion(c)])
  assert.equal(r.total.elegibles, 1); assert.equal(r.pares.length, 1)
  assert.equal(r.total.precioYFisicoIgual, 1)
})
test('rechaza desalineación de entradas, duplicados, huérfanos y cambios de elegibilidad', () => {
  const c = caso(), m = medicion(c)
  assert.throws(() => medirCobertura([c], []), /reconciliadas/)
  assert.throws(() => medirCobertura([c], [m, m]), /duplicada/)
  assert.throws(() => medirCobertura([c, c], [m]), /duplicado/)
  assert.throws(() => medirCobertura([c], [m, { ...m, id: 'ajena' }]), /huérfanas/)
  assert.throws(() => medirCobertura([c], [{ ...m, esperado: 11 }]), /otra entrada/)
  assert.throws(() => medirCobertura([c], [{ ...m, obtenido: null }]), /incoherente/)
  c.exclusiones = ['precio-manual']
  assert.throws(() => medirCobertura([c], [m]), /reconciliadas/)
  const r = medirCobertura([c], [])
  assert.equal(r.total.excluidas, 1); assert.equal(r.total.elegibles, 0)
})
