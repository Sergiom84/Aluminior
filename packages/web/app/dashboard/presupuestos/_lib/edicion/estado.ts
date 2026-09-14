export type EstadoEdicion = { ok: true; mensaje: string } |
  { ok: false; errores: Record<string, string[] | undefined>; mensaje?: string } | null

/** Next puede incluir metadatos de acción; los demás campos se validan estrictamente. */
export function camposEdicion(datos: FormData) {
  return Object.fromEntries([...datos].filter(([nombre]) => !nombre.startsWith('$ACTION_')))
}
