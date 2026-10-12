'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { buscarClientes, type ClienteEncontrado } from '../_lib/acciones.ts'
import { clientesVigentes, iniciarBusquedaClientes, type EstadoBusquedaClientes } from './busqueda-clientes.ts'

export function SelectorCliente({ errores = [], inicial }: { errores?: string[]; inicial?: { codigo: string; nombre: string } | null }) {
  const listaId = useId()
  const contenedor = useRef<HTMLDivElement>(null)
  const buscador = useRef<HTMLInputElement>(null)
  const [consulta, setConsulta] = useState(inicial ? `${inicial.codigo} · ${inicial.nombre}` : '')
  const [codigo, setCodigo] = useState(inicial?.codigo ?? '')
  const [busqueda, setBusqueda] = useState<EstadoBusquedaClientes>({ consulta: '', estado: 'PENDIENTE', clientes: [] })
  const [abierto, setAbierto] = useState(false)
  const [activo, setActivo] = useState(-1)
  const [intento, setIntento] = useState(0)
  const resultados = clientesVigentes(consulta, busqueda)
  const buscando = busqueda.consulta !== consulta || busqueda.estado === 'PENDIENTE'

  useEffect(() => {
    if (!abierto) return
    let cancelar: (() => void) | undefined
    const temporizador = window.setTimeout(() => {
      const peticion = iniciarBusquedaClientes(consulta, buscarClientes, (siguiente) => {
        setBusqueda(siguiente)
        setActivo(siguiente.clientes.length ? 0 : -1)
      })
      cancelar = peticion.cancelar
    }, 160)

    return () => {
      cancelar?.()
      window.clearTimeout(temporizador)
    }
  }, [abierto, consulta, intento])

  const elegir = (cliente: ClienteEncontrado) => {
    setCodigo(cliente.codigo)
    setConsulta(`${cliente.codigo} · ${cliente.nombre}`)
    setAbierto(false)
    setActivo(-1)
  }

  return (
    <div
      ref={contenedor}
      className="al-client-picker"
      onBlur={(evento) => {
        if (!contenedor.current?.contains(evento.relatedTarget as Node | null)) setAbierto(false)
      }}
    >
      <label htmlFor={`${listaId}-busqueda`}>Cliente</label>
      <input type="hidden" name="clienteCodigo" value={codigo} />
      <input
        ref={buscador}
        id={`${listaId}-busqueda`}
        aria-invalid={errores.length ? true : undefined}
        aria-describedby={errores.length ? `${listaId}-error` : undefined}
        value={consulta}
        placeholder="Código o nombre"
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={abierto}
        aria-controls={listaId}
        aria-activedescendant={abierto && resultados[activo] ? `${listaId}-${activo}` : undefined}
        aria-busy={abierto && buscando || undefined}
        className="w-full rounded-md border px-3 py-2 text-sm"
        style={{
          background: 'var(--al-surface)',
          borderColor: errores.length ? 'var(--al-error)' : 'var(--al-border-strong)',
        }}
        onFocus={() => setAbierto(true)}
        onChange={(evento) => {
          setConsulta(evento.target.value)
          setCodigo('')
          setBusqueda({ consulta: evento.target.value, estado: 'PENDIENTE', clientes: [] })
          setActivo(-1)
          setAbierto(true)
        }}
        onKeyDown={(evento) => {
          if (evento.key === 'ArrowDown') {
            evento.preventDefault()
            setAbierto(true)
            setActivo((actual) => Math.min(actual + 1, resultados.length - 1))
          } else if (evento.key === 'ArrowUp') {
            evento.preventDefault()
            setActivo((actual) => resultados.length ? Math.max(actual - 1, 0) : -1)
          } else if (evento.key === 'Enter' && abierto) {
            evento.preventDefault()
            if (resultados[activo]) elegir(resultados[activo])
          } else if (evento.key === 'Escape') {
            if (abierto) evento.preventDefault()
            setAbierto(false)
          }
        }}
      />

      {abierto && (
        <div className="al-client-results">
          {buscando ? (
            <p role="status">Buscando…</p>
          ) : busqueda.estado === 'ERROR' ? (
            <>
              <p role="alert">No se pudo consultar el catálogo de clientes.</p>
              <button type="button" className="al-command" style={{ display: 'block' }} onClick={() => {
                buscador.current?.focus()
                setBusqueda({ consulta, estado: 'PENDIENTE', clientes: [] })
                setActivo(-1)
                setIntento((actual) => actual + 1)
              }}>Reintentar búsqueda</button>
            </>
          ) : !resultados.length ? <p>Sin coincidencias</p> : null}
          <div id={listaId} role="listbox" aria-label="Clientes">
            {resultados.map((cliente, indice) => (
              <button
                key={cliente.codigo}
                id={`${listaId}-${indice}`}
                type="button"
                role="option"
                aria-selected={indice === activo}
                data-active={indice === activo || undefined}
                onMouseDown={(evento) => evento.preventDefault()}
                onMouseEnter={() => setActivo(indice)}
                onClick={() => elegir(cliente)}
              >
                <strong>{cliente.codigo}</strong>
                <span>{cliente.nombre}</span>
                {cliente.poblacion && <small>{cliente.poblacion}</small>}
              </button>
            ))}
          </div>
        </div>
      )}

      <div id={`${listaId}-error`}>{errores.map((error) => (
        <p key={error} className="mt-1 text-xs" style={{ color: 'var(--al-error)' }}>{error}</p>
      ))}</div>
    </div>
  )
}
