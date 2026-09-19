/** La URL se valida antes de abrir una conexión. No imprime credenciales. */
export function validarDestinoEditor(url: string, efimera?: string): 'supabase' | 'efimera' {
  let destino: URL
  try { destino = new URL(url) } catch { throw new Error('URL de destino inválida') }
  if (!['postgres:', 'postgresql:'].includes(destino.protocol)) throw new Error('Destino no PostgreSQL')
  if (efimera && url === efimera && ['localhost', '127.0.0.1', '[::1]'].includes(destino.hostname)) return 'efimera'
  if (/^db\.[a-z0-9-]+\.supabase\.co$/.test(destino.hostname)
    || /^[a-z0-9-]+\.pooler\.supabase\.com$/.test(destino.hostname)) return 'supabase'
  throw new Error('Destino no permitido: Supabase o PostgreSQL efímero local declarado')
}
