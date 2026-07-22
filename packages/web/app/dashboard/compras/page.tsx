import Link from 'next/link'
import { desc, sql, or, ilike, eq } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { Shell } from '../_components/shell.tsx'

export const dynamic = 'force-dynamic'

const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })

export default async function Compras({
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
        ilike(schema.proveedores.nombre, patron),
        ilike(schema.pedidosCompra.referencia, patron),
        sql`CAST(${schema.pedidosCompra.numero} AS TEXT) ILIKE ${patron}`,
      )
    : undefined

  const filas = await db
    .select({
      id: schema.pedidosCompra.id,
      numero: schema.pedidosCompra.numero,
      fecha: schema.pedidosCompra.fecha,
      estado: schema.pedidosCompra.estado,
      referencia: schema.pedidosCompra.referencia,
      total: schema.pedidosCompra.total,
      costeCompleto: schema.pedidosCompra.costeCompleto,
      proveedor: schema.proveedores.nombre,
      lineas: sql<number>`(
        SELECT COUNT(*)::int FROM lineas_pedido_compra l WHERE l.pedido_id = ${schema.pedidosCompra.id}
      )`,
    })
    .from(schema.pedidosCompra)
    .leftJoin(schema.proveedores, eq(schema.proveedores.codigo, schema.pedidosCompra.proveedorCodigo))
    .where(filtro)
    .orderBy(desc(schema.pedidosCompra.numero))
    .limit(100)

  return (
    <Shell moduloActivo="compras">
      <div className="mb-5 flex items-center justify-between gap-4">
        <form className="flex gap-2">
          <input name="q" defaultValue={busqueda}
            placeholder="Buscar por número, proveedor o referencia…"
            className="w-80 rounded-md border px-3 py-2 text-sm"
            style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border-strong)' }} />
          <button type="submit" className="rounded-md border px-4 py-2 text-sm"
            style={{ borderColor: 'var(--al-border-strong)', background: 'var(--al-surface)' }}>
            Buscar
          </button>
        </form>
        <Link href="/dashboard/compras/nuevo"
          className="rounded-md px-4 py-2 text-sm font-medium"
          style={{ background: 'var(--al-accent)', color: 'var(--al-accent-contrast)' }}>
          Nuevo pedido
        </Link>
      </div>

      {filas.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center"
          style={{ borderColor: 'var(--al-border-strong)' }}>
          <p style={{ color: 'var(--al-text-muted)' }}>
            {busqueda ? 'Ningún pedido coincide.' : 'Todavía no hay pedidos de compra.'}
          </p>
          {!busqueda && (
            <Link href="/dashboard/compras/nuevo" className="mt-3 inline-block text-sm"
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
                {['Número', 'Fecha', 'Proveedor', 'Referencia', 'Estado', 'Líneas', 'Total'].map((h, i) => (
                  <th key={h} className="border-b px-4 py-2.5 font-medium"
                    style={{
                      borderColor: 'var(--al-border)', color: 'var(--al-text-muted)',
                      textAlign: i >= 5 ? 'right' : 'left',
                    }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map((p) => (
                <tr key={p.id} className="border-b" style={{ borderColor: 'var(--al-border)' }}>
                  <td className="cifra px-4 py-2" style={{ textAlign: 'left' }}>
                    <Link href={`/dashboard/compras/${p.id}`} style={{ color: 'var(--al-accent)' }}>
                      {p.numero}
                    </Link>
                  </td>
                  <td className="px-4 py-2" style={{ color: 'var(--al-text-muted)' }}>
                    {p.fecha ? new Date(p.fecha).toLocaleDateString('es-ES') : '—'}
                  </td>
                  <td className="px-4 py-2">{p.proveedor ?? '—'}</td>
                  <td className="px-4 py-2" style={{ color: 'var(--al-text-muted)' }}>{p.referencia ?? '—'}</td>
                  <td className="px-4 py-2">
                    <span className="rounded px-2 py-0.5 text-[10px] uppercase tracking-wide"
                      style={{ background: 'var(--al-surface-muted)', color: 'var(--al-text-muted)' }}>
                      {p.estado}
                    </span>
                  </td>
                  <td className="cifra px-4 py-2">{p.lineas}</td>
                  <td className="cifra px-4 py-2 font-medium">
                    {p.costeCompleto ? eur.format(Number(p.total)) : (
                      <span style={{ color: 'var(--al-warn)' }} title="Hay líneas sin coste: el total es parcial.">
                        {eur.format(Number(p.total))} *
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Shell>
  )
}
