export function ErroresSeleccion({ errores }: { errores: Record<string, string[] | undefined> }) {
  const mensajes = [...(errores.opcionHerraje ?? []), ...(errores.opcionAcristalamiento ?? [])]
  if (!mensajes.length) return null
  return <div role="alert" tabIndex={-1} className="text-sm" style={{ color: 'var(--al-error)' }}>
    {mensajes.map((mensaje, indice) => <p key={indice}>{mensaje}</p>)}
  </div>
}
