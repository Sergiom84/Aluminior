/**
 * Plantilla de despiece de un diseño propio, como la que Productor guarda en
 * `EstructurasArticulos` (`TipoDoc = VPRES`) al aceptar `Diseño V3`.
 *
 * Alcance demostrado contra el catálogo y los documentos reales: marco normal
 * recto con travesaños de marco (equidistantes o a cota fija, anidados),
 * vidrio por hueco, barrotillo interior y una hoja abatible u oscilobatiente
 * en el marco o en un hueco. Lo demás se devuelve como no soportado: nunca se
 * inventa una plantilla.
 */
import type { FilaPlantillaCatalogo } from '../linea-catalogo/tipos.ts'
import { ARTICULO_ESCUADRA, REFERENCIA, SIN_APOYO, crearEmisor, sobreReferencia, type Emisor } from './emisor.ts'
import { emitirHoja, type FilasHoja } from './hoja.ts'
import { DisenoNoSoportado, resolverRegiones, type Division, type Region } from './regiones.ts'
import { TIPO_NODO, type EntradaDisenoPropio, type NodoDiseno, type PlantillaDisenoPropio } from './tipos.ts'

/** Ranuras genéricas de la plantilla; la serie las resuelve a su artículo. */
const ARTICULO = { marcoVertical: '1', marcoSuperior: '2', marcoInferior: '3', vidrio: '8', travesano: '11', final: '62' } as const
/** Módulos de mano de obra de las filas `infMOmof` (`DisVidrio`). */
const MODULO_MO = { marco: '1', acristalar: '18', hueco: '41' } as const

function comprobarAlcance(entrada: EntradaDisenoPropio): NodoDiseno {
  if (entrada.fijoIndependiente) throw new DisenoNoSoportado('fijo independiente de corredera')
  const conocidos = new Set<number>(Object.values(TIPO_NODO))
  const raices = entrada.nodos.filter(n => n.tipo === TIPO_NODO.marco)
  if (raices.length !== 1) throw new DisenoNoSoportado('diseño sin un único marco')
  const raiz = raices[0]!
  if ((raiz.tipoMarco ?? 'NOR') !== 'NOR') throw new DisenoNoSoportado(`marco ${raiz.tipoMarco}`)
  for (const n of entrada.nodos) {
    if (!conocidos.has(n.tipo)) throw new DisenoNoSoportado(`nodo de tipo ${n.tipo}`)
    if (n.curva) throw new DisenoNoSoportado('diseño con curva')
    if (n.tipo === TIPO_NODO.travesano && ((n.material ?? 'M') !== 'M' || (n.clase ?? 'V') !== 'V')) throw new DisenoNoSoportado('travesaño que no es de marco de ventana')
  }
  if (entrada.nodos.filter(n => n.tipo === TIPO_NODO.hoja).length > 1) throw new DisenoNoSoportado('diseño con varias hojas')
  return raiz
}

/** Grupos de los extremos del marco vertical: a inglete no apoya; recto, entre los horizontales. */
function extremosMarcoVertical(raiz: NodoDiseno): 'E' | 'MH' {
  const cortes = raiz.cortes ?? [1, 1, 1, 1]
  if (cortes.every(c => c === 1)) return 'E'
  if (cortes.every(c => c === 2)) return 'MH'
  throw new DisenoNoSoportado('marco con cortes distintos en sus esquinas')
}

export function generarPlantillaDisenoPropio(entrada: EntradaDisenoPropio): PlantillaDisenoPropio {
  try {
    return { ok: true, filas: generar(entrada) }
  } catch (error) {
    if (error instanceof DisenoNoSoportado) return { ok: false, motivo: error.message }
    throw error
  }
}

