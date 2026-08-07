import { defineConfig } from 'vitest/config'

/**
 * Pruebas del esquema y las migraciones, contra el Postgres efímero.
 *
 * `fileParallelism: false` es EXCLUSIVO de este paquete (T.71.3):
 * `comercial.integracion.test.ts` quita y recrea `presupuestos_identidad_uq`
 * dentro de una de sus pruebas para demostrar el preflight de la migración
 * 0019, y otro fichero de este paquete escribiendo a la vez sobre la misma
 * base vería la restricción desaparecer a mitad de su propia prueba. No se
 * generaliza a Core, ETL o Web: ninguno de ellos muta esquema compartido.
 */
export default defineConfig({
  test: {
    globalSetup: ['./pruebas/migrar.ts'],
    fileParallelism: false,
  },
})
