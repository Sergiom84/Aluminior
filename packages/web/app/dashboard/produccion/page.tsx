/**
 * Producción — selección de presupuesto para la hoja de corte (T.64).
 *
 * La hoja de corte parte de las líneas ya despiezadas de un presupuesto, así
 * que el primer paso es elegir cuál. Imita la lista de presupuestos, pero cada
 * fila enlaza a su hoja de corte en vez de a su detalle comercial.
 */
import Link from 'next/link'
import { desc, sql, or, ilike } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { Shell } from '../_components/shell.tsx'

export const dynamic = 'force-dynamic'

export default async function Produccion({
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

  // Sólo presupuestos con algún corte despiezado tienen hoja de corte.
  const filas = await db
    .select({
      id: schema.presupuestos.id,
      numero: schema.presupuestos.numero,
      fecha: schema.presupuestos.fecha,
      estado: schema.presupuestos.estado,
      nombreLibre: schema.presupuestos.nombreLibre,
      obraTexto: schema.presupuestos.obraTexto,
      cliente: schema.clientes.nombre,
      cortes: sql<number>`(
        SELECT COUNT(*)::int
        FROM lineas_despiece d
        JOIN lineas l ON l.id = d.linea_id
        WHERE l.presupuesto_id = ${schema.presupuestos.id}
          AND d.largo_corte_mm IS NOT NULL
          AND d.ancho_corte_mm IS NULL
      )`,
    })
    .from(schema.presupuestos)
    .leftJoin(schema.clientes, sql`${schema.clientes.codigo} = ${schema.presupuestos.clienteCodigo}`)
    .where(filtro)
    .orderBy(desc(schema.presupuestos.numero))
    .limit(100)

  return (
    <Shell moduloActivo="produccion">
      <p className="mb-5 max-w-2xl text-sm" style={{ color: 'var(--al-text-muted)' }}>
        Elige un presupuesto para generar su <strong>hoja de corte</strong>: los cortes de
        perfil se agrupan por artículo y se optimiza el reparto en barras.
      </p>

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
      </div>

      {filas.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center"
          style={{ borderColor: 'var(--al-border-strong)' }}>
          <p style={{ color: 'var(--al-text-muted)' }}>
            {busqueda ? 'Ningún presupuesto coincide.' : 'Todavía no hay presupuestos que despiezar.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border"
          style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--al-surface-muted)' }}>
                {['Número', 'Fecha', 'Cliente', 'Obra', 'Cortes', ''].map((h, i) => (
                  <th key={h + i} className="border-b px-4 py-2.5 font-medium"
                    style={{
                      borderColor: 'var(--al-border)', color: 'var(--al-text-muted)',
                      textAlign: i === 4 ? 'right' : 'left',
                    }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map((p) => (
                <tr key={p.id} className="border-b" style={{ borderColor: 'var(--al-border)' }}>
                  <td className="cifra px-4 py-2" style={{ textAlign: 'left' }}>{p.numero}</td>
                  <td className="px-4 py-2" style={{ color: 'var(--al-text-muted)' }}>
                    {p.fecha ? new Date(p.fecha).toLocaleDateString('es-ES') : '—'}
                  </td>
                  <td className="px-4 py-2">{p.cliente ?? p.nombreLibre ?? '—'}</td>
                  <td className="px-4 py-2" style={{ color: 'var(--al-text-muted)' }}>{p.obraTexto ?? '—'}</td>
                  <td className="cifra px-4 py-2">{p.cortes}</td>
                  <td className="px-4 py-2 text-right">
                    {p.cortes > 0 ? (
                      <Link href={`/dashboard/produccion/${p.id}`} className="text-sm"
                        style={{ color: 'var(--al-accent)' }}>
                        Hoja de corte →
                      </Link>
                    ) : (
                      <span className="text-xs" style={{ color: 'var(--al-text-faint)' }}>sin cortes</span>
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
