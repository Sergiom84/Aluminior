import { afterAll, it, expect } from 'vitest'
import { eq } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import { contextoEdicion } from '../edicion/edicion.fixture.ts'
import { guardarPreferenciaMedidas } from './preferencia.ts'

const c = contextoEdicion()
afterAll(c.cerrar)
it('guarda y recupera cada preferencia por presupuesto, sin cambiar las líneas ni otra cabecera', async () => {
  const { p } = await c.preparar()
  const { p: otro } = await c.preparar()
  const inicial = await c.leer(p.id)
  for (const preferencia of ['COPIAR_PRIMERA', 'MODELO', 'PREGUNTAR']) {
    expect(await guardarPreferenciaMedidas(c.db, { presupuestoId: p.id, preferencia })).toEqual({ ok: true })
    const releido = await c.leer(p.id)
    expect(releido).toEqual({ ...inicial, cabecera: [{ ...inicial.cabecera[0], medidasNuevasVentanas: preferencia }] })
    expect((await c.leer(otro.id)).cabecera[0].medidasNuevasVentanas).toBe('PREGUNTAR')
  }
})
it('rechaza valores desconocidos, IDs inválidos y presupuestos no pendientes', async () => {
  const { p } = await c.preparar()
  const antes = await c.leer(p.id)
  expect((await guardarPreferenciaMedidas(c.db, { presupuestoId: p.id, preferencia: 'OTRA' })).ok).toBe(false)
  expect((await guardarPreferenciaMedidas(c.db, { presupuestoId: 'x', preferencia: 'MODELO' })).ok).toBe(false)
  expect(await c.leer(p.id)).toEqual(antes)
  await c.db.update(schema.presupuestos).set({ estado: 'ACEPTADO' }).where(eq(schema.presupuestos.id, p.id))
  expect((await guardarPreferenciaMedidas(c.db, { presupuestoId: p.id, preferencia: 'MODELO' })).ok).toBe(false)
  expect((await c.leer(p.id)).cabecera[0].medidasNuevasVentanas).toBe('PREGUNTAR')
})
