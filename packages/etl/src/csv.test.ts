import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { parse } from 'csv-parse/sync'
import { describe, expect, it } from 'vitest'
import { leerLotes, num, txt } from './csv.ts'

// Contrato de lectura del export: las dos API usadas por ETL/investigación
// conservan códigos, texto y precisión antes de convertir o escribir datos.
const exportSintetico = '\uFEFFCodigo,Descripcion,Precio,Fecha\r\n'
  + '0007,"Perfil \""Ñ\"" y vidrio, claro","1.005,5800",09/10/2026\r\n'
  + '\r\n0008,"Dos\r\nlíneas","0,0050",\r\n'
  + '0009,Sin precio,,\r\n'
const esperado = [
  { Codigo: '0007', Descripcion: 'Perfil "Ñ" y vidrio, claro', Precio: '1.005,5800', Fecha: '09/10/2026' },
  { Codigo: '0008', Descripcion: 'Dos\r\nlíneas', Precio: '0,0050', Fecha: '' },
  { Codigo: '0009', Descripcion: 'Sin precio', Precio: '', Fecha: '' },
]

describe('CSV del export sintético', () => {
  it('stream y sync conservan BOM, CRLF, comillas, acentos, códigos y decimales', async () => {
    const carpeta = await mkdtemp(join(tmpdir(), 'aluminior-csv-'))
    try {
      const ruta = join(carpeta, 'sintetico.csv')
      await writeFile(ruta, exportSintetico)
      const lotes = []
      for await (const lote of leerLotes(ruta, 2)) lotes.push(lote)
      expect(lotes.map(lote => lote.length)).toEqual([2, 1])
      expect(lotes.flat()).toEqual(esperado)
      expect(parse(exportSintetico, {
        columns: true, bom: true, skip_empty_lines: true, relax_quotes: true,
      })).toEqual(esperado)
      expect(lotes.flat().map(fila => num(fila.Precio))).toEqual(['1005.5800', '0.0050', null])
    } finally {
      await rm(carpeta, { recursive: true, force: true })
    }
  })

  it('trim conserva los espacios entre comillas y la conversión decimal exacta', () => {
    const filas = parse('\uFEFFarticulo,acabado,precio\r\n 0007 ," L ","1.005,5800"\r\n', {
      columns: true, bom: true, skip_empty_lines: true, trim: true, relax_quotes: true,
    }) as Record<string, string>[]
    expect(filas).toEqual([{ articulo: '0007', acabado: ' L ', precio: '1.005,5800' }])
    expect(txt(filas[0].acabado)).toBe('L')
    expect(num(filas[0].precio)).toBe('1005.5800')
  })
})
