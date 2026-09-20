import type { Sql } from 'postgres'
import { rutaTabla } from '../csv.ts'
import { leerContextoGalce } from './contexto-galce.ts'
import { cargarGalceFijos } from './galce-fijos.ts'
import { cargarGalceHojas } from './galce-hojas.ts'
import type { Resultado } from './resultado.ts'

export async function cargarGalce(sql: Sql, ORIGEN: string): Promise<Resultado[]> {
  const resultados: Resultado[] = []
  /**
   * Descuento de galce del vidrio, MEDIDO del histórico (PLAN.md anexo L):
   *
   *   medida del vidrio = medida de corte de la hoja − delta(serie, perfil)
   *
   * Para cada línea real con emparejamiento inequívoco (un único corte HV, un
   * único HH y vidrios M2 de medida única), delta = corte − medida del vidrio.
   * Se emite la moda por (serie, perfil de hoja) sólo si hay ≥3 muestras y
   * ≥90% de consistencia. Sin fila, el vidrio queda "sin calcular": nunca se
   * adivina.
   */
  {
    const r: Resultado = {
      tabla: 'vidrio_galce', leidas: 0, insertadas: 0, descartadas: 0,
      excluidas: 0, motivos: new Map(),
    }
    const rutaVLin = rutaTabla(ORIGEN, 'VPresupuestosLin')
    const rutaDatos = rutaTabla(ORIGEN, 'VDatosLinEstr')
    if (rutaVLin && rutaDatos) {
      const contexto = await leerContextoGalce(ORIGEN)
      resultados.push(...await cargarGalceHojas(sql, contexto, r))
      resultados.push(...await cargarGalceFijos(sql, contexto))

    } else {
      r.motivos.set('CSV no encontrado', 1)
    }
    resultados.push(r)
  }
  return resultados
}
