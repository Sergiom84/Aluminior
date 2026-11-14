/**
 * Diseño propio de un elemento del cerramiento (DS4, paso 2): el árbol de
 * nodos de `Diseño V3` persistido en la configuración del módulo (`v3`).
 *
 * A partir de él se obtienen sin I/O:
 *   1. la plantilla de despiece (`generarPlantillaDisenoPropio`), idéntica a
 *      la que guarda Productor en `EstructurasArticulos` (`TipoDoc = VPRES`);
 *   2. la composición visual (`NodoVisual`) con la que el lienzo, la miniatura
 *      y el PDF dibujan el módulo y validan que las cotas caben en sus medidas;
 *   3. las cotas por defecto de los travesaños con cota variable (`FI`, `FS`…),
 *      como las guarda Productor en el árbol cuando el operador cambia `Cota por`
 *      (caso 10 del 260508: `1OFI` con `Cota 500`, `Simbolo FI`).
 */
import {
  generarPlantillaDisenoPropio, TIPO_COTA, TIPO_NODO,
  type NodoDiseno, type PosicionTravesano,
} from '../despiece/diseno-propio/index.ts'
import type { FilaPlantillaCatalogo } from '../despiece/linea-catalogo/tipos.ts'
import type { ConfiguracionCerramiento, ModuloCerramiento } from './cerramiento.ts'
import { composicionExplicita } from './composicion-cerramiento.ts'
import type { AperturaVisual, NodoVisual } from './diseno.ts'
import { resolverGeometriaComposicion } from './geometria-composicion.ts'

export interface DisenoPropioModulo {
  readonly nodos: readonly NodoDiseno[]
}

const POSICIONES_TRAVESANO: ReadonlySet<string> = new Set(['HA', 'HB', 'VI', 'VD'])
const APERTURAS_HOJA_SOLA: Readonly<Record<number, AperturaVisual>> = {
  1: 'abatible-derecha',
  2: 'abatible-izquierda',
  5: 'oscilobatiente-derecha',
  6: 'oscilobatiente-izquierda',
}
const APERTURAS_PAREJA: Readonly<Record<number, readonly [AperturaVisual, AperturaVisual]>> = {
  8: ['abatible-izquierda', 'oscilobatiente-derecha'],
  9: ['oscilobatiente-izquierda', 'abatible-derecha'],
}

const enteroNoNegativo = (v: unknown): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= 0
const enteroDesdeMenosUno = (v: unknown): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= -1
const textoNoVacio = (v: unknown): v is string =>
  typeof v === 'string' && v.trim() !== '' && v === v.trim()

function nodoDisenoJsonValido(v: unknown): v is NodoDiseno {
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

/**
 * Convierte el árbol de `NodoDiseno` (ya validado por el generador de DS4) en
 * `NodoVisual`, aplicando las cotas efectivas del módulo en los travesaños de
 * cota variable para comprobar y dibujar las medidas reales de los huecos.
 */
export function composicionVisualDisenoPropio(
  diseno: DisenoPropioModulo,
  cotasModulo?: Readonly<Record<string, number>> | null,
): NodoVisual | null {
  const { nodos } = diseno
  const ids = nodos.map(n => n.id)
  if (new Set(ids).size !== ids.length) return null
  const generada = generarPlantillaDisenoPropio({ nodos })
  if (!generada.ok) return null
  const raiz = nodos.find(n => n.tipo === TIPO_NODO.marco && n.contenidoEn === -1)
  if (!raiz) return null

  const porContenedor = new Map<number, NodoDiseno[]>()
  for (const n of nodos) {
    if (n.id === raiz.id) continue
    porContenedor.set(n.contenidoEn, [...porContenedor.get(n.contenidoEn) ?? [], n])
  }

  const cotaEfectivaVariable = (trav: NodoDiseno): number | null => {
    const simbolo = trav.simbolo?.trim()
    const deInstancia = simbolo ? cotasModulo?.[simbolo] : undefined
    const valor = typeof deInstancia === 'number' && Number.isFinite(deInstancia) ? deInstancia : trav.cota
    return typeof valor === 'number' && Number.isFinite(valor) && valor > 0 ? valor : null
  }

  const construirRegion = (regionId: number, aperturaPareja?: AperturaVisual, profundidad = 0): NodoVisual | null => {
    if (profundidad > 64) return null
    const hijos = porContenedor.get(regionId) ?? []
    const travesanos = hijos.filter(n => n.tipo === TIPO_NODO.travesano)
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
    if (travesanos.length > 0) {
      const primero = travesanos[0]!
      const pos = primero.posicion as PosicionTravesano | null | undefined
      if (!pos || !POSICIONES_TRAVESANO.has(pos)) return null
      const huecos = hijos.filter(n => n.tipo === TIPO_NODO.hueco && n.division === primero.division)
        .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
      if (huecos.length !== travesanos.length + 1) return null
      const eje = pos.startsWith('H') ? 'horizontal' as const : 'vertical' as const
      const separador = primero.invisible ? 'division-invisible' as const : 'travesano' as const

      // ¿Es la separación invisible de una pareja de hojas (8 o 9)?
      let aperturasHijos: readonly [AperturaVisual, AperturaVisual] | undefined
      if (primero.invisible && huecos.length === 2) {
        const hojasHuecos = huecos.map(h => (porContenedor.get(h.id) ?? []).find(n => n.tipo === TIPO_NODO.hoja))
        if (hojasHuecos[0] && hojasHuecos[1] && hojasHuecos[0].tipoHoja === hojasHuecos[1].tipoHoja) {
          aperturasHijos = APERTURAS_PAREJA[hojasHuecos[0].tipoHoja ?? 0]
        }
      }

      const tipoCota = primero.tipoCota ?? TIPO_COTA.equidistante
      let cotaFija: { desde: 'inicio' | 'fin'; mm: number } | undefined
      if (tipoCota === TIPO_COTA.fija || tipoCota === TIPO_COTA.variable) {
        if (huecos.length !== 2) return null
        const mm = tipoCota === TIPO_COTA.variable ? cotaEfectivaVariable(primero) : (primero.cota ?? 0)
        if (mm === null || !(mm > 0)) return null
        cotaFija = { desde: pos === 'HB' || pos === 'VD' ? 'fin' : 'inicio', mm }
      }

      const nodosHijos: { proporcion: number; nodo: NodoVisual }[] = []
      for (const [i, h] of huecos.entries()) {
        const nodoHijo = construirRegion(h.id, aperturasHijos?.[i as 0 | 1], profundidad + 1)
        if (!nodoHijo) return null
        nodosHijos.push({ proporcion: 1, nodo: nodoHijo })
      }
      return {
        tipo: 'division', id: `division-${primero.id}`, eje, separador,
        ...(cotaFija ? { cotaFija } : {}),
        hijos: nodosHijos,
      }
    }

    const hoja = hijos.find(n => n.tipo === TIPO_NODO.hoja)
    if (hoja) {
      const apertura = aperturaPareja ?? APERTURAS_HOJA_SOLA[hoja.tipoHoja ?? 0]
      if (!apertura) return null
      return { tipo: 'hueco', id: `nodo-${hoja.id}`, apertura }
    }
    const vidrio = hijos.find(n => n.tipo === TIPO_NODO.vidrio)
    return { tipo: 'hueco', id: `nodo-${vidrio?.id ?? regionId}`, apertura: 'fijo' }
  }

  return construirRegion(raiz.id)
}

/**
 * Valida el diseño propio de un módulo: estructura JSON, identificadores únicos,
 * soporte demostrado por `generarPlantillaDisenoPropio` y cotas físicas que
 * caben en `anchoMm × altoMm` (incluidas las cotas de instancia del módulo).
 */
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
  const ids = d.nodos.map(n => n.id)
  if (new Set(ids).size !== ids.length) return false
  const plantilla = generarPlantillaDisenoPropio({ nodos: d.nodos })
  if (!plantilla.ok) return false
  const composicion = composicionVisualDisenoPropio({ nodos: d.nodos }, cotasModulo)
  if (!composicion) return false
  return resolverGeometriaComposicion(composicion, anchoMm, altoMm).valido
}

