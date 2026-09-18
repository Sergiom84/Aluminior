import { notFound } from 'next/navigation'
import { Shell } from '../../_components/shell.tsx'
import { FichaArticulo } from '../_components/ficha/ficha-articulo.tsx'
import { cargarCatalogosFicha, cargarFichaArticulo } from '../_lib/ficha/consulta.ts'

export const dynamic = 'force-dynamic'

export default async function EditarArticulo({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params
  const [ficha, catalogos] = await Promise.all([
    cargarFichaArticulo(decodeURIComponent(codigo)),
    cargarCatalogosFicha(),
  ])
  if (!ficha) notFound()

  return (
    <Shell moduloActivo="articulos">
      <FichaArticulo key={ficha.articulo.codigo} articulo={ficha.articulo} pvp={ficha.pvp}
        costes={ficha.costes} catalogos={catalogos} anterior={ficha.anterior} siguiente={ficha.siguiente} />
    </Shell>
  )
}
