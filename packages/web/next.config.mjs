/** @type {import('next').NextConfig} */
const nextConfig = {
  // @aluminior/db es TypeScript sin compilar dentro del monorepo.
  transpilePackages: ['@aluminior/db'],
}

export default nextConfig
