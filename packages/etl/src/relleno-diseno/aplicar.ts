import type { Sql, TransactionSql } from 'postgres'
import { COLUMNAS_DISENO_ESTRUCTURA, COLUMNAS_DISENO_NODO } from '../importacion/campos-diseno.ts'
import type { PlanRelleno } from './plan.ts'

/**
 * Relleno dirigido de los campos de dibujo (migración 0022) sobre un catálogo
 * ya cargado. A diferencia del importador completo, no vacía ni inserta: solo
 * actualiza esas columnas en filas que ya existen. Un nodo se actualiza solo si
 * su identidad (tipo y padre) coincide con el origen.
 *
 * Todo ocurre en una transacción. Sin `aplicar`, termina siempre en ROLLBACK.
 */
export class AbortoRelleno extends Error {}

export interface InformeRelleno {
  aplicado: boolean
  estructuras: {
    enOrigen: number; ausentesEnBase: number; enBaseSinOrigen: number
    sinCambios: number; aActualizar: number; actualizadas: number
  }
  nodos: {
    enOrigen: number; duplicadosEnOrigen: number; ausentesEnBase: number; enBaseSinOrigen: number
    identidadDistinta: number; sinCambios: number; aActualizar: number; actualizados: number
  }
}

const LOTE = 1000

class FinSimulacion extends Error {
  constructor(readonly informe: InformeRelleno) { super('simulación') }
}

async function comprobarColumnas(tx: TransactionSql) {
  const filas = await tx<{ tabla: string; columna: string }[]>`
    select table_name as tabla, column_name as columna from information_schema.columns
    where table_schema = 'public' and (
      (table_name = 'estructuras' and column_name in ${tx([...COLUMNAS_DISENO_ESTRUCTURA])}) or
      (table_name = 'estructura_diseno_nodos' and column_name in ${tx([...COLUMNAS_DISENO_NODO])}))`
  const esperadas = COLUMNAS_DISENO_ESTRUCTURA.length + COLUMNAS_DISENO_NODO.length
  if (filas.length !== esperadas) {
    throw new AbortoRelleno(`Faltan columnas de la migración 0022_catalogo_diseno (${filas.length}/${esperadas}). ` +
      'Aplicar primero las migraciones pendientes.')
  }
}

async function cargarTemporales(tx: TransactionSql, plan: PlanRelleno) {
  await tx`create temp table relleno_estructuras (
    codigo text primary key, dis_ancho_mm integer, dis_alto_mm integer) on commit drop`
  await tx`create temp table relleno_nodos (
    estructura_codigo text, id_item integer, tipo integer, contenido_en integer,
    tipo_hoja integer, numero_hoja integer, tipo_cota integer, cota numeric(12, 3),
    equidistantes integer, tipo_marco text, tipo_curva integer,
    primary key (estructura_codigo, id_item)) on commit drop`
  for (let i = 0; i < plan.estructuras.length; i += LOTE) {
    const lote = plan.estructuras.slice(i, i + LOTE) as unknown as Record<string, unknown>[]
    await tx`insert into relleno_estructuras ${tx(lote)} on conflict do nothing`
  }
  // Como el importador, ante claves repetidas en el origen gana la primera.
  for (let i = 0; i < plan.nodos.length; i += LOTE) {
    const lote = plan.nodos.slice(i, i + LOTE) as unknown as Record<string, unknown>[]
    await tx`insert into relleno_nodos ${tx(lote)} on conflict do nothing`
  }
}

