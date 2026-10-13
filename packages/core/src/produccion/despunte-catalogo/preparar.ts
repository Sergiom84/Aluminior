import { multiplicarDecimal, sumarDecimal, type Decimal } from '../../precios/decimal.ts'

export interface OrigenDetalleDespunte { readonly lineaId: string; readonly detalleId: string }
export interface IdentidadDespunteCatalogo {
  readonly articuloCodigo: string
  readonly acabadoCodigo: string
  readonly tonalidadCodigo: string
}
export interface DetalleFisicoDespunte extends OrigenDetalleDespunte, IdentidadDespunteCatalogo {
  /** Incluye ya la cantidad del detalle; puede diferir del metraje de corte. */
  readonly metrajeDetalleM: Decimal
  readonly cantidadPrincipal: number
  readonly cantidadDetalle: number
  readonly longitudCorteMm: number
  readonly largoArticuloMm: number
}
export interface CorteCatalogoDespunte extends OrigenDetalleDespunte {
  readonly longitudMm: number
  readonly cantidad: number
}
export interface GrupoCatalogoDespunte extends IdentidadDespunteCatalogo {
  readonly longitudBarraMm: number
  readonly metrajeDespieceM: Decimal
  readonly cantidadCortes: number
  readonly cortes: readonly CorteCatalogoDespunte[]
}
export interface IncidenciaPreparacionDespunte {
  readonly detalleIndice: number
  readonly codigo: 'IDENTIDAD_AUSENTE' | 'ORIGEN_DUPLICADO' | 'CANTIDAD_INVALIDA' | 'CANTIDAD_DESBORDADA'
    | 'METRAJE_INVALIDO' | 'CERO_INCOHERENTE' | 'CORTE_INVALIDO' | 'BARRA_INVALIDA' | 'BARRAS_INCOMPATIBLES'
}
export type PreparacionDespunteCatalogo =
  | { readonly estado: 'LISTO'; readonly grupos: readonly GrupoCatalogoDespunte[]; readonly incidencias: readonly [] }
  | { readonly estado: 'BLOQUEADO'; readonly grupos: readonly []; readonly incidencias: readonly IncidenciaPreparacionDespunte[] }

const MAX_INT32 = 2_147_483_647
const identidadValida = (valor: unknown): valor is string => typeof valor === 'string' && valor.trim().length > 0
const escala = (valor: string) => valor.trim().split('.')[1]?.length ?? 0
const metrajeValido = (valor: unknown): valor is Decimal => typeof valor === 'string' && /^\+?\d+(?:\.\d+)?$/.test(valor.trim())

/** Prepara únicamente entradas físicas seleccionadas; no valora ni modifica el documento. */
export function prepararDespunteCatalogo(entrada: {
  readonly detalles: readonly DetalleFisicoDespunte[]
  readonly largoBarraEstandarMm?: number | null
}): PreparacionDespunteCatalogo {
  const incidencias: IncidenciaPreparacionDespunte[] = []
  const grupos = new Map<string, GrupoCatalogoDespunte>()
  const origenes = new Set<string>()
  entrada.detalles.forEach((detalle, detalleIndice) => {
    const fallo = (codigo: IncidenciaPreparacionDespunte['codigo']) => incidencias.push({ detalleIndice, codigo })
    if (![detalle.lineaId, detalle.detalleId, detalle.articuloCodigo, detalle.acabadoCodigo, detalle.tonalidadCodigo]
      .every(identidadValida)) { fallo('IDENTIDAD_AUSENTE'); return }
    const origen = JSON.stringify([detalle.lineaId, detalle.detalleId])
    if (origenes.has(origen)) { fallo('ORIGEN_DUPLICADO'); return }
    origenes.add(origen)
    // Contención de Aluminior: solo cantidades enteras; no emula Convert.ToInt32 fraccionario.
    if (!Number.isSafeInteger(detalle.cantidadPrincipal) || detalle.cantidadPrincipal <= 0
      || !Number.isSafeInteger(detalle.cantidadDetalle) || detalle.cantidadDetalle < 0) {
      fallo('CANTIDAD_INVALIDA'); return
    }
    const cantidad = detalle.cantidadDetalle * detalle.cantidadPrincipal
    if (!Number.isSafeInteger(cantidad) || cantidad > MAX_INT32) { fallo('CANTIDAD_DESBORDADA'); return }
    if (!metrajeValido(detalle.metrajeDetalleM)) { fallo('METRAJE_INVALIDO'); return }
    const precision = escala(detalle.metrajeDetalleM)
    const metraje = multiplicarDecimal(detalle.metrajeDetalleM, String(detalle.cantidadPrincipal), precision)
    if (cantidad === 0 && /[1-9]/.test(metraje)) { fallo('CERO_INCOHERENTE'); return }
    if (!Number.isFinite(detalle.longitudCorteMm) || detalle.longitudCorteMm < 0
      || cantidad > 0 && detalle.longitudCorteMm === 0) { fallo('CORTE_INVALIDO'); return }
    if (!Number.isFinite(detalle.largoArticuloMm) || detalle.largoArticuloMm < 0) { fallo('BARRA_INVALIDA'); return }
    const longitudBarraMm = detalle.largoArticuloMm === 0 ? entrada.largoBarraEstandarMm : detalle.largoArticuloMm
    if (typeof longitudBarraMm !== 'number' || !Number.isFinite(longitudBarraMm) || longitudBarraMm <= 0) {
      fallo('BARRA_INVALIDA'); return
    }
    const key = JSON.stringify([detalle.articuloCodigo, detalle.acabadoCodigo, detalle.tonalidadCodigo])
    const previo = grupos.get(key)
    if (previo && previo.longitudBarraMm !== longitudBarraMm) { fallo('BARRAS_INCOMPATIBLES'); return }
    const cantidadCortes = (previo?.cantidadCortes ?? 0) + cantidad
    if (!Number.isSafeInteger(cantidadCortes)) { fallo('CANTIDAD_DESBORDADA'); return }
    const anterior = previo?.metrajeDespieceM ?? '0'
    grupos.set(key, {
      articuloCodigo: detalle.articuloCodigo, acabadoCodigo: detalle.acabadoCodigo, tonalidadCodigo: detalle.tonalidadCodigo,
      longitudBarraMm, metrajeDespieceM: sumarDecimal(anterior, metraje, Math.max(escala(anterior), precision)), cantidadCortes,
      cortes: [...previo?.cortes ?? [], { lineaId: detalle.lineaId, detalleId: detalle.detalleId,
        longitudMm: detalle.longitudCorteMm, cantidad }],
    })
  })
  return incidencias.length ? { estado: 'BLOQUEADO', grupos: [], incidencias }
    : { estado: 'LISTO', grupos: [...grupos.values()], incidencias: [] }
}
