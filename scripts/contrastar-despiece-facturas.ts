/**
 * Contraste independiente del motor de despiece con las facturas exportadas.
 *
 * Uso (solo lectura; no carga .env ni conecta a bases):
 *   npx tsx scripts/contrastar-despiece-facturas.ts <catálogo CSV> <carpeta facturas> [salida]
 * Ejemplo:
 *   npx tsx scripts/contrastar-despiece-facturas.ts export_datos/EMP0016 output/facturas-2026 output/contraste-motor
 *
 * Las entradas del motor son las de la línea (estructura, serie, medidas,
 * vidrio, acabado y opciones guardadas). El despiece guardado solo se usa para
 * comparar. En consola solo se imprimen agregados; el detalle por línea va a
 * la carpeta de salida, que debe estar ignorada por Git.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { despiezarLineaCatalogo } from '../packages/core/src/despiece/linea-catalogo/despiezar.ts'
import { catalogoDesdeCsv, leerCsv, numero } from './lib/catalogo-csv.ts'
import {
  clasificarHija, diferenciasPiezas, importeConPreciosFactura, type HijaFactura,
} from './lib/contraste-despiece-facturas.ts'

const [origen, facturas, salida] = process.argv.slice(2)
if (!origen || !facturas) throw new Error('Indica la carpeta del catálogo CSV y la de facturas exportadas')
const catalogo = catalogoDesdeCsv(origen)
const lineas = leerCsv(facturas, 'lineas')
const configuraciones = new Map(leerCsv(facturas, 'configuraciones').map(c => [`${c.nVDoc}|${c.nVLinea}`, c]))
const opciones = leerCsv(facturas, 'opciones_herraje')
const hijasDe = new Map<string, typeof lineas>()
for (const h of lineas) {
  if (h.EstructuraSN === 'True') continue
  const k = `${h.nDoc}|${h.nEstr}`
  hijasDe.set(k, [...(hijasDe.get(k) ?? []), h])
}
const porMetro = (a: string) => catalogo.articulo(a)?.tipoMetraje === 'ML'

type Estado = 'exacta' | 'piezas-exactas-tarifa' | 'piezas-exactas-importe' | 'bloqueada' | 'diferente'
interface Resumen { n: number; especificas: number; estados: Record<Estado, number>; causas: Map<string, number>; extras: number; avisos: number }
const resumen = new Map<string, Resumen>()
const detalle: unknown[] = []

for (const p of lineas.filter(l => l.EstructuraSN === 'True')) {
  const c = configuraciones.get(`${p.nDoc}|${p.nLinea}`)
  const serie = c?.Conjunto1?.trim()
  if (!serie || !catalogo.serie(serie)) continue
  const familia = `${serie}|${p.Articulo}`
  const r = resumen.get(familia) ?? { n: 0, especificas: 0, estados: { exacta: 0, 'piezas-exactas-tarifa': 0, 'piezas-exactas-importe': 0, bloqueada: 0, diferente: 0 }, causas: new Map(), extras: 0, avisos: 0 }
  resumen.set(familia, r)
  r.n++
  if (c!.DisEspecificoSN === 'True') { r.especificas++; continue }

  const hijas: HijaFactura[] = (hijasDe.get(`${p.nDoc}|${p.nLinea}`) ?? []).filter(h => h.nLinea !== p.nLinea).map(h => ({
    articulo: h.Articulo!.trim(), funcion: h.Funcion?.trim() ?? '', cantidad: numero(h.Cdad), largoMm: numero(h.LargoCorte),
    anchoMm: numero(h.AnchoCorte), importe: numero(h.ImporteTotal), precio: numero(h.Precio),
  }))
  const clases = hijas.map(h => clasificarHija(h, catalogo.articulo(h.articulo)?.tipoMetraje ?? null))
  const material = hijas.filter((_, i) => clases[i] === 'material')
  if (clases.includes('extra')) r.extras++
  if (clases.includes('aviso')) r.avisos++
  const oraculo = Math.round(material.reduce((s, h) => s + h.importe, 0) * 100) / 100

  const resultado = despiezarLineaCatalogo(catalogo, {
    estructura: p.Articulo!.trim(), serie, anchoMm: numero(p.Ancho), altoMm: numero(p.Largo),
    vidrio: c!.Conjunto2?.trim() || null, acabado: p.Acabado!.trim(), acabadoAccesorios: 'UNI',
    opcionesGuardadas: opciones.filter(o => o.nDoc === p.nDoc && o.nLinEstr === p.nLinea)
      .map(o => ({ conjunto: o.Conjunto!.trim(), opcion: String(numero(o.nOpcion)), marcada: o.SelecSN === 'True' })),
    minutosFabricacionAdicionales: Math.round(numero(c!.HorasAdFabr) * 60),
  })
  const filasMaterial = resultado.filas.filter(f => f.importe !== 0 || f.metraje === null)
  const dif = diferenciasPiezas(filasMaterial, material, porMetro)
  let estado: Estado
  if (resultado.importe === null) {
    estado = 'bloqueada'
    for (const i of resultado.incidencias) {
      const causa = i.replace(/\d+(\.\d+)?/g, 'n')
      r.causas.set(causa, (r.causas.get(causa) ?? 0) + 1)
    }
  } else if (!dif.length && Math.abs(resultado.importe - oraculo) < 0.015) estado = 'exacta'
  else if (!dif.length) {
    const conFactura = importeConPreciosFactura(filasMaterial, material)
    estado = conFactura !== null && Math.abs(conFactura - oraculo) < 0.015 ? 'piezas-exactas-tarifa' : 'piezas-exactas-importe'
  } else {
    estado = 'diferente'
    for (const d of dif.slice(0, 6)) {
      const causa = d.replace(/\|[\d.-]+$/, '|L')
      r.causas.set(causa, (r.causas.get(causa) ?? 0) + 1)
    }
  }
  r.estados[estado]++
  detalle.push({ documento: p.nDoc, linea: p.nLinea, familia, estado, importe: resultado.importe, oraculo,
    incidencias: resultado.incidencias, avisos: resultado.avisos, diferencias: dif })
}

const total = { lineas: 0, especificas: 0, exacta: 0, 'piezas-exactas-tarifa': 0, 'piezas-exactas-importe': 0, bloqueada: 0, diferente: 0 }
for (const [familia, r] of [...resumen].sort((a, b) => b[1].n - a[1].n)) {
  total.lineas += r.n; total.especificas += r.especificas
  for (const [k, v] of Object.entries(r.estados)) total[k as Estado] += v
  const causas = [...r.causas].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => `${v}× ${k}`).join(' · ')
  const e = r.estados
  console.log(`${familia}: ${r.n} (esp ${r.especificas}) exactas ${e.exacta}, tarifa ${e['piezas-exactas-tarifa']}, importe ${e['piezas-exactas-importe']}, bloq ${e.bloqueada}, dif ${e.diferente}${causas ? ' | ' + causas : ''}`)
}
console.log('TOTAL', JSON.stringify(total))
if (salida) {
  mkdirSync(salida, { recursive: true })
  writeFileSync(join(salida, 'detalle.json'), JSON.stringify(detalle, null, 1))
  writeFileSync(join(salida, 'resumen.json'), JSON.stringify({ total, familias: Object.fromEntries([...resumen].map(([k, r]) => [k, { ...r, causas: Object.fromEntries(r.causas) }])) }, null, 1))
}
