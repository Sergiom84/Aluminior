import { claveOperacionValida } from './clave.ts'

/** Almacena claves por pestaña. Si sessionStorage no está
 * disponible, aborta ANTES de enviar: no perder la protección al recargar.
 */
export function obtenerOperacion(ambito: string): string {
  const nombre = `aluminior:operacion:${ambito}`
  const previa = sessionStorage.getItem(nombre)
  if (claveOperacionValida(previa)) return previa
  const clave = crypto.randomUUID()
  sessionStorage.setItem(nombre, clave)
  return clave
}

export function confirmarOperacion(ambito: string): void {
  sessionStorage.removeItem(`aluminior:operacion:${ambito}`)
}

const BORRADOR = 'aluminior:alta-pendiente'

export function guardarSolicitudAlta(datos: FormData): void {
  sessionStorage.setItem(BORRADOR, JSON.stringify(Array.from(datos.entries())))
}
export function recuperarSolicitudAlta(): FormData | null {
  const texto = sessionStorage.getItem(BORRADOR)
  if (!texto) return null
  const datos = new FormData()
  for (const [campo, valor] of JSON.parse(texto) as [string, string][]) datos.set(campo, valor)
  return datos
}
export function limpiarSolicitudAlta(): void {
  sessionStorage.removeItem(BORRADOR)
}
