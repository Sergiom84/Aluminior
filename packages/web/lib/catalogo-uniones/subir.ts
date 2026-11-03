import { randomBytes } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { carpetaSubidas } from './dibujos.ts'

const TIPOS: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' }

export async function guardarSubida(archivo: File) {
  const extension = TIPOS[archivo.type]
  if (!extension || archivo.size === 0 || archivo.size > 2_000_000) {
    return { ok: false as const, errores: { imagen: ['PNG, JPG o WebP, hasta 2 MB'] } }
  }
  const nombre = `U-${randomBytes(8).toString('hex')}.${extension}`
  const carpeta = carpetaSubidas()
  mkdirSync(carpeta, { recursive: true })
  writeFileSync(join(carpeta, nombre), Buffer.from(await archivo.arrayBuffer()))
  return { ok: true as const, nombre }
}
