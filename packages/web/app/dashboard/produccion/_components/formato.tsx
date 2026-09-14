import type { ReactNode } from 'react'

export const numero = (n: number | string) => Number(n).toLocaleString('es-ES', { maximumFractionDigits: 8 })
export const medida = (n: string | number | null) => n === null ? 'Sin medida' : `${numero(n)} mm`
export const angulo = (n: string | null) => n === null ? 'Desconocido' : `${numero(n)}°`
export const euros = (n: string | null) => n === null ? 'Sin valorar' : Number(n).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
export function Tabla({ titulo, cabeceras, children }: { titulo: string; cabeceras: string[]; children: ReactNode }) {
  return <div className="overflow-x-auto rounded-md border" tabIndex={0} role="region" aria-label={`${titulo} desplazable`}
    style={{ borderColor: 'var(--al-border)' }}>
    <table className="w-full text-left text-sm [&_td]:px-3 [&_td]:py-2 [&_th]:px-3 [&_th]:py-2 [&_td]:align-top">
      <caption className="p-3 text-left font-medium">{titulo}</caption>
      <thead style={{ background: 'var(--al-surface-muted)' }}><tr>{cabeceras.map(c => <th scope="col" key={c}>{c}</th>)}</tr></thead>
      <tbody>{children}</tbody>
    </table>
  </div>
}
