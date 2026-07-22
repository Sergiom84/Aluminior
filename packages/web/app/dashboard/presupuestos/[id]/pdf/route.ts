/**
 * Route handler: PDF de un presupuesto.
 *
 *   GET /dashboard/presupuestos/[id]/pdf  ->  application/pdf
 *
 * Corre en servidor (runtime Node, NO Edge: @react-pdf/renderer usa APIs de
 * Node). Detrás del gate de auth (T.61), como el resto de /dashboard. Lee el
 * presupuesto ya valorado (misma vía que la web) y lo renderiza a PDF. La regla
 * del dinero (regla 3) vive en los datos: `cargarPresupuestoPdf` consume el
 * veredicto persistido de la guarda y `presupuestoIncompleto` (core).
 */
import { renderToBuffer } from '@react-pdf/renderer'
import { crearDb } from '@aluminior/db'
import { cargarPresupuestoPdf } from './datos.ts'
import { documentoPresupuesto } from './documento.tsx'

// @react-pdf/renderer no es compatible con el runtime Edge.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const db = crearDb()

  const datos = await cargarPresupuestoPdf(db, id)
  if (!datos) {
    return new Response('Presupuesto no encontrado', { status: 404 })
  }

  const buffer = await renderToBuffer(documentoPresupuesto(datos))
  const ref = datos.revision > 0 ? `-${datos.revision}` : ''
  const nombre = `presupuesto-${datos.numero}${ref}.pdf`

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${nombre}"`,
      'Cache-Control': 'no-store',
    },
  })
}
