'use client'

import { startTransition, useState, type FormEvent } from 'react'
import { camposAltaDictado, formatearTelefono, normalizarTelefono, type MedidaDictada } from '@aluminior/core/dictado'
import { useAltaPresupuesto } from '../../nuevo/use-alta-presupuesto.ts'
import type { Interpretacion } from './captura.tsx'
import { Medidas } from './medidas.tsx'

/**
 * Paso 2: el operador corrige lo extraído y crea el presupuesto con el alta
 * normal (numeración, idempotencia y salto al configurador). Nace sin valorar.
 */
export function Revision({ interpretacion, onVolver }: { interpretacion: Interpretacion; onVolver: () => void }) {
  const { datos, transcripcion, clientes } = interpretacion
  const { estado, accion, enviando, recuperando, mensaje } = useAltaPresupuesto()
  const cifras = normalizarTelefono(datos.telefono)
  const [nombre, setNombre] = useState(datos.nombre ?? '')
  const [telefono, setTelefono] = useState(cifras ? formatearTelefono(cifras) : datos.telefono ?? '')
  const [direccion, setDireccion] = useState(datos.direccion ?? '')
  const [queMontar, setQueMontar] = useState(datos.queMontar ?? '')
  const [medidas, setMedidas] = useState<MedidaDictada[]>(datos.medidas)
  const [cliente, setCliente] = useState(clientes.length === 1 ? clientes[0].codigo : '')
  const errores = estado && !estado.ok ? estado.errores : {}

  function crear(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const campos = camposAltaDictado({ nombre, telefono, direccion, queMontar, medidas, transcripcion })
    const envio = new FormData()
    if (cliente) envio.set('clienteCodigo', cliente)
    envio.set('nombreLibre', campos.nombreLibre)
    envio.set('obraTexto', campos.obraTexto)
    envio.set('observaciones', campos.observaciones)
    envio.set('tarifa', '1')
    startTransition(() => accion(envio))
  }

  return (
    <form onSubmit={crear} className="al-dictado-bloque" aria-labelledby="dictado-revision">
      <h2 id="dictado-revision">Revisión</h2>
      {mensaje && <p role="alert" className="al-agenda-error">{mensaje}</p>}
      <fieldset disabled={enviando || recuperando} className="al-dictado-campos">
        {clientes.length > 0 && (
          <label className="al-dictado-campo">
            Cliente con ese teléfono
            <select value={cliente} onChange={(evento) => setCliente(evento.target.value)}>
              <option value="">Ninguno</option>
              {clientes.map((c) => <option key={c.codigo} value={c.codigo}>{c.codigo} {c.nombre}</option>)}
            </select>
          </label>
        )}
        <label className="al-dictado-campo">
          Nombre
          <input
            value={nombre}
            maxLength={200}
            required={!cliente}
            onChange={(evento) => setNombre(evento.target.value)}
            data-invalido={errores.nombreLibre ? 'true' : undefined}
          />
        </label>
        {errores.nombreLibre && <p className="al-agenda-error">{errores.nombreLibre.join('. ')}</p>}
        <div className="al-dictado-fila">
          <label className="al-dictado-campo">
            Teléfono
            <input value={telefono} maxLength={30} inputMode="tel" onChange={(evento) => setTelefono(evento.target.value)} />
          </label>
          <label className="al-dictado-campo">
            Dirección
            <input value={direccion} maxLength={300} onChange={(evento) => setDireccion(evento.target.value)} />
          </label>
        </div>
        <label className="al-dictado-campo">
          Qué quiere montar
          <textarea rows={2} maxLength={1000} value={queMontar} onChange={(evento) => setQueMontar(evento.target.value)} />
        </label>
        <Medidas medidas={medidas} onChange={setMedidas} />
        <details className="al-dictado-transcripcion">
          <summary>Transcripción</summary>
          <p>{transcripcion}</p>
        </details>
        <div className="al-agenda-acciones">
          <button type="submit" className="al-command-primary">Crear presupuesto</button>
          <button type="button" className="al-command" onClick={onVolver}>Volver</button>
        </div>
      </fieldset>
    </form>
  )
}
