import Link from 'next/link'
import { and, desc, eq, sql } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { Shell } from '../_components/shell.tsx'
import { ListaPresupuestos } from './_components/lista-presupuestos.tsx'
import { PestanasDocumento } from './_components/pestanas-documento.tsx'
import { FiltroCliente } from './_components/filtro-cliente.tsx'
import { filtroClienteSeleccionado, filtroListadoPresupuestos } from './_lib/busqueda-listado.ts'

export const dynamic = 'force-dynamic'

export default async function Presupuestos({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cliente?: string }>
}) {
  const { q, cliente } = await searchParams
  const busqueda = (q ?? '').trim()
  const codigoCliente = (cliente ?? '').trim().slice(0, 40)
  const db = crearDb()
  const [clienteSeleccionado] = codigoCliente
    ? await db.select({
        codigo: schema.clientes.codigo,
        nombre: schema.clientes.nombre,
        nombreComercial: schema.clientes.nombreComercial,
      }).from(schema.clientes).where(eq(schema.clientes.codigo, codigoCliente)).limit(1)
    : []
  const filtroTexto = filtroListadoPresupuestos(busqueda)
  const filtroCliente = clienteSeleccionado ? filtroClienteSeleccionado(clienteSeleccionado) : undefined
  const filtro = filtroTexto && filtroCliente ? and(filtroTexto, filtroCliente) : filtroTexto ?? filtroCliente

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
          <Link href="/dashboard/presupuestos/dictado" className="al-command">
            Dictar
          </Link>
          <FiltroCliente
            inicial={clienteSeleccionado ? { codigo: clienteSeleccionado.codigo, nombre: clienteSeleccionado.nombre } : null}
            busqueda={busqueda}
          />
          <form className="al-search" role="search">
            <label htmlFor="buscar-presupuesto" className="sr-only">Buscar presupuesto</label>
            <input id="buscar-presupuesto" name="q" defaultValue={busqueda}
              placeholder="Número, cliente, obra, fecha o precio" />
            {clienteSeleccionado && <input type="hidden" name="cliente" value={clienteSeleccionado.codigo} />}
            <button type="submit" className="al-command">Buscar</button>
            {(busqueda || clienteSeleccionado) && <Link href="/dashboard/presupuestos" className="al-command">Limpiar</Link>}
          </form>
        </div>

        {filas.length === 0 ? (
          <div className="border-b px-4 py-12 text-center" style={{ borderColor: 'var(--al-border)' }}>
            <p style={{ color: 'var(--al-text-muted)' }}>
              {clienteSeleccionado
                ? 'Ningún presupuesto de este cliente.'
                : busqueda ? 'Ningún presupuesto coincide con la búsqueda.' : 'Todavía no hay presupuestos.'}
            </p>
            {!busqueda && !clienteSeleccionado && (
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
          <span>{clienteSeleccionado ? `Cliente ${clienteSeleccionado.codigo}` : busqueda ? `Filtro: ${busqueda}` : 'Últimos 100 presupuestos'}</span>
        </footer>
        <PestanasDocumento vista="lista" />
      </section>
    </Shell>
  )
}
