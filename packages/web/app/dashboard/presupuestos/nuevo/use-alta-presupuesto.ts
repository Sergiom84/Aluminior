import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearPresupuesto, type Estado } from '../_lib/acciones.ts'
import { obtenerOperacion, confirmarOperacion, guardarSolicitudAlta,
  recuperarSolicitudAlta, limpiarSolicitudAlta } from '../_lib/idempotencia/cliente.ts'

const MENSAJE = 'No se pudo confirmar la creación. Reintenta para recuperar el presupuesto.'

export function useAltaPresupuesto() {
  const router = useRouter()
  const [recuperando, setRecuperando] = useState(false)
  useEffect(() => {
    try { setRecuperando(recuperarSolicitudAlta() !== null) } catch { /* El envío informa el error. */ }
  }, [])
  const [estado, accion, enviando] = useActionState<Estado, FormData>(async (previo, formulario) => {
    try {
      const datos = recuperarSolicitudAlta() ?? formulario
      datos.set('operacionId', obtenerOperacion('alta'))
      guardarSolicitudAlta(datos)
      const resultado = await crearPresupuesto(previo, datos)
      if (resultado?.ok) {
        router.push(`/dashboard/presupuestos/${resultado.id}#configurador`)
        limpiarSolicitudAlta()
        confirmarOperacion('alta')
        setRecuperando(false)
      } else {
        // Respuesta recibida: permite corregir validaciones. La clave sigue
        // viva; un commit incierto nunca permite otra alta con otros datos.
        limpiarSolicitudAlta()
        setRecuperando(false)
      }
      return resultado
    } catch {
      setRecuperando(true)
      return { ok: false, errores: {}, mensaje: MENSAJE }
    }
  }, null)
  return { estado, accion, enviando, recuperando,
    mensaje: estado && !estado.ok ? estado.mensaje : recuperando ? MENSAJE : undefined }
}
