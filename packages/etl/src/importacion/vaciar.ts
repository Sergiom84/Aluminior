import type { Sql } from 'postgres'

/**
 * Vacía todas las tablas destino de una sola vez.
 *
 * Hace falta TRUNCATE ... CASCADE en un único enunciado: borrarlas de una en
 * una falla por las claves ajenas (articulos referencia familias), y el orden
 * inverso se rompe en cuanto el esquema crezca.
 */
export async function vaciarDestino(sql: Sql) {
  const tablas = [
    'lineas_despiece', 'lineas_acristalamiento', 'lineas_opciones_herraje',
    'lineas_estructura', 'lineas', 'presupuestos', 'obras',
    'clientes_potenciales', 'clientes', 'proveedores',
    'estructura_componentes', 'estructura_cotas', 'estructura_diseno_nodos',
    'vidrio_descuentos_alojamiento', 'vidrio_galce', 'vidrio_galce_fijo',
    'junquillo_ajustes', 'junquillo_ajustes_fijo', 'tacris_filas',
    'opciones_herraje', 'herraje_conjuntos',
    'conjunto_resoluciones', 'conjunto_delegaciones', 'conjuntos', 'series',
    'articulos_coste', 'articulos_pvp', 'articulos', 'estructuras',
    'subfamilias', 'tonalidades', 'acabados', 'familias',
  ]
  await sql`TRUNCATE TABLE ${sql(tablas)} RESTART IDENTITY CASCADE`
}
