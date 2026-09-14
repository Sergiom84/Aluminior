import { expect, it } from 'vitest'
import { prepararProduccion } from './preparar-produccion.ts'
import { fixtureProduccion } from './produccion.fixture.ts'
import { parametrosProduccion } from './parametros.ts'
import type { ResultadoCerramientoV1 } from '@aluminior/core/estructuras'

const parametros = parametrosProduccion({ barra: '6000', kerf: '0', inicial: '0', final: '0' })
it('oráculo J04 cantidad2: 7 barras, 29,28m útiles y superficie/accesorios/ML íntegros', () => {
  const r = prepararProduccion(fixtureProduccion(), parametros)
  expect(r.estado).toBe('CON_INCIDENCIAS')
  expect(r.corte?.referencia).toBe('260005-1')
  expect(r.corte?.resumen.map(g => g.nBarras)).toEqual([3, 3, 1])
  expect(r.corte?.resumen.reduce((s, g) => s + g.metros, 0)).toBe(42)
  const largos = r.corte!.desglose.flatMap(g => g.barras.flatMap(b => b.palos.map(p => p.longitudMm)))
  expect(largos.reduce((s, n) => s + n, 0)).toBe(29280)
  expect(r.despunte).toMatchObject({ costePerfilesYCortes: '74.94', costeBarras: '116.40', importeDespunte: '41.46' })
  const total = (s: string) => r.consumos.filter(c => c.articuloCodigo === `QA-J04-${s}`).reduce((n, c) => n + Number(c.cantidad), 0)
  expect(total('E')).toBe(14); expect(total('I')).toBe(14); expect(total('T')).toBe(8)
  expect(r.consumos.filter(c => c.unidad === 'M2').reduce((n, c) => n + c.cantidadFisica, 0)).toBe(4)
  expect(r.consumos.filter(c => c.unidad === 'M2').map(c => [c.largoMm, c.anchoMm])).toEqual([['780', '1180'], ['780', '680']])
  expect(r.incidencias.some(i => i.detalle.includes('Ángulos'))).toBe(true)
  expect(r.produccion?.estructuras[2].palos[0].extremos.izquierdo.tipo).toBe('desconocido')
})
it('cada corte conserva documento, línea, origen y ordinal, incluso repetido', () => {
  const datos = fixtureProduccion(); const r = prepararProduccion(datos, parametros)
  expect(r.referencias.size).toBe(20)
  for (const grupo of r.planes) for (const barra of grupo.plan.barras) for (const corte of barra.cortes) {
    expect(corte.ref).toBeTruthy()
    expect(r.referencias.get(corte.ref!)).toMatchObject({ documentoId: datos.id, lineaId: datos.lineas[0].id })
  }
  for (const ref of r.referencias.values()) {
    expect(ref.documentoId).toBe(datos.id); expect(ref.lineaId).toBe(datos.lineas[0].id)
    expect(['m1', 'm2', 'u1']).toContain(ref.origenId); expect(Number.isInteger(ref.ordinal)).toBe(true)
  }
  for (const grupo of r.corte!.desglose) for (const barra of grupo.barras) for (const palo of barra.palos)
    expect(palo.procedencia?.referencia).toMatch(/pieza \d+/)
})
it('mismo artículo en dos acabados nunca comparte barras', () => {
  const datos = fixtureProduccion(); const segunda = structuredClone(datos.lineas[0])
  segunda.id = '00000000-0000-4000-8000-000000000003'
  const snapshot = segunda.resultado as ResultadoCerramientoV1
  for (const o of snapshot.origenes) for (const p of o.piezas) p.acabadoCodigo = 'OTRO'
  segunda.piezas = segunda.piezas.map(p => ({ ...p, lineaId: segunda.id, acabadoCodigo: 'OTRO' }))
  datos.lineas = [...datos.lineas, segunda]
  const r = prepararProduccion(datos, parametros)
  expect(r.corte?.resumen).toHaveLength(6)
  expect(r.corte?.resumen.reduce((s, g) => s + g.nBarras, 0)).toBe(14)
})
it.each(['falta', 'residuo', 'medida', 'origen', 'configuracion', 'versionConfiguracion', 'snapshot', 'cantidad'])('corrupción o ausencia %s no presenta hoja lista', caso => {
  const datos = fixtureProduccion(); const l = datos.lineas[0]
  if (caso === 'falta') l.piezas = l.piezas.slice(1)
  if (caso === 'residuo') l.piezas = [...l.piezas, { ...l.piezas[0], id: 'residuo' }]
  if (caso === 'medida') l.piezas = l.piezas.map((p, i) => i === 0 ? { ...p, largoCorteMm: '801' } : p)
  if (caso === 'origen') l.piezas = l.piezas.map((p, i) => i === 0 ? { ...p, origenId: 'ajeno' } : p)
  if (caso === 'configuracion') l.configuracion = { version: 1 }
  if (caso === 'versionConfiguracion') l.versionConfiguracion = 2
  if (caso === 'snapshot') l.resultado = null
  if (caso === 'cantidad') l.cantidad = '1.5'
  const r = prepararProduccion(datos, parametros)
  expect(r.estado).toBe('NO_DISPONIBLE'); expect(r.corte).toBeNull()
  expect(r.incidencias.some(i => i.bloqueante)).toBe(true)
})
it('corte imposible conserva motivo y cantidad sin cortar', () => {
  const datos = fixtureProduccion()
  const r = prepararProduccion(datos, { ...parametros, longitudBarraMm: 500 })
  expect(r.estado).toBe('NO_DISPONIBLE')
  expect(r.incidencias.some(i => i.detalle.includes('1200'))).toBe(true)
  expect(r.incidencias.some(i => i.referencia.includes('módulo') || i.referencia.includes('modulo'))).toBe(true)
  expect(JSON.stringify(r.incidencias)).not.toContain(datos.id)
  expect(JSON.stringify(r.incidencias)).not.toContain('documentoId')
  expect(r.referencias.values().next().value?.documentoId).toBe(datos.id)
})
it('saneamiento no reduce metros de barra comprada', () => {
  const r = prepararProduccion(fixtureProduccion(), { ...parametros, saneamientoInicialMm: 30, saneamientoFinalMm: 30 })
  expect(r.corte?.resumen.reduce((s, g) => s + g.metros, 0)).toBe(42)
  expect(r.despunte?.costeBarras).toBe('116.40')
})
it.each([{ barra: 'NaN' }, { kerf: '-1' }, { barra: '' }, { inicial: '6000' }, { final: 'Infinity' }])('parámetros inválidos no se normalizan silenciosamente %j', p => {
  expect(() => parametrosProduccion(p)).toThrow()
})
it('costes ausentes no producen despunte valorado en cero', () => {
  const datos = fixtureProduccion(); const snapshot = datos.lineas[0].resultado as ResultadoCerramientoV1
  for (const o of snapshot.origenes) {
    o.coste = { completo: false, importe: null }
    o.diagnosticos = [...o.diagnosticos, { codigo: 'SIN_COSTE', ambito: 'COSTE', bloqueante: true, detalle: 'Coste sintético ausente' }]
    for (const p of o.piezas) { p.costeUnitario = null; p.costeTotal = null }
  }
  snapshot.costeMateriales = { completo: false, importe: null }
  datos.lineas[0].piezas = datos.lineas[0].piezas.map(p => ({ ...p, costeUnitario: null, costeTotal: null }))
  const r = prepararProduccion(datos, parametros)
  expect(r.despunte?.noValorables).toHaveLength(3)
  expect(r.despunte?.perfiles).toHaveLength(0)
})
