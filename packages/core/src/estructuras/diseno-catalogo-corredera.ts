import type { EstructuraCatalogo } from './diseno-catalogo.ts'

/** Pares acreditados: ventana tipo 10 y puerta tipo 16 en sus familias.
 * La ventana también admite el par contenido en un hueco con fijos alrededor;
 * la puerta se limita al par directo en marco NOR, sin fijos ni cotas.
 * Las otras divisiones y sus cotas las valida el traductor del árbol completo.
 * No reconoce una corredera por código, nombre o número total de nodos.
 */
export function esCorrederaDosHojas(entrada: EstructuraCatalogo): boolean {
  const { nodos } = entrada
  const tipoHoja = entrada.familiaCodigo === '001' ? 10 : entrada.familiaCodigo === '002' ? 16 : null
  if (tipoHoja === null || (tipoHoja === 16 && nodos.length !== 8)) return false
  const raices = nodos.filter(n => n.tipo === 1 && n.padre === -1 && n.marco === 'NOR')
  if (raices.length !== 1) return false
  const hojas = nodos.filter(n => n.tipo === 3)
  if (hojas.length !== 2 || hojas.some(n => n.hoja !== tipoHoja)) return false
  const contenedores = hojas.map(hoja => nodos.find(n => n.id === hoja.padre && n.tipo === 2))
  if (contenedores.some(n => !n) || contenedores[0]!.padre !== contenedores[1]!.padre) return false
  const contenedorPar = nodos.find(n => n.id === contenedores[0]!.padre)
  if (!contenedorPar || ![1, 2].includes(contenedorPar.tipo)) return false
  if (tipoHoja === 16 && contenedorPar.id !== raices[0].id) return false
  const hijos = nodos.filter(n => n.padre === contenedorPar.id)
  const divisiones = hijos.filter(n => n.tipo === 6)
  if (hijos.length !== 3 || divisiones.length !== 1) return false
  const division = divisiones[0]
  if (division.travesano !== 'VI' || !division.invisible || division.equidistantes !== 2 ||
      division.tipoCota !== 0 || division.cota !== 0) return false
  const huecos = hijos.filter(n => n.tipo === 2).sort((a, b) => a.posicion - b.posicion)
  return huecos.length === 2 && huecos.every((hueco, i) => {
    if (hueco.posicion !== i + 1 || hueco.division !== division.division) return false
    const hojas = nodos.filter(n => n.padre === hueco.id)
    if (hojas.length !== 1 || hojas[0].tipo !== 3 || hojas[0].hoja !== tipoHoja || hojas[0].numeroHoja !== i + 1) return false
    const vidrios = nodos.filter(n => n.padre === hojas[0].id)
    return vidrios.length === 1 && vidrios[0].tipo === 5
  })
}
