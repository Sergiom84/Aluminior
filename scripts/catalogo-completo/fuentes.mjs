import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { basename, join, relative } from 'node:path'
import { parse } from 'csv-parse/sync'
import { leerCatalogoDiseno } from '../lib/catalogo-diseno.mjs'

export const TABLAS_CATALOGO = ['FamiliasEstr', 'Estructuras', 'EstructurasDiseño']
const REQUERIDAS = {
  FamiliasEstr: ['Codigo', 'Descripcion', 'OrdenEsc', 'AccesorioSN'],
  Estructuras: ['Codigo', 'Descripcion', 'Familia', 'DisAncho', 'DisAlto', 'AccesorioSN'],
  EstructurasDiseño: ['Estructura', 'TipoDoc', 'Id', 'Tipo', 'ContenidoEn', 'idTrav',
    'posHueco', 'TipoTrav', 'bInvisible', 'TipoHoja', 'nHoja', 'TipoCota', 'Cota',
    'OperacionEqui', 'TipoMarco', 'TravMedAbsMRel', 'bApertExt', 'bZocaloOPC',
    'bZocaloAd', 'PerfilAdSN', 'bPerSupAd', 'bVAG', 'TipoCurva', 'barrVert',
    'barrHoriz', 'bPerInf', 'bPerSup', 'bPerIz', 'bPerDe'],
}
const RELACIONADAS = ['EstructurasLineas', 'EstructurasSeriesAsoc',
  'EstructurasDatosAuxiliares', 'EstructurasOpcOpciones', 'EstructurasArticulos']
export const sha256 = contenido => createHash('sha256').update(contenido).digest('hex')
const activo = valor => ['true', '1', '-1'].includes(String(valor).toLowerCase())

export function huellaArchivo(ruta) {
  const stat = statSync(ruta)
  return { ruta, bytes: stat.size, modificadoUtc: stat.mtime.toISOString(),
    sha256: sha256(readFileSync(ruta)) }
}

/** No sigue enlaces simbólicos; descubre tablas por nombre, no por familias. */
export function descubrirExportaciones(raices) {
  const encontrados = new Set()
  const visitar = carpeta => {
    if (!existsSync(carpeta)) return
    const entradas = readdirSync(carpeta, { withFileTypes: true })
    const ficheros = new Set(entradas.filter(e => e.isFile()).map(e => e.name))
    if (TABLAS_CATALOGO.every(t => ficheros.has(`${t}.csv`))) encontrados.add(carpeta)
    for (const entrada of entradas) if (entrada.isDirectory()) visitar(join(carpeta, entrada.name))
  }
  raices.forEach(visitar)
  return [...encontrados].sort()
}

function leerTabla(carpeta, tabla, requeridas) {
  const ruta = join(carpeta, `${tabla}.csv`)
  const contenido = readFileSync(ruta)
  const registros = parse(contenido, { bom: true })
  const cabecera = registros[0] ?? []
  const faltan = requeridas.filter(c => !cabecera.includes(c))
  if (faltan.length) throw new Error(`${tabla}: faltan columnas ${faltan.join(', ')}`)
  const filas = parse(contenido, { columns: true, bom: true })
  return { filas, fuente: { ...huellaArchivo(ruta), tabla, filas: filas.length } }
}

