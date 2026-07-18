import { defineConfig } from 'drizzle-kit'
import { readFileSync } from 'node:fs'

// Drizzle se ejecuta fuera de Next.js y no carga .env automáticamente.
// Leemos sólo pares NOMBRE=valor, sin imprimir nunca las credenciales.
for (const linea of readFileSync(new URL('../../.env', import.meta.url), 'utf8').split('\n')) {
  const m = linea.match(/^\s*([A-Z_]+)=(.*)$/)
  if (m) process.env[m[1]] ??= m[2].trim()
}

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgres://localhost:5432/aluminior',
  },
  verbose: true,
  strict: true,
})
