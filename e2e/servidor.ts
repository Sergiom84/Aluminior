import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import postgres from 'postgres'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { crearDb, schema } from '@aluminior/db'
import { eq } from 'drizzle-orm'
import { entornoE2e } from './entorno.ts'
import { sembrarCatalogoJ04, J04 } from '../packages/web/app/dashboard/presupuestos/_lib/cerramientos/catalogo-j04.fixture.ts'

const { origen, destino } = entornoE2e()
const admin = postgres(origen)
if (!(await admin`select 1 from pg_database where datname = 'aluminior_e2e_test'`).length)
  await admin.unsafe('CREATE DATABASE aluminior_e2e_test')
await admin.end()
const db = crearDb(destino)
await db.$client.unsafe('CREATE SCHEMA IF NOT EXISTS auth; CREATE TABLE IF NOT EXISTS auth.users (id uuid PRIMARY KEY)')
await migrate(db, { migrationsFolder: fileURLToPath(new URL('../packages/db/migrations', import.meta.url)) })
if (!(await db.select().from(schema.tarifas).where(eq(schema.tarifas.id, J04.tarifa))).length)
  await db.transaction(tx => sembrarCatalogoJ04(tx))
await db.$client.end()
const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', 'packages/web', '--hostname', '127.0.0.1', '--port', '3020'], {
  stdio: 'inherit', env: { ...process.env, DATABASE_URL: destino, NODE_ENV: 'development',
    ALUMINIOR_QA_AUTH_BYPASS: '1', SUPABASE_URL: '', SUPABASE_ANON_KEY: '' },
})
for (const signal of ['SIGTERM', 'SIGINT'] as const) process.on(signal, () => child.kill(signal))
child.on('exit', code => process.exit(code ?? 0))
