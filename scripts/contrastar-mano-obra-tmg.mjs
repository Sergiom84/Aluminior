/**
 * Corroboración independiente del tiempo por TMG sobre presupuestos no específicos.
 * Solo lectura de CSV; no carga .env ni conecta a bases ni imprime identificadores.
 * Uso: node --import tsx scripts/contrastar-mano-obra-tmg.mjs <catálogo CSV>
 */
import assert from 'node:assert/strict'
import { catalogoDesdeCsv, leerCsv, numero } from './lib/catalogo-csv.ts'
import { minutosFabricacion } from '../packages/core/src/despiece/mano-obra-fabricacion.ts'
import { clavesTipoHoja, esTipoHojaMarco } from '../packages/core/src/despiece/asociaciones/index.ts'

const [origen] = process.argv.slice(2)
if (!origen) throw new Error('Indica la carpeta del catálogo CSV')
const catalogo = catalogoDesdeCsv(origen)
const lineas = leerCsv(origen, 'VPresupuestosLin')
const configuraciones = new Map(leerCsv(origen, 'VDatosLinEstr').filter(c => c.TipoDoc === 'VPRES').map(c => [`${c.nVDoc}|${c.nVLinea}`, c]))
const hijas = new Map()
for (const h of lineas.filter(h => h.Articulo === 'MO')) {
  const k = `${h.nDoc}|${h.nEstr}`
  hijas.set(k, [...(hijas.get(k) ?? []), h])
}
const resumen = { casos: 0, conAjusteManual: 0, ajusteFraccionario: 0, familias: {} }
for (const p of lineas.filter(p => p.EstructuraSN === 'True')) {
  const c = configuraciones.get(`${p.nDoc}|${p.nLinea}`)
  if (!c || c.DisEspecificoSN === 'True') continue
  const plantilla = catalogo.plantilla(p.Articulo)
  if (!plantilla.some(f => f.grupo === 'TMG')) continue
  const serie = catalogo.serie(c.Conjunto1)
  if (!serie) continue
  const resultado = minutosFabricacion({
    elementos: plantilla.map(f => ({ modulo: f.funcion === 'infMOmof' ? f.disVidrio : null,
      articuloPlantilla: f.articulo, componente: f.componente, grupo: f.grupo, cantidad: f.cantidad })),
    conceptos: catalogo.conceptosManoObra(),
    conceptosApertura: [...new Set(plantilla.filter(f => !esTipoHojaMarco(f.tipoHoja))
      .map(f => clavesTipoHoja(catalogo.nombreTipoHoja(f.tipoHoja))?.manoObra)
      .map(k => serie.manoObra[k]).filter(Boolean))],
  })
  const esperado = (hijas.get(`${p.nDoc}|${p.nLinea}`) ?? []).map(h => numero(h.Cdad))
  const calculado = resultado.lineas.map(f => f.minutos)
  const ajuste = numero(c.HorasAdFabr) * 60
  if (ajuste > 0) {
    calculado.push(ajuste)
    resumen.conAjusteManual++
    if (!Number.isInteger(ajuste)) resumen.ajusteFraccionario++
  }
  assert.deepEqual(resultado.incidencias, [], 'El cálculo no debe conservar asociaciones pendientes')
  assert.deepEqual(calculado.sort((a, b) => a - b), esperado.sort((a, b) => a - b), 'Las aportaciones de minutos deben coincidir sin agrupar filas')
  const familia = `${c.Conjunto1}|${p.Articulo}`
  resumen.familias[familia] = (resumen.familias[familia] ?? 0) + 1
  resumen.casos++
}
assert.ok(resumen.casos > 0, 'El contraste debe encontrar presupuestos con TMG')
console.log(JSON.stringify(resumen, null, 2))
