import { test } from 'node:test'
import assert from 'node:assert/strict'
import { contrastarDespunteGuardado } from './contrastar.ts'
import type { Fila, Tablas } from '../banco-contraste/datos.ts'

const cabecera = (v: Fila = {}) => ({ Id: 1, Despunte: '10.00', DespunteBase: '0', DespuntePorc: '0', ...v })
const perfil = (v: Fila = {}) => ({ nLinea: 1, nDoc: 1, TipoDoc: 'VPRES',
  Tipo_Perfiles_Barras: 'Perfiles', CostePerfiles: '50.00', CosteBarras: '0', ...v })
const barra = (v: Fila = {}) => ({ nLinea: 2, nDoc: 1, TipoDoc: 'VPRES',
  Tipo_Perfiles_Barras: 'Barras', CosteBarras: '60.00', CostePerfiles: '0', ...v })
const fixture = (): Tablas => ({ VPresupuestos: [cabecera()], VDespunteDetalle: [perfil(), barra()] })

test('reconcilia costes discriminados; base/porcentaje a cero no explican un cargo positivo', () => {
  const t = fixture(), antes = structuredClone(t), r = contrastarDespunteGuardado(t)
  assert.equal(r.documentos[0]!.redondeoFinal, 'coincide')
  assert.equal(r.documentos[0]!.final, '10.00')
  assert.equal(r.resumen.positivosBasePorcentajeInoperante, 1)
  assert.equal(r.documentos[0]!.basePorcentaje, 'difiere')
  assert.deepEqual(t, antes)
})
test('distingue sumar antes de redondear de redondear cada fila, sin elegir una regla por defecto', () => {
  const t = fixture(); t.VPresupuestos = [cabecera({ Despunte: '0.01' })]
  t.VDespunteDetalle = [perfil({ CostePerfiles: '0' }), barra({ CosteBarras: '0.004' }),
    barra({ nLinea: 3, CosteBarras: '0.004' })]
  const d = contrastarDespunteGuardado(t).documentos[0]!
  assert.equal(d.redondeoFinal, 'coincide'); assert.equal(d.redondeoPorFila, 'difiere')
  assert.equal(d.discriminaRedondeo, true)
})
test('la diferencia negativa se conserva como evidencia y el total cobrado se limita a cero', () => {
  const t = fixture(); t.VPresupuestos = [cabecera({ Despunte: '0' })]
  t.VDespunteDetalle = [perfil({ CostePerfiles: '70' }), barra()]
  const r = contrastarDespunteGuardado(t), d = r.documentos[0]!
  assert.equal(d.diferencia, '-10.00'); assert.equal(d.final, '0.00')
  assert.equal(d.redondeoFinal, 'coincide'); assert.equal(r.resumen.negativosAntesDelLimite, 1)
})
test('limita el total después de compensar perfiles, no cada artículo por separado', () => {
  const t = fixture(); t.VPresupuestos = [cabecera({ Despunte: '5' })]
  t.VDespunteDetalle = [perfil({ CostePerfiles: '70' }), barra(),
    perfil({ nLinea: 3, CostePerfiles: '45' }), barra({ nLinea: 4 })]
  assert.equal(contrastarDespunteGuardado(t).documentos[0]!.final, '5.00')
})
test('detalle ausente, modalidad incompleta y costes ausentes nunca prueban un cero', () => {
  for (const fs of [[], [perfil()], [barra()], [perfil({ CostePerfiles: null }), barra()],
    [perfil({ CostePerfiles: '' }), barra()], [perfil({ CostePerfiles: Number.NaN }), barra()],
    [perfil({ CostePerfiles: -1 }), barra()], [perfil(), barra({ Tipo_Perfiles_Barras: 'Otra' })]]) {
    const t = fixture(); t.VPresupuestos = [cabecera({ Despunte: '0' })]; t.VDespunteDetalle = fs
    const d = contrastarDespunteGuardado(t).documentos[0]!
    assert.equal(d.redondeoFinal, 'sin contraste'); assert.equal(d.final, null)
  }
})
test('una discrepancia y una cabecera ausente conservan estados distintos', () => {
  const t = fixture(); t.VPresupuestos = [cabecera({ Despunte: '11' })]
  assert.equal(contrastarDespunteGuardado(t).documentos[0]!.redondeoFinal, 'difiere')
  t.VPresupuestos = [cabecera({ Despunte: null })]
  assert.equal(contrastarDespunteGuardado(t).documentos[0]!.redondeoFinal, 'sin contraste')
})
test('otro TipoDoc y filas huérfanas no entran en el coste del presupuesto', () => {
  const t = fixture(); t.VDespunteDetalle!.push(barra({ nLinea: 3, TipoDoc: 'VPED' }), barra({ nLinea: 4, nDoc: 2 }))
  const r = contrastarDespunteGuardado(t)
  assert.equal(r.documentos[0]!.final, '10.00')
  assert.equal(r.resumen.filasOtrosDocumentos, 1); assert.equal(r.resumen.filasHuerfanas, 1)
})
test('identidades duplicadas y tablas ausentes abortan en vez de sumar dos veces', () => {
  assert.throws(() => contrastarDespunteGuardado({}), /Faltan tablas/)
  const t = fixture(); t.VPresupuestos!.push(cabecera())
  assert.throws(() => contrastarDespunteGuardado(t), /Id ausente o duplicada/)
  const u = fixture(); u.VDespunteDetalle!.push(perfil())
  assert.throws(() => contrastarDespunteGuardado(u), /nLinea ausente o duplicada/)
})
