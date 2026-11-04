import type { crearDb } from '@aluminior/db'
import { descripcionGrupo, type UnionVisual } from '@aluminior/core/estructuras'
import type { EntradaAltaLinea, ResultadoAltaLinea } from '../lineas/alta-linea.ts'
import { guardarLineaValorada } from '../lineas/guardar-linea.ts'
import { prepararAltaCerramiento } from './alta-cerramiento.ts'
import { leerNombresDescripcion } from './nombres-descripcion.ts'
import { prepararLineaValorada } from './preparar-linea-valorada.ts'

export async function altaCerramientoValorado(db: Pick<ReturnType<typeof crearDb>, 'transaction'>,
  entrada: EntradaAltaLinea, catalogoUniones?: readonly UnionVisual[],
): Promise<ResultadoAltaLinea> {
  const alta = prepararAltaCerramiento({ ...entrada,
    configuracionSerializada: entrada.configuracionCerramiento, catalogoUniones })
  if (!alta.ok) return alta
  let aviso: string | null = null
  await guardarLineaValorada(db, entrada.presupuestoId, async (tx, cabecera) => {
    const preparada = await prepararLineaValorada(tx, alta.alta, { ...entrada, tarifa: cabecera.tarifa })
    aviso = preparada.aviso
    const descripcion = descripcionGrupo(alta.alta.configuracion, await leerNombresDescripcion(tx, {
      configuracion: alta.alta.configuracion,
      serieCodigo: alta.alta.datos.serieCodigo,
      vidrioCodigo: alta.alta.datos.vidrioCodigo,
      acabadoCodigo: alta.alta.datos.acabadoCodigo,
    }))
    return { tipo: 'CERRAMIENTO', cerramiento: alta.alta,
      ...(preparada.estado === 'VALORADA' ? { resultado: preparada.resultado } : {}),
      manoObra: preparada.manoObra,
      valores: { presupuestoId: entrada.presupuestoId, descripcion,
        referencia: entrada.referencia, cantidad: String(entrada.cantidad),
        anchoMm: alta.alta.anchoMm, altoMm: alta.alta.altoMm,
        ...preparada.importes, avisoValoracion: preparada.aviso } }
  }, entrada.solicitudId ? { id: entrada.solicitudId, alRepetir: valor => { aviso = valor } } : undefined)
  return { ok: true, id: entrada.presupuestoId, mensaje: aviso ?? undefined }
}
