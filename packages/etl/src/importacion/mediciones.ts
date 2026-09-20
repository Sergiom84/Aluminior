import type { Sql } from 'postgres'
import { medirHerrajeConjuntos } from '../medir-herrajes.ts'
import { medirDescuentosAlojamiento } from '../medir-mixtas.ts'
import { medirRebajeHoja } from '../medir-rebaje-hoja.ts'
import { type Resultado } from './resultado.ts'

export async function cargarMediciones(sql: Sql, ORIGEN: string): Promise<Resultado[]> {
  const resultados: Resultado[] = []
  /**
   * Juego de conjuntos de herraje por (serie, estructura), medido del
   * histórico. Ver medir-herrajes.ts.
   */
  {
    const medida = await medirHerrajeConjuntos(ORIGEN)
    const r: Resultado = {
      tabla: 'herraje_conjuntos',
      leidas: medida.reglas.length,
      insertadas: 0,
      descartadas: 0,
      excluidas: 0,
      motivos: new Map([
        [`medición: ${medida.reglas.length}/${medida.combinaciones} combinaciones estables ` +
          `sobre ${medida.lineas} líneas históricas`, 1],
      ]),
    }
    if (medida.reglas.length) {
      await sql`INSERT INTO herraje_conjuntos ${sql(medida.reglas)} ON CONFLICT DO NOTHING`
      r.insertadas = medida.reglas.length
    }
    resultados.push(r)
  }

  {
    const medida = await medirDescuentosAlojamiento(ORIGEN)
    const r: Resultado = {
      tabla: 'vidrio_descuentos_alojamiento',
      leidas: medida.reglas.length,
      insertadas: 0,
      descartadas: 0,
      excluidas: 0,
      motivos: new Map([
        [`mediciÃ³n: ${medida.observacionesCubiertas}/${medida.observaciones} dimensiones; ` +
          `${medida.casosExactos}/${medida.casos} casos mixtos completos`, 1],
      ]),
    }
    if (medida.reglas.length) {
      await sql`INSERT INTO vidrio_descuentos_alojamiento ${sql(medida.reglas)} ON CONFLICT DO NOTHING`
      r.insertadas = medida.reglas.length
    }
    resultados.push(r)
  }

  /**
   * Rebaje de las piezas de perfil de hoja (anexos T.9-T.13).
   *
   * Umbral del 99%, decidido con el titular: menos cobertura a cambio de menos
   * piezas mal cortadas. Las reglas con `muestras < total_muestras` no son
   * exactas; la valoración DEBE avisar cuando use una.
   */
  {
    const medida = await medirRebajeHoja(ORIGEN)
    const conAviso = medida.reglas.length - medida.gruposExactos
    const r: Resultado = {
      tabla: 'hoja_rebajes',
      leidas: medida.reglas.length,
      insertadas: 0,
      descartadas: 0,
      excluidas: 0,
      motivos: new Map([
        [`medición (umbral 99%): ${medida.observacionesCubiertas}/${medida.observaciones} piezas de hoja cubiertas; ` +
          `${medida.gruposExactos} reglas exactas y ${conAviso} con aviso; ` +
          `${medida.gruposEntreUmbrales} grupos válidos al 90% pero no al 99% (revisables a mano)`, 1],
      ]),
    }
    if (medida.reglas.length) {
      await sql`INSERT INTO hoja_rebajes ${sql(medida.reglas)} ON CONFLICT DO NOTHING`
      r.insertadas = medida.reglas.length
    }
    resultados.push(r)
  }
  return resultados
}
