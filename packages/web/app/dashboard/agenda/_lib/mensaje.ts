import { diagnosticoPostgres } from '@aluminior/db'

/** Nunca devuelve el texto de Postgres: puede incluir SQL o datos. */
export function mensajeAgenda(error: unknown, accion: 'abrir' | 'guardar' | 'quitar'): string {
  const codigo = diagnosticoPostgres(error)?.code
  if (codigo === '42P01') return 'Agenda no disponible'
  if (codigo === '23514') return 'Datos no válidos'
  if (accion === 'quitar') return 'No se pudo quitar'
  if (accion === 'abrir') return 'No se pudo abrir la agenda'
  return 'No se pudo guardar'
}
