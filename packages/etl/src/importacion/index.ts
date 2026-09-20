import type { Sql } from 'postgres'
import { crearCargador } from './cargar.ts'
import { cargarCostes } from './costes.ts'
import { cargarEstructuras } from './estructuras.ts'
import { cargarGalce } from './galce.ts'
import { cargarMaestros } from './maestros.ts'
import { cargarMediciones } from './mediciones.ts'
import { cargarPvp } from './pvp.ts'
import type { Resultado } from './resultado.ts'
import { cargarSeries } from './series.ts'
import { vaciarDestino } from './vaciar.ts'

/** Orden de dependencias del importador histórico. El llamante posee la conexión. */
export async function importarCatalogo(sql: Sql, origen: string): Promise<Resultado[]> {
  const cargar = crearCargador(sql, origen)
  await vaciarDestino(sql)
  const resultados: Resultado[] = []
  resultados.push(...await cargarMaestros(cargar))
  resultados.push(...await cargarEstructuras(cargar))
  resultados.push(...await cargarSeries(sql, origen, cargar))
  resultados.push(...await cargarMediciones(sql, origen))
  resultados.push(...await cargarCostes(sql, cargar))
  resultados.push(...await cargarGalce(sql, origen))
  resultados.push(...await cargarPvp(cargar))
  return resultados
}
