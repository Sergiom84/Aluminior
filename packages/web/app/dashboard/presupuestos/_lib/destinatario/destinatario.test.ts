import { expect, it } from 'vitest'
import { resolverDestinatarioPresupuesto } from './index'

it('prioriza cliente, potencial y libre sin combinar ni alterar los datos escritos', () => {
  const datos = { clienteNombre: 'Cliente', potencialNombre: 'Potencial', nombreLibre: 'Mi nombre escrito' }
  expect(resolverDestinatarioPresupuesto(datos)).toBe('Cliente')
  expect(resolverDestinatarioPresupuesto({ ...datos, clienteNombre: null })).toBe('Potencial')
  expect(resolverDestinatarioPresupuesto({ nombreLibre: datos.nombreLibre })).toBe('Mi nombre escrito')
  expect(datos.nombreLibre).toBe('Mi nombre escrito')
  expect(resolverDestinatarioPresupuesto({})).toBe('Sin destinatario')
})
