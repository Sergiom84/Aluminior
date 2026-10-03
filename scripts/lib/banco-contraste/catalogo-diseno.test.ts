import { test } from 'node:test'
import assert from 'node:assert/strict'
import { crearConfiguracionCerramiento, generarPlantillaCatalogo, plantillaDiseno,
  registrarCatalogoDiseno } from '@aluminior/core/estructuras'
import { esConfiguracionCerramiento } from '@aluminior/web/banco-contraste'

test('el banco y el servicio web comparten el catálogo registrado, sin admitir códigos desconocidos', () => {
  const generada = generarPlantillaCatalogo({ codigo: 'QA-BANCO', descripcion: 'Fijo sintético',
    familiaCodigo: '001', anchoMm: 1200, altoMm: 1200, nodos: [
      { id: 0, tipo: 1, padre: -1, division: 0, posicion: 0, travesano: '', invisible: false,
        hoja: 0, numeroHoja: 0, tipoCota: 0, cota: 0, equidistantes: 0, marco: 'NOR', variantes: [] },
      { id: 1, tipo: 5, padre: 0, division: 0, posicion: 0, travesano: '', invisible: false,
        hoja: 0, numeroHoja: 0, tipoCota: 0, cota: 0, equidistantes: 0, marco: '', variantes: [] },
    ] })
  assert.equal(generada.estado, 'dibujable')
  if (generada.estado !== 'dibujable') throw new Error('Fixture no dibujable')
  const configuracion = crearConfiguracionCerramiento(generada.plantilla)
  try {
    assert.equal(esConfiguracionCerramiento(configuracion), false)
    registrarCatalogoDiseno([generada.plantilla])
    assert.ok(plantillaDiseno('QA-BANCO'))
    assert.equal(esConfiguracionCerramiento(configuracion), true)
    assert.equal(esConfiguracionCerramiento({ ...configuracion,
      modulos: [{ ...configuracion.modulos[0], estructuraCodigo: 'NO-EXISTE' }] }), false)
  } finally {
    registrarCatalogoDiseno([])
  }
  assert.equal(esConfiguracionCerramiento(configuracion), false)
})
