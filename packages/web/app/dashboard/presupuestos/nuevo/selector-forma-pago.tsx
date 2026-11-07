const FORMAS_PAGO = ['Efectivo', 'Transferencia'] as const

/** Desplegable de forma de pago. Conserva un valor anterior distinto para no perderlo al editar. */
export function SelectorFormaPago({ id, valor = null, className, style }: {
  id: string
  valor?: string | null
  className?: string
  style?: React.CSSProperties
}) {
  const heredado = valor && !(FORMAS_PAGO as readonly string[]).includes(valor) ? valor : null
  return (
    <select id={id} name="formaPago" defaultValue={valor ?? ''} className={className} style={style}>
      <option value="">Sin indicar</option>
      {FORMAS_PAGO.map(f => <option key={f} value={f}>{f}</option>)}
      {heredado && <option value={heredado}>{heredado}</option>}
    </select>
  )
}
