/**
 * Acceso exclusivo para recorridos QA contra la base efímera local.
 *
 * Requiere simultáneamente entorno de desarrollo, opt-in explícito y host
 * loopback. El flag no puede abrir una build de producción ni una URL remota.
 */
export function qaLocalActiva({
  entorno = process.env.NODE_ENV,
  flag = process.env.ALUMINIOR_QA_AUTH_BYPASS,
  host,
}: {
  entorno?: string
  flag?: string
  host?: string | null
}): boolean {
  if (entorno !== 'development' || flag !== '1' || !host) return false

  const normalizado = host.trim().toLowerCase()
  return normalizado === 'localhost'
    || normalizado.startsWith('localhost:')
    || normalizado === '127.0.0.1'
    || normalizado.startsWith('127.0.0.1:')
    || normalizado === '[::1]'
    || normalizado.startsWith('[::1]:')
}

export const USUARIO_QA_LOCAL = 'qa-local@aluminior.test'
