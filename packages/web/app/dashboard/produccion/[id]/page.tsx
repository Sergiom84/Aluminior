/**
 * Hoja de corte de un presupuesto (T.64).
 *
 * Agrega los cortes de `lineas_despiece` POR ARTÍCULO (perfil) y, para cada uno,
 * corre el optimizador de corte 1D del core. Todo el cálculo es en SERVIDOR.
 *
 * ⚠️ AGREGA A NIVEL DE LISTA DE CORTES, NO POR UNIDAD FÍSICA (bloqueo de datos
 * T.51/T.53). El despiece por unidad física —qué corte concreto va a qué
 * ventana/hoja— no está persistido en la fuente (las tablas de producción del
 * ERP original están vacías), así que la hoja reúne todos los cortes de un
 * mismo perfil del presupuesto y optimiza sobre esa lista. No se inventa una
 * atribución por unidad que la fuente no tiene.
 *
 * LONGITUD DE BARRA: no existe ninguna columna de longitud de barra estándar en
 * `articulos` (sí `metraje_minimo`/`metraje_multiplo_largo`, que son de
 * facturación, no de stock físico). Por eso la longitud de barra es un
 * PARÁMETRO del usuario, con 6000 mm (barra comercial de 6 m) como valor por
 * defecto visible y editable, nunca una suposición silenciosa.
 */
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { eq, asc, inArray, and, isNotNull, isNull } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { optimizarCorte, LONGITUD_BARRA_POR_DEFECTO_MM, type PlanCorte } from '@aluminior/core/produccion'
import { Shell } from '../../_components/shell.tsx'

export const dynamic = 'force-dynamic'

const nf = new Intl.NumberFormat('es-ES')

/** Cortes de un perfil, ya agrupados por longitud + ángulos. */
interface CorteAgrupado {
  longitud: number
  cantidad: number
  anguloIzquierdo: number | null
  anguloDerecho: number | null
}

interface PerfilHoja {
  articuloCodigo: string
  descripcion: string | null
  cortes: CorteAgrupado[]
  plan: PlanCorte
}

/** Ángulos → etiqueta legible arrastrada por el optimizador. */
function etiquetaAngulos(izq: number | null, der: number | null): string | undefined {
  if (izq === null && der === null) return undefined
  const f = (a: number | null) => (a === null ? '·' : `${a}°`)
  return `${f(izq)}/${f(der)}`
}

