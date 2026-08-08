import Link from 'next/link'
import { desc, sql, or, ilike } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { Shell } from '../_components/shell.tsx'
import { CopiarRevisionBoton } from './_components/copiar-revision-boton.tsx'

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
      revision: schema.presupuestos.revision,
      serie: schema.presupuestos.serie,
      fecha: schema.presupuestos.fecha,
      estado: schema.presupuestos.estado,
      clienteCodigo: schema.presupuestos.clienteCodigo,
      tarifa: schema.presupuestos.tarifa,
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

  const presupuestoActivo = filas[0]

  return (
    <Shell moduloActivo="presupuestos">
      <section className="al-document-window" aria-labelledby="titulo-presupuestos">
        <header className="al-document-heading">
          <h2 id="titulo-presupuestos">Presupuestos de Clientes · Lista</h2>
        </header>

        <div className="al-commandbar" aria-label="Acciones de presupuestos">
          {presupuestoActivo && (
            <Link href={`/dashboard/presupuestos/${presupuestoActivo.id}`} className="al-command">
              Editar
            </Link>
          )}
          <Link href="/dashboard/presupuestos/nuevo" className="al-command-primary">
            Nuevo
          </Link>
          {presupuestoActivo ? (
            <a href={`/dashboard/presupuestos/${presupuestoActivo.id}/pdf`} target="_blank" rel="noopener" className="al-command">
              Emitir
            </a>
          ) : (
            <span className="al-command" aria-disabled="true">Emitir</span>
          )}
          {presupuestoActivo && (
            <CopiarRevisionBoton
              presupuestoId={presupuestoActivo.id}
              numero={presupuestoActivo.numero}
              revision={presupuestoActivo.revision}
              serie={presupuestoActivo.serie}
            />
          )}
          <form className="al-search" role="search">
            <label htmlFor="buscar-presupuesto" className="sr-only">Buscar presupuesto</label>
            <input id="buscar-presupuesto" name="q" defaultValue={busqueda}
              placeholder="Número, cliente u obra" />
            <button type="submit" className="al-command">Buscar</button>
            {busqueda && <Link href="/dashboard/presupuestos" className="al-command">Limpiar</Link>}
          </form>
          {presupuestoActivo && (
            <div className="al-document-context" aria-label="Documento activo">
              <span>Revisión <strong>{presupuestoActivo.revision}</strong></span>
              <span>Serie <strong>{presupuestoActivo.serie}</strong></span>
            </div>
          )}
        </div>

        {filas.length === 0 ? (
          <div className="border-b px-4 py-12 text-center" style={{ borderColor: 'var(--al-border)' }}>
            <p style={{ color: 'var(--al-text-muted)' }}>
              {busqueda ? 'Ningún presupuesto coincide con la búsqueda.' : 'Todavía no hay presupuestos.'}
            </p>
            {!busqueda && (
              <Link href="/dashboard/presupuestos/nuevo" className="mt-3 inline-block text-sm font-semibold"
                style={{ color: 'var(--al-accent-strong)' }}>
                Crear el primer presupuesto
              </Link>
            )}
          </div>
        ) : (
          <div className="al-data-table-wrap">
            <table className="al-data-table">
              <thead>
                <tr>
                  {['Número', 'Rev.', 'Fecha', 'Código', 'Cliente', 'Obra', 'Tarifa', 'Serie', 'Estado', 'Líneas', 'Total', ''].map((h, i) => (
                    <th key={h + i} style={{ textAlign: i >= 9 && i <= 10 ? 'right' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filas.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link href={`/dashboard/presupuestos/${p.id}`} data-primary-link>
                        {String(p.numero).padStart(6, '0')}
                      </Link>
                    </td>
                    <td className="cifra" style={{ textAlign: 'left' }}>{p.revision}</td>
                    <td>{p.fecha ? new Date(p.fecha).toLocaleDateString('es-ES') : '—'}</td>
                    <td className="font-mono text-[11px]">{p.clienteCodigo ?? '—'}</td>
                    <td className="max-w-72 overflow-hidden text-ellipsis">{p.cliente ?? p.nombreLibre ?? '—'}</td>
                    <td className="max-w-64 overflow-hidden text-ellipsis" style={{ color: 'var(--al-text-muted)' }}>
                      {p.obraTexto ?? '—'}
                    </td>
                    <td className="cifra" style={{ textAlign: 'left' }}>{p.tarifa}</td>
                    <td className="font-mono">{p.serie}</td>
                    <td><span className="al-status" data-status={p.estado}>{p.estado}</span></td>
                    <td className="cifra">{p.lineas}</td>
                    <td className="cifra font-semibold">{eur.format(Number(p.total))}</td>
                    <td><Link href={`/dashboard/presupuestos/${p.id}`} className="font-semibold" style={{ color: 'var(--al-accent-strong)' }}>Editar</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <footer className="al-recordbar">
          <span>Número de registros: <strong className="font-mono" style={{ color: 'var(--al-accent-strong)' }}>{filas.length}</strong></span>
          <span>{busqueda ? `Filtro: ${busqueda}` : 'Últimos 100 presupuestos'}</span>
        </footer>
      </section>
    </Shell>
  )
}
