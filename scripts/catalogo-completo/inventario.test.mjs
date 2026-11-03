import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse/sync'
import { construirMatriz } from './modelo.mjs'
import { descubrirExportaciones, inventariarMdb, leerFuenteCatalogo } from './fuentes.mjs'
import { CAMPOS_DISENO, crearFuenteSintetica, escribirCsv, lecturaSintetica, nodo } from './fixtures.mjs'

test('contabiliza todos los modelos, auxiliares sin árbol y familias vacías', () => {
  const matriz = construirMatriz(lecturaSintetica())
  assert.equal(matriz.modelos.length, 2)
  assert.equal(matriz.resumen.sinDiseno, 1)
  assert.equal(matriz.familias.find(f => f.codigo === 'VACIA').modelos, 0)
  const auxiliar = matriz.modelos.find(m => m.codigo === 'AUX-SINTETICO')
  assert.equal(auxiliar.accesorioDeclarado, true)
  assert.equal(auxiliar.tablasRelacionadas.EstructurasLineas, 2)
  assert.ok(auxiliar.bloqueos.some(b => b.includes('no equivale a datos perdidos')))
})

test('traducción visual no acredita edición, persistencia, precio ni fabricación', () => {
  const lectura = lecturaSintetica()
  const matriz = construirMatriz(lectura, { plantillas: [{ codigo: 'MODELO-SINTETICO' }] })
  const modelo = matriz.modelos[0]
  assert.equal(modelo.traduccion, 'dibujable')
  assert.equal(modelo.habilitacion.plantilla, true)
  assert.equal(modelo.edicion.evidencia, 'sin-verificacion-por-modelo')
  assert.equal(modelo.persistencia.evidencia, 'sin-verificacion-por-modelo')
  assert.equal(modelo.valoracion.evidencia, 'sin-verificacion-por-modelo')
  assert.equal(modelo.fabricacion, 'no-acreditada')
})

test('una unión habilitada conserva su vía propia aunque no tenga árbol', () => {
  const matriz = construirMatriz(lecturaSintetica(), { uniones: [{ codigo: 'AUX-SINTETICO' }] })
  assert.equal(matriz.resumen.unionesHabilitadas, 1)
  assert.equal(matriz.resumen.plantillasHabilitadas, 0)
  assert.equal(matriz.modelos[1].habilitacion.via, 'union')
  assert.equal(matriz.modelos[1].diseno.disponible, false)
})

test('conserva bloqueos concretos del traductor y componente observado', () => {
  const lectura = lecturaSintetica()
  lectura.estructuras[0].nodos = [nodo(1, 1, -1), nodo(2, 9, 1)]
  const modelo = construirMatriz(lectura).modelos[0]
  assert.equal(modelo.componentes.observados.tiposNodo['9'], 1)
  assert.ok(modelo.bloqueos.includes('tipo de nodo 9'))
  assert.equal(modelo.traduccion, 'pendiente')
})

test('familias no enumeradas y códigos repetidos no desaparecen', () => {
  const lectura = lecturaSintetica()
  lectura.estructuras.push({ ...lectura.estructuras[0], familiaCodigo: 'NUEVA' })
  const matriz = construirMatriz(lectura)
  assert.equal(matriz.modelos.length, 3)
  assert.equal(matriz.familias.find(f => f.codigo === 'NUEVA').modelos, 1)
  assert.ok(matriz.modelos[0].bloqueos.some(b => b.includes('identidad ambigua')))
  assert.notEqual(matriz.modelos[0].id, matriz.modelos[2].id)
})

test('evidencia exacta mantiene alcance; no se propaga a otro modelo ni otra fuente', () => {
  const evidencia = { fuenteId: 'sintetica-v1', edicion: 'caso-verificado',
    valoracion: 'incompleta', alcance: 'solo medida sintética', fuente: 'acta-sintetica' }
  const opciones = { evidencias: { 'MODELO-SINTETICO': evidencia } }
  const lectura = lecturaSintetica()
  const matriz = construirMatriz(lectura, opciones)
  assert.equal(matriz.modelos[0].valoracion.evidencia, 'incompleta')
  assert.equal(matriz.modelos[0].valoracion.alcance, 'solo medida sintética')
  assert.equal(matriz.modelos[1].edicion.evidencia, 'sin-verificacion-por-modelo')
  lectura.fuente.id = 'otra-exportacion'
  assert.equal(construirMatriz(lectura, opciones).modelos[0].edicion.evidencia, 'sin-verificacion-por-modelo')
})

