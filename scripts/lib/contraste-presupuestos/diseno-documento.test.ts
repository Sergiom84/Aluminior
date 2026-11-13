import test from 'node:test'
import assert from 'node:assert/strict'
import { generarPlantillaDisenoPropio } from '@aluminior/core/despiece'
import { nodoDisenoDeProductor } from './diseno-documento.ts'

const marco = { Id: '0', Tipo: '1', ContenidoEn: '-1', TipoMarco: 'NOR', TipoCorte1: '1', TipoCorte2: '1', TipoCorte3: '1', TipoCorte4: '1', TipoCurva: '0' }

test('un travesaño de EstructurasDiseño conserva posición, división, orden y cota con coma decimal', () => {
  const n = nodoDisenoDeProductor({ Id: '1', Tipo: '6', ContenidoEn: '0', TipoTrav: 'HB', TipoCota: '2', Cota: '300,5', nTrav: '1', idTrav: '1', posHueco: '0', travMH: 'M', TravVP: 'V' })
  assert.deepEqual({ tipo: n.tipo, posicion: n.posicion, division: n.division, orden: n.orden, tipoCota: n.tipoCota, cota: n.cota, material: n.material, clase: n.clase },
    { tipo: 6, posicion: 'HB', division: 1, orden: 1, tipoCota: 2, cota: 300.5, material: 'M', clase: 'V' })
})

test('el hueco toma su orden de posHueco y el vidrio vacío hereda el de la línea', () => {
  assert.equal(nodoDisenoDeProductor({ Id: '3', Tipo: '2', ContenidoEn: '0', idTrav: '1', nTrav: '0', posHueco: '2' }).orden, 2)
  assert.equal(nodoDisenoDeProductor({ Id: '4', Tipo: '5', ContenidoEn: '3', Vidrio: ' ' }).vidrio, null)
  assert.equal(nodoDisenoDeProductor({ Id: '4', Tipo: '5', ContenidoEn: '3', Vidrio: 'VCG6' }).vidrio, 'VCG6')
})

test('el árbol leído de Productor entra en el generador: fijo con cota fija a 400', () => {
  const nodos = [marco,
    { Id: '1', Tipo: '6', ContenidoEn: '0', TipoTrav: 'HB', TipoCota: '2', Cota: '400', nTrav: '1', idTrav: '1', travMH: 'M', TravVP: 'V' },
    { Id: '2', Tipo: '2', ContenidoEn: '0', TipoTrav: 'HB', idTrav: '1', posHueco: '1' },
    { Id: '3', Tipo: '2', ContenidoEn: '0', TipoTrav: 'HB', idTrav: '1', posHueco: '2' },
    { Id: '4', Tipo: '5', ContenidoEn: '2' }, { Id: '5', Tipo: '5', ContenidoEn: '3' }].map(nodoDisenoDeProductor)
  const r = generarPlantillaDisenoPropio({ nodos })
  assert.equal(r.ok, true)
  if (r.ok) assert.deepEqual(r.filas.filter(f => f.componente === '1').map(f => [f.formulaLargo, f.formulaAncho]), [['L-400', 'A'], ['400', 'A']])
})

test('un nodo con curva o de un tipo sin regla queda fuera del alcance en vez de generar una plantilla', () => {
  assert.deepEqual(generarPlantillaDisenoPropio({ nodos: [nodoDisenoDeProductor({ ...marco, TipoCurva: '8' })] }), { ok: false, motivo: 'diseño con curva' })
  assert.deepEqual(generarPlantillaDisenoPropio({ nodos: [marco, { Id: '1', Tipo: '9', ContenidoEn: '0' }].map(nodoDisenoDeProductor) }), { ok: false, motivo: 'nodo de tipo 9' })
})

test('la hoja conserva tipo, clase, vierteaguas y accesorios de diseño; la cota variable, su símbolo', () => {
  const h = nodoDisenoDeProductor({ Id: '4', Tipo: '3', ContenidoEn: '2', TipoHoja: '6', moVP: 'V', TravVP: '', bVAG: 'True', lstAccDis: 'MI;', bApertExt: 'False', CompHojaInf: '0', TipoCorte1: '1', TipoCorte2: '1', TipoCorte3: '1', TipoCorte4: '1' })
  assert.deepEqual({ tipoHoja: h.tipoHoja, clase: h.clase, vierteaguas: h.vierteaguas, accesorios: h.accesorios, aperturaExterior: h.aperturaExterior, hojaInferior: h.hojaInferior, cortes: h.cortes },
    { tipoHoja: 6, clase: 'V', vierteaguas: true, accesorios: ['MI'], aperturaExterior: false, hojaInferior: false, cortes: [1, 1, 1, 1] })
  assert.equal(nodoDisenoDeProductor({ Id: '1', Tipo: '6', TipoCota: '1', Cota: '500', Simbolo: 'FI' }).simbolo, 'FI')
  const r = generarPlantillaDisenoPropio({ nodos: [marco, { Id: '1', Tipo: '3', ContenidoEn: '0', TipoHoja: '5', moVP: 'V', bVAG: 'True', lstAccDis: 'MI;', TipoCorte1: '1', TipoCorte2: '1', TipoCorte3: '1', TipoCorte4: '1' }].map(nodoDisenoDeProductor) })
  assert.equal(r.ok && r.filas.filter(f => f.componente === 'OBC').length, 1)
})
