import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { Sql } from 'postgres'
import { afterEach, describe, expect, it } from 'vitest'
import { crearCargador } from './cargar.ts'
import { descartar, excluir } from './resultado.ts'

describe('carga de una tabla', () => {
  const carpetas: string[] = []
  const crearOrigen = () => {
    const ruta = mkdtempSync(join(tmpdir(), 'aluminior-cargador-'))
    carpetas.push(ruta)
    return ruta
  }
  afterEach(() => {
    for (const ruta of carpetas.splice(0)) rmSync(ruta, { recursive: true, force: true })
  })

  it('aísla la fila rechazada cuando falla un lote y mantiene exclusiones separadas', async () => {
    const origen = crearOrigen()
    writeFileSync(join(origen, 'Tabla.csv'), 'Codigo\nBUENA\nMALA\nEXCLUIR\nINVALIDA\n')
    const insertadas: unknown[] = []
    const sql = ((entrada: unknown, ...valores: unknown[]) => {
      if (!Array.isArray(entrada) || !('raw' in entrada)) return entrada
      const fila = valores[1] as { codigo: string } | { codigo: string }[]
      if (Array.isArray(fila) || fila.codigo === 'MALA') return Promise.reject(new Error('rechazo sintético'))
      insertadas.push(fila)
      return Promise.resolve([])
    }) as unknown as Sql
    const r = await crearCargador(sql, origen)('Tabla', 'destino', (f, resultado) => {
      if (f.Codigo === 'EXCLUIR') { excluir(resultado, 'fuera de ámbito'); return null }
      if (f.Codigo === 'INVALIDA') { descartar(resultado, 'inválida'); return null }
      return { codigo: f.Codigo }
    })
    expect(insertadas).toEqual([{ codigo: 'BUENA' }])
    expect(r).toMatchObject({ leidas: 4, insertadas: 1, excluidas: 1, descartadas: 2 })
    expect(r.motivos.get('descartada: rechazada por la BD: rechazo sintético')).toBe(1)
  })

  it('informa del CSV ausente sin intentar SQL', async () => {
    const sql = (() => { throw new Error('no debe conectar') }) as unknown as Sql
    const r = await crearCargador(sql, crearOrigen())('Ausente', 'destino', () => null)
    expect(r.leidas).toBe(0)
    expect(r.motivos.get('CSV no encontrado')).toBe(1)
  })
})
