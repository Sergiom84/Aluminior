/**
 * Sembrado del árbol `NodoDiseno[]` editable a partir de un módulo de catálogo
 * cuando aún no lleva `disenoPropio` persistido.
 */
import {
  generarPlantillaDisenoPropio, TIPO_COTA, TIPO_NODO,
  type NodoDiseno, type PosicionTravesano,
} from '../../despiece/diseno-propio/index.ts'
import type { ModuloCerramiento } from '../cerramiento.ts'
import { plantillaDiseno, type AperturaVisual, type NodoVisual } from '../diseno.ts'
import type { DisenoPropioModulo } from './composicion-visual.ts'
import { normalizarArbolDiseno } from './normalizar.ts'

export { normalizarArbolDiseno }

const TIPO_HOJA_POR_APERTURA: Partial<Record<AperturaVisual, 1 | 2 | 5 | 6>> = {
  'abatible-derecha': 1,
  'abatible-izquierda': 2,
  'oscilobatiente-derecha': 5,
  'oscilobatiente-izquierda': 6,
}

function tipoParejaVisual(izquierda: AperturaVisual, derecha: AperturaVisual): 8 | 9 | null {
  if (izquierda === 'abatible-izquierda' && derecha === 'oscilobatiente-derecha') return 8
  if (izquierda === 'oscilobatiente-izquierda' && derecha === 'abatible-derecha') return 9
  return null
}

function sembrarDesdeNodoVisual(composicion: NodoVisual): DisenoPropioModulo | null {
  const crudos: NodoDiseno[] = [
    { id: 0, tipo: TIPO_NODO.marco, contenidoEn: -1, tipoMarco: 'NOR', cortes: [1, 1, 1, 1] },
  ]
  let secuencia = 1
  const sig = () => secuencia++

  const poblar = (nodo: NodoVisual, contenedorId: number): boolean => {
    if (nodo.tipo === 'hueco') {
      if (nodo.apertura === 'fijo') {
        const vidId = sig()
        crudos.push({ id: vidId, tipo: TIPO_NODO.vidrio, contenidoEn: contenedorId, vidrio: null })
        if (nodo.barrotillo) {
          crudos.push({
            id: sig(), tipo: TIPO_NODO.barrotillo, contenidoEn: vidId, articulo: 'BI',
            horizontales: nodo.barrotillo.horizontales, verticales: nodo.barrotillo.verticales,
          })
        }
        return true
      }
      const tipoHoja = TIPO_HOJA_POR_APERTURA[nodo.apertura]
      if (!tipoHoja) return false
      const hojaId = sig()
      crudos.push(
        { id: hojaId, tipo: TIPO_NODO.hoja, contenidoEn: contenedorId, tipoHoja, clase: 'V', vierteaguas: true, cortes: [1, 1, 1, 1], accesorios: (nodo.manilla ?? true) ? ['MI'] : [] },
        { id: sig(), tipo: TIPO_NODO.vidrio, contenidoEn: hojaId, vidrio: null },
      )
      return true
    }

    if (nodo.separador === 'union' || nodo.hijos.length < 2) return false
    if (nodo.separador === 'division-invisible') {
      if (nodo.eje !== 'vertical' || nodo.hijos.length !== 2) return false
      const h0 = nodo.hijos[0]!.nodo, h1 = nodo.hijos[1]!.nodo
      if (h0.tipo !== 'hueco' || h1.tipo !== 'hueco') return false
      const pareja = tipoParejaVisual(h0.apertura, h1.apertura)
      if (!pareja) return false
      const divId = sig(), huecoIzq = sig(), huecoDer = sig()
      crudos.push(
        { id: divId, tipo: TIPO_NODO.travesano, contenidoEn: contenedorId, posicion: 'VI', division: divId, orden: 1, tipoCota: TIPO_COTA.equidistante, material: 'M', clase: null, invisible: true },
        { id: huecoIzq, tipo: TIPO_NODO.hueco, contenidoEn: contenedorId, division: divId, orden: 1 },
        { id: huecoDer, tipo: TIPO_NODO.hueco, contenidoEn: contenedorId, division: divId, orden: 2 },
      )
      for (const [idx, h] of [h0, h1].entries()) {
        const hojaId = sig()
        const manilla = h.manilla ?? (pareja === 8 ? idx === 1 : idx === 0)
        crudos.push(
          { id: hojaId, tipo: TIPO_NODO.hoja, contenidoEn: idx === 0 ? huecoIzq : huecoDer, tipoHoja: pareja, clase: 'V', vierteaguas: true, cortes: [1, 1, 1, 1], accesorios: manilla ? ['MI'] : [] },
          { id: sig(), tipo: TIPO_NODO.vidrio, contenidoEn: hojaId, vidrio: null },
        )
      }
      return true
    }

    const tieneCota = Boolean(nodo.cotaFija)
    if (!tieneCota) {
      const primeraProp = nodo.hijos[0]!.proporcion
      if (nodo.hijos.some(h => h.proporcion !== primeraProp)) return false
    } else if (nodo.hijos.length !== 2) return false

    const posicion: PosicionTravesano = nodo.eje === 'horizontal'
      ? (nodo.cotaFija?.desde === 'fin' ? 'HB' : 'HA')
      : (nodo.cotaFija?.desde === 'fin' ? 'VD' : 'VI')
    const divId = sig()
    for (let i = 0; i < nodo.hijos.length - 1; i++) {
      const tId = i === 0 ? divId : sig()
      crudos.push({
        id: tId, tipo: TIPO_NODO.travesano, contenidoEn: contenedorId, posicion,
        division: divId, orden: i + 1,
        tipoCota: tieneCota ? TIPO_COTA.fija : TIPO_COTA.equidistante,
        cota: tieneCota ? nodo.cotaFija!.mm : 0,
        material: 'M', clase: 'V',
      })
    }
    const huecosIds = nodo.hijos.map((_, i) => {
      const hId = sig()
      crudos.push({ id: hId, tipo: TIPO_NODO.hueco, contenidoEn: contenedorId, division: divId, orden: i + 1 })
      return hId
    })
    return nodo.hijos.every((h, i) => poblar(h.nodo, huecosIds[i]!))
  }

  if (!poblar(composicion, 0)) return null
  const normalizado = normalizarArbolDiseno(crudos)
  return generarPlantillaDisenoPropio({ nodos: normalizado.nodos }).ok ? normalizado : null
}

