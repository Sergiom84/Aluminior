import { randomBytes } from 'node:crypto'

const TIPOS: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' }

export interface ImagenSubida {
  nombre: string
  tipo: string
  contenido: Buffer
}

/**
 * Valida la imagen y le da nombre. No escribe: `guardarUnion` la inserta en
 * `dibujo_catalogo` en la misma transacción, porque el disco del servidor no
 * sobrevive a un despliegue.
 */
export async function prepararSubida(archivo: File): Promise<
  { ok: true; imagen: ImagenSubida } | { ok: false; errores: Record<string, string[]> }
> {
  const extension = TIPOS[archivo.type]
  if (!extension || archivo.size === 0 || archivo.size > 2_000_000) {
    return { ok: false, errores: { imagen: ['PNG, JPG o WebP, hasta 2 MB'] } }
  }
  return { ok: true, imagen: {
    nombre: `U-${randomBytes(8).toString('hex')}.${extension}`,
    tipo: archivo.type,
    contenido: Buffer.from(await archivo.arrayBuffer()),
  } }
}
