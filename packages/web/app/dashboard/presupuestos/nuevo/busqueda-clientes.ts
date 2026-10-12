import type { ClienteEncontrado } from '../_lib/cabecera/buscar-clientes.ts'

export type EstadoBusquedaClientes = {
  consulta: string
  estado: 'PENDIENTE' | 'LISTA' | 'ERROR'
  clientes: ClienteEncontrado[]
}

/** Una consulta cancelada nunca reemplaza las opciones de la consulta actual. */
export function iniciarBusquedaClientes(
  consulta: string,
  buscar: (consulta: string) => Promise<ClienteEncontrado[]>,
  recibir: (estado: EstadoBusquedaClientes) => void,
) {
  let vigente = true
  recibir({ consulta, estado: 'PENDIENTE', clientes: [] })
  const terminada = Promise.resolve().then(async () => {
    if (!vigente) return
    try {
      const clientes = await buscar(consulta)
      if (vigente) recibir({ consulta, estado: 'LISTA', clientes })
    } catch {
      if (vigente) recibir({ consulta, estado: 'ERROR', clientes: [] })
    }
  })
  return { cancelar: () => { vigente = false }, terminada }
}

export function clientesVigentes(consulta: string, busqueda: EstadoBusquedaClientes) {
  return busqueda.consulta === consulta && busqueda.estado === 'LISTA' ? busqueda.clientes : []
}
