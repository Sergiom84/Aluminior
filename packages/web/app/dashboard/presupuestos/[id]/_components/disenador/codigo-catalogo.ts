import {
  estructuraSinDibujo, type buscarVentanasPorCodigo, type EstructuraSinDibujo, type PlantillaDiseno,
} from '@aluminior/core/estructuras'

export type ResolucionCodigo =
  | { tipo: 'vacio' }
  | { tipo: 'plantilla'; plantilla: PlantillaDiseno }
  | { tipo: 'sinDibujo'; estructura: EstructuraSinDibujo }
  | { tipo: 'desconocido'; codigo: string }

/**
 * Qué hace el campo «Código» del catálogo con lo tecleado. Una plantilla
 * dibujable exacta manda; si no, un código sin dibujo registrado es tan
 * válido como ella (solo si quien lo usa sabe colocarlo); lo demás no existe.
 */
export function resolverCodigoCatalogo(
  busqueda: ReturnType<typeof buscarVentanasPorCodigo>,
  admiteSinDibujo: boolean,
  buscarSinDibujo: (codigo: string) => EstructuraSinDibujo | null = estructuraSinDibujo,
): ResolucionCodigo {
  if (!busqueda.consulta) return { tipo: 'vacio' }
  if (busqueda.exacta) return { tipo: 'plantilla', plantilla: busqueda.exacta }
  const estructura = admiteSinDibujo ? buscarSinDibujo(busqueda.consulta) : null
  return estructura ? { tipo: 'sinDibujo', estructura } : { tipo: 'desconocido', codigo: busqueda.consulta }
}
