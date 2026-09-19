import { beforeAll, afterAll, describe, expect, it } from 'vitest'
import { PGlite } from '@electric-sql/pglite'
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { cargarCatalogoEditor, leerCatalogoEditor, type BaseCatalogo } from './editor-linea/carga.ts'
import { validarDestinoEditor } from './editor-linea/destino.ts'

const db = new PGlite()
const carpeta = mkdtempSync(join(tmpdir(), 'aluminior-editor-'))
const base = db as unknown as BaseCatalogo
const origen = {
  'ConjuntosOpcionesHerraje': 'Conjunto,nOpcion,fOpcSoloActiva,fOpcIncompatible,DescrAutoSN\nGM252,1,,o4,True\nGM252,4,,o1,False\nNO_EXISTE,9,,,False\n,8,,,False\n',
  'ConjuntosCatOH': 'Conjunto,Codigo,Descripcion,OpcExcluyentesSN\nGM252,CER,CIERRES,False\n',
  'Conjuntos': 'Codigo,TablaHojas,TablaFijos,TablaHojas2,TablaFijos2,TablaHojas3,TablaFijos3,TablaHojas4,TablaFijos4,TablaHojas5,TablaFijos5\nGMA65OPT,GM69,GM69,GM70,GM70,GM71,GM71,GM72,GM72,,\n',
  'TAcristalamiento': 'Codigo,Descripcion\nGM69,RECTO\nGM70,CURVO\nGM71,CLIP\nGM72,GRAPA\n',
}
beforeAll(async () => {
  await db.exec('CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY)')
  const dir = new URL('../../db/migrations/', import.meta.url)
  const journal = JSON.parse(readFileSync(new URL('meta/_journal.json', dir), 'utf8'))
  for (const { tag } of journal.entries) await db.exec(readFileSync(new URL(tag + '.sql', dir), 'utf8'))
  await db.exec("INSERT INTO opciones_herraje(conjunto_codigo,opcion_codigo,descripcion,por_defecto,oculta,categoria) VALUES ('GM252','1','CONSERVAR',true,false,'CER'),('GM252','4','CERRADURA',false,false,'CER')")
  await db.exec("INSERT INTO clientes(codigo,nombre) VALUES ('QA','SINTETICO'); INSERT INTO presupuestos(id,numero,fecha,cliente_codigo) VALUES ('00000000-0000-4000-8000-000000000001',1,'2026-01-01','QA'); INSERT INTO lineas(presupuesto_id,orden,tipo,descripcion) VALUES ('00000000-0000-4000-8000-000000000001',1,'ESTRUCTURA','SINTETICA')")
  for (const [nombre, contenido] of Object.entries(origen)) writeFileSync(join(carpeta, nombre + '.csv'), contenido)
}, 60000)
afterAll(async () => { await db.close(); rmSync(carpeta, { recursive: true, force: true }) })

