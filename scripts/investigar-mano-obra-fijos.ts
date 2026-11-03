/** Investigación local de fuentes. No escribe catálogo, DB, motor ni originales. */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { closeSync, mkdirSync, openSync, readFileSync, readSync, readdirSync, writeFileSync } from 'node:fs'
import { basename, join, relative, resolve } from 'node:path'
import { parse } from 'csv-parse/sync'
import { catalogoDesdeCsv, leerCsv } from './lib/catalogo-csv.ts'
import { despiezarLineaCatalogo } from '../packages/core/src/despiece/linea-catalogo/despiezar.ts'
import { minutosFabricacion } from '../packages/core/src/despiece/mano-obra-fabricacion.ts'
import { clavesTipoHoja } from '../packages/core/src/despiece/asociaciones/index.ts'
import { FIJOS_CATALOGO } from '../packages/core/src/estructuras/diseno/catalogo-fijos.ts'
import { multiplicarDecimal } from '../packages/core/src/precios/decimal.ts'

type Fila = Record<string, string>
const origen = resolve(process.argv[2] ?? 'export_datos/EMP0016')
const manual = resolve(process.argv[3] ?? 'output/investigacion-fuentes/manual')
const salida = resolve('output/fase-8/lote3-mo')
const hash = (ruta: string) => createHash('sha256').update(readFileSync(ruta)).digest('hex')
const fuentes = new Map<string, { ruta: string; sha256: string; filas?: number }>()
function fuente(ruta: string, filas?: number) {
  const sha256 = hash(ruta), previa = fuentes.get(ruta)
  if (previa) assert.equal(sha256, previa.sha256, 'La fuente cambió durante la lectura')
  fuentes.set(ruta, { ruta: relative(process.cwd(), ruta).replaceAll('\\', '/'), sha256, ...(filas === undefined ? {} : { filas }) })
}
function leer(nombre: string): Fila[] {
  const filas = leerCsv(origen, nombre)
  fuente(join(origen, `${nombre}.csv`), filas.length)
  return filas
}
function numero(valor: string | undefined): number {
  assert.ok(valor !== undefined && valor.trim() !== '', 'Un número requerido no puede convertirse de ausencia a cero')
  const resultado = Number(valor.replace(',', '.'))
  assert.ok(Number.isFinite(resultado), 'Número inválido en la fuente')
  return resultado
}
const opcional = (valor: string | undefined) => valor?.trim() ? numero(valor) : null
function archivos(raiz: string): string[] {
  return readdirSync(raiz, { withFileTypes: true }).flatMap(e => e.isDirectory()
    ? archivos(join(raiz, e.name)) : e.isFile() ? [join(raiz, e.name)] : [])
}
const csv = archivos(origen).filter(r => /\.csv$/i.test(r))
assert.ok(csv.length > 0, 'El barrido debe encontrar archivos CSV')
for (const ruta of csv) fuente(ruta)
// Lee la cabecera de TODOS los CSV encontrados; la lista documental no es manual.
const inventario = csv.map(ruta => {
  const fd = openSync(ruta, 'r'), buffer = Buffer.alloc(65536)
  let leidos = 0
  try { leidos = readSync(fd, buffer, 0, buffer.length, 0) } finally { closeSync(fd) }
  const texto = buffer.subarray(0, leidos).toString('utf8').replace(/^\uFEFF/, '')
  const cabecera = texto.split(/\r?\n/)[0]!
  assert.ok(cabecera.length < buffer.length, 'Cabecera demasiado larga')
  const columnas = parse(cabecera)[0] as string[]
  return { ruta, columnas, documental: ['EstructuraSN', 'Articulo', 'nDoc', 'nLinea', 'nEstr'].every(c => columnas.includes(c)) }
})
const documentales = inventario.filter(t => t.documental)
assert.ok(documentales.length > 0, 'Deben existir tablas documentales en el barrido')
const tablas = documentales.map(t => {
  const filas = parse(readFileSync(t.ruta), { columns: true, bom: true, relax_quotes: true }) as Fila[]
  fuente(t.ruta, filas.length)
  const hijas = new Map<string, Fila[]>()
  for (const f of filas) if (f.EstructuraSN !== 'True') {
    const clave = `${f.nDoc}|${f.nEstr}`
    hijas.set(clave, [...(hijas.get(clave) ?? []), f])
  }
  return { tabla: basename(t.ruta, '.csv'), filas, hijas }
})
const estructuras = leer('Estructuras'), plantillas = leer('EstructurasArticulos')
const conceptos = leer('MOConceptos'), configuraciones = leer('VDatosLinEstr')
const conceptosOriginales = leer('VConceptosMO'), conjuntos = leer('Conjuntos')
const categorias = leer('MOCategorias')
const moPorLinea = new Map<string, Fila[]>()
for (const f of conceptosOriginales) {
  const clave = `${f.TipoDoc}|${f.nDoc}|${f.nLin}`
  moPorLinea.set(clave, [...(moPorLinea.get(clave) ?? []), f])
}
const porConfiguracion = new Map<string, Fila[]>()
for (const c of configuraciones) {
  const clave = `${c.TipoDoc}|${c.nVDoc}|${c.nVLinea}`
  porConfiguracion.set(clave, [...(porConfiguracion.get(clave) ?? []), c])
}
// Un tipo documental sin relación acreditada no se empareja por coincidencia de ID.
const tipos: Record<string, string> = { VPresupuestosLin: 'VPRES', VAlbaranesLin: 'VALB', VFacturasLin: 'VFAC' }
const catalogo = catalogoDesdeCsv(origen)
const codigos = new Set(FIJOS_CATALOGO.map(p => p.codigo))
assert.equal(codigos.size, 6)
const coincide = (c: Fila, f: Fila) => ({
  componente: !!c.ComponenteAsoc && c.ComponenteAsoc !== '!' && c.ComponenteAsoc === f.DisComponente,
  grupo: !!c.GrupoAsoc && c.GrupoAsoc !== '!' && c.GrupoAsoc === f.DisGrupo,
})
const seleccion = FIJOS_CATALOGO.map(p => {
  assert.equal(estructuras.filter(e => e.Codigo === p.codigo).length, 1)
  const plantilla = plantillas.filter(f => f.TipoDoc?.trim() === '' && f.Estructura === p.codigo)
  assert.ok(plantilla.length > 0)
  const asociaciones = conceptos.flatMap(c => {
    const elementos = plantilla.filter(f => Object.values(coincide(c, f)).some(Boolean))
    return elementos.length ? [{ concepto: c, elementos: elementos.map(f => ({ id: f.id,
      articulo: f.Articulo, componente: f.DisComponente, grupo: f.DisGrupo, cantidad: f.Cantidad,
      coincide: coincide(c, f) })) }] : []
  })
  const serie = p.familiaCodigo === '005' ? 'GMA50' : 'GMC400'
  const casos = [[p.anchoMm, p.altoMm], [p.anchoMm + 10, p.altoMm], [1500, 900]].map(([anchoMm, altoMm]) => {
    const entrada = { estructura: p.codigo, serie, anchoMm: anchoMm!, altoMm: altoMm!, vidrio: 'V410ACGP6',
      acabado: 'L', acabadoAccesorios: 'UNI', opcionesGuardadas: [] }
    const r = despiezarLineaCatalogo(catalogo, entrada)
    return { entrada, importe: r.importe, incidencias: r.incidencias, avisos: r.avisos,
      preciosNulosOCero: r.filas.filter(f => {
        const tarifa = catalogo.tarifa(f.articulo, f.acabado)
        return tarifa?.pvp === null || tarifa?.pvp === undefined || tarifa.pvp === 0
      }).map(f => ({ articulo: f.articulo, origen: f.origen, cantidad: f.cantidad, pvp: catalogo.tarifa(f.articulo, f.acabado)?.pvp ?? null })),
      manoObra: r.filas.filter(f => f.origen === 'mano-obra') }
  })
  return { codigo: p.codigo, serie, plantilla, asociaciones, casos }
})
const reglas = new Set(seleccion.flatMap(p => p.asociaciones.map(a => a.concepto.Codigo)))
const investigadas = conceptos.filter(c => reglas.has(c.Codigo))
const extraerCaso = (tabla: string, porHijas: Map<string, Fila[]>, p: Fila) => {
  const tipo = tipos[tabla]
  const candidatas = tipo ? porConfiguracion.get(`${tipo}|${p.nDoc}|${p.nLinea}`) ?? [] : []
  const c = candidatas.length === 1 ? candidatas[0] : null
  const hijas = porHijas.get(`${p.nDoc}|${p.nLinea}`) ?? []
  const mo = hijas.filter(h => h.Articulo === 'MO').map(h => ({ linea: h.nLinea, minutos: opcional(h.Cdad),
    funcion: h.Funcion, precio: h.Precio, importe: h.ImporteTotal }))
  const plantilla = catalogo.plantilla(p.Articulo!)
  const serie = c ? catalogo.serie(c.Conjunto1!) : null
  const vigente = c && serie && c.DisEspecificoSN === 'False' ? minutosFabricacion({
    elementos: plantilla.map(f => ({ modulo: f.funcion === 'infMOmof' ? f.disVidrio : null,
      articuloPlantilla: f.articulo, componente: f.componente, grupo: f.grupo, cantidad: f.cantidad })),
    conceptos: catalogo.conceptosManoObra(),
    conceptosApertura: [...new Set(plantilla.map(f => clavesTipoHoja(catalogo.nombreTipoHoja(f.tipoHoja!))?.manoObra)
      .filter((x): x is string => !!x))].map(k => serie.manoObra[k]).filter((x): x is string => !!x),
  }) : null
  const conceptosOriginal = tipo ? moPorLinea.get(`${tipo}|${p.nDoc}|${p.nLinea}`) ?? [] : []
  const tipoPerfiles = conjuntos.find(s => s.Codigo === c?.Conjunto1)?.TipoPerf ?? null
  const horas = c?.HorasAdFabr?.trim().replace(',', '.')
  const ajusteManualMinutos = horas ? Number(multiplicarDecimal(horas, '60', horas.split('.')[1]?.length ?? 0)) : null
  const hipotesis = investigadas.flatMap(regla => {
    const elementos = plantilla.filter(f => (regla.ComponenteAsoc !== '!' && regla.ComponenteAsoc === f.componente)
      || (regla.GrupoAsoc !== '!' && regla.GrupoAsoc === f.grupo))
    if (!elementos.length) return []
    const original = conceptosOriginal.filter(o => o.Concepto === regla.Codigo)
    const minutosOriginales = original.length ? original.reduce((sum, o) => sum + numero(o.Cantidad), 0) : null
    const minutosPorCantidad = elementos.reduce((sum, e) => sum + e.cantidad * numero(regla.TiempoFabr), 0)
    return [{ concepto: regla.Codigo, elementos: elementos.map(e => ({ id: e.id, cantidad: e.cantidad })),
      minutosPorCantidad, minutosOriginales, registrosOriginales: original.length,
      coincide: minutosOriginales === null ? null : minutosPorCantidad === minutosOriginales }]
  })
  // Hipótesis fijada ANTES del contraste: categoría por TipoPerf; una fila por concepto.
  // El oráculo solo interviene en la comparación, nunca en elegir aportaciones.
  const categoriaHipotesis = tipoPerfiles === 'A' ? '00001' : tipoPerfiles === 'C' ? '00002' : null
  const adicionales = hipotesis.filter(h => investigadas.find(c => c.Codigo === h.concepto)?.Categoria === categoriaHipotesis)
  const minutosHipotesis = vigente && ajusteManualMinutos !== null && categoriaHipotesis
    ? [...vigente.lineas.map(l => l.minutos), ...adicionales.map(h => h.minutosPorCantidad), ajusteManualMinutos].filter(n => n > 0).sort((a, b) => a - b) : null
  const minutosOriginal = mo.map(l => l.minutos).filter((n): n is number => n !== null && n > 0).sort((a, b) => a - b)
  const contrasteHipotesis = minutosHipotesis && mo.every(l => l.minutos !== null) ? {
    categoria: categoriaHipotesis, minutosHipotesis, minutosOriginal,
    coincide: JSON.stringify(minutosHipotesis) === JSON.stringify(minutosOriginal),
  } : null
  return { tabla, documento: p.nDoc, linea: p.nLinea, codigo: p.Articulo, cantidad: p.Cdad,
    ancho: p.Ancho, largo: p.Largo, acabado: p.Acabado, configuracionesEncontradas: candidatas.length,
    configuracion: c, tipoPerfiles,
    hijas: hijas.length, manoObraOriginal: mo, conceptosOriginal, manoObraMotorVigente: vigente, hipotesis,
    ajusteManualMinutos, contrasteHipotesis }
}
const corpus = tablas.map(t => ({ tabla: t.tabla, filas: t.filas.length,
  estructuras: t.filas.filter(f => f.EstructuraSN === 'True').length,
  coincidenciasCodigo: t.filas.filter(f => codigos.has(f.Articulo!)).length,
  casos: t.filas.filter(f => f.EstructuraSN === 'True' && codigos.has(f.Articulo!))
    .map(p => extraerCaso(t.tabla, t.hijas, p)) }))
