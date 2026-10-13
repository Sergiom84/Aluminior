/** Diagnóstico del oráculo. Ningún resultado de este módulo alimenta el motor. */
import { importeFila, redondearCentimos, type ArticuloTarifado } from '../../packages/core/src/precios/importe-fila.ts'
import type { FilaDespieceCatalogo } from '../../packages/core/src/despiece/linea-catalogo/tipos.ts'
import { diferenciasPiezas, type HijaFactura } from './contraste-despiece-facturas.ts'
import { medidaCota } from './cotas-instancia.ts'

type PorMetro = (articulo: string) => boolean
type Tarifa = (articulo: string, acabado: string) => ArticuloTarifado | null
const centimos = (n: number) => Math.round(n * 100)
type FilaCsv = Readonly<Record<string, string | undefined>>

/** Cada salto debe ser único por sí mismo; un destino único no sanea un origen ambiguo. */
export function medidasPresupuestoOrigen(p: FilaCsv, albaranes: readonly FilaCsv[], lineasAlb: readonly FilaCsv[],
  presupuestos: readonly FilaCsv[], lineasPre: readonly FilaCsv[]) {
  if (!p.nAlbaran?.trim() || !p.nLinAlb?.trim() || !p.Articulo?.trim()) return null
  const alb = albaranes.filter(a => a.Numero === p.nAlbaran)
  if (alb.length !== 1 || !alb[0]!.Id?.trim()) return null
  const la = lineasAlb.filter(l => l.nDoc === alb[0]!.Id && l.nLinea === p.nLinAlb)
  if (la.length !== 1 || la[0]!.Articulo !== p.Articulo || la[0]!.EstructuraSN !== 'True'
    || la[0]!.TipoDocOrig !== 'VPRES' || !la[0]!.nDocOrigen?.trim() || !la[0]!.nLinOrig?.trim()) return null
  const pre = presupuestos.filter(pr => pr.Numero === la[0]!.nDocOrigen)
  if (pre.length !== 1 || !pre[0]!.Id?.trim()) return null
  const lp = lineasPre.filter(l => l.nDoc === pre[0]!.Id && l.nLinea === la[0]!.nLinOrig)
  if (lp.length !== 1 || lp[0]!.Articulo !== p.Articulo || lp[0]!.EstructuraSN !== 'True') return null
  const anchoMm = medidaCota(lp[0]!.Ancho), altoMm = medidaCota(lp[0]!.Largo)
  return anchoMm === null || altoMm === null || anchoMm <= 0 || altoMm <= 0 ? null : { anchoMm, altoMm }
}
type DiagnosticoImporte = { articulo: string; causa: 'emparejamiento-o-precio-no-acreditado' } | {
  articulo: string
  causa: 'superficie-o-incremento-m2' | 'precio-exportado-con-residuo' | 'redondeo-importe-unitario'
  tipoMetraje: string | null
  cantidad: number
  largoMm: number | null
  anchoMm: number | null
  metrajeMotor: number
  metrajeSinIncrementos: number | null
  precioCatalogo: number | null
  precioFactura: number
  importeFactura: number
  importeRevalorado: number
  diferenciaCentimos: number
  importePrecioDecimal: number
  importeSinIncrementos: number | null
  largoMultiploCatalogo: number | null
  anchoMultiploCatalogo: number | null
}

export function emparejarPiezas(motor: readonly FilaDespieceCatalogo[], factura: readonly HijaFactura[], porMetro: PorMetro) {
  const pendientes = [...factura]
  const pares: { motor: FilaDespieceCatalogo; factura: HijaFactura; economiaAmbigua: boolean }[] = []
  const soloMotor: FilaDespieceCatalogo[] = []
  for (const fila of motor) {
    const compatibles = pendientes.filter(h => diferenciasPiezas([fila], [h], porMetro).length === 0)
    if (!compatibles.length) { soloMotor.push(fila); continue }
    // Se puede comparar la geometría sin inventar la asignación económica.
    const todas = factura.filter(h => diferenciasPiezas([fila], [h], porMetro).length === 0)
    const economiaAmbigua = new Set(todas.map(h => `${h.precio}|${h.importe}`)).size > 1
    const hija = compatibles[0]!
    pendientes.splice(pendientes.indexOf(hija), 1)
    pares.push({ motor: fila, factura: hija, economiaAmbigua })
  }
  return { pares, soloMotor, soloFactura: pendientes }
}

