'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const MAX_SEGUNDOS = 300
const TIPOS = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']

function extension(tipo: string): string {
  if (tipo.includes('mp4')) return 'm4a'
  if (tipo.includes('ogg')) return 'ogg'
  return 'webm'
}

export interface Grabacion {
  audio: Blob
  nombre: string
}

/** Graba del micrófono hasta 5 minutos. Para solo al llegar al límite. */
export function useGrabadora(alTerminar: (grabacion: Grabacion) => void) {
  const grabador = useRef<MediaRecorder | null>(null)
  const [segundos, setSegundos] = useState(0)
  const [grabando, setGrabando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Se decide tras montar para que servidor y navegador pinten lo mismo.
  const [disponible, setDisponible] = useState(false)
  useEffect(() => {
    setDisponible(typeof MediaRecorder !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia))
  }, [])

  const parar = useCallback(() => {
    if (grabador.current?.state === 'recording') grabador.current.stop()
  }, [])

  useEffect(() => {
    if (!grabando) return
    const reloj = setInterval(() => setSegundos((s) => s + 1), 1000)
    return () => clearInterval(reloj)
  }, [grabando])

  useEffect(() => {
    if (segundos >= MAX_SEGUNDOS) parar()
  }, [segundos, parar])

  useEffect(() => () => {
    grabador.current?.stream.getTracks().forEach((pista) => pista.stop())
  }, [])

  async function empezar() {
    setError(null)
    let flujo: MediaStream
    try {
      flujo = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setError('No hay permiso para usar el micrófono')
      return
    }
    const tipo = TIPOS.find((t) => MediaRecorder.isTypeSupported(t)) ?? ''
    const nuevo = new MediaRecorder(flujo, tipo ? { mimeType: tipo } : undefined)
    const trozos: Blob[] = []
    nuevo.ondataavailable = (evento) => { if (evento.data.size) trozos.push(evento.data) }
    nuevo.onstop = () => {
      flujo.getTracks().forEach((pista) => pista.stop())
      setGrabando(false)
      const final = nuevo.mimeType || tipo || 'audio/webm'
      const audio = new Blob(trozos, { type: final.split(';')[0] })
      if (audio.size) alTerminar({ audio, nombre: `dictado.${extension(final)}` })
    }
    grabador.current = nuevo
    setSegundos(0)
    setGrabando(true)
    nuevo.start(1000)
  }

  return { disponible, grabando, segundos, error, empezar, parar }
}
