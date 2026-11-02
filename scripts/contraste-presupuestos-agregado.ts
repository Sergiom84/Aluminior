/**
 * Agrega los contrastes de varias extracciones (ejercicios) en una tabla por ejercicio
 * y por año del documento. Solo lee salidas privadas de export_datos/; no valora.
 */
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { parseArgs } from 'node:util'
import { resumirContraste } from './lib/contraste-presupuestos/resumen.ts'
import type { ContrasteGrupo } from './lib/contraste-presupuestos/ejecutar.ts'

const { values } = parseArgs({ options: { raiz: { type: 'string', default: 'export_datos/contraste-2026-11' } } })
const raiz = resolve(values.raiz!)
if (!raiz.includes(`${resolve('export_datos')}`)) throw new Error('La raíz debe estar dentro de export_datos/')
const carpetas = readdirSync(raiz).filter(d => existsSync(join(raiz, d, 'contraste-grupos.json'))).sort()
const todos: (ContrasteGrupo & { ejercicio: string })[] = []
const porEjercicio = carpetas.map(d => {
  const gs = JSON.parse(readFileSync(join(raiz, d, 'contraste-grupos.json'), 'utf8')) as ContrasteGrupo[]
  const ejercicio = d.slice(0, 7)
  todos.push(...gs.map(g => ({ ...g, ejercicio, documento: `${ejercicio}|${g.documento}` })))
  const r = resumirContraste(gs)
  return { ejercicio, carpeta: d, grupos: r.grupos, documentos: r.documentos,
    resultados: Object.fromEntries(Object.entries(r.porResultado).map(([k, v]) => [k, v.grupos])),
    receta: r.receta, reparto: r.reparto, patrones: r.patrones,
    causas: Object.fromEntries(r.causas.map(c => [c.causa, c.grupos])) }
})
// La 0017 es copia de la 0016 más ensayos: no se suma al total real.
const reales = todos.filter(g => g.ejercicio !== 'EMP0017')
const total = resumirContraste(reales)
const porAno = [...new Set(reales.map(g => g.fecha.slice(0, 4)))].sort().map(ano => {
  const r = resumirContraste(reales.filter(g => g.fecha.startsWith(ano)))
  return { ano, grupos: r.grupos, ...Object.fromEntries(Object.entries(r.porResultado).map(([k, v]) => [k, v.grupos])), recetaIgual: r.receta.igual }
})
const salida = { ejercicios: porEjercicio, porAno, total: { grupos: total.grupos, documentos: total.documentos,
  causas: total.causas, reparto: total.reparto, patrones: total.patrones, uniones: total.uniones, receta: total.receta } }
writeFileSync(join(raiz, 'agregado.json'), JSON.stringify(salida, null, 2))
console.log(JSON.stringify(salida, null, 2))
