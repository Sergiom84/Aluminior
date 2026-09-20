import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { esquemaLinea } from './esquema-linea.ts'
import { valorarArticulo } from '../articulos/valorar-articulo.ts'
import { valorarEstructura } from '../estructuras/index.ts'
import { guardarLinea, type OpcionHerrajeElegida, type PiezaDespiece,
  type RanuraAcristalamiento, type ValoresLinea } from './guardar-linea.ts'
import { altaCerramientoValorado } from '../cerramientos/alta-valorada.ts'

export type EntradaAltaLinea = z.infer<typeof esquemaLinea>
export type ResultadoAltaLinea = { ok: true; id: string; mensaje?: string } |
  { ok: false; errores: Record<string, string[]>; mensaje?: string }

export async function altaLinea(db: ReturnType<typeof crearDb>, d: EntradaAltaLinea,
  opcionesElegidas: string[] = [],
): Promise<ResultadoAltaLinea> {
  if (d.tipo === 'CERRAMIENTO') return altaCerramientoValorado(db, d)
    const [presupuesto] = await db.select()
      .from(schema.presupuestos)
      .where(eq(schema.presupuestos.id, d.presupuestoId)).limit(1)
    if (!presupuesto) return { ok: false, errores: {}, mensaje: 'Presupuesto no encontrado' }

    let descripcion = d.codigo
    let precioUnitario: number | null = null
    let aviso: string | null = null
    /** Medidas de la línea. El cerramiento las deriva de su composición. */
    let anchoLinea = d.anchoMm ?? null
    let altoLinea = d.altoMm ?? null

    /** Despiece resuelto a persistir en lineas_despiece (trazabilidad + coste). */
    let piezasAPersistir: PiezaDespiece[] = []
    let acristalamientoAPersistir: RanuraAcristalamiento[] = []
    let opcionesHerraje: OpcionHerrajeElegida[] = []
    if (d.tipo === 'ARTICULO') {
      const valoracion = await valorarArticulo(db, {
        codigo: d.codigo,
        tarifa: presupuesto.tarifa,
        acabadoCodigo: d.acabadoCodigo,
      })
      if (!valoracion.ok) {
        return { ok: false, errores: { codigo: [valoracion.error] } }
      }
      descripcion = valoracion.descripcion
      precioUnitario = valoracion.precioUnitario === null
        ? null
        : Number(valoracion.precioUnitario)
      aviso = valoracion.aviso
    } else {
      const resultado = await valorarEstructura(db, {
        codigo: d.codigo,
        serieCodigo: d.serieCodigo,
        anchoMm: d.anchoMm ?? null,
        altoMm: d.altoMm ?? null,
        vidrioCodigo: d.vidrioCodigo,
        varianteAcristalamiento: d.varianteAcristalamiento,
        opcionAcristalamiento: d.opcionAcristalamiento,
        acabadoCodigo: d.acabadoCodigo,
        tarifa: presupuesto.tarifa,
        opcionesHerraje: opcionesElegidas,
      })
      if (!resultado.ok) return { ok: false, errores: resultado.errores }
      descripcion = resultado.descripcion
      precioUnitario = resultado.precioUnitario
      aviso = resultado.aviso
      piezasAPersistir = resultado.piezas
      acristalamientoAPersistir = resultado.acristalamiento
      opcionesHerraje = resultado.opcionesHerraje
    }
    const total = precioUnitario === null
      ? null
      : Math.round(precioUnitario * d.cantidad * 100) / 100

    const valores: ValoresLinea = {
      id: d.solicitudId,
      presupuestoId: d.presupuestoId,
      articuloCodigo: d.tipo === 'ARTICULO' ? d.codigo : null,
      descripcion,
      referencia: d.referencia,
      cantidad: String(d.cantidad),
      anchoMm: anchoLinea,
      altoMm: altoLinea,
      precioUnitario: precioUnitario === null ? null : String(precioUnitario),
      total: total === null ? null : String(total),
      valoracionCompleta: precioUnitario !== null,
      avisoValoracion: aviso,
    }

    await guardarLinea(db, d.tipo === 'ESTRUCTURA'
        ? {
            tipo: 'ESTRUCTURA',
            valores,
            estructura: {
              serieCodigo: d.serieCodigo ?? '',
              estructuraCodigo: d.codigo,
              opcionAcristalamiento: d.opcionAcristalamiento,
              acabadoCodigo: d.acabadoCodigo,
              piezas: piezasAPersistir,
              acristalamiento: acristalamientoAPersistir,
              opcionesHerraje,
            },
          }
        : { tipo: 'ARTICULO', valores })

    return { ok: true, id: d.presupuestoId, mensaje: aviso ?? undefined }
}
