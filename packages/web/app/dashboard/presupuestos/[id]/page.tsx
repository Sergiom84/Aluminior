import { EditarCabecera } from './_components/editar-cabecera'
import { resolverDestinatarioPresupuesto } from '../_lib/destinatario'
import { leerResultadoCerramiento } from '../_lib/cerramientos/resultado-persistido.ts'
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
import { PestanasDocumento, PestanasFicha } from '../_components/pestanas-documento.tsx'
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
  const [potencial] = presupuesto.potencialCodigo
    ? await db.select({ nombre: schema.clientesPotenciales.nombre }).from(schema.clientesPotenciales)
      .where(eq(schema.clientesPotenciales.codigo, presupuesto.potencialCodigo)).limit(1) : []
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

  const resultadosPorLinea = new Map(await Promise.all(cerramientos.map(async c =>
    [c.lineaId, await leerResultadoCerramiento(db, c.lineaId)] as const)))
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

  const destinatario = resolverDestinatarioPresupuesto({
    clienteNombre: cliente?.nombre, potencialNombre: potencial?.nombre, nombreLibre: presupuesto.nombreLibre,
  })

  return (
    <Shell moduloActivo="presupuestos">
      <section className="al-document-window" aria-labelledby="titulo-presupuesto">
        <header className={`${styles.detailHeader} al-document-heading`}>
          <h2 id="titulo-presupuesto">Presupuestos de Clientes. Detalle</h2>
        </header>

        <div className="al-commandbar" aria-label="Acciones del presupuesto">
          <Link href="/dashboard/presupuestos" className="al-command-primary" title="Grabar datos (F9)">
            Aceptar
          </Link>
          <Link href="/dashboard/presupuestos" className="al-command">Cerrar</Link>
          <a href={`/dashboard/presupuestos/${id}/pdf`} target="_blank" rel="noopener"
            className={`${styles.pdfAction} al-command`}>Emitir</a>
          <span className="al-status" data-status={presupuesto.estado}>{presupuesto.estado}</span>
        </div>

        <div className={`${styles.headerRow} al-ficha-meta`}>
          <span>Nº <strong className="cifra">{referenciaPresupuesto(p.numero, p.revision)}</strong></span>
          <span>Fecha {presupuesto.fecha ? new Date(presupuesto.fecha).toLocaleDateString('es-ES') : '—'}</span>
          <span>Serie {presupuesto.serie}</span>
          <span>Tarifa {presupuesto.tarifa}</span>
          <span>{destinatario}</span>
          {presupuesto.obraTexto && <span>Obra: {presupuesto.obraTexto}</span>}
        </div>

        {p.estado === 'PENDIENTE' && <div className="al-ficha-edit">
          <EditarCabecera datos={{ presupuestoId: id, clienteCodigo: p.clienteCodigo,
            clienteNombre: cliente?.nombre ?? null, potencialCodigo: p.potencialCodigo, nombreLibre: p.nombreLibre,
            obraTexto: p.obraTexto, formaPago: p.formaPago, observaciones: p.observaciones }} />
        </div>}

        {p.estado === 'PENDIENTE' && (
          <AnyadirLinea presupuestoId={id} series={series.map((serie) => serie.codigo)} acabados={acabados} />
        )}

        <div className={`${styles.tableScroll} al-ficha-lines`} tabIndex={0}
          aria-label="Líneas del presupuesto, tabla desplazable">
          <table className={`${styles.budgetTable} text-sm`}>
            <thead><tr>
              {['Artículo', 'Descripción', 'Referencia', 'Acabado', 'Cdad.', 'Ancho(mm)', 'Alto(mm)', 'Precio', 'Dto', 'Total', 'Dibujo', ''].map((titulo, indice) => (
                <th key={titulo + indice} className="border-b px-3 py-2.5 font-medium" style={{
                  borderColor: 'var(--al-border)', color: 'var(--al-text-muted)',
                  textAlign: indice >= 4 && indice <= 9 ? 'right' : 'left',
                }}>{titulo}</th>
              ))}
            </tr></thead>
            <tbody>{lineas.length === 0 ? (
              <tr><td colSpan={12} className="px-4 py-10 text-center" style={{ color: 'var(--al-text-muted)' }}>
                Todavía no hay líneas. Elige una estructura en el escaparate.
              </td></tr>
            ) : lineas.map((linea) => (
              <LineaPresupuesto key={linea.id} linea={linea} presupuestoId={id} articuloEditable={p.estado === 'PENDIENTE'}
                resultado={resultadosPorLinea.get(linea.id) ?? null}
                manoObra={manoObra.filter(f => f.lineaId === linea.id)}
                despiece={piezasPorLinea.get(linea.id) ?? []} edicion={edicionPorLinea.get(linea.id) ?? null}
                series={series.map((serie) => serie.codigo)} acabados={acabados} />
            ))}</tbody>
          </table>
        </div>

        <div className="al-ficha-totals">
          <dl className={`${styles.totals} w-72 text-sm`}>
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
        <PestanasFicha />
        <PestanasDocumento vista="ficha" fichaHref={`/dashboard/presupuestos/${id}`} />
      </section>
    </Shell>
  )
}
