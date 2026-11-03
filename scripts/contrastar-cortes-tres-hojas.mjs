/**
 * Contrasta 3HO/ELEGANTPVC no específicas: materiales, ambos ejes y mano de obra.
 * Solo CSV locales; no carga .env ni conecta a bases. Imprime agregados sin
 * identificadores. Uso: node --import tsx scripts/contrastar-cortes-tres-hojas.mjs
 *   <catálogo CSV> <facturas CSV>
 */
import assert from 'node:assert/strict'
import { catalogoDesdeCsv, leerCsv, numero } from './lib/catalogo-csv.ts'
import { despiezarLineaCatalogo } from '../packages/core/src/despiece/linea-catalogo/despiezar.ts'
import { clasificarHija } from './lib/contraste-despiece-facturas.ts'

const [origen, facturas] = process.argv.slice(2)
if (!origen || !facturas) throw new Error('Indica las carpetas de catálogo y facturas CSV')
const catalogo = catalogoDesdeCsv(origen)
const lineas = leerCsv(facturas, 'lineas')
const configuraciones = new Map(leerCsv(facturas, 'configuraciones').map(c => [`${c.nVDoc}|${c.nVLinea}`, c]))
const opciones = leerCsv(facturas, 'opciones_herraje')
const padres = lineas.filter(p => {
  const c = configuraciones.get(`${p.nDoc}|${p.nLinea}`)
  return p.EstructuraSN === 'True' && p.Articulo === '3HO' && c?.Conjunto1 === 'ELEGANTPVC' && c.DisEspecificoSN === 'False'
})
assert.ok(padres.length > 0, 'El contraste debe encontrar líneas 3HO no específicas')
// Precisión explícita del contraste de piezas; el residuo sin redondeo se informa.
const decima = n => Math.round(n * 10) / 10
const clave = f => {
  const tipo = catalogo.articulo(f.articulo)?.tipoMetraje
  return [f.articulo, f.cantidad, tipo === 'UD' ? null : decima(f.largoMm), tipo === 'M2' ? decima(f.anchoMm) : null].join('|')
}
const resumen = { casos: 0, filas: 0, porOrigen: {}, importesExactos: 0, dimensionesConResiduo: 0, maximoResiduoMm: 0 }
for (const p of padres) {
  const c = configuraciones.get(`${p.nDoc}|${p.nLinea}`)
  const r = despiezarLineaCatalogo(catalogo, {
    estructura: p.Articulo, serie: c.Conjunto1, anchoMm: numero(p.Ancho), altoMm: numero(p.Largo),
    vidrio: c.Conjunto2 || null, acabado: p.Acabado, acabadoAccesorios: 'UNI',
    opcionesGuardadas: opciones.filter(o => o.nDoc === p.nDoc && o.nLinEstr === p.nLinea)
      .map(o => ({ conjunto: o.Conjunto, opcion: String(numero(o.nOpcion)), marcada: o.SelecSN === 'True' })),
    minutosFabricacionAdicionales: numero(c.HorasAdFabr) * 60,
  })
  const originales = lineas.filter(h => h.nDoc === p.nDoc && h.nEstr === p.nLinea && h.nLinea !== p.nLinea)
    .map(h => ({ articulo: h.Articulo, funcion: h.Funcion, cantidad: numero(h.Cdad), largoMm: numero(h.LargoCorte),
      anchoMm: numero(h.AnchoCorte), importe: numero(h.ImporteTotal), precio: numero(h.Precio) }))
    .filter(h => clasificarHija(h, catalogo.articulo(h.articulo)?.tipoMetraje ?? null) === 'material')
  const motor = r.filas.filter(f => f.importe !== 0 || f.metraje === null)
  assert.equal(r.incidencias.length, 0, 'No debe quedar ninguna incidencia del motor')
  assert.notEqual(r.importe, null, 'La línea debe poder valorarse')
  assert.ok(motor.every(f => f.metraje !== null), 'Todas las filas deben tener metraje')
  assert.deepEqual(motor.map(clave).sort(), originales.map(clave).sort(), 'Artículo, cantidad, largo y ancho deben coincidir a la décima')
  const restantes = [...originales]
  for (const f of motor) {
    const i = restantes.findIndex(o => clave(o) === clave(f))
    const o = restantes.splice(i, 1)[0]
    const tipo = catalogo.articulo(f.articulo)?.tipoMetraje
    for (const eje of tipo === 'M2' ? ['largoMm', 'anchoMm'] : tipo === 'ML' ? ['largoMm'] : []) {
      const diferencia = Math.abs(f[eje] - o[eje])
      if (diferencia > 1e-9) resumen.dimensionesConResiduo++
      resumen.maximoResiduoMm = Math.max(resumen.maximoResiduoMm, diferencia)
    }
    resumen.porOrigen[f.origen] = (resumen.porOrigen[f.origen] ?? 0) + 1
  }
  const importeHistorico = Math.round(originales.reduce((s, f) => s + f.importe, 0) * 100)
  if (Math.round(r.importe * 100) === importeHistorico) resumen.importesExactos++
  resumen.casos++
  resumen.filas += motor.length
}
console.log(JSON.stringify(resumen, null, 2))
