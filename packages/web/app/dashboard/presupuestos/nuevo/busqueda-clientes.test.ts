import { describe, expect, it, vi } from 'vitest'
import { clientesVigentes, iniciarBusquedaClientes, type EstadoBusquedaClientes } from './busqueda-clientes.ts'

const anterior = { codigo: 'QA001', nombre: 'Cliente anterior sintético', poblacion: null }
const actual = { codigo: 'QA002', nombre: 'Cliente actual sintético', poblacion: null }
const pendiente = <T>() => {
  let resolver!: (valor: T) => void
  let rechazar!: (motivo: Error) => void
  const promesa = new Promise<T>((resolve, reject) => { resolver = resolve; rechazar = reject })
  return { promesa, resolver, rechazar }
}

describe('selección de cliente durante consultas asíncronas', () => {
  it('deja de ofrecer el cliente anterior desde que cambia el texto', () => {
    const cargada: EstadoBusquedaClientes = { consulta: 'anterior', estado: 'LISTA', clientes: [anterior] }
    expect(clientesVigentes('actual', cargada)).toEqual([])
    expect(clientesVigentes('anterior', { ...cargada, estado: 'PENDIENTE' })).toEqual([])
  })

  it('descarta una respuesta antigua aunque llegue después de la actual', async () => {
    const vieja = pendiente<typeof anterior[]>()
    let estado!: EstadoBusquedaClientes
    const recibir = (siguiente: EstadoBusquedaClientes) => { estado = siguiente }
    const primera = iniciarBusquedaClientes('anterior', () => vieja.promesa, recibir)
    await Promise.resolve()
    primera.cancelar()
    const segunda = iniciarBusquedaClientes('actual', async () => [actual], recibir)
    await segunda.terminada
    vieja.resolver([anterior])
    await primera.terminada
    expect(clientesVigentes('actual', estado)).toEqual([actual])
  })

  it('no publica un error de una consulta que el usuario ya abandonó', async () => {
    const vieja = pendiente<typeof anterior[]>()
    const recibir = vi.fn()
    const peticion = iniciarBusquedaClientes('anterior', () => vieja.promesa, recibir)
    await Promise.resolve()
    peticion.cancelar()
    vieja.rechazar(new Error('Fallo de transporte'))
    await expect(peticion.terminada).resolves.toBeUndefined()
    expect(recibir).toHaveBeenCalledTimes(1)
    expect(recibir).toHaveBeenLastCalledWith({ consulta: 'anterior', estado: 'PENDIENTE', clientes: [] })
  })

  it('recupera un fallo de transporte al reintentar la misma consulta', async () => {
    let estado!: EstadoBusquedaClientes
    const recibir = (siguiente: EstadoBusquedaClientes) => { estado = siguiente }
    await iniciarBusquedaClientes('actual', async () => { throw new Error('Desconectado') }, recibir).terminada
    expect(estado).toEqual({ consulta: 'actual', estado: 'ERROR', clientes: [] })
    const reintento = iniciarBusquedaClientes('actual', async () => [actual], recibir)
    expect(clientesVigentes('actual', estado)).toEqual([])
    await reintento.terminada
    expect(clientesVigentes('actual', estado)).toEqual([actual])
    expect(clientesVigentes('actual', estado)[0].codigo).toBe('QA002')
  })

  it('no inicia el transporte si se cierra antes de ejecutar la consulta', async () => {
    const buscar = vi.fn(async () => [actual])
    const peticion = iniciarBusquedaClientes('actual', buscar, () => {})
    peticion.cancelar()
    await peticion.terminada
    expect(buscar).not.toHaveBeenCalled()
  })
})
