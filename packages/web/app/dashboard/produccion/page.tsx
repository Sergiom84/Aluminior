import Link from 'next/link'
import { desc, eq, sql, or, ilike } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { Shell } from '../_components/shell'
import { resolverDestinatarioPresupuesto } from '../presupuestos/_lib/destinatario/index'
import { Tabla } from './_components/formato'

export const dynamic = 'force-dynamic'
export default async function Produccion({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const busqueda = (q ?? '').trim().slice(0, 120)
  const patron = `%${busqueda}%`
  const filas = await crearDb().select({ id: schema.presupuestos.id, numero: schema.presupuestos.numero,
    serie: schema.presupuestos.serie, revision: schema.presupuestos.revision, estado: schema.presupuestos.estado,
    nombreLibre: schema.presupuestos.nombreLibre, obra: schema.presupuestos.obraTexto,
    cliente: schema.clientes.nombre, potencial: schema.clientesPotenciales.nombre })
    .from(schema.presupuestos)
    .leftJoin(schema.clientes, eq(schema.clientes.codigo, schema.presupuestos.clienteCodigo))
    .leftJoin(schema.clientesPotenciales, eq(schema.clientesPotenciales.codigo, schema.presupuestos.potencialCodigo))
    .where(busqueda ? or(ilike(schema.presupuestos.nombreLibre, patron), ilike(schema.presupuestos.obraTexto, patron),
      ilike(schema.clientes.nombre, patron), ilike(schema.clientesPotenciales.nombre, patron),
      sql`CAST(${schema.presupuestos.numero} AS TEXT) ILIKE ${patron}`) : undefined)
    .orderBy(desc(schema.presupuestos.numero), desc(schema.presupuestos.revision), desc(schema.presupuestos.id)).limit(100)
  return <Shell moduloActivo="produccion">
    <div className="min-w-0 space-y-4">
      <h1 className="text-xl font-semibold">Producción</h1>
      <form className="flex flex-wrap gap-2">
        <label className="min-w-0"><span className="sr-only">Buscar presupuesto</span>
          <input name="q" defaultValue={busqueda} placeholder="Número, destinatario u obra" className="w-72 max-w-full rounded border px-3 py-2 text-sm"
            style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border-strong)' }} /></label>
        <button className="rounded border px-4 py-2 text-sm" style={{ borderColor: 'var(--al-border)' }}>Buscar</button>
      </form>
      <Tabla titulo="Presupuestos para producción" cabeceras={['Documento', 'Revisión', 'Destinatario', 'Obra', 'Estado', 'Producción']}>
        {filas.map(p => <tr key={p.id}>
          <td className="cifra whitespace-nowrap">{p.serie} {p.numero}</td><td className="cifra">{p.revision}</td>
          <td>{resolverDestinatarioPresupuesto({ clienteNombre: p.cliente, potencialNombre: p.potencial, nombreLibre: p.nombreLibre })}</td>
          <td>{p.obra ?? '—'}</td><td>{p.estado}</td>
          <td><Link href={`/dashboard/produccion/${p.id}`} className="underline" aria-label={`Ver producción ${p.serie} ${p.numero} revisión ${p.revision}`}>Ver producción</Link></td>
        </tr>)}
      </Tabla>
      {filas.length === 0 && <p>Sin presupuestos.</p>}
    </div>
  </Shell>
}
