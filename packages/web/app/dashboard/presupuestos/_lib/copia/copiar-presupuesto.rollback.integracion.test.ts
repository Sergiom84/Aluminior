/**
 * Atomicidad de `copiarPresupuesto` contra PostgreSQL EFÍMERO (T.72.1.1,
 * prueba 9), atravesando la frontera productiva REAL:
 * `copiarPresupuesto` -> `ejecutarConNumeracion` -> `escribirCopia`. No llama
 * a `escribirCopia` sola —eso no demuestra que la transacción que usa
 * producción sea atómica, sólo que la función lo sea en aislamiento—.
 *
 * El fallo es un trigger de PostgreSQL de verdad, instalado y retirado por
 * esta suite, que sólo dispara al insertar la fila marcada con un código
 * único de esta prueba (`MARCADOR`): ninguna otra fila, propia o de otra
 * suite en paralelo, lo activa.
 *
 *   docker compose -f packages/db/docker-compose.yml up -d
 *   npm run -w @aluminior/web test
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { eq, sql } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { copiarPresupuesto } from './copiar-presupuesto.ts'
import { MAPA_VACIO } from './mapa-sustitucion.ts'
import { OPCIONES_COPIA_IDENTICA } from './plan-copia.ts'

const urlPruebas = urlDePruebasValidada(process.env.TEST_DATABASE_URL)
const NOMBRE_PRUEBA = 'PRUEBA AUTOMÁTICA ROLLBACK COPIA T7211'
const NUMERO = 999983
const MARCADOR = 'ZZ72_1_1_MARCADOR'
const FUNCION = 't72_1_1_rollback_marcador'
const TRIGGER = 't72_1_1_rollback_marcador_trg'

describe('copiarPresupuesto, atomicidad real contra PostgreSQL', () => {
  let db: ReturnType<typeof crearDb>
  let origenId = ''

  const limpiar = () => db.delete(schema.presupuestos)
    .where(eq(schema.presupuestos.nombreLibre, NOMBRE_PRUEBA))

  beforeAll(async () => {
    db = crearDb(urlPruebas)
    await limpiar()

    const [cabecera] = await db.insert(schema.presupuestos).values({
      numero: NUMERO, revision: 0, serie: 'A', fecha: '2026-01-15',
      nombreLibre: NOMBRE_PRUEBA, tarifa: 1, estado: 'PENDIENTE',
    }).returning({ id: schema.presupuestos.id })
    origenId = cabecera.id

    // Primera línea, sin satélite: si sobreviviera sola, demostraría que la
    // escritura no es atómica.
    await db.insert(schema.lineas).values({
      presupuestoId: origenId, orden: 1, tipo: 'ARTICULO',
      descripcion: 'ARTÍCULO SIN SATÉLITE', cantidad: '1',
      precioUnitario: '10.0000', total: '10.00', valoracionCompleta: true,
    })

    // Segunda línea, con el marcador único de esta prueba en su satélite.
    const [segunda] = await db.insert(schema.lineas).values({
      presupuestoId: origenId, orden: 2, tipo: 'ESTRUCTURA',
      descripcion: 'VENTANA CON MARCADOR DE PRUEBA', cantidad: '1', anchoMm: 1000, altoMm: 1000,
      precioUnitario: '50.0000', total: '50.00', valoracionCompleta: true,
    }).returning({ id: schema.lineas.id })
    await db.insert(schema.lineasEstructura).values({
      lineaId: segunda.id, serieCodigo: 'A', estructuraCodigo: MARCADOR,
      acabadoCodigo: null, accesoriosAcabado: null, maderaCodigo: null,
      horasFabricacion: '0', horasColocacion: '0',
    })

    await db.execute(sql.raw(`
      CREATE OR REPLACE FUNCTION ${FUNCION}() RETURNS trigger AS $$
      BEGIN
        RAISE EXCEPTION 'T.72.1.1: fallo forzado de prueba en satelite marcado';
      END;
      $$ LANGUAGE plpgsql;
    `))
    await db.execute(sql.raw(`
      CREATE TRIGGER ${TRIGGER}
      BEFORE INSERT ON lineas_estructura
      FOR EACH ROW WHEN (NEW.estructura_codigo = '${MARCADOR}')
      EXECUTE FUNCTION ${FUNCION}();
    `))
  }, 60_000)

  afterAll(async () => {
    // Se retira SIEMPRE, incluso si alguna prueba de este fichero falla.
    await db.execute(sql.raw(`DROP TRIGGER IF EXISTS ${TRIGGER} ON lineas_estructura`))
    await db.execute(sql.raw(`DROP FUNCTION IF EXISTS ${FUNCION}()`))
    await limpiar()
  })

  it('un fallo real al escribir el satélite marcado revierte cabecera y líneas, y deja el origen intacto', async () => {
    const antesLineas = await db.select().from(schema.lineas)
      .where(eq(schema.lineas.presupuestoId, origenId))
    const antesCabeceras = await db.select().from(schema.presupuestos)
      .where(eq(schema.presupuestos.numero, NUMERO))

    await expect(copiarPresupuesto(db, {
      presupuestoId: origenId,
      destino: { estrategia: 'MISMO_NUMERO_NUEVA_REVISION' },
      opciones: { ...OPCIONES_COPIA_IDENTICA, mapa: MAPA_VACIO },
    })).rejects.toMatchObject({ cause: { code: 'P0001', message: expect.stringMatching(/T\.72\.1\.1/) } })

    // El origen no perdió ni ganó ninguna línea.
    const despuesLineas = await db.select().from(schema.lineas)
      .where(eq(schema.lineas.presupuestoId, origenId))
    expect(despuesLineas).toEqual(antesLineas)

    // Ninguna cabecera ni satélite nuevos quedaron escritos: sólo sigue la
    // revisión 0 del origen.
    const cabeceras = await db.select().from(schema.presupuestos)
      .where(eq(schema.presupuestos.numero, NUMERO))
    expect(cabeceras).toEqual(antesCabeceras)
    expect(cabeceras).toHaveLength(1)

    const estructurasMarcadas = await db.select().from(schema.lineasEstructura)
      .where(eq(schema.lineasEstructura.estructuraCodigo, MARCADOR))
    expect(estructurasMarcadas).toHaveLength(1)
  })
})
