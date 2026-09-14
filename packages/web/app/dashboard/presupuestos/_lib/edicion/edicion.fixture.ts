import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'

export function contextoEdicion() {
  const cliente = postgres(urlDePruebasValidada(process.env.TEST_DATABASE_URL), { max: 5 })
  const db = drizzle(cliente, { schema }), serie = `J07-${randomUUID()}`
  const ids: string[] = []
  async function preparar() {
    const [p] = await db.insert(schema.presupuestos).values({ numero: ids.length + 1, serie, revision: 2,
      fecha: '2026-09-08', nombreLibre: 'J07 propio', obraTexto: 'Obra inicial', tarifa: 1,
      creadoPor: 'sintetico@aluminior.test', subtotal: '40', baseImponible: '40', cuotaIva: '8.4', total: '48.4' }).returning()
    ids.push(p.id)
    const [l] = await db.insert(schema.lineas).values({ presupuestoId: p.id, orden: 7, tipo: 'ARTICULO',
      descripcion: 'Artículo guardado', cantidad: '2', precioUnitario: '20', total: '40', referencia: 'Antes' }).returning()
    return { p, l }
  }
  async function leer(id: string) {
    return { cabecera: await db.select().from(schema.presupuestos).where(eq(schema.presupuestos.id, id)),
      lineas: await db.select().from(schema.lineas).where(eq(schema.lineas.presupuestoId, id)) }
  }
  async function cerrar() {
    try { for (const id of ids) await db.delete(schema.presupuestos).where(eq(schema.presupuestos.id, id)) }
    finally { await cliente.end() }
  }
  return { db, cliente, preparar, leer, cerrar, serie }
}