export default async function HojaCorte({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ barra?: string; kerf?: string }>
}) {
  const { id } = await params
  const { barra, kerf: kerfRaw } = await searchParams
  const db = crearDb()

  // Parámetros del usuario, con defaults explícitos y saneados.
  const longitudBarra = clamp(Number(barra), 1, 40000, LONGITUD_BARRA_POR_DEFECTO_MM)
  const kerf = clamp(Number(kerfRaw), 0, 100, 0)

  const [p] = await db.select().from(schema.presupuestos)
    .where(eq(schema.presupuestos.id, id)).limit(1)
  if (!p) notFound()

  const [cliente] = p.clienteCodigo
    ? await db.select({ nombre: schema.clientes.nombre })
        .from(schema.clientes).where(eq(schema.clientes.codigo, p.clienteCodigo)).limit(1)
    : []

  // Líneas del presupuesto: necesitamos su `cantidad` (nº de unidades) porque
  // el despiece persiste cortes POR UNIDAD de estructura, no × nº de ventanas.
  const lineas = await db.select({
    id: schema.lineas.id,
    cantidad: schema.lineas.cantidad,
  }).from(schema.lineas)
    .where(eq(schema.lineas.presupuestoId, id))
    .orderBy(asc(schema.lineas.orden))
  const cantidadPorLinea = new Map(lineas.map((l) => [l.id, Number(l.cantidad)]))
  const idsLineas = lineas.map((l) => l.id)

  // Sólo cortes 1D de perfil: con largo y SIN ancho (el ancho marca vidrio/panel,
  // que es superficie 2D y no se optimiza como barra).
  const piezas = idsLineas.length
    ? await db.select({
        lineaId: schema.lineasDespiece.lineaId,
        articuloCodigo: schema.lineasDespiece.articuloCodigo,
        cantidad: schema.lineasDespiece.cantidad,
        largoCorteMm: schema.lineasDespiece.largoCorteMm,
        anguloIzquierdo: schema.lineasDespiece.anguloIzquierdo,
        anguloDerecho: schema.lineasDespiece.anguloDerecho,
      }).from(schema.lineasDespiece)
        .where(and(
          inArray(schema.lineasDespiece.lineaId, idsLineas),
          isNotNull(schema.lineasDespiece.largoCorteMm),
          isNull(schema.lineasDespiece.anchoCorteMm),
        ))
    : []

  // Descripciones de artículo para la cabecera de cada perfil.
  const codigos = [...new Set(piezas.map((x) => x.articuloCodigo))]
  const descripciones = codigos.length
    ? new Map((await db.select({
        codigo: schema.articulos.codigo,
        descripcion: schema.articulos.descripcion,
      }).from(schema.articulos)
        .where(inArray(schema.articulos.codigo, codigos)))
        .map((a) => [a.codigo, a.descripcion]))
    : new Map<string, string>()

  // Agregación: por artículo, y dentro por (longitud, ángulos).
  const porArticulo = new Map<string, Map<string, CorteAgrupado>>()
  for (const pz of piezas) {
    const largo = Math.round(Number(pz.largoCorteMm))
    if (!(largo > 0)) continue
    const izq = pz.anguloIzquierdo !== null ? Number(pz.anguloIzquierdo) : null
    const der = pz.anguloDerecho !== null ? Number(pz.anguloDerecho) : null
    // Piezas físicas = cortes por unidad × nº de unidades de la línea.
    const unidades = cantidadPorLinea.get(pz.lineaId) ?? 1
    const cantidad = Number(pz.cantidad) * unidades

    const grupos = porArticulo.get(pz.articuloCodigo) ?? new Map<string, CorteAgrupado>()
    const clave = `${largo}|${izq}|${der}`
    const g = grupos.get(clave) ?? { longitud: largo, cantidad: 0, anguloIzquierdo: izq, anguloDerecho: der }
    g.cantidad += cantidad
    grupos.set(clave, g)
    porArticulo.set(pz.articuloCodigo, grupos)
  }

  // Optimización por perfil. La cantidad de piezas es entera por naturaleza;
  // se redondea el producto para absorber artefactos de coma flotante.
  const perfiles: PerfilHoja[] = [...porArticulo.entries()]
    .map(([articuloCodigo, grupos]) => {
      const cortes = [...grupos.values()]
        .map((c) => ({ ...c, cantidad: Math.round(c.cantidad) }))
        .filter((c) => c.cantidad > 0)
        .sort((a, b) => b.longitud - a.longitud)
      const plan = optimizarCorte(
        cortes.map((c) => ({
          longitud: c.longitud,
          cantidad: c.cantidad,
          ref: etiquetaAngulos(c.anguloIzquierdo, c.anguloDerecho),
        })),
        { longitudBarra, kerf },
      )
      return { articuloCodigo, descripcion: descripciones.get(articuloCodigo) ?? null, cortes, plan }
    })
    .sort((a, b) => b.plan.nBarras - a.plan.nBarras)

  const totalBarras = perfiles.reduce((acc, x) => acc + x.plan.nBarras, 0)
  const hayImposibles = perfiles.some((x) => x.plan.imposibles.length > 0)

  return (
    <Shell moduloActivo="produccion">
      <div className="mb-6">
        <Link href="/dashboard/produccion" className="text-sm" style={{ color: 'var(--al-accent)' }}>
          ← Volver a producción
        </Link>
        <div className="mt-3 flex flex-wrap items-baseline gap-4">
          <h2 className="text-2xl font-semibold">
            Hoja de corte · presupuesto <span className="cifra">{p.numero}</span>
          </h2>
        </div>
        <div className="mt-1 flex flex-wrap gap-4 text-sm" style={{ color: 'var(--al-text-muted)' }}>
          <span>{cliente?.nombre ?? p.nombreLibre ?? 'Sin destinatario'}</span>
          {p.obraTexto && <span>Obra: {p.obraTexto}</span>}
        </div>
      </div>

      {/* Parámetros de optimización: longitud de barra (no está en el catálogo)
          y ancho de sierra. Se editan y la página recalcula en servidor. */}
      <form className="mb-5 flex flex-wrap items-end gap-4 rounded-lg border p-4"
        style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border)' }}>
        <label className="text-sm">
          <span className="mb-1 block" style={{ color: 'var(--al-text-muted)' }}>Longitud de barra (mm)</span>
          <input name="barra" type="number" min={1} defaultValue={longitudBarra}
            className="w-40 rounded-md border px-3 py-2 text-sm"
            style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border-strong)' }} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block" style={{ color: 'var(--al-text-muted)' }}>Ancho de sierra / kerf (mm)</span>
          <input name="kerf" type="number" min={0} step="0.1" defaultValue={kerf}
            className="w-40 rounded-md border px-3 py-2 text-sm"
            style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border-strong)' }} />
        </label>
        <button type="submit" className="rounded-md px-4 py-2 text-sm font-medium"
          style={{ background: 'var(--al-accent)', color: 'var(--al-accent-contrast)' }}>
          Recalcular
        </button>
        <p className="basis-full text-xs" style={{ color: 'var(--al-text-faint)' }}>
          El catálogo no guarda una longitud de barra estándar por artículo; se usa este
          valor para todos los perfiles. Por defecto {nf.format(LONGITUD_BARRA_POR_DEFECTO_MM)} mm
          (barra comercial de 6 m).
        </p>
      </form>

      {perfiles.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center"
          style={{ borderColor: 'var(--al-border-strong)' }}>
          <p style={{ color: 'var(--al-text-muted)' }}>
            Este presupuesto no tiene cortes de perfil despiezados.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-5 flex flex-wrap gap-6 rounded-lg border p-4 text-sm"
            style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border)' }}>
            <Metrica etiqueta="Perfiles" valor={String(perfiles.length)} />
            <Metrica etiqueta="Barras totales" valor={nf.format(totalBarras)} />
            <Metrica etiqueta="Longitud de barra" valor={`${nf.format(longitudBarra)} mm`} />
            {hayImposibles && (
              <span className="self-center text-xs" style={{ color: 'var(--al-warn)' }}>
                Hay cortes que no caben en la barra (ver detalle).
              </span>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {perfiles.map((perfil) => (
              <PerfilCard key={perfil.articuloCodigo} perfil={perfil} />
            ))}
          </div>
        </>
      )}
    </Shell>
  )
}

