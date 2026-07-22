import { notFound } from 'next/navigation'
import Link from 'next/link'
import { eq, asc, inArray } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { presupuestoIncompleto } from '@aluminior/core/precios'
import { Shell } from '../../_components/shell.tsx'
import { AnyadirLinea, BotonBorrarLinea } from './_components/anyadir-linea.tsx'

export const dynamic = 'force-dynamic'

const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })

export default async function DetallePresupuesto({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const db = crearDb()

  const [p] = await db.select().from(schema.presupuestos)
    .where(eq(schema.presupuestos.id, id)).limit(1)
  if (!p) notFound()

  const [cliente] = p.clienteCodigo
    ? await db.select({ nombre: schema.clientes.nombre })
        .from(schema.clientes).where(eq(schema.clientes.codigo, p.clienteCodigo)).limit(1)
    : []

  const lineas = await db.select()
    .from(schema.lineas)
    .where(eq(schema.lineas.presupuestoId, id))
    .orderBy(asc(schema.lineas.orden))
  const hayImportesIncompletos = presupuestoIncompleto(lineas)

  // Series configuradas: la serie es prerrequisito de toda línea de estructura.
  const series = await db.select({ codigo: schema.series.codigo })
    .from(schema.series).orderBy(asc(schema.series.codigo))

  const acabados = await db.select({
    codigo: schema.acabados.codigo,
    descripcion: schema.acabados.descripcion,
  }).from(schema.acabados).orderBy(asc(schema.acabados.codigo))

  // Despiece persistido de cada línea (perfiles ya resueltos por la serie).
  const idsLineas = lineas.map((l) => l.id)
  const piezas = idsLineas.length
    ? await db.select().from(schema.lineasDespiece)
        .where(inArray(schema.lineasDespiece.lineaId, idsLineas))
    : []
  const despiecePorLinea = new Map<string, typeof piezas>()
  for (const pz of piezas) {
    const lista = despiecePorLinea.get(pz.lineaId) ?? []
    lista.push(pz)
    despiecePorLinea.set(pz.lineaId, lista)
  }

  return (
    <Shell moduloActivo="presupuestos">
      <div className="mb-6">
        <Link href="/dashboard/presupuestos" className="text-sm" style={{ color: 'var(--al-accent)' }}>
          ← Volver a presupuestos
        </Link>
        <div className="mt-3 flex flex-wrap items-baseline gap-4">
          <h2 className="text-2xl font-semibold">
            Presupuesto <span className="cifra">{p.numero}</span>
          </h2>
          <span className="rounded px-2 py-0.5 text-xs uppercase tracking-wide"
            style={{ background: 'var(--al-accent-soft)', color: 'var(--al-accent-strong)' }}>
            {p.estado}
          </span>
          <a href={`/dashboard/presupuestos/${id}/pdf`} target="_blank" rel="noopener"
            className="ml-auto rounded border px-3 py-1 text-sm"
            style={{ borderColor: 'var(--al-border)', color: 'var(--al-accent)' }}>
            PDF
          </a>
        </div>
        <div className="mt-1 flex flex-wrap gap-4 text-sm" style={{ color: 'var(--al-text-muted)' }}>
          <span>{cliente?.nombre ?? p.nombreLibre ?? 'Sin destinatario'}</span>
          {p.obraTexto && <span>Obra: {p.obraTexto}</span>}
          <span>Tarifa {p.tarifa}</span>
          <span>{p.fecha ? new Date(p.fecha).toLocaleDateString('es-ES') : ''}</span>
        </div>
      </div>

      <div className="mb-6">
        <AnyadirLinea presupuestoId={id} series={series.map((s) => s.codigo)}
          acabados={acabados} />
      </div>

      <div className="overflow-hidden rounded-lg border"
        style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--al-surface-muted)' }}>
              {['#', 'Descripción', 'Ubicación', 'Medidas', 'Cdad.', 'Precio', 'Total', ''].map((h, i) => (
                <th key={h + i} className="border-b px-3 py-2.5 font-medium"
                  style={{
                    borderColor: 'var(--al-border)', color: 'var(--al-text-muted)',
                    textAlign: i >= 4 && i <= 6 ? 'right' : 'left',
                  }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lineas.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center" style={{ color: 'var(--al-text-muted)' }}>
                  Todavía no hay líneas. Añade la primera arriba.
                </td>
              </tr>
            ) : (
              lineas.map((l) => (
                <LineaConDespiece key={l.id} linea={l} presupuestoId={id}
                  despiece={despiecePorLinea.get(l.id) ?? []} />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex justify-end">
        <dl className="w-72 rounded-lg border p-4 text-sm"
          style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border)' }}>
          <div className="flex justify-between py-1">
            <dt style={{ color: 'var(--al-text-muted)' }}>Base imponible</dt>
            <dd className="cifra">{hayImportesIncompletos ? 'sin valorar' : eur.format(Number(p.baseImponible))}</dd>
          </div>
          <div className="flex justify-between py-1">
            <dt style={{ color: 'var(--al-text-muted)' }}>IVA {Number(p.tipoIva)}%</dt>
            <dd className="cifra">{hayImportesIncompletos ? 'sin valorar' : eur.format(Number(p.cuotaIva))}</dd>
          </div>
          <div className="mt-2 flex justify-between border-t pt-2 text-base font-semibold"
            style={{ borderColor: 'var(--al-border)' }}>
            <dt>Total</dt>
            <dd className="cifra">{hayImportesIncompletos ? 'sin valorar' : eur.format(Number(p.total))}</dd>
          </div>
          {hayImportesIncompletos && (
            <p className="mt-2 text-xs" style={{ color: 'var(--al-warn)' }}>
              Hay líneas con cálculo pendiente. El presupuesto no tiene un total válido.
            </p>
          )}
        </dl>
      </div>
    </Shell>
  )
}

/**
 * Fila de línea con su despiece desplegable: los perfiles ya resueltos por la
 * serie, con medida de corte y coste (o "sin coste" honesto si falta).
 */
function LineaConDespiece({
  linea: l, presupuestoId, despiece,
}: {
  linea: {
    id: string; orden: number; tipo: string; descripcion: string
    referencia: string | null; anchoMm: number | null; altoMm: number | null
    cantidad: string; precioUnitario: string | null; total: string | null
    valoracionCompleta: boolean; avisoValoracion: string | null
  }
  presupuestoId: string
  despiece: {
    id: string; articuloCodigo: string; cantidad: string
    largoCorteMm: string | null; anchoCorteMm: string | null
    funcion: string | null
    costeUnitario: string | null; costeTotal: string | null
  }[]
}) {
  const costeTotal = despiece.reduce((acc, pz) => acc + (pz.costeTotal ? Number(pz.costeTotal) : 0), 0)
  const sinCoste = despiece.filter((pz) => pz.costeTotal === null).length
  return (
    <>
      <tr className="border-b" style={{ borderColor: 'var(--al-border)' }}>
                  <td className="cifra px-3 py-2" style={{ textAlign: 'left', color: 'var(--al-text-faint)' }}>
                    {l.orden}
                  </td>
                  <td className="px-3 py-2">
                    <span className="mr-2 rounded px-1.5 py-0.5 text-[10px] uppercase"
                      style={{
                        background: l.tipo === 'ESTRUCTURA' ? 'var(--al-accent-soft)' : 'var(--al-surface-muted)',
                        color: l.tipo === 'ESTRUCTURA' ? 'var(--al-accent-strong)' : 'var(--al-text-muted)',
                      }}>
                      {l.tipo === 'ESTRUCTURA' ? 'estr' : 'art'}
                    </span>
                    {l.descripcion}
                    {/*
                      T.17 condición 1: el riesgo de una regla de rebaje no
                      exacta se acepta, pero NUNCA en silencio. Una línea
                      valorada con avisos pinta su precio; el aviso tiene que
                      leerse igual. Como saldrá en la mayoría de líneas de
                      ELEGANTPVC (3.306 de 4.747 piezas), va discreto —sin
                      fondo ni borde— pero a tamaño legible, no en un tooltip.
                    */}
                    {l.valoracionCompleta && l.avisoValoracion && (
                      <div className="mt-0.5 text-xs" style={{ color: 'var(--al-warn)' }}>
                        {l.avisoValoracion}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2" style={{ color: 'var(--al-text-muted)' }}>{l.referencia ?? '—'}</td>
                  <td className="px-3 py-2" style={{ color: 'var(--al-text-muted)' }}>
                    {l.anchoMm && l.altoMm ? `${l.anchoMm} × ${l.altoMm}` : '—'}
                  </td>
                  <td className="cifra px-3 py-2">{Number(l.cantidad)}</td>
                  <td className="cifra px-3 py-2">
                    {!l.valoracionCompleta ? (
                      <span className="text-xs" style={{ color: 'var(--al-warn)' }}
                        title={l.avisoValoracion ?? 'La línea tiene partes pendientes de valorar.'}>
                        sin valorar
                      </span>
                    ) : (
                      <>
                        {eur.format(Number(l.precioUnitario))}
                        {l.avisoValoracion && (
                          <div className="text-[10px] uppercase" style={{ color: 'var(--al-warn)' }}>
                            con avisos
                          </div>
                        )}
                      </>
                    )}
                  </td>
                  <td className="cifra px-3 py-2 font-medium">
                    {!l.valoracionCompleta || l.total === null ? '—' : eur.format(Number(l.total))}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <BotonBorrarLinea lineaId={l.id} presupuestoId={presupuestoId} />
                  </td>
                </tr>
      {despiece.length > 0 && (
        <tr className="border-b" style={{ borderColor: 'var(--al-border)' }}>
          <td colSpan={8} className="px-3 py-1" style={{ background: 'var(--al-surface-muted)' }}>
            <details>
              <summary className="cursor-pointer py-1 text-xs" style={{ color: 'var(--al-text-muted)' }}>
                Despiece: {despiece.length} piezas · coste de perfiles {eur.format(costeTotal)}
                {sinCoste > 0 && ` · ${sinCoste} piezas sin coste`}
              </summary>
              <table className="mb-2 mt-1 w-full text-xs">
                <thead>
                  <tr style={{ color: 'var(--al-text-muted)' }}>
                    <th className="px-2 py-1 text-left font-medium">Artículo</th>
                    <th className="px-2 py-1 text-left font-medium">Función</th>
                    <th className="px-2 py-1 text-right font-medium">Cdad.</th>
                    <th className="px-2 py-1 text-right font-medium">Corte (mm)</th>
                    <th className="px-2 py-1 text-right font-medium">Coste ud.</th>
                    <th className="px-2 py-1 text-right font-medium">Coste</th>
                  </tr>
                </thead>
                <tbody>
                  {despiece.map((pz) => (
                    <tr key={pz.id}>
                      <td className="px-2 py-0.5">{pz.articuloCodigo}</td>
                      <td className="px-2 py-0.5" style={{ color: 'var(--al-text-muted)' }}>{pz.funcion ?? '—'}</td>
                      <td className="cifra px-2 py-0.5 text-right">{Number(pz.cantidad)}</td>
                      <td className="cifra px-2 py-0.5 text-right">
                        {pz.largoCorteMm !== null
                          ? Number(pz.largoCorteMm).toLocaleString('es-ES') +
                            (pz.anchoCorteMm !== null ? ` × ${Number(pz.anchoCorteMm).toLocaleString('es-ES')}` : '')
                          : '—'}
                      </td>
                      <td className="cifra px-2 py-0.5 text-right">
                        {pz.costeUnitario !== null ? eur.format(Number(pz.costeUnitario)) : (
                          <span style={{ color: 'var(--al-warn)' }}>sin coste</span>
                        )}
                      </td>
                      <td className="cifra px-2 py-0.5 text-right">
                        {pz.costeTotal !== null ? eur.format(Number(pz.costeTotal)) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </td>
        </tr>
      )}
    </>
  )
}
