/**
 * Verifica la selección de artículos GM60 contra facturas, sin usar su
 * despiece como entrada. No conecta a BD, no carga .env ni escribe datos.
 *
 * node node_modules/tsx/dist/cli.mjs scripts/verificar-acristalamiento-gm60.ts
 *   [carpeta catálogo CSV] [carpeta facturas]
 *
 * Solo valida los códigos elegidos: las dimensiones neutras siguientes
 * aíslan esa selección; no acreditan cortes, cantidades ni importes.
 */
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { acristalarVidrio } from '../packages/core/src/despiece/acristalamiento-catalogo.ts'
import { catalogoDesdeCsv, leerCsv } from './lib/catalogo-csv.ts'

const [origen = 'export_datos/EMP0016', facturas = 'output/facturas-2026'] = process.argv.slice(2)
const catalogo = catalogoDesdeCsv(origen)
const lineas = leerCsv(facturas, 'lineas')
const configuraciones = new Map(leerCsv(facturas, 'configuraciones').map(c => [`${c.nVDoc}|${c.nVLinea}`, c]))
const tabla = catalogo.tablaAcristalamiento('GM60')
// El universo del oráculo procede de TODAS las tablas, no solo GM60:
// un junquillo/junta de otra tabla también debe aparecer como discrepancia.
const articulosAcristalamiento = new Set(leerCsv(origen, 'TAcristalamientoLin')
  .flatMap(t => [t.Junquillo?.trim(), t.JuntaExt?.trim(), t.JuntaInt?.trim()])
  .filter(c => c && c !== '0'))
if (!tabla.length || !articulosAcristalamiento.size || !lineas.length) {
  throw new Error('Catálogo o facturas vacíos: no existe un contraste válido')
}

const serie = catalogo.serie('ELEGANTPVC')
if (serie?.tablaHojas !== 'GM60' || serie.tablaFijos !== 'GM60') {
  throw new Error('La serie de la copia ya no usa GM60 para hojas y fijos')
}
const hijas = new Map<string, typeof lineas>()
for (const l of lineas) {
  if (l.EstructuraSN === 'True' || !articulosAcristalamiento.has(l.Articulo?.trim())) continue
  const clave = `${l.nDoc}|${l.nEstr}`
  const grupo = hijas.get(clave) ?? []
  grupo.push(l)
  hijas.set(clave, grupo)
}

const resumen = {
  lineasNoEspecificas: 0, sinAcristalamientoEnOraculo: 0, contrastadas: 0, exactas: 0, diferentes: 0,
  grosores: {} as Record<string, { lineas: number; exactas: number; seleccion: string[][] }>,
}
for (const p of lineas.filter(l => l.EstructuraSN === 'True')) {
  const c = configuraciones.get(`${p.nDoc}|${p.nLinea}`)
  if (c?.Conjunto1?.trim() !== 'ELEGANTPVC' || c.DisEspecificoSN === 'True') continue
  resumen.lineasNoEspecificas++
  const esperadas = hijas.get(`${p.nDoc}|${p.nLinea}`) ?? []
  if (!esperadas.length) { resumen.sinAcristalamientoEnOraculo++; continue }
  const vidrio = catalogo.articulo(c.Conjunto2?.trim() ?? '')
  if (!vidrio) throw new Error('Falta vidrio de entrada en una línea contrastable')
  const r = acristalarVidrio({
    grosorMm: vidrio.grosorAcristalar, referenciaLargoMm: 1000, referenciaAnchoMm: 800,
    moduloLargoMm: 1000, moduloAnchoMm: 800, grupoIzquierdo: 'QA', grupoDerecho: 'QA',
    grupoSuperior: 'QA', grupoInferior: 'QA', tipoHoja: 'G',
  }, tabla, ['JH', 'JV'].map(grupo => ({ grupoPrincipal: 'QA', grupo, tipoHoja: 'G', mm: 0 })),
  codigo => !!catalogo.articulo(codigo))
  const codigosEsperados = [...new Set(esperadas.map(h => h.Articulo!.trim()))].sort()
  const codigosActuales = [...new Set(r.piezas.map(f => f.articulo))].sort()
  const exacta = !r.incidencias.length && !r.avisos.length
    && JSON.stringify(codigosEsperados) === JSON.stringify(codigosActuales)
  resumen.contrastadas++
  if (exacta) resumen.exactas++
  else resumen.diferentes++
  const grosor = String(vidrio.grosorAcristalar)
  const g = resumen.grosores[grosor] ??= { lineas: 0, exactas: 0, seleccion: [] }
  g.lineas++
  if (exacta) g.exactas++
  if (!g.seleccion.some(s => JSON.stringify(s) === JSON.stringify(codigosActuales))) g.seleccion.push(codigosActuales)
}
if (!resumen.contrastadas) throw new Error('Ninguna línea contrastable: no existe un contraste válido')
const fuentes = [
  ...['TAcristalamiento', 'TAcristalamientoLin', 'Articulos', 'Conjuntos'].map(n => join(origen, `${n}.csv`)),
  ...['lineas', 'configuraciones'].map(n => join(facturas, `${n}.csv`)),
].map(archivo => ({ archivo, sha256: createHash('sha256').update(readFileSync(archivo)).digest('hex') }))
console.log(JSON.stringify({ filasGM60: tabla.length, fuentes, resumen }, null, 2))
if (resumen.diferentes) process.exitCode = 1