describe('cargador acotado con cadena completa 0000–0021', () => {
  it('dry-run informa sin escribir; apply es idempotente y sólo cambia columnas autorizadas', async () => {
    const catalogo = await leerCatalogoEditor(carpeta)
    expect(catalogo.informe.opciones.descartadas).toEqual({ 'clave-vacia': 1 })
    const seco = await cargarCatalogoEditor(base, catalogo)
    expect(seco.escrito).toBe(false)
    expect(seco.actualizables).toBe(2)
    expect((await db.query('SELECT count(*)::int n FROM tablas_acristalamiento')).rows).toEqual([{ n: 0 }])
    const aplicada = await cargarCatalogoEditor(base, catalogo, true)
    expect(aplicada.informe.opciones.cargadas).toBe(2)
    expect(aplicada.informe.opciones.descartadas['opcion-no-existente']).toBe(1)
    expect(aplicada.protegidas).toEqual({ presupuestos: 1, lineas: 1, clientes: 1 })
    expect((await db.query("SELECT descripcion,por_defecto,oculta,categoria,incompatible FROM opciones_herraje WHERE opcion_codigo='1'")).rows)
      .toEqual([{ descripcion: 'CONSERVAR', por_defecto: true, oculta: false, categoria: 'CER', incompatible: 'o4' }])
    expect((await db.query('SELECT count(*)::int n FROM conjunto_acristalamientos')).rows).toEqual([{ n: 4 }])
    expect(await cargarCatalogoEditor(base, catalogo, true)).toEqual(aplicada)
  })
  it('un error a mitad de recarga revierte también UPDATE y DELETE anteriores', async () => {
    const catalogo = await leerCatalogoEditor(carpeta)
    catalogo.opciones[0].incompatible = 'o99'
    catalogo.tablas.push({ codigo: 'GM69', descripcion: 'DUPLICADO' })
    await expect(cargarCatalogoEditor(base, catalogo, true)).rejects.toThrow()
    expect((await db.query("SELECT incompatible FROM opciones_herraje WHERE opcion_codigo='1'")).rows).toEqual([{ incompatible: 'o4' }])
    expect((await db.query("SELECT descripcion FROM tablas_acristalamiento WHERE codigo='GM69'")).rows).toEqual([{ descripcion: 'RECTO' }])
  })
  it('rechaza CSV ausente, vacío o clave duplicada antes de cualquier escritura', async () => {
    writeFileSync(join(carpeta, 'TAcristalamiento.csv'), 'Codigo,Descripcion\n')
    await expect(leerCatalogoEditor(carpeta)).rejects.toThrow('Catálogo vacío')
    writeFileSync(join(carpeta, 'TAcristalamiento.csv'), 'Codigo,Otra\nA,Uno\n')
    await expect(leerCatalogoEditor(carpeta)).rejects.toThrow('Columnas requeridas')
    writeFileSync(join(carpeta, 'TAcristalamiento.csv'), 'Codigo,Descripcion\nA,Uno\nA,Dos\n')
    await expect(leerCatalogoEditor(carpeta)).rejects.toThrow('Clave duplicada')
    rmSync(join(carpeta, 'TAcristalamiento.csv'))
    await expect(leerCatalogoEditor(carpeta)).rejects.toThrow('Falta CSV')
    writeFileSync(join(carpeta, 'TAcristalamiento.csv'), origen.TAcristalamiento)
  })
  it('rechaza un CSV de conjuntos sin columnas 2–5 sin borrar alternativas existentes', async () => {
    writeFileSync(join(carpeta, 'Conjuntos.csv'), 'Codigo,TablaHojas,TablaFijos\nGMA65OPT,GM69,GM69\n')
    await expect(leerCatalogoEditor(carpeta)).rejects.toThrow('Columnas requeridas')
    expect((await db.query('SELECT count(*)::int n FROM conjunto_acristalamientos')).rows).toEqual([{ n: 4 }])
    writeFileSync(join(carpeta, 'Conjuntos.csv'), origen.Conjuntos)
  })
  it.runIf(!!process.env.EDITOR_CSV_PRUEBA)('carga CSV históricos sólo en PGlite y verifica GM252/GM69–72', async () => {
    const catalogo = await leerCatalogoEditor(process.env.EDITOR_CSV_PRUEBA!)
    // Recrea exclusivamente claves del catálogo, nunca documentos ni clientes reales.
    await db.query('INSERT INTO opciones_herraje(conjunto_codigo,opcion_codigo) SELECT conjunto_codigo,opcion_codigo FROM jsonb_to_recordset($1::jsonb) AS d(conjunto_codigo text,opcion_codigo text) ON CONFLICT DO NOTHING', [JSON.stringify(catalogo.opciones)])
    const resultado = await cargarCatalogoEditor(base, catalogo, true)
    console.log('Informe CSV real en PGlite:', JSON.stringify(resultado))
    expect(resultado.informe.opciones.cargadas).toBe(catalogo.opciones.length)
    expect((await db.query("SELECT incompatible FROM opciones_herraje WHERE conjunto_codigo='GM252' AND opcion_codigo='4'")).rows)
      .toEqual([{ incompatible: 'o1+o508+o509' }])
    expect((await db.query("SELECT tabla_hojas FROM conjunto_acristalamientos WHERE conjunto_codigo='GMA65OPT' ORDER BY opcion")).rows)
      .toEqual(['GM69','GM70','GM71','GM72'].map(tabla_hojas => ({ tabla_hojas })))
  }, 60000)
})
describe('guarda de destino', () => {
  it('sólo permite Supabase verificado o URL efímera local idéntica', () => {
    expect(validarDestinoEditor('postgres://u:p@db.test.supabase.co/postgres')).toBe('supabase')
    expect(validarDestinoEditor('postgres://u:p@aws-0-eu-west-1.pooler.supabase.com/postgres')).toBe('supabase')
    const url = 'postgres://u:p@127.0.0.1:55433/pruebas'
    expect(validarDestinoEditor(url, url)).toBe('efimera')
    for (const malo of [url, 'https://db.test.supabase.co', 'postgres://db.test.supabase.co.evil.test/x', 'postgres://produccion/x']) {
      expect(() => validarDestinoEditor(malo)).toThrow()
    }
  })
})
