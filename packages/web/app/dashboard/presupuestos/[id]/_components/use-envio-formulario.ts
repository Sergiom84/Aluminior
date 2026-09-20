'use client'

import { useRef, useState, type FormEvent } from 'react'
import { crearEnvioFormulario } from '../../_lib/envio-formulario.ts'

type EstadoFormulario = { ok: true } | {
  ok: false; errores: Record<string, string[]>; mensaje?: string
} | null

/** onSubmit conserva los campos: React no ejecuta el reset automático de form action. */
export function useEnvioFormulario<T extends EstadoFormulario>(
  accion: (previo: T, datos: FormData) => Promise<T>,
  identificarAlta = false,
) {
  const [estado, setEstado] = useState<T>(null as T)
  const [enviando, setEnviando] = useState(false)
  const bloqueo = useRef(false)
  const [enviarDatos] = useState(() => crearEnvioFormulario(accion, {
    ok: false, errores: {}, mensaje: 'No se pudo confirmar el guardado. Vuelve a intentarlo.',
  } as T, identificarAlta))

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    if (bloqueo.current) return
    bloqueo.current = true
    setEnviando(true)
    try {
      const resultado = await enviarDatos(estado, new FormData(evento.currentTarget))
      if (resultado !== undefined) setEstado(resultado)
    } finally {
      bloqueo.current = false
      setEnviando(false)
    }
  }
  return { estado, enviar, enviando }
}
