import { test } from 'node:test'
import assert from 'node:assert/strict'
import { opcionAcristalamientoOrigen } from './acristalamiento.ts'
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
