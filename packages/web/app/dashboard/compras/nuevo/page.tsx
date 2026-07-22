import { asc } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { Shell } from '../../_components/shell.tsx'
import { FormularioNuevoPedido } from './formulario.tsx'

export const dynamic = 'force-dynamic'

export default async function NuevoPedido() {
  const db = crearDb()
  const proveedores = await db.select({
    codigo: schema.proveedores.codigo,
    nombre: schema.proveedores.nombre,
  }).from(schema.proveedores).orderBy(asc(schema.proveedores.nombre))

  return (
    <Shell moduloActivo="compras">
      <FormularioNuevoPedido proveedores={proveedores} />
    </Shell>
  )
}
