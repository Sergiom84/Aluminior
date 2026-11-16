import { and, or, sql, type SQL, type SQLWrapper } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import { condicionFecha, condicionImporte } from '../busqueda-listado.ts'
import type { PlanBusqueda } from './plan.ts'

/**
 * Condición SQL de un plan de búsqueda. Todo valor del usuario viaja como
 * parámetro; nunca se concatena en el texto de la consulta.
 *
 * El llamador debe hacer left join de `clientes` (por `cliente_codigo`) y de
 * `clientes_potenciales` (por `potencial_codigo`), como hace el listado.
 */

const CON_ACENTO = 'áàéèíìóòúùüñçÁÀÉÈÍÌÓÒÚÙÜÑÇ'
const SIN_ACENTO = 'aaeeiioouuuncaaeeiioouuunc'

function plano(columna: SQLWrapper | SQL): SQL {
  return sql`translate(lower(coalesce(${columna}, '')), ${CON_ACENTO}, ${SIN_ACENTO})`
}

/** Todos los fragmentos dentro del mismo campo, en cualquier orden. */
function todosEn(columna: SQL, fragmentos: string[]): SQL {
  return and(...fragmentos.map((fragmento) => sql<boolean>`${columna} LIKE ${`%${fragmento}%`}`))!
}

/** Las abreviaturas de vía se comparan como la palabra completa. */
function calleNormalizada(): SQL {
  return sql`replace(replace(replace(replace(replace(replace(replace(
    ${plano(schema.clientes.direccion)},
    'avda.', 'avenida '), 'avda', 'avenida '),
    'ctra.', 'carretera '), 'ctra', 'carretera '),
    'pza.', 'plaza '), 'pza', 'plaza '),
    'c/', 'calle ')`
}

function soloCifras(columna: SQLWrapper): SQL {
  return sql`regexp_replace(coalesce(${columna}, ''), '[^0-9]', '', 'g')`
}

export function filtroPorPlan(plan: PlanBusqueda): SQL {
  if ('error' in plan) return sql`false`
  const p = schema.presupuestos

  switch (plan.tipo) {
    case 'nombre':
      return or(
        todosEn(plano(schema.clientes.nombre), plan.fragmentos),
        todosEn(plano(schema.clientes.nombreComercial), plan.fragmentos),
        todosEn(plano(p.nombreLibre), plan.fragmentos),
        todosEn(plano(schema.clientesPotenciales.nombre), plan.fragmentos),
      )!
    case 'codigo':
      return or(
        sql`CAST(${p.numero} AS TEXT) LIKE ${`${plan.texto}%`}`,
        sql`${p.clienteCodigo} ILIKE ${`${plan.texto}%`}`,
        sql`${p.potencialCodigo} ILIKE ${`${plan.texto}%`}`,
        sql`${p.referenciaInterna} ILIKE ${`%${plan.texto}%`}`,
      )!
    case 'calle':
      return todosEn(calleNormalizada(), plan.fragmentos)
    case 'telefono':
      return or(
        ...[schema.clientes.telefono, schema.clientes.telefonoMovil, schema.clientesPotenciales.telefono]
          .map((columna) => sql<boolean>`${soloCifras(columna)} LIKE ${`%${plan.digitos}%`}`),
      )!
    case 'obra':
      return or(
        todosEn(plano(p.obraTexto), plan.fragmentos),
        sql`EXISTS (
          SELECT 1 FROM ${schema.obras}
          WHERE ${schema.obras.id} = ${p.obraId}
            AND ${todosEn(plano(schema.obras.descripcion), plan.fragmentos)}
        )`,
      )!
    case 'fecha':
      return condicionFecha(plan.fecha)!
    case 'precio':
      return condicionImporte(plan.importe)!
  }
}
