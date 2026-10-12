/** La tarifa plana no acredita el precio de una tabla por dimensiones. */
export function incidenciaPrecioEnTabla(codigo: string, precioEnTabla: boolean | null | undefined): string | null {
  if (precioEnTabla === true) return `${codigo}: valoración por tabla sin regla verificada`
  if (precioEnTabla === null) return `${codigo}: configuración de precio en tabla no disponible; actualizar el catálogo`
  return null
}
