import assert from 'node:assert/strict'
import { test } from 'node:test'
import { rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { analizarArgumentos, cargarEvidencias } from './evidencias.mjs'
import { construirMatriz } from './modelo.mjs'
import { crearFuenteSintetica, lecturaSintetica } from './fixtures.mjs'

function preparar(t) {
  const { raiz } = crearFuenteSintetica()
  t.after(() => rmSync(raiz, { recursive: true }))
  const prueba = 'qa-sintetica.log'
  writeFileSync(join(raiz, prueba), 'Caso sintético: editado, guardado y reabierto; precio bloqueado.\n')
  const ruta = join(raiz, 'evidencias.json')
  const lectura = lecturaSintetica()
  const modelo = { codigo: 'MODELO-SINTETICO', alcance: 'Solo caso sintético a 1000x1100',
    dibujo: { estado: 'verificado-en-casos', pruebas: [prueba] },
    edicion: { estado: 'verificado-en-casos', pruebas: [prueba] },
    persistencia: { estado: 'verificado-en-casos', pruebas: [prueba] },
    valoracion: { estado: 'bloqueada', contraste: 'mismo-motor', pruebas: [prueba],
      bloqueos: ['Falta pieza sintética'] }, fabricacion: false }
  const documento = { version: 1, fuenteId: lectura.fuente.id, modelos: [modelo] }
  const cargar = () => {
    writeFileSync(ruta, JSON.stringify(documento))
    return cargarEvidencias(ruta, [lectura], raiz)
  }
  return { raiz, lectura, modelo, documento, cargar }
}

test('carga evidencia con huellas, reconoce capacidades sólo del modelo y mantiene bloqueo económico', t => {
  const { lectura, cargar } = preparar(t)
  const cargada = cargar()
  const matriz = construirMatriz(lectura, { evidencias: cargada.porFuente.get(lectura.fuente.id) })
  assert.equal(matriz.resumen.edicionVerificadaEnCasos, 1)
  assert.equal(matriz.resumen.persistenciaVerificadaEnCasos, 1)
  assert.equal(matriz.resumen.dibujoVerificadoEnCasos, 1)
  assert.equal(matriz.resumen.valoracionBloqueadaEnCasos, 1)
  assert.equal(matriz.modelos[0].valoracion.independiente, false)
  assert.equal(matriz.modelos[0].fabricacion, 'no-acreditada')
  assert.equal(matriz.modelos[0].alcanceEvidencia, 'Solo caso sintético a 1000x1100')
  assert.ok(matriz.modelos[0].bloqueos.includes('valoración: Falta pieza sintética'))
  assert.match(matriz.modelos[0].pruebas.persistencia[0].sha256, /^[0-9a-f]{64}$/)
  assert.match(cargada.documento.sha256, /^[0-9a-f]{64}$/)
  assert.equal(matriz.modelos[1].edicion.evidencia, 'sin-verificacion-por-modelo')
  const otraFuente = { ...lectura, fuente: { id: 'otra-fuente' } }
  const otraMatriz = construirMatriz(otraFuente, { evidencias: cargada.porFuente.get(otraFuente.fuente.id) })
  assert.equal(otraMatriz.resumen.edicionVerificadaEnCasos, 0)
})

test('sin --evidencias no introduce verificaciones operativas', () => {
  const lectura = lecturaSintetica()
  const cargada = cargarEvidencias(null, [lectura])
  assert.equal(cargada.documento, null)
  assert.equal(cargada.porFuente.size, 0)
  assert.equal(construirMatriz(lectura).resumen.edicionVerificadaEnCasos, 0)
})

test('rechaza evidencia de una fuente no seleccionada en lugar de ignorarla', t => {
  const { documento, cargar } = preparar(t)
  documento.fuenteId = 'otra-version'
  assert.throws(cargar, /fuenteId no corresponde/)
})

test('rechaza código desconocido, repetido y ambiguo sin aplicarlo a otra ficha', t => {
  const { lectura, modelo, documento, cargar } = preparar(t)
  modelo.codigo = 'DESCONOCIDO'
  assert.throws(cargar, /código desconocido o ambiguo/)
  modelo.codigo = 'MODELO-SINTETICO'
  documento.modelos.push({ ...modelo })
  assert.throws(cargar, /modelo repetido/)
  documento.modelos.pop()
  lectura.estructuras.push({ ...lectura.estructuras[0] })
  assert.throws(cargar, /código desconocido o ambiguo/)
})

test('rechaza fabricación apta y valoración independiente no acreditadas', t => {
  const { modelo, cargar } = preparar(t)
  modelo.fabricacion = true
  assert.throws(cargar, /fabricación debe permanecer false/)
  modelo.fabricacion = false
  modelo.valoracion.estado = 'verificada-independientemente'
  assert.throws(cargar, /valoración independiente o apta no acreditable/)
  modelo.valoracion.estado = 'bloqueada'
  modelo.valoracion.contraste = 'independiente'
  assert.throws(cargar, /valoración independiente o apta no acreditable/)
})

test('una capacidad verificada exige pruebas existentes, locales y no vacías', t => {
  const { modelo, raiz, cargar } = preparar(t)
  modelo.edicion.pruebas = []
  assert.throws(cargar, /requiere referencias/)
  modelo.edicion.pruebas = ['ausente.log']
  assert.throws(cargar, /ENOENT/)
  modelo.edicion.pruebas = ['https://ejemplo.test/prueba']
  assert.throws(cargar, /archivos locales/)
  writeFileSync(join(raiz, 'vacia.log'), '')
  modelo.edicion.pruebas = ['vacia.log']
  assert.throws(cargar, /prueba vacía/)
})

test('una valoración bloqueada requiere motivo concreto y no equivale a precio verificado', t => {
  const { modelo, cargar } = preparar(t)
  modelo.valoracion.bloqueos = []
  assert.throws(cargar, /requiere motivos concretos/)
  modelo.valoracion.bloqueos = ['']
  assert.throws(cargar, /texto no vacío/)
  modelo.valoracion.bloqueos = ['Sin pieza']
  modelo.valoracion.pruebas = []
  assert.throws(cargar, /requiere referencias/)
})

test('admite evidencia parcial y conserva cada estado sin inferir persistencia desde edición', t => {
  const { modelo, cargar, lectura } = preparar(t)
  modelo.persistencia = { estado: 'sin-verificar', pruebas: [] }
  modelo.valoracion = { estado: 'sin-verificar', contraste: 'ninguno', pruebas: [], bloqueos: [] }
  const cargada = cargar()
  const matriz = construirMatriz(lectura, { evidencias: cargada.porFuente.get(lectura.fuente.id) })
  assert.equal(matriz.resumen.edicionVerificadaEnCasos, 1)
  assert.equal(matriz.resumen.persistenciaVerificadaEnCasos, 0)
  assert.equal(matriz.resumen.valoracionBloqueadaEnCasos, 0)
  assert.equal(matriz.modelos[0].persistencia.evidencia, 'sin-verificar')
  assert.ok(matriz.modelos[0].bloqueos.includes('persistencia sin prueba individual registrada'))
})

test('rechaza campos y estados desconocidos para no aceptar accidentalmente un aprobado', t => {
  const { modelo, documento, cargar } = preparar(t)
  modelo.edicion.estado = 'apto'
  assert.throws(cargar, /estado no admitido/)
  modelo.edicion.estado = 'verificado-en-casos'
  documento.apto = true
  assert.throws(cargar, /campos inválidos/)
})

test('parser acepta --evidencias junto a carpetas y rechaza argumentos ambiguos', () => {
  assert.deepEqual(analizarArgumentos(['fuente-a', '--evidencias', 'pruebas.json', 'fuente-b']), {
    carpetas: [resolve('fuente-a'), resolve('fuente-b')], evidencias: resolve('pruebas.json'),
  })
  assert.throws(() => analizarArgumentos(['--evidencias']), /única ruta/)
  assert.throws(() => analizarArgumentos(['--evidencias', 'a', '--evidencias', 'b']), /única ruta/)
  assert.throws(() => analizarArgumentos(['--inexistente']), /opción desconocida/)
})
