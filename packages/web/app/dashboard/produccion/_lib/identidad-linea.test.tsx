import { expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { fixtureProduccion } from './produccion.fixture'
import { prepararProduccion } from './preparar-produccion'
import { parametrosProduccion } from './parametros'
import { HojaCorteVista } from '../_components/hoja-corte'
import { HojaProduccionVista } from '../_components/hoja-produccion'

function dosLineas() {
  const datos = fixtureProduccion()
  const primera = datos.lineas[0]
  primera.orden = 7; primera.referencia = 'SALÓN'
  const segunda = structuredClone(primera)
  segunda.id = '00000000-0000-4000-8000-000000000007'; segunda.orden = 12
  segunda.piezas = segunda.piezas.map(p => ({ ...p, lineaId: segunda.id }))
  datos.lineas = [segunda, primera]
  return datos
}
it('órdenes comerciales no contiguos distinguen cada origen en composición, material y corte visible', () => {
  const datos = dosLineas()
  const r = prepararProduccion(datos, parametrosProduccion({}))
  expect(r.estado).toBe('CON_INCIDENCIAS')
  expect(new Set(r.consumos.map(c => c.etiqueta)).size).toBe(40)
  for (const linea of datos.lineas) {
    const origen = `Línea ${linea.orden} · SALÓN · modulo m1`
    expect(r.produccion!.estructuras.some(e => e.referencia === origen)).toBe(true)
    const htmlMaterial = renderToStaticMarkup(<HojaProduccionVista resultado={r} />)
    const htmlCorte = renderToStaticMarkup(<HojaCorteVista resultado={r} />)
    expect(htmlMaterial).toContain(`${origen} · pieza 0`)
    expect(htmlCorte).toContain(`${origen} · pieza 0`)
    const consumos = r.consumos.filter(c => c.referencia.lineaId === linea.id)
    expect(consumos).toHaveLength(20)
    expect(consumos.every(c => c.etiqueta.startsWith(`Línea ${linea.orden} · SALÓN ·`))).toBe(true)
  }
})
it('incidencias de piezas imposibles o snapshot ausente conservan el orden comercial', () => {
  const datos = dosLineas()
  const imposibles = prepararProduccion(datos, parametrosProduccion({ barra: '500' }))
  for (const orden of [7, 12]) expect(imposibles.incidencias.some(i => i.referencia.startsWith(`Línea ${orden} · SALÓN ·`))).toBe(true)
  datos.lineas[0].resultado = null
  const corrupto = prepararProduccion(datos, parametrosProduccion({}))
  expect(corrupto.incidencias).toContainEqual({ referencia: 'Línea 12 · SALÓN', detalle: 'Snapshot ausente o no válido', bloqueante: true })
})
it('copia de revisión mantiene orden visible y cambia únicamente las identidades internas de destino', () => {
  const original = dosLineas()
  const copia = structuredClone(original)
  copia.id = '00000000-0000-4000-8000-000000000008'; copia.documento.revision = 2
  copia.lineas = copia.lineas.map((l, i) => {
    const id = `00000000-0000-4000-8000-00000000001${i}`
    return { ...l, id, piezas: l.piezas.map(p => ({ ...p, lineaId: id })) }
  })
  const r = prepararProduccion(copia, parametrosProduccion({}))
  expect(r.corte!.documento.revision).toBe(2)
  expect(r.consumos.map(c => c.etiqueta)).toEqual(prepararProduccion(original, parametrosProduccion({})).consumos.map(c => c.etiqueta))
  expect(r.consumos.every(c => c.etiqueta.startsWith('Línea 7 · SALÓN ·') || c.etiqueta.startsWith('Línea 12 · SALÓN ·'))).toBe(true)
  for (const ref of r.referencias.values()) {
    expect(ref.documentoId).toBe(copia.id)
    expect(original.lineas.map(l => l.id)).not.toContain(ref.lineaId)
  }
})