function Metrica({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--al-text-muted)' }}>{etiqueta}</div>
      <div className="cifra text-lg font-semibold">{valor}</div>
    </div>
  )
}

function PerfilCard({ perfil }: { perfil: PerfilHoja }) {
  const { plan } = perfil
  return (
    <div className="overflow-hidden rounded-lg border"
      style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border)' }}>
      <div className="flex flex-wrap items-baseline gap-3 border-b px-4 py-3"
        style={{ borderColor: 'var(--al-border)', background: 'var(--al-surface-muted)' }}>
        <span className="font-medium">{perfil.articuloCodigo}</span>
        {perfil.descripcion && (
          <span className="text-sm" style={{ color: 'var(--al-text-muted)' }}>{perfil.descripcion}</span>
        )}
        <span className="ml-auto text-sm" style={{ color: 'var(--al-text-muted)' }}>
          <strong className="cifra" style={{ color: 'var(--al-text)' }}>{plan.nBarras}</strong> barras ·{' '}
          desperdicio <strong className="cifra" style={{
            color: plan.porcentajeDesperdicio > 25 ? 'var(--al-warn)' : 'var(--al-text)',
          }}>{plan.porcentajeDesperdicio.toLocaleString('es-ES')}%</strong>{' '}
          ({nf.format(Math.round(plan.desperdicioTotal))} mm)
        </span>
      </div>

      <div className="grid gap-4 p-4 md:grid-cols-2">
        {/* Lista de cortes requeridos */}
        <div>
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--al-text-muted)' }}>
            Lista de cortes
          </h4>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: 'var(--al-text-muted)' }}>
                <th className="px-2 py-1 text-right font-medium">Longitud</th>
                <th className="px-2 py-1 text-right font-medium">Cdad.</th>
                <th className="px-2 py-1 text-left font-medium">Ángulos</th>
              </tr>
            </thead>
            <tbody>
              {perfil.cortes.map((c, i) => (
                <tr key={i}>
                  <td className="cifra px-2 py-0.5 text-right">{nf.format(c.longitud)} mm</td>
                  <td className="cifra px-2 py-0.5 text-right">{c.cantidad}</td>
                  <td className="px-2 py-0.5" style={{ color: 'var(--al-text-muted)' }}>
                    {etiquetaAngulos(c.anguloIzquierdo, c.anguloDerecho) ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Plan de barras */}
        <div>
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--al-text-muted)' }}>
            Plan de barras
          </h4>
          <ol className="flex flex-col gap-1.5">
            {plan.barras.map((barra, i) => (
              <li key={i} className="flex items-center gap-2 text-xs">
                <span className="cifra shrink-0" style={{ color: 'var(--al-text-faint)', width: '2.5rem' }}>
                  #{i + 1}
                </span>
                {/* Barra proporcional: cada corte como segmento. */}
                <div className="flex h-5 flex-1 overflow-hidden rounded"
                  style={{ background: 'var(--al-surface-muted)', border: '1px solid var(--al-border)' }}>
                  {barra.cortes.map((corte, j) => (
                    <div key={j}
                      title={`${nf.format(corte.longitud)} mm${corte.ref ? ` · ${corte.ref}` : ''}`}
                      className="flex items-center justify-center overflow-hidden text-[9px] whitespace-nowrap"
                      style={{
                        width: `${(corte.longitud / plan.longitudBarra) * 100}%`,
                        background: 'var(--al-accent-soft)',
                        color: 'var(--al-accent-strong)',
                        borderRight: '1px solid var(--al-surface)',
                      }}>
                      {nf.format(corte.longitud)}
                    </div>
                  ))}
                </div>
                <span className="cifra shrink-0" style={{ color: 'var(--al-text-muted)', width: '4.5rem', textAlign: 'right' }}>
                  sobra {nf.format(Math.round(barra.sobrante))}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {plan.imposibles.length > 0 && (
        <div className="border-t px-4 py-3 text-sm" style={{ borderColor: 'var(--al-border)' }}>
          <p className="mb-1 font-medium" style={{ color: 'var(--al-warn)' }}>
            Cortes que no caben en la barra
          </p>
          <ul className="list-inside list-disc text-xs" style={{ color: 'var(--al-text-muted)' }}>
            {plan.imposibles.map((imp, i) => (
              <li key={i}>{imp.cantidad} × {nf.format(imp.longitud)} mm — {imp.motivo}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/** Sanea un número de query param a un rango, con default si no es válido. */
function clamp(v: number, min: number, max: number, porDefecto: number): number {
  if (!Number.isFinite(v) || v < min || v > max) return porDefecto
  return v
}
