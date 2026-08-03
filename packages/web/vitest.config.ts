import { defineConfig } from 'vitest/config'

/**
 * Pruebas de los módulos de servidor de la aplicación web y de los bloques de
 * interfaz que se pueden comprobar sin DOM. La verificación visual sigue siendo
 * la comparación de tarea con Productor descrita en PARIDAD-PRODUCTOR.md.
 */
export default defineConfig({
  // `jsx: preserve` del tsconfig lo resuelve Next; vitest necesita el suyo.
  esbuild: { jsx: 'automatic' },
  test: {
    include: ['app/**/*.test.ts', 'app/**/*.test.tsx'],
    exclude: ['**/node_modules/**', '.next/**'],
    // Las migraciones se aplican UNA vez, antes del primer worker: varias
    // suites migrando en paralelo se pisan el DDL. Ver `pruebas/migrar.ts`.
    globalSetup: ['./pruebas/migrar.ts'],
  },
})
