'use client'

import React, { useState } from 'react'
import { anyadirLinea, type Estado } from '../../../_lib/acciones.ts'
import { crearEnvioFormulario } from '../../../_lib/envio-formulario.ts'
import { acabadoPorDefecto } from '../campos-alta.tsx'

export interface ModeloMosquitera { codigo: string; descripcion: string }

const FALLO: Estado = { ok: false, errores: {}, mensaje: 'No se pudo confirmar el guardado. Vuelve a intentarlo.' }

/** `(PS) MOSQUITERA ENROLLABLE` -> `MOSQUITERA ENROLLABLE`: el prefijo es del catálogo, no del operador. */
export const nombreModelo = (descripcion: string) => descripcion.replace(/^\(PS\)\s*/, '')

/**
 * Familia Mosquiteras del catálogo del configurador. Una mosquitera no es un
 * módulo dibujable de la composición: es un artículo con precio por medidas.
 * Aquí el operador elige modelo y medidas dentro de Cerramiento, y la línea se
 * añade como artículo del presupuesto, sin tocar el GRUPO que se está diseñando.
 * Este formulario vive dentro del de la línea: sus campos no llevan `name` y
 * Intro no envía el formulario exterior.
 */
export function MosquiterasCatalogo({ presupuestoId, modelos, acabados }: {
  presupuestoId: string
  modelos: readonly ModeloMosquitera[]
  acabados: readonly { codigo: string; descripcion: string }[]
}) {
  const [modelo, setModelo] = useState('')
  const [ancho, setAncho] = useState('')
  const [alto, setAlto] = useState('')
  const [cantidad, setCantidad] = useState('1')
  const [ubicacion, setUbicacion] = useState('')
  const [acabado, setAcabado] = useState(() => acabadoPorDefecto([...acabados]))
  const [estado, setEstado] = useState<Estado>(null)
  const [enviando, setEnviando] = useState(false)
  const [enviar] = useState(() => crearEnvioFormulario(anyadirLinea, FALLO, true))
  const errores = estado && !estado.ok ? estado.errores : {}

  const anyadir = async () => {
    if (enviando) return
    if (!modelo) { setEstado({ ok: false, errores: { codigo: ['Elige un modelo'] } }); return }
    const datos = new FormData()
    datos.set('presupuestoId', presupuestoId)
    datos.set('tipo', 'ARTICULO')
    datos.set('codigo', modelo)
    datos.set('acabadoCodigo', acabado)
    datos.set('referencia', ubicacion)
    datos.set('anchoMm', ancho)
    datos.set('altoMm', alto)
    datos.set('cantidad', cantidad)
    setEnviando(true)
    try {
      const resultado = await enviar(estado, datos)
      if (resultado === undefined) return
      setEstado(resultado)
      if (resultado?.ok) { setAncho(''); setAlto(''); setCantidad('1'); setUbicacion('') }
    } finally {
      setEnviando(false)
    }
  }

  const campo = (nombre: string) => errores[nombre]?.length
    ? <p role="alert" className="al-mosquitera-error">{errores[nombre]!.join('. ')}</p> : null
  const alIntro = (evento: React.KeyboardEvent) => {
    if (evento.key === 'Enter') { evento.preventDefault(); void anyadir() }
  }

  return (
    <div className="al-catalogo-mosquiteras" aria-label="Mosquiteras">
      <div className="al-catalogo-miniaturas" role="listbox" aria-label="Modelos de mosquitera">
        {modelos.map((item) => (
          <button key={item.codigo} type="button" role="option" aria-selected={item.codigo === modelo}
            className="al-designer-thumb al-mosquitera-modelo" title={`${nombreModelo(item.descripcion)} [${item.codigo}]`}
            onClick={() => setModelo(item.codigo === modelo ? '' : item.codigo)}>
            <span>{nombreModelo(item.descripcion)}</span>
            <b>{item.codigo}</b>
          </button>
        ))}
      </div>
      <div className="al-mosquitera-campos" onKeyDown={alIntro}>
        <label>Ancho (mm)
          <input type="number" min={0} step="0.01" value={ancho} aria-invalid={errores.anchoMm ? true : undefined}
            onChange={(e) => setAncho(e.target.value)} className="cifra" />
          {campo('anchoMm')}
        </label>
        <label>Alto (mm)
          <input type="number" min={0} step="0.01" value={alto} aria-invalid={errores.altoMm ? true : undefined}
            onChange={(e) => setAlto(e.target.value)} className="cifra" />
          {campo('altoMm')}
        </label>
        <label>Cdad.
          <input type="number" min={1} step={1} value={cantidad} aria-invalid={errores.cantidad ? true : undefined}
            onChange={(e) => setCantidad(e.target.value)} className="cifra" />
          {campo('cantidad')}
        </label>
        <label>Acabado
          <select value={acabado} onChange={(e) => setAcabado(e.target.value)}>
            <option value="">Genérico / no aplica</option>
            {acabados.map((item) => (
              <option key={item.codigo} value={item.codigo}>{item.codigo} · {item.descripcion}</option>
            ))}
          </select>
        </label>
        <label>Ubicación
          <input value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} placeholder="SALÓN" />
        </label>
        <button type="button" className="al-command-primary" disabled={enviando} onClick={() => void anyadir()}>
          {enviando ? 'Añadiendo…' : 'Añadir mosquitera'}
        </button>
      </div>
      {campo('codigo')}
      {estado?.mensaje && <p role={estado.ok ? 'status' : 'alert'}>{estado.mensaje}</p>}
      {estado?.ok && !estado.mensaje && <p role="status">Mosquitera añadida al presupuesto.</p>}
    </div>
  )
}
