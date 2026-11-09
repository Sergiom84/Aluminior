/**
 * El operador pone precio a piezas sin PVP de una línea de cerramiento.
 *
 * - `OBRA`: el precio se guarda en la configuración de la línea y solo vale ahí.
 * - `TARIFA`: se da de alta en `articulos_pvp` (tarifa del documento, marcado
 *   `de_usuario`) en la unidad del artículo; nunca sustituye un PVP existente.
 *
 * Después la línea se revalora con sus mismos datos, como si el operador la
 * hubiera reabierto y aceptado.
 */
import { and, eq, inArray } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import { CATALOGO_SNAPSHOT, esConfiguracionCerramiento, type UnionVisual } from '@aluminior/core/estructuras'
import { fusionarPreciosManuales, preciosManualesValidos, type PrecioManual } from '@aluminior/core/precios'
import { actualizarCerramiento, type ResultadoEdicionCerramiento } from '../cerramientos/editar-cerramiento.ts'
import type { ClienteEscritura } from '../cliente-db.ts'

export type DestinoPrecio = 'OBRA' | 'TARIFA'

export interface EntradaPreciosLinea {
  presupuestoId: string
  lineaId: string
  destino: DestinoPrecio
  precios: readonly PrecioManual[]
  catalogoUniones?: readonly UnionVisual[]
}

const fallo = (mensaje: string): ResultadoEdicionCerramiento => ({ ok: false, errores: {}, mensaje })

export async function aplicarPreciosLinea(db: ClienteEscritura, entrada: EntradaPreciosLinea): Promise<ResultadoEdicionCerramiento> {
  if (!entrada.precios.length || !preciosManualesValidos(entrada.precios)) return fallo('Precios no válidos')
  const [presupuesto] = await db.select({ tarifa: schema.presupuestos.tarifa }).from(schema.presupuestos)
    .where(eq(schema.presupuestos.id, entrada.presupuestoId)).limit(1)
  const [linea] = await db.select().from(schema.lineas).where(and(
    eq(schema.lineas.id, entrada.lineaId), eq(schema.lineas.presupuestoId, entrada.presupuestoId))).limit(1)
  const [cerramiento] = await db.select().from(schema.lineasCerramiento)
    .where(eq(schema.lineasCerramiento.lineaId, entrada.lineaId)).limit(1)
  if (!presupuesto || !linea || !cerramiento) return fallo('La línea no pertenece al presupuesto o no es un cerramiento')
  const configuracion = cerramiento.configuracion
  if (!esConfiguracionCerramiento(configuracion, CATALOGO_SNAPSHOT)) return fallo('La configuración guardada no es válida')
  const variante = cerramiento.varianteAcristalamiento
  if (variante !== '1' && variante !== '2') return fallo('La configuración guardada no es válida')

  const codigos = [...new Set(entrada.precios.map((p) => p.articulo.trim().toUpperCase()))]
  const articulos = await db.select({ codigo: schema.articulos.codigo, tipoMetraje: schema.articulos.tipoMetraje })
    .from(schema.articulos).where(inArray(schema.articulos.codigo, codigos))
  const unidad = new Map(articulos.map((a) => [a.codigo, a.tipoMetraje]))
  const ausente = codigos.find((c) => !unidad.has(c))
  if (ausente) return fallo(`El artículo ${ausente} no está en el catálogo`)

  let nueva = configuracion
  if (entrada.destino === 'TARIFA') {
    const distinta = entrada.precios.find((p) => unidad.get(p.articulo.trim().toUpperCase()) !== p.unidad)
    if (distinta) return fallo(`${distinta.articulo} se guarda en la tarifa por ${unidad.get(distinta.articulo.trim().toUpperCase())}`)
    await db.insert(schema.articulosPvp).values(entrada.precios.map((p) => ({
      articuloCodigo: p.articulo.trim().toUpperCase(), acabadoCodigo: p.acabado.trim().toUpperCase(),
      tarifa: presupuesto.tarifa, precio: p.precio.toFixed(4), deUsuario: true,
    }))).onConflictDoNothing()
  } else {
    nueva = { ...configuracion, preciosManuales: fusionarPreciosManuales(configuracion.preciosManuales, entrada.precios) }
  }

  const horas = await db.select({ concepto: schema.lineasManoObra.concepto, horas: schema.lineasManoObra.horas })
    .from(schema.lineasManoObra).where(eq(schema.lineasManoObra.lineaId, entrada.lineaId))
  return actualizarCerramiento(db, {
    presupuestoId: entrada.presupuestoId,
    lineaId: entrada.lineaId,
    configuracionSerializada: JSON.stringify(nueva),
    serieCodigo: cerramiento.serieCodigo,
    vidrioCodigo: cerramiento.vidrioCodigo,
    acabadoCodigo: cerramiento.acabadoCodigo,
    varianteAcristalamiento: variante,
    referencia: linea.referencia,
    cantidad: Number(linea.cantidad),
    horasFabricacion: horas.find((h) => h.concepto === 'FABRICACION_ADICIONAL')?.horas ?? '0',
    horasColocacion: horas.find((h) => h.concepto === 'COLOCACION')?.horas ?? '0',
    catalogoUniones: entrada.catalogoUniones,
  })
}
