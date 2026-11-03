/** Lectura exclusiva del catálogo: no carga datos ni modifica documentos. */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { leerCatalogoDiseno, firmaDibujo } from './lib/catalogo-diseno.mjs'
import { generarPlantillaCatalogo } from '../packages/core/src/estructuras/diseno-catalogo.ts'
import { FIJOS_CATALOGO } from '../packages/core/src/estructuras/diseno/catalogo-fijos.ts'

const carpeta = process.argv[2] ?? 'export_datos/EMP0016'
const catalogo = leerCatalogoDiseno(carpeta)
assert.ok(catalogo.estructuras.length > 0)
const modelos = FIJOS_CATALOGO.map(plantilla => {
  const entradas = catalogo.estructuras.filter(e => e.codigo === plantilla.codigo)
  assert.equal(entradas.length, 1, `Identidad inequívoca ${plantilla.codigo}`)
  const entrada = entradas[0]
  const resultado = generarPlantillaCatalogo(entrada)
  assert.equal(resultado.estado, 'dibujable', `${plantilla.codigo}: ${JSON.stringify(resultado)}`)
  assert.deepEqual(firmaDibujo(plantilla), firmaDibujo(resultado.plantilla), plantilla.codigo)
  assert.deepEqual([plantilla.anchoMm, plantilla.altoMm, plantilla.familiaCodigo, plantilla.descripcion],
    [entrada.anchoMm, entrada.altoMm, entrada.familiaCodigo, entrada.descripcion.trim()])
  assert.ok(entrada.nodos.every(n => n.variantes.length === 0 && n.tipoCota === 0))
  return { codigo: entrada.codigo, nodos: entrada.nodos.length, firma: 'coincide' }
})
const fuentes = ['Estructuras', 'EstructurasDiseño', 'FamiliasEstr'].map(tabla => ({
  archivo: join(carpeta, `${tabla}.csv`),
  sha256: createHash('sha256').update(readFileSync(join(carpeta, `${tabla}.csv`))).digest('hex'),
}))
console.log(JSON.stringify({ fuentes, modelos, limite: 'No certifica precio ni fabricación' }, null, 2))
