/** Prioridad documental compartida; no modifica el nombre libre ni la obra guardados. */
export function resolverDestinatarioPresupuesto(datos: {
  clienteNombre?: string | null
  potencialNombre?: string | null
  nombreLibre?: string | null
}): string {
  return datos.clienteNombre ?? datos.potencialNombre ?? datos.nombreLibre ?? 'Sin destinatario'
}
