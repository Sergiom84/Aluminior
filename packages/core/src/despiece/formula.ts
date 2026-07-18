/**
 * Evaluador de fórmulas de despiece.
 *
 * El sistema original no tabula las medidas de corte: las expresa como
 * fórmulas de texto en `EstructurasArticulos.FormulaLargo` y
 * `FormulaLargoCorte`, y las evalúa con las medidas del hueco.
 *
 * El análisis de las 27.952 filas del catálogo (scripts/analizar-formulas.mjs)
 * dio un lenguaje muy pequeño:
 *   - 417 fórmulas distintas
 *   - 23 identificadores
 *   - 7 operadores: + - * / ( ) y la coma decimal
 *   - sin condicionales ni funciones
 *
 * Ejemplos reales, por frecuencia:
 *   L                 23.084 usos
 *   REF               10.288
 *   (A)/2              4.985
 *   L-FS               1.480
 *   L+CAJ+2*30,00         44
 *   (REF-FI-FD)/2         70
 *
 * OJO: la coma es separador DECIMAL, no de argumentos ("2*30,00" = 2 × 30.0).
 *
 * Este evaluador NO adivina el significado de las variables: recibe un
 * contexto con sus valores y falla si falta alguna, en lugar de asumir cero.
 * Un cero silencioso en una medida de corte es una pieza mal cortada.
 */

export class ErrorFormula extends Error {
  constructor(mensaje: string, readonly formula: string, readonly posicion?: number) {
    super(`${mensaje} — en "${formula}"${posicion !== undefined ? ` (pos ${posicion})` : ''}`)
    this.name = 'ErrorFormula'
  }
}

/** Valores de las variables del hueco. Claves en mayúsculas. */
export type Contexto = Record<string, number>

type Token =
  | { t: 'num'; v: number }
  | { t: 'id'; v: string }
  | { t: 'op'; v: '+' | '-' | '*' | '/' }
  | { t: '('; }
  | { t: ')'; }

function tokenizar(entrada: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < entrada.length) {
    const c = entrada[i]

    if (c === ' ' || c === '\t') { i++; continue }

    if (c === '(') { tokens.push({ t: '(' }); i++; continue }
    if (c === ')') { tokens.push({ t: ')' }); i++; continue }

    if (c === '+' || c === '-' || c === '*' || c === '/') {
      tokens.push({ t: 'op', v: c }); i++; continue
    }

    // Número: dígitos con coma o punto decimal
    if (c >= '0' && c <= '9') {
      let j = i
      while (j < entrada.length && /[\d.,]/.test(entrada[j])) j++
      const crudo = entrada.slice(i, j)
      // La coma es decimal; puede no haber separador de miles.
      const valor = Number(crudo.replace(',', '.'))
      if (!Number.isFinite(valor)) {
        throw new ErrorFormula(`Número no válido "${crudo}"`, entrada, i)
      }
      tokens.push({ t: 'num', v: valor })
      i = j
      continue
    }

    // Identificador
    if (/[A-Za-zÑñ_]/.test(c)) {
      let j = i
      while (j < entrada.length && /[A-Za-z0-9Ññ_]/.test(entrada[j])) j++
      tokens.push({ t: 'id', v: entrada.slice(i, j).toUpperCase() })
      i = j
      continue
    }

    throw new ErrorFormula(`Carácter inesperado "${c}"`, entrada, i)
  }

  return tokens
}

/**
 * Descenso recursivo con la precedencia habitual:
 *   expresion := termino (('+' | '-') termino)*
 *   termino   := factor (('*' | '/') factor)*
 *   factor    := '-'? (numero | identificador | '(' expresion ')')
 */
function analizar(tokens: Token[], ctx: Contexto, original: string): number {
  let pos = 0

  const fin = () => pos >= tokens.length
  const actual = () => tokens[pos]

  function expresion(): number {
    let izq = termino()
    while (!fin()) {
      const t = actual()
      if (t.t !== 'op' || (t.v !== '+' && t.v !== '-')) break
      pos++
      const der = termino()
      izq = t.v === '+' ? izq + der : izq - der
    }
    return izq
  }

  function termino(): number {
    let izq = factor()
    while (!fin()) {
      const t = actual()
      if (t.t !== 'op' || (t.v !== '*' && t.v !== '/')) break
      pos++
      const der = factor()
      if (t.v === '/' && der === 0) {
        throw new ErrorFormula('División por cero', original)
      }
      izq = t.v === '*' ? izq * der : izq / der
    }
    return izq
  }

  function factor(): number {
    if (fin()) throw new ErrorFormula('Fórmula incompleta', original)

    const t = actual()

    // Signo negativo unario
    if (t.t === 'op' && t.v === '-') { pos++; return -factor() }
    if (t.t === 'op' && t.v === '+') { pos++; return factor() }

    if (t.t === 'num') { pos++; return t.v }

    if (t.t === 'id') {
      pos++
      const valor = ctx[t.v]
      if (valor === undefined) {
        throw new ErrorFormula(`Variable "${t.v}" sin valor en el contexto`, original)
      }
      if (!Number.isFinite(valor)) {
        throw new ErrorFormula(`Variable "${t.v}" con valor no numérico`, original)
      }
      return valor
    }

    if (t.t === '(') {
      pos++
      const v = expresion()
      if (fin() || actual().t !== ')') {
        throw new ErrorFormula('Falta cerrar paréntesis', original)
      }
      pos++
      return v
    }

    throw new ErrorFormula('Se esperaba un valor', original)
  }

  const resultado = expresion()
  if (!fin()) throw new ErrorFormula('Sobran caracteres al final', original)
  return resultado
}

/**
 * Evalúa una fórmula de despiece.
 *
 * @param formula  Expresión tal cual viene del catálogo, ej. "L-FS-FI"
 * @param contexto Valores de las variables, ej. { L: 1600, FS: 40, FI: 40 }
 * @throws ErrorFormula si la sintaxis es inválida o falta una variable
 */
export function evaluar(formula: string, contexto: Contexto): number {
  const limpia = formula.trim()
  if (!limpia) throw new ErrorFormula('Fórmula vacía', formula)

  const ctx: Contexto = {}
  for (const [k, v] of Object.entries(contexto)) ctx[k.toUpperCase()] = v

  return analizar(tokenizar(limpia), ctx, limpia)
}

/** Devuelve las variables que una fórmula necesita, sin evaluarla. */
export function variablesDe(formula: string): string[] {
  const vistas = new Set<string>()
  for (const t of tokenizar(formula.trim())) {
    if (t.t === 'id') vistas.add(t.v)
  }
  return [...vistas].sort()
}

/** Comprueba si una fórmula es sintácticamente válida. */
export function esValida(formula: string): boolean {
  try {
    const vars = variablesDe(formula)
    const ficticio: Contexto = Object.fromEntries(vars.map((v) => [v, 1]))
    evaluar(formula, ficticio)
    return true
  } catch {
    return false
  }
}