async function medir(tx: TransactionSql, plan: PlanRelleno): Promise<InformeRelleno> {
  const [e] = await tx<{ en_origen: number; ausentes: number; sin_cambios: number; sin_origen: number }[]>`
    select count(*)::int as en_origen,
      count(*) filter (where e.codigo is null)::int as ausentes,
      count(*) filter (where e.codigo is not null and
        (e.dis_ancho_mm, e.dis_alto_mm) is not distinct from (r.dis_ancho_mm, r.dis_alto_mm))::int as sin_cambios,
      (select count(*)::int from estructuras x
        where not exists (select 1 from relleno_estructuras y where y.codigo = x.codigo)) as sin_origen
    from relleno_estructuras r left join estructuras e on e.codigo = r.codigo`
  const [n] = await tx<{
    en_origen: number; ausentes: number; identidad: number; sin_cambios: number; sin_origen: number
  }[]>`
    select count(*)::int as en_origen,
      count(*) filter (where n.estructura_codigo is null)::int as ausentes,
      count(*) filter (where n.estructura_codigo is not null and
        (n.tipo <> r.tipo or n.contenido_en is distinct from r.contenido_en))::int as identidad,
      count(*) filter (where n.estructura_codigo is not null and n.tipo = r.tipo and
        n.contenido_en is not distinct from r.contenido_en and
        (n.tipo_hoja, n.numero_hoja, n.tipo_cota, n.cota, n.equidistantes, n.tipo_marco, n.tipo_curva)
        is not distinct from
        (r.tipo_hoja, r.numero_hoja, r.tipo_cota, r.cota, r.equidistantes, r.tipo_marco, r.tipo_curva))::int as sin_cambios,
      (select count(*)::int from estructura_diseno_nodos x where not exists (select 1 from relleno_nodos y
        where y.estructura_codigo = x.estructura_codigo and y.id_item = x.id_item)) as sin_origen
    from relleno_nodos r left join estructura_diseno_nodos n
      on n.estructura_codigo = r.estructura_codigo and n.id_item = r.id_item`
  return {
    aplicado: false,
    estructuras: {
      enOrigen: e.en_origen, ausentesEnBase: e.ausentes, enBaseSinOrigen: e.sin_origen,
      sinCambios: e.sin_cambios, aActualizar: e.en_origen - e.ausentes - e.sin_cambios, actualizadas: 0,
    },
    nodos: {
      enOrigen: n.en_origen, duplicadosEnOrigen: plan.nodos.length - n.en_origen,
      ausentesEnBase: n.ausentes, enBaseSinOrigen: n.sin_origen, identidadDistinta: n.identidad,
      sinCambios: n.sin_cambios, aActualizar: n.en_origen - n.ausentes - n.identidad - n.sin_cambios,
      actualizados: 0,
    },
  }
}

async function actualizar(tx: TransactionSql, informe: InformeRelleno): Promise<InformeRelleno> {
  const estructuras = await tx`
    update estructuras e set dis_ancho_mm = r.dis_ancho_mm, dis_alto_mm = r.dis_alto_mm
    from relleno_estructuras r
    where e.codigo = r.codigo
      and (e.dis_ancho_mm, e.dis_alto_mm) is distinct from (r.dis_ancho_mm, r.dis_alto_mm)`
  const nodos = await tx`
    update estructura_diseno_nodos n set
      tipo_hoja = r.tipo_hoja, numero_hoja = r.numero_hoja, tipo_cota = r.tipo_cota, cota = r.cota,
      equidistantes = r.equidistantes, tipo_marco = r.tipo_marco, tipo_curva = r.tipo_curva
    from relleno_nodos r
    where n.estructura_codigo = r.estructura_codigo and n.id_item = r.id_item
      and n.tipo = r.tipo and n.contenido_en is not distinct from r.contenido_en
      and (n.tipo_hoja, n.numero_hoja, n.tipo_cota, n.cota, n.equidistantes, n.tipo_marco, n.tipo_curva)
        is distinct from
        (r.tipo_hoja, r.numero_hoja, r.tipo_cota, r.cota, r.equidistantes, r.tipo_marco, r.tipo_curva)`
  return {
    aplicado: true,
    estructuras: { ...informe.estructuras, actualizadas: estructuras.count },
    nodos: { ...informe.nodos, actualizados: nodos.count },
  }
}

export async function rellenarDiseno(
  sql: Sql,
  plan: PlanRelleno,
  { aplicar = false }: { aplicar?: boolean } = {},
): Promise<InformeRelleno> {
  try {
    return await sql.begin(async (tx) => {
      await comprobarColumnas(tx)
      await cargarTemporales(tx, plan)
      const informe = await medir(tx, plan)
      if (!aplicar) throw new FinSimulacion(informe)
      return actualizar(tx, informe)
    }) as InformeRelleno
  } catch (error) {
    if (error instanceof FinSimulacion) return error.informe
    throw error
  }
}
