import Link from 'next/link'
import { desc, sql, or, ilike } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { Shell } from '../_components/shell.tsx'

export const dynamic = 'force-dynamic'

const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })

export default async function Presupuestos({
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
        ilike(schema.presupuestos.nombreLibre, patron),
        ilike(schema.presupuestos.obraTexto, patron),
        sql`CAST(${schema.presupuestos.numero} AS TEXT) ILIKE ${patron}`,
      )
    : undefined

  const filas = await db
    .select({
      id: schema.presupuestos.id,
      numero: schema.presupuestos.numero,
      fecha: schema.presupuestos.fecha,
      estado: schema.presupuestos.estado,
      nombreLibre: schema.presupuestos.nombreLibre,
      obraTexto: schema.presupuestos.obraTexto,
      total: schema.presupuestos.total,
      cliente: schema.clientes.nombre,
      lineas: sql<number>`(
        SELECT COUNT(*)::int FROM lineas l WHERE l.presupuesto_id = ${schema.presupuestos.id}
      )`,
    })
    .from(schema.presupuestos)
    .leftJoin(schema.clientes, sql`${schema.clientes.codigo} = ${schema.presupuestos.clienteCodigo}`)
    .where(filtro)
    .orderBy(desc(schema.presupuestos.numero))
    .limit(100)

  return (
    <Shell moduloActivo="presupuestos">
      <div className="mb-5 flex items-center justify-between gap-4">
        <form className="flex gap-2">
          <input name="q" defaultValue={busqueda}
            placeholder="Buscar por número, cliente u obra…"
            className="w-80 rounded-md border px-3 py-2 text-sm"
            style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border-strong)' }} />
          <button type="submit" className="rounded-md border px-4 py-2 text-sm"
            style={{ borderColor: 'var(--al-border-strong)', background: 'var(--al-surface)' }}>
            Buscar
          </button>
        </form>
        <Link href="/dashboard/presupuestos/nuevo"
          className="rounded-md px-4 py-2 text-sm font-medium"
          style={{ background: 'var(--al-accent)', color: 'var(--al-accent-contrast)' }}>
          Nuevo presupuesto
        </Link>
      </div>

      {filas.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center"
          style={{ borderColor: 'var(--al-border-strong)' }}>
          <p style={{ color: 'var(--al-text-muted)' }}>
            {busqueda ? 'Ningún presupuesto coincide.' : 'Todavía no hay presupuestos.'}
          </p>
          {!busqueda && (
            <Link href="/dashboard/presupuestos/nuevo" className="mt-3 inline-block text-sm"
              style={{ color: 'var(--al-accent)' }}>
              Crear el primero
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border"
          style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--al-surface-muted)' }}>
                {['Número', 'Fecha', 'Cliente', 'Obra', 'Líneas', 'Total'].map((h, i) => (
                  <th key={h} className="border-b px-4 py-2.5 font-medium"
                    style={{
                      borderColor: 'var(--al-border)', color: 'var(--al-text-muted)',
                      textAlign: i >= 4 ? 'right' : 'left',
                    }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map((p) => (
                <tr key={p.id} className="border-b" style={{ borderColor: 'var(--al-border)' }}>
                  <td className="cifra px-4 py-2" style={{ textAlign: 'left' }}>
                    <Link href={`/dashboard/presupuestos/${p.id}`} style={{ color: 'var(--al-accent)' }}>
                      {p.numero}
                    </Link>
                  </td>
                  <td className="px-4 py-2" style={{ color: 'var(--al-text-muted)' }}>
                    {p.fecha ? new Date(p.fecha).toLocaleDateString('es-ES') : '—'}
                  </td>
                  <td className="px-4 py-2">{p.cliente ?? p.nombreLibre ?? '—'}</td>
                  <td className="px-4 py-2" style={{ color: 'var(--al-text-muted)' }}>{p.obraTexto ?? '—'}</td>
                  <td className="cifra px-4 py-2">{p.lineas}</td>
                  <td className="cifra px-4 py-2 font-medium">{eur.format(Number(p.total))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Shell>
  )
}
