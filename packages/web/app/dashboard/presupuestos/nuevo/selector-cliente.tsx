'use client'

import { useEffect, useId, useRef, useState, useTransition } from 'react'
import { buscarClientes, type ClienteEncontrado } from '../_lib/acciones.ts'

export function SelectorCliente({ errores = [] }: { errores?: string[] }) {
  const listaId = useId()
  const contenedor = useRef<HTMLDivElement>(null)
  const [consulta, setConsulta] = useState('')
  const [codigo, setCodigo] = useState('')
  const [resultados, setResultados] = useState<ClienteEncontrado[]>([])
  const [abierto, setAbierto] = useState(false)
  const [activo, setActivo] = useState(-1)
  const [buscando, iniciarBusqueda] = useTransition()

  useEffect(() => {
    if (!abierto) return
    let vigente = true
    const temporizador = window.setTimeout(() => {
      iniciarBusqueda(async () => {
        const encontrados = await buscarClientes(consulta)
        if (!vigente) return
        setResultados(encontrados)
        setActivo(encontrados.length ? 0 : -1)
      })
    }, 160)

    return () => {
      vigente = false
      window.clearTimeout(temporizador)
    }
  }, [abierto, consulta])

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
      <label htmlFor="clienteBusqueda">Cliente</label>
      <input type="hidden" name="clienteCodigo" value={codigo} />
      <input
        id="clienteBusqueda"
        value={consulta}
        placeholder="Código o nombre"
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={abierto}
        aria-controls={listaId}
        aria-activedescendant={activo >= 0 ? `${listaId}-${activo}` : undefined}
        className="w-full rounded-md border px-3 py-2 text-sm"
        style={{
          background: 'var(--al-surface)',
          borderColor: errores.length ? 'var(--al-error)' : 'var(--al-border-strong)',
        }}
        onFocus={() => setAbierto(true)}
        onChange={(evento) => {
          setConsulta(evento.target.value)
          setCodigo('')
          setAbierto(true)
        }}
        onKeyDown={(evento) => {
          if (evento.key === 'ArrowDown') {
            evento.preventDefault()
            setAbierto(true)
            setActivo((actual) => Math.min(actual + 1, resultados.length - 1))
          } else if (evento.key === 'ArrowUp') {
            evento.preventDefault()
            setActivo((actual) => Math.max(actual - 1, 0))
          } else if (evento.key === 'Enter' && abierto && activo >= 0) {
            evento.preventDefault()
            elegir(resultados[activo])
          } else if (evento.key === 'Escape') {
            setAbierto(false)
          }
        }}
      />

      {abierto && (
        <div id={listaId} role="listbox" className="al-client-results">
          {buscando ? (
            <p>Buscando…</p>
          ) : resultados.length ? (
            resultados.map((cliente, indice) => (
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
            ))
          ) : (
            <p>Sin coincidencias</p>
          )}
        </div>
      )}

      {errores.map((error) => (
        <p key={error} className="mt-1 text-xs" style={{ color: 'var(--al-error)' }}>{error}</p>
      ))}
    </div>
  )
}
