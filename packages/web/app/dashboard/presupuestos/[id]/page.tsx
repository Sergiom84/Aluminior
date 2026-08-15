import { notFound } from 'next/navigation'
import Link from 'next/link'
import { asc, eq, inArray } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { esConfiguracionCerramiento } from '@aluminior/core/estructuras'
import { presupuestoIncompleto } from '@aluminior/core/precios'
import { Shell } from '../../_components/shell.tsx'
import { AnyadirLinea } from './_components/anyadir-linea.tsx'
import { LineaPresupuesto } from './_components/linea-presupuesto.tsx'
import type { DatosEdicionCerramiento } from './_components/editar-cerramiento.tsx'
import { referenciaPresupuesto } from '../_lib/identidad-documento.ts'
import styles from './presupuesto-movil.module.css'

export const dynamic = 'force-dynamic'
const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })

export default async function DetallePresupuesto({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = crearDb()
  const [presupuesto] = await db.select().from(schema.presupuestos)
    .where(eq(schema.presupuestos.id, id)).limit(1)
  if (!presupuesto) notFound()
  const [cliente] = presupuesto.clienteCodigo
    ? await db.select({ nombre: schema.clientes.nombre }).from(schema.clientes)
        .where(eq(schema.clientes.codigo, presupuesto.clienteCodigo)).limit(1)
    : []
  const lineas = await db.select().from(schema.lineas)
    .where(eq(schema.lineas.presupuestoId, id)).orderBy(asc(schema.lineas.orden))
  const series = await db.select({ codigo: schema.series.codigo })
    .from(schema.series).orderBy(asc(schema.series.codigo))
  const acabados = await db.select({
    codigo: schema.acabados.codigo, descripcion: schema.acabados.descripcion,
  }).from(schema.acabados).orderBy(asc(schema.acabados.codigo))
  const idsLineas = lineas.map((linea) => linea.id)
  const piezas = idsLineas.length
    ? await db.select().from(schema.lineasDespiece).where(inArray(schema.lineasDespiece.lineaId, idsLineas)) : []
  const cerramientos = idsLineas.length
    ? await db.select().from(schema.lineasCerramiento).where(inArray(schema.lineasCerramiento.lineaId, idsLineas)) : []
  const manoObra = idsLineas.length
    ? await db.select().from(schema.lineasManoObra).where(inArray(schema.lineasManoObra.lineaId, idsLineas)) : []

  const piezasPorLinea = new Map<string, typeof piezas>()
  for (const pieza of piezas) {
    const lista = piezasPorLinea.get(pieza.lineaId) ?? []
    lista.push(pieza)
    piezasPorLinea.set(pieza.lineaId, lista)
  }
  const lineaPorId = new Map(lineas.map((linea) => [linea.id, linea]))
  const edicionPorLinea = new Map<string, DatosEdicionCerramiento>()
  for (const cerramiento of cerramientos) {
    const linea = lineaPorId.get(cerramiento.lineaId)
    if (!linea || !esConfiguracionCerramiento(cerramiento.configuracion)) continue
    if (cerramiento.varianteAcristalamiento !== '1' && cerramiento.varianteAcristalamiento !== '2') continue
    const horas = manoObra.filter((fila) => fila.lineaId === linea.id)
    edicionPorLinea.set(linea.id, {
      configuracion: cerramiento.configuracion,
      serieCodigo: cerramiento.serieCodigo,
      vidrioCodigo: cerramiento.vidrioCodigo,
      acabadoCodigo: cerramiento.acabadoCodigo,
      varianteAcristalamiento: cerramiento.varianteAcristalamiento,
      referencia: linea.referencia,
      cantidad: linea.cantidad,
      horasFabricacion: horas.find((fila) => fila.concepto === 'FABRICACION_ADICIONAL')?.horas ?? '0',
      horasColocacion: horas.find((fila) => fila.concepto === 'COLOCACION')?.horas ?? '0',
    })
  }
  const incompleto = presupuestoIncompleto(lineas)
  const p = presupuesto

  return (
    <Shell moduloActivo="presupuestos">
      <div className={`${styles.detailHeader} mb-6`}>
        <Link href="/dashboard/presupuestos" className="text-sm" style={{ color: 'var(--al-accent)' }}>
          ← Volver a presupuestos
        </Link>
        <div className={`${styles.headerRow} mt-3`}>
          <h2 className="text-2xl font-semibold">Presupuesto <span className="cifra">
            {referenciaPresupuesto(p.numero, p.revision)}
          </span></h2>
          <span className="rounded px-2 py-0.5 text-xs uppercase tracking-wide"
            style={{ background: 'var(--al-accent-soft)', color: 'var(--al-accent-strong)' }}>{presupuesto.estado}</span>
          <a href={`/dashboard/presupuestos/${id}/pdf`} target="_blank" rel="noopener"
            className={`${styles.pdfAction} rounded border px-3 py-1 text-sm`}
            style={{ borderColor: 'var(--al-border)', color: 'var(--al-accent)' }}>PDF</a>
        </div>
        <div className="mt-1 flex flex-wrap gap-4 text-sm" style={{ color: 'var(--al-text-muted)' }}>
          <span>{cliente?.nombre ?? presupuesto.nombreLibre ?? 'Sin destinatario'}</span>
          {presupuesto.obraTexto && <span>Obra: {presupuesto.obraTexto}</span>}
          <span>Tarifa {presupuesto.tarifa}</span>
          <span>{presupuesto.fecha ? new Date(presupuesto.fecha).toLocaleDateString('es-ES') : ''}</span>
        </div>
      </div>
      <div className="mb-6">
        <AnyadirLinea presupuestoId={id} series={series.map((serie) => serie.codigo)} acabados={acabados} />
      </div>
      <div className={`${styles.tableScroll} rounded-lg border`} tabIndex={0}
        aria-label="Líneas del presupuesto, tabla desplazable"
        style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border)' }}>
        <table className={`${styles.budgetTable} text-sm`}>
          <thead><tr style={{ background: 'var(--al-surface-muted)' }}>
            {['#', 'Descripción', 'Ubicación', 'Medidas', 'Cdad.', 'Precio', 'Total', ''].map((titulo, indice) => (
              <th key={titulo + indice} className="border-b px-3 py-2.5 font-medium" style={{
                borderColor: 'var(--al-border)', color: 'var(--al-text-muted)',
                textAlign: indice >= 4 && indice <= 6 ? 'right' : 'left',
              }}>{titulo}</th>
            ))}
          </tr></thead>
          <tbody>{lineas.length === 0 ? (
            <tr><td colSpan={8} className="px-4 py-10 text-center" style={{ color: 'var(--al-text-muted)' }}>
              Todavía no hay líneas. Añade la primera arriba.
            </td></tr>
          ) : lineas.map((linea) => (
            <LineaPresupuesto key={linea.id} linea={linea} presupuestoId={id}
              despiece={piezasPorLinea.get(linea.id) ?? []} edicion={edicionPorLinea.get(linea.id) ?? null}
              series={series.map((serie) => serie.codigo)} acabados={acabados} />
          ))}</tbody>
        </table>
      </div>
      <div className="mt-5 flex justify-end">
        <dl className={`${styles.totals} w-72 rounded-lg border p-4 text-sm`}
          style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border)' }}>
          {[['Base imponible', presupuesto.baseImponible], [`IVA ${Number(presupuesto.tipoIva)}%`, presupuesto.cuotaIva]].map(([etiqueta, importe]) => (
            <div key={etiqueta} className="flex justify-between py-1">
              <dt style={{ color: 'var(--al-text-muted)' }}>{etiqueta}</dt>
              <dd className="cifra">{incompleto ? 'sin valorar' : eur.format(Number(importe))}</dd>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t pt-2 text-base font-semibold" style={{ borderColor: 'var(--al-border)' }}>
            <dt>Total</dt><dd className="cifra">{incompleto ? 'sin valorar' : eur.format(Number(presupuesto.total))}</dd>
          </div>
          {incompleto && <p className="mt-2 text-xs" style={{ color: 'var(--al-warn)' }}>
            Hay líneas con cálculo pendiente. El presupuesto no tiene un total válido.
          </p>}
        </dl>
      </div>
    </Shell>
  )
}
