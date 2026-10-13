import type { Sql } from 'postgres'

/** TEXT tipado evita depender de los serializadores JSON que Drizzle modifica en postgres-js. */
export function jsonbSerializado(sql: Sql, texto: string) {
  return sql`${sql.typed(texto, 25)}::jsonb`
}

export function serializarPoliticasSql(sql: Sql, filas: Record<string, unknown>[]) {
  return filas.map(f => typeof f.politicas_precio_tabla === 'string'
    ? { ...f, politicas_precio_tabla: jsonbSerializado(sql, f.politicas_precio_tabla) } : f)
}
