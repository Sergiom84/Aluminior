/** API pública de cargadores existentes para un banco con destino local validado. */
export { crearCargador, type Cargar } from './importacion/cargar.ts'
export { cargarMaestros } from './importacion/maestros.ts'
export { cargarEstructuras } from './importacion/estructuras.ts'
export { cargarSeries } from './importacion/series.ts'
export { cargarCostes } from './importacion/costes.ts'
export { cargarPvp } from './importacion/pvp.ts'
export { cargarMotorCatalogo, TABLAS_MOTOR } from './motor-catalogo/aplicar.ts'
export type { Resultado } from './importacion/resultado.ts'
