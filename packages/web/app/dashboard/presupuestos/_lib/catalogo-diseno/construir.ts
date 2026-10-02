import {
  generarPlantillaCatalogo, type NodoCatalogo, type PlantillaDiseno,
} from '@aluminior/core/estructuras'

export interface FilaEstructuraCatalogo {
  codigo: string
  descripcion: string
  familia: string | null
  disAnchoMm: number | null
  disAltoMm: number | null
}

export interface FilaNodoCatalogo {
  estructuraCodigo: string
  idItem: number
  tipo: number
  contenidoEn: number | null
  idTravesano: number | null
  posicionHueco: number | null
  tipoTravesano: string | null
  invisible: boolean
  tipoHoja: number | null
  numeroHoja: number | null
  tipoCota: number | null
  cota: string | number | null
  equidistantes: number | null
  tipoMarco: string | null
  tipoCurva: number | null
}

const nodo = (fila: FilaNodoCatalogo): NodoCatalogo => ({
  id: fila.idItem,
  tipo: fila.tipo,
  padre: fila.contenidoEn ?? -1,
  division: fila.idTravesano ?? 0,
  posicion: fila.posicionHueco ?? 0,
  travesano: fila.tipoTravesano ?? '',
  invisible: fila.invisible,
  hoja: fila.tipoHoja ?? 0,
  numeroHoja: fila.numeroHoja ?? 0,
  tipoCota: fila.tipoCota ?? 0,
  cota: Number(fila.cota ?? 0),
  equidistantes: fila.equidistantes ?? 0,
  marco: fila.tipoMarco ?? '',
  variantes: [],
  curva: fila.tipoCurva ?? 0,
})

const porCodigo = new Intl.Collator('es', { numeric: true })

/**
 * Plantillas dibujables del catálogo importado. Las estructuras sin árbol,
 * sin medida de diseño o con elementos aún no representables se omiten: el
 * escaparate solo ofrece lo que sabe dibujar.
 */
export function construirCatalogoDiseno(
  estructuras: readonly FilaEstructuraCatalogo[],
  nodos: readonly FilaNodoCatalogo[],
): PlantillaDiseno[] {
  const nodosPorEstructura = new Map<string, NodoCatalogo[]>()
  for (const fila of nodos) {
    const lista = nodosPorEstructura.get(fila.estructuraCodigo) ?? []
    lista.push(nodo(fila))
    nodosPorEstructura.set(fila.estructuraCodigo, lista)
  }
  const plantillas: PlantillaDiseno[] = []
  for (const estructura of estructuras) {
    const arbol = nodosPorEstructura.get(estructura.codigo)
    if (!arbol || !estructura.familia || !estructura.disAnchoMm || !estructura.disAltoMm) continue
    const resultado = generarPlantillaCatalogo({
      codigo: estructura.codigo,
      descripcion: estructura.descripcion,
      familiaCodigo: estructura.familia,
      anchoMm: estructura.disAnchoMm,
      altoMm: estructura.disAltoMm,
      nodos: arbol,
    })
    if (resultado.estado === 'dibujable') plantillas.push(resultado.plantilla)
  }
  return plantillas.sort((a, b) => porCodigo.compare(a.codigo, b.codigo))
}
