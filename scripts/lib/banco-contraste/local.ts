/** Infraestructura de medición: destino cerrado, ninguna lectura de .env. */
import postgres, { type Sql } from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { schema } from '@aluminior/db'
import { crearCargador, cargarMaestros, cargarEstructuras, cargarSeries, cargarCostes,
  cargarPvp, cargarMotorCatalogo, type Cargar, type Resultado } from '@aluminior/etl/banco-contraste'

export const URL_LOCAL = 'postgres://aluminior:aluminior@127.0.0.1:55433/aluminior_real_test'
export function validarLocal(valor: string) {
  const u = new URL(valor)
  if (!['postgres:', 'postgresql:'].includes(u.protocol) ||
    !['localhost', '127.0.0.1', '[::1]'].includes(u.hostname) || u.port !== '55433' ||
    u.pathname !== '/aluminior_real_test' || u.search || u.hash) throw new Error('Solo se permite Postgres local :55433/aluminior_real_test')
  return valor
}
export function conectarLocal(url: string) {
  const sql = postgres(validarLocal(url), { ssl: false, max: 5, onnotice: () => {}, connect_timeout: 10 })
  return { sql, db: drizzle(sql, { schema }) }
}
export async function prepararLocal(sql: Sql, origen: string) {
  await sql`CREATE SCHEMA IF NOT EXISTS auth`
  await sql`CREATE TABLE IF NOT EXISTS auth.users (id uuid PRIMARY KEY)`
  await migrate(drizzle(sql), { migrationsFolder: 'packages/db/migrations' })
  if ((await sql`SELECT count(*)::int AS n FROM estructuras`)[0]!.n !== 0) throw new Error('La base ya tiene catálogo. Para repetir usar medir; no se sobrescribe')
  const resultados = await sql.begin(async tx => {
    const s = tx as unknown as Sql, cargar = crearCargador(s, origen)
    // Reutilizamos los mapeadores; no importamos clientes, proveedores ni obras.
    const sinPersonas: Cargar = async (o, d, m) => ['clientes', 'proveedores', 'obras'].includes(d)
      ? { tabla: d, leidas: 0, insertadas: 0, descartadas: 0, excluidas: 0, motivos: new Map([['fuera del banco técnico', 1]]) }
      : cargar(o, d, m)
    const rs: Resultado[] = [...await cargarMaestros(sinPersonas), ...await cargarEstructuras(cargar),
      ...await cargarSeries(s, origen, cargar), ...await cargarCostes(s, cargar), ...await cargarPvp(cargar)]
    if (rs.some(r => r.descartadas > 0 || r.motivos.has('CSV no encontrado'))) throw new Error('Catálogo base incompleto; carga revertida')
    return rs.map(r => ({ tabla: r.tabla, insertadas: r.insertadas, descartadas: r.descartadas, excluidas: r.excluidas }))
  })
  const simulacion = await cargarMotorCatalogo(sql, origen, { aplicar: false })
  const aplicado = await cargarMotorCatalogo(sql, origen, { aplicar: true })
  return { migraciones: (await sql`SELECT count(*)::int AS n FROM drizzle.__drizzle_migrations`)[0]!.n,
    base: resultados, simulacion: simulacion.resultados.map(r => ({ tabla: r.tabla, filas: r.insertadas })),
    motor: aplicado.resultados.map(r => ({ tabla: r.tabla, filas: r.insertadas })),
    protegidas: aplicado.protegidas, medicionesHistoricasCargadas: false }
}
