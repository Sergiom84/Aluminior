import { Shell } from '../../_components/shell.tsx'
import { FormularioArticulo } from '../_components/formulario.tsx'
import { familiasConUso } from '../_lib/acciones.ts'

export const dynamic = 'force-dynamic'

export default async function NuevoArticulo() {
  const familias = await familiasConUso()

  return (
    <Shell moduloActivo="articulos">
      <FormularioArticulo
        esNuevo
        familias={familias}
        articulo={{
          codigo: '',
          descripcion: '',
          familiaCodigo: null,
          subfamiliaCodigo: null,
          // Unidad por defecto: es lo más frecuente en el catálogo real.
          tipoMetraje: 'UD',
          metrajeMinimo: null,
          metrajeMultiploLargo: null,
          metrajeMultiploAncho: null,
          pesoMl: null,
          grosorPesoVidrio: null,
          tamJunquilloGoma: null,
          proveedorHabitual: null,
          apareceEnHojaDespiece: true,
          apareceEnHojaCorte: true,
          controlaStock: false,
        }}
      />
    </Shell>
  )
}
