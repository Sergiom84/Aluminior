import { readFile } from 'node:fs/promises'
import { NextResponse, type NextRequest } from 'next/server'
import { raicesDibujos, resolverDibujo } from '../../../../../lib/catalogo-uniones/dibujos.ts'
import { leerDibujo } from '../../../../../lib/catalogo-uniones/leer.ts'

function tipo(archivo: string) {
  const nombre = archivo.toLowerCase()
  if (nombre.endsWith('.png')) return 'image/png'
  if (nombre.endsWith('.webp')) return 'image/webp'
  if (nombre.endsWith('.jpg') || nombre.endsWith('.jpeg')) return 'image/jpeg'
  return 'image/bmp'
}

export async function GET(request: NextRequest) {
  const archivo = request.nextUrl.searchParams.get('archivo') ?? ''
  const ruta = resolverDibujo(archivo, raicesDibujos())
  if (ruta) {
    const bytes = await readFile(ruta)
    return new NextResponse(new Uint8Array(bytes), {
      headers: { 'Content-Type': tipo(archivo), 'Cache-Control': 'private, max-age=3600' },
    })
  }
  const guardado = await leerDibujo(archivo)
  if (!guardado) return new NextResponse(null, { status: 404 })
  return new NextResponse(new Uint8Array(guardado.contenido), {
    headers: { 'Content-Type': guardado.tipo || tipo(archivo), 'Cache-Control': 'private, max-age=3600' },
  })
}
