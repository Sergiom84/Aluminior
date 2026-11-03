/** Contraste local de los 03V estándar de 2025; el oráculo nunca alimenta el motor. */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { catalogoDesdeCsv, leerCsv } from './lib/catalogo-csv.ts'
import { crearResolvedorCotasInstancia, medidaCota } from './lib/cotas-instancia.ts'
import { clasificarHija, diferenciasPiezas, importeConPreciosFactura, type HijaFactura } from './lib/contraste-despiece-facturas.ts'
import { diagnosticarEconomia, emparejarPiezas } from './lib/diagnostico-discrepancias.ts'
import { despiezarLineaCatalogo } from '../packages/core/src/despiece/linea-catalogo/despiezar.ts'
import { redondearCentimos } from '../packages/core/src/precios/importe-fila.ts'
import type { CatalogoLinea, FilaDespieceCatalogo } from '../packages/core/src/despiece/linea-catalogo/tipos.ts'

type Fila = Record<string, string>
const salida = resolve(process.argv[2] ?? 'output/fase-8/lote4-03v')
assert.ok(salida.startsWith(resolve('output') + '/'.replace('/', process.platform === 'win32' ? '\\' : '/')))
const origen = join(salida, 'datos')
const hash = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex')
const manifestPath = resolve('output/auditoria-anuales/manifest.json')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8').replace(/^\uFEFF/, '')) as { id: string; sha256: string; source: string }[]
const fuente = manifest.filter(m => m.id === 'EMP0015-aluminio')
assert.equal(fuente.length, 1)
const copia = resolve('output/auditoria-anuales/EMP0015-aluminio/copia.mdb')
assert.equal(hash(copia), fuente[0]!.sha256.toLowerCase())
assert.equal(readFileSync(join(origen, 'fuente.sha256'), 'utf8').trim(), hash(copia))
const archivos = readdirSync(origen).filter(f => f.endsWith('.csv'))
assert.ok(archivos.length > 0)
const fuentes = archivos.map(nombre => ({ nombre, sha256: hash(join(origen, nombre)) }))
const leer = (n: string) => leerCsv(origen, n)
const n = (s: string | undefined): number => {
  const valor = medidaCota(s)
  assert.notEqual(valor, null, 'Número ausente o inválido; nunca se transforma en cero')
  return valor!
}
const unico = (filas: Fila[], contexto: string) => { assert.equal(filas.length, 1, contexto); return filas[0]! }
const lineas = leer('VPresupuestosLin'), configuraciones = leer('VDatosLinEstr')
const cabeceras = leer('VPresupuestos'), opciones = leer('VOpcionesHerraje'), conceptos = leer('MOConceptos')
const conceptosOriginales = leer('VConceptosMO'), series = leer('Conjuntos')
const resolverCotas = crearResolvedorCotasInstancia(leer('VMedidasDA'), leer('EstructurasDA'))
const candidatas = lineas.filter(p => p.EstructuraSN === 'True' && p.Articulo === '03V')
const casos = candidatas.filter(p => {
  const c = unico(configuraciones.filter(c => c.TipoDoc === 'VPRES' && c.nVDoc === p.nDoc && c.nVLinea === p.nLinea), 'Configuración de 03V única')
  return c.DisEspecificoSN === 'False'
})
assert.equal(casos.length, 3, 'El alcance acreditado son tres 03V no específicos')
const catalogos = new Map<string, CatalogoLinea>()
const detalle = casos.map(p => {
  const c = unico(configuraciones.filter(c => c.TipoDoc === 'VPRES' && c.nVDoc === p.nDoc && c.nVLinea === p.nLinea), 'Configuración única')
  const cabecera = unico(cabeceras.filter(h => h.Id === p.nDoc), 'Cabecera única')
  const tarifa = p.TarifaManualSN === 'True' ? p.Tarifa : cabecera.Tarifa
  assert.ok(tarifa?.trim(), 'La tarifa debe proceder de la cabecera o de la excepción explícita')
  let catalogo = catalogos.get(tarifa)
  if (!catalogo) { catalogo = catalogoDesdeCsv(origen, tarifa); catalogos.set(tarifa, catalogo) }
  const cotas = resolverCotas({ tipoDoc: 'VPRES', documento: p.nDoc!, linea: p.nLinea!, estructura: p.Articulo! })
  assert.equal(cotas.incidencias.length, 0)
  const entrada = { estructura: p.Articulo!, serie: c.Conjunto1!, disenoEspecifico: c.DisEspecificoSN !== 'False', anchoMm: n(p.Ancho), altoMm: n(p.Largo),
    vidrio: c.Conjunto2?.trim() || null, acabado: p.Acabado!, acabadoAccesorios: 'UNI', cotas: cotas.cotas,
    minutosFabricacionAdicionales: n(c.HorasAdFabr) * 60,
    opcionesGuardadas: opciones.filter(o => o.TipoDoc === 'VPRES' && o.nDoc === p.nDoc && o.nLinEstr === p.nLinea)
      .map(o => ({ conjunto: o.Conjunto!, opcion: String(n(o.nOpcion)), marcada: o.SelecSN === 'True' })) }
  const resultado = despiezarLineaCatalogo(catalogo, entrada)
  const originales = lineas.filter(h => h.EstructuraSN !== 'True' && h.nDoc === p.nDoc && h.nEstr === p.nLinea)
  assert.ok(originales.length > 0)
  const hijas = originales.map((h): HijaFactura => ({ articulo: h.Articulo!, funcion: h.Funcion ?? '', cantidad: n(h.Cdad),
    largoMm: n(h.LargoCorte), anchoMm: n(h.AnchoCorte), precio: n(h.Precio), importe: n(h.ImporteTotal) }))
  const clases = hijas.map(h => clasificarHija(h, catalogo!.articulo(h.articulo)?.tipoMetraje ?? null))
  const material = hijas.filter((_, i) => clases[i] === 'material')
  const materialSinMO = material.filter(h => h.articulo !== 'MO')
  const filasMotor = resultado.filas.filter(f => f.importe !== 0 || f.metraje === null)
  const motorSinMO = filasMotor.filter(f => f.origen !== 'mano-obra')
  const porMetro = (a: string) => catalogo!.articulo(a)?.tipoMetraje === 'ML'
  // Metadatos y oráculo se registran después de ejecutar el motor, nunca lo corrigen.
  const serie = unico(series.filter(s => s.Codigo === entrada.serie), 'Serie única')
  assert.ok(['GMA350', 'GMA65OPT'].includes(serie.Codigo!))
  const categoria = serie.TipoPerf === 'A' ? '00001' : serie.TipoPerf === 'C' ? '00002' : null
  assert.ok(categoria)
  const regla = unico(conceptos.filter(r => r.Categoria === categoria && (r.ComponenteAsoc === '16' || r.GrupoAsoc === 'TMP')), 'Regla TMP única')
  assert.equal(regla.CodSerie, '*'); assert.equal(regla.FamiliaAsoc, c.Familia1); assert.equal(regla.AsociadoSN, 'True')
  for (const k of ['TiempoPreparacion', 'AnchoTiempo', 'AltoTiempo', 'AnchoMayorMM', 'AltoMayorMM']) assert.equal(n(regla[k]), 0)
  const cantidad = catalogo.plantilla('03V').filter(f => f.componente === '16' && f.grupo === 'TMP').reduce((s, f) => s + f.cantidad, 0)
  assert.equal(cantidad, 2)
  const originalesMO = conceptosOriginales.filter(m => m.TipoDoc === 'VPRES' && m.nDoc === p.nDoc && m.nLin === p.nLinea)
  const minutosOriginal = material.filter(h => h.articulo === 'MO').map(h => h.cantidad).sort((a, b) => a - b)
  const minutosMotor = filasMotor.filter(f => f.origen === 'mano-obra').map(f => f.cantidad).sort((a, b) => a - b)
  const diferenciaMaterial = diferenciasPiezas(motorSinMO, materialSinMO, porMetro)
  const pares = emparejarPiezas(motorSinMO, materialSinMO, porMetro)
  const precios = pares.pares.map(({ motor: f, factura: h, economiaAmbigua }) => ({ articulo: f.articulo, acabado: f.acabado,
    pvpCatalogo: catalogo!.tarifa(f.articulo, f.acabado)?.pvp ?? null, precioOriginal: h.precio,
    importeMotor: f.importe, importeOriginal: h.importe, economiaAmbigua }))
  const sumaCompleta = (filas: FilaDespieceCatalogo[]) => filas.some(f => f.importe === null) ? null : redondearCentimos(filas.reduce((s, f) => s + f.importe!, 0))
  return { documento: p.nDoc, linea: p.nLinea, cabecera, origenAnual: 'EMP0015 (2025)', tarifa, entrada, cotas, padre: p, configuracion: c,
    originales: originales.map((fila, i) => ({ fila, clase: clases[i] })), conceptosOriginales: originalesMO,
    motor: resultado, diferenciaMaterial, diferenciasIncluyendoMO: diferenciasPiezas(filasMotor, material, porMetro), precios,
    economia: diagnosticarEconomia(motorSinMO, materialSinMO, porMetro, catalogo.tarifa),
    manoObra: { categoria, regla, cantidad, minutosOriginal, minutosMotor,
      minutosCoinciden: JSON.stringify(minutosOriginal) === JSON.stringify(minutosMotor) },
    aPreciosOriginales: importeConPreciosFactura(filasMotor, material, porMetro),
    importes: { materialOriginal: redondearCentimos(material.reduce((s, h) => s + h.importe, 0)),
      materialOriginalSinMO: redondearCentimos(materialSinMO.reduce((s, h) => s + h.importe, 0)),
      filasMotorSinMO: sumaCompleta(motorSinMO), extrasOriginal: redondearCentimos(hijas.filter((_, i) => clases[i] === 'extra').reduce((s, h) => s + h.importe, 0)) } }
})
for (const f of fuentes) assert.equal(hash(join(origen, f.nombre)), f.sha256)
assert.equal(hash(copia), fuente[0]!.sha256.toLowerCase())
const resumen = { fuente: 'EMP0015-aluminio (2025)', fuenteSha256: fuente[0]!.sha256, candidatas: candidatas.length,
  especificasExcluidas: candidatas.length - casos.length, casos: detalle.map(d => ({ serie: d.entrada.serie, tarifa: d.tarifa,
    fecha: d.cabecera.Fecha, medidas: [d.entrada.anchoMm, d.entrada.altoMm], piezasMaterialCoinciden: !d.diferenciaMaterial.length,
    diferenciasMaterial: d.diferenciaMaterial, importeMotor: d.motor.importe, incidenciasMotor: d.motor.incidencias,
    minutosCoinciden: d.manoObra.minutosCoinciden, piezasConMOCoinciden: !d.diferenciasIncluyendoMO.length,
    aPreciosOriginales: d.aPreciosOriginales,
    ...d.importes, diferenciasPrecio: d.precios.filter(p => p.pvpCatalogo === null || Math.abs(p.pvpCatalogo - p.precioOriginal) > 1e-4).length })) }