export function diagnosticarEconomia(motor: readonly FilaDespieceCatalogo[], factura: readonly HijaFactura[], porMetro: PorMetro, tarifa: Tarifa) {
  const parejas = emparejarPiezas(motor, factura, porMetro)
  const filas = parejas.pares.flatMap<DiagnosticoImporte>(({ motor: f, factura: h, economiaAmbigua }) => {
    if (economiaAmbigua || f.metraje === null || !Number.isFinite(f.metraje) || !Number.isFinite(h.precio) || !Number.isFinite(h.importe)) {
      return [{ articulo: f.articulo, causa: 'emparejamiento-o-precio-no-acreditado' as const }]
    }
    // Misma aritmética que importeConPreciosFactura: aquí se observa, no se corrige.
    const importeRevalorado = Math.round(h.precio * f.metraje * 100 + 1e-9) / 100
    if (centimos(importeRevalorado) === centimos(h.importe)) return []
    const a = tarifa(f.articulo, f.acabado)
    const sinIncrementos = a ? importeFila(f, { ...a, incrementos: [] }).metraje : null
    const precioDecimal = Math.round(h.precio * 10000) / 10000
    const precioTieneResiduo = Math.abs(precioDecimal - h.precio) > 1e-9
    return [{
      articulo: f.articulo, causa: a?.tipoMetraje === 'M2' ? 'superficie-o-incremento-m2' as const
        : precioTieneResiduo ? 'precio-exportado-con-residuo' as const : 'redondeo-importe-unitario' as const,
      tipoMetraje: a?.tipoMetraje ?? null, cantidad: f.cantidad, largoMm: f.largoMm, anchoMm: f.anchoMm,
      metrajeMotor: f.metraje, metrajeSinIncrementos: sinIncrementos, precioCatalogo: a?.pvp ?? null,
      precioFactura: h.precio, importeFactura: h.importe, importeRevalorado,
      diferenciaCentimos: centimos(importeRevalorado) - centimos(h.importe),
      // Contrafactuales diagnósticos. No alteran precio, metraje ni estado oficial.
      importePrecioDecimal: redondearCentimos(precioDecimal * f.metraje),
      importeSinIncrementos: sinIncrementos === null ? null : redondearCentimos(h.precio * sinIncrementos),
      largoMultiploCatalogo: a?.multiploLargoCm ?? null, anchoMultiploCatalogo: a?.multiploAnchoCm ?? null,
    }]
  })
  return { filas, faltanPiezas: parejas.soloMotor.length + parejas.soloFactura.length }
}

/** Observa residuos pequeños, pero no los acepta como igualdad de piezas. */
export function diagnosticarGeometria(motor: readonly FilaDespieceCatalogo[], factura: readonly HijaFactura[], porMetro: PorMetro) {
  const { soloMotor, soloFactura } = emparejarPiezas(motor, factura, porMetro)
  const pendientes = [...soloFactura]
  let residuosPequenos = 0
  let maxResiduoMm = 0
  for (const f of soloMotor) {
    if (f.largoMm === null || !Number.isFinite(f.largoMm) ||
        (!porMetro(f.articulo) && (f.anchoMm === null || !Number.isFinite(f.anchoMm)))) continue
    const anchoMotor = porMetro(f.articulo) ? 0 : f.anchoMm!
    const i = pendientes.findIndex(h => f.articulo === h.articulo && f.cantidad === h.cantidad
      && Math.abs(f.largoMm! - h.largoMm) <= 0.0001
      && (porMetro(f.articulo) || Math.abs(anchoMotor - h.anchoMm) <= 0.0001))
    if (i < 0) continue
    const [h] = pendientes.splice(i, 1)
    residuosPequenos++
    maxResiduoMm = Math.max(maxResiduoMm, Math.abs(f.largoMm - h!.largoMm),
      porMetro(f.articulo) ? 0 : Math.abs(anchoMotor - h!.anchoMm))
  }
  return {
    soloMotor: soloMotor.length, soloFactura: soloFactura.length, residuosPequenos, maxResiduoMm,
    filasAdicionales: pendientes.map(h => ({ articulo: h.articulo, funcion: h.funcion, cantidad: h.cantidad, largoMm: h.largoMm })),
    causa: !soloMotor.length && !soloFactura.length ? 'piezas-coincidentes'
      : residuosPequenos === soloMotor.length ? (residuosPequenos ? 'residuos-pequenos-y-filas-adicionales' : 'filas-adicionales')
        : 'geometria-pendiente',
  }
}