export function sembrarDisenoPropioModulo(modulo: ModuloCerramiento): DisenoPropioModulo | null {
  if (modulo.disenoPropio) {
    return {
      nodos: modulo.disenoPropio.nodos.map(n => ({
        ...n,
        ...(n.cortes ? { cortes: [...n.cortes] } : {}),
        ...(n.accesorios ? { accesorios: [...n.accesorios] } : {}),
      })),
    }
  }
  const plantilla = plantillaDiseno(modulo.estructuraCodigo)
  if (!plantilla) return null
  if (plantilla.codigo === '1OFI') {
    const fiMm = typeof modulo.fiMm === 'number' && Number.isFinite(modulo.fiMm) ? modulo.fiMm : 300
    return normalizarArbolDiseno([
      { id: 0, tipo: TIPO_NODO.marco, contenidoEn: -1, tipoMarco: 'NOR', cortes: [1, 1, 1, 1] },
      { id: 1, tipo: TIPO_NODO.travesano, contenidoEn: 0, posicion: 'HB', division: 1, orden: 1, tipoCota: TIPO_COTA.variable, cota: fiMm, simbolo: 'FI', material: 'M', clase: 'V' },
      { id: 2, tipo: TIPO_NODO.hueco, contenidoEn: 0, division: 1, orden: 1 },
      { id: 3, tipo: TIPO_NODO.hueco, contenidoEn: 0, division: 1, orden: 2 },
      { id: 4, tipo: TIPO_NODO.hoja, contenidoEn: 2, tipoHoja: 6, clase: 'V', vierteaguas: true, cortes: [1, 1, 1, 1], accesorios: ['MI'] },
      { id: 5, tipo: TIPO_NODO.vidrio, contenidoEn: 4, vidrio: null },
      { id: 6, tipo: TIPO_NODO.vidrio, contenidoEn: 3, vidrio: null },
    ])
  }
  return sembrarDesdeNodoVisual(plantilla.composicion)
}
