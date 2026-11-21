import Link from 'next/link'
import { and, desc, eq, sql } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { Shell } from '../_components/shell.tsx'
import { ListaPresupuestos } from './_components/lista-presupuestos.tsx'
import { BuscadorPresupuestos } from './_components/buscador-presupuestos.tsx'
import { filtroClienteSeleccionado } from './_lib/busqueda-listado.ts'
import { etiquetaTipoBusqueda, filtroPorPlan, leerTipoBusqueda, planBusqueda } from './_lib/busqueda-tipo/index.ts'

export const dynamic = 'force-dynamic'

export default async function Presupuestos({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tipo?: string; cliente?: string }>
}) {
  const { q, tipo: tipoParam, cliente } = await searchParams
  const tipo = leerTipoBusqueda(tipoParam)
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
  const plan = planBusqueda(tipo, busqueda)
  const errorBusqueda = plan && 'error' in plan ? plan.error : null
  const filtroTexto = plan ? filtroPorPlan(plan) : undefined
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
          <BuscadorPresupuestos key={`${tipo}|${busqueda}|${codigoCliente}`}
            tipoInicial={tipo} consultaInicial={busqueda} filtrado={Boolean(busqueda || clienteSeleccionado)} />
        </div>

        {filas.length === 0 ? (
          <div className="border-b px-4 py-12 text-center" style={{ borderColor: 'var(--al-border)' }}>
            <p style={{ color: 'var(--al-text-muted)' }} role={errorBusqueda ? 'alert' : undefined}>
              {errorBusqueda ?? (busqueda
                ? 'Ningún presupuesto coincide con la búsqueda.'
                : clienteSeleccionado ? 'Ningún presupuesto de este cliente.' : 'Todavía no hay presupuestos.')}
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
          <span>{[
            clienteSeleccionado ? `Cliente ${clienteSeleccionado.codigo} · ${clienteSeleccionado.nombre}` : null,
            busqueda ? `${etiquetaTipoBusqueda(tipo)}: ${busqueda}` : null,
          ].filter(Boolean).join(' · ') || 'Últimos 100 presupuestos'}</span>
        </footer>
      </section>
    </Shell>
  )
}
