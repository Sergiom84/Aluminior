import type { EstructuraCatalogo } from './diseno-catalogo.ts'

/** Forma acreditada por C2; el código y los identificadores son opacos. */
export function esCorrederaDosHojas(entrada: EstructuraCatalogo): boolean {
  const { nodos } = entrada
  if (entrada.familiaCodigo !== '001' || nodos.length !== 8) return false
  const raices = nodos.filter(n => n.tipo === 1 && n.padre === -1 && n.marco === 'NOR')
  if (raices.length !== 1) return false
  const hijos = nodos.filter(n => n.padre === raices[0].id)
  const divisiones = hijos.filter(n => n.tipo === 6)
  if (hijos.length !== 3 || divisiones.length !== 1) return false
  const division = divisiones[0]
  if (division.travesano !== 'VI' || !division.invisible || division.equidistantes !== 2 ||
      division.tipoCota !== 0 || division.cota !== 0) return false
  const huecos = hijos.filter(n => n.tipo === 2).sort((a, b) => a.posicion - b.posicion)
  return huecos.length === 2 && huecos.every((hueco, i) => {
    if (hueco.posicion !== i + 1 || hueco.division !== division.division) return false
    const hojas = nodos.filter(n => n.padre === hueco.id)
    if (hojas.length !== 1 || hojas[0].tipo !== 3 || hojas[0].hoja !== 10 || hojas[0].numeroHoja !== i + 1) return false
    const vidrios = nodos.filter(n => n.padre === hojas[0].id)
    return vidrios.length === 1 && vidrios[0].tipo === 5
  })
}