function emitirMarco(e: Emisor, raiz: NodoDiseno, conHuecoPropio: boolean) {
  const extremo = extremosMarcoVertical(raiz)
  const vertical = { articulo: ARTICULO.marcoVertical, componente: '12', funcion: 'MV', posicionTrabajo: 'L', formulaLargo: 'L', grupo: 'MV', grupoIzquierdo: extremo, grupoDerecho: extremo }
  e.fila(vertical)
  e.fila(vertical)
  e.fila({ articulo: ARTICULO.marcoSuperior, componente: '11', funcion: 'MH', posicionTrabajo: 'A', formulaLargo: 'A', grupo: 'MH', ...SIN_APOYO })
  e.fila({ articulo: ARTICULO.marcoInferior, componente: '10', funcion: 'MH', posicionTrabajo: 'A', formulaLargo: 'A', grupo: 'MH', ...SIN_APOYO })
  e.fila({ articulo: ARTICULO_ESCUADRA, componente: '58', funcion: 'infHAesc', cantidad: 4, posicionTrabajo: 'L', formulaLargo: 'L', ...SIN_APOYO })
  if (conHuecoPropio) e.manoObra({ disVidrio: MODULO_MO.hueco, formulaLargo: 'L', formulaAncho: 'A' })
  e.manoObra({ disVidrio: MODULO_MO.marco, formulaLargo: 'L', formulaAncho: 'A' })
}

/** Travesaño y la mano de obra de los huecos finales que deja; `ocupadas` son los que llevan dentro otra división o una hoja. */
function emitirTravesano(e: Emisor, n: NodoDiseno, d: Division, regiones: Map<number, Region>, ocupadas: Set<number>) {
  const largo = d.horizontal ? d.region.ancho : d.region.largo
  e.fila({
    articulo: ARTICULO.travesano, componente: '16', funcion: 'TM', posicionTrabajo: d.horizontal ? 'A' : 'L',
    referenciaLargo: d.horizontal ? REFERENCIA.ancho : REFERENCIA.largo, formulaLargo: largo, formulaReferenciaLargo: sobreReferencia(largo),
    grupo: 'TMP', grupoIzquierdo: d.horizontal ? d.region.izquierda : d.region.superior, grupoDerecho: d.horizontal ? d.region.derecha : d.region.inferior,
  })
  const manoObraHueco = (formulaLargo: string, formulaAncho: string | null, formulaReferenciaLargo: string) =>
    e.manoObra({ disVidrio: MODULO_MO.hueco, referenciaLargo: REFERENCIA.largo, formulaLargo, formulaAncho, formulaReferenciaLargo })
  // Productor da a cada travesaño dos filas de mano de obra de hueco, desplazadas
  // tantos huecos hacia atrás como travesaños hermanos tiene. Las que caen antes del
  // primer hueco salen sin ancho y con la medida del propio travesaño. Reproducido
  // tal cual en `03H`, `03V`, `04F` y `06` del catálogo: cambia los minutos del precio.
  const indice = d.travesanos.indexOf(n), desplazamiento = d.travesanos.length - 1
  for (const posicion of [indice - desplazamiento, indice - desplazamiento + 1]) {
    const hueco = d.huecos[posicion]
    if (!hueco) manoObraHueco(largo, null, d.horizontal ? largo : sobreReferencia(largo))
    else if (!ocupadas.has(hueco.id)) { const r = regiones.get(hueco.id)!; manoObraHueco(r.largo, r.ancho, sobreReferencia(r.largo)) }
  }
}

