import { sql } from 'drizzle-orm'
import { ErrorOperacionCerramiento } from './error-operativo.ts'
import type { ClienteEscritura } from '../cliente-db.ts'
import { prepararManoObra } from '../mano-obra/index.ts'
import type { AltaCerramiento } from './alta-cerramiento.ts'
import { valorarCerramiento } from './valorar-cerramiento.ts'
import { importesLineaCerramiento } from './importes-linea.ts'
import { comisionDeLineas } from '../gastos/index.ts'
import { configuracionTieneFiExplicito } from '@aluminior/core/estructuras'
import { avisoVisibleLinea } from './aviso-linea.ts'
import { catalogoDespieceCargado } from '../estructuras/catalogo-despiece/cargado.ts'

export const AVISO_FI_SIN_VALORAR =
  'Configuración guardada sin valorar: la cota FI de 1OFI aún no dispone de despiece ni cálculo económico verificados.'

export async function prepararLineaValorada(tx: ClienteEscritura, alta: AltaCerramiento,
  entrada: {
    presupuestoId: string; tarifa: number; cantidad: number
    horasFabricacion: string; horasColocacion: string; precioHoraColocacion?: string | null
  },
) {
  if (configuracionTieneFiExplicito(alta.configuracion) && !(await catalogoDespieceCargado(tx))) {
    return {
      estado: 'FI_PENDIENTE' as const,
      manoObra: [],
      importes: { precioUnitario: null, total: null, valoracionCompleta: false },
      aviso: AVISO_FI_SIN_VALORAR,
    }
  }
  const tablas = await tx.execute<{ tabla: string | null }>(sql`SELECT to_regclass('public.lineas_cerramiento_resultados')::text AS tabla`)
  if (!tablas[0]?.tabla) throw new ErrorOperacionCerramiento('Falta aplicar la migración de resultados de cerramientos en este entorno')
  const esEstructuraSimple = alta.configuracion.modulos.length === 1 && !alta.configuracion.modulos[0]?.compacto
  const acabadoAccesoriosCodigo = alta.datos.acabadoAccesoriosCodigo ??
    (esEstructuraSimple && alta.datos.acabadoCodigo === 'L' ? 'L' : 'UNI')
  const resultado = await valorarCerramiento(tx, { configuracion: alta.configuracion,
    // Sin selección explícita de herraje (p. ej. sin reglas herrajeConjuntos),
    // la ausencia de selección conserva SelecDefSN; no significa desmarcar todo.
    ...alta.datos, acabadoAccesoriosCodigo, tarifa: entrada.tarifa, opcionesPorDefecto: !alta.datos.opcionesHerraje?.length })
  const manoObra = await prepararManoObra(tx, {
    tarifa: entrada.tarifa,
    horas: { fabricacion: entrada.horasFabricacion, colocacion: entrada.horasColocacion },
    ...(entrada.precioHoraColocacion ? { precioHoraColocacion: entrada.precioHoraColocacion } : {}),
  })
  if (manoObra.estado === 'MIGRACION_PENDIENTE') throw new ErrorOperacionCerramiento(manoObra.mensaje)
  return { estado: 'VALORADA' as const, resultado,
    manoObra: manoObra.estado === 'PREPARADA' ? manoObra.filas : [],
    importes: importesLineaCerramiento(resultado, String(entrada.cantidad), manoObra,
      await comisionDeLineas(tx, entrada.presupuestoId)),
    aviso: avisoVisibleLinea(resultado.origenes, manoObra.estado === 'PREPARADA' ? manoObra.notas : []) }
}
