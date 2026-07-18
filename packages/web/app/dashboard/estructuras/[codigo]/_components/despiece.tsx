'use client'

import { useState, useMemo } from 'react'
import { evaluar, variablesDe, ErrorFormula } from '@aluminior/core/despiece'

export interface Componente {
  id: string
  articuloCodigo: string
  descripcionArticulo: string | null
  cantidad: string | null
  formulaLargo: string | null
  tipoCorte: string | null
  anguloIzquierdo: string | null
  anguloDerecho: string | null
  funcion: string | null
  posicionTrabajo: string | null
}

/** Los símbolos dibujan el corte: ! recto, / y \ a inglete. */
const CORTE: Record<string, string> = {
  '!!': 'Recto / Recto',
  '/\\': 'Inglete / Inglete',
  '!\\': 'Recto / Inglete',
  '\\!': 'Inglete / Recto',
}

/**
 * Tabla de despiece con evaluación de fórmulas en vivo.
 *
 * Deja probar qué medidas de corte salen para un hueco concreto. Es la forma
 * más directa de contrastar contra el sistema original: mismas medidas de
 * entrada, mismos largos de salida.
 *
 * AVISO: sólo se cubren L y A. El resto de variables (REF, FI, FS, CAJ…) aún
 * no sabemos de dónde toman su valor — ver PLAN.md anexo F. Las fórmulas que
 * las usen mostrarán qué falta, en lugar de inventarse un número.
 */
export function TablaDespiece({ componentes }: { componentes: Componente[] }) {
  const [largo, setLargo] = useState(1600)
  const [alto, setAlto] = useState(1230)

  const contexto = useMemo(() => ({ L: largo, A: alto }), [largo, alto])

  const filas = useMemo(
    () =>
      componentes.map((c) => {
        if (!c.formulaLargo) return { ...c, medida: null as number | null, fallo: null }
        try {
          return { ...c, medida: evaluar(c.formulaLargo, contexto), fallo: null }
        } catch (e) {
          const faltan = variablesDe(c.formulaLargo).filter((v) => !(v in contexto))
          return {
            ...c,
            medida: null,
            fallo: faltan.length
              ? `faltan ${faltan.join(', ')}`
              : (e as ErrorFormula).message,
          }
        }
      }),
    [componentes, contexto],
  )

  const resueltas = filas.filter((f) => f.medida !== null).length
  const conFormula = filas.filter((f) => f.formulaLargo).length

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end gap-4 rounded-lg border p-4"
        style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border)' }}>
        <div>
          <label htmlFor="largo" className="mb-1 block text-sm font-medium">Ancho del hueco</label>
          <div className="flex items-center gap-2">
            <input id="largo" type="number" value={largo} min={0} step={10}
              onChange={(e) => setLargo(Number(e.target.value))}
              className="cifra w-28 rounded-md border px-3 py-2 text-sm"
              style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border-strong)' }} />
            <span className="text-sm" style={{ color: 'var(--al-text-muted)' }}>mm (L)</span>
          </div>
        </div>
        <div>
          <label htmlFor="alto" className="mb-1 block text-sm font-medium">Alto del hueco</label>
          <div className="flex items-center gap-2">
            <input id="alto" type="number" value={alto} min={0} step={10}
              onChange={(e) => setAlto(Number(e.target.value))}
              className="cifra w-28 rounded-md border px-3 py-2 text-sm"
              style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border-strong)' }} />
            <span className="text-sm" style={{ color: 'var(--al-text-muted)' }}>mm (A)</span>
          </div>
        </div>
        <p className="ml-auto text-sm" style={{ color: 'var(--al-text-muted)' }}>
          {resueltas} de {conFormula} fórmulas resueltas con L y A
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border"
        style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--al-surface-muted)' }}>
              {['Artículo', 'Función', 'Cant.', 'Fórmula', 'Medida', 'Corte', 'Ángulos'].map((h, i) => (
                <th key={h} className="border-b px-3 py-2.5 font-medium"
                  style={{
                    borderColor: 'var(--al-border)', color: 'var(--al-text-muted)',
                    textAlign: i === 2 || i === 4 ? 'right' : 'left',
                  }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((c) => (
              <tr key={c.id} className="border-b" style={{ borderColor: 'var(--al-border)' }}>
                <td className="px-3 py-1.5">
                  <span className="font-medium">{c.articuloCodigo}</span>
                  {c.descripcionArticulo && (
                    <span className="ml-2 text-xs" style={{ color: 'var(--al-text-faint)' }}>
                      {c.descripcionArticulo.slice(0, 40)}
                    </span>
                  )}
                </td>
                <td className="px-3 py-1.5" style={{ color: 'var(--al-text-muted)' }}>{c.funcion ?? '—'}</td>
                <td className="cifra px-3 py-1.5">{c.cantidad ? Number(c.cantidad) : '—'}</td>
                <td className="px-3 py-1.5">
                  <code className="rounded px-1.5 py-0.5 text-xs"
                    style={{ background: 'var(--al-surface-muted)' }}>
                    {c.formulaLargo ?? '—'}
                  </code>
                </td>
                <td className="cifra px-3 py-1.5">
                  {c.medida !== null ? (
                    <strong>{Math.round(c.medida).toLocaleString('es-ES')}</strong>
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--al-warn)' }}>{c.fallo ?? '—'}</span>
                  )}
                </td>
                <td className="px-3 py-1.5" style={{ color: 'var(--al-text-muted)' }}>
                  {c.tipoCorte ? (
                    <span title={CORTE[c.tipoCorte] ?? c.tipoCorte}>
                      <code>{c.tipoCorte}</code>
                    </span>
                  ) : '—'}
                </td>
                <td className="cifra px-3 py-1.5" style={{ textAlign: 'left', color: 'var(--al-text-muted)' }}>
                  {c.anguloIzquierdo != null && c.anguloDerecho != null
                    ? `${Number(c.anguloIzquierdo)}° / ${Number(c.anguloDerecho)}°`
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
