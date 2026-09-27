/** Solo lectura: catálogo copiado frente a composición visual aprobada. */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { leerCatalogoDiseno } from './lib/catalogo-diseno.mjs'
import { distribuirComposicion, plantillaDiseno } from '../packages/core/src/estructuras/diseno.ts'

const carpeta = process.argv[2] ?? 'export_datos/EMP0016'
const fuentes = ['Estructuras', 'EstructurasDiseño'].map(nombre => ({
  archivo: join(carpeta, `${nombre}.csv`),
  sha256: createHash('sha256').update(readFileSync(join(carpeta, `${nombre}.csv`))).digest('hex'),
}))
const candidatas = leerCatalogoDiseno(carpeta).estructuras.filter(e => e.codigo === 'C2')
assert.equal(candidatas.length, 1, 'C2 debe ser inequívoca')
const c = candidatas[0]
assert.deepEqual([c.familiaCodigo, c.anchoMm, c.altoMm], ['001', 1200, 1200])
assert.equal(c.nodos.length, 8)
assert.ok(c.nodos.every(n => n.variantes.length === 0))
assert.deepEqual(c.nodos.map(n => [n.id, n.tipo, n.padre]), [
  [0, 1, -1], [1, 6, 0], [2, 2, 0], [3, 2, 0],
  [4, 3, 2], [5, 3, 3], [6, 5, 4], [7, 5, 5],
])
assert.equal(c.nodos[0].marco, 'NOR')
assert.deepEqual([c.nodos[1].travesano, c.nodos[1].invisible, c.nodos[1].equidistantes,
  c.nodos[1].tipoCota, c.nodos[1].cota], ['VI', true, 2, 0, 0])
assert.deepEqual(c.nodos.filter(n => n.tipo === 3).map(n => [n.hoja, n.numeroHoja]), [[10, 1], [10, 2]])
const p = plantillaDiseno('C2')
assert.ok(p)
assert.deepEqual([p.descripcion, p.familiaCodigo, p.anchoMm, p.altoMm],
  [c.descripcion, c.familiaCodigo, c.anchoMm, c.altoMm])
const dibujo = distribuirComposicion(p.composicion, { x: 0, y: 0, ancho: c.anchoMm, alto: c.altoMm })
assert.equal(dibujo.filter(e => e.tipo === 'hueco').length, 2)
assert.deepEqual(dibujo.filter(e => e.tipo === 'separador').map(e => [e.eje, e.clase]),
  [['vertical', 'division-invisible']])
assert.equal(dibujo[0].ancho, dibujo[2].ancho)
console.log(JSON.stringify({ estructura: c.codigo, nodos: c.nodos.length, hojas: 2,
  fuentes, limite: 'Composición visual; no valida medidas de fabricación, carriles ni accesorios.' }, null, 2))
