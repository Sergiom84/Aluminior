/** Diagnóstico estructurado, sin SQL, parámetros ni texto potencialmente sensible. */
export interface DiagnosticoPostgres {
  readonly code: string
  readonly constraint_name?: string
}

/** Postgres directo y errores envueltos por Drizzle; corta cadenas cíclicas. */
export function diagnosticoPostgres(error: unknown): DiagnosticoPostgres | undefined {
  const vistos = new Set<object>()
  let actual = error
  while (actual !== null && typeof actual === 'object' && !vistos.has(actual)) {
    vistos.add(actual)
    const datos = actual as { code?: unknown; constraint_name?: unknown; cause?: unknown }
    if (typeof datos.code === 'string' && /^[0-9A-Z]{5}$/.test(datos.code)) {
      return {
        code: datos.code,
        ...(typeof datos.constraint_name === 'string' ? { constraint_name: datos.constraint_name } : {}),
      }
    }
    actual = datos.cause
  }
  return undefined
}
