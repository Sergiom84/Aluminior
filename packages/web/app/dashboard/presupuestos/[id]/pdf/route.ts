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
import { DatosPdfIncoherentes } from './cerramiento-pdf'
import { nombreArchivoPresupuestoPdf } from './identidad'
import { asegurarCatalogoDiseno } from '../../_lib/catalogo-diseno/index.ts'

// @react-pdf/renderer no es compatible con el runtime Edge.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  if (!UUID.test(id)) {
    return new Response('Presupuesto no encontrado', {
      status: 404, headers: { 'Cache-Control': 'no-store' },
    })
  }
  const db = crearDb()
  await asegurarCatalogoDiseno(db)

  let datos
  try {
    datos = await cargarPresupuestoPdf(db, id)
  } catch (error) {
    if (error instanceof DatosPdfIncoherentes) {
      return new Response('No se puede emitir el PDF: los datos del cerramiento son incoherentes.', {
        status: 409, headers: { 'Cache-Control': 'no-store' },
      })
    }
    throw error
  }
  if (!datos) {
    return new Response('Presupuesto no encontrado', { status: 404 })
  }

  const buffer = await renderToBuffer(documentoPresupuesto(datos))
  const nombre = nombreArchivoPresupuestoPdf(datos.serie, datos.numero, datos.revision)

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${nombre}"`,
      'Cache-Control': 'no-store',
    },
  })
}
