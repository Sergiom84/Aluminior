'use client'

import { useActionState, useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  borrarNota, cambiarUrgencia, guardarNota, marcarNota, type EstadoFormulario,
} from '../_lib/acciones.ts'
import type { NotaVista } from '../_lib/tipos.ts'

const URGENCIAS = [5, 4, 3, 2, 1]

export function Notas({ notas }: { notas: readonly NotaVista[] }) {
  return (
    <aside className="al-agenda-notas" aria-labelledby="agenda-notas">
      <h2 id="agenda-notas">Notas</h2>
      <NotaNueva />
      <ul>
        {notas.map((nota) => <NotaFila key={nota.id} nota={nota} />)}
      </ul>
    </aside>
  )
}

function NotaNueva() {
  const router = useRouter()
  const formulario = useRef<HTMLFormElement>(null)
  const [estado, accion, pendiente] = useActionState(guardarNota, null as EstadoFormulario)
  const errores = estado && !estado.ok ? estado.errores : {}

  useEffect(() => {
    if (!estado?.ok) return
    formulario.current?.reset()
    router.refresh()
  }, [estado, router])

  return (
    <form action={accion} ref={formulario} className="al-nota">
      {estado && !estado.ok && estado.mensaje && <p role="alert" className="al-agenda-error">{estado.mensaje}</p>}
      <Campo texto="Texto" nombre="texto" filas={2} invalido={Boolean(errores.texto)} />
      {errores.texto && <p className="al-agenda-error">{errores.texto.join('. ')}</p>}
      <Campo texto="Observaciones" nombre="observaciones" filas={2} />
      <div className="al-nota-barra">
        <Urgencia valor={5} />
        <button type="submit" className="al-command-primary" disabled={pendiente}>Guardar</button>
      </div>
    </form>
  )
}

function NotaFila({ nota }: { nota: NotaVista }) {
  const router = useRouter()
  const [estado, accion, pendiente] = useActionState(guardarNota, null as EstadoFormulario)
  const [hecha, setHecha] = useState(nota.hecha)
  const [urgencia, setUrgencia] = useState(nota.urgencia)
  const [confirmando, setConfirmando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ocupado, iniciar] = useTransition()
  const errores = estado && !estado.ok ? estado.errores : {}

  useEffect(() => setHecha(nota.hecha), [nota.hecha])
  useEffect(() => setUrgencia(nota.urgencia), [nota.urgencia])
  useEffect(() => {
    if (estado?.ok) router.refresh()
  }, [estado, router])

  function alternar(marcada: boolean) {
    setHecha(marcada)
    iniciar(async () => {
      const resultado = await marcarNota(nota.id, marcada)
      if (resultado.ok) {
        setError(null)
        router.refresh()
        return
      }
      setHecha(!marcada)
      setError(resultado.mensaje ?? 'No se pudo guardar')
    })
  }

  function cambiar(nivel: number) {
    setUrgencia(nivel)
    iniciar(async () => {
      const resultado = await cambiarUrgencia(nota.id, nivel)
      if (resultado.ok) {
        setError(null)
        router.refresh()
        return
      }
      setUrgencia(nota.urgencia)
      setError(resultado.mensaje ?? 'No se pudo guardar')
    })
  }

  function quitar() {
    iniciar(async () => {
      const resultado = await borrarNota(nota.id)
      if (!resultado.ok) {
        setError(resultado.mensaje ?? 'No se pudo quitar')
        return
      }
      router.refresh()
    })
  }

  return (
    <li>
      <form action={accion} className="al-nota" data-hecha={hecha ? 'true' : undefined} data-urgencia={urgencia}>
        <input type="hidden" name="id" value={nota.id} />
        <div className="al-nota-barra">
          <label className="al-nota-hecho">
            <input
              type="checkbox"
              checked={hecha}
              disabled={ocupado}
              aria-label={`Hecho, ${nota.texto}`}
              onChange={(evento) => alternar(evento.target.checked)}
            />
            Hecho
          </label>
          <Urgencia valor={urgencia} onChange={cambiar} />
          {!confirmando && <button type="button" className="al-command" onClick={() => setConfirmando(true)}>Quitar</button>}
        </div>
        {confirmando && (
          <span className="al-confirm-inline">
            <button type="button" className="al-command" disabled={ocupado} onClick={quitar}>Quitar</button>
            <button type="button" className="al-command" onClick={() => setConfirmando(false)}>Cancelar</button>
          </span>
        )}
        <Campo texto="Texto" nombre="texto" filas={2} valor={nota.texto} invalido={Boolean(errores.texto)} />
        <Campo texto="Observaciones" nombre="observaciones" filas={2} valor={nota.observaciones ?? ''} />
        {errores.texto && <p className="al-agenda-error">{errores.texto.join('. ')}</p>}
        {(error || (estado && !estado.ok ? estado.mensaje : null)) && (
          <p role="alert" className="al-agenda-error">{error || (estado && !estado.ok ? estado.mensaje : null)}</p>
        )}
        <button type="submit" className="al-command" disabled={pendiente || ocupado}>Guardar</button>
      </form>
    </li>
  )
}

function Campo({
  texto, nombre, filas, valor, invalido = false,
}: {
  texto: string
  nombre: string
  filas: number
  valor?: string
  invalido?: boolean
}) {
  return (
    <label>
      {texto}
      <textarea name={nombre} rows={filas} required={nombre === 'texto'} maxLength={4000} defaultValue={valor} data-invalido={invalido ? 'true' : undefined} />
    </label>
  )
}

function Urgencia({ valor, onChange }: { valor: number; onChange?: (nivel: number) => void }) {
  return (
    <label className="al-nota-urgencia">
      Urgencia
      <select
        name="urgencia"
        value={onChange ? valor : undefined}
        defaultValue={onChange ? undefined : valor}
        onChange={onChange ? (evento) => onChange(Number(evento.target.value)) : undefined}
      >
        {URGENCIAS.map((nivel) => <option key={nivel} value={nivel}>{nivel}</option>)}
      </select>
    </label>
  )
}
