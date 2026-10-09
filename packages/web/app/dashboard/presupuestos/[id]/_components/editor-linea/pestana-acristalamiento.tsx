'use client'

import { useEffect, useState } from 'react'
import { MAXIMO_OPCIONES_ACRISTALAMIENTO, type OpcionAcristalamiento } from '@aluminior/core/estructuras'
import { opcionesAcristalamientoLinea } from '../../../_lib/editor-linea-action.ts'
import type { EstadoCargaCatalogo } from './disponibilidad-catalogos.ts'
import styles from './editor-linea.module.css'

/**
 * Pestaña `Acristalamiento` (RECON-CERRAMIENTOS.md §5): cinco radios, cada uno
 * con la tabla de junquillo de `Hojas` y de `Fijos`; la 1 por defecto y las
 * posiciones sin tabla deshabilitadas.
 *
 * La opción elegida viaja al servidor para seleccionar tablas y persistirla.
 */
export function PestanaAcristalamiento({ serie, onEstadoChange }: {
  serie: string; onEstadoChange: (estado: EstadoCargaCatalogo) => void
}) {
  const [opciones, setOpciones] = useState<OpcionAcristalamiento[]>([])
  const [elegida, setElegida] = useState(1)
  const [cargando, setCargando] = useState(Boolean(serie))
  const [error, setError] = useState(false)
  const [intento, setIntento] = useState(0)
  const estado = cargando ? 'PENDIENTE' : error ? 'ERROR' : 'LISTO'
  useEffect(() => { onEstadoChange({ clave: serie, estado }) }, [serie, estado, onEstadoChange])

  useEffect(() => {
    let vigente = true
    setCargando(Boolean(serie))
    setError(false)
    const cargar = serie ? opcionesAcristalamientoLinea(serie) : Promise.resolve([])
    cargar.then((leidas) => {
      if (!vigente) return
      setOpciones(leidas)
      setElegida(leidas.find((o) => o.predeterminada)?.numero ?? 1)
    }).catch(() => {
      if (vigente) { setOpciones([]); setError(true) }
    }).finally(() => { if (vigente) setCargando(false) })
    return () => { vigente = false }
  }, [serie, intento])

  const posiciones = Array.from({ length: MAXIMO_OPCIONES_ACRISTALAMIENTO }, (_, i) => i + 1)
  const tabla = (t: OpcionAcristalamiento['hojas']) => (t ? `${t.codigo}${t.descripcion ? ` ${t.descripcion}` : ''}` : '')

  return (
    <fieldset className={styles.radios}>
      <legend>Acristalamiento</legend>
      {cargando && <p role="status">Cargando opciones de acristalamiento…</p>}
      {error && <p role="alert">
        No se pudieron consultar las opciones de acristalamiento.{' '}
        <button type="button" className="al-command" onClick={() => setIntento(actual => actual + 1)}>Reintentar</button>
      </p>}
      {posiciones.map((numero) => {
        const opcion = opciones.find((o) => o.numero === numero)
        const id = `acristalamiento-${numero}`
        return (
          <div key={numero} className={styles.radio} data-deshabilitada={!opcion}>
            <input type="radio" id={id} name="opcionAcristalamiento" value={numero}
              checked={elegida === numero} disabled={!opcion}
              onChange={() => setElegida(numero)} aria-describedby={`${id}-hojas ${id}-fijos`} />
            <label htmlFor={id} className={styles.codigo}>{numero}</label>
            <span id={`${id}-hojas`}><span className="sr-only">Hojas </span>{tabla(opcion?.hojas ?? null)}</span>
            <span id={`${id}-fijos`}><span className="sr-only">Fijos </span>{tabla(opcion?.fijos ?? null)}</span>
          </div>
        )
      })}
    </fieldset>
  )
}
