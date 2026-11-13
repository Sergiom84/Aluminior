/**
 * Plantilla de despiece de un diseño propio, como la que Productor guarda en
 * `EstructurasArticulos` (`TipoDoc = VPRES`) al aceptar `Diseño V3`.
 *
 * Alcance demostrado contra el catálogo y los documentos reales: marco normal
 * recto con travesaños de marco (equidistantes o a cota fija, anidados),
 * vidrio por hueco y barrotillo interior. Lo demás se devuelve como no
 * soportado: nunca se inventa una plantilla.
 */
import type { FilaPlantillaCatalogo } from '../linea-catalogo/tipos.ts'
import { DisenoNoSoportado, resolverRegiones, type Region } from './regiones.ts'
import { TIPO_NODO, type EntradaDisenoPropio, type NodoDiseno, type PlantillaDisenoPropio } from './tipos.ts'

/** Ranuras genéricas de la plantilla; la serie las resuelve a su artículo. */
const ARTICULO = { marcoVertical: '1', marcoSuperior: '2', marcoInferior: '3', vidrio: '8', travesano: '11', final: '62', escuadra: '105', manoObra: '148' } as const
/** Módulos de mano de obra de las filas `infMOmof` (`DisVidrio`). */
const MODULO_MO = { marco: '1', acristalar: '18', hueco: '41' } as const
/** Filas de las que cuelgan las medidas: marco izquierdo (largo) y marco superior (ancho). */
const REFERENCIA = { largo: 1, ancho: 3 } as const

type Parcial = Partial<FilaPlantillaCatalogo> & Pick<FilaPlantillaCatalogo, 'articulo'>

/** La fórmula de referencia mide sobre la pieza referida: `L` y `A` pasan a `REF`. */
const sobreReferencia = (formula: string) => formula.replace(/\b[LA]\b/g, 'REF')

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

