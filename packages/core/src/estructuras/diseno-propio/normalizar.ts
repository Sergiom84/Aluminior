/**
 * Normalización canónica del árbol `NodoDiseno[]` para el editor `Diseño V3`:
 * marco raíz (`0`), divisiones en anchura (`travesano`s seguidos de sus
 * `hueco`s), `hoja`s por hueco y `vidrio`s (con su `barrotillo` detrás) en el
 * orden de los huecos finales, igual que escribe Productor en `EstructurasDiseño`.
 */
import { TIPO_NODO, type NodoDiseno } from '../../despiece/diseno-propio/index.ts'
import type { DisenoPropioModulo } from './composicion-visual.ts'

export function normalizarArbolDiseno(nodosEntrada: readonly NodoDiseno[]): DisenoPropioModulo {
  const raiz = nodosEntrada.find(n => n.tipo === TIPO_NODO.marco) ?? {
    id: 0, tipo: TIPO_NODO.marco, contenidoEn: -1, tipoMarco: 'NOR', cortes: [1, 1, 1, 1],
  }
  const porDivision = new Map<number, { travesanos: NodoDiseno[]; huecos: NodoDiseno[] }>()
  for (const n of nodosEntrada) {
    if (n.tipo === TIPO_NODO.travesano) {
      const clave = n.division ?? n.id
      const grupo = porDivision.get(clave) ?? { travesanos: [], huecos: [] }
      grupo.travesanos.push(n)
      porDivision.set(clave, grupo)
    } else if (n.tipo === TIPO_NODO.hueco) {
      const clave = n.division ?? -1
      const grupo = porDivision.get(clave) ?? { travesanos: [], huecos: [] }
      grupo.huecos.push(n)
      porDivision.set(clave, grupo)
    }
  }
  const divPorContenedor = new Map<number, { travesanos: NodoDiseno[]; huecos: NodoDiseno[] }>()
  for (const [, grupo] of porDivision) {
    if (!grupo.travesanos.length) continue
    grupo.travesanos.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
    grupo.huecos.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
    divPorContenedor.set(grupo.travesanos[0]!.contenidoEn, grupo)
  }

  const mapaId = new Map<number, number>()
  const salida: NodoDiseno[] = []
  const emitir = (nodo: NodoDiseno): number => {
    const nuevoId = salida.length
    mapaId.set(nodo.id, nuevoId)
    salida.push({ ...nodo, id: nuevoId })
    return nuevoId
  }

  emitir({ ...raiz, contenidoEn: -1, tipoMarco: raiz.tipoMarco ?? 'NOR', cortes: [...(raiz.cortes ?? [1, 1, 1, 1])] })

  const colaRegiones: number[] = [raiz.id]
  const regionesFinalesAntiguas: number[] = []
  while (colaRegiones.length > 0) {
    const regAntigua = colaRegiones.shift()!
    const div = divPorContenedor.get(regAntigua)
    if (!div) {
      regionesFinalesAntiguas.push(regAntigua)
      continue
    }
    const contenedorNuevo = mapaId.get(regAntigua)!
    let idDivisionNuevo = -1
    div.travesanos.forEach((t, idx) => {
      const creado = emitir({
        ...t,
        contenidoEn: contenedorNuevo,
        orden: idx + 1,
        division: idDivisionNuevo === -1 ? salida.length : idDivisionNuevo,
      })
      if (idx === 0) idDivisionNuevo = creado
    })
    div.huecos.forEach((h, idx) => {
      emitir({ ...h, contenidoEn: contenedorNuevo, division: idDivisionNuevo, orden: idx + 1 })
      colaRegiones.push(h.id)
    })
  }

  const hojaAntiguaPorRegion = new Map<number, NodoDiseno>()
  for (const regAntigua of regionesFinalesAntiguas) {
    const hoja = nodosEntrada.find(n => n.tipo === TIPO_NODO.hoja && n.contenidoEn === regAntigua)
    if (hoja) {
      hojaAntiguaPorRegion.set(regAntigua, hoja)
      emitir({
        ...hoja,
        contenidoEn: mapaId.get(regAntigua)!,
        cortes: [...(hoja.cortes ?? [1, 1, 1, 1])],
        ...(hoja.accesorios ? { accesorios: [...hoja.accesorios] } : {}),
      })
    }
  }

  for (const regAntigua of regionesFinalesAntiguas) {
    const hojaAntigua = hojaAntiguaPorRegion.get(regAntigua)
    const contenedorAntiguo = hojaAntigua ? hojaAntigua.id : regAntigua
    const contenedorNuevo = mapaId.get(contenedorAntiguo)!
    const vidrio = nodosEntrada.find(n => n.tipo === TIPO_NODO.vidrio && n.contenidoEn === contenedorAntiguo)
    const idVidrioNuevo = emitir({
      id: vidrio?.id ?? -1,
      tipo: TIPO_NODO.vidrio,
      contenidoEn: contenedorNuevo,
      vidrio: vidrio?.vidrio?.trim() || null,
    })
    if (vidrio) {
      for (const b of nodosEntrada.filter(n => n.tipo === TIPO_NODO.barrotillo && n.contenidoEn === vidrio.id)) {
        const h = b.horizontales ?? 0, v = b.verticales ?? 0
        if (h > 0 || v > 0) {
          emitir({
            id: b.id, tipo: TIPO_NODO.barrotillo, contenidoEn: idVidrioNuevo,
            articulo: b.articulo?.trim() || 'BI', horizontales: h, verticales: v,
          })
        }
      }
    }
  }

  return { nodos: salida }
}
