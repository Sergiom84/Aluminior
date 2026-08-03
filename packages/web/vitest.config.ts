import { defineConfig } from 'vitest/config'

/**
 * Pruebas de los módulos de servidor de la aplicación web: casos de uso y
 * persistencia. Los componentes de interfaz no entran aquí; su verificación es
 * la comparación de tarea con Productor descrita en PARIDAD-PRODUCTOR.md.
 */
export default defineConfig({
  test: {
    include: ['app/**/*.test.ts'],
    exclude: ['**/node_modules/**', '.next/**'],
  },
})
