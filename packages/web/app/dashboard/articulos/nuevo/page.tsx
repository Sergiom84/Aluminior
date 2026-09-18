import { Shell } from '../../_components/shell.tsx'
import { FichaArticulo } from '../_components/ficha/ficha-articulo.tsx'
import { cargarCatalogosFicha } from '../_lib/ficha/consulta.ts'

export const dynamic = 'force-dynamic'

export default async function NuevoArticulo() {
  const catalogos = await cargarCatalogosFicha()

  return (
    <Shell moduloActivo="articulos">
      <FichaArticulo articulo={null} catalogos={catalogos} />
    </Shell>
  )
}
