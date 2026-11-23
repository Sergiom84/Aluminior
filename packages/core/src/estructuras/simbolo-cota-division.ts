import type { NodoCatalogo } from './diseno-catalogo.ts'

const CLAVE_POR_TRAVESANO: Readonly<Record<string, string>> = {
  HB: 'INFERIOR', HA: 'SUPERIOR', VI: 'IZQUIERD', VD: 'DERECH',
}

/**
 * Símbolo de línea que gobierna cada división con cota fija (`TipoCota = 1`),
 * por id de división. El catálogo no lo enlaza: el símbolo cambia de una
 * estructura a otra (FIJO IZQUIERDO es FZ en 1FL y FI en 12FL), así que se
 * deduce del nombre de la cota y del lado del travesaño. Solo se asigna lo
 * inequívoco: un lado con varias divisiones o varias cotas candidatas no se
 * adivina y la división conserva su medida de plantilla.
 */
export function simboloCotaDivision(
  nodos: readonly NodoCatalogo[],
  cotas: readonly { simbolo: string; nombre: string | null }[],
): ReadonlyMap<number, string> {
  const divisiones = new Map<number, string>()
  for (const nodo of nodos) {
    if (nodo.tipo === 6 && nodo.tipoCota === 1) divisiones.set(nodo.division, nodo.travesano)
  }
  const porLado = new Map<string, number[]>()
  for (const [id, lado] of divisiones) porLado.set(lado, [...(porLado.get(lado) ?? []), id])
  const simbolosDe = (candidatas: typeof cotas) =>
    new Set(candidatas.map(cota => cota.simbolo.trim().toUpperCase()))
  const verticales = [...divisiones].filter(([, lado]) => lado === 'VI' || lado === 'VD')
  const salida = new Map<number, string>()
  for (const [lado, ids] of porLado) {
    if (ids.length !== 1) continue
    const clave = CLAVE_POR_TRAVESANO[lado]
    let simbolos = simbolosDe(clave
      ? cotas.filter(cota => cota.nombre?.toUpperCase().includes(clave))
      : [])
    // «FIJO LATERAL» sin lado: vale si es el único travesaño vertical con cota y la única cota lateral.
    if (!simbolos.size && verticales.length === 1 && verticales[0][0] === ids[0]) {
      simbolos = simbolosDe(cotas.filter(cota => {
        const nombre = cota.nombre?.toUpperCase() ?? ''
        return nombre.includes('LATERAL') && !/IZQUIERD|DERECH|INFERIOR|SUPERIOR/.test(nombre)
      }))
    }
    if (simbolos.size === 1) salida.set(ids[0], [...simbolos][0])
  }
  return salida
}
