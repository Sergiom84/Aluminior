/**
 * Catálogo de estructuras: los tipos de hueco configurables.
 *
 * Sólo lectura por ahora. Las estructuras se definen en el sistema original
 * y llegan con las bibliotecas de series; crearlas aquí exigiría el editor
 * de geometría, que no existe todavía.
 */

import Link from 'next/link'
import { and, or, eq, ilike, sql, asc } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { Shell } from '../_components/shell.tsx'
import { nombreFamilia } from '@aluminior/core/estructuras'

export const dynamic = 'force-dynamic'

const POR_PAGINA = 50

export default async function Estructuras({
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
      ? or(ilike(schema.estructuras.descripcion, patron), ilike(schema.estructuras.codigo, patron))
      : undefined,
    familia ? eq(schema.estructuras.familia, familia) : undefined,
  ].filter(Boolean)
  const filtro = condiciones.length ? and(...condiciones) : undefined

  const [filas, [{ total }], familias] = await Promise.all([
    db.select({
      codigo: schema.estructuras.codigo,
      descripcion: schema.estructuras.descripcion,
      familia: schema.estructuras.familia,
      componentes: sql<number>`(
        SELECT COUNT(*)::int FROM estructura_componentes c
        WHERE c.estructura_codigo = ${schema.estructuras.codigo}
      )`,
    })
      .from(schema.estructuras)
      .where(filtro)
      .orderBy(asc(schema.estructuras.codigo))
      .limit(POR_PAGINA)
      .offset((pagina - 1) * POR_PAGINA),

    db.select({ total: sql<number>`COUNT(*)::int` }).from(schema.estructuras).where(filtro),

    db.execute<{ familia: string; n: number }>(sql`
      SELECT familia, COUNT(*)::int AS n FROM estructuras
      WHERE familia IS NOT NULL GROUP BY familia ORDER BY familia
    `) as unknown as Promise<{ familia: string; n: number }[]>,
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
    <Shell moduloActivo="estructuras">
      <div className="mb-5">
        <form className="flex flex-wrap gap-2">
          <input
            name="q" defaultValue={busqueda}
            placeholder="Buscar por código o descripción…"
            className="w-80 rounded-md border px-3 py-2 text-sm"
            style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border-strong)' }}
          />
          <select name="familia" defaultValue={familia ?? ''}
            className="rounded-md border px-3 py-2 text-sm"
            style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border-strong)' }}>
            <option value="">Todas las familias</option>
            {familias.map((f) => (
              <option key={f.familia} value={f.familia}>
                {nombreFamilia(f.familia)} ({f.n})
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-md border px-4 py-2 text-sm"
            style={{ borderColor: 'var(--al-border-strong)', background: 'var(--al-surface)' }}>
            Buscar
          </button>
          {(busqueda || familia) && (
            <Link href="/dashboard/estructuras" className="rounded-md px-3 py-2 text-sm"
              style={{ color: 'var(--al-text-muted)' }}>Limpiar</Link>
          )}
        </form>
      </div>

      <p className="mb-3 text-sm" style={{ color: 'var(--al-text-muted)' }}>
        {total.toLocaleString('es-ES')} estructura{total === 1 ? '' : 's'}
        {paginas > 1 && ` · página ${pagina} de ${paginas}`}
      </p>

      <div className="overflow-hidden rounded-lg border"
        style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--al-surface-muted)' }}>
              {['Código', 'Descripción', 'Familia', 'Componentes'].map((h, i) => (
                <th key={h} className="border-b px-4 py-2.5 font-medium"
                  style={{
                    borderColor: 'var(--al-border)', color: 'var(--al-text-muted)',
                    textAlign: i === 3 ? 'right' : 'left',
                  }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-10 text-center"
                style={{ color: 'var(--al-text-muted)' }}>
                Ninguna estructura coincide con el filtro.
              </td></tr>
            ) : (
              filas.map((e) => (
                <tr key={e.codigo} className="border-b" style={{ borderColor: 'var(--al-border)' }}>
                  <td className="cifra px-4 py-2" style={{ textAlign: 'left' }}>
                    <Link href={`/dashboard/estructuras/${encodeURIComponent(e.codigo)}`}
                      style={{ color: 'var(--al-accent)' }}>{e.codigo}</Link>
                  </td>
                  <td className="px-4 py-2">{e.descripcion}</td>
                  <td className="px-4 py-2" style={{ color: 'var(--al-text-muted)' }}>
                    {e.familia ? nombreFamilia(e.familia) : '—'}
                  </td>
                  <td className="cifra px-4 py-2">
                    {e.componentes > 0 ? e.componentes : (
                      <span style={{ color: 'var(--al-text-faint)' }}>sin despiece</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {paginas > 1 && (
        <nav className="mt-4 flex items-center gap-2 text-sm">
          {pagina > 1 && (
            <Link href={qs({ p: pagina - 1 })} className="rounded-md border px-3 py-1.5"
              style={{ borderColor: 'var(--al-border-strong)', background: 'var(--al-surface)' }}>
              Anterior
            </Link>
          )}
          <span style={{ color: 'var(--al-text-muted)' }}>{pagina} / {paginas}</span>
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
