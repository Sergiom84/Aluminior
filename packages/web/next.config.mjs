import { readFileSync } from 'node:fs'

// Las variables de entorno viven en el `.env` de la RAÍZ del monorepo (una sola
// fuente para app, ETL y Drizzle). Next sólo autocarga el `.env` del paquete,
// así que las cargamos a mano aquí, igual que hace `packages/db/drizzle.config.ts`.
// Idempotente (`??=`): en Render, donde las variables ya están en el entorno,
// no las pisa; y si no hay `.env` (build en Render) el try lo ignora.
try {
  const raw = readFileSync(new URL('../../.env', import.meta.url), 'utf8')
  for (const linea of raw.split('\n')) {
    const m = linea.match(/^\s*([A-Z0-9_]+)=(.*)$/)
    if (m) process.env[m[1]] ??= m[2].trim()
  }
} catch {
  // Sin `.env` local: se usan las variables del entorno (Render).
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // @aluminior/db es TypeScript sin compilar dentro del monorepo.
  transpilePackages: ['@aluminior/db', '@aluminior/core'],

  // Inyecta las claves de auth en TODOS los runtimes (incluido el Edge del
  // middleware). Sin esto, el middleware no veria `SUPABASE_URL`/`ANON_KEY` en
  // desarrollo local. La `anon` es publica por diseno; NUNCA se expone aqui la
  // `service_role`. Solo se referencian en codigo de servidor/edge, asi que no
  // acaban en el bundle del navegador.
  env: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  },
}

export default nextConfig
