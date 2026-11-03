/** Contraste CSV/PostgreSQL local, sin escrituras; no es un oráculo Productor. */
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { crearDb } from '../packages/db/src/index.ts'
import { urlDePruebasValidada } from '../packages/db/src/pruebas.ts'
import { catalogoDesdeCsv } from './lib/catalogo-csv.ts'
import { despiezarLineaCatalogo } from '../packages/core/src/despiece/linea-catalogo/despiezar.ts'
import { FIJOS_CATALOGO } from '../packages/core/src/estructuras/diseno/catalogo-fijos.ts'
import { valorarEstructura } from '../packages/web/app/dashboard/presupuestos/_lib/estructuras/valorar-estructura.ts'
import { firmaPiezasCatalogo } from './lib/firma-piezas-catalogo.ts'

const base = process.argv[2] ?? 'aluminior_real_test'
assert.match(base, /^[a-z0-9_]+_test$/)
const db = crearDb(urlDePruebasValidada(`postgres://aluminior:aluminior@localhost:55433/${base}`))
const catalogo = catalogoDesdeCsv('export_datos/EMP0016')
const casos = []
try {
  for (const p of FIJOS_CATALOGO) {
    const serie = p.familiaCodigo === '005' ? 'GMA50' : 'GMC400'
    for (const [ancho, alto] of [[p.anchoMm, p.altoMm], [p.anchoMm + 10, p.altoMm], [1500, 900]]) {
      const csv = despiezarLineaCatalogo(catalogo, { estructura: p.codigo, serie,
        anchoMm: ancho, altoMm: alto, vidrio: 'V410ACGP6', acabado: 'L',
        acabadoAccesorios: 'UNI', opcionesGuardadas: [] })
      const web = await valorarEstructura(db, { codigo: p.codigo, serieCodigo: serie,
        anchoMm: ancho, altoMm: alto, vidrioCodigo: 'V410ACGP6', acabadoCodigo: 'L',
        varianteAcristalamiento: '2', tarifa: 1 })
      assert.ok(web.ok, `${p.codigo}: el adaptador debe aceptar la configuración`)
      assert.equal(web.motor, 'catalogo')
      assert.equal(web.precioUnitario, csv.importe)
      assert.deepEqual(firmaPiezasCatalogo(web.piezas.map(f => [f.articuloCodigo, f.cantidad, f.largoCorteMm, f.anchoCorteMm])),
        firmaPiezasCatalogo(csv.filas.map(f => [f.articulo, f.cantidad, f.largoMm, f.anchoMm])), p.codigo)
      for (const incidencia of csv.incidencias) assert.ok(web.aviso?.includes(incidencia))
      if (csv.incidencias.length) assert.equal(web.precioUnitario, null)
      casos.push({ codigo: p.codigo, serie, ancho, alto, vidrio: 'V410ACGP6', acabado: 'L',
        importe: csv.importe, piezas: csv.filas.length, incidencias: csv.incidencias,
        avisos: csv.avisos, sinCoste: web.piezas.filter(f => f.costeTotal == null).length })
    }
  }
  mkdirSync('output/fase-8', { recursive: true })
  writeFileSync('output/fase-8/fijos-valoracion.json', JSON.stringify({
    alcance: 'Paridad entre lectores CSV/DB, mismo motor; no certifica resultado original ni fabricación', casos,
  }, null, 2))
  console.log({ casos: casos.length, coinciden: casos.length,
    valorados: casos.filter(c => c.importe !== null).length, bloqueados: casos.filter(c => c.importe === null).length })
} finally { await db.$client.end({ timeout: 5 }) }
