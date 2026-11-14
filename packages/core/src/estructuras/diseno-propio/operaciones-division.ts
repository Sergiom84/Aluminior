/**
 * Operaciones inmutables de división por travesaños en `Diseño V3`.
 */
import {
  TIPO_COTA, TIPO_NODO, type NodoDiseno, type PosicionTravesano,
} from '../../despiece/diseno-propio/index.ts'
import type { DisenoPropioModulo } from './composicion-visual.ts'
import { normalizarArbolDiseno } from './normalizar.ts'

export function siguienteIdLibre(nodos: readonly NodoDiseno[]): () => number {
  let max = nodos.reduce((m, n) => Math.max(m, n.id), 0)
  return () => ++max
}

export function descendientesDe(nodos: readonly NodoDiseno[], contenedorIds: ReadonlySet<number>): Set<number> {
  const borrar = new Set<number>()
  let cambio = true
  while (cambio) {
    cambio = false
    for (const n of nodos) {
      if (!borrar.has(n.id) && (contenedorIds.has(n.contenidoEn) || borrar.has(n.contenidoEn))) {
        borrar.add(n.id)
        cambio = true
      }
    }
  }
  return borrar
}

export function dividirHuecoDisenoPropio(
  diseno: DisenoPropioModulo,
  regionId: number,
  opciones: { posicion: PosicionTravesano; tipoCota: 0 | 2; huecos?: number; cotaMm?: number },
): DisenoPropioModulo {
  const { nodos } = diseno
  if (nodos.some(n => n.tipo === TIPO_NODO.travesano && n.contenidoEn === regionId)) return diseno

  const numHuecos = opciones.tipoCota === TIPO_COTA.fija
    ? 2 : Math.max(2, Math.min(6, Math.trunc(opciones.huecos ?? 2)))
  const cota = opciones.tipoCota === TIPO_COTA.fija ? Math.max(1, Math.round(opciones.cotaMm ?? 300)) : 0

  const vidrioPrevio = nodos.find(n => n.tipo === TIPO_NODO.vidrio && n.contenidoEn === regionId)?.vidrio ?? null
  const quitar = descendientesDe(nodos, new Set([regionId]))
  const base = nodos.filter(n => !quitar.has(n.id))
  const sig = siguienteIdLibre(base)

  const divId = sig()
  const nuevos: NodoDiseno[] = [...base]
  for (let i = 0; i < numHuecos - 1; i++) {
    const tId = i === 0 ? divId : sig()
    nuevos.push({
      id: tId, tipo: TIPO_NODO.travesano, contenidoEn: regionId,
      posicion: opciones.posicion, division: divId, orden: i + 1,
      tipoCota: opciones.tipoCota, cota, material: 'M', clase: 'V',
    })
  }
  for (let i = 0; i < numHuecos; i++) {
    const hId = sig()
    nuevos.push(
      { id: hId, tipo: TIPO_NODO.hueco, contenidoEn: regionId, division: divId, orden: i + 1 },
      { id: sig(), tipo: TIPO_NODO.vidrio, contenidoEn: hId, vidrio: i === 0 ? vidrioPrevio : null },
    )
  }
  return normalizarArbolDiseno(nuevos)
}

export function actualizarDivisionDisenoPropio(
  diseno: DisenoPropioModulo,
  divisionId: number,
  cambios: { posicion?: PosicionTravesano; tipoCota?: 0 | 2; huecos?: number; cotaMm?: number },
): DisenoPropioModulo {
  const { nodos } = diseno
  const travesanos = nodos
    .filter(n => n.tipo === TIPO_NODO.travesano && !n.invisible && (n.division ?? n.id) === divisionId)
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
  if (travesanos.length === 0) return diseno
  const primero = travesanos[0]!
  const contenedor = primero.contenidoEn
  const posicion = cambios.posicion ?? (primero.posicion ?? 'HB')

  if (primero.tipoCota === TIPO_COTA.variable) {
    const cota = cambios.cotaMm !== undefined ? Math.max(1, Math.round(cambios.cotaMm)) : (primero.cota ?? 300)
    return normalizarArbolDiseno(nodos.map(n => n.id === primero.id ? { ...n, posicion, cota } : n))
  }

  const tipoCota = cambios.tipoCota ?? (primero.tipoCota === TIPO_COTA.fija ? TIPO_COTA.fija : TIPO_COTA.equidistante)
  const claveDiv = primero.division ?? primero.id
  const huecosActuales = nodos
    .filter(n => n.tipo === TIPO_NODO.hueco && n.division === claveDiv)
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
  const numHuecos = tipoCota === TIPO_COTA.fija
    ? 2 : Math.max(2, Math.min(6, Math.trunc(cambios.huecos ?? huecosActuales.length)))
  const cota = tipoCota === TIPO_COTA.fija
    ? Math.max(1, Math.round(cambios.cotaMm ?? (primero.cota && primero.cota > 0 ? primero.cota : 300))) : 0

  const sobrantes = new Set(huecosActuales.slice(numHuecos).map(h => h.id))
  const descSobrantes = descendientesDe(nodos, sobrantes)
  const idsTravsViejos = new Set(travesanos.map(t => t.id))

  const conservados = nodos.filter(n =>
    !idsTravsViejos.has(n.id) && !sobrantes.has(n.id) && !descSobrantes.has(n.id),
  )
  const sig = siguienteIdLibre(conservados)

  const nuevosTravs: NodoDiseno[] = []
  for (let i = 0; i < numHuecos - 1; i++) {
    const tId = i === 0 ? claveDiv : sig()
    nuevosTravs.push({
      id: tId, tipo: TIPO_NODO.travesano, contenidoEn: contenedor,
      posicion, division: claveDiv, orden: i + 1, tipoCota, cota, material: 'M', clase: 'V',
    })
  }
  const nuevosHuecos: NodoDiseno[] = []
  for (let i = huecosActuales.length; i < numHuecos; i++) {
    const hId = sig()
    nuevosHuecos.push(
      { id: hId, tipo: TIPO_NODO.hueco, contenidoEn: contenedor, division: claveDiv, orden: i + 1 },
      { id: sig(), tipo: TIPO_NODO.vidrio, contenidoEn: hId, vidrio: null },
    )
  }
  return normalizarArbolDiseno([...conservados, ...nuevosTravs, ...nuevosHuecos])
}

export function eliminarDivisionDisenoPropio(
  diseno: DisenoPropioModulo,
  divisionId: number,
): DisenoPropioModulo {
  const { nodos } = diseno
  const primero = nodos.find(n => n.tipo === TIPO_NODO.travesano && !n.invisible && (n.division ?? n.id) === divisionId)
  if (!primero) return diseno
  const contenedor = primero.contenidoEn
  const quitar = descendientesDe(nodos, new Set([contenedor]))
  const base = nodos.filter(n => !quitar.has(n.id))
  const sig = siguienteIdLibre(base)
  return normalizarArbolDiseno([...base, { id: sig(), tipo: TIPO_NODO.vidrio, contenidoEn: contenedor, vidrio: null }])
}
