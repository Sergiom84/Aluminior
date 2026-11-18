/**
 * Registro de UNA valoración de línea, para diagnosticar fallos sin repetir el alta.
 *
 * Pensado para leerse en los logs de Render: qué se tecleó (estructura, serie,
 * vidrio, acabados, materiales propios de cada elemento, medidas, cotas,
 * compacto, uniones), qué salió (precio, completa o no) y por qué
 * (diagnósticos bloqueantes y avisos de cada origen).
 * Con eso se compara una línea contra Productor sin reabrirla.
 *
 * Sin datos de cliente: sólo identificadores internos del presupuesto y la línea.
 * Función pura; escribirlo es cosa de `registrarValoracion`.
 */
import type { ResultadoCerramientoV1 } from '@aluminior/core/estructuras'
import { CODIGO_SIN_PRECIO } from '@aluminior/core/estructuras'
import type { AltaCerramiento } from '../cerramientos/alta-cerramiento.ts'

export const PREFIJO_REGISTRO_VALORACION = '[valoracion]'
const MAXIMO_DETALLE = 300
const MAXIMO_CAUSAS = 20

export interface EntradaRegistroValoracion {
  operacion: 'alta' | 'edicion'
  presupuestoId: string
  lineaId: string
  tipo: 'ARTICULO' | 'CERRAMIENTO' | 'ESTRUCTURA'
  articulo: string | null
  acabadoArticulo?: string | null
  cantidad: string | number | null
  anchoMm: number | null
  altoMm: number | null
  precioUnitario: string | number | null
  total: string | number | null
  valoracionCompleta: boolean
  pvpManual: boolean
  aviso: string | null
  cerramiento?: AltaCerramiento
  resultado?: ResultadoCerramientoV1
}

export interface CausaValoracion {
  origen: string
  codigo: string
  bloqueante: boolean
  detalle: string
}

const recortar = (texto: string, maximo = MAXIMO_DETALLE) =>
  texto.length > maximo ? `${texto.slice(0, maximo - 1)}…` : texto
const numero = (v: string | number | null) => v === null || v === '' ? null : Number(v)

function datosCerramiento(alta: AltaCerramiento) {
  const c = alta.configuracion
  return {
    serie: alta.datos.serieCodigo,
    vidrio: alta.datos.vidrioCodigo,
    acabado: alta.datos.acabadoCodigo,
    acabadoAccesorios: alta.datos.acabadoAccesoriosCodigo ?? c.acabadoAccesoriosCodigo ?? null,
    modulos: c.modulos.map(m => ({
      estructura: m.estructuraCodigo, anchoMm: m.anchoMm, altoMm: m.altoMm,
      ...(m.fiMm !== undefined ? { fiMm: m.fiMm } : {}),
      ...(m.cotas ? { cotas: m.cotas } : {}),
      ...(m.compacto ? { compacto: m.compacto.estructuraCodigo, altoCajonMm: m.compacto.altoCajonMm } : {}),
      ...(m.disenoPropio ? { disenoPropio: true } : {}),
      ...(m.invisible ? { invisible: true } : {}),
      ...(m.materiales ? { materiales: m.materiales } : {}),
    })),
    uniones: c.uniones.map(u => u.codigo || 'SIN_CONFIGURAR'),
    // Excepciones de la unión (serie, acabado, Acabado2), en el mismo orden que `uniones`.
    ...(c.uniones.some(u => u.materiales)
      ? { materialesUniones: c.uniones.map(u => u.materiales ?? null) } : {}),
    preciosManuales: c.preciosManuales?.length ?? 0,
  }
}

/** Diagnósticos del resultado, salvo las piezas pendientes de precio, que van aparte. */
export function causasValoracion(resultado: ResultadoCerramientoV1 | undefined): CausaValoracion[] {
  if (!resultado) return []
  return resultado.origenes.flatMap(o => o.diagnosticos
    .filter(d => d.codigo !== CODIGO_SIN_PRECIO)
    .map(d => ({ origen: `${o.origen.tipo} ${o.origen.id}`, codigo: d.codigo, bloqueante: d.bloqueante,
      detalle: recortar(d.detalle) })))
    .sort((a, b) => Number(b.bloqueante) - Number(a.bloqueante))
    .slice(0, MAXIMO_CAUSAS)
}

/** Artículo y acabado de las piezas sin PVP en la tarifa, una vez cada uno. */
export function piezasSinPvp(resultado: ResultadoCerramientoV1 | undefined): string[] {
  if (!resultado) return []
  const claves = new Set<string>()
  for (const o of resultado.origenes) for (const d of o.diagnosticos) {
    if (d.codigo !== CODIGO_SIN_PRECIO) continue
    try {
      const p = JSON.parse(d.detalle) as { articulo?: unknown; acabado?: unknown }
      if (typeof p.articulo === 'string') claves.add(`${p.articulo}|${typeof p.acabado === 'string' ? p.acabado : ''}`)
    } catch { /* diagnóstico ilegible: no aporta clave */ }
  }
  return [...claves]
}

export function construirRegistroValoracion(e: EntradaRegistroValoracion) {
  return {
    evento: 'valoracion',
    operacion: e.operacion,
    presupuestoId: e.presupuestoId,
    lineaId: e.lineaId,
    tipo: e.tipo,
    articulo: e.articulo,
    ...(e.acabadoArticulo ? { acabadoArticulo: e.acabadoArticulo } : {}),
    cantidad: numero(e.cantidad),
    anchoMm: e.anchoMm,
    altoMm: e.altoMm,
    estado: e.pvpManual ? 'PVP_MANUAL' : e.valoracionCompleta ? 'COMPLETA' : 'INCOMPLETA',
    precioUnitario: numero(e.precioUnitario),
    total: numero(e.total),
    ...(e.cerramiento ? { cerramiento: datosCerramiento(e.cerramiento) } : {}),
    ...(e.resultado ? { motor: e.resultado.motor.codigo, tarifa: e.resultado.tarifa } : {}),
    causas: causasValoracion(e.resultado),
    sinPvp: piezasSinPvp(e.resultado),
    aviso: e.aviso ? recortar(e.aviso, 1000) : null,
  }
}
