/**
 * Resolución genérico -> perfil real por serie.
 *
 * La plantilla de despiece referencia RANURAS (`componenteDisenyo`): marco
 * vertical, hoja, travesaño… sin decir qué perfil concreto va en cada una.
 * La serie lo decide:
 *
 *   serie -> cadena de conjuntos (la serie + delegados transitivos)
 *         -> resolución por componente -> artículo real
 *
 * Mecanismo validado contra 1.657 líneas de documentos reales del sistema
 * original: 96,5% de coincidencia exacta. Ver PLAN.md anexo J.
 *
 * Principio de diseño: NUNCA inventar. Si una ranura no se resuelve para la
 * serie, la pieza queda marcada con el motivo y la línea dice "sin valorar".
 * Un precio corto en silencio es dinero perdido en cada venta.
 */

/**
 * Variante de acristalamiento de los componentes con sufijo:
 *   '1' = cristal sencillo · '2' = doble cristal
 * En el histórico de la empresa el 100% de los despieces usa doble cristal,
 * por eso es el valor por defecto en la interfaz — pero SIEMPRE es una
 * elección visible, nunca una suposición muda.
 */
export type VarianteAcristalamiento = '1' | '2'

/**
 * Expande la cadena de resolución de una serie: la serie misma más los
 * conjuntos delegados, transitivamente y en orden de descubrimiento (la serie
 * primero: sus resoluciones tienen prioridad sobre las de los delegados).
 */
export function expandirCadena(
  serie: string,
  delegaciones: Map<string, string[]>,
): string[] {
  const vistos = new Set<string>()
  const pendientes = [serie]
  while (pendientes.length) {
    const actual = pendientes.shift()!
    if (vistos.has(actual)) continue
    vistos.add(actual)
    for (const d of delegaciones.get(actual) ?? []) {
      if (!vistos.has(d)) pendientes.push(d)
    }
  }
  return [...vistos]
}

/**
 * Construye el índice componente -> artículo para una cadena de conjuntos.
 * Si varios conjuntos de la cadena resuelven el mismo componente, gana el
 * que aparece antes (la serie sobre sus delegados).
 */
export function construirResoluciones(
  cadena: string[],
  filas: { conjuntoCodigo: string; componente: string; articuloCodigo: string }[],
): Map<string, string> {
  const porConjunto = new Map<string, Map<string, string>>()
  for (const f of filas) {
    let m = porConjunto.get(f.conjuntoCodigo)
    if (!m) porConjunto.set(f.conjuntoCodigo, (m = new Map()))
    if (!m.has(f.componente)) m.set(f.componente, f.articuloCodigo)
  }
  const resultado = new Map<string, string>()
  for (const conjunto of cadena) {
    const m = porConjunto.get(conjunto)
    if (!m) continue
    for (const [componente, articulo] of m) {
      if (!resultado.has(componente)) resultado.set(componente, articulo)
    }
  }
  return resultado
}

export interface ComponenteResuelto {
  /** Artículo real, o null si la serie no resuelve esta ranura. */
  articuloCodigo: string | null
  /** Cómo se resolvió: 'exacto' o 'variante' (sufijo .1/.2). */
  via: 'exacto' | 'variante' | null
  /** Motivo cuando no hay resolución. */
  motivo: string | null
}

/**
 * Resuelve una ranura de la plantilla contra el índice de la serie.
 * Orden: componente exacto, y si no, la variante de acristalamiento elegida
 * (`comp.1` / `comp.2`). No se prueba la variante contraria: montar un perfil
 * de cristal sencillo donde va doble no es una aproximación, es un error.
 */
export function resolverComponente(
  componente: string,
  resoluciones: Map<string, string>,
  variante: VarianteAcristalamiento,
): ComponenteResuelto {
  const exacto = resoluciones.get(componente)
  if (exacto) return { articuloCodigo: exacto, via: 'exacto', motivo: null }

  const conVariante = resoluciones.get(`${componente}.${variante}`)
  if (conVariante) return { articuloCodigo: conVariante, via: 'variante', motivo: null }

  return {
    articuloCodigo: null,
    via: null,
    motivo: `la serie no resuelve el componente ${componente}`,
  }
}
