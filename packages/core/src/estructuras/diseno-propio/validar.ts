/**
 * Validación sin I/O del árbol de `Diseño V3` persistido en un módulo (`v3`).
 * Exige estructura JSON limpia, soporte demostrado en `generarPlantillaDisenoPropio`
 * y cotas físicas que quepan dentro de `anchoMm × altoMm` con las cotas de la línea.
 */
import {
  generarPlantillaDisenoPropio, TIPO_COTA, TIPO_NODO, type NodoDiseno,
} from '../../despiece/diseno-propio/index.ts'
import { resolverGeometriaComposicion } from '../geometria-composicion.ts'
import { composicionVisualDisenoPropio, type DisenoPropioModulo } from './composicion-visual.ts'

const POSICIONES_TRAVESANO: ReadonlySet<string> = new Set(['HA', 'HB', 'VI', 'VD'])

const enteroNoNegativo = (v: unknown): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= 0
const enteroDesdeMenosUno = (v: unknown): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= -1
const textoNoVacio = (v: unknown): v is string =>
  typeof v === 'string' && v.trim() !== '' && v === v.trim()

export function nodoDisenoJsonValido(v: unknown): v is NodoDiseno {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return false
  const n = v as Partial<NodoDiseno>
  if (!enteroNoNegativo(n.id) || !enteroNoNegativo(n.tipo) || !enteroDesdeMenosUno(n.contenidoEn)) return false
  if (n.tipoMarco !== undefined && n.tipoMarco !== null && !textoNoVacio(n.tipoMarco)) return false
  if (n.cortes !== undefined && (!Array.isArray(n.cortes) || n.cortes.length !== 4 ||
    n.cortes.some(c => !enteroNoNegativo(c) || (n.tipo === TIPO_NODO.marco || n.tipo === TIPO_NODO.hoja ? c !== 1 && c !== 2 : false)))) return false
  if (n.curva !== undefined && !enteroNoNegativo(n.curva)) return false
  if (n.posicion !== undefined && n.posicion !== null &&
    (typeof n.posicion !== 'string' || !POSICIONES_TRAVESANO.has(n.posicion))) return false
  if (n.division !== undefined && !enteroDesdeMenosUno(n.division)) return false
  if (n.orden !== undefined && !enteroDesdeMenosUno(n.orden)) return false
  if (n.tipoCota !== undefined && n.tipoCota !== TIPO_COTA.equidistante &&
    n.tipoCota !== TIPO_COTA.variable && n.tipoCota !== TIPO_COTA.fija) return false
  if (n.cota !== undefined && (typeof n.cota !== 'number' || !Number.isFinite(n.cota) || n.cota < 0)) return false
  if (n.simbolo !== undefined && n.simbolo !== null && !textoNoVacio(n.simbolo)) return false
  if (n.material !== undefined && n.material !== null && !textoNoVacio(n.material)) return false
  if (n.clase !== undefined && n.clase !== null && !textoNoVacio(n.clase)) return false
  if (n.invisible !== undefined && typeof n.invisible !== 'boolean') return false
  if (n.tipoHoja !== undefined && !enteroNoNegativo(n.tipoHoja)) return false
  if (n.vierteaguas !== undefined && typeof n.vierteaguas !== 'boolean') return false
  if (n.accesorios !== undefined && (!Array.isArray(n.accesorios) || n.accesorios.some(a => !textoNoVacio(a)))) return false
  if (n.aperturaExterior !== undefined && typeof n.aperturaExterior !== 'boolean') return false
  if (n.hojaInferior !== undefined && typeof n.hojaInferior !== 'boolean') return false
  if (n.vidrio !== undefined && n.vidrio !== null && !textoNoVacio(n.vidrio)) return false
  if (n.articulo !== undefined && n.articulo !== null && !textoNoVacio(n.articulo)) return false
  if (n.horizontales !== undefined && !enteroNoNegativo(n.horizontales)) return false
  if (n.verticales !== undefined && !enteroNoNegativo(n.verticales)) return false
  if (n.tipo === TIPO_NODO.travesano && n.tipoCota === TIPO_COTA.fija &&
    (typeof n.cota !== 'number' || !(n.cota > 0))) return false
  if (n.tipo === TIPO_NODO.travesano && n.tipoCota === TIPO_COTA.variable &&
    (!textoNoVacio(n.simbolo) || (n.cota !== undefined && !(n.cota > 0)))) return false
  if (n.tipo === TIPO_NODO.barrotillo && (!textoNoVacio(n.articulo) ||
    ((n.horizontales ?? 0) === 0 && (n.verticales ?? 0) === 0))) return false
  return true
}

export function disenoPropioModuloValido(
  valor: unknown,
  anchoMm: number,
  altoMm: number,
  cotasModulo?: Readonly<Record<string, number>> | null,
): valor is DisenoPropioModulo | undefined {
  if (valor === undefined) return true
  if (!valor || typeof valor !== 'object' || Array.isArray(valor)) return false
  const d = valor as Partial<DisenoPropioModulo>
  if (!Array.isArray(d.nodos) || d.nodos.length === 0 || !d.nodos.every(nodoDisenoJsonValido)) return false
  if (new Set(d.nodos.map(n => n.id)).size !== d.nodos.length) return false
  if (!generarPlantillaDisenoPropio({ nodos: d.nodos }).ok) return false
  const composicion = composicionVisualDisenoPropio({ nodos: d.nodos }, cotasModulo)
  if (!composicion) return false
  return resolverGeometriaComposicion(composicion, anchoMm, altoMm).valido
}
