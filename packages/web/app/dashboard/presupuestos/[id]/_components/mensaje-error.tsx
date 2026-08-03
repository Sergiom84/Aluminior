import { idMensajeError, mensajesDe, type ErroresCampo } from '../../_lib/campos.ts'

/** Error de un campo, junto al campo y asociado a él por id. */
export function MensajeError({ campo, errores }: { campo: string; errores: ErroresCampo }) {
  const mensajes = mensajesDe(campo, errores)
  if (!mensajes.length) return null
  return (
    <p id={idMensajeError(campo)} role="alert" className="mt-1 text-xs"
      style={{ color: 'var(--al-error)' }}>
      {mensajes.join('. ')}
    </p>
  )
}
