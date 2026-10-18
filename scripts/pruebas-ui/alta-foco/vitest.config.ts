import { defineConfig } from 'vitest/config'

// Suite pura explícita: no carga packages/web/vitest.config.ts ni su globalSetup SQL.
export default defineConfig({
  esbuild: { jsx: 'automatic' },
  test: { environment: 'node', include: [
    'packages/web/app/dashboard/presupuestos/nuevo/busqueda-clientes.test.ts',
    'packages/web/app/dashboard/presupuestos/**/teclado-presupuesto.test.ts',
    'packages/web/app/dashboard/presupuestos/**/foco-edicion.test.ts',
    'packages/web/app/dashboard/presupuestos/**/mensaje-error.test.tsx',
    'packages/web/app/dashboard/presupuestos/**/envio-formulario.test.ts',
    'packages/web/app/dashboard/presupuestos/**/disponibilidad-catalogos.test.tsx',
    'packages/web/app/dashboard/presupuestos/**/errores-seleccion.test.tsx',
  ] },
})
