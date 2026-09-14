import { afterAll, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import { actualizarCabecera } from '../cabecera/editar'
import { contextoEdicion } from './edicion.fixture'

const c = contextoEdicion()
afterAll(c.cerrar)
it('conserva identidad, tarifa, autor, importes y líneas al cambiar cabecera', async () => {
  const { p } = await c.preparar(), codigo = c.serie
  await c.db.insert(schema.clientes).values({ codigo, nombre: 'Cliente', tarifa: 9 })
  await c.db.insert(schema.clientesPotenciales).values({ codigo, nombre: 'Potencial' })
  try {
    const inicial = await c.leer(p.id)
    for (const campos of [
      { clienteCodigo: codigo, potencialCodigo: '' }, { clienteCodigo: '', potencialCodigo: codigo },
      { clienteCodigo: '', potencialCodigo: '' },
    ]) {
      const entrada = { presupuestoId: p.id, ...campos, nombreLibre: 'Personalizado', obraTexto: 'Obra escrita',
        formaPago: 'Plazo inicial', observaciones: 'Primera condición\nSegunda condición' }
      expect((await actualizarCabecera(c.db, entrada)).ok).toBe(true)
      const despues = await c.leer(p.id)
      expect(despues.lineas).toEqual(inicial.lineas)
      const { presupuestoId, ...valores } = entrada
      expect(despues.cabecera[0]).toEqual({ ...inicial.cabecera[0], ...valores,
        clienteCodigo: campos.clienteCodigo || null, potencialCodigo: campos.potencialCodigo || null })
    }
  } finally {
    await c.db.update(schema.presupuestos).set({ clienteCodigo: null, potencialCodigo: null }).where(eq(schema.presupuestos.id, p.id))
    await c.db.delete(schema.clientesPotenciales).where(eq(schema.clientesPotenciales.codigo, codigo))
    await c.db.delete(schema.clientes).where(eq(schema.clientes.codigo, codigo))
  }
})
it('valida existencia y exclusión; rechaza campos protegidos y estados sin escritura', async () => {
  const { p } = await c.preparar(), antes = await c.leer(p.id)
  for (const cambio of [{ clienteCodigo: c.serie }, { potencialCodigo: c.serie },
    { clienteCodigo: 'A', potencialCodigo: 'B' }, { tarifa: 9 }, { total: '1' },
    { nombreLibre: 'x'.repeat(201) }]) {
    expect((await actualizarCabecera(c.db, { presupuestoId: p.id, nombreLibre: 'Libre', ...cambio })).ok).toBe(false)
    expect(await c.leer(p.id)).toEqual(antes)
  }
  for (const estado of ['ACEPTADO', 'RECHAZADO', 'ANULADO']) {
    await c.db.update(schema.presupuestos).set({ estado }).where(eq(schema.presupuestos.id, p.id))
    const protegido = await c.leer(p.id)
    expect((await actualizarCabecera(c.db, { presupuestoId: p.id, nombreLibre: 'No' })).ok).toBe(false)
    expect(await c.leer(p.id)).toEqual(protegido)
  }
})
