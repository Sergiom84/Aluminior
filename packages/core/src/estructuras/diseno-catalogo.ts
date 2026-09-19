import type { AperturaVisual, NodoVisual, PlantillaDiseno } from './diseno.ts'

/** Entrada de catálogo normalizada; nunca contiene instancias de documentos. */
export interface NodoCatalogo {
  id: number
  tipo: number
  padre: number
  division: number
  posicion: number
  travesano: string
  invisible: boolean
  hoja: number
  numeroHoja: number
  tipoCota: number
  cota: number
  equidistantes: number
  marco: string
  variantes: readonly string[]
}

export interface EstructuraCatalogo {
  codigo: string
  descripcion: string
  familiaCodigo: string
  anchoMm: number
  altoMm: number
  nodos: readonly NodoCatalogo[]
}

export type ResultadoPlantilla =
  | { estado: 'dibujable'; plantilla: PlantillaDiseno; familiaCodigo: string }
  | { estado: 'pendiente'; motivos: readonly string[] }

function apertura(nodo: NodoCatalogo): AperturaVisual | null {
  if (nodo.hoja === 5) return 'oscilobatiente-derecha'
  if (nodo.hoja === 6) return 'oscilobatiente-izquierda'
  // Pares experimentales: etiquetas físicas con bisagras exteriores. La
  // presencia de manilla no se infiere aquí porque aún no está observada.
  if ([7, 8].includes(nodo.hoja) && nodo.numeroHoja === 1) return 'abatible-izquierda'
  if (nodo.hoja === 7 && nodo.numeroHoja === 2) return 'abatible-derecha'
  if (nodo.hoja === 8 && nodo.numeroHoja === 2) return 'oscilobatiente-derecha'
  return null
}

/** Candidata a medida inicial, NO validada para redimensionar ni valorar.
 * TipoCota=1 se proyecta a proporción: falta mantener cotas absolutas al editar.
 */
