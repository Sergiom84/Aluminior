import { sql } from 'drizzle-orm'
import { ErrorOperacionCerramiento } from './error-operativo.ts'
import type { ClienteEscritura } from '../cliente-db.ts'
import { prepararManoObra } from '../mano-obra/index.ts'
import type { AltaCerramiento } from './alta-cerramiento.ts'
import { valorarCerramiento } from './valorar-cerramiento.ts'
import { importesLineaCerramiento } from './importes-linea.ts'

export async function prepararLineaValorada(tx: ClienteEscritura, alta: AltaCerramiento,
  entrada: { tarifa: number; cantidad: number; horasFabricacion: string; horasColocacion: string },
) {
  const tablas = await tx.execute<{ tabla: string | null }>(sql`SELECT to_regclass('public.lineas_cerramiento_resultados')::text AS tabla`)
  if (!tablas[0]?.tabla) throw new ErrorOperacionCerramiento('Falta aplicar la migración de resultados de cerramientos en este entorno')
  const resultado = await valorarCerramiento(tx, { configuracion: alta.configuracion,
    ...alta.datos, tarifa: entrada.tarifa })
  const manoObra = await prepararManoObra(tx, { tarifa: entrada.tarifa,
    horas: { fabricacion: entrada.horasFabricacion, colocacion: entrada.horasColocacion } })
  if (manoObra.estado === 'MIGRACION_PENDIENTE') throw new ErrorOperacionCerramiento(manoObra.mensaje)
  const notas = resultado.origenes.flatMap(o => o.diagnosticos.map(d =>
    `${o.origen.tipo} ${o.origen.id}: ${d.detalle}`))
  if (manoObra.estado === 'PREPARADA') notas.push(...manoObra.notas)
  return { resultado, manoObra: manoObra.estado === 'PREPARADA' ? manoObra.filas : [],
    importes: importesLineaCerramiento(resultado, String(entrada.cantidad), manoObra),
    aviso: notas.length ? [...new Set(notas)].join('; ') : null }
}
