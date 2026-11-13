import { test } from 'node:test'
import assert from 'node:assert/strict'
import { plantillasDeTsv } from './plantillas-documento.ts'
import { conPlantillasPropias } from './ejecutar.ts'
import type { Caso } from '../banco-contraste/datos.ts'

// Forma del volcado de `EstructurasArticulos` y `EstructurasDiseño` de un documento; valores inventados.
const ARTICULOS = [
  'nLin\tnDoc\tnLinEstr\tid\tArticulo\tDisComponente\tFuncion\tCantidad\tPosicionTrabajo\tDisTipoHoja\tDisIdIt\tDisIdRefLargo\tDisIdRefAncho\tFormulaLargo\tFormulaLargoCorte\tFormulaAncho\tDisFRefLargo\tDisGrupo\tDisGrupoI\tDisGrupoD\tDisIdPerAd',
  '12\t7\t40\t9\t8\t1\t\t1\t\t-1\t5\t3\t1\tL-300\tL-300\tA\tREF\tC\tMV\tMV\t-1',
  '10\t7\t40\t2\t303\t17\tTM\t1\tA\t-1\t1\t\t\tA\t\t\t\tTM\tMV\tMV\t0',
  '11\t7\t40\t8\t8\t1\t\t1\t\t-1\t4\t3\t1\t300\t300\tA\tREF\tC\tMV\tMV\t-1',
  '20\t7\t41\t1\t10\t12\tMV\t2\tL\t-1\t0\t\t\tL\t\t\t\tMV\tE\tE\t',
].join('\r\n')
const DISENOS = ['nDoc\tnLinEstr\tId\tTipo\tVidrio', '7\t40\t4\t5\t', '7\t40\t5\t5\tLAMINADO', '7\t40\t1\t6\tOTRO'].join('\n')

test('agrupa la plantilla por documento y línea en el orden de nLin, con el mapeo del catálogo', () => {
  const p = plantillasDeTsv(ARTICULOS)
  assert.deepEqual([...p.keys()], ['7/40', '7/41'])
  assert.deepEqual(p.get('7/40')!.map(f => [f.id, f.articulo, f.componente, f.formulaLargo, f.referenciaLargo, f.perfilAdicional]),
    [[2, '303', '17', 'A', null, null], [8, '8', '1', '300', 3, null], [9, '8', '1', 'L-300', 3, null]])
  assert.equal(p.get('7/40')!.some(f => 'vidrioPropio' in f), false)
})

test('el vidrio propio llega solo a la fila de cristal de su nodo de diseño', () => {
  const p = plantillasDeTsv(ARTICULOS, DISENOS).get('7/40')!
  assert.deepEqual(p.map(f => [f.id, f.vidrioPropio ?? null]), [[2, null], [8, null], [9, 'LAMINADO']])
})

test('solo los elementos con diseño específico reciben su plantilla', () => {
  const plantillas = plantillasDeTsv(ARTICULOS)
  const caso = { padre: { nDoc: 7 }, geometria: [
    { nLinEstr: 40, DisEspecificoSN: true, EsUnionSN: false }, { nLinEstr: 41, DisEspecificoSN: false, EsUnionSN: false },
  ] } as unknown as Caso
  assert.deepEqual(Object.keys(conPlantillasPropias(caso, plantillas).plantillasPropias ?? {}), ['40'])
  assert.equal(conPlantillasPropias(caso, new Map()), caso)
})
