import { asc } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { Shell } from '../../../_components/shell.tsx'
import { imagenesDisponibles } from '../../../../../lib/catalogo-uniones/leer.ts'
import { FichaUnion } from '../_components/ficha-union.tsx'

export const dynamic = 'force-dynamic'

export default async function NuevaUnion() {
  const db = crearDb()
  const series = await db.select({ codigo: schema.series.codigo }).from(schema.series).orderBy(asc(schema.series.codigo))
  return <Shell moduloActivo="articulos">
    <FichaUnion nuevo valores={{
      codigo: '', descripcion: '', cantidad: 1, perfiles: [], grosor: '', l1: '0', l2: '0',
      tipo: '0', manoObra: '0', deUsuario: true, seriesEspecificas: false, series: [], imagen: '',
    }} series={series.map(serie => serie.codigo)} imagenes={await imagenesDisponibles()} precioInicial={null} />
  </Shell>
}
