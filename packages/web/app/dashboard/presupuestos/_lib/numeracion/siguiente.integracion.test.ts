import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { siguienteNumeroPrevisto } from './siguiente.ts'

const urlPruebas = urlDePruebasValidada(process.env.TEST_DATABASE_URL)
const NOMBRE = 'PRUEBA AUTOMÁTICA SIGUIENTE NÚMERO'
// Ejercicio 32: rango propio, aislado de las demás suites.

describe('siguiente número previsto', () => {
  let db: ReturnType<typeof crearDb>
  const limpiar = () => db.delete(schema.presupuestos).where(eq(schema.presupuestos.nombreLibre, NOMBRE))
  beforeAll(() => { db = crearDb(urlPruebas) })
  beforeEach(limpiar)
  afterAll(async () => { try { await limpiar() } finally { await db.$client.end({ timeout: 5 }) } })

  it('empieza en 0001 con el ejercicio vacío y sigue al máximo sin reservar nada', async () => {
    expect(await siguienteNumeroPrevisto(db, '2032-03-01')).toBe(320001)
    await db.insert(schema.presupuestos).values({
      numero: 320007, revision: 0, serie: 'A', fecha: '2032-03-01', nombreLibre: NOMBRE, tarifa: 1, estado: 'PENDIENTE',
    })
    expect(await siguienteNumeroPrevisto(db, '2032-03-02')).toBe(320008)
    expect(await siguienteNumeroPrevisto(db, '2032-03-02')).toBe(320008)
  })

  it('devuelve null con una fecha imposible', async () => {
    expect(await siguienteNumeroPrevisto(db, '2032-02-31')).toBeNull()
  })
})
