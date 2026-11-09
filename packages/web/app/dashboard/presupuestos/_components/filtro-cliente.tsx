'use client'

import { useRouter } from 'next/navigation'
import { SelectorCliente } from '../nuevo/selector-cliente.tsx'
import type { ClienteEncontrado } from '../_lib/cabecera/buscar-clientes.ts'

export function FiltroCliente({
  inicial, busqueda,
}: {
  inicial: { codigo: string; nombre: string } | null
  busqueda: string
}) {
  const router = useRouter()
  const elegir = (cliente: ClienteEncontrado) => {
    const params = new URLSearchParams()
    if (busqueda) params.set('q', busqueda)
    params.set('cliente', cliente.codigo)
    router.push(`/dashboard/presupuestos?${params}`)
  }

  return (
    <div className="al-client-filter">
      <SelectorCliente inicial={inicial} onElegir={elegir} />
    </div>
  )
}