export function leerFuenteCatalogo(carpeta) {
  const tablas = Object.fromEntries(TABLAS_CATALOGO.map(tabla =>
    [tabla, leerTabla(carpeta, tabla, REQUERIDAS[tabla])]))
  const catalogo = leerCatalogoDiseno(carpeta)
  const relacionadas = {}
  for (const tabla of RELACIONADAS) {
    if (!existsSync(join(carpeta, `${tabla}.csv`))) continue
    const mixta = tabla === 'EstructurasArticulos'
    const lectura = leerTabla(carpeta, tabla, mixta ? ['Estructura', 'TipoDoc'] : ['Estructura'])
    const filasCatalogo = mixta ? lectura.filas.filter(f => !f.TipoDoc.trim()) : lectura.filas
    const porModelo = new Map()
    for (const fila of filasCatalogo) porModelo.set(fila.Estructura,
      (porModelo.get(fila.Estructura) ?? 0) + 1)
    relacionadas[tabla] = { fuente: { ...lectura.fuente, filasCatalogo: filasCatalogo.length,
      filasDocumentoExcluidas: lectura.filas.length - filasCatalogo.length }, porModelo }
  }
  const fuentes = Object.values(tablas).map(t => t.fuente)
  const id = sha256(fuentes.map(f => `${f.tabla}:${f.sha256}`).join('\n'))
  const filasCatalogo = tablas.EstructurasDiseño.filas.filter(f => !f.TipoDoc.trim())
  const codigos = new Set(catalogo.estructuras.map(e => e.codigo))
  const sinFicha = new Map()
  for (const fila of filasCatalogo) if (!codigos.has(fila.Estructura)) {
    sinFicha.set(fila.Estructura, (sinFicha.get(fila.Estructura) ?? 0) + 1)
  }
  return {
    fuente: { id, carpeta, nombre: basename(carpeta), archivos: fuentes,
      relacionadas: Object.values(relacionadas).map(t => t.fuente),
      version: 'Identificada por hashes CSV; versión del programa no acreditada',
      fechaExportacion: 'No acreditada: mtime no demuestra fecha de extracción',
      ejercicio: basename(carpeta) === 'EMP0016' ? { valor: 2026,
        evidencia: 'docs/paridad/INICIO-SIGUIENTE-CONVERSACION.md' } : null },
    familias: catalogo.familias.map((f, i) => ({ ...f,
      accesorio: activo(tablas.FamiliasEstr.filas[i].AccesorioSN) })),
    estructuras: catalogo.estructuras.map((e, i) => ({ ...e,
      accesorio: activo(tablas.Estructuras.filas[i].AccesorioSN),
      compacto: activo(tablas.Estructuras.filas[i].CompactoSN),
      relacionadas: Object.fromEntries(Object.entries(relacionadas)
        .map(([tabla, lectura]) => [tabla, lectura.porModelo.get(e.codigo) ?? 0])),
    })),
    disenos: { filasTotales: tablas.EstructurasDiseño.filas.length,
      nodosCatalogo: filasCatalogo.length,
      nodosDocumentoExcluidos: tablas.EstructurasDiseño.filas.length - filasCatalogo.length,
      sinFicha: [...sinFicha].map(([codigo, nodos]) => ({ codigo, nodos })) },
  }
}

/** Solo rutas, tamaños y fechas: nunca abre, copia ni calcula hash de una MDB. */
export function inventariarMdb(raiz) {
  if (!existsSync(raiz)) return { raiz, disponible: false, archivos: [] }
  const archivos = []
  const visitar = carpeta => {
    for (const entrada of readdirSync(carpeta, { withFileTypes: true })) {
      const ruta = join(carpeta, entrada.name)
      if (entrada.isDirectory()) visitar(ruta)
      else if (entrada.isFile() && /\.mdb$/i.test(entrada.name)) {
        const stat = statSync(ruta)
        const local = relative(raiz, ruta).replaceAll('\\', '/')
        const ejercicio = local.match(/EMP\d{4} - (\d{4})\//)?.[1] ?? null
        const versionInstalador = local.match(/Archivos de Instalacion\/([^/]+)\//)?.[1] ?? null
        archivos.push({ ruta: local, bytes: stat.size, modificadoUtc: stat.mtime.toISOString(),
          ejercicioRotulado: ejercicio ? Number(ejercicio) : null, versionInstalador,
          estado: 'solo-metadatos; contenido y vigencia no comprobados' })
      }
    }
  }
  visitar(raiz)
  return { raiz, disponible: true, archivos: archivos.sort((a, b) => a.ruta.localeCompare(b.ruta)) }
}
