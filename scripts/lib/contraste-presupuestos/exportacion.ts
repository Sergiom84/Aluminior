/** Claves de las líneas GRUPO de una exportación CSV anterior (ETL, formato es-ES). */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { clave } from '../banco-contraste/datos.ts'

/** CSV con comillas dobles; admite comas y saltos de línea dentro de los campos. */
export function filasCsv(contenido: string): Record<string, string>[] {
  const s = contenido.replace(/^﻿/, ''), filas: string[][] = []
  let fila: string[] = [], campo = '', comillas = false
  for (let i = 0; i < s.length; i++) {
    const c = s[i]!
    if (comillas) { if (c === '"') { if (s[i + 1] === '"') { campo += '"'; i++ } else comillas = false } else campo += c }
    else if (c === '"') comillas = true
    else if (c === ',') { fila.push(campo); campo = '' }
    else if (c === '\n') { fila.push(campo.replace(/\r$/, '')); filas.push(fila); fila = []; campo = '' }
    else campo += c
  }
  if (campo || fila.length) { fila.push(campo); filas.push(fila) }
  const cabecera = filas[0] ?? []
  return filas.slice(1).filter(f => f.length > 1).map(f => Object.fromEntries(cabecera.map((k, i) => [k, f[i] ?? ''])))
}

export function gruposDeExportacion(directorio: string): Set<string> {
  const filas = filasCsv(readFileSync(join(directorio, 'VPresupuestosLin.csv'), 'utf8'))
  return new Set(filas.filter(f => f.GrupoSN === 'True').map(f => clave(f.nDoc, f.nLinea)))
}
