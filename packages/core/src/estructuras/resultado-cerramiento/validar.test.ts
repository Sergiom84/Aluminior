import { describe, expect, it } from 'vitest'
import { snapshotSintetico } from './snapshot.fixture.ts'
import { esResultadoCerramiento } from './validar.ts'

describe('snapshot de materiales por origen, versión 1', () => {
  it('conserva dos módulos con artículo/slot/opción repetidos y unión propia', () => {
    const s = snapshotSintetico()
    expect(s.origenes).toHaveLength(3)
    expect(s.origenes.map(o => o.acristalamiento[0].slot)).toEqual([1, 1, 1])
    expect(esResultadoCerramiento(JSON.parse(JSON.stringify(s)))).toBe(true)
  })
  it('acepta precio genérico UNI aunque se solicita acabado L', () => {
    const s = snapshotSintetico()
    Object.assign(s.origenes[0].partidasValoracion[0], { criterioPrecio: 'GENERICO', acabadoCodigo: 'UNI' })
    expect(esResultadoCerramiento(s)).toBe(true)
  })
  it.each([0, 2147483647])('admite ordinal de pieza PostgreSQL en el borde %s', ordinal => {
    const s = snapshotSintetico()
    s.origenes[0].piezas[0].ordinal = ordinal
    expect(esResultadoCerramiento(s)).toBe(true)
  })
  it.each([2147483648, -1, 0.5])('rechaza ordinal de pieza fuera de integer: %s', ordinal => {
    const s = snapshotSintetico()
    s.origenes[0].piezas[0].ordinal = ordinal
    expect(esResultadoCerramiento(s)).toBe(false)
  })
  it('rechaza precio EXACTO sin acabado y acepta procedencia explícita', () => {
    const s = snapshotSintetico()
    expect(s.origenes[0].partidasValoracion[0].criterioPrecio).toBe('EXACTO')
    expect(esResultadoCerramiento(s)).toBe(true)
    s.origenes[0].partidasValoracion[0].acabadoCodigo = null
    expect(esResultadoCerramiento(s)).toBe(false)
  })
  it('suma partidas exactas antes de redondear la venta del origen a céntimos', () => {
    const s = snapshotSintetico()
    const partida = s.origenes[0].partidasValoracion[0]
    Object.assign(s.origenes[0], { partidasValoracion: [
      { ...partida, ordinal: 0, cantidadFacturable: '1', precioUnitario: '0.005', importeExacto: '0.005' },
      { ...partida, ordinal: 1, cantidadFacturable: '1', precioUnitario: '0.005', importeExacto: '0.005' },
    ], venta: { completo: true, importe: '0.01' } })
    s.ventaMateriales.importe = '40.01'
    expect(esResultadoCerramiento(s)).toBe(true)
    s.origenes[0].venta.importe = '0.02'
    s.ventaMateriales.importe = '40.02'
    expect(esResultadoCerramiento(s)).toBe(false)
  })
  it('conserva las tres etapas heredadas: 1.004 por etapa produce 3.00, no 3.01', () => {
    const s = snapshotSintetico()
    const partida = s.origenes[0].partidasValoracion[0]
    Object.assign(s.origenes[0], { partidasValoracion:
      ['MATERIALES', 'VIDRIO', 'ACRISTALAMIENTO'].map((grupoValoracion, ordinal) => ({
        ...partida, ordinal, grupoValoracion, cantidadFacturable: '1',
        precioUnitario: '1.004', importeExacto: '1.004',
      })), venta: { completo: true, importe: '3.00' } })
    s.ventaMateriales.importe = '43.00'
    expect(esResultadoCerramiento(s)).toBe(true)
    s.origenes[0].venta.importe = '3.01'
    s.ventaMateriales.importe = '43.01'
    expect(esResultadoCerramiento(s)).toBe(false)
  })
  it('preserva el borde Number de 1.005: venta1.00 y evidencia exacta1.005', () => {
    const s = snapshotSintetico()
    Object.assign(s.origenes[0].partidasValoracion[0], { cantidadFacturable: '1',
      precioUnitario: '1.005', importeExacto: '1.005' })
    s.origenes[0].venta.importe = '1.00'
    s.ventaMateriales.importe = '41.00'
    expect(esResultadoCerramiento(s)).toBe(true)
    s.origenes[0].venta.importe = '1.01'
    s.ventaMateriales.importe = '41.01'
    expect(esResultadoCerramiento(s)).toBe(false)
  })
  const corrupciones: [string, (s: ReturnType<typeof snapshotSintetico>) => void][] = [
    ['versión', s => Object.assign(s, { version: 2 })],
    ['origen duplicado', s => Object.assign(s.origenes[1], s.origenes[0])],
    ['origen ajeno', s => { s.origenes[0].origen.id = 'ajeno' }],
    ['código ajeno', s => { s.origenes[0].codigo = '02H' }],
    ['ID vacío', s => { s.origenes[0].origen.id = '' }],
    ['pieza duplicada', s => Object.assign(s.origenes[0], { piezas: [s.origenes[0].piezas[0], s.origenes[0].piezas[0]] })],
    ['slot duplicado', s => Object.assign(s.origenes[0], { acristalamiento: [s.origenes[0].acristalamiento[0], s.origenes[0].acristalamiento[0]] })],
    ['opción duplicada', s => Object.assign(s.origenes[0], { opcionesHerraje: [s.origenes[0].opcionesHerraje[0], s.origenes[0].opcionesHerraje[0]] })],
    ['importe ausente completo', s => { s.ventaMateriales.importe = null }],
    ['suma falsa', s => { s.ventaMateriales.importe = '61' }],
    ['coste falso', s => { s.costeMateriales.importe = '25' }],
    ['partida falsa', s => { s.origenes[0].partidasValoracion[0].importeExacto = '21' }],
    ['factor PVP falso con sumas coherentes', s => { s.origenes[0].partidasValoracion[0].precioUnitario = '11' }],
    ['importe infinito', s => { s.origenes[0].partidasValoracion[0].importeExacto = 'Infinity' }],
    ['decimal con espacios', s => { s.origenes[0].piezas[0].cantidad = ' 2' }],
    ['escala que SQL perdería', s => { s.origenes[0].piezas[0].largoCorteMm = '1.001' }],
    ['rango que SQL perdería', s => { s.origenes[0].piezas[0].cantidad = '10000000' }],
    ['receta ausente', s => { s.origenes[0].reglaMaterial = null }],
    ['tipo array JSON', s => Object.assign(s.origenes[0].origen, { tipo: ['MODULO'] })],
    ['ámbito array JSON', s => Object.assign(s.origenes[0], { diagnosticos: [{ codigo: 'Q', detalle: 'Q', ambito: ['VENTA'], bloqueante: false }] })],
    ['módulo null', s => Object.assign(s.configuracion, { modulos: [null] })],
    ['unión null', s => Object.assign(s.configuracion, { uniones: [null] })],
    ['tarifa ajena', s => { s.origenes[0].partidasValoracion[0].tarifa = 2 }],
    ['genérico falso', s => { s.origenes[0].partidasValoracion[0].criterioPrecio = 'GENERICO' }],
    ['sin precio con importe', s => { s.origenes[0].partidasValoracion[0].criterioPrecio = 'SIN_PRECIO' }],
  ]
  it.each(corrupciones)('rechaza %s sin lanzar', (_nombre, corromper) => {
    const s = snapshotSintetico()
    corromper(s)
    expect(esResultadoCerramiento(s)).toBe(false)
  })
  it('venta completa y coste desconocido son estados independientes', () => {
    const s = snapshotSintetico()
    Object.assign(s.origenes[0], { coste: { completo: false, importe: null },
      diagnosticos: [{ codigo: 'SIN_COSTE', ambito: 'COSTE', bloqueante: true, detalle: 'Catálogo sin coste' }] })
    s.origenes[0].piezas[0].costeTotal = null
    s.costeMateriales = { completo: false, importe: null }
    expect(esResultadoCerramiento(s)).toBe(true)
  })
  it('ausencia de un PVP conserva diagnóstico y anula el total de venta', () => {
    const s = snapshotSintetico()
    Object.assign(s.origenes[0].partidasValoracion[0], { precioUnitario: null, importeExacto: null,
      criterioPrecio: 'SIN_PRECIO', incidencia: 'SIN_PVP' })
    Object.assign(s.origenes[0], { venta: { completo: false, importe: null },
      diagnosticos: [{ codigo: 'SIN_PVP', ambito: 'VENTA', bloqueante: true, detalle: 'Catálogo sin PVP' }] })
    s.ventaMateriales = { completo: false, importe: null }
    expect(esResultadoCerramiento(s)).toBe(true)
  })
})
