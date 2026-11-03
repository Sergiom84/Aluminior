import { notFound } from 'next/navigation'
import { asc } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { UNIONES_VISUALES } from '@aluminior/core/estructuras'
import { Shell } from '../../../_components/shell.tsx'
import { imagenesDisponibles, leerFichaUnion, precioPerfil } from '../../../../../lib/catalogo-uniones/leer.ts'
import { FichaUnion } from '../_components/ficha-union.tsx'

export const dynamic = 'force-dynamic'

/** `numeric` de Postgres llega como "60.000": se muestra como 60. */
const cifra = (valor: string | number | null | undefined, defecto: number | string = '') =>
  valor == null || valor === '' ? String(defecto) : String(Number(valor))

export default async function EditarUnion({ params }: { params: Promise<{ codigo: string }> }) {
  const codigo = decodeURIComponent((await params).codigo)
  const ficha = await leerFichaUnion(codigo)
  const visual = UNIONES_VISUALES.find(union => union.codigo === codigo)
  if (!ficha?.union && !visual) notFound()
  const db = crearDb()
  const series = await db.select({ codigo: schema.series.codigo }).from(schema.series).orderBy(asc(schema.series.codigo))
  const perfiles = ficha?.perfiles ?? []
  const precio = await precioPerfil(perfiles[0] ?? '')
  const imagenes = await imagenesDisponibles()
  // Sin imagen guardada, la del código solo si existe: no se guarda un nombre que no hay.
  const imagen = ficha?.union?.imagen ?? (imagenes.includes(`${codigo}.bmp`) ? `${codigo}.bmp` : '')
  return <Shell moduloActivo="articulos">
    <FichaUnion nuevo={false} valores={{
      codigo, descripcion: ficha?.descripcion ?? visual?.descripcion ?? codigo,
      cantidad: Math.max(1, Math.min(3, perfiles.length || 1)),
      perfiles, grosor: cifra(ficha?.union?.grosor ?? visual?.grosorMm),
      l1: cifra(ficha?.union?.l1 ?? visual?.l1Mm, 0), l2: cifra(ficha?.union?.l2 ?? visual?.l2Mm, 0),
      tipo: String(ficha?.union?.tipo ?? visual?.unionTipo ?? 0),
      manoObra: cifra(ficha?.union?.manoObraMinutos, 0),
      deUsuario: ficha?.union?.deUsuario ?? false, seriesEspecificas: ficha?.union?.seriesEspecificas ?? false,
      series: ficha?.series ?? [], imagen,
    }} recetaProtegida={ficha?.recetaProtegida ?? false} series={series.map(serie => serie.codigo)}
      imagenes={imagenes} precioInicial={precio} />
  </Shell>
}