/** Plantilla de despiece generada para el módulo, o `null` si no lleva diseño propio. */
export function plantillaDisenoPropioModulo(
  modulo: Pick<ModuloCerramiento, 'disenoPropio'>,
): readonly FilaPlantillaCatalogo[] | null {
  if (!modulo.disenoPropio) return null
  const r = generarPlantillaDisenoPropio({ nodos: modulo.disenoPropio.nodos })
  return r.ok ? r.filas : null
}

/** Cotas variables (`TipoCota = 1`) declaradas en los travesaños del diseño propio. */
export function cotasDisenoPropioModulo(
  modulo: Pick<ModuloCerramiento, 'disenoPropio'>,
): Readonly<Record<string, number>> {
  const cotas: Record<string, number> = {}
  if (!modulo.disenoPropio) return cotas
  for (const n of modulo.disenoPropio.nodos) {
    if (n.tipo === TIPO_NODO.travesano && n.tipoCota === TIPO_COTA.variable &&
      n.simbolo?.trim() && typeof n.cota === 'number' && Number.isFinite(n.cota) && n.cota > 0) {
      cotas[n.simbolo.trim()] = n.cota
    }
  }
  return cotas
}

/**
 * Asigna o quita (`null`) el diseño propio de un módulo. Promueve la
 * configuración a `v3` cuando se guarda un diseño propio, y no aplica el cambio
 * si el diseño no es soportado por DS4 o sus cotas no caben en las medidas del módulo.
 */
export function actualizarDisenoPropioModuloCerramiento(
  configuracion: ConfiguracionCerramiento,
  id: string,
  disenoPropio: DisenoPropioModulo | null,
): ConfiguracionCerramiento {
  const actual = configuracion.modulos.find(m => m.id === id)
  if (!actual) return configuracion
  if (disenoPropio === null) {
    if (!Object.hasOwn(actual, 'disenoPropio')) return configuracion
    return {
      ...configuracion,
      modulos: configuracion.modulos.map(m => {
        if (m.id !== id) return m
        const { disenoPropio: _quitar, ...resto } = m
        return resto
      }),
    }
  }
  const cotas: Record<string, number> = {}
  if (typeof actual.fiMm === 'number' && Number.isFinite(actual.fiMm)) cotas.FI = actual.fiMm
  if (actual.cotas) {
    for (const [k, v] of Object.entries(actual.cotas)) {
      if (typeof v === 'number' && Number.isFinite(v)) cotas[k] = v
    }
  }
  if (!disenoPropioModuloValido(disenoPropio, actual.anchoMm, actual.altoMm, cotas)) {
    return configuracion
  }
  const base = composicionExplicita(configuracion)
  const copia: DisenoPropioModulo = {
    nodos: disenoPropio.nodos.map(n => ({
      ...n,
      ...(n.cortes ? { cortes: [...n.cortes] } : {}),
      ...(n.accesorios ? { accesorios: [...n.accesorios] } : {}),
    })),
  }
  return {
    ...base,
    modulos: base.modulos.map(m => m.id === id ? { ...m, disenoPropio: copia } : m),
  }
}
