/**
 * Regiones de un diseño propio: el marco y cada hueco que dejan los
 * travesaños, con su medida como fórmula de `L` y `A` y el perfil que tienen
 * a cada lado. De aquí salen las fórmulas y los grupos de la plantilla.
 */
import { TIPO_COTA, TIPO_NODO, type NodoDiseno, type PosicionTravesano } from './tipos.ts'

/** Grupo de plantilla del perfil vecino: marco vertical, marco horizontal o travesaño. */
export type Vecino = 'MV' | 'MH' | 'TMP'

export interface Region {
  largo: string
  ancho: string
  izquierda: Vecino
  derecha: Vecino
  superior: Vecino
  inferior: Vecino
}

/** Travesaños que parten una misma región y los huecos que dejan, ya ordenados. */
export interface Division {
  contenidaEn: number
  horizontal: boolean
  /** Separación entre las hojas de un conjunto: no hay travesaño que cortar ni que apoyar. */
  invisible: boolean
  travesanos: NodoDiseno[]
  huecos: NodoDiseno[]
  /** Región que parte; presente cuando la división está resuelta. */
  region: Region
}

export class DisenoNoSoportado extends Error {}

const esHorizontal = (p: PosicionTravesano) => p === 'HA' || p === 'HB'

/** Medida de cada hueco de la división sobre el eje que parte. */
function medidas(eje: string, travesanos: readonly NodoDiseno[], huecos: number): string[] {
  const primero = travesanos[0]!
  if ((primero.tipoCota ?? 0) === TIPO_COTA.equidistante) return Array.from({ length: huecos }, () => `(${eje})/${huecos}`)
  if (travesanos.length !== 1) throw new DisenoNoSoportado('varios travesaños acotados en la misma división')
  // La cota variable entra en la fórmula con su símbolo; la fija, con su medida.
  const variable = primero.tipoCota === TIPO_COTA.variable
  if (variable && !primero.simbolo?.trim()) throw new DisenoNoSoportado('cota variable sin símbolo')
  const cota = variable ? primero.simbolo!.trim() : String(primero.cota ?? 0), resto = `${eje}-${cota}`
  // `HA` y `VI` fijan el primer hueco (arriba, izquierda); `HB` y `VD`, el último.
  return primero.posicion === 'HA' || primero.posicion === 'VI' ? [cota, resto] : [resto, cota]
}

export interface RegionesDiseno {
  /** Región por id de nodo: la raíz y cada hueco. */
  regiones: Map<number, Region>
  /** División por `idTrav`. */
  divisiones: Map<number, Division>
  /** Ids de región que contienen una división: no son hueco final. */
  divididas: Set<number>
}

export function resolverRegiones(nodos: readonly NodoDiseno[], raiz: NodoDiseno): RegionesDiseno {
  const pendientes = new Map<number, Omit<Division, 'region'>>()
  for (const n of nodos) {
    if (n.tipo !== TIPO_NODO.travesano) continue
    if (!n.posicion) throw new DisenoNoSoportado('travesaño sin posición')
    const d = pendientes.get(n.division ?? n.id) ?? { contenidaEn: n.contenidoEn, horizontal: esHorizontal(n.posicion), invisible: n.invisible === true, travesanos: [], huecos: [] }
    d.travesanos.push(n)
    pendientes.set(n.division ?? n.id, d)
  }
  for (const n of nodos) {
    if (n.tipo !== TIPO_NODO.hueco) continue
    const d = pendientes.get(n.division ?? -1)
    if (!d) throw new DisenoNoSoportado('hueco sin travesaño')
    d.huecos.push(n)
  }
  const regiones = new Map<number, Region>([[raiz.id, { largo: 'L', ancho: 'A', izquierda: 'MV', derecha: 'MV', superior: 'MH', inferior: 'MH' }]])
  const divisiones = new Map<number, Division>()
  while (pendientes.size > 0) {
    const antes = pendientes.size
    for (const [clave, d] of pendientes) {
      const region = regiones.get(d.contenidaEn)
      if (!region) continue
      d.travesanos.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
      d.huecos.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
      if (d.huecos.length !== d.travesanos.length + 1) throw new DisenoNoSoportado('división con huecos incompletos')
      const m = medidas(d.horizontal ? region.largo : region.ancho, d.travesanos, d.huecos.length)
      d.huecos.forEach((h, i) => {
        // Al otro lado de una separación invisible sigue estando el perfil del contenedor.
        const primero = d.invisible || i === 0, ultimo = d.invisible || i === d.huecos.length - 1
        regiones.set(h.id, d.horizontal
          ? { ...region, largo: m[i]!, superior: primero ? region.superior : 'TMP', inferior: ultimo ? region.inferior : 'TMP' }
          : { ...region, ancho: m[i]!, izquierda: primero ? region.izquierda : 'TMP', derecha: ultimo ? region.derecha : 'TMP' })
      })
      divisiones.set(clave, { ...d, region })
      pendientes.delete(clave)
    }
    if (pendientes.size === antes) throw new DisenoNoSoportado('travesaño fuera de un hueco del diseño')
  }
  return { regiones, divisiones, divididas: new Set([...divisiones.values()].map(d => d.contenidaEn)) }
}