test('CSV excluye diseños documentales y registra nodos sin ficha separadamente', t => {
  const { raiz, carpeta } = crearFuenteSintetica()
  t.after(() => rmSync(raiz, { recursive: true }))
  const lectura = leerFuenteCatalogo(carpeta)
  assert.equal(lectura.disenos.filasTotales, 4)
  assert.equal(lectura.disenos.nodosCatalogo, 3)
  assert.equal(lectura.disenos.nodosDocumentoExcluidos, 1)
  assert.deepEqual(lectura.disenos.sinFicha, [{ codigo: 'SIN-FICHA', nodos: 1 }])
  assert.equal(lectura.estructuras[0].nodos.length, 2)
  assert.equal(lectura.estructuras[0].anchoMm, 1000)
  assert.equal(lectura.estructuras[1].relacionadas.EstructurasLineas, 1)
})

test('identifica por hash; dos exportaciones distintas no se mezclan', t => {
  const { raiz, carpeta } = crearFuenteSintetica()
  t.after(() => rmSync(raiz, { recursive: true }))
  const primera = leerFuenteCatalogo(carpeta)
  assert.equal(primera.fuente.archivos.length, 3)
  assert.ok(primera.fuente.archivos.every(f => /^[a-f0-9]{64}$/.test(f.sha256)))
  assert.equal(primera.fuente.ejercicio, null)
  escribirCsv(carpeta, 'FamiliasEstr', ['Codigo', 'Descripcion', 'OrdenEsc', 'AccesorioSN'], [])
  assert.notEqual(leerFuenteCatalogo(carpeta).fuente.id, primera.fuente.id)
})

test('falla ante cabecera inválida en lugar de declarar catálogo vacío', t => {
  const { raiz, carpeta } = crearFuenteSintetica()
  t.after(() => rmSync(raiz, { recursive: true }))
  escribirCsv(carpeta, 'Estructuras', ['Codigo'], [])
  assert.throws(() => leerFuenteCatalogo(carpeta), /faltan columnas/)
})

test('los artículos específicos de documento no acreditan componentes de catálogo', t => {
  const { raiz, carpeta } = crearFuenteSintetica()
  t.after(() => rmSync(raiz, { recursive: true }))
  const lectura = leerFuenteCatalogo(carpeta)
  const fuente = lectura.fuente.relacionadas.find(f => f.tabla === 'EstructurasArticulos')
  assert.equal(fuente.filas, 2)
  assert.equal(fuente.filasCatalogo, 1)
  assert.equal(fuente.filasDocumentoExcluidas, 1)
  assert.equal(lectura.estructuras[0].relacionadas.EstructurasArticulos, 1)
  escribirCsv(carpeta, 'EstructurasArticulos', ['Estructura', 'Articulo'], [])
  assert.throws(() => leerFuenteCatalogo(carpeta), /faltan columnas TipoDoc/)
})

for (const campo of ['TipoCurva', 'bPerInf', 'bApertExt', 'bVAG', 'barrHoriz']) {
  test(`una exportación sin ${campo} no acredita ausencia de variante`, t => {
    const { raiz, carpeta } = crearFuenteSintetica()
    t.after(() => rmSync(raiz, { recursive: true }))
    const filas = parse(readFileSync(join(carpeta, 'EstructurasDiseño.csv')), { columns: true })
    escribirCsv(carpeta, 'EstructurasDiseño', CAMPOS_DISENO.filter(c => c !== campo), filas)
    assert.throws(() => leerFuenteCatalogo(carpeta), new RegExp(`faltan columnas ${campo}`))
  })
}

test('descubre todas las carpetas completas sin confiar en una lista de años', t => {
  const { raiz, carpeta } = crearFuenteSintetica()
  t.after(() => rmSync(raiz, { recursive: true }))
  const incompleta = join(raiz, 'otra-fuente')
  mkdirSync(incompleta)
  writeFileSync(join(incompleta, 'Estructuras.csv'), 'Codigo\n')
  assert.deepEqual(descubrirExportaciones([raiz]), [carpeta])
  assert.deepEqual(descubrirExportaciones([raiz, carpeta]), [carpeta])
})

test('MDB: inventario solo de metadatos, año rotulado y versión no se confunden con mtime', t => {
  const { raiz } = crearFuenteSintetica()
  t.after(() => rmSync(raiz, { recursive: true }))
  const copia = join(raiz, 'Copias de Seguridad', 'EMP0030 - 2020')
  mkdirSync(copia, { recursive: true })
  writeFileSync(join(copia, 'aluminio.mdb'), 'Esto no es una base de datos; no debe abrirse')
  const inventario = inventariarMdb(raiz)
  assert.equal(inventario.archivos.length, 1)
  assert.equal(inventario.archivos[0].ejercicioRotulado, 2020)
  assert.equal(inventario.archivos[0].sha256, undefined)
  assert.match(inventario.archivos[0].estado, /solo-metadatos/)
})
