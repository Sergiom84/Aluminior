/**
 * Comprueba en solo lectura que la valoración web/PostgreSQL reproduce el
 * contraste CSV. No carga .env; admite exclusivamente PostgreSQL local de QA.
 *
 * npx tsx scripts/verificar-motor-catalogo-db.ts <facturas> <detalle.json> <base_test>
 *
 * Solo imprime agregados. Los importes nulos se cuentan aparte: coincidir en
 * un bloqueo no demuestra que una línea sea valorable. Horas manuales quedan
 * fuera porque no forman parte de la entrada de valorarEstructura.
 */
import { readFileSync } from 'node:fs'
import { crearDb } from '../packages/db/src/index.ts'
import { urlDePruebasValidada } from '../packages/db/src/pruebas.ts'
import { valorarEstructura } from '../packages/web/app/dashboard/presupuestos/_lib/estructuras/valorar-estructura.ts'
import { leerCsv, numero } from './lib/catalogo-csv.ts'

interface Contraste {
  documento: string; linea: string; familia: string; importe: number | null
  cotas?: Record<string, number>
  estadoCotas?: 'valida' | 'sin-entrada' | 'invalida'
}
const [facturas, rutaDetalle, base] = process.argv.slice(2)
if (!facturas || !rutaDetalle || !base || !/^[a-z0-9_]+_test$/.test(base)) {
  throw new Error('Uso: <carpeta facturas> <detalle.json> <base_test>; solo PostgreSQL local de QA en 55433')
}
const detalle: Contraste[] = JSON.parse(readFileSync(rutaDetalle, 'utf8'))
if (!Array.isArray(detalle) || !detalle.length) throw new Error('El contraste no contiene líneas')
const lineas = new Map(leerCsv(facturas, 'lineas').map(l => [`${l.nDoc}|${l.nLinea}`, l]))
const configuraciones = new Map(leerCsv(facturas, 'configuraciones').map(c => [`${c.nVDoc}|${c.nVLinea}`, c]))
const opciones = leerCsv(facturas, 'opciones_herraje')
const db = crearDb(urlDePruebasValidada(`postgres://aluminior:aluminior@localhost:55433/${base}`))
try {
  const porDefecto = (await db.$client`SELECT conjunto_codigo, opcion_codigo FROM opciones_herraje WHERE por_defecto AND NOT oculta`)
    .map(o => `${o.conjunto_codigo}|${o.opcion_codigo}`)
  let importesIguales = 0, bloqueosIguales = 0, rechazadasWebSinImporte = 0, distintos = 0, omitidasManual = 0
  const diferencias: Record<string, number> = {}
  for (const d of detalle) {
    const k = `${d.documento}|${d.linea}`, p = lineas.get(k), c = configuraciones.get(k)
    if (!p || !c || !(d.importe === null || Number.isFinite(d.importe))) throw new Error('Entrada de contraste inválida o sin configuración')
    if (d.estadoCotas === 'invalida') throw new Error('Cotas CSV inválidas: no son una entrada comparable con la web')
    if (numero(c.HorasAdFabr) !== 0) { omitidasManual++; continue }
    const guardadas = opciones.filter(o => o.nDoc === p.nDoc && o.nLinEstr === p.nLinea)
    const r = await valorarEstructura(db, {
      codigo: p.Articulo!, serieCodigo: c.Conjunto1!, anchoMm: numero(p.Ancho), altoMm: numero(p.Largo),
      vidrioCodigo: c.Conjunto2 || null, varianteAcristalamiento: '2', acabadoCodigo: p.Acabado!, tarifa: 1,
      cotas: d.cotas,
      opcionesHerraje: guardadas.length
        ? guardadas.filter(o => o.SelecSN === 'True').map(o => `${o.Conjunto}|${o.nOpcion}`) : porDefecto,
    })
    if (!r.ok && d.importe === null) rechazadasWebSinImporte++
    else if (r.ok && r.precioUnitario === null && d.importe === null) bloqueosIguales++
    else if (r.ok && r.precioUnitario !== null && d.importe !== null &&
      Math.round(r.precioUnitario * 100) === Math.round(d.importe * 100)) importesIguales++
    else { distintos++; diferencias[d.familia] = (diferencias[d.familia] ?? 0) + 1 }
  }
  console.log({ comparadas: importesIguales + bloqueosIguales + rechazadasWebSinImporte + distintos,
    importesIguales, bloqueosIguales, rechazadasWebSinImporte, distintos, omitidasManual, diferencias })
  if (distintos) process.exitCode = 1
} finally {
  await db.$client.end({ timeout: 5 })
}
