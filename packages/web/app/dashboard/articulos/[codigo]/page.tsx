import { notFound } from 'next/navigation'
import { eq, asc } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { Shell } from '../../_components/shell.tsx'
import { FormularioArticulo } from '../_components/formulario.tsx'
import { familiasConUso } from '../_lib/acciones.ts'

export const dynamic = 'force-dynamic'

export default async function EditarArticulo({
  params,
}: {
  params: Promise<{ codigo: string }>
}) {
  const { codigo } = await params
  const cod = decodeURIComponent(codigo)
  const db = crearDb()

  const [articulo] = await db
    .select().from(schema.articulos)
    .where(eq(schema.articulos.codigo, cod)).limit(1)

  if (!articulo) notFound()

  const [familias, precios] = await Promise.all([
    familiasConUso(),
    db.select({
      acabado: schema.articulosPvp.acabadoCodigo,
      tarifa: schema.articulosPvp.tarifa,
      precio: schema.articulosPvp.precio,
    })
      .from(schema.articulosPvp)
      .where(eq(schema.articulosPvp.articuloCodigo, cod))
      .orderBy(asc(schema.articulosPvp.tarifa), asc(schema.articulosPvp.acabadoCodigo))
      .limit(60),
  ])

  const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })

  return (
    <Shell moduloActivo="articulos">
      <FormularioArticulo
        esNuevo={false}
        familias={familias}
        articulo={{
          codigo: articulo.codigo,
          descripcion: articulo.descripcion,
          familiaCodigo: articulo.familiaCodigo,
          subfamiliaCodigo: articulo.subfamiliaCodigo,
          tipoMetraje: articulo.tipoMetraje,
          metrajeMinimo: articulo.metrajeMinimo,
          metrajeMultiploLargo: articulo.metrajeMultiploLargo,
          metrajeMultiploAncho: articulo.metrajeMultiploAncho,
          pesoMl: articulo.pesoMl,
          grosorPesoVidrio: articulo.grosorPesoVidrio,
          tamJunquilloGoma: articulo.tamJunquilloGoma,
          proveedorHabitual: articulo.proveedorHabitual,
          apareceEnHojaDespiece: articulo.apareceEnHojaDespiece,
          apareceEnHojaCorte: articulo.apareceEnHojaCorte,
          controlaStock: articulo.controlaStock,
        }}
      />

      <section className="mt-8 max-w-4xl">
        <h2 className="mb-3 text-sm font-semibold">
          Precios de venta ({precios.length}
          {precios.length === 60 ? '+, mostrando los primeros 60' : ''})
        </h2>

        {precios.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--al-text-muted)' }}>
            Este artículo no tiene precios asignados.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border"
            style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--al-surface-muted)' }}>
                  {['Acabado', 'Tarifa', 'Precio'].map((h, i) => (
                    <th key={h}
                      className="border-b px-4 py-2 font-medium"
                      style={{
                        borderColor: 'var(--al-border)',
                        color: 'var(--al-text-muted)',
                        textAlign: i === 2 ? 'right' : 'left',
                      }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {precios.map((p) => (
                  <tr key={`${p.acabado}-${p.tarifa}`} className="border-b"
                    style={{ borderColor: 'var(--al-border)' }}>
                    <td className="px-4 py-1.5">{p.acabado}</td>
                    <td className="cifra px-4 py-1.5" style={{ textAlign: 'left' }}>{p.tarifa}</td>
                    <td className="cifra px-4 py-1.5">{eur.format(Number(p.precio))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </Shell>
  )
}
