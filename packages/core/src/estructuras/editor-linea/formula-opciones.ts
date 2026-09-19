/**
 * Fórmulas de opciones de herraje: `F. Opc. Activa sólo Si` y
 * `F. Opc. Incompatible` (CHM 5.1.2.12.7.7.2, columnas `fOpcSoloActiva` y
 * `fOpcIncompatible` de `ConjuntosOpcionesHerraje`).
 *
 * Gramática documentada en el manual: cada opción se escribe con la letra `o`
 * delante (`o11`), `+` es un O lógico, `*` es un Y lógico y los paréntesis
 * agrupan (`(o12*o21)+(o13*o21)`). Los datos de la empresa sólo usan la forma
 * `oN+oM` (60 fórmulas distintas, todas O simples).
 *
 * HIPÓTESIS: `*` tiene más prioridad que `+`, como en el álgebra de Boole
 * habitual. El manual sólo muestra mezclas con paréntesis explícitos.
 */

export type FormulaOpciones =
  | { readonly tipo: 'opcion'; readonly codigo: string }
  | { readonly tipo: 'o'; readonly partes: readonly FormulaOpciones[] }
  | { readonly tipo: 'y'; readonly partes: readonly FormulaOpciones[] }

type Token = { tipo: 'opcion'; codigo: string } | { tipo: '+' | '*' | '(' | ')' }

function tokenizar(texto: string): Token[] | null {
  const tokens: Token[] = []
  let i = 0
  while (i < texto.length) {
    const c = texto[i]
    if (/\s/.test(c)) { i++; continue }
    if (c === '+' || c === '*' || c === '(' || c === ')') { tokens.push({ tipo: c }); i++; continue }
    if (c === 'o' || c === 'O') {
      const cifras = /^\d+/.exec(texto.slice(i + 1))
      if (!cifras) return null
      tokens.push({ tipo: 'opcion', codigo: String(Number(cifras[0])) })
      i += 1 + cifras[0].length
      continue
    }
    return null
  }
  return tokens
}

/**
 * Convierte el texto en árbol. Vacío o sólo espacios devuelve `null` (sin
 * condición); un texto mal formado lanza, para que quien lo lea decida.
 */
export function parsearFormulaOpciones(texto: string | null | undefined): FormulaOpciones | null {
  if (!texto || !texto.trim()) return null
  const tokens = tokenizar(texto)
  if (!tokens || tokens.length === 0) throw new Error(`fórmula de opciones no válida: ${texto}`)
  let pos = 0

  const suma = (): FormulaOpciones => {
    const partes = [producto()]
    while (tokens[pos]?.tipo === '+') { pos++; partes.push(producto()) }
    return partes.length === 1 ? partes[0] : { tipo: 'o', partes }
  }
  const producto = (): FormulaOpciones => {
    const partes = [termino()]
    while (tokens[pos]?.tipo === '*') { pos++; partes.push(termino()) }
    return partes.length === 1 ? partes[0] : { tipo: 'y', partes }
  }
  const termino = (): FormulaOpciones => {
    const token = tokens[pos++]
    if (token?.tipo === 'opcion') return { tipo: 'opcion', codigo: token.codigo }
    if (token?.tipo === '(') {
      const dentro = suma()
      if (tokens[pos++]?.tipo !== ')') throw new Error(`fórmula de opciones no válida: ${texto}`)
      return dentro
    }
    throw new Error(`fórmula de opciones no válida: ${texto}`)
  }

  const arbol = suma()
  if (pos !== tokens.length) throw new Error(`fórmula de opciones no válida: ${texto}`)
  return arbol
}

/** Evalúa la fórmula con las opciones marcadas (códigos sin la `o`). */
export function evaluarFormulaOpciones(
  formula: FormulaOpciones,
  marcadas: ReadonlySet<string>,
): boolean {
  switch (formula.tipo) {
    case 'opcion': return marcadas.has(formula.codigo)
    case 'o': return formula.partes.some((parte) => evaluarFormulaOpciones(parte, marcadas))
    case 'y': return formula.partes.every((parte) => evaluarFormulaOpciones(parte, marcadas))
  }
}
