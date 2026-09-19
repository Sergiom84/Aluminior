import test from 'node:test'
import assert from 'node:assert/strict'
import { construirBanco, compararCaso, numeroOrigen } from './lib/banco-precios.mjs'

const candidatas = [{ codigo: 'S', familia: '005' }, { codigo: 'T', familia: '005' }]
const padre = { nDoc: 'A', nLinea: '1', EstructuraSN: 'True', Articulo: 'S',
  Ancho: '1.200', Largo: '900', Cdad: '2', ImporteTotal: '20', Descripcion: 'PERSONAL' }
const hija = { nDoc: 'A', nLinea: '2', nEstr: '1', Articulo: 'PERFIL',
  ImporteTotal: '10', Tarifa: '1' }
const config = { TipoDoc: 'VPRES', nVDoc: 'A', nVLinea: '1', Conjunto1: 'SERIE' }
const make = (lines = [padre, hija], configs = [config]) => construirBanco(candidatas, lines, configs, [])

test('decimales españoles y ausencias nunca se convierten en cero', () => {
  assert.equal(numeroOrigen('1.005,58'), 1005.58)
  assert.equal(numeroOrigen(''), null)
  assert.equal(numeroOrigen('error'), null)
})
test('aísla por documento y tipo; preserva cantidades y elimina datos libres', () => {
  const b = make([padre, hija, { ...hija, nDoc: 'OTRO', ImporteTotal: '999' }],
    [config, { ...config, TipoDoc: 'VFAC', Conjunto1: 'OTRA' }])
  assert.equal(b.casos[0].historico.componentes.length, 1)
  assert.equal(b.casos[0].historico.diferenciaPadreSumaHijas, 0)
  assert.equal(b.casos[0].entrada.series[0], 'SERIE')
  assert.equal(b.resumen.conHistorico, 1)
  assert.ok(!JSON.stringify(b).includes('PERSONAL'))
  assert.ok(!JSON.stringify(b).includes('nDoc'))
})
test('no certifica casos incompletos, negativos, específicos ni duplicados', () => {
  const b = make([{ ...padre, Largo: '-6' }], [config, { ...config, DisEspecificoSN: 'True' }])
  assert.ok(b.casos[0].motivos.includes('configuracion-ausente-o-ambigua'))
  assert.ok(b.casos[0].motivos.includes('sin-despiece'))
  assert.ok(b.casos[0].motivos.includes('medidas-o-cantidad-invalidas'))
  assert.equal(b.casos[0].estado, 'pendiente-de-reproduccion')
})
test('comparación exige entrada idéntica, valoración completa y multiplicidad de piezas', () => {
  const c = make().casos[0]
  assert.equal(compararCaso(c, { entrada: {}, estado: 'valorado' }).estado, 'entrada-distinta')
  assert.equal(compararCaso(c, { entrada: c.entrada, estado: 'incompleto' }).estado, 'no-comparable')
  assert.equal(compararCaso(c, { entrada: c.entrada, estado: 'valorado', total: 20 }).estado, 'no-comparable')
  // Sólo una fixture con contexto verificado puede entrar en comparación numérica.
  c.motivos = []
  Object.assign(c.entrada, { vidrioCodigo: 'VIDRIO', tarifaYFechaVerificadas: true, modoValoracionVerificado: 'despiece' })
  const actual = { entrada: c.entrada, estado: 'valorado', componentes: c.historico.componentes, total: 20 }
  assert.equal(compararCaso(c, actual).despieceIgual, true)
  assert.equal(compararCaso(c, { ...actual, entrada: Object.fromEntries(Object.entries(c.entrada).reverse()) }).despieceIgual, true)
  assert.equal(compararCaso(c, { ...actual, componentes: [...actual.componentes, ...actual.componentes] }).despieceIgual, false)
})
