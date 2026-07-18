import { notFound } from 'next/navigation'
import Link from 'next/link'
import { eq, asc } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { Shell } from '../../_components/shell.tsx'
import { AnyadirLinea, BotonBorrarLinea } from './_components/anyadir-linea.tsx'

export const dynamic = 'force-dynamic'

const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })

export default async function DetallePresupuesto({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const db = crearDb()

  const [p] = await db.select().from(schema.presupuestos)
    .where(eq(schema.presupuestos.id, id)).limit(1)
  if (!p) notFound()

  const [cliente] = p.clienteCodigo
    ? await db.select({ nombre: schema.clientes.nombre })
        .from(schema.clientes).where(eq(schema.clientes.codigo, p.clienteCodigo)).limit(1)
    : []

  const lineas = await db.select()
    .from(schema.lineas)
    .where(eq(schema.lineas.presupuestoId, id))
    .orderBy(asc(schema.lineas.orden))

  return (
    <Shell moduloActivo="presupuestos">
      <div className="mb-6">
        <Link href="/dashboard/presupuestos" className="text-sm" style={{ color: 'var(--al-accent)' }}>
          ← Volver a presupuestos
        </Link>
        <div className="mt-3 flex flex-wrap items-baseline gap-4">
          <h2 className="text-2xl font-semibold">
            Presupuesto <span className="cifra">{p.numero}</span>
          </h2>
          <span className="rounded px-2 py-0.5 text-xs uppercase tracking-wide"
            style={{ background: 'var(--al-accent-soft)', color: 'var(--al-accent-strong)' }}>
            {p.estado}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap gap-4 text-sm" style={{ color: 'var(--al-text-muted)' }}>
          <span>{cliente?.nombre ?? p.nombreLibre ?? 'Sin destinatario'}</span>
          {p.obraTexto && <span>Obra: {p.obraTexto}</span>}
          <span>Tarifa {p.tarifa}</span>
          <span>{p.fecha ? new Date(p.fecha).toLocaleDateString('es-ES') : ''}</span>
        </div>
      </div>

      <div className="mb-6">
        <AnyadirLinea presupuestoId={id} />
      </div>

      <div className="overflow-hidden rounded-lg border"
        style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--al-surface-muted)' }}>
              {['#', 'Descripción', 'Ubicación', 'Medidas', 'Cdad.', 'Precio', 'Total', ''].map((h, i) => (
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
                  <td className="px-3 py-2">
                    <span className="mr-2 rounded px-1.5 py-0.5 text-[10px] uppercase"
                      style={{
                        background: l.tipo === 'ESTRUCTURA' ? 'var(--al-accent-soft)' : 'var(--al-surface-muted)',
                        color: l.tipo === 'ESTRUCTURA' ? 'var(--al-accent-strong)' : 'var(--al-text-muted)',
                      }}>
                      {l.tipo === 'ESTRUCTURA' ? 'estr' : 'art'}
                    </span>
                    {l.descripcion}
                  </td>
                  <td className="px-3 py-2" style={{ color: 'var(--al-text-muted)' }}>{l.referencia ?? '—'}</td>
                  <td className="px-3 py-2" style={{ color: 'var(--al-text-muted)' }}>
                    {l.anchoMm && l.altoMm ? `${l.anchoMm} × ${l.altoMm}` : '—'}
                  </td>
                  <td className="cifra px-3 py-2">{Number(l.cantidad)}</td>
                  <td className="cifra px-3 py-2">
                    {Number(l.precioUnitario) === 0 ? (
                      <span className="text-xs" style={{ color: 'var(--al-warn)' }}
                        title="Los perfiles del despiece son genéricos y se resuelven según la serie. Ver PLAN.md anexo H.">
                        sin valorar
                      </span>
                    ) : eur.format(Number(l.precioUnitario))}
                  </td>
                  <td className="cifra px-3 py-2 font-medium">
                    {Number(l.total) === 0 ? '—' : eur.format(Number(l.total))}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <BotonBorrarLinea lineaId={l.id} presupuestoId={id} />
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
          <div className="flex justify-between py-1">
            <dt style={{ color: 'var(--al-text-muted)' }}>Base imponible</dt>
            <dd className="cifra">{eur.format(Number(p.baseImponible))}</dd>
          </div>
          <div className="flex justify-between py-1">
            <dt style={{ color: 'var(--al-text-muted)' }}>IVA {Number(p.tipoIva)}%</dt>
            <dd className="cifra">{eur.format(Number(p.cuotaIva))}</dd>
          </div>
          <div className="mt-2 flex justify-between border-t pt-2 text-base font-semibold"
            style={{ borderColor: 'var(--al-border)' }}>
            <dt>Total</dt>
            <dd className="cifra">{eur.format(Number(p.total))}</dd>
          </div>
        </dl>
      </div>
    </Shell>
  )
}
