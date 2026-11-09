/**
 * POST multipart con `audio` (grabación) o `texto` (nota escrita).
 * Devuelve la transcripción y los datos extraídos para que el operador los
 * revise. No escribe nada en la base: el presupuesto se crea después, con el
 * alta normal, cuando el operador confirma.
 *
 * Es una ruta y no una server action porque el audio supera el límite de
 * 1 MB de las acciones.
 */

import { LIMITE_TEXTO_DICTADO, normalizarTelefono, sanearDictado } from '@aluminior/core/dictado'
import { usuarioActual } from '../../_lib/usuario-actual.ts'
import { clientesPorTelefono } from '../_lib/cliente-por-telefono.ts'
import { ErrorDictado, extraerDatos, transcribirAudio } from '../_lib/groq.ts'

export const dynamic = 'force-dynamic'

const MAX_AUDIO = 10 * 1024 * 1024

function error(mensaje: string, estado: number) {
  return Response.json({ ok: false, mensaje }, { status: estado })
}

export async function POST(peticion: Request) {
  if (!await usuarioActual()) return error('Sesión no válida', 401)
  const longitud = Number(peticion.headers.get('content-length') ?? 0)
  if (longitud > MAX_AUDIO + 64 * 1024) return error('La grabación es demasiado larga', 413)

  let entrada: FormData
  try {
    entrada = await peticion.formData()
  } catch {
    return error('Envío no válido', 400)
  }

  try {
    const audio = entrada.get('audio')
    let texto = String(entrada.get('texto') ?? '').trim()
    if (audio instanceof Blob && audio.size > 0) {
      if (audio.size > MAX_AUDIO) return error('La grabación es demasiado larga', 413)
      if (audio.type && !audio.type.startsWith('audio/')) return error('El archivo no es de audio', 415)
      texto = await transcribirAudio(audio, audio instanceof File && audio.name ? audio.name : 'dictado.webm')
    }
    if (!texto) return error('No se ha entendido nada. Repite el dictado', 422)
    texto = [...texto].slice(0, LIMITE_TEXTO_DICTADO).join('')

    const datos = sanearDictado(await extraerDatos(texto))
    const cifras = normalizarTelefono(datos.telefono)
    const clientes = cifras ? await clientesPorTelefono(cifras) : []
    return Response.json({ ok: true, transcripcion: texto, datos, clientes })
  } catch (e) {
    if (e instanceof ErrorDictado) return error(e.message, 502)
    console.error('[dictado] interpretar', e)
    return error('No se pudo interpretar el dictado', 500)
  }
}
