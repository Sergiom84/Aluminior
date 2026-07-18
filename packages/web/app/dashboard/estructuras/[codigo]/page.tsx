import { notFound } from 'next/navigation'
import Link from 'next/link'
import { eq, asc, sql } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { nombreFamilia } from '@aluminior/core/estructuras'
import { Shell } from '../../_components/shell.tsx'
import { TablaDespiece } from './_components/despiece.tsx'

export const dynamic = 'force-dynamic'

export default async function DetalleEstructura({
  params,
}: {
  params: Promise<{ codigo: string }>
}) {
  const { codigo } = await params
  const cod = decodeURIComponent(codigo)
  const db = crearDb()

  const [estructura] = await db
    .select().from(schema.estructuras)
    .where(eq(schema.estructuras.codigo, cod)).limit(1)

  if (!estructura) notFound()

  // Se trae la descripción del artículo para que el despiece sea legible.
  const componentes = await db
    .select({
      id: schema.estructuraComponentes.id,
      articuloCodigo: schema.estructuraComponentes.articuloCodigo,
      descripcionArticulo: schema.articulos.descripcion,
      cantidad: schema.estructuraComponentes.cantidad,
      formulaLargo: schema.estructuraComponentes.formulaLargo,
      tipoCorte: schema.estructuraComponentes.tipoCorte,
      anguloIzquierdo: schema.estructuraComponentes.anguloIzquierdo,
      anguloDerecho: schema.estructuraComponentes.anguloDerecho,
      funcion: schema.estructuraComponentes.funcion,
      posicionTrabajo: schema.estructuraComponentes.posicionTrabajo,
    })
    .from(schema.estructuraComponentes)
    .leftJoin(schema.articulos, eq(schema.articulos.codigo, schema.estructuraComponentes.articuloCodigo))
    .where(eq(schema.estructuraComponentes.estructuraCodigo, cod))
    .orderBy(asc(schema.estructuraComponentes.lineaOrigen))

  /**
   * Cotas simbólicas de la estructura: FI (fijo inferior), FS (fijo superior),
   * TD (travesaño derecha)… con su valor por defecto.
   *
   * Se agrupan por símbolo: el original guarda una fila por travesaño, así que
   * el mismo símbolo puede repetirse. En las fórmulas es una única variable,
   * de modo que mostrar tres casillas "TD" confundiría.
   */
  const cotas = (await db.execute<{
    simbolo: string
    valorPorDefecto: string | null
    nombre: string | null
  }>(sql`
    SELECT DISTINCT ON (simbolo)
           simbolo,
           valor_por_defecto AS "valorPorDefecto",
           nombre
    FROM estructura_cotas
    WHERE estructura_codigo = ${cod}
    ORDER BY simbolo, orden_travesano NULLS LAST
  `)) as unknown as { simbolo: string; valorPorDefecto: string | null; nombre: string | null }[]

  return (
    <Shell moduloActivo="estructuras">
      <div className="mb-6">
        <Link href="/dashboard/estructuras" className="text-sm" style={{ color: 'var(--al-accent)' }}>
          ← Volver al catálogo
        </Link>
        <h2 className="mt-3 text-2xl font-semibold">{estructura.descripcion}</h2>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm"
          style={{ color: 'var(--al-text-muted)' }}>
          <code className="rounded px-2 py-0.5"
            style={{ background: 'var(--al-accent-soft)', color: 'var(--al-accent-strong)' }}>
            {estructura.codigo}
          </code>
          {estructura.familia && <span>{nombreFamilia(estructura.familia)}</span>}
          <span>{componentes.length} componentes</span>
        </div>
        {estructura.observaciones && (
          <p className="mt-2 text-sm" style={{ color: 'var(--al-text-muted)' }}>
            {estructura.observaciones}
          </p>
        )}
      </div>

      {componentes.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center"
          style={{ borderColor: 'var(--al-border-strong)' }}>
          <p style={{ color: 'var(--al-text-muted)' }}>
            Esta estructura no tiene plantilla de despiece cargada.
          </p>
        </div>
      ) : (
        <TablaDespiece componentes={componentes} cotas={cotas} />
      )}
    </Shell>
  )
}