function generar(entrada: EntradaDisenoPropio): FilaPlantillaCatalogo[] {
  const raiz = comprobarAlcance(entrada)
  const nodos = [...entrada.nodos].sort((a, b) => a.id - b.id)
  const { regiones, divisiones, divididas } = resolverRegiones(nodos, raiz)
  const filas: FilaPlantillaCatalogo[] = []
  const fila = (f: Parcial): number => {
    filas.push({
      id: filas.length + 1, componente: null, funcion: null, cantidad: 1, posicionTrabajo: null, tipoHoja: '-1', mano: null, hoja: 0,
      disVidrio: null, referenciaLargo: null, referenciaAncho: null, formulaLargo: null, formulaAncho: null,
      formulaReferenciaLargo: null, formulaReferenciaAncho: null, grupo: null, grupoIzquierdo: null, grupoDerecho: null,
      grupoSuperior: null, grupoInferior: null, gruposAdicionales: [null, null, null, null], perfilAdicional: null, formulaSeleccion: null, ...f,
    })
    return filas.length
  }
  const manoObra = (f: Partial<FilaPlantillaCatalogo>) =>
    fila({ articulo: ARTICULO.manoObra, componente: '39', funcion: 'infMOmof', posicionTrabajo: 'L', tipoHoja: '0', ...f })
  const sinApoyo = { grupoIzquierdo: 'E', grupoDerecho: 'E' }

  const extremo = extremosMarcoVertical(raiz)
  const vertical = { articulo: ARTICULO.marcoVertical, componente: '12', funcion: 'MV', posicionTrabajo: 'L', formulaLargo: 'L', grupo: 'MV', grupoIzquierdo: extremo, grupoDerecho: extremo }
  fila(vertical)
  fila(vertical)
  fila({ articulo: ARTICULO.marcoSuperior, componente: '11', funcion: 'MH', posicionTrabajo: 'A', formulaLargo: 'A', grupo: 'MH', ...sinApoyo })
  fila({ articulo: ARTICULO.marcoInferior, componente: '10', funcion: 'MH', posicionTrabajo: 'A', formulaLargo: 'A', grupo: 'MH', ...sinApoyo })
  fila({ articulo: ARTICULO.escuadra, componente: '58', funcion: 'infHAesc', cantidad: 4, posicionTrabajo: 'L', formulaLargo: 'L', ...sinApoyo })
  if (!divididas.has(raiz.id)) manoObra({ disVidrio: MODULO_MO.hueco, formulaLargo: 'L', formulaAncho: 'A' })
  manoObra({ disVidrio: MODULO_MO.marco, formulaLargo: 'L', formulaAncho: 'A' })

  const filaVidrio = new Map<number, number>()
  const region = (id: number): Region => {
    const r = regiones.get(id)
    if (!r) throw new DisenoNoSoportado('nodo fuera de un hueco del diseño')
    return r
  }
  const manoObraHueco = (travesano: NodoDiseno, r: Pick<Region, 'largo'> & { ancho: string | null }, referencia: string) =>
    manoObra({ disVidrio: MODULO_MO.hueco, referenciaLargo: REFERENCIA.largo, formulaLargo: r.largo, formulaAncho: r.ancho, formulaReferenciaLargo: referencia })

  let vidrios = 0
  for (const n of nodos) {
    if (n.tipo === TIPO_NODO.travesano) {
      const d = divisiones.get(n.division ?? n.id)!
      const largo = d.horizontal ? d.region.ancho : d.region.largo
      fila({
        articulo: ARTICULO.travesano, componente: '16', funcion: 'TM', posicionTrabajo: d.horizontal ? 'A' : 'L',
        referenciaLargo: d.horizontal ? REFERENCIA.ancho : REFERENCIA.largo, formulaLargo: largo, formulaReferenciaLargo: sobreReferencia(largo),
        grupo: 'TMP', grupoIzquierdo: d.horizontal ? d.region.izquierda : d.region.superior, grupoDerecho: d.horizontal ? d.region.derecha : d.region.inferior,
      })
      // Productor da a cada travesaño dos filas de mano de obra de hueco, desplazadas
      // tantos huecos hacia atrás como travesaños hermanos tiene. Las que caen antes del
      // primer hueco salen sin ancho y con la medida del propio travesaño. Reproducido
      // tal cual en `03H`, `03V`, `04F` y `06` del catálogo: cambia los minutos del precio.
      const indice = d.travesanos.indexOf(n), desplazamiento = d.travesanos.length - 1
      for (const posicion of [indice - desplazamiento, indice - desplazamiento + 1]) {
        const hueco = d.huecos[posicion]
        if (!hueco) manoObraHueco(n, { largo, ancho: null }, d.horizontal ? largo : sobreReferencia(largo))
        else if (!divididas.has(hueco.id)) { const r = region(hueco.id); manoObraHueco(n, r, sobreReferencia(r.largo)) }
      }
    } else if (n.tipo === TIPO_NODO.vidrio) {
      const r = region(n.contenidoEn), propio = n.vidrio?.trim() || null
      vidrios++
      filaVidrio.set(n.id, fila({
        articulo: ARTICULO.vidrio, componente: '1', disVidrio: propio, referenciaLargo: REFERENCIA.largo, referenciaAncho: REFERENCIA.ancho,
        formulaLargo: r.largo, formulaAncho: r.ancho, formulaReferenciaLargo: sobreReferencia(r.largo), formulaReferenciaAncho: sobreReferencia(r.ancho),
        grupo: 'C', grupoIzquierdo: r.izquierda, grupoDerecho: r.derecha, grupoSuperior: r.superior, grupoInferior: r.inferior,
        ...(propio ? { vidrioPropio: propio } : {}),
      }))
    } else if (n.tipo === TIPO_NODO.barrotillo) {
      const cristal = filaVidrio.get(n.contenidoEn), vidrio = nodos.find(v => v.id === n.contenidoEn)
      if (!cristal || !vidrio) throw new DisenoNoSoportado('barrotillo sin su vidrio')
      const r = region(vidrio.contenidoEn), articulo = n.articulo?.trim() || 'BI'
      const barra = { articulo, componente: articulo, referenciaLargo: cristal, formulaReferenciaLargo: 'REF', grupo: 'BI', grupoIzquierdo: 'C', grupoDerecho: 'C' }
      fila({ ...barra, cantidad: n.horizontales ?? 0, posicionTrabajo: 'A', formulaLargo: r.ancho })
      fila({ ...barra, cantidad: n.verticales ?? 0, posicionTrabajo: 'L', formulaLargo: r.largo })
    }
  }
  if (vidrios > 0) manoObra({ disVidrio: MODULO_MO.acristalar, cantidad: vidrios, formulaLargo: MODULO_MO.acristalar, ...sinApoyo })
  fila({ articulo: ARTICULO.final, formulaLargo: '0', formulaAncho: '0', ...sinApoyo })
  return filas
}
