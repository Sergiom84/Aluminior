/**
 * Atomicidad de `escribirCopia` contra PostgreSQL EFÍMERO (T.72.1, prueba 9).
 *
 * `escribirCopia` inserta cabecera, líneas y satélites en la MISMA
 * transacción que le pasa `copiarPresupuesto` (`ejecutarConNumeracion`). Aquí
 * se fuerza un fallo REAL —una violación de `mano_obra_minutos_check`, no un
 * doble simulado— en el satélite de la segunda línea y se comprueba que ni la
 * cabecera nueva ni la primera línea, ya insertadas antes del fallo, quedan
 * escritas: o se copia el documento completo, o no queda nada.
 *
 *   docker compose -f packages/db/docker-compose.yml up -d
 *   npm run -w @aluminior/web test
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { escribirCopia } from './escribir-copia.ts'
import { leerDocumentoOrigen, lineaOrigenDe } from './leer-origen.ts'
import { OPCIONES_COPIA_IDENTICA } from './plan-copia.ts'
import { MAPA_VACIO } from './mapa-sustitucion.ts'
import { planificarCopia } from './plan-copia.ts'

const urlPruebas = urlDePruebasValidada(process.env.TEST_DATABASE_URL)
const NOMBRE_PRUEBA = 'PRUEBA AUTOMÁTICA ROLLBACK COPIA'
const NUMERO = 999985

describe('escribirCopia, atomicidad contra PostgreSQL', () => {
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

    const [primera] = await db.insert(schema.lineas).values({
      presupuestoId: origenId, orden: 1, tipo: 'ARTICULO',
      descripcion: 'ARTÍCULO SIN SATÉLITE', cantidad: '1',
      precioUnitario: '10.0000', total: '10.00', valoracionCompleta: true,
    }).returning({ id: schema.lineas.id })

    const [segunda] = await db.insert(schema.lineas).values({
      presupuestoId: origenId, orden: 2, tipo: 'ESTRUCTURA',
      descripcion: 'VENTANA CON MANO DE OBRA', cantidad: '1', anchoMm: 1000, altoMm: 1000,
      precioUnitario: '50.0000', total: '50.00', valoracionCompleta: true,
    }).returning({ id: schema.lineas.id })
    await db.insert(schema.lineasManoObra).values({
      lineaId: segunda.id, concepto: 'COLOCACION', origen: 'MANUAL',
      horas: '1.50', minutos: '90.00',
      articuloCodigo: 'MOCOL', articuloDescripcion: 'MANO DE OBRA DE COLOCACIÓN (MINUTOS)',
      unidad: 'MINUTO', acabadoCodigo: 'UNI', tarifa: 1,
      precioMinuto: '0.5000', importe: '45.00', costeMinuto: '0.5000', costeTotal: '45.00',
      valoracionCompleta: true,
    })
    void primera
  }, 60_000)

  afterAll(async () => { await limpiar() })

  it('un fallo real al escribir el satélite de la segunda línea revierte cabecera y líneas ya escritas', async () => {
    const origen = await leerDocumentoOrigen(db, origenId)
    if (!origen) throw new Error('origen de prueba no encontrado')

    const plan = planificarCopia(origen.lineas.map(lineaOrigenDe), { ...OPCIONES_COPIA_IDENTICA, mapa: MAPA_VACIO })
    if (!plan.ok) throw new Error(plan.errores.join('; '))

    // Corrompe SÓLO el satélite de la segunda línea: minutos = 0 viola
    // `mano_obra_minutos_check` (minutos > 0). Es una violación real de
    // PostgreSQL, no un doble simulado.
    const lineasCorrompidas = origen.lineas.map((entrada) => (
      entrada.manoObra.length
        ? { ...entrada, manoObra: entrada.manoObra.map((fila) => ({ ...fila, minutos: '0.00' })) }
        : entrada
    ))

    await expect(db.transaction((tx) => escribirCopia(tx, {
      origen: origen.presupuesto,
      lineas: lineasCorrompidas,
      plan: plan.plan,
      cabecera: { destino: { numero: NUMERO, revision: 5, serie: 'A' }, fecha: '2026-02-01', creadoPor: null },
    }))).rejects.toThrow()

    // Ni la cabecera nueva (revisión 5) ni la primera línea, insertada antes
    // del fallo, sobreviven: la transacción no dejó nada a medias.
    const cabeceras = await db.select().from(schema.presupuestos)
      .where(eq(schema.presupuestos.nombreLibre, NOMBRE_PRUEBA))
    expect(cabeceras).toHaveLength(1)
    expect(cabeceras[0].id).toBe(origenId)

    const lineasOrigen = await db.select().from(schema.lineas)
      .where(eq(schema.lineas.presupuestoId, origenId))
    expect(lineasOrigen).toHaveLength(2)
  })
})
