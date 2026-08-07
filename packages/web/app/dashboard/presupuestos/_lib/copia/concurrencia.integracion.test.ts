/**
 * Concurrencia de `copiarPresupuesto` de punta a punta, contra PostgreSQL de
 * verdad (T.71.2). La reserva en sí —lock, relectura, colisión— ya se prueba
 * con una intercalación forzada en `../numeracion/reservar.integracion.test.ts`;
 * aquí se confirma que ESTA función, usada tal cual la usaría la acción,
 * pasa por la misma frontera y no duplica ni revienta bajo carrera real.
 *
 * `crearPresupuesto` usa exactamente `ejecutarConNumeracion` + `reservarNumeracion`
 * del mismo módulo (ver `acciones.ts`); no se repite aquí porque abre su
 * conexión con `DATABASE_URL` de producción, no con el Postgres efímero de
 * `TEST_DATABASE_URL`, y intercambiar esa fuente está fuera de esta unidad.
 *
 *   docker compose -f packages/db/docker-compose.yml up -d
 *   npm run -w @aluminior/web test
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { and, eq } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { copiarPresupuesto } from './copiar-presupuesto.ts'
import { MAPA_VACIO } from './mapa-sustitucion.ts'
import { OPCIONES_COPIA_IDENTICA } from './plan-copia.ts'

const urlPruebas = urlDePruebasValidada(process.env.TEST_DATABASE_URL)
const NOMBRE_PRUEBA = 'PRUEBA AUTOMÁTICA CONCURRENCIA COPIA'
const NUMERO = 999990

describe('concurrencia de copiarPresupuesto, contra PostgreSQL', () => {
  let db: ReturnType<typeof crearDb>
  let origenId = ''

  const limpiar = () => db.delete(schema.presupuestos)
    .where(eq(schema.presupuestos.nombreLibre, NOMBRE_PRUEBA))

  const contarFilas = (numero: number, revision: number) => db.select().from(schema.presupuestos)
    .where(and(
      eq(schema.presupuestos.numero, numero),
      eq(schema.presupuestos.revision, revision),
      eq(schema.presupuestos.serie, 'A'),
    )).then((filas) => filas.length)

  beforeAll(async () => {
    db = crearDb(urlPruebas)
    await limpiar()
    const [cabecera] = await db.insert(schema.presupuestos).values({
      numero: NUMERO, revision: 0, serie: 'A', fecha: '2026-01-01',
      nombreLibre: NOMBRE_PRUEBA, tarifa: 1, estado: 'PENDIENTE',
    }).returning({ id: schema.presupuestos.id })
    origenId = cabecera.id
  })

  afterAll(async () => { await limpiar() })

  it('dos copias simultáneas del mismo origen dan revisiones consecutivas, nunca duplicadas', async () => {
    const [r1, r2] = await Promise.all([
      copiarPresupuesto(db, {
        presupuestoId: origenId,
        destino: { estrategia: 'MISMO_NUMERO_NUEVA_REVISION' },
        opciones: { ...OPCIONES_COPIA_IDENTICA, mapa: MAPA_VACIO },
      }),
      copiarPresupuesto(db, {
        presupuestoId: origenId,
        destino: { estrategia: 'MISMO_NUMERO_NUEVA_REVISION' },
        opciones: { ...OPCIONES_COPIA_IDENTICA, mapa: MAPA_VACIO },
      }),
    ])

    expect(r1.ok).toBe(true)
    expect(r2.ok).toBe(true)
    if (!r1.ok || !r2.ok) return
    expect(new Set([r1.revision, r2.revision]).size).toBe(2)
    expect(Math.abs(r1.revision - r2.revision)).toBe(1)
  })

  it('destino manual ocupado bajo carrera real: uno gana, el otro recibe error y no crea fila', async () => {
    const destinoManual = { numero: NUMERO, revision: 77, serie: 'A' }

    const [r1, r2] = await Promise.all([
      copiarPresupuesto(db, {
        presupuestoId: origenId, destino: destinoManual,
        opciones: { ...OPCIONES_COPIA_IDENTICA, mapa: MAPA_VACIO },
      }),
      copiarPresupuesto(db, {
        presupuestoId: origenId, destino: destinoManual,
        opciones: { ...OPCIONES_COPIA_IDENTICA, mapa: MAPA_VACIO },
      }),
    ])

    const resultados = [r1, r2]
    const exitos = resultados.filter((r) => r.ok)
    const fallos = resultados.filter((r) => !r.ok)
    expect(exitos).toHaveLength(1)
    expect(fallos).toHaveLength(1)
    if (fallos[0].ok) return
    expect(fallos[0].errores).toEqual(['El destino ya está ocupado'])
    expect(await contarFilas(NUMERO, 77)).toBe(1)
  })
})
