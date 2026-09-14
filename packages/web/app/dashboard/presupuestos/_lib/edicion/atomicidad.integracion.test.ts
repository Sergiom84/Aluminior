import { afterAll, expect, it } from 'vitest'
import { eq, sql } from 'drizzle-orm'
import { schema, type Db } from '@aluminior/db'
import { actualizarArticulo } from '../articulos/edicion/editar'
import { actualizarCabecera } from '../cabecera/editar'
import { conPresupuestoBloqueado } from '../lineas/con-presupuesto-bloqueado'
import { contextoEdicion } from './edicion.fixture'

const c = contextoEdicion()
afterAll(c.cerrar)
const puerta = () => { let abrir!: () => void; const promesa = new Promise<void>(r => { abrir = r }); return { abrir, promesa } }

it('revierte la línea si falla SQL al recalcular la cabecera', async () => {
  const { p, l } = await c.preparar(), antes = await c.leer(p.id)
  let ejecuciones = 0
  const db: Pick<Db, 'transaction'> = { transaction: (operacion, opciones) => c.db.transaction(tx =>
    operacion(new Proxy(tx, { get(target, propiedad, receptor) {
      if (propiedad === 'execute') return (...args: Parameters<typeof tx.execute>) => {
        ejecuciones++
        // Primera sentencia: lock real. Segunda: recálculo después del UPDATE de línea.
        return ejecuciones === 2 ? target.execute(sql`SELECT 1 / 0`) : target.execute(...args)
      }
      return Reflect.get(target, propiedad, receptor)
    } })), opciones) }
  await expect(actualizarArticulo(db, { presupuestoId: p.id, lineaId: l.id, cantidad: '3' })).rejects.toThrow()
  expect(ejecuciones).toBe(2)
  expect(await c.leer(p.id)).toEqual(antes)
})

it.each(['articulo', 'cabecera'] as const)('%s espera el bloqueo y comprueba el estado recién confirmado', async tipo => {
  const { p, l } = await c.preparar(), listo = puerta(), liberar = puerta()
  let pid = 0
  const escritor = conPresupuestoBloqueado(c.db, p.id, async tx => {
    const filas = await tx.execute<{ pid: number }>(sql`SELECT pg_backend_pid() AS pid`)
    pid = filas[0].pid
    await tx.update(schema.presupuestos).set({ estado: 'ACEPTADO' }).where(eq(schema.presupuestos.id, p.id))
    listo.abrir(); await liberar.promesa
  })
  await listo.promesa
  const edicion = tipo === 'articulo'
    ? actualizarArticulo(c.db, { presupuestoId: p.id, lineaId: l.id, cantidad: '3' })
    : actualizarCabecera(c.db, { presupuestoId: p.id, nombreLibre: 'Cambio concurrente' })
  try {
    let observado = false
    for (let i = 0; i < 150; i++) {
      const filas = await c.db.execute<{ query: string }>(sql`SELECT query FROM pg_stat_activity WHERE ${pid} = ANY(pg_blocking_pids(pid))`)
      if (filas.some(f => /FOR UPDATE/i.test(f.query))) { observado = true; break }
      await new Promise(r => setTimeout(r, 10))
    }
    expect(observado).toBe(true)
  } finally { liberar.abrir(); await Promise.allSettled([escritor, edicion]) }
  expect((await edicion).ok).toBe(false)
  const despues = await c.leer(p.id)
  expect(despues.lineas).toEqual([l])
  expect(despues.cabecera).toEqual([{ ...p, estado: 'ACEPTADO' }])
}, 10000)
