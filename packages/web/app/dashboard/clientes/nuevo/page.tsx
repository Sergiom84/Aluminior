import { Shell } from '../../_components/shell.tsx'
import { FormularioCliente } from '../_components/formulario.tsx'
import { siguienteCodigo } from '../_lib/acciones.ts'

export const dynamic = 'force-dynamic'

export default async function NuevoCliente() {
  // Se propone el siguiente código libre, pero se puede cambiar.
  const codigo = await siguienteCodigo()

  return (
    <Shell moduloActivo="clientes">
      <FormularioCliente
        esNuevo
        cliente={{
          codigo,
          nombre: '',
          nombreComercial: null,
          nif: null,
          direccion: null,
          cp: null,
          poblacion: null,
          provincia: null,
          pais: 'ES',
          personaContacto: null,
          telefono: null,
          telefonoMovil: null,
          email: null,
          tarifa: 1,
        }}
      />
    </Shell>
  )
}
