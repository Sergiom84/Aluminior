/**
 * Contraste del generador de plantillas de diseño propio (DS4) contra las que guardó
 * Productor: cada árbol de `EstructurasDiseño` con su plantilla de `EstructurasArticulos`,
 * del catálogo y de los documentos. Solo lectura sobre una extracción privada.
 *
 * Uso: node --import tsx scripts/contraste-diseno-propio.ts --salida export_datos/<extracción>
 *        [--casos <carpeta con EstructurasDiseno.tsv y EstructurasArticulos.tsv>] [--detalle <clave>|todo]
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { isDeepStrictEqual, parseArgs } from 'node:util'
import { generarPlantillaDisenoPropio, type FilaPlantillaCatalogo } from '@aluminior/core/despiece'
import { filasCsv } from './lib/contraste-presupuestos/exportacion.ts'
import { filaPlantillaDocumento } from './lib/contraste-presupuestos/plantillas-documento.ts'
import { nodoDisenoDeProductor } from './lib/contraste-presupuestos/diseno-documento.ts'

type Fila = Record<string, string>
interface Par { clave: string; estructura: string; arbol: Fila[]; filas: Fila[] }

const { values } = parseArgs({ options: { salida: { type: 'string' }, casos: { type: 'string' }, detalle: { type: 'string' } } })
if (!values.salida) throw new Error('Uso: --salida export_datos/<extracción> [--casos <carpeta>] [--detalle <clave>|todo]')

const tsv = (ruta: string): Fila[] => {
  const [cabecera, ...lineas] = readFileSync(ruta, 'utf8').replace(/^﻿/, '').split(/\r?\n/).filter(Boolean)
  const columnas = (cabecera ?? '').split('\t')
  return lineas.map(l => { const v = l.split('\t'); return Object.fromEntries(columnas.map((c, i) => [c, v[i] ?? ''])) })
}
const clave = (f: Fila) => f.TipoDoc?.trim() ? `${f.TipoDoc.trim()}:${f.nDoc}:${f.nLinEstr}` : `CAT:${f.Estructura}`

function pares(diseno: Fila[], articulos: Fila[], prefijo = ''): Par[] {
  const m = new Map<string, Par>()
  const par = (f: Fila) => { const k = prefijo + clave(f); const p = m.get(k) ?? { clave: k, estructura: f.Estructura ?? '', arbol: [], filas: [] }; m.set(k, p); return p }
  for (const f of diseno) par(f).arbol.push(f)
  for (const f of articulos) par(f).filas.push(f)
  return [...m.values()].filter(p => p.arbol.length > 0 && p.filas.length > 0)
}

const catalogo = join(values.salida, 'catalogo')
const fijosIndependientes = new Set(filasCsv(readFileSync(join(catalogo, 'Estructuras.csv'), 'utf8')).filter(e => e.DisFIsn === 'True').map(e => e.Codigo))
const todos = pares(filasCsv(readFileSync(join(catalogo, 'EstructurasDiseño.csv'), 'utf8')), filasCsv(readFileSync(join(catalogo, 'EstructurasArticulos.csv'), 'utf8')))
if (values.casos && existsSync(values.casos)) todos.push(...pares(tsv(join(values.casos, 'EstructurasDiseno.tsv')), tsv(join(values.casos, 'EstructurasArticulos.tsv')), 'CASOS/'))

/** Plantilla de Productor tal como la lee el motor, con el vidrio propio de cada cristal. */
function plantillaProductor(p: Par): FilaPlantillaCatalogo[] {
  const vidrios = new Map(p.arbol.filter(n => n.Tipo === '5' && n.Vidrio?.trim()).map(n => [Number(n.Id), n.Vidrio!.trim()]))
  return p.filas.filter(f => f.Articulo?.trim()).sort((a, b) => Number(a.nLin) - Number(b.nLin))
    .map(f => filaPlantillaDocumento(f, vidrios.get(Number(f.DisIdIt)) ?? null))
}

const iguales: string[] = [], distintas: string[] = [], fuera = new Map<string, string[]>()
for (const p of todos) {
  const generada = generarPlantillaDisenoPropio({ nodos: p.arbol.map(nodoDisenoDeProductor), fijoIndependiente: fijosIndependientes.has(p.estructura) })
  if (!generada.ok) { fuera.set(generada.motivo, [...fuera.get(generada.motivo) ?? [], p.clave]); continue }
  const esperada = plantillaProductor(p)
  if (isDeepStrictEqual(generada.filas, esperada)) { iguales.push(p.clave); continue }
  distintas.push(p.clave)
  if (values.detalle !== 'todo' && values.detalle !== p.clave) continue
  console.log(`-- ${p.clave} (${p.estructura}): ${generada.filas.length} filas generadas, ${esperada.length} en Productor`)
  for (let i = 0; i < Math.max(generada.filas.length, esperada.length); i++) {
    const campo = (f?: FilaPlantillaCatalogo) => f && { ...f } as Record<string, unknown>
    const g = campo(generada.filas[i]), e = campo(esperada[i])
    if (!g || !e) { console.log(`   fila ${i + 1}: ${g ? 'sobra' : 'falta'} ${JSON.stringify(g ?? e)}`); continue }
    const campos = [...new Set([...Object.keys(g), ...Object.keys(e)])].filter(k => !isDeepStrictEqual(g[k], e[k]))
    if (campos.length) console.log(`   fila ${i + 1} [${e.componente}/${e.articulo}]: ` + campos.map(k => `${k} ${JSON.stringify(g[k])} ≠ ${JSON.stringify(e[k])}`).join('; '))
  }
}
const origen = (claves: string[]) => { const o: Record<string, number> = {}; for (const k of claves) { const t = k.split(':')[0]!; o[t] = (o[t] ?? 0) + 1 } return o }
console.log(JSON.stringify({
  pares: todos.length, iguales: iguales.length, igualesPorOrigen: origen(iguales), distintas,
  fueraDeAlcance: Object.fromEntries([...fuera].sort((a, b) => b[1].length - a[1].length).map(([motivo, claves]) => [motivo, claves.length])),
}, null, 2))