// Busca controles de las mismas asociaciones en otros modelos; no los equipara a los fijos.
const relacionados = new Set(plantillas.filter(f => f.TipoDoc?.trim() === '' && investigadas.some(c =>
  Object.values(coincide(c, f)).some(Boolean))).map(f => f.Estructura!))
const controles = tablas.flatMap(t => t.filas.filter(f => f.EstructuraSN === 'True' &&
  relacionados.has(f.Articulo!) && !codigos.has(f.Articulo!)).map(p => extraerCaso(t.tabla, t.hijas, p)))
const html = archivos(manual).filter(r => /\.html?$/i.test(r))
assert.ok(html.length > 0, 'El barrido de manual debe encontrar páginas HTML')
const paginas = html.flatMap(ruta => {
  const contenido = readFileSync(ruta).toString('latin1')
  const cuerpo = contenido.match(/<!--ZOOMRESTART-->([\s\S]*?)<!--ZOOMSTOP-->/)?.[1] ?? ''
  if (!/mano de obra|tiempo[^<>]*(?:fabric|montaje)/i.test(cuerpo)) return []
  fuente(ruta)
  return [{ ruta: relative(process.cwd(), ruta).replaceAll('\\', '/'),
    imagenes: [...cuerpo.matchAll(/<img[^>]+src="([^"]+)"/g)].map(m => m[1]) }]
})
for (const nombre of ['5.1.2.13.13.2-001.png', '5.1.2.13.13.2-004.png', '5_1_11_3_12_conceptos_de_mano_.htm']) fuente(join(manual, nombre))
// Cubre también las tablas leídas internamente por el adaptador CSV, sin divulgar filas.
for (const ruta of csv) if (!fuentes.has(ruta)) fuente(ruta)
for (const [ruta, f] of fuentes) assert.equal(hash(ruta), f.sha256, 'La fuente cambió durante la lectura')
const resumen = { csvDescubiertos: csv.length, tablasDocumentales: corpus.map(({ casos, ...resto }) => ({ ...resto,
  porModelo: Object.fromEntries([...codigos].map(c => [c, casos.filter(p => p.codigo === c).length])) })),
  selecciones: seleccion.map(p => ({ codigo: p.codigo, conceptos: p.asociaciones.map(a => ({ codigo: a.concepto.Codigo,
    elementos: a.elementos.length })), casos: p.casos.length, bloqueados: p.casos.filter(c => c.importe === null).length,
    incidencias: [...new Set(p.casos.flatMap(c => c.incidencias))], preciosNulosOCero: [...new Set(p.casos.flatMap(c => c.preciosNulosOCero.map(f => f.articulo)))] })),
  controlesRelacionados: controles.length, controlesNoEspecificosConConfiguracion: controles.filter(c => c.configuracion?.DisEspecificoSN === 'False').length,
  hipotesis: ['A', 'C'].map(tipo => ({ tipoPerfiles: tipo,
    casos: controles.filter(c => c.tipoPerfiles === tipo && c.contrasteHipotesis !== null).length,
    coincidentes: controles.filter(c => c.tipoPerfiles === tipo && c.contrasteHipotesis?.coincide).length })),
  conceptosInvestigados: investigadas.map(c => { const registros = conceptosOriginales.filter(f => f.Concepto === c.Codigo)
    return { concepto: c.Codigo, registros: registros.length,
      positivos: registros.filter(f => numero(f.Cantidad) > 0).length,
      ceros: registros.filter(f => numero(f.Cantidad) === 0).length } }),
  paginasManual: html.length, paginasCoincidentes: paginas.length }
mkdirSync(salida, { recursive: true })
writeFileSync(join(salida, 'investigacion.json'), JSON.stringify({ alcance: 'Fuentes CSV y manual; sin DB ni MDB. Selección no acredita fórmula económica.',
  fuentes: [...fuentes.values()], inventario, categorias, seleccion, corpus, controles, paginas, resumen }, null, 2))
writeFileSync(join(salida, 'resumen.json'), JSON.stringify(resumen, null, 2))
console.log(JSON.stringify(resumen, null, 2))
