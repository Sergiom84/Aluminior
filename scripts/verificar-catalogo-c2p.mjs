/** Contraste de lectura: árbol, clasificación, medidas y configuración de puerta. */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse/sync'
import { leerCatalogoDiseno, firmaDibujo } from './lib/catalogo-diseno.mjs'
import { generarPlantillaCatalogo } from '../packages/core/src/estructuras/diseno-catalogo.ts'
import { plantillaDiseno } from '../packages/core/src/estructuras/diseno.ts'

const carpeta = process.argv[2] ?? 'export_datos/EMP0016'
const catalogo = leerCatalogoDiseno(carpeta)
assert.ok(catalogo.estructuras.length > 0)
const leer = tabla => parse(readFileSync(join(carpeta, `${tabla}.csv`)), { columns: true, bom: true })
const tipos = leer('SeriesAsocV2TiposHoja').filter(f => f.id === '16')
assert.equal(tipos.length, 1, 'Tipo de hoja16 inequívoco')
assert.deepEqual(['tipo', 'tipoAsocV2', 'numeroHojas', 'tipoPerfPuertaSN', 'tipoPerfVentanaSN',
  'correderaSN', 'abatibleSN', 'plegableSN', 'pivotanteSN'].map(c => tipos[0][c]),
['t2HCP', '2H_CORR', '2', 'True', 'False', 'True', 'False', 'False', 'False'])
const modelos = ['C2', 'C2P'].map(codigo => {
  const entradas = catalogo.estructuras.filter(e => e.codigo === codigo)
  assert.equal(entradas.length, 1, `Identidad inequívoca ${codigo}`)
  const entrada = entradas[0], plantilla = plantillaDiseno(codigo)
  assert.ok(plantilla, `${codigo} habilitada`)
  const resultado = generarPlantillaCatalogo(entrada)
  assert.equal(resultado.estado, 'dibujable', `${codigo}: ${JSON.stringify(resultado)}`)
  assert.deepEqual(firmaDibujo(plantilla), firmaDibujo(resultado.plantilla), codigo)
  assert.deepEqual([plantilla.anchoMm, plantilla.altoMm, plantilla.familiaCodigo, plantilla.descripcion],
    [entrada.anchoMm, entrada.altoMm, entrada.familiaCodigo, entrada.descripcion.trim()])
  assert.ok(entrada.nodos.every(n => n.variantes.length === 0 && n.tipoCota === 0))
  const hojas = entrada.nodos.filter(n => n.tipo === 3)
  assert.equal(hojas.length, 2)
  assert.deepEqual(hojas.map(n => [n.hoja, n.numeroHoja]).sort((a, b) => a[1] - b[1]),
    codigo === 'C2' ? [[10, 1], [10, 2]] : [[16, 1], [16, 2]])
  return { codigo, nodos: entrada.nodos.length, firma: 'coincide',
    anchoMm: entrada.anchoMm, altoMm: entrada.altoMm }
})
const puertas = catalogo.estructuras.filter(e => e.familiaCodigo === '002')
assert.ok(puertas.length > 1, 'El barrido debe incluir variantes pendientes')
assert.deepEqual(puertas.filter(e => generarPlantillaCatalogo(e).estado === 'dibujable')
  .map(e => e.codigo), ['C2P'])
const fuentes = ['Estructuras', 'EstructurasDiseño', 'FamiliasEstr', 'SeriesAsocV2TiposHoja'].map(tabla => ({
  archivo: join(carpeta, `${tabla}.csv`),
  sha256: createHash('sha256').update(readFileSync(join(carpeta, `${tabla}.csv`))).digest('hex'),
}))
console.log(JSON.stringify({ fuentes, modelos, puertasDescubiertas: puertas.length,
  limite: 'Solo C2P; no acredita cálculo completo ni fabricación' }, null, 2))
