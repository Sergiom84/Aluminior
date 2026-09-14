import { escribirSatelites } from './escribir-satelites.ts'
/**
 * Escritura de la copia. Capa delgada: ejecuta el plan, no lo discute.
 *
 * El documento origen no se toca en ningún punto de este fichero: sólo se
 * insertan filas nuevas. Ambas revisiones conviven porque `presupuestos`
 * indexa (numero, revision) y la copia escribe una fila propia.
 */

import { schema } from '@aluminior/db'
import { descripcionCerramiento } from '@aluminior/core/estructuras'
import type { ClienteEscritura } from '../cliente-db.ts'
import { validarConfiguracionCerramiento } from '../cerramientos/validacion.ts'
import { actualizarTotales } from '../totales.ts'
import type { NumeracionDocumento } from './destino-documento.ts'
import type { LineaConSatelites } from './leer-origen.ts'
import type { CambioLinea, PlanCopia } from './plan-copia.ts'

export interface DatosCabeceraCopia {
  readonly destino: NumeracionDocumento
  readonly fecha: string
  readonly creadoPor: string | null
}

export interface ResultadoEscritura {
  readonly presupuestoId: string
  readonly lineasCopiadas: number
  readonly avisos: readonly string[]
}

/** Cabecera nueva: la del origen con numeración, fecha y autoría propias. */
function valoresCabecera(
  origen: typeof schema.presupuestos.$inferSelect,
  datos: DatosCabeceraCopia,
): typeof schema.presupuestos.$inferInsert {
  const { id: _id, creadoEn: _creadoEn, ...resto } = origen
  return {
    ...resto,
    numero: datos.destino.numero,
    revision: datos.destino.revision,
    serie: datos.destino.serie,
    fecha: datos.fecha,
    estado: 'PENDIENTE',
    creadoPor: datos.creadoPor,
    // Los importes los recalcula `actualizarTotales` al final, desde las
    // líneas realmente escritas.
    subtotal: '0',
    baseImponible: '0',
    cuotaIva: '0',
    total: '0',
  }
}

/**
 * Descripción de la línea copiada.
 *
 * Sólo se regenera lo que este módulo sabe generar: la del CERRAMIENTO, a
 * partir de su configuración. Para ARTICULO y ESTRUCTURA la descripción viene
 * del catálogo y no depende de los códigos sustituidos, así que se conserva y
 * se dice por qué.
 */
function descripcionCopiada(
  entrada: LineaConSatelites,
  cambio: CambioLinea,
  avisos: string[],
): string {
  if (!cambio.regenerarDescripcion) return entrada.linea.descripcion
  if (!entrada.cerramiento) {
    avisos.push(`Línea ${entrada.linea.orden}: descripción de catálogo, se conserva`)
    return entrada.linea.descripcion
  }
  const validacion = validarConfiguracionCerramiento(JSON.stringify(entrada.cerramiento.configuracion))
  if (!validacion.ok) {
    avisos.push(`Línea ${entrada.linea.orden}: ${validacion.mensaje}; se conserva la descripción`)
    return entrada.linea.descripcion
  }
  return descripcionCerramiento(validacion.configuracion)
}

function valoresLinea(
  entrada: LineaConSatelites,
  cambio: CambioLinea,
  presupuestoId: string,
  avisos: string[],
): typeof schema.lineas.$inferInsert {
  const { id: _id, ...resto } = entrada.linea
  if (cambio.conservarPrecio) {
    return {
      ...resto,
      presupuestoId,
      descripcion: descripcionCopiada(entrada, cambio, avisos),
    }
  }
  // Regla del dinero: la valoración guardada es la del código anterior. No se
  // arrastra como si fuera buena, ni se pone a cero.
  return {
    ...resto,
    presupuestoId,
    descripcion: descripcionCopiada(entrada, cambio, avisos),
    precioUnitario: null,
    total: null,
    valoracionCompleta: false,
    avisoValoracion: `Importe incompleto: ${cambio.motivos.join('; ')}.`,
  }
}

/**
 * Escribe el documento destino completo dentro de la transacción recibida.
 *
 * Cabecera, líneas y satélites confirman juntos: una copia a medias es un
 * documento corrupto, no uno incompleto.
 */
export async function escribirCopia(
  cliente: ClienteEscritura,
  entrada: {
    origen: typeof schema.presupuestos.$inferSelect
    lineas: readonly LineaConSatelites[]
    plan: PlanCopia
    cabecera: DatosCabeceraCopia
  },
): Promise<ResultadoEscritura> {
  const avisos: string[] = [...entrada.plan.avisos]
  const [cabecera] = await cliente.insert(schema.presupuestos)
    .values(valoresCabecera(entrada.origen, entrada.cabecera))
    .returning({ id: schema.presupuestos.id })

  const cambios = new Map(entrada.plan.lineas.map((cambio) => [cambio.lineaId, cambio]))
  let copiadas = 0
  for (const linea of entrada.lineas) {
    const cambio = cambios.get(linea.linea.id)
    if (!cambio) continue
    const [nueva] = await cliente.insert(schema.lineas)
      .values(valoresLinea(linea, cambio, cabecera.id, avisos))
      .returning({ id: schema.lineas.id })
    await escribirSatelites(cliente, linea, cambio, nueva.id)
    copiadas += 1
  }

  await actualizarTotales(cliente, cabecera.id)
  return { presupuestoId: cabecera.id, lineasCopiadas: copiadas, avisos }
}
