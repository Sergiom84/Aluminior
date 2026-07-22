import { notFound } from 'next/navigation'
import Link from 'next/link'
import { eq, asc } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { Shell } from '../../_components/shell.tsx'
import { AnyadirLinea, BotonBorrarLinea, SelectorEstado } from './_components/anyadir-linea.tsx'

export const dynamic = 'force-dynamic'

const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })

export default async function DetallePedido({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const db = crearDb()

  const [p] = await db.select().from(schema.pedidosCompra)
    .where(eq(schema.pedidosCompra.id, id)).limit(1)
  if (!p) notFound()

  const [proveedor] = await db.select({ nombre: schema.proveedores.nombre })
    .from(schema.proveedores).where(eq(schema.proveedores.codigo, p.proveedorCodigo)).limit(1)

  const lineas = await db.select()
    .from(schema.lineasPedidoCompra)
    .where(eq(schema.lineasPedidoCompra.pedidoId, id))
    .orderBy(asc(schema.lineasPedidoCompra.orden))

  const acabados = await db.select({
    codigo: schema.acabados.codigo,
    descripcion: schema.acabados.descripcion,
  }).from(schema.acabados).orderBy(asc(schema.acabados.codigo))

  const lineasSinCoste = lineas.filter((l) => l.costeUnitario === null).length
  const incompleto = lineasSinCoste > 0

  return (
    <Shell moduloActivo="compras">
      <div className="mb-6">
        <Link href="/dashboard/compras" className="text-sm" style={{ color: 'var(--al-accent)' }}>
          ← Volver a compras
        </Link>
        <div className="mt-3 flex flex-wrap items-baseline gap-4">
          <h2 className="text-2xl font-semibold">
            Pedido <span className="cifra">{p.numero}</span>
          </h2>
          <SelectorEstado pedidoId={id} estado={p.estado} estados={schema.ESTADOS_PEDIDO_COMPRA} />
        </div>
        <div className="mt-1 flex flex-wrap gap-4 text-sm" style={{ color: 'var(--al-text-muted)' }}>
          <span>{proveedor?.nombre ?? p.proveedorCodigo}</span>
          {p.referencia && <span>Ref: {p.referencia}</span>}
          <span>{p.fecha ? new Date(p.fecha).toLocaleDateString('es-ES') : ''}</span>
        </div>
        {p.observaciones && (
          <p className="mt-2 text-sm" style={{ color: 'var(--al-text-muted)' }}>{p.observaciones}</p>
        )}
      </div>

      <div className="mb-6">
        <AnyadirLinea pedidoId={id} proveedorCodigo={p.proveedorCodigo} acabados={acabados} />
      </div>

      <div className="overflow-hidden rounded-lg border"
        style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--al-surface-muted)' }}>
              {['#', 'Artículo', 'Descripción', 'Acabado', 'Cdad.', 'Coste ud.', 'Importe', ''].map((h, i) => (
                <th key={h + i} className="border-b px-3 py-2.5 font-medium"
                  style={{
                    borderColor: 'var(--al-border)', color: 'var(--al-text-muted)',
                    textAlign: i >= 4 && i <= 6 ? 'right' : 'left',
                  }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lineas.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center" style={{ color: 'var(--al-text-muted)' }}>
                  Todavía no hay líneas. Añade la primera arriba.
                </td>
              </tr>
            ) : (
              lineas.map((l) => (
                <tr key={l.id} className="border-b" style={{ borderColor: 'var(--al-border)' }}>
                  <td className="cifra px-3 py-2" style={{ textAlign: 'left', color: 'var(--al-text-faint)' }}>
                    {l.orden}
                  </td>
                  <td className="px-3 py-2" style={{ color: 'var(--al-text-muted)' }}>{l.articuloCodigo ?? '—'}</td>
                  <td className="px-3 py-2">{l.descripcion}</td>
                  <td className="px-3 py-2" style={{ color: 'var(--al-text-muted)' }}>{l.acabadoCodigo ?? '—'}</td>
                  <td className="cifra px-3 py-2">{Number(l.cantidad)}</td>
                  <td className="cifra px-3 py-2">
                    {l.costeUnitario !== null ? eur.format(Number(l.costeUnitario)) : (
                      <span className="text-xs" style={{ color: 'var(--al-warn)' }}
                        title="La línea no tiene coste: no suma al total.">
                        sin coste
                      </span>
                    )}
                  </td>
                  <td className="cifra px-3 py-2 font-medium">
                    {l.importe !== null ? eur.format(Number(l.importe)) : '—'}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <BotonBorrarLinea lineaId={l.id} pedidoId={id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex justify-end">
        <dl className="w-72 rounded-lg border p-4 text-sm"
          style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border)' }}>
          <div className="flex justify-between py-1 text-base font-semibold">
            <dt>Total coste</dt>
            <dd className="cifra">{eur.format(Number(p.total))}</dd>
          </div>
          {incompleto && (
            <p className="mt-2 text-xs" style={{ color: 'var(--al-warn)' }}>
              {lineasSinCoste} {lineasSinCoste === 1 ? 'línea sin coste' : 'líneas sin coste'}:
              el total es parcial, no el coste real del pedido.
            </p>
          )}
        </dl>
      </div>
    </Shell>
  )
}
