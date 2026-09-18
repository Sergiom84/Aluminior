import Link from 'next/link'
import { desc, sql, or, ilike } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { Shell } from '../_components/shell.tsx'
import { ListaPresupuestos } from './_components/lista-presupuestos.tsx'
import { PestanasDocumento } from './_components/pestanas-documento.tsx'

export const dynamic = 'force-dynamic'

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
        ilike(schema.clientes.nombre, patron),
        ilike(schema.presupuestos.clienteCodigo, patron),
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
      potencial: schema.clientesPotenciales.nombre,
      lineas: sql<number>`(
        SELECT COUNT(*)::int FROM lineas l WHERE l.presupuesto_id = ${schema.presupuestos.id}
      )`,
      tieneLineaSinValorar: sql<boolean>`EXISTS (
        SELECT 1 FROM lineas l
        WHERE l.presupuesto_id = ${schema.presupuestos.id}
          AND (l.valoracion_completa IS NOT TRUE OR l.total IS NULL)
      )`,
    })
    .from(schema.presupuestos)
    .leftJoin(schema.clientes, sql`${schema.clientes.codigo} = ${schema.presupuestos.clienteCodigo}`)
    .leftJoin(schema.clientesPotenciales, sql`${schema.clientesPotenciales.codigo} = ${schema.presupuestos.potencialCodigo}`)
    .where(filtro)
    .orderBy(desc(schema.presupuestos.numero))
    .limit(100)

  return (
    <Shell moduloActivo="presupuestos">
      <section className="al-document-window" aria-labelledby="titulo-presupuestos">
        <header className="al-document-heading">
          <h2 id="titulo-presupuestos">Presupuestos de Clientes</h2>
        </header>

        <div className="al-commandbar" aria-label="Acciones de presupuestos">
          <Link href="/dashboard/presupuestos/nuevo" className="al-command-primary">
            Nuevo
          </Link>
          <form className="al-search" role="search">
            <label htmlFor="buscar-presupuesto" className="sr-only">Buscar presupuesto</label>
            <input id="buscar-presupuesto" name="q" defaultValue={busqueda}
              placeholder="Número, cliente u obra" />
            <button type="submit" className="al-command">Buscar</button>
            {busqueda && <Link href="/dashboard/presupuestos" className="al-command">Limpiar</Link>}
          </form>
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
          <ListaPresupuestos filas={filas} />
        )}

        <footer className="al-recordbar">
          <span>Número de registros: <strong className="font-mono" style={{ color: 'var(--al-accent-strong)' }}>{filas.length}</strong></span>
          <span>{busqueda ? `Filtro: ${busqueda}` : 'Últimos 100 presupuestos'}</span>
        </footer>
        <PestanasDocumento vista="lista" />
      </section>
    </Shell>
  )
}
