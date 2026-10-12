import { urlDePruebasValidada } from '@aluminior/db/pruebas'

export function destinoPrecioTabla(opciones: { remoto?: boolean; url?: string }) {
  if (opciones.remoto && !opciones.url) throw new Error('El modo remoto exige --url explícita')
  const valor = opciones.url ?? urlDePruebasValidada()
  let destino: URL
  try { destino = new URL(valor) } catch { throw new Error('URL de conexión no válida') }
  if (!['postgres:', 'postgresql:'].includes(destino.protocol) || !destino.hostname ||
    destino.pathname.length <= 1 || destino.search || destino.hash) throw new Error('Destino PostgreSQL no válido')
  const esLocal = ['localhost', '127.0.0.1', '::1', '[::1]'].includes(destino.hostname)
  if (opciones.remoto && esLocal) throw new Error('Para PostgreSQL local utiliza el modo de pruebas')
  if (!opciones.remoto) urlDePruebasValidada(valor)
  return {
    url: valor, ssl: opciones.remoto ? 'require' as const : false as const,
    resumen: { tipo: opciones.remoto ? 'remoto' : 'pruebas locales', host: destino.hostname,
      puerto: destino.port || '5432', base: destino.pathname.slice(1) },
  }
}
