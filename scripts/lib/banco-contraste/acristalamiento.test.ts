import { test } from 'node:test'
import assert from 'node:assert/strict'
import { opcionAcristalamientoOrigen, variantesPorElemento } from './acristalamiento.ts'
import { precioComparable } from './comparar.ts'

test('la primera opción explícita y la base implícita representan la misma selección', () => {
  const sinteticos = [{ nTAcris: 0, tablaHojas: 'QA-BASE' }, { nTAcris: 1, tablaHojas: 'QA-BASE' }]
  const tablas = ['QA-BASE', 'QA-ALTERNATIVA']
  for (const caso of sinteticos) assert.equal(tablas[opcionAcristalamientoOrigen(caso.nTAcris)! - 1], caso.tablaHojas)
})
test('no infiere otras opciones ni convierte una selección desconocida en acierto', () => {
  for (const valor of [null, undefined, '', 'ilegible', -1, .5, 2, 3, 4, 5]) {
    const opcion = opcionAcristalamientoOrigen(valor)
    assert.equal(opcion, null)
    assert.equal(precioComparable(100, opcion === null ? ['acristalamiento-alternativo-sin-mapeo'] : []), null)
  }
})

// Catálogo sintético con las medidas observadas en EMP0016: ELEGANTPVC declara
// rango simple 9 mm, PAN16 mide 16 mm sin marca de doble acristalamiento y
// V420AGS4 mide 28 mm con la marca puesta.
const vidrios: Record<string, { grosorAcristalar: number; dobleAcristalamiento: boolean }> = {
  PAN16: { grosorAcristalar: 16, dobleAcristalamiento: false },
  V420AGS4: { grosorAcristalar: 28, dobleAcristalamiento: true },
  CHA2X11C: { grosorAcristalar: 1, dobleAcristalamiento: false },
}
const rangos: Record<string, number> = { ELEGANTPVC: 9, GMA350: 9, SINRANGO: 0 }
const variantes = (elementos: { serie: string | null; vidrio: string | null }[]) =>
  variantesPorElemento(elementos, c => vidrios[c] ?? null, s => rangos[s ?? ''] ?? 0)

test('panel y vidrio doble comparten variante cuando el rango de la serie los agrupa', () => {
  const v = variantes([{ serie: 'ELEGANTPVC', vidrio: 'V420AGS4' }, { serie: 'ELEGANTPVC', vidrio: 'PAN16' }])
  assert.deepEqual([...new Set(v.values())], ['2'])
})
test('separa variantes solo cuando el grosor cae a distinto lado del rango', () => {
  const v = variantes([{ serie: 'ELEGANTPVC', vidrio: 'PAN16' }, { serie: 'GMA350', vidrio: 'CHA2X11C' }])
  assert.deepEqual([...v.values()].sort(), ['1', '2'])
})
test('sin rango declarado manda la marca de doble acristalamiento', () => {
  const v = variantes([{ serie: 'SINRANGO', vidrio: 'PAN16' }, { serie: 'SINRANGO', vidrio: 'V420AGS4' }])
  assert.deepEqual([...v.values()].sort(), ['1', '2'])
})
test('un elemento sin vidrio no entra y un vidrio ausente del catálogo queda en doble', () => {
  assert.equal(variantes([{ serie: 'ELEGANTPVC', vidrio: null }]).size, 0)
  assert.deepEqual([...variantes([{ serie: 'ELEGANTPVC', vidrio: 'NOEXISTE' }]).values()], ['2'])
})
