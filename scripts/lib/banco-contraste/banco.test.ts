import { test } from 'node:test'
import assert from 'node:assert/strict'
import { construirContraste } from './extraer.ts'
import { clasificar, diagnosticar, precioComparable } from './comparar.ts'
import { configuracionGrupo } from './geometria.ts'
import { resumir } from './resumen.ts'
import { validarLocal } from './local.ts'
import type { Tablas, Pieza, Medicion } from './datos.ts'

function fixture(): Tablas {
  return { VPresupuestos: [{ Id: 1, Fecha: '2026-02-01T00:00:00.000Z', Tarifa: 2 }],
    VPresupuestosLin: [
      { nDoc: 1, nLinea: 10, EstructuraSN: true, Articulo: 'FICT', Cdad: 2, Ancho: 1000, Largo: 1200, Precio: 25, ImporteTotal: 50 },
      { nDoc: 1, nLinea: 11, nEstr: 10, Articulo: 'PERFIL', Cdad: 2, LargoCorte: 1000, ImporteTotal: 25, Coste: 4 },
      { nDoc: 2, nLinea: 12, nEstr: 10, Articulo: 'AJENO', Cdad: 1, ImporteTotal: 999 },
    ], VDatosLinEstr: [
      { TipoDoc: 'VPRES', nVDoc: 1, nVLinea: 10, Familia1: '050', Conjunto1: 'VID', Familia3: '001', Conjunto3: 'SER', DisEspecificoSN: false, nTAcris: 0, HorasAdFabr: 0, HorasColoc: 0 },
      { TipoDoc: 'VFAC', nVDoc: 1, nVLinea: 10, Familia1: '001', Conjunto1: 'AJENA' },
    ], VOpcionesHerraje: [
      { TipoDoc: 'VPRES', nDoc: 1, nLinEstr: 10, Conjunto: 'H', nOpcion: 1, SelecSN: false },
      { TipoDoc: 'VFAC', nDoc: 1, nLinEstr: 10, Conjunto: 'H', nOpcion: 1, SelecSN: true },
    ], VDatosLinDetDis: [], VCerramientos: [], VCerramientosLin: [] }
}
const p: Pieza = { articulo: 'P', funcion: 'HV', acabado: 'L', cantidad: 2, largo: 1000,
  ancho: 0, coste: 4, costeTotal: 8, precio: 5, importe: 10, metraje: 2, unidad: 'ML' }

