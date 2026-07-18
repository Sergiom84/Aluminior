/**
 * Listado de clientes con búsqueda.
 *
 * La búsqueda va por servidor (parámetro en la URL) en lugar de filtrar en
 * cliente: son 503 clientes hoy, pero el sistema original tiene empresas con
 * miles y no queremos volcar la tabla entera al navegador.
 */

import Link from 'next/link'
import { or, ilike, sql, asc } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { Shell } from '../_components/shell.tsx'

export const dynamic = 'force-dynamic'

const POR_PAGINA = 50

export default async function Clientes({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const busqueda = (q ?? '').trim()

  const db = crearDb()
  const patron = `%${busqueda}%`

  const filtro = busqueda
    ? or(
        ilike(schema.clientes.nombre, patron),
        ilike(schema.clientes.codigo, patron),
        ilike(schema.clientes.nif, patron),
        ilike(schema.clientes.poblacion, patron),
      )
    : undefined

  const [filas, [{ total }]] = await Promise.all([
    db.select({
      codigo: schema.clientes.codigo,
      nombre: schema.clientes.nombre,
      nif: schema.clientes.nif,
      poblacion: schema.clientes.poblacion,
      telefono: schema.clientes.telefono,
      movil: schema.clientes.telefonoMovil,
    })
      .from(schema.clientes)
      .where(filtro)
      .orderBy(asc(schema.clientes.nombre))
      .limit(POR_PAGINA),

    db.select({ total: sql<number>`COUNT(*)::int` })
      .from(schema.clientes)
      .where(filtro),
  ])

  return (
    <Shell moduloActivo="clientes">
      <div className="mb-5 flex items-center justify-between gap-4">
        <form className="flex gap-2">
          <input
            name="q"
            defaultValue={busqueda}
            placeholder="Buscar por nombre, código, NIF o población…"
            className="w-96 rounded-md border px-3 py-2 text-sm"
            style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border-strong)' }}
          />
          <button
            type="submit"
            className="rounded-md border px-4 py-2 text-sm"
            style={{ borderColor: 'var(--al-border-strong)', background: 'var(--al-surface)' }}
          >
            Buscar
          </button>
          {busqueda && (
            <Link
              href="/dashboard/clientes"
              className="rounded-md px-3 py-2 text-sm"
              style={{ color: 'var(--al-text-muted)' }}
            >
              Limpiar
            </Link>
          )}
        </form>

        <Link
          href="/dashboard/clientes/nuevo"
          className="rounded-md px-4 py-2 text-sm font-medium"
          style={{ background: 'var(--al-accent)', color: 'var(--al-accent-contrast)' }}
        >
          Nuevo cliente
        </Link>
      </div>

      <p className="mb-3 text-sm" style={{ color: 'var(--al-text-muted)' }}>
        {total.toLocaleString('es-ES')} cliente{total === 1 ? '' : 's'}
        {busqueda && ' encontrados'}
        {total > POR_PAGINA && ` · mostrando los primeros ${POR_PAGINA}`}
      </p>

      <div
        className="overflow-hidden rounded-lg border"
        style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border)' }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--al-surface-muted)' }}>
              {['Código', 'Nombre', 'NIF', 'Población', 'Teléfono'].map((h) => (
                <th
                  key={h}
                  className="border-b px-4 py-2.5 text-left font-medium"
                  style={{ borderColor: 'var(--al-border)', color: 'var(--al-text-muted)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center" style={{ color: 'var(--al-text-muted)' }}>
                  {busqueda
                    ? `Ningún cliente coincide con "${busqueda}".`
                    : 'No hay clientes.'}
                </td>
              </tr>
            ) : (
              filas.map((c) => (
                <tr key={c.codigo} className="border-b" style={{ borderColor: 'var(--al-border)' }}>
                  <td className="cifra px-4 py-2" style={{ textAlign: 'left' }}>
                    <Link
                      href={`/dashboard/clientes/${encodeURIComponent(c.codigo)}`}
                      style={{ color: 'var(--al-accent)' }}
                    >
                      {c.codigo}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{c.nombre}</td>
                  <td className="px-4 py-2" style={{ color: 'var(--al-text-muted)' }}>{c.nif ?? '—'}</td>
                  <td className="px-4 py-2" style={{ color: 'var(--al-text-muted)' }}>{c.poblacion ?? '—'}</td>
                  <td className="px-4 py-2" style={{ color: 'var(--al-text-muted)' }}>
                    {c.telefono ?? c.movil ?? '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Shell>
  )
}
