'use client'

import { useState } from 'react'
import type { DatosDictado } from '@aluminior/core/dictado'
import type { ClienteCoincidente } from '../_lib/cliente-por-telefono.ts'
import { useGrabadora, type Grabacion } from './grabadora.ts'

export interface Interpretacion {
  transcripcion: string
  datos: DatosDictado
  clientes: ClienteCoincidente[]
}

function reloj(segundos: number): string {
  return `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, '0')}`
}

/** Paso 1: grabar o escribir la nota y mandarla a interpretar. */
export function Captura({ onInterpretado }: { onInterpretado: (resultado: Interpretacion) => void }) {
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const grabadora = useGrabadora((grabacion) => { void enviar(grabacion) })

  async function enviar(grabacion?: Grabacion) {
    const cuerpo = new FormData()
    if (grabacion) cuerpo.set('audio', grabacion.audio, grabacion.nombre)
    else cuerpo.set('texto', texto)
    setEnviando(true)
    setError(null)
    try {
      const respuesta = await fetch('/dashboard/presupuestos/dictado/interpretar', { method: 'POST', body: cuerpo })
      const datos = await respuesta.json().catch(() => null) as
        | ({ ok: true } & Interpretacion) | { ok: false; mensaje?: string } | null
      if (!datos?.ok) {
        setError(datos && 'mensaje' in datos && datos.mensaje ? datos.mensaje : 'No se pudo interpretar el dictado')
        return
      }
      onInterpretado({ transcripcion: datos.transcripcion, datos: datos.datos, clientes: datos.clientes })
    } catch {
      setError('Sin conexión con el servidor')
    } finally {
      setEnviando(false)
    }
  }

  const ocupado = enviando || grabadora.grabando
  return (
    <section className="al-dictado-bloque" aria-labelledby="dictado-captura">
      <h2 id="dictado-captura">Dictado</h2>
      <div className="al-dictado-grabar">
        {grabadora.grabando ? (
          <button type="button" className="al-command-primary" onClick={grabadora.parar}>
            Parar <span className="al-dictado-reloj">{reloj(grabadora.segundos)}</span>
          </button>
        ) : (
          <button
            type="button"
            className="al-command-primary"
            disabled={enviando || !grabadora.disponible}
            onClick={() => void grabadora.empezar()}
          >
            Grabar
          </button>
        )}
        {enviando && <span role="status">Interpretando…</span>}
      </div>
      {grabadora.error && <p role="alert" className="al-agenda-error">{grabadora.error}</p>}
      <label className="al-dictado-campo">
        Nota escrita
        <textarea
          rows={5}
          maxLength={8000}
          value={texto}
          disabled={ocupado}
          onChange={(evento) => setTexto(evento.target.value)}
        />
      </label>
      <div className="al-agenda-acciones">
        <button
          type="button"
          className="al-command"
          disabled={ocupado || !texto.trim()}
          onClick={() => void enviar()}
        >
          Interpretar
        </button>
      </div>
      {error && <p role="alert" className="al-agenda-error">{error}</p>}
    </section>
  )
}
