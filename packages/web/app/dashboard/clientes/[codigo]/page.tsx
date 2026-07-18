import { notFound } from 'next/navigation'
import { eq, asc } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { Shell } from '../../_components/shell.tsx'
import { FormularioCliente } from '../_components/formulario.tsx'

export const dynamic = 'force-dynamic'

export default async function EditarCliente({
  params,
}: {
  params: Promise<{ codigo: string }>
}) {
  const { codigo } = await params
  const db = crearDb()

  const [cliente] = await db
    .select()
    .from(schema.clientes)
    .where(eq(schema.clientes.codigo, decodeURIComponent(codigo)))
    .limit(1)

  if (!cliente) notFound()

  // Las obras del cliente son contexto útil al editarlo.
  const obras = await db
    .select({
      id: schema.obras.id,
      numero: schema.obras.numero,
      descripcion: schema.obras.descripcion,
    })
    .from(schema.obras)
    .where(eq(schema.obras.clienteCodigo, cliente.codigo))
    .orderBy(asc(schema.obras.numero))
    .limit(50)

  return (
    <Shell moduloActivo="clientes">
      <FormularioCliente
        esNuevo={false}
        cliente={{
          codigo: cliente.codigo,
          nombre: cliente.nombre,
          nombreComercial: cliente.nombreComercial,
          nif: cliente.nif,
          direccion: cliente.direccion,
          cp: cliente.cp,
          poblacion: cliente.poblacion,
          provincia: cliente.provincia,
          pais: cliente.pais,
          personaContacto: cliente.personaContacto,
          telefono: cliente.telefono,
          telefonoMovil: cliente.telefonoMovil,
          email: cliente.email,
          tarifa: cliente.tarifa,
        }}
      />

      <section className="mt-8 max-w-4xl">
        <h2 className="mb-3 text-sm font-semibold">
          Obras de este cliente ({obras.length})
        </h2>
        {obras.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--al-text-muted)' }}>
            Este cliente no tiene obras registradas.
          </p>
        ) : (
          <ul
            className="divide-y overflow-hidden rounded-lg border"
            style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border)' }}
          >
            {obras.map((o) => (
              <li key={o.id} className="flex gap-4 px-4 py-2 text-sm"
                style={{ borderColor: 'var(--al-border)' }}>
                <span className="cifra w-12" style={{ color: 'var(--al-text-muted)', textAlign: 'left' }}>
                  {o.numero ?? '—'}
                </span>
                <span>{o.descripcion}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Shell>
  )
}
