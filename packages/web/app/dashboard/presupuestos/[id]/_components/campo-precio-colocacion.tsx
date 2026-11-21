'use client'

import React, { useEffect, useState, useTransition } from 'react'
import { guardarPrecioColocacionDefecto } from '../../_lib/preferencias-usuario-action.ts'
import { validarPrecioHoraColocacion } from '../../_lib/preferencias-usuario/validacion.ts'
import { bordeCampo } from '../../_lib/campos.ts'

function formatearEntradaPrecio(valor: string): string {
  const n = Number(valor)
  if (!Number.isFinite(n) || n <= 0) return '30'
  return Number.isInteger(n) ? String(n) : valor
}

export function CampoPrecioColocacion({
  presupuestoId,
  precioInicial,
  precioDefecto,
  err = {},
  inputId = 'precioHoraColocacion',
  claseEntrada,
  estiloEntrada,
  claseEtiqueta,
  onDefectoGuardado,
}: {
  presupuestoId: string
  precioInicial: string
  precioDefecto: string
  err?: Record<string, string[] | undefined>
  inputId?: string
  claseEntrada: string
  estiloEntrada: React.CSSProperties
  claseEtiqueta?: string
  onDefectoGuardado?: (nuevoPrecio: string) => void
}) {
  const [defectoActual, setDefectoActual] = useState(precioDefecto)
  const [valor, setValor] = useState(() => formatearEntradaPrecio(precioInicial))
  const [descartadoPara, setDescartadoPara] = useState<string | null>(null)
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null)
  const [avisoGuardado, setAvisoGuardado] = useState<string | null>(null)
  const [guardando, iniciar] = useTransition()

  useEffect(() => {
    setDefectoActual(precioDefecto)
  }, [precioDefecto])

  const normalizado = validarPrecioHoraColocacion(valor)
  const defectoNormalizado = validarPrecioHoraColocacion(defectoActual) ?? '30.00'
  const cambiadoRespectoADefecto = Boolean(normalizado && normalizado !== defectoNormalizado)
  const mostrarPregunta = cambiadoRespectoADefecto && descartadoPara !== valor

  const confirmarComoDefecto = () => {
    if (!normalizado || guardando) return
    setErrorGuardado(null)
    setAvisoGuardado(null)
    iniciar(async () => {
      try {
        const res = await guardarPrecioColocacionDefecto(normalizado, presupuestoId)
        if (!res.ok) {
          setErrorGuardado(res.mensaje)
          return
        }
        setDefectoActual(res.precioHora)
        setDescartadoPara(null)
        setAvisoGuardado('Guardado como tu precio por defecto.')
        onDefectoGuardado?.(res.precioHora)
      } catch {
        setErrorGuardado('No se pudo guardar tu precio por defecto.')
      }
    })
  }

  const erroresCampo = err.precioHoraColocacion?.filter(Boolean) ?? []
  const errorId = `${inputId}-error`
  return (
    <div>
      <label htmlFor={inputId} className={claseEtiqueta}>Precio colocación (€/h)</label>
      <input id={inputId} name="precioHoraColocacion" type="number" min="0.01" step="0.01"
        value={valor}
        aria-invalid={erroresCampo.length ? true : undefined}
        aria-describedby={erroresCampo.length ? errorId : undefined}
        onChange={(evento) => {
          setValor(evento.target.value)
          setDescartadoPara(null)
          setErrorGuardado(null)
          setAvisoGuardado(null)
        }}
        className={`cifra ${claseEntrada}`}
        style={{ ...estiloEntrada, borderColor: bordeCampo('precioHoraColocacion', err, String(estiloEntrada.borderColor ?? '')) }} />
      {erroresCampo.length > 0 && (
        <p id={errorId} role="alert" tabIndex={-1} className="mt-1 text-xs" style={{ color: 'var(--al-error)' }}>
          {erroresCampo.join('. ')}
        </p>
      )}

      {mostrarPregunta && (
        <div role="region" aria-label="Guardar precio de colocación por defecto"
          className="mt-1.5 rounded-md border p-2 text-xs"
          style={{ background: 'var(--al-warn-soft)', borderColor: 'var(--al-warn)' }}>
          <p className="mb-1.5 font-medium">¿Quieres dejar este precio por defecto?</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="al-command-primary" disabled={guardando} onClick={confirmarComoDefecto}>
              {guardando ? 'Guardando…' : 'Sí'}
            </button>
            <button type="button" className="al-command" disabled={guardando}
              onClick={() => setDescartadoPara(valor)}>
              No
            </button>
          </div>
          {errorGuardado && <p role="alert" className="mt-1" style={{ color: 'var(--al-error)' }}>{errorGuardado}</p>}
        </div>
      )}

      {avisoGuardado && (
        <p role="status" className="mt-1 text-xs" style={{ color: 'var(--al-ok)' }}>{avisoGuardado}</p>
      )}
    </div>
  )
}
