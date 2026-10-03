/** Contrato técnico local. Nunca contiene cabeceras de cliente ni textos de obra. */
import { numeroOrigen } from '../banco-precios.mjs'
export type Fila = Record<string, unknown>
export type Tablas = Record<string, Fila[]>
export const texto = (v: unknown) => String(v ?? '').trim()
export const numero = (v: unknown): number | null => typeof v === 'number'
  ? Number.isFinite(v) ? v : null : numeroOrigen(v)
export const si = (v: unknown) => v === true || ['True', 'true', '-1', '1'].includes(texto(v))
export const tiene = (v: unknown) => !!texto(v) && texto(v) !== '0'
export const clave = (...v: unknown[]) => JSON.stringify(v.map(texto))
export function agrupar(filas: readonly Fila[], key: (f: Fila) => string) {
  const m = new Map<string, Fila[]>()
  for (const f of filas) { const k = key(f); const a = m.get(k) ?? []; a.push(f); m.set(k, a) }
  return m
}
export interface Pieza {
  articulo: string; funcion: string; acabado: string; cantidad: number | null
  largo: number | null; ancho: number | null; coste: number | null; costeTotal: number | null
  precio: number | null; importe: number | null; metraje: number | null; unidad: string
}
export function pieza(f: Fila): Pieza {
  return { articulo: texto(f.Articulo), funcion: texto(f.Funcion), acabado: texto(f.Acabado),
    cantidad: numero(f.Cdad), largo: numero(f.LargoCorte), ancho: numero(f.AnchoCorte),
    coste: numero(f.Coste), costeTotal: numero(f.CosteMetrajeTotal), precio: numero(f.Precio),
    importe: numero(f.ImporteTotal), metraje: numero(f.Metraje), unidad: texto(f.TipoMetraje) }
}
export interface Caso {
  id: string; tipo: 'ESTRUCTURA' | 'GRUPO' | 'ELEMENTO'; modelo: string; fecha: string; tarifa: number | null
  /** `ComisionPorc` de la cabecera si `SumarComisionSN`; `Despunte` (importe) de la cabecera. */
  comision?: string | null; despunte?: number | null
  padre: Fila; configuracion: Fila | null; opciones: Fila[]; piezas: Pieza[]
  dimensiones: { ancho: number | null; alto: number | null }; cantidad: number | null
  serie: string | null; vidrio: string | null; familias: { familia: string; conjunto: string }[]
  esperado: number | null; totalEsperado: number | null; exclusiones: string[]
  elementos?: Caso[]; cerramiento?: Fila; geometria?: Fila[]
  /** `VAccesorios` y `VOpciones` (VPRES) de la línea: compacto y otros accesorios. */
  accesorios?: Fila[]; opcionesAccesorio?: Fila[]
}
export type Estado = 'igual' | 'cercano' | 'distinto' | 'sin valorar' | 'error'
export interface Medicion {
  id: string; tipo: Caso['tipo']; modelo: string; fecha: string; estado: Estado
  esperado: number; obtenido: number | null; diferencia: number | null
  causas: string[]; avisos: string[]; piezas: Pieza[]; tarifaPosterior: boolean | null
}
