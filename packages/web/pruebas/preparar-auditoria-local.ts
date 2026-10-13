/**
 * Catálogo enteramente sintético para recorridos de navegador.
 * Destino fijo, separado de las suites y sin lectura de .env ni datos reales.
 * Crear antes: docker exec aluminior_pg_test createdb -U aluminior aluminior_audit_test
 * Ejecutar: npx tsx packages/web/pruebas/preparar-auditoria-local.ts
 * No reinicia ni borra datos; si ya se preparó, conserva la base y aborta.
 */
import { fileURLToPath } from 'node:url'
import { sql } from 'drizzle-orm'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { crearDb, schema } from '@aluminior/db'
import { J04, configuracionJ04, sembrarCatalogoJ04 } from '../app/dashboard/presupuestos/_lib/cerramientos/catalogo-j04.fixture.ts'
import { valorarCerramiento } from '../app/dashboard/presupuestos/_lib/cerramientos/valorar-cerramiento.ts'

const URL_QA = 'postgres://aluminior:aluminior@localhost:55433/aluminior_audit_test'

async function main() {
  const db = crearDb(URL_QA)
  try {
    const [destino] = await db.execute<{ nombre: string }>(sql`SELECT current_database() AS nombre`)
    if (destino.nombre !== 'aluminior_audit_test') throw new Error('Destino QA inesperado')
    // Mismo stub que test-auth-bootstrap.sql para la FK de perfiles. No crea
    // usuarios ni sustituye Supabase Auth: el acceso QA está limitado a loopback.
    await db.execute(sql`CREATE SCHEMA IF NOT EXISTS auth`)
    await db.execute(sql`CREATE TABLE IF NOT EXISTS auth.users (id uuid PRIMARY KEY)`)
    await migrate(db, { migrationsFolder: fileURLToPath(new URL('../../db/migrations', import.meta.url)) })
    const resultado = await db.transaction(async tx => {
      const [estado] = await tx.execute<{ ocupada: boolean }>(sql`
        SELECT EXISTS (SELECT 1 FROM presupuestos) OR EXISTS (SELECT 1 FROM articulos)
          OR EXISTS (SELECT 1 FROM clientes) OR EXISTS (SELECT 1 FROM estructuras) AS ocupada
      `)
      if (estado.ocupada) throw new Error('La base QA ya contiene datos; se conserva sin sembrar')
      await sembrarCatalogoJ04(tx)
      await tx.insert(schema.tarifas).values({ id: 1, descripcion: 'Tarifa SINTÉTICA auditoría', activa: true })
      await tx.execute(sql`
        INSERT INTO articulos_pvp (articulo_codigo, acabado_codigo, tarifa, precio)
        SELECT articulo_codigo, acabado_codigo, 1, precio FROM articulos_pvp WHERE tarifa = 9
      `)
      await tx.insert(schema.articulos).values([
        { codigo: 'MO', descripcion: 'Fabricación SINTÉTICA por minuto', tipoMetraje: 'UD' },
        { codigo: 'MOCOL', descripcion: 'Colocación SINTÉTICA por minuto', tipoMetraje: 'UD' },
      ])
      for (const codigo of ['MO', 'MOCOL']) {
        await tx.insert(schema.articulosPvp).values({ articuloCodigo: codigo, acabadoCodigo: 'UNI', tarifa: 1, precio: '0.50' })
        await tx.insert(schema.articulosCoste).values({ articuloCodigo: codigo, acabadoCodigo: 'UNI', proveedorCodigo: 'QA-PROV', coste: '0.25' })
      }
      const configuracion = configuracionJ04()
      configuracion.modulos = configuracion.modulos.slice(0, 1)
      configuracion.uniones = []
      const entrada = { configuracion, serieCodigo: J04.serie, acabadoCodigo: J04.acabado,
        vidrioCodigo: J04.vidrio, varianteAcristalamiento: '1' as const, tarifa: 1 }
      const valorado = await valorarCerramiento(tx, entrada)
      if (!valorado.ventaMateriales.completo || valorado.ventaMateriales.importe !== '76.84')
        throw new Error('El catálogo QA no reproduce el importe sintético esperado')
      const incompleto = await valorarCerramiento(tx, { ...entrada, vidrioCodigo: null })
      if (incompleto.ventaMateriales.completo || incompleto.ventaMateriales.importe !== null)
        throw new Error('El catálogo QA no conserva el caso incompleto')
      return { base: destino.nombre, tarifa: 1, serie: J04.serie, acabado: J04.acabado,
        vidrio: J04.vidrio, modelo: '0', anchoMm: 1200, altoMm: 800,
        varianteAcristalamiento: '1', precioSintetico: valorado.ventaMateriales.importe,
        incompletoSinVidrio: true }
    })
    console.log(JSON.stringify(resultado, null, 2))
  } finally {
    await db.$client.end()
  }
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