mkdirSync(salida, { recursive: true })
writeFileSync(join(salida, 'contraste.json'), JSON.stringify({ manifest: { ruta: manifestPath, sha256: hash(manifestPath) }, fuente, fuentes, detalle, resumen }, null, 2))
writeFileSync(join(salida, 'resumen.json'), JSON.stringify(resumen, null, 2))
console.log(JSON.stringify(resumen, null, 2))
assert.ok(detalle.every(d => d.manoObra.minutosCoinciden && !d.diferenciasIncluyendoMO.length
  && !d.motor.incidencias.length && d.motor.importe !== null), 'Debe reproducir los tres despieces completos y minutos')
const mismosImportes = detalle.filter(d => Math.round(d.motor.importe! * 100) === Math.round(d.importes.materialOriginal * 100))
assert.equal(mismosImportes.length, 2, 'Dos casos deben coincidir con sus tarifas de la base anual')
const discrepantes = detalle.filter(d => !mismosImportes.includes(d))
assert.equal(discrepantes.length, 1)
assert.ok(discrepantes.every(d => d.aPreciosOriginales === d.importes.materialOriginal && !d.economia.filas.length
  && d.precios.some(p => p.pvpCatalogo !== null && Math.abs(p.pvpCatalogo - p.precioOriginal) > 1e-4)),
  'La diferencia restante debe explicarse solo por PVP documentales frente al catálogo del mismo origen')
