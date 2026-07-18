/** @type {import('next').NextConfig} */
const nextConfig = {
  // @aluminior/db es TypeScript sin compilar dentro del monorepo.
  transpilePackages: ['@aluminior/db', '@aluminior/core'],
}

export default nextConfig
