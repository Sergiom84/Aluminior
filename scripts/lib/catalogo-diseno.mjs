import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse/sync'

const numero = valor => Number((valor || '0').replace(/\./g, '').replace(',', '.'))
const activo = valor => ['True', 'true', '-1', '1'].includes(valor)

/** Solo tablas de catálogo, excluyendo instancias en la tabla mixta de diseño.
 * No consulta tablas de documentos/clientes ni accede a MDB.
 */
export function leerCatalogoDiseno(carpeta) {
  const leer = tabla => parse(readFileSync(join(carpeta, `${tabla}.csv`)), { columns: true, bom: true })
  const porEstructura = new Map()
  for (const fila of leer('EstructurasDiseño')) {
    if (fila.TipoDoc.trim()) continue
    const variantes = []
    for (const campo of ['bApertExt', 'bZocaloOPC', 'bZocaloAd', 'PerfilAdSN', 'bPerSupAd']) {
      if (activo(fila[campo])) variantes.push(campo)
    }
    // Las hojas de las plantillas de control llevan bVAG=True.
    if (fila.Tipo === '3' && !activo(fila.bVAG)) variantes.push('bVAG=False')
    for (const campo of ['TipoCurva', 'barrVert', 'barrHoriz']) {
      if (numero(fila[campo]) !== 0) variantes.push(campo)
    }
    if (fila.Tipo === '1') {
      for (const campo of ['bPerInf', 'bPerSup', 'bPerIz', 'bPerDe']) {
        if (fila[campo] && !activo(fila[campo])) variantes.push(campo)
      }
    }
    if (fila.TravMedAbsMRel.trim()) variantes.push('TravMedAbsMRel')
    const nodos = porEstructura.get(fila.Estructura) ?? []
    nodos.push({
      id: numero(fila.Id), tipo: numero(fila.Tipo), padre: numero(fila.ContenidoEn),
      division: numero(fila.idTrav), posicion: numero(fila.posHueco),
      travesano: fila.TipoTrav.trim(), invisible: activo(fila.bInvisible),
      hoja: numero(fila.TipoHoja), numeroHoja: numero(fila.nHoja),
      tipoCota: numero(fila.TipoCota), cota: numero(fila.Cota),
      equidistantes: numero(fila.OperacionEqui), marco: fila.TipoMarco.trim(), variantes,
    })
    porEstructura.set(fila.Estructura, nodos)
  }
  const estructuras = leer('Estructuras').map(fila => ({
    codigo: fila.Codigo, descripcion: fila.Descripcion, familiaCodigo: fila.Familia,
    anchoMm: numero(fila.DisAncho), altoMm: numero(fila.DisAlto),
    nodos: porEstructura.get(fila.Codigo) ?? [],
  }))
  return { estructuras, familias: leer('FamiliasEstr').map(f => ({
    codigo: f.Codigo, descripcion: f.Descripcion, orden: numero(f.OrdenEsc),
  })) }
}

/** Comparación semántica: ignora IDs locales y anidación de divisiones colineales. */
export function firmaDibujo(plantilla) {
  const huecos = []
  const separadores = []
  const visitar = (nodo, x, y, ancho, alto) => {
    if (nodo.tipo === 'hueco') { huecos.push([nodo.apertura, x, y, ancho, alto]); return }
    const total = nodo.hijos.reduce((s, h) => s + h.proporcion, 0)
    let cursor = nodo.eje === 'vertical' ? x : y
    nodo.hijos.forEach((h, i) => {
      const longitud = (nodo.eje === 'vertical' ? ancho : alto) * h.proporcion / total
      if (nodo.eje === 'vertical') visitar(h.nodo, cursor, y, longitud, alto)
      else visitar(h.nodo, x, cursor, ancho, longitud)
      cursor += longitud
      if (i < nodo.hijos.length - 1) separadores.push([
        nodo.separador, nodo.eje, cursor, nodo.eje === 'vertical' ? y : x,
        nodo.eje === 'vertical' ? alto : ancho,
      ])
    })
  }
  visitar(plantilla.composicion, 0, 0, 1, 1)
  const normalizar = lista => lista.map(f => f.map(v => typeof v === 'number'
    ? Math.round(v * 1e8) / 1e8 : v)).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
  return { huecos: normalizar(huecos), separadores: normalizar(separadores) }
}
