/**
 * Carga dirigida del motor contra una base EFÍMERA propia, migrada con las
 * migraciones reales (nunca la Supabase compartida). Filas sintéticas.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { fileURLToPath } from 'node:url'
import { createHash, randomUUID } from 'node:crypto'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { AbortoMotor, cargarMotorCatalogo, TABLAS_MOTOR, TABLAS_PROTEGIDAS } from './aplicar.ts'

const base = urlDePruebasValidada(process.env.TEST_DATABASE_URL)
const BASE = `aluminior_motor_${randomUUID().replaceAll('-', '')}_test`
const url = urlDePruebasValidada(base.replace(/\/[^/]+$/, `/${BASE}`))
const admin = postgres(base, { max: 1, onnotice: () => {} })
let sql: ReturnType<typeof postgres>
const origen = mkdtempSync(join(tmpdir(), 'aluminior-motor-'))

const csv: Record<string, string> = {
  EstructurasArticulos: 'Estructura,nLin,id,Articulo,Cantidad,DisIdRefLargo,FormulaLargo,DisGrupo,DisGrupoI,DisGrupoD,DisTipoHoja\n' +
    'QA-MOTOR,1,1,QA-P,1,0,A,M,E,E,-1\nQA-MOTOR,2,2,QA-P,1,0,A,M,E,E,-1\n',
  ConjuntosDescuentos: 'Conjunto,Familia,GrupoPrinc,Grupo,TipoHoja,Descuento\nQA-S,001,E,M,G,30\n',
  ConjuntosAsoc: 'nLin,Conjunto,Articulo,Cantidad\n1,QA-S,QA-H,1\n',
  FamiliasGruposAsoc: 'Familia,Codigo,Componentes,Descripcion\n001,G1,12;13,Grupo sintético\n',
  SeriesAsocV2TiposHoja: 'id,tipo,descripcion\n10,t2HC,2 Hojas Corredera\n',
  MOConceptos: 'Codigo,Descripcion,TiempoFabr,CodArticulo\nQA-M,Módulo sintético,20,MO\n',
  ArticulosIncrPrecio: 'nLin,Articulo,TipoMetMed,MetrajeDesde,MetrajeHasta,IncrementoPorc\n1,QA-P,MET,0,1,5\n',
  Articulos: 'Codigo,Componente,GenericoSN,DAcrisSN,TamJunqGoma,IncrementosPrecioSN\nQA-P,12,False,False,0,True\n',
  ConjuntosLin: 'Conjunto,Componente,Articulo\nQA-S,25,0\nQA-S,12,QA-P\n',
  Conjuntos: 'Codigo,herr2HC,mo2HC,CorrGrosorVid,CorrGrosorVidDA\nQA-S,QA-H,QA-MO,6,24\n',
  Estructuras: 'Codigo,TipoPerf\nQA-MOTOR,A\nQA-AUSENTE,C\n',
}

const contar = async (tabla: string) => (await sql`SELECT count(*)::int AS n FROM ${sql(tabla)}`)[0]!.n as number
const filasMotor = async (): Promise<Record<string, number>> => Object.fromEntries(await Promise.all(TABLAS_MOTOR.map(async t => [t, await contar(t)])))
const contenido = async (tablas: readonly string[]) => Object.fromEntries(await Promise.all(tablas.map(
  async t => [t, await sql`SELECT to_jsonb(f) AS fila FROM ${sql(t)} f ORDER BY to_jsonb(f)::text`])))

beforeAll(async () => {
  await admin.unsafe(`CREATE DATABASE ${BASE}`)
  sql = postgres(url, { max: 1, onnotice: () => {} })
  // Supabase aporta `auth.users`; la migración de perfiles la referencia.
  await sql`CREATE SCHEMA auth`
  await sql`CREATE TABLE auth.users (id uuid PRIMARY KEY)`
  const migraciones = fileURLToPath(new URL('../../../db/migrations', import.meta.url))
  const hasta0022 = join(origen, 'migraciones-0022')
  mkdirSync(join(hasta0022, 'meta'), { recursive: true })
  const journalActual = JSON.parse(readFileSync(join(migraciones, 'meta/_journal.json'), 'utf8')) as {
    entries: { idx: number; tag: string; when: number }[]
  }
  const journal = { ...journalActual, entries: journalActual.entries.filter(e => e.idx <= 22) }
  writeFileSync(join(hasta0022, 'meta/_journal.json'), JSON.stringify(journal))
  for (const e of journal.entries) copyFileSync(join(migraciones, `${e.tag}.sql`), join(hasta0022, `${e.tag}.sql`))
  await migrate(drizzle(sql), { migrationsFolder: hasta0022 })
  expect((await sql`SELECT to_regclass('public.conjunto_parametros_despiece') AS tabla`)[0]!.tabla).toBeNull()
  expect((await sql`SELECT max(created_at)::text AS ultima FROM drizzle.__drizzle_migrations`)[0]!.ultima).toBe('1790951000407')
  await migrate(drizzle(sql), { migrationsFolder: migraciones })
  // Comprobar todas las migraciones vigentes, sin caducar al añadir otra.
  const aplicadas = await sql`SELECT hash, created_at::text AS fecha
    FROM drizzle.__drizzle_migrations ORDER BY created_at`
  expect([...aplicadas]).toEqual(journalActual.entries.map(e => ({
    hash: createHash('sha256').update(readFileSync(join(migraciones, `${e.tag}.sql`))).digest('hex'),
    fecha: String(e.when),
  })))
  await sql`INSERT INTO estructuras (codigo, descripcion) VALUES ('QA-MOTOR', 'Estructura sintética')`
  await sql`INSERT INTO presupuestos (numero, revision, serie, fecha, nombre_libre, tarifa, estado)
    VALUES (999001, 0, 'A', '2026-10-02', 'QA motor', 1, 'PENDIENTE')`
  await sql`INSERT INTO clientes (codigo, nombre) VALUES ('QA-C', 'Cliente sintético')`
  await sql`INSERT INTO articulos (codigo, descripcion) VALUES ('QA-P', 'Perfil sintético')`
  await sql`INSERT INTO lineas (presupuesto_id, orden, tipo, articulo_codigo, descripcion, precio_unitario, total)
    SELECT id, 1, 'ARTICULO', 'QA-P', 'Línea sintética', 17.5, 17.5 FROM presupuestos`
}, 60000)

beforeEach(() => {
  for (const [tabla, texto] of Object.entries(csv)) writeFileSync(join(origen, `${tabla}.csv`), texto)
})
afterAll(async () => {
  await sql?.end({ timeout: 5 })
  await admin.unsafe(`DROP DATABASE IF EXISTS ${BASE} WITH (FORCE)`)
  await admin.end({ timeout: 5 })
  if (dirname(resolve(origen)) !== resolve(tmpdir())) throw new Error('Ruta temporal inesperada')
  rmSync(origen, { recursive: true, force: true })
})

describe('carga dirigida del catálogo del motor', () => {
  it('simula por defecto: informa de cada tabla y no escribe', async () => {
    const informe = await cargarMotorCatalogo(sql, origen)
    expect(informe.aplicado).toBe(false)
    expect(informe.resultados.map(r => r.tabla).sort()).toEqual([...TABLAS_MOTOR].sort())
    expect(informe.resultados.every(r => r.insertadas > 0 && r.descartadas === 0)).toBe(true)
    expect(informe.protegidas).toMatchObject({ presupuestos: 1, estructuras: 1 })
    expect(Object.values(await filasMotor()).every(n => n === 0)).toBe(true)
  }, 30000)

  it('aplica en una transacción, se puede repetir y no toca presupuestos ni catálogo base', async () => {
    const protegidas = await contenido(TABLAS_PROTEGIDAS)
    await cargarMotorCatalogo(sql, origen, { aplicar: true })
    const primera = await filasMotor()
    expect(Object.values(primera).every(n => n > 0)).toBe(true)
    expect(primera.estructura_plantilla_catalogo).toBe(2)
    const repetida = await cargarMotorCatalogo(sql, origen, { aplicar: true })
    expect(repetida.previas).toEqual(primera)
    expect(await filasMotor()).toEqual(primera)
    expect(await contar('presupuestos')).toBe(1)
    expect(await contar('estructuras')).toBe(1)
    expect(await contenido(TABLAS_PROTEGIDAS)).toEqual(protegidas)
    expect(await sql`SELECT herrajes, mano_obra FROM conjunto_parametros_despiece`).toEqual([
      { herrajes: { '2HC': 'QA-H' }, mano_obra: { '2HC': 'QA-MO' } },
    ])
  }, 30000)

  it('RLS impide leer o modificar el catálogo a un rol de navegador, conservando el acceso del servidor', async () => {
    const rol = `qa_motor_${randomUUID().replaceAll('-', '')}`
    await cargarMotorCatalogo(sql, origen, { aplicar: true })
    const antes = await contenido(TABLAS_MOTOR)
    const rls = await sql`SELECT relname FROM pg_class WHERE relnamespace = 'public'::regnamespace
      AND relrowsecurity AND relname = ANY(${[...TABLAS_MOTOR]})`
    expect(rls).toHaveLength(TABLAS_MOTOR.length)
    await admin.unsafe(`CREATE ROLE ${rol} NOLOGIN NOBYPASSRLS`)
    try {
      // Incluso con permisos de filas, no hay políticas para clientes directos.
      await sql.unsafe(`GRANT USAGE ON SCHEMA public TO ${rol}`)
      for (const tabla of TABLAS_MOTOR) await sql.unsafe(`GRANT SELECT, INSERT, UPDATE, DELETE ON ${tabla} TO ${rol}`)
      await sql.begin(async tx => {
        await tx.unsafe(`SET LOCAL ROLE ${rol}`)
        for (const tabla of TABLAS_MOTOR) {
          expect((await tx`SELECT count(*)::int AS n FROM ${tx(tabla)}`)[0]!.n).toBe(0)
        }
        expect((await tx`UPDATE tipos_hoja_catalogo SET descripcion = 'alterado'`).count).toBe(0)
        expect((await tx`DELETE FROM tipos_hoja_catalogo`).count).toBe(0)
      })
      await expect(sql.begin(async tx => {
        await tx.unsafe(`SET LOCAL ROLE ${rol}`)
        await tx`INSERT INTO tipos_hoja_catalogo (id, tipo) VALUES ('QA-PUBLICO', 'prohibido')`
      })).rejects.toMatchObject({ code: '42501' })
      await expect(sql.begin(async tx => {
        await tx.unsafe(`SET LOCAL ROLE ${rol}`)
        await tx`TRUNCATE tipos_hoja_catalogo`
      })).rejects.toMatchObject({ code: '42501' })
      expect(await contenido(TABLAS_MOTOR)).toEqual(antes)
    } finally {
      await sql.unsafe(`DROP OWNED BY ${rol}`)
      await admin.unsafe(`DROP ROLE ${rol}`)
    }
  }, 30000)

  it('simular sobre catálogo existente revierte sus valores, no solo el recuento', async () => {
    await sql`UPDATE estructura_referencias_corte SET formula = 'A-7'`
    const antes = await contenido(TABLAS_MOTOR)
    await cargarMotorCatalogo(sql, origen)
    expect(await contenido(TABLAS_MOTOR)).toEqual(antes)
  })

  it('un duplicado en la última tabla revierte también los cortes y asociaciones previos', async () => {
    const antes = await contenido(TABLAS_MOTOR)
    writeFileSync(join(origen, 'Conjuntos.csv'), csv.Conjuntos + 'QA-S,OTRO,OTRO,8,30\n')
    await expect(cargarMotorCatalogo(sql, origen, { aplicar: true })).rejects.toThrow(/duplicate key/)
    expect(await contenido(TABLAS_MOTOR)).toEqual(antes)
  })

  it('rechaza asociaciones duplicadas en lugar de ignorarlas como insertadas', async () => {
    const antes = await contenido(TABLAS_MOTOR)
    writeFileSync(join(origen, 'ConjuntosAsoc.csv'), csv.ConjuntosAsoc + '1,QA-S,OTRO,2\n')
    await expect(cargarMotorCatalogo(sql, origen, { aplicar: true })).rejects.toThrow(/duplicate key/)
    expect(await contenido(TABLAS_MOTOR)).toEqual(antes)
  })

  it('aborta ante CSV ausente o vacío sin sustituir el catálogo anterior', async () => {
    const antes = await contenido(TABLAS_MOTOR)
    unlinkSync(join(origen, 'MOConceptos.csv'))
    await expect(cargarMotorCatalogo(sql, origen, { aplicar: true })).rejects.toThrow('Falta MOConceptos')
    writeFileSync(join(origen, 'MOConceptos.csv'), csv.MOConceptos.split('\n')[0] + '\n')
    await expect(cargarMotorCatalogo(sql, origen, { aplicar: true })).rejects.toThrow('actualización revertida')
    expect(await contenido(TABLAS_MOTOR)).toEqual(antes)
  })

  it('detecta cambios de contenido en tablas protegidas aunque mantengan el recuento', async () => {
    const antes = await contenido(TABLAS_MOTOR)
    await sql.unsafe(`CREATE FUNCTION qa_alterar() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN UPDATE presupuestos SET nombre_libre = 'alterado'; RETURN NEW; END $$;
      CREATE TRIGGER qa_alterar AFTER INSERT ON conjunto_parametros_despiece
      FOR EACH ROW EXECUTE FUNCTION qa_alterar();`)
    try {
      await expect(cargarMotorCatalogo(sql, origen, { aplicar: true })).rejects.toThrow('tablas protegidas: presupuestos')
      expect(await contenido(TABLAS_MOTOR)).toEqual(antes)
      expect((await sql`SELECT nombre_libre FROM presupuestos`)[0]!.nombre_libre).toBe('QA motor')
    } finally {
      await sql`DROP TRIGGER qa_alterar ON conjunto_parametros_despiece`
      await sql`DROP FUNCTION qa_alterar()`
    }
  })

  it('revierte todo si un origen está incompleto', async () => {
    const antes = await filasMotor()
    writeFileSync(join(origen, 'ConjuntosDescuentos.csv'), csv.ConjuntosDescuentos + 'QA-S,001,E,M,G,99\n')
    await expect(cargarMotorCatalogo(sql, origen, { aplicar: true })).rejects.toThrow('actualización revertida')
    expect(await filasMotor()).toEqual(antes)
    writeFileSync(join(origen, 'ConjuntosDescuentos.csv'), csv.ConjuntosDescuentos)
  }, 30000)

  it('se niega sin la migración del motor', async () => {
    await sql`DROP TABLE conjunto_ranuras_vacias`
    await expect(cargarMotorCatalogo(sql, origen)).rejects.toBeInstanceOf(AbortoMotor)
  }, 30000)
})
