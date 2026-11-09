'use client'

import { useActionState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { guardarNota, type EstadoFormulario } from '../_lib/acciones.ts'
import type { NotaVista } from '../_lib/tipos.ts'
import { NotaFila, Urgencia } from './nota-fila.tsx'

export function Notas({ notas }: { notas: readonly NotaVista[] }) {
  const abiertas = notas.filter((nota) => !nota.hecha)
  const hechas = notas.filter((nota) => nota.hecha)
  return (
    <aside className="al-agenda-notas" aria-labelledby="agenda-notas">
      <h2 id="agenda-notas">Notas</h2>
      <NotaNueva />
      <ul className="al-notas-lista">
        {abiertas.map((nota) => <NotaFila key={nota.id} nota={nota} />)}
      </ul>
      {hechas.length > 0 && (
        <details className="al-notas-hechas">
          <summary>Hechas ({hechas.length})</summary>
          <ul className="al-notas-lista">
            {hechas.map((nota) => <NotaFila key={nota.id} nota={nota} />)}
          </ul>
        </details>
      )}
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
    <form action={accion} ref={formulario} className="al-nota-nueva">
      {estado && !estado.ok && estado.mensaje && <p role="alert" className="al-agenda-error">{estado.mensaje}</p>}
      <input
        name="texto"
        required
        maxLength={4000}
        placeholder="Nueva nota"
        aria-label="Nueva nota"
        data-invalido={errores.texto ? 'true' : undefined}
      />
      {errores.texto && <p className="al-agenda-error">{errores.texto.join('. ')}</p>}
      <div className="al-nota-barra">
        <Urgencia valor={5} />
        <input name="dia" type="date" aria-label="Día" />
        <button type="submit" className="al-command-primary" disabled={pendiente}>Añadir</button>
      </div>
      <details className="al-nota-mas">
        <summary>Observaciones</summary>
        <textarea name="observaciones" rows={2} maxLength={4000} aria-label="Observaciones" />
      </details>
    </form>
  )
}
