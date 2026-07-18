/**
 * Listado de artículos con búsqueda y filtro por familia.
 *
 * Son 17.547 artículos: paginación y filtrado en servidor, siempre.
 */

import Link from 'next/link'
import { and, or, eq, ilike, sql, asc } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { Shell } from '../_components/shell.tsx'
import { familiasConUso } from './_lib/acciones.ts'

export const dynamic = 'force-dynamic'

const POR_PAGINA = 50

const ETIQUETA_METRAJE: Record<string, string> = {
  ML: 'Metro lineal',
  UD: 'Unidad',
  M2: 'Metro cuadrado',
}

export default async function Articulos({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; familia?: string; p?: string }>
}) {
  const { q, familia, p } = await searchParams
  const busqueda = (q ?? '').trim()
  const pagina = Math.max(1, Number(p) || 1)

  const db = crearDb()
  const patron = `%${busqueda}%`

  const condiciones = [
    busqueda
      ? or(ilike(schema.articulos.descripcion, patron), ilike(schema.articulos.codigo, patron))
      : undefined,
    familia ? eq(schema.articulos.familiaCodigo, familia) : undefined,
  ].filter(Boolean)

  const filtro = condiciones.length ? and(...condiciones) : undefined

  const [filas, [{ total }], familias] = await Promise.all([
    db.select({
      codigo: schema.articulos.codigo,
      descripcion: schema.articulos.descripcion,
      familia: schema.articulos.familiaCodigo,
      tipoMetraje: schema.articulos.tipoMetraje,
      proveedor: schema.articulos.proveedorHabitual,
    })
      .from(schema.articulos)
      .where(filtro)
      .orderBy(asc(schema.articulos.codigo))
      .limit(POR_PAGINA)
      .offset((pagina - 1) * POR_PAGINA),

    db.select({ total: sql<number>`COUNT(*)::int` }).from(schema.articulos).where(filtro),

    familiasConUso(),
  ])

  const paginas = Math.ceil(total / POR_PAGINA)
  const qs = (extra: Record<string, string | number>) => {
    const s = new URLSearchParams()
    if (busqueda) s.set('q', busqueda)
    if (familia) s.set('familia', familia)
    for (const [k, v] of Object.entries(extra)) s.set(k, String(v))
    return `?${s}`
  }

  return (
    <Shell moduloActivo="articulos">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <form className="flex flex-wrap gap-2">
          <input
            name="q" defaultValue={busqueda}
            placeholder="Buscar por código o descripción…"
            className="w-80 rounded-md border px-3 py-2 text-sm"
            style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border-strong)' }}
          />
          <select
            name="familia" defaultValue={familia ?? ''}
            className="rounded-md border px-3 py-2 text-sm"
            style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border-strong)' }}
          >
            <option value="">Todas las familias</option>
            {familias.filter((f) => f.n > 0).map((f) => (
              <option key={f.codigo} value={f.codigo}>
                {f.codigo} · {f.descripcion} ({f.n})
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-md border px-4 py-2 text-sm"
            style={{ borderColor: 'var(--al-border-strong)', background: 'var(--al-surface)' }}>
            Buscar
          </button>
          {(busqueda || familia) && (
            <Link href="/dashboard/articulos" className="rounded-md px-3 py-2 text-sm"
              style={{ color: 'var(--al-text-muted)' }}>
              Limpiar
            </Link>
          )}
        </form>

        <Link href="/dashboard/articulos/nuevo"
          className="rounded-md px-4 py-2 text-sm font-medium"
          style={{ background: 'var(--al-accent)', color: 'var(--al-accent-contrast)' }}>
          Nuevo artículo
        </Link>
      </div>

      <p className="mb-3 text-sm" style={{ color: 'var(--al-text-muted)' }}>
        {total.toLocaleString('es-ES')} artículo{total === 1 ? '' : 's'}
        {paginas > 1 && ` · página ${pagina} de ${paginas}`}
      </p>

      <div className="overflow-hidden rounded-lg border"
        style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--al-surface-muted)' }}>
              {['Código', 'Descripción', 'Familia', 'Medida', 'Proveedor'].map((h) => (
                <th key={h} className="border-b px-4 py-2.5 text-left font-medium"
                  style={{ borderColor: 'var(--al-border)', color: 'var(--al-text-muted)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center" style={{ color: 'var(--al-text-muted)' }}>
                  Ningún artículo coincide con el filtro.
                </td>
              </tr>
            ) : (
              filas.map((a) => (
                <tr key={a.codigo} className="border-b" style={{ borderColor: 'var(--al-border)' }}>
                  <td className="cifra px-4 py-2" style={{ textAlign: 'left' }}>
                    <Link href={`/dashboard/articulos/${encodeURIComponent(a.codigo)}`}
                      style={{ color: 'var(--al-accent)' }}>
                      {a.codigo}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{a.descripcion}</td>
                  <td className="px-4 py-2" style={{ color: 'var(--al-text-muted)' }}>{a.familia ?? '—'}</td>
                  <td className="px-4 py-2">
                    <span className="rounded px-1.5 py-0.5 text-xs"
                      style={{ background: 'var(--al-accent-soft)', color: 'var(--al-accent-strong)' }}>
                      {ETIQUETA_METRAJE[a.tipoMetraje] ?? a.tipoMetraje}
                    </span>
                  </td>
                  <td className="px-4 py-2" style={{ color: 'var(--al-text-muted)' }}>{a.proveedor ?? '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {paginas > 1 && (
        <nav className="mt-4 flex items-center gap-2 text-sm" aria-label="Paginación">
          {pagina > 1 && (
            <Link href={qs({ p: pagina - 1 })} className="rounded-md border px-3 py-1.5"
              style={{ borderColor: 'var(--al-border-strong)', background: 'var(--al-surface)' }}>
              Anterior
            </Link>
          )}
          <span style={{ color: 'var(--al-text-muted)' }}>
            {pagina} / {paginas}
          </span>
          {pagina < paginas && (
            <Link href={qs({ p: pagina + 1 })} className="rounded-md border px-3 py-1.5"
              style={{ borderColor: 'var(--al-border-strong)', background: 'var(--al-surface)' }}>
              Siguiente
            </Link>
          )}
        </nav>
      )}
    </Shell>
  )
}
