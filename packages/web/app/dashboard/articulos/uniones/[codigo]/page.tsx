import { notFound } from 'next/navigation'
import { asc } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { UNIONES_VISUALES } from '@aluminior/core/estructuras'
import { Shell } from '../../../_components/shell.tsx'
import { imagenesDisponibles, leerFichaUnion, precioPerfil } from '../../../../../lib/catalogo-uniones/leer.ts'
import { FichaUnion } from '../_components/ficha-union.tsx'

export const dynamic = 'force-dynamic'

export default async function EditarUnion({ params }: { params: Promise<{ codigo: string }> }) {
  const codigo = decodeURIComponent((await params).codigo)
  const ficha = await leerFichaUnion(codigo)
  const visual = UNIONES_VISUALES.find(union => union.codigo === codigo)
  if (!ficha && !visual) notFound()
  const db = crearDb()
  const series = await db.select({ codigo: schema.series.codigo }).from(schema.series).orderBy(asc(schema.series.codigo))
  const perfiles = ficha?.perfiles ?? []
  const precio = await precioPerfil(perfiles[0] ?? '')
  return <Shell moduloActivo="articulos">
    <FichaUnion nuevo={false} valores={{
      codigo, descripcion: ficha?.descripcion ?? visual?.descripcion ?? codigo,
      cantidad: Math.max(1, Math.min(3, perfiles.length || 1)),
      perfiles, grosor: String(ficha?.union.grosor ?? visual?.grosorMm ?? ''),
      l1: String(ficha?.union.l1 ?? visual?.l1Mm ?? 0), l2: String(ficha?.union.l2 ?? visual?.l2Mm ?? 0),
      tipo: String(ficha?.union.tipo ?? visual?.unionTipo ?? 0),
      manoObra: String(ficha?.union.manoObraMinutos ?? 0),
      deUsuario: ficha?.union.deUsuario ?? true, seriesEspecificas: ficha?.union.seriesEspecificas ?? false,
      series: ficha?.series ?? [], imagen: ficha?.union.imagen ?? `${codigo}.bmp`,
    }} series={series.map(serie => serie.codigo)} imagenes={await imagenesDisponibles()} precioInicial={precio} />
  </Shell>
}