function generar(entrada: EntradaDisenoPropio): FilaPlantillaCatalogo[] {
  const raiz = comprobarAlcance(entrada)
  const nodos = [...entrada.nodos].sort((a, b) => a.id - b.id)
  const { regiones, divisiones, divididas } = resolverRegiones(nodos, raiz)
  const hojas = nodos.filter(n => n.tipo === TIPO_NODO.hoja)
  const ocupadas = new Set([...divididas, ...hojas.map(h => h.contenidoEn)])
  const region = (id: number): Region => {
    const r = regiones.get(id)
    if (!r) throw new DisenoNoSoportado('nodo fuera de un hueco del diseño')
    return r
  }
  const e = crearEmisor()
  emitirMarco(e, raiz, !ocupadas.has(raiz.id))

  const filaVidrio = new Map<number, number>(), filasHoja = new Map<number, FilasHoja>()
  let vidrios = 0
  for (const n of nodos) {
    if (n.tipo === TIPO_NODO.travesano) {
      emitirTravesano(e, n, divisiones.get(n.division ?? n.id)!, regiones, ocupadas)
    } else if (n.tipo === TIPO_NODO.hoja) {
      if (divididas.has(n.contenidoEn)) throw new DisenoNoSoportado('hoja en un hueco partido')
      filasHoja.set(n.id, emitirHoja(e, n, region(n.contenidoEn), n.contenidoEn === raiz.id))
    } else if (n.tipo === TIPO_NODO.vidrio) {
      const hoja = filasHoja.get(n.contenidoEn), contenedor = nodos.find(c => c.id === n.contenidoEn)
      if (!hoja && contenedor?.tipo === TIPO_NODO.hoja) throw new DisenoNoSoportado('vidrio anterior a su hoja')
      const r = region(hoja ? contenedor!.contenidoEn : n.contenidoEn), propio = n.vidrio?.trim() || null
      vidrios++
      filaVidrio.set(n.id, e.fila({
        articulo: ARTICULO.vidrio, componente: '1', disVidrio: propio, formulaLargo: r.largo, formulaAncho: r.ancho, grupo: 'C',
        // Dentro de una hoja el cristal mide sobre los perfiles de la hoja; en un hueco, sobre el marco.
        ...(hoja
          ? { tipoHoja: hoja.tipoHoja, referenciaLargo: hoja.vertical, referenciaAncho: hoja.superior, formulaReferenciaLargo: 'REF', formulaReferenciaAncho: 'REF',
              grupoIzquierdo: 'HP', grupoDerecho: 'HP', grupoSuperior: 'HP', grupoInferior: 'HP' }
          : { referenciaLargo: REFERENCIA.largo, referenciaAncho: REFERENCIA.ancho, formulaReferenciaLargo: sobreReferencia(r.largo), formulaReferenciaAncho: sobreReferencia(r.ancho),
              grupoIzquierdo: r.izquierda, grupoDerecho: r.derecha, grupoSuperior: r.superior, grupoInferior: r.inferior }),
        ...(propio ? { vidrioPropio: propio } : {}),
      }))
    } else if (n.tipo === TIPO_NODO.barrotillo) {
      const cristal = filaVidrio.get(n.contenidoEn), vidrio = nodos.find(v => v.id === n.contenidoEn)
      if (!cristal || !vidrio) throw new DisenoNoSoportado('barrotillo sin su vidrio')
      const hoja = filasHoja.has(vidrio.contenidoEn) ? nodos.find(h => h.id === vidrio.contenidoEn)! : null
      const r = region(hoja ? hoja.contenidoEn : vidrio.contenidoEn), articulo = n.articulo?.trim() || 'BI'
      const barra = { tipoHoja: filasHoja.get(vidrio.contenidoEn)?.tipoHoja ?? '-1', articulo, componente: articulo, referenciaLargo: cristal, formulaReferenciaLargo: 'REF', grupo: 'BI', grupoIzquierdo: 'C', grupoDerecho: 'C' }
      e.fila({ ...barra, cantidad: n.horizontales ?? 0, posicionTrabajo: 'A', formulaLargo: r.ancho })
      e.fila({ ...barra, cantidad: n.verticales ?? 0, posicionTrabajo: 'L', formulaLargo: r.largo })
    }
  }
  if (vidrios > 0) e.manoObra({ disVidrio: MODULO_MO.acristalar, cantidad: vidrios, formulaLargo: MODULO_MO.acristalar, ...SIN_APOYO })
  // El artículo de cierre solo acompaña a los diseños sin hoja.
  if (hojas.length === 0) e.fila({ articulo: ARTICULO.final, formulaLargo: '0', formulaAncho: '0', ...SIN_APOYO })
  return e.cerrar()
}
