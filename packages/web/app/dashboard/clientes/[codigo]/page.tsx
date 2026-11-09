import Link from 'next/link'
import { notFound } from 'next/navigation'
import { eq, asc, desc, sql } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { Shell } from '../../_components/shell.tsx'
import { FormularioCliente } from '../_components/formulario.tsx'
import { filtroClienteSeleccionado } from '../../presupuestos/_lib/busqueda-listado.ts'
import { textoTotalListado } from '../../presupuestos/_lib/listado-presupuestos.ts'

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

  const documentos = await db
    .select({
      id: schema.presupuestos.id,
      numero: schema.presupuestos.numero,
      fecha: schema.presupuestos.fecha,
      estado: schema.presupuestos.estado,
      total: schema.presupuestos.total,
      tieneLineaSinValorar: sql<boolean>`EXISTS (
        SELECT 1 FROM lineas l
        WHERE l.presupuesto_id = ${schema.presupuestos.id}
          AND (l.valoracion_completa IS NOT TRUE OR l.total IS NULL)
      )`,
    })
    .from(schema.presupuestos)
    .where(filtroClienteSeleccionado(cliente))
    .orderBy(desc(schema.presupuestos.numero))
    .limit(50)

  const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })
  const fechaVisible = (fecha: string | Date) => {
    if (fecha instanceof Date) {
      const dia = String(fecha.getUTCDate()).padStart(2, '0')
      const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0')
      return `${dia}/${mes}/${fecha.getUTCFullYear()}`
    }
    const [anio, mes, dia] = fecha.slice(0, 10).split('-')
    return dia && mes && anio ? `${dia}/${mes}/${anio}` : fecha
  }

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

      <section className="mt-8 max-w-4xl">
        <h2 className="mb-3 text-sm font-semibold">
          Presupuestos de este cliente ({documentos.length})
        </h2>
        {documentos.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--al-text-muted)' }}>Sin presupuestos.</p>
        ) : (
          <ul
            className="divide-y overflow-hidden rounded-lg border"
            style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border)' }}
          >
            {documentos.map((documento) => (
              <li key={documento.id} className="flex flex-wrap items-center gap-4 px-4 py-2 text-sm"
                style={{ borderColor: 'var(--al-border)' }}>
                <Link href={`/dashboard/presupuestos/${documento.id}`} className="cifra"
                  style={{ color: 'var(--al-accent)', textAlign: 'left' }}>
                  {String(documento.numero).padStart(6, '0')}
                </Link>
                <span>{fechaVisible(documento.fecha)}</span>
                <span style={{ color: 'var(--al-text-muted)' }}>{documento.estado}</span>
                <span className="ml-auto cifra">
                  {textoTotalListado(documento.total, documento.tieneLineaSinValorar, (valor) => eur.format(valor))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Shell>
  )
}
