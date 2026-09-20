export type ResultadoEnvio = { ok: boolean } | null

/** Un intento en vuelo por formulario; el reintento conserva la identidad del alta. */
export function crearEnvioFormulario<T extends ResultadoEnvio>(
  accion: (previo: T, datos: FormData) => Promise<T>,
  fallo: T,
  identificarAlta = false,
  nuevaIdentidad = () => crypto.randomUUID(),
) {
  let pendiente = false
  let solicitudId: string | undefined
  return async (previo: T, datos: FormData): Promise<T | undefined> => {
    if (pendiente) return undefined
    pendiente = true
    try {
      if (identificarAlta) {
        solicitudId ??= nuevaIdentidad()
        datos.set('solicitudId', solicitudId)
      }
      const resultado = await accion(previo, datos)
      if (resultado?.ok) solicitudId = undefined
      return resultado
    } catch {
      // Una respuesta perdida no prueba que el servidor no haya confirmado.
      return fallo
    } finally {
      pendiente = false
    }
  }
}
