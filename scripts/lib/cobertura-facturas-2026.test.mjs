import test from 'node:test'
import assert from 'node:assert/strict'
import { analizarCoberturaFacturas } from './cobertura-facturas-2026.mjs'

const base = () => ({
  facturas: [{ Id: 'f1' }],
  lineas: [
    { nDoc: 'f1', nLinea: '10', nEstr: '0', EstructuraSN: 'True', Articulo: 'C2',
      Acabado: 'B', nAlbaran: 'a1', nLinAlb: 'b1' },
    { nDoc: 'f1', nLinea: '11', nEstr: '10', EstructuraSN: 'False', Articulo: 'P1' },
  ],
  configuraciones: [{ nLinId: 'config1', nVDoc: 'f1', nVLinea: '10', Conjunto1: 'SERIE' }],
  detalle_diseno: [{ nVDoc: 'f1', nVLinEstr: '10', nVLinea: '11' }],
  diseno: [], cerramientos: [], uniones: [], opciones_herraje: [],
  catalogo_estructuras: [{ Codigo: 'C2' }], catalogo_series: [{ Serie: 'SERIE' }],
  asociaciones_estructura_serie: [{ Estructura: 'C2', Serie: 'SERIE' }],
  albaranes: [{ Id: 'internal-a1', Numero: 'a1', nDocOrigen: 'p1' }],
  lineas_albaran: [{ nDoc: 'internal-a1', nLinea: 'b1', nLinOrig: 'p-line', Articulo: 'C2' }],
  presupuestos: [{ Id: 'internal-p1', Numero: 'p1' }],
  lineas_presupuesto: [{ nDoc: 'internal-p1', nLinea: 'p-line', Articulo: 'C2' }],
})

test('enlaza factura y albarán por ambas claves sin convertir ausencia de dibujo en paridad', () => {
  const resultado = analizarCoberturaFacturas(base())
  assert.equal(resultado.resumen.facturas, 1)
  assert.equal(resultado.resumen.estructurasFacturadas, 1)
  assert.equal(resultado.resumen.enlacesAlbaranExactos, 1)
  assert.equal(resultado.resumen.albaranesConPresupuestoOrigen, 1)
  assert.equal(resultado.resumen.albaranesConPresupuestoVerificado, 1)
  assert.equal(resultado.resumen.enlacesPresupuestoExactos, 1)
  assert.equal(resultado.resumen.estados.catalogado, 1)
  assert.equal(resultado.resumen.calculables, 0)
  assert.equal(resultado.resumen.contrastados, 0)
  assert.ok(resultado.casos[0].motivos.includes('sin-diseno-en-factura'))
  assert.equal(resultado.casos[0].filasDetalleDiseno, 1)
})

test('rechaza identificadores de factura duplicados y líneas ajenas', () => {
  const duplicadas = base()
  duplicadas.facturas.push({ Id: 'f1' })
  assert.throws(() => analizarCoberturaFacturas(duplicadas), /duplicadas/)
  const ajena = base()
  ajena.lineas[0].nDoc = 'f2'
  assert.throws(() => analizarCoberturaFacturas(ajena), /ajena/)
})
