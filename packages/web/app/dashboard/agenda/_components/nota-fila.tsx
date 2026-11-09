'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  borrarNota, cambiarUrgencia, guardarNota, marcarNota, type EstadoFormulario,
} from '../_lib/acciones.ts'
import type { NotaVista } from '../_lib/tipos.ts'

const URGENCIAS = [5, 4, 3, 2, 1]

function fechaCorta(dia: string): string {
  return `${dia.slice(8, 10)}/${dia.slice(5, 7)}`
}

/** Una línea por nota; se despliega para editarla. */
export function NotaFila({ nota }: { nota: NotaVista }) {
  const router = useRouter()
  const [estado, accion, pendiente] = useActionState(guardarNota, null as EstadoFormulario)
  const [hecha, setHecha] = useState(nota.hecha)
  const [urgencia, setUrgencia] = useState(nota.urgencia)
  const [abierta, setAbierta] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ocupado, iniciar] = useTransition()
  const errores = estado && !estado.ok ? estado.errores : {}
  const aviso = error || (estado && !estado.ok ? estado.mensaje : null)

  useEffect(() => setHecha(nota.hecha), [nota.hecha])
  useEffect(() => setUrgencia(nota.urgencia), [nota.urgencia])
  useEffect(() => {
    if (!estado?.ok) return
    setAbierta(false)
    router.refresh()
  }, [estado, router])

  function ejecutar(tarea: () => Promise<{ ok: boolean; mensaje?: string }>, deshacer: () => void) {
    iniciar(async () => {
      const resultado = await tarea()
      if (resultado.ok) {
        setError(null)
        router.refresh()
        return
      }
      deshacer()
      setError(resultado.mensaje ?? 'No se pudo guardar')
    })
  }

  function alternar(marcada: boolean) {
    setHecha(marcada)
    ejecutar(() => marcarNota(nota.id, marcada), () => setHecha(!marcada))
  }

  function cambiar(nivel: number) {
    setUrgencia(nivel)
    ejecutar(() => cambiarUrgencia(nota.id, nivel), () => setUrgencia(nota.urgencia))
  }

  function quitar() {
    ejecutar(() => borrarNota(nota.id), () => setConfirmando(false))
  }

  return (
    <li className="al-nota" data-hecha={hecha ? 'true' : undefined} data-urgencia={urgencia}>
      <div className="al-nota-linea">
        <input
          type="checkbox"
          checked={hecha}
          disabled={ocupado}
          aria-label={`Hecho, ${nota.texto}`}
          onChange={(evento) => alternar(evento.target.checked)}
        />
        <Urgencia valor={urgencia} onChange={cambiar} />
        <button
          type="button"
          className="al-nota-resumen"
          aria-expanded={abierta}
          onClick={() => setAbierta((valor) => !valor)}
        >
          <span className="al-nota-texto">{nota.texto}</span>
          {(nota.dia || nota.observaciones) && (
            <span className="al-nota-meta">
              {nota.dia && <span className="al-nota-fecha">{fechaCorta(nota.dia)}</span>}
              {nota.observaciones && <span>{nota.observaciones}</span>}
            </span>
          )}
        </button>
      </div>
      {aviso && <p role="alert" className="al-agenda-error">{aviso}</p>}
      {abierta && (
        <form action={accion} className="al-nota-editor">
          <input type="hidden" name="id" value={nota.id} />
          <input type="hidden" name="urgencia" value={urgencia} />
          <label>
            Texto
            <textarea name="texto" rows={2} required maxLength={4000} defaultValue={nota.texto} data-invalido={errores.texto ? 'true' : undefined} />
          </label>
          {errores.texto && <p className="al-agenda-error">{errores.texto.join('. ')}</p>}
          <label>
            Observaciones
            <textarea name="observaciones" rows={2} maxLength={4000} defaultValue={nota.observaciones ?? ''} />
          </label>
          <label>
            Día
            <input name="dia" type="date" defaultValue={nota.dia ?? ''} />
          </label>
          <div className="al-nota-barra">
            <button type="submit" className="al-command-primary" disabled={pendiente || ocupado}>Guardar</button>
            <button type="button" className="al-command" onClick={() => setAbierta(false)}>Cerrar</button>
            {confirmando ? (
              <span className="al-confirm-inline">
                <button type="button" className="al-command" disabled={ocupado} onClick={quitar}>Quitar</button>
                <button type="button" className="al-command" onClick={() => setConfirmando(false)}>Cancelar</button>
              </span>
            ) : (
              <button type="button" className="al-command" onClick={() => setConfirmando(true)}>Quitar</button>
            )}
          </div>
        </form>
      )}
    </li>
  )
}

export function Urgencia({ valor, onChange }: { valor: number; onChange?: (nivel: number) => void }) {
  return (
    <select
      name={onChange ? undefined : 'urgencia'}
      className="al-nota-urgencia"
      aria-label="Urgencia"
      title="Urgencia"
      value={onChange ? valor : undefined}
      defaultValue={onChange ? undefined : valor}
      onChange={onChange ? (evento) => onChange(Number(evento.target.value)) : undefined}
    >
      {URGENCIAS.map((nivel) => <option key={nivel} value={nivel}>{nivel}</option>)}
    </select>
  )
}
