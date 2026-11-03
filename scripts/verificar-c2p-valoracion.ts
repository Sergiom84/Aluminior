/** C2P: entradas originales conocidas; el despiece histórico se usa solo como oráculo. */
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { crearDb } from '../packages/db/src/index.ts'
import { urlDePruebasValidada } from '../packages/db/src/pruebas.ts'
import { despiezarLineaCatalogo } from '../packages/core/src/despiece/linea-catalogo/despiezar.ts'
import { valorarEstructura } from '../packages/web/app/dashboard/presupuestos/_lib/estructuras/valorar-estructura.ts'
import { catalogoDesdeCsv, leerCsv, numero } from './lib/catalogo-csv.ts'
import { clasificarHija, diferenciasPiezas, type HijaFactura } from './lib/contraste-despiece-facturas.ts'
import { firmaPiezasCatalogo } from './lib/firma-piezas-catalogo.ts'

const base = process.argv[2] ?? 'aluminior_real_test'
assert.match(base, /^[a-z0-9_]+_test$/)
const catalogo = catalogoDesdeCsv('export_datos/EMP0016')
const carpeta = 'output/facturas-2026'
const lineas = leerCsv(carpeta, 'lineas'), configuraciones = leerCsv(carpeta, 'configuraciones')
const opciones = leerCsv(carpeta, 'opciones_herraje')
const descubiertas = lineas.filter(l => l.EstructuraSN === 'True' && l.Articulo?.trim() === 'C2P')
assert.ok(descubiertas.every(p => configuraciones.some(c => c.nVDoc === p.nDoc && c.nVLinea === p.nLinea)))
const originales = descubiertas.filter(p => configuraciones.find(c => c.nVDoc === p.nDoc && c.nVLinea === p.nLinea)!.DisEspecificoSN !== 'True')
assert.equal(originales.length, 4, 'Cambió el alcance original: revisar procedencia antes de acreditar casos')
const db = crearDb(urlDePruebasValidada(`postgres://aluminior:aluminior@localhost:55433/${base}`))
const casos = []
try {
  const porDefecto = (await db.$client`SELECT conjunto_codigo, opcion_codigo FROM opciones_herraje WHERE por_defecto AND NOT oculta`)
    .map(o => `${o.conjunto_codigo}|${o.opcion_codigo}`)
  for (const p of originales) {
    const c = configuraciones.find(c => c.nVDoc === p.nDoc && c.nVLinea === p.nLinea)
    assert.ok(c && c.DisEspecificoSN !== 'True' && numero(c.HorasAdFabr) === 0)
    const guardadas = opciones.filter(o => o.nDoc === p.nDoc && o.nLinEstr === p.nLinea)
    const entrada = { estructura: 'C2P', serie: c.Conjunto1!.trim(), anchoMm: numero(p.Ancho),
      altoMm: numero(p.Largo), vidrio: c.Conjunto2?.trim() || null, acabado: p.Acabado!.trim(),
      acabadoAccesorios: 'UNI', opcionesGuardadas: guardadas.map(o => ({
        conjunto: o.Conjunto!, opcion: String(numero(o.nOpcion)), marcada: o.SelecSN === 'True',
      })) }
    const csv = despiezarLineaCatalogo(catalogo, entrada)
    const hijas: HijaFactura[] = lineas.filter(h => h.nDoc === p.nDoc && h.nEstr === p.nLinea &&
      h.nLinea !== p.nLinea && h.EstructuraSN !== 'True').map(h => ({ articulo: h.Articulo!.trim(),
        funcion: h.Funcion?.trim() ?? '', cantidad: numero(h.Cdad), largoMm: numero(h.LargoCorte),
        anchoMm: numero(h.AnchoCorte), importe: numero(h.ImporteTotal), precio: numero(h.Precio) }))
    const material = hijas.filter(h => clasificarHija(h, catalogo.articulo(h.articulo)?.tipoMetraje ?? null) === 'material')
    assert.ok(material.length > 0)
    const diferencias = diferenciasPiezas(csv.filas.filter(f => f.importe !== 0 || f.metraje === null),
      material, a => catalogo.articulo(a)?.tipoMetraje === 'ML')
    const oraculo = Math.round(material.reduce((s,h) => s+h.importe, 0)*100)/100
    assert.deepEqual(diferencias, [])
    assert.equal(csv.importe, oraculo)
    const web = await valorarEstructura(db, { codigo: 'C2P', serieCodigo: entrada.serie,
      anchoMm: entrada.anchoMm, altoMm: entrada.altoMm, vidrioCodigo: entrada.vidrio,
      acabadoCodigo: entrada.acabado, varianteAcristalamiento: '2', tarifa: 1,
      opcionesHerraje: guardadas.length ? guardadas.filter(o => o.SelecSN === 'True')
        .map(o => `${o.Conjunto}|${o.nOpcion}`) : porDefecto })
    assert.ok(web.ok)
    assert.equal(web.motor, 'catalogo')
    assert.equal(web.precioUnitario, oraculo)
    assert.deepEqual(firmaPiezasCatalogo(web.piezas.map(f => [f.articuloCodigo, f.cantidad, f.largoCorteMm, f.anchoCorteMm])),
      firmaPiezasCatalogo(csv.filas.map(f => [f.articulo, f.cantidad, f.largoMm, f.anchoMm])))
    casos.push({ codigo: 'C2P', documento: p.nDoc, linea: p.nLinea, entrada,
      importeOriginal: oraculo, importeCsv: csv.importe, importeWeb: web.precioUnitario,
      piezas: web.piezas.length, diferencias, aviso: web.aviso,
      sinCoste: web.piezas.filter(f => f.costeTotal == null).length })
  }
  mkdirSync('output/fase-8', { recursive: true })
  writeFileSync('output/fase-8/c2p-valoracion.json', JSON.stringify({
    alcance: 'Cuatro configuraciones originales no específicas; precio material y piezas, no todos los conceptos de factura ni fabricación',
    descubiertas: descubiertas.length, especificasExcluidas: descubiertas.length - originales.length, casos,
  }, null, 2))
  console.log({ descubiertas: descubiertas.length, especificasExcluidas: descubiertas.length - originales.length,
    casos: casos.length, exactos: casos.length, importes: casos.map(c=>c.importeWeb),
    limite: 'Las coincidencias no completan costes ni acreditan fabricación' })
} finally { await db.$client.end({ timeout: 5 }) }
