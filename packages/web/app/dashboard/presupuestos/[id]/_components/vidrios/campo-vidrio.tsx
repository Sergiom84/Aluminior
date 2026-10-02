'use client'

import { useId, useRef, useState, type InputHTMLAttributes } from 'react'
import { createPortal } from 'react-dom'
import { buscarVidrios } from '../../../_lib/vidrios/acciones.ts'
import type { VidrioEncontrado } from '../../../_lib/vidrios/buscar.ts'
import styles from './vidrios.module.css'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'defaultValue'> & {
  value: string; onChange: (codigo: string) => void
}

/** Campo canónico y búsqueda separada; elegir no aplica el borrador del elemento. */
export function CampoVidrio({ value, onChange, ...props }: Props) {
  const id = useId()
  const dialogo = useRef<HTMLDialogElement>(null)
  const abrir = useRef<HTMLButtonElement>(null)
  const peticion = useRef(0)
  const [montado, setMontado] = useState(false)
  const [consulta, setConsulta] = useState('')
  const [filas, setFilas] = useState<VidrioEncontrado[]>([])
  const [buscando, setBuscando] = useState(false)
  const [error, setError] = useState('')

  const buscar = async (texto: string) => {
    const actual = ++peticion.current
    setBuscando(true); setError(''); setFilas([])
    try {
      const resultado = await buscarVidrios(texto)
      if (actual === peticion.current) setFilas(resultado)
    } catch {
      if (actual === peticion.current) setError('No se pudo consultar el catálogo. Vuelve a buscar.')
    } finally {
      if (actual === peticion.current) setBuscando(false)
    }
  }
  const cerrar = () => {
    peticion.current++
    dialogo.current?.close(); setMontado(false); abrir.current?.focus()
  }
  return <>
    <span className={styles.campo}>
      <input {...props} value={value} onChange={e => onChange(e.target.value.toUpperCase())} />
      <button ref={abrir} type="button" className="al-command" aria-label="Buscar vidrio"
        onClick={() => { setConsulta(value); setMontado(true); void buscar(value) }}>Buscar</button>
    </span>
    {montado && createPortal(<dialog ref={nodo => {
      dialogo.current = nodo
      if (nodo && !nodo.open) nodo.showModal()
    }} className={styles.dialogo} aria-labelledby={id} onCancel={e => { e.preventDefault(); cerrar() }}>
      <h2 id={id}>Búsqueda de vidrios</h2>
      <div className={styles.busqueda}>
        <label>Código o descripción
          <input autoFocus value={consulta} onChange={e => setConsulta(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); void buscar(consulta) } }} />
        </label>
        <button type="button" className="al-command" disabled={buscando} onClick={() => void buscar(consulta)}>Buscar</button>
        <button type="button" className="al-command" onClick={() => { setConsulta(''); void buscar('') }}>Reset</button>
      </div>
      <div role="status">{error || (buscando ? 'Buscando…' : `${filas.length}${filas.length === 50 ? ' (límite de búsqueda)' : ''} resultados`)}</div>
      <div className={styles.resultados}>
        <table><thead><tr><th>Código</th><th>Descripción</th><th>Unidad</th><th /></tr></thead>
          <tbody>{filas.map(f => <tr key={f.codigo}>
            <td className="cifra">{f.codigo}</td><td>{f.descripcion}</td><td>{f.unidad}</td>
            <td><button type="button" className="al-command" aria-label={`Elegir ${f.codigo}`}
              onClick={() => { onChange(f.codigo); cerrar() }}>Elegir</button></td>
          </tr>)}</tbody></table>
      </div>
      <button type="button" className="al-command" onClick={cerrar}>Cerrar</button>
    </dialog>, document.body)}
  </>
}
