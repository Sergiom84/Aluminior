import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import postgres from 'postgres'
import { randomUUID } from 'node:crypto'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { importarCortesCatalogo } from './cortes-catalogo.ts'

const url = urlDePruebasValidada(process.env.TEST_DATABASE_URL)
const nombre = `qa_cortes_${randomUUID().replaceAll('-', '')}`
const admin = postgres(url, { max: 1 })
const sql = postgres(url, { max: 1, connection: { search_path: nombre } })
const origen = mkdtempSync(join(tmpdir(), 'aluminior-cortes-'))
beforeAll(async () => {
  await admin`CREATE SCHEMA ${admin(nombre)}`
  // Esquema propio de esta prueba: no borra ni reutiliza tablas del catálogo QA.
  await sql`CREATE TABLE estructura_referencias_corte (
    estructura_codigo text, linea_origen int, id_pieza int, id_referencia int,
    formula text, formula_referencia text, grupo text, grupo_inicio text,
    grupo_fin text, tipo_hoja int, perfil_adicional int, grupo_adicional text,
    PRIMARY KEY(estructura_codigo,linea_origen))`
  await sql`CREATE TABLE conjunto_descuentos_corte (
    conjunto_codigo text, familia text, grupo_principal text, grupo text,
    tipo_hoja text, descuento_mm numeric(16,8),
    PRIMARY KEY(conjunto_codigo,familia,grupo_principal,grupo,tipo_hoja))`
}, 15000)
afterAll(async () => {
  await sql.end({ timeout: 5 })
  await admin`DROP SCHEMA ${admin(nombre)} CASCADE`
  await admin.end({ timeout: 5 })
  if (dirname(resolve(origen)) !== resolve(tmpdir())) throw new Error('Ruta temporal inesperada')
  rmSync(origen, { recursive: true, force: true })
})

function archivos(duplicado = false) {
  writeFileSync(join(origen, 'EstructurasArticulos.csv'),
    'Estructura,nLin,id,DisIdRefLargo,FormulaLargo,DisGrupo,DisGrupoI,DisGrupoD,DisTipoHoja\nQA,1,1,0,A,M,E,E,-1\n')
  writeFileSync(join(origen, 'ConjuntosDescuentos.csv'),
    'Conjunto,Familia,GrupoPrinc,Grupo,TipoHoja,Descuento\nQA,001,E,M,G,30\n'
    + (duplicado ? 'QA,001,E,M,G,99\n' : ''))
}

describe('actualización suplementaria atómica de cortes', () => {
  it('permite repetir la carga y revierte ambas tablas ante una regla duplicada', async () => {
    archivos()
    await importarCortesCatalogo(sql, origen)
    await importarCortesCatalogo(sql, origen)
    expect(await sql`SELECT count(*)::int n FROM estructura_referencias_corte`).toEqual([{ n: 1 }])
    // Un valor previo distinto acredita que el DELETE y el INSERT se revierten.
    await sql`UPDATE estructura_referencias_corte SET formula='A-5'`
    await sql`UPDATE conjunto_descuentos_corte SET descuento_mm=42`
    archivos(true)
    await expect(importarCortesCatalogo(sql, origen)).rejects.toThrow('actualización revertida')
    expect(await sql`SELECT formula FROM estructura_referencias_corte`).toEqual([{ formula: 'A-5' }])
    expect(await sql`SELECT descuento_mm FROM conjunto_descuentos_corte`).toEqual([{ descuento_mm: '42.00000000' }])
  }, 15000)
})