export function generarPlantillaCatalogo(entrada: EstructuraCatalogo): ResultadoPlantilla {
  const motivos = new Set<string>()
  const { nodos } = entrada
  if (!['003', '005', '020'].includes(entrada.familiaCodigo)) motivos.add('familia sin verificar')
  if (![entrada.anchoMm, entrada.altoMm].every(n => Number.isFinite(n) && n > 0)) {
    motivos.add('medidas no válidas')
  }
  if (!nodos.length) motivos.add('sin árbol de diseño')
  if (new Set(nodos.map(n => n.id)).size !== nodos.length) motivos.add('identificadores duplicados')
  for (const nodo of nodos) {
    if (![nodo.id, nodo.tipo, nodo.padre, nodo.division, nodo.posicion, nodo.hoja,
      nodo.numeroHoja, nodo.tipoCota, nodo.equidistantes].every(Number.isInteger) ||
      !Number.isFinite(nodo.cota)) motivos.add('nodo con campos numéricos inválidos')
    if (![1, 2, 3, 5, 6].includes(nodo.tipo)) motivos.add(`tipo de nodo ${nodo.tipo}`)
    if (nodo.tipo === 3 && !apertura(nodo)) motivos.add(`tipo de hoja ${nodo.hoja}/${nodo.numeroHoja}`)
    for (const variante of nodo.variantes) motivos.add(`variante ${variante}`)
    if (nodo.tipo === 1 && nodo.marco !== 'NOR') motivos.add(`marco ${nodo.marco || 'vacío'}`)
    if (nodo.tipo === 6 && !['HA', 'HB', 'VI', 'VD'].includes(nodo.travesano)) {
      motivos.add(`travesaño ${nodo.travesano || 'vacío'}`)
    }
  }
  const raices = nodos.filter(n => n.tipo === 1 && n.padre === -1)
  if (raices.length !== 1) motivos.add('marco raíz no único')
  if (motivos.size) return { estado: 'pendiente', motivos: [...motivos].sort() }
  const vistos = new Set<number>()
  const fallar = (motivo: string): never => { throw new Error(motivo) }
  const visitar = (nodo: NodoCatalogo, ancho: number, alto: number, profundidad = 0): NodoVisual => {
    if (profundidad > 64) return fallar('profundidad de diseño excesiva')
    if (vistos.has(nodo.id)) return fallar('ciclo o nodo compartido')
    vistos.add(nodo.id)
    const hijos = nodos.filter(n => n.padre === nodo.id)
    if (nodo.tipo === 5) {
      if (hijos.length) return fallar('vidrio con descendientes')
      return { tipo: 'hueco', id: `nodo-${nodo.id}`, apertura: 'fijo' }
    }
    if (nodo.tipo === 3) {
      if (hijos.length !== 1 || hijos[0].tipo !== 5) return fallar('hoja con superficie no simple')
      visitar(hijos[0], ancho, alto, profundidad + 1)
      return { tipo: 'hueco', id: `nodo-${nodo.id}`, apertura: apertura(nodo)! }
    }
    const divisiones = hijos.filter(n => n.tipo === 6)
    if (!divisiones.length) {
      if (hijos.length !== 1) return fallar('contenido sin división no único')
      return visitar(hijos[0], ancho, alto, profundidad + 1)
    }
    const trav = divisiones[0]
    const huecos = hijos.filter(n => n.tipo === 2).sort((a, b) => a.posicion - b.posicion)
    if (hijos.length !== divisiones.length + huecos.length ||
        huecos.length !== divisiones.length + 1 ||
        huecos.some((n, i) => n.posicion !== i + 1 || n.division !== trav.division) ||
        divisiones.some(n => n.division !== trav.division || n.travesano !== trav.travesano || n.invisible !== trav.invisible ||
          n.tipoCota !== trav.tipoCota || n.cota !== trav.cota || n.equidistantes !== trav.equidistantes)) {
      return fallar('división no regular')
    }
    divisiones.forEach(n => vistos.add(n.id))
    const eje = trav.travesano.startsWith('H') ? 'horizontal' : 'vertical'
    const longitud = eje === 'horizontal' ? alto : ancho
    let medidas: number[]
    if (trav.tipoCota === 0 && trav.cota === 0 && trav.equidistantes === huecos.length) {
      medidas = huecos.map(() => longitud / huecos.length)
    } else if (trav.tipoCota === 1 && huecos.length === 2 && trav.cota > 0 && trav.cota < longitud) {
      medidas = ['HB', 'VD'].includes(trav.travesano)
        ? [longitud - trav.cota, trav.cota] : [trav.cota, longitud - trav.cota]
    } else return fallar('regla de cota sin verificar')
    return {
      tipo: 'division', id: `division-${trav.id}`, eje,
      separador: trav.invisible ? 'division-invisible' : 'travesano',
      hijos: huecos.map((h, i) => ({ proporcion: medidas[i], nodo: visitar(h,
        eje === 'vertical' ? medidas[i] : ancho, eje === 'horizontal' ? medidas[i] : alto, profundidad + 1) })),
    }
  }
  try {
    const composicion = visitar(raices[0], entrada.anchoMm, entrada.altoMm)
    if (vistos.size !== nodos.length) return { estado: 'pendiente', motivos: ['nodos huérfanos'] }
    return {
      estado: 'dibujable', familiaCodigo: entrada.familiaCodigo,
      plantilla: { codigo: entrada.codigo, descripcion: entrada.descripcion, familiaCodigo: entrada.familiaCodigo,
        familia: entrada.familiaCodigo === '005' ? 'FIJOS' :
          entrada.familiaCodigo === '020' ? 'OSCILOBATIENTES' : 'VENTANAS ABATIBLES',
        anchoMm: entrada.anchoMm, altoMm: entrada.altoMm, composicion },
    }
  } catch (error) {
    return { estado: 'pendiente', motivos: [error instanceof Error ? error.message : 'árbol inválido'] }
  }
}
