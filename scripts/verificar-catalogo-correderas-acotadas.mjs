/** Lectura de catálogo y contraste de ejes físicos, sin datos documentales. */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { leerCatalogoDiseno, firmaDibujo } from './lib/catalogo-diseno.mjs'
import { generarPlantillaCatalogo } from '../packages/core/src/estructuras/diseno-catalogo.ts'
import { distribuirModuloCerramiento } from '../packages/core/src/estructuras/geometria-modulo-cerramiento.ts'
import { CORREDERAS_ACOTADAS } from '../packages/core/src/estructuras/diseno/catalogo-correderas-acotadas.ts'

const carpeta = process.argv[2] ?? 'export_datos/EMP0016'
const catalogo = leerCatalogoDiseno(carpeta)
assert.ok(catalogo.estructuras.length > 0)
assert.deepEqual(CORREDERAS_ACOTADAS.map(p => p.codigo), ['C2FI', 'C2FS', 'C2FSFI'])

// Oráculo de posición sobre el árbol fuente: no usa el traductor ni la geometría web.
function ejesFuente(entrada, alto) {
  const ejes = []
  function visitar(padre, inicio, longitud) {
    const hijos = entrada.nodos.filter(n => n.padre === padre)
    const divisiones = hijos.filter(n => n.tipo === 6)
    if (!divisiones.length) { hijos.forEach(n => visitar(n.id, inicio, longitud)); return }
    assert.equal(divisiones.length, 1)
    const division = divisiones[0]
    const huecos = hijos.filter(n => n.tipo === 2).sort((a, b) => a.posicion - b.posicion)
    assert.equal(huecos.length, 2)
    if (division.tipoCota === 0) {
      assert.equal(division.travesano, 'VI')
      assert.equal(division.invisible, true)
      assert.equal(division.equidistantes, 2)
      huecos.forEach(n => visitar(n.id, inicio, longitud))
      return
    }
    assert.equal(division.tipoCota, 1)
    assert.ok(['HA', 'HB'].includes(division.travesano))
    assert.equal(division.cota, 300)
    assert.ok(longitud > division.cota)
    const superior = division.travesano === 'HA' ? division.cota : longitud - division.cota
    ejes.push(inicio + superior)
    visitar(huecos[0].id, inicio, superior)
    visitar(huecos[1].id, inicio + superior, longitud - superior)
  }
  const raices = entrada.nodos.filter(n => n.padre === -1)
  assert.equal(raices.length, 1)
  visitar(raices[0].id, 0, alto)
  return ejes.sort((a, b) => a - b)
}

const casos = []
for (const plantilla of CORREDERAS_ACOTADAS) {
  const entradas = catalogo.estructuras.filter(e => e.codigo === plantilla.codigo)
  assert.equal(entradas.length, 1)
  const entrada = entradas[0], traduccion = generarPlantillaCatalogo(entrada)
  assert.equal(traduccion.estado, 'dibujable')
  assert.deepEqual(firmaDibujo(plantilla), firmaDibujo(traduccion.plantilla))
  assert.deepEqual([plantilla.anchoMm, plantilla.altoMm, plantilla.familiaCodigo, plantilla.descripcion],
    [entrada.anchoMm, entrada.altoMm, entrada.familiaCodigo, entrada.descripcion.trim()])
  for (const altoMm of [entrada.altoMm, 900, 1800, 2317]) {
    for (const [ancho, alto, grosor] of [[1200, altoMm, 12], [240, 173, 18], [48, 35, 12]]) {
      const rect = { x: 17, y: 23, ancho, alto }
      const elementos = distribuirModuloCerramiento({ id: 'prueba', estructuraCodigo: plantilla.codigo,
        anchoMm: 1200, altoMm }, rect, grosor)
      const ejes = elementos.filter(e => e.tipo === 'separador' && e.clase === 'travesano')
        .map(e => (e.y + e.alto / 2 - rect.y) * altoMm / rect.alto).sort((a, b) => a - b)
      const esperados = ejesFuente(entrada, altoMm)
      assert.equal(ejes.length, esperados.length)
      ejes.forEach((eje, i) => assert.ok(Math.abs(eje - esperados[i]) < 1e-7, plantilla.codigo))
      const hojas = elementos.filter(e => e.tipo === 'hueco' && e.apertura !== 'fijo')
      assert.deepEqual(hojas.map(h => [h.apertura, h.manilla]),
        [['corredera-derecha', false], ['corredera-izquierda', false]])
      casos.push({ codigo: plantilla.codigo, altoMm, rect, grosor, ejes })
    }
  }
}
const fuentes = ['Estructuras', 'EstructurasDiseño', 'FamiliasEstr'].map(tabla => ({
  archivo: join(carpeta, `${tabla}.csv`),
  sha256: createHash('sha256').update(readFileSync(join(carpeta, `${tabla}.csv`))).digest('hex'),
}))
console.log(JSON.stringify({ fuentes, casos,
  limite: 'Ejes y árbol de catálogo; no acredita precio ni fabricación' }, null, 2))
