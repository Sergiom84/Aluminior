/** FI/FS: entradas documentales y bloqueos; no cambia el catálogo ni activa precio. */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { closeSync, mkdirSync, openSync, readFileSync, readSync, readdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { parse } from 'csv-parse/sync'
import { catalogoDesdeCsv, leerCsv } from './lib/catalogo-csv.ts'
import { crearResolvedorCotasInstancia, medidaCota } from './lib/cotas-instancia.ts'
import { clasificarHija, diferenciasPiezas, type HijaFactura } from './lib/contraste-despiece-facturas.ts'
import { emparejarPiezas } from './lib/diagnostico-discrepancias.ts'
import { despiezarLineaCatalogo } from '../packages/core/src/despiece/linea-catalogo/despiezar.ts'
import { medirPlantilla } from '../packages/core/src/despiece/medidas-plantilla.ts'
import { clavesTipoHoja, esTipoHojaMarco } from '../packages/core/src/despiece/asociaciones/index.ts'
import type { CatalogoLinea } from '../packages/core/src/despiece/linea-catalogo/tipos.ts'

type Fila = Record<string, string>
const salida = resolve('output/fase-8/lote5-cotas'), origen = join(salida, 'datos')
const hash = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex')
const manifestPath = resolve('output/auditoria-anuales/manifest.json')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8').replace(/^\uFEFF/, '')) as { id: string; sha256: string; source: string }[]
const fuentesAnuales = manifest.filter(m => m.id === 'EMP0016-aluminio')
assert.equal(fuentesAnuales.length, 1)
const fuente = fuentesAnuales[0]!, copia = resolve('output/auditoria-anuales/EMP0016-aluminio/copia.mdb')
assert.equal(hash(copia), fuente.sha256.toLowerCase())
for (const certificado of ['fuente.sha256', 'suplemento.sha256']) {
  assert.equal(readFileSync(join(origen, certificado), 'utf8').trim(), fuente.sha256.toLowerCase())
}
const archivos = readdirSync(origen).filter(f => f.endsWith('.csv'))
assert.ok(archivos.length > 0, 'El barrido debe descubrir CSV reales')
const fuentes = archivos.map(nombre => ({ nombre, sha256: hash(join(origen, nombre)) }))
const inventario = archivos.map(nombre => {
  const fd = openSync(join(origen, nombre), 'r'), buffer = Buffer.alloc(65536)
  let cantidad: number
  try { cantidad = readSync(fd, buffer, 0, buffer.length, 0) } finally { closeSync(fd) }
  const cabecera = buffer.subarray(0, cantidad).toString('utf8').replace(/^\uFEFF/, '').split(/\r?\n/)[0]!
  assert.ok(cabecera.length < buffer.length)
  const columnas = parse(cabecera)[0] as string[]
  return { nombre, columnas, documental: ['EstructuraSN', 'Articulo', 'nDoc', 'nLinea', 'nEstr'].every(c => columnas.includes(c)) }
})
const documentales = inventario.filter(t => t.documental)
assert.ok(documentales.length > 0, 'El barrido debe descubrir tablas documentales')
assert.deepEqual(documentales.map(t => t.nombre), ['VPresupuestosLin.csv'], 'La ausencia se limita a presupuestos extraídos')
const columnasRequeridas = {
  EstructurasDiseño: ['TipoDoc', 'nDoc', 'nLinEstr', 'Estructura', 'Id', 'PerfilAdSN'],
  VDatosLinDetDis: ['TipoDoc', 'nVDoc', 'nVLinEstr', 'DisId', 'DisIdIt', 'DisIdPerAd'],
  EstructurasArticulos: ['TipoDoc', 'Estructura', 'id', 'DisIdIt', 'DisIdPerAd'],
  VMedidasDA: ['TipoDoc', 'nDoc', 'nLinEstr', 'Estructura', 'nDA', 'Medida'],
  EstructurasDA: ['Estructura', 'nDA', 'SimboloDA', 'MedidaStd'],
}
for (const [tabla, columnas] of Object.entries(columnasRequeridas)) {
  const encontrada = inventario.find(t => t.nombre === `${tabla}.csv`)
  assert.ok(encontrada && columnas.every(c => encontrada.columnas.includes(c)), `Columnas de enlace ausentes en ${tabla}`)
}
const leer = (tabla: string) => leerCsv(origen, tabla)
const n = (v: string | undefined): number => { const r = medidaCota(v); assert.notEqual(r, null); return r! }
const unico = (filas: Fila[], contexto: string): Fila => { assert.equal(filas.length, 1, contexto); return filas[0]! }
const codigos = ['C2FI', 'C2FS', 'C2FSFI']
const lineas = leer('VPresupuestosLin'), configuraciones = leer('VDatosLinEstr'), cabeceras = leer('VPresupuestos')
const medidas = leer('VMedidasDA'), definiciones = leer('EstructurasDA'), opciones = leer('VOpcionesHerraje')
const plantillas = leer('EstructurasArticulos'), arboles = leer('EstructurasDiseño'), detalles = leer('VDatosLinDetDis')
const conceptos = leer('VConceptosMO'), perfiles = leer('SeriesPerfiles'), cotasSerie = leer('ConfigSeriesCotas')
const resolver = crearResolvedorCotasInstancia(medidas, definiciones)
const catalogos = new Map<string, CatalogoLinea>()
const presencia = Object.fromEntries(codigos.map(c => [c, lineas.filter(p => p.EstructuraSN === 'True' && p.Articulo === c).length]))
const originales = lineas.filter(p => p.EstructuraSN === 'True' && codigos.includes(p.Articulo!))
assert.equal(originales.length, 2)
const casos = originales.map(p => {
  const identidad = { tipoDoc: 'VPRES', documento: p.nDoc!, linea: p.nLinea!, estructura: p.Articulo! }
  const c = unico(configuraciones.filter(c => c.TipoDoc === identidad.tipoDoc && c.nVDoc === p.nDoc && c.nVLinea === p.nLinea), 'Configuración única')
  assert.equal(c.DisEspecificoSN, 'False')
  const cabecera = unico(cabeceras.filter(h => h.Id === p.nDoc), 'Cabecera única')
  const tarifa = p.TarifaManualSN === 'True' ? p.Tarifa : cabecera.Tarifa
  assert.ok(tarifa?.trim())
  let catalogo = catalogos.get(tarifa)
  if (!catalogo) { catalogo = catalogoDesdeCsv(origen, tarifa); catalogos.set(tarifa, catalogo) }
  const cotas = resolver(identidad)
  assert.equal(cotas.estado, 'valida'); assert.equal(cotas.incidencias.length, 0)
  for (const traza of cotas.trazas) assert.equal(traza.filasDefinicion.length, 1, 'Definición unívoca por estructura y nDA')
  const medidasOriginales = medidas.filter(m => m.TipoDoc === identidad.tipoDoc && m.nDoc === p.nDoc && m.nLinEstr === p.nLinea)
  assert.equal(new Set(medidasOriginales.map(m => [m.TipoDoc, m.nDoc, m.nLinEstr, m.Estructura, m.nDA].join('|'))).size, medidasOriginales.length)
  const entrada = { estructura: p.Articulo!, serie: c.Conjunto1!, disenoEspecifico: false,
    anchoMm: n(p.Ancho), altoMm: n(p.Largo), vidrio: c.Conjunto2?.trim() || null, acabado: p.Acabado!, acabadoAccesorios: 'UNI',
    minutosFabricacionAdicionales: n(c.HorasAdFabr) * 60,
    opcionesGuardadas: opciones.filter(o => o.TipoDoc === identidad.tipoDoc && o.nDoc === p.nDoc && o.nLinEstr === p.nLinea)
      .map(o => ({ conjunto: o.Conjunto!, opcion: String(n(o.nOpcion)), marcada: o.SelecSN === 'True' })) }
  const hijasRaw = lineas.filter(h => h.EstructuraSN !== 'True' && h.nDoc === p.nDoc && h.nEstr === p.nLinea)
  assert.ok(hijasRaw.length > 0)
  const hijas = hijasRaw.map((h): HijaFactura => ({ articulo: h.Articulo!, funcion: h.Funcion ?? '', cantidad: n(h.Cdad),
    largoMm: n(h.LargoCorte), anchoMm: n(h.AnchoCorte), precio: n(h.Precio), importe: n(h.ImporteTotal) }))
  const clases = hijas.map(h => clasificarHija(h, catalogo!.articulo(h.articulo)?.tipoMetraje ?? null))
  const material = hijas.filter((h, i) => clases[i] === 'material' && h.articulo !== 'MO')
  const porMetro = (a: string) => catalogo!.articulo(a)?.tipoMetraje === 'ML'
  const plantilla = catalogo.plantilla(p.Articulo!).filter(f => f.id !== 0)
  const medibles = plantilla.map(f => ({ ...f, tipoHoja: esTipoHojaMarco(f.tipoHoja) ? 'G'
    : clavesTipoHoja(catalogo!.nombreTipoHoja(f.tipoHoja!))?.descuento ?? 'G' }))
  const variantes = [false, true].map(conCotas => {
    const resultado = despiezarLineaCatalogo(catalogo!, { ...entrada, cotas: conCotas ? cotas.cotas : {} })
    const filas = resultado.filas.filter(f => f.origen !== 'mano-obra' && (f.importe !== 0 || f.metraje === null))
    const parejas = emparejarPiezas(filas, material, porMetro)
    const medidasMotor = medirPlantilla(medibles, catalogo!.descuentos(entrada.serie),
      { ...(conCotas ? cotas.cotas : {}), A: entrada.anchoMm, L: entrada.altoMm })
    return { conCotas, resultado, materialOriginal: material.length, materialMotor: filas.length,
      diferencias: diferenciasPiezas(filas, material, porMetro), paresExactos: parejas.pares.length,
      piezasSoloMotor: parejas.soloMotor, piezasSoloOriginal: parejas.soloFactura,
      medidas: [...medidasMotor].map(([id, m]) => ({ id, ...m })),
      bloqueosMO: resultado.incidencias.filter(i => i.startsWith('mano de obra')),
      bloqueosMaterial: resultado.incidencias.filter(i => !i.startsWith('mano de obra')) }
  })
  const raw = plantillas.filter(f => !f.TipoDoc?.trim() && f.Estructura === p.Articulo)
  const arbolCatalogo = arboles.filter(f => !f.TipoDoc?.trim() && f.Estructura === p.Articulo)
  const arbolInstancia = arboles.filter(f => f.TipoDoc === identidad.tipoDoc && f.nDoc === p.nDoc && f.nLinEstr === p.nLinea)
  const detalleInstancia = detalles.filter(f => f.TipoDoc === identidad.tipoDoc && f.nVDoc === p.nDoc && f.nVLinEstr === p.nLinea)
  const adicionales = raw.filter(f => ![0, -1].includes(n(f.DisIdPerAd))).map(f => {
    // DisId coincide con el ID de plantilla. DisIdIt identifica otra agrupación y no se usa como sustituto.
    const detalleOriginal = unico(detalleInstancia.filter(d => d.DisId === f.id), 'Detalle único por instancia y DisId de plantilla')
    for (const campo of ['DisIdIt', 'DisIdPerAd', 'DisGrupo', 'DisIdRefLargo', 'DisFRefLargo']) assert.equal(detalleOriginal[campo], f[campo])
    return { plantilla: f, detalleOriginal,
      limite: 'Coincidencias de IDs observadas; no autorizan interpretar DisIdPerAd como selección ni retirar el bloqueo.',
      coincidenciasIdArbolCatalogo: arbolCatalogo.filter(a => a.Id === f.DisIdPerAd),
      coincidenciasIdArbolInstancia: arbolInstancia.filter(a => a.Id === f.DisIdPerAd),
      coincidenciasIdPlantilla: raw.filter(a => a.id === f.DisIdPerAd) }
  })
  return { identidad, cabecera, tarifa, configuracion: c, entrada, medidasOriginales, cotas,
    definiciones: definiciones.filter(d => d.Estructura === p.Articulo), variantes, adicionales,
    plantilla: raw, arbolCatalogo, arbolInstancia, detalleInstancia,
    conceptosOriginales: conceptos.filter(m => m.TipoDoc === identidad.tipoDoc && m.nDoc === p.nDoc && m.nLin === p.nLinea),
    perfilesSerie: perfiles.filter(s => s.Serie === entrada.serie), cotasSerie: cotasSerie.filter(s => s.Serie === entrada.serie),
    hijasOriginales: hijasRaw.map((fila, i) => ({ fila, clase: clases[i] })) }
})
const modelosSinOriginal = codigos.filter(c => presencia[c] === 0).map(codigo => ({ codigo,
  definiciones: definiciones.filter(d => d.Estructura === codigo),
  medidasEnTabla: medidas.filter(m => m.Estructura === codigo),
  plantilla: plantillas.filter(p => !p.TipoDoc?.trim() && p.Estructura === codigo),
  arbol: arboles.filter(a => !a.TipoDoc?.trim() && a.Estructura === codigo) }))
const manualRuta = resolve('output/investigacion-fuentes/manual/5_1_2_12_4_perfiles_adicionale.htm')
const manual = { ruta: manualRuta, sha256: hash(manualRuta),
  limite: 'Describe selección de perfiles y cotas propias; no documenta la clave DisIdPerAd ni su algoritmo.' }
const resumen = { fuente: fuente.id, ejercicio: 2026, csv: archivos.length, tablasDocumentales: documentales.map(t => t.nombre),
  alcanceAusencia: 'Solo VPresupuestosLin de esta extracción', filasPresupuesto: lineas.length, presencia,
  casos: casos.map(c => ({ modelo: c.identidad.estructura, serie: c.entrada.serie, cotas: c.cotas.cotas,
    definicionesUnicas: c.cotas.trazas.every(t => t.filasDefinicion.length === 1),
    perfilesAdicionalesDeclarados: c.adicionales.map(a => ({ idPlantilla: a.plantilla.id, DisIdPerAd: a.plantilla.DisIdPerAd,
      idsCatalogoCoincidentes: a.coincidenciasIdArbolCatalogo.map(n => n.Id),
      perfilAdCatalogo: a.coincidenciasIdArbolCatalogo.map(n => n.PerfilAdSN),
      DisIdDetalle: a.detalleOriginal.DisId, DisIdItDetalle: a.detalleOriginal.DisIdIt })),
    variantes: c.variantes.map(v => ({ conCotas: v.conCotas, importe: v.resultado.importe, paresExactos: v.paresExactos,
      materialOriginal: v.materialOriginal, materialMotor: v.materialMotor, diferencias: v.diferencias,
      variablesFIAusentes: v.bloqueosMaterial.filter(i => i.includes('Variable "FI"')).length,
      piezasAdicionalesBloqueadas: v.bloqueosMaterial.filter(i => i.includes('perfil adicional pendiente')).length,
      bloqueosMO: v.bloqueosMO, bloqueosMaterial: v.bloqueosMaterial })) })) }
for (const f of fuentes) assert.equal(hash(join(origen, f.nombre)), f.sha256)
assert.equal(hash(copia), fuente.sha256.toLowerCase()); assert.equal(hash(manualRuta), manual.sha256)
mkdirSync(salida, { recursive: true })
writeFileSync(join(salida, 'investigacion.json'), JSON.stringify({ manifestSha256: hash(manifestPath), fuente, fuentes, inventario, columnasRequeridas,
  manual, casos, modelosSinOriginal, resumen }, null, 2))
writeFileSync(join(salida, 'resumen.json'), JSON.stringify(resumen, null, 2))
console.log(JSON.stringify(resumen, null, 2))
assert.deepEqual(presencia, { C2FI: 2, C2FS: 0, C2FSFI: 0 })
assert.ok(casos.every(c => c.cotas.trazas.length === 1 && c.cotas.cotas.FI !== undefined))
assert.ok(casos.some(c => c.cotas.trazas.some(t => t.medida !== n(unico(c.definiciones.filter(d =>
  d.nDA === t.nDA && d.SimboloDA === t.simbolo), 'Medida estándar enlazada por nDA y símbolo').MedidaStd))),
  'Una entrada original difiere del estándar; no sustituirla')
assert.ok(casos.every(c => c.variantes.every(v => v.resultado.importe === null)), 'El lote conserva el bloqueo económico')
assert.ok(casos.every(c => c.variantes[1]!.paresExactos > c.variantes[0]!.paresExactos), 'La entrada FI debe resolver piezas sin alimentar el motor con salidas')
assert.ok(casos.every(c => !c.variantes[1]!.bloqueosMaterial.some(i => i.includes('Variable "FI"'))
  && c.variantes[1]!.bloqueosMaterial.filter(i => i.includes('perfil adicional pendiente')).length === 3),
  'Con FI original quedan tres perfiles adicionales, nunca se borra esa guarda')
