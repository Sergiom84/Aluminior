'use client'

import type { MedidaDictada } from '@aluminior/core/dictado'

function milimetros(valor: string): number | null {
  const numero = Number(valor)
  return valor.trim() && Number.isInteger(numero) && numero > 0 ? numero : null
}

/** Lista editable de huecos. Una medida vacía queda vacía, no en cero. */
export function Medidas({ medidas, onChange }: { medidas: MedidaDictada[]; onChange: (medidas: MedidaDictada[]) => void }) {
  function cambiar(indice: number, cambio: Partial<MedidaDictada>) {
    onChange(medidas.map((m, i) => (i === indice ? { ...m, ...cambio } : m)))
  }

  return (
    <fieldset className="al-dictado-medidas">
      <legend>Medidas (mm)</legend>
      {medidas.map((m, indice) => (
        <div className="al-dictado-medida" key={indice}>
          <input
            aria-label={`Ancho ${indice + 1}`}
            placeholder="Ancho"
            inputMode="numeric"
            value={m.ancho ?? ''}
            onChange={(evento) => cambiar(indice, { ancho: milimetros(evento.target.value) })}
          />
          <span aria-hidden="true">x</span>
          <input
            aria-label={`Alto ${indice + 1}`}
            placeholder="Alto"
            inputMode="numeric"
            value={m.alto ?? ''}
            onChange={(evento) => cambiar(indice, { alto: milimetros(evento.target.value) })}
          />
          <input
            aria-label={`Nota ${indice + 1}`}
            placeholder="Dónde"
            maxLength={120}
            value={m.nota ?? ''}
            onChange={(evento) => cambiar(indice, { nota: evento.target.value || null })}
          />
          <button
            type="button"
            className="al-command"
            aria-label={`Quitar medida ${indice + 1}`}
            onClick={() => onChange(medidas.filter((_, i) => i !== indice))}
          >
            Quitar
          </button>
        </div>
      ))}
      <button
        type="button"
        className="al-command"
        onClick={() => onChange([...medidas, { ancho: null, alto: null, nota: null }])}
      >
        Añadir medida
      </button>
    </fieldset>
  )
}