test('enlaza por documento y línea; familia determina serie, no posición; no usa facturas', () => {
  const b = construirContraste(fixture()), c = b.casos[0]!
  assert.equal(c.serie, 'SER'); assert.equal(c.vidrio, 'VID'); assert.equal(c.tarifa, 2)
  assert.equal(c.piezas.length, 1); assert.equal(c.piezas[0]!.articulo, 'PERFIL')
  assert.equal(c.opciones.length, 1); assert.equal(c.opciones[0]!.SelecSN, false)
  assert.equal(b.evidencia.huerfanasEstr, 1); assert.equal(b.evidencia.hijasPrecioReconciliado, 1)
  assert.equal(c.cantidad, 2); assert.equal(c.esperado, 25); assert.equal(c.totalEsperado, 50)
})
test('la comisión de cabecera solo cuenta con Sumar Comisión; el despunte se conserva', () => {
  const t = fixture(); Object.assign(t.VPresupuestos![0]!, { ComisionPorc: -10, SumarComisionSN: true, Despunte: 0 })
  assert.equal(construirContraste(t).casos[0]!.comision, '-10')
  Object.assign(t.VPresupuestos![0]!, { SumarComisionSN: false, Despunte: 12.5 })
  const c = construirContraste(t).casos[0]!
  assert.equal(c.comision, null); assert.equal(c.despunte, 12.5)
})
test('cuenta exclusiones solapadas sin doble contar y no convierte precio ausente en cero', () => {
  const t = fixture(); t.VPresupuestosLin![0]!.Precio = null
  t.VPresupuestosLin![0]!.RespetarPrecioSN = true; t.VPresupuestosLin![0]!.Ancho = -1
  t.VDatosLinEstr![0]!.DisEspecificoSN = true
  const b = construirContraste(t), c = b.casos[0]!
  assert.equal(c.esperado, null)
  assert.deepEqual(c.exclusiones, ['precio-manual', 'medidas-o-cantidad-no-positivas', 'diseno-especifico-no-reproducible', 'entradas-incompletas'])
  const r = resumir(b.casos, []); assert.equal(r.excluidas, 1); assert.equal(r.universo, 1)
})
test('claves duplicadas bloquean y configuración ambigua excluye', () => {
  const t = fixture(); t.VPresupuestosLin!.push({ ...t.VPresupuestosLin![0]! })
  assert.throws(() => construirContraste(t), /duplicada/)
  const t2 = fixture(); t2.VDatosLinEstr!.push({ ...t2.VDatosLinEstr![0]! })
  assert.ok(construirContraste(t2).casos[0]!.exclusiones.includes('entradas-incompletas'))
})
test('umbral ±céntimo precede a ±1%; ausencia y cero se mantienen distintos', () => {
  assert.equal(clasificar(100, 100.01), 'igual'); assert.equal(clasificar(100, 101), 'cercano')
  assert.equal(clasificar(100, 101.02), 'distinto'); assert.equal(clasificar(0, 0), 'igual')
  assert.equal(clasificar(0, null), 'sin valorar'); assert.equal(clasificar(0, NaN), 'sin valorar')
  assert.equal(clasificar(100.009998, 100.02), 'igual')
})
test('multiconjunto conserva duplicados y detecta coste, tarifa, corte y cantidad', () => {
  assert.deepEqual(diagnosticar([p, p], [p, p]).causas, [])
  assert.ok(diagnosticar([p, p], [p]).causas.includes('pieza-ausente'))
  assert.ok(diagnosticar([p], [p, p]).causas.includes('pieza-de-mas'))
  const d = diagnosticar([p], [{ ...p, largo: 1010, precio: 8, coste: null, cantidad: 3 }])
  for (const causa of ['longitud-de-corte', 'pvp-o-tarifa', 'coste-de-articulo', 'cantidad-de-piezas']) assert.ok(d.causas.includes(causa))
})
test('una coincidencia calculada con una entrada sin mapeo no puede ser un acierto', () => {
  assert.equal(clasificar(25, precioComparable(25, ['segundo-acabado-sin-mapeo'])), 'sin valorar')
  assert.equal(clasificar(25, precioComparable(25, [])), 'igual')
})
test('no confunde ausencia de corte UD con cero de la exportación', () => {
  assert.deepEqual(diagnosticar([{ ...p, unidad: 'UD', largo: 0 }], [{ ...p, unidad: 'UD', largo: null }]).causas, [])
})
test('no inventa ausencias por MO sin función ni por filas informativas; acabado es una discrepancia propia', () => {
  const mo = { ...p, articulo: 'MO', funcion: '', acabado: 'UNI', largo: 0, ancho: 0 }
  assert.deepEqual(diagnosticar([mo, { ...p, articulo: '0' }], [{ ...mo, funcion: 'MO', largo: null }]).causas, [])
  const d = diagnosticar([p], [{ ...p, acabado: 'UNI' }])
  assert.deepEqual(d.causas, ['acabado-de-articulo'])
})
test('grupo usa Orden, UGrosor físico y longitud coincidente, aunque Ancho de accesorio sea 0', () => {
  const b = construirContraste(fixture()), e = b.casos[0]!
  const grupo = { ...e, tipo: 'GRUPO' as const, padre: { nDoc: 1, nLinea: 99 }, elementos: [
    { ...e, padre: { nDoc: 1, nLinea: 10, nGrupo: 99 } },
    { ...e, padre: { nDoc: 1, nLinea: 20, nGrupo: 99 } },
    { ...e, modelo: 'U', dimensiones: { ancho: 0, alto: 1200 }, padre: { nDoc: 1, nLinea: 30, nGrupo: 99 } },
  ], geometria: [
    { Orden: 1, nLinEstr: 10, Ancho: 1000, Alto: 1200 }, { Orden: 7, nLinEstr: 20, Ancho: 1000, Alto: 1200 },
    { Orden: 5, nLinEstr: 30, EsUnionSN: true, CodEstr: 'U', UOrdenElem1: 1, UOrdenElem2: 7, UnionVH: 'V', UGrosor: 20, ULongitud: 1200 },
  ] }
  const r = configuracionGrupo(grupo)
  assert.equal(r.configuracion?.modulos[1]!.anclaje?.unionId, 'union-5')
  assert.equal(r.configuracion?.uniones[0]!.grosorMm, 20)
  grupo.geometria[2]!.UOrdenElem1 = 99
  assert.equal(configuracionGrupo(grupo).configuracion, null)
})
test('GRUPO conserva también estructuras accesorias que no figuran en el dibujo', () => {
  const t = fixture()
  t.VPresupuestosLin!.push({ nDoc: 1, nLinea: 99, GrupoSN: true, Articulo: 'GRUPO', Cdad: 1, Ancho: 1000, Largo: 1200, Precio: 25 })
  t.VPresupuestosLin![0]!.nGrupo = 99
  t.VPresupuestosLin!.push({ ...t.VPresupuestosLin![0]!, nLinea: 20, Articulo: 'COM-FICT' })
  t.VDatosLinEstr!.push({ ...t.VDatosLinEstr![0]!, nVLinea: 99 }, { ...t.VDatosLinEstr![0]!, nVLinea: 20 })
  t.VCerramientos!.push({ TipoDoc: 'VPRES', nDoc: 1, nLinGrupo: 99, id: 7 })
  t.VCerramientosLin!.push({ nCerr: 7, nLinEstr: 10, CodEstr: 'FICT', Orden: 1 })
  const b = construirContraste(t), g = b.casos.find(c => c.tipo === 'GRUPO')!
  assert.equal(g.elementos!.length, 2); assert.equal(b.evidencia.elementosSinGeometria, 1)
  assert.equal(b.evidencia.gruposConElementosAdicionales, 1)
})
test('denominador incluye error/sin valorar, separa años y fechas, deduplica causas', () => {
  const c = construirContraste(fixture()).casos[0]!
  const m: Medicion = { id: c.id, tipo: c.tipo, modelo: c.modelo, fecha: c.fecha, estado: 'distinto',
    esperado: 25, obtenido: 30, diferencia: 5, causas: ['pvp', 'pvp'], avisos: [], piezas: [], tarifaPosterior: true }
  const r = resumir([c], [m]); assert.equal(r.total.lineas, 1); assert.equal(r.total.porcentajeIgual, 0)
  assert.equal(r.causas[0]!.lineas, 1); assert.equal(r.porAno[0]!.lineas, 1)
})
test('rechaza destinos remotos, otras bases, puertos y parámetros', () => {
  assert.equal(validarLocal('postgres://x:y@localhost:55433/aluminior_real_test').length > 0, true)
  for (const u of ['postgres://x:y@remote:55433/aluminior_real_test', 'postgres://x:y@localhost:5432/aluminior_real_test',
    'postgres://x:y@localhost:55433/produccion', 'postgres://x:y@localhost:55433/aluminior_real_test?host=remote']) assert.throws(() => validarLocal(u))
})
