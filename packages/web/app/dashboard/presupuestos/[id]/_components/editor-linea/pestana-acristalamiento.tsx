'use client'

import { useEffect, useState } from 'react'
import { MAXIMO_OPCIONES_ACRISTALAMIENTO, type OpcionAcristalamiento } from '@aluminior/core/estructuras'
import { opcionesAcristalamientoLinea } from '../../../_lib/editor-linea-action.ts'
import styles from './editor-linea.module.css'

/**
 * Pestaña `Acristalamiento` (RECON-CERRAMIENTOS.md §5): cinco radios, cada uno
 * con la tabla de junquillo de `Hojas` y de `Fijos`; la 1 por defecto y las
 * posiciones sin tabla deshabilitadas.
 *
 * No emite campo: con la base actual sólo existe la opción 1, que es la que ya
 * usa el despiece (`junquillos.ts`). Elegir otra exige la migración propuesta.
 */
export function PestanaAcristalamiento({ serie }: { serie: string }) {
  const [opciones, setOpciones] = useState<OpcionAcristalamiento[]>([])
  const [elegida, setElegida] = useState(1)

  useEffect(() => {
    let vigente = true
    const cargar = serie ? opcionesAcristalamientoLinea(serie) : Promise.resolve([])
    cargar.then((leidas) => {
      if (!vigente) return
      setOpciones(leidas)
      setElegida(leidas.find((o) => o.predeterminada)?.numero ?? 1)
    }).catch(() => { if (vigente) setOpciones([]) })
    return () => { vigente = false }
  }, [serie])

  const posiciones = Array.from({ length: MAXIMO_OPCIONES_ACRISTALAMIENTO }, (_, i) => i + 1)
  const tabla = (t: OpcionAcristalamiento['hojas']) => (t ? `${t.codigo}${t.descripcion ? ` ${t.descripcion}` : ''}` : '')

  return (
    <fieldset className={styles.radios}>
      <legend>Acristalamiento</legend>
      {posiciones.map((numero) => {
        const opcion = opciones.find((o) => o.numero === numero)
        const id = `acristalamiento-${numero}`
        return (
          <div key={numero} className={styles.radio} data-deshabilitada={!opcion}>
            <input type="radio" id={id} name="opcionAcristalamientoVista" value={numero}
              checked={elegida === numero} disabled={!opcion || numero !== 1}
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
