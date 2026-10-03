/**
 * Carga dirigida del catálogo del motor de despiece (migración 0023_motor_catalogo).
 *
 * Solo sustituye las tablas del motor (0023 y 0026) con los cargadores suplementarios;
 * no vacía presupuestos, clientes ni el catálogo base. Todo va en una
 * transacción y simula por defecto: sin `aplicar` se revierte al terminar.
 */
import type { Sql } from 'postgres'
import { comprobarOrigenCortes, reemplazarCortesCatalogo } from '../importacion/cortes-catalogo.ts'
import { comprobarOrigenDespiece, reemplazarCatalogoDespiece } from '../importacion/catalogo-despiece.ts'
import type { Resultado } from '../importacion/resultado.ts'

export class AbortoMotor extends Error {}

export const TABLAS_MOTOR = [
  'estructura_referencias_corte', 'conjunto_descuentos_corte', 'estructura_plantilla_catalogo',
  'conjunto_asociaciones', 'grupos_asociacion', 'tipos_hoja_catalogo', 'mano_obra_conceptos',
  'articulos_incrementos_precio', 'articulos_despiece', 'conjunto_ranuras_vacias', 'conjunto_parametros_despiece',
  'estructura_parametros_despiece',
] as const

/** Tablas que la carga nunca debe tocar; se verifica cantidad y contenido. */
export const TABLAS_PROTEGIDAS = [
  'presupuestos', 'lineas', 'clientes', 'obras', 'estructuras', 'estructura_componentes',
  'articulos', 'articulos_pvp', 'series',
] as const

export interface InformeMotor {
  aplicado: boolean
  previas: Record<string, number>
  resultados: Resultado[]
  protegidas: Record<string, number>
}

class Simulacion extends Error {}

const contar = async (tx: Sql, tablas: readonly string[]) => Object.fromEntries(await Promise.all(tablas.map(
  async t => [t, (await tx`SELECT count(*)::int AS n FROM ${tx(t)}`)[0]!.n as number])))

const firmas = async (tx: Sql) => Object.fromEntries(await Promise.all(TABLAS_PROTEGIDAS.map(
  async t => [t, (await tx`SELECT md5(coalesce(string_agg(firma, '' ORDER BY firma), '')) AS firma
    FROM (SELECT md5(to_jsonb(fila)::text) AS firma FROM ${tx(t)} fila) contenido`)[0]!.firma as string])))

export async function cargarMotorCatalogo(sql: Sql, origen: string, { aplicar = false } = {}): Promise<InformeMotor> {
  comprobarOrigenCortes(origen)
  comprobarOrigenDespiece(origen)
  let informe: InformeMotor | null = null
  try {
    await sql.begin('isolation level repeatable read', async t => {
      const tx = t as unknown as Sql
      await tx`SET LOCAL search_path TO public`
      const ausentes: string[] = []
      for (const t of [...TABLAS_MOTOR, ...TABLAS_PROTEGIDAS]) {
        if ((await tx`SELECT to_regclass(${`public.${t}`}) IS NULL AS falta`)[0]!.falta) ausentes.push(t)
      }
      if (ausentes.length) throw new AbortoMotor(`Faltan tablas (¿migración 0023_motor_catalogo?): ${ausentes.join(', ')}`)
      const previas = await contar(tx, TABLAS_MOTOR)
      const antes = await contar(tx, TABLAS_PROTEGIDAS)
      const contenidoAntes = await firmas(tx)
      const resultados = [...await reemplazarCortesCatalogo(tx, origen), ...await reemplazarCatalogoDespiece(tx, origen)]
      const despues = await contar(tx, TABLAS_PROTEGIDAS)
      const contenidoDespues = await firmas(tx)
      const cambiadas = TABLAS_PROTEGIDAS.filter(t => antes[t] !== despues[t] || contenidoAntes[t] !== contenidoDespues[t])
      if (cambiadas.length) throw new AbortoMotor(`La carga alteró tablas protegidas: ${cambiadas.join(', ')}`)
      informe = { aplicado: aplicar, previas, resultados, protegidas: antes }
      if (!aplicar) throw new Simulacion()
    })
  } catch (error) {
    if (!(error instanceof Simulacion)) throw error
  }
  return informe!
}
