/**
 * Guarda "todo o sin valorar" (T.54, formalizada y testeada en T.59).
 *
 * Una línea muestra un total SOLO si su precio resuelve por completo. Si falta
 * cualquier componente —una pieza sin medida o un artículo sin precio en la
 * tarifa— la línea queda SIN VALORAR (precio `null`), nunca con un total parcial
 * ni cero (regla 3). Un importe parcial no es el precio de la estructura.
 *
 * Función PURA: es la regla del dinero aislada del camino de servidor de
 * `acciones.ts` (que la usa) para poder protegerla con un test unitario.
 */
export interface VeredictoGuarda {
  /** true = la línea se puede valorar (todos sus componentes resuelven). */
  valorable: boolean
  /** Motivos por los que NO se valora (vacío si `valorable`). Mensajes de usuario. */
  motivos: string[]
}

/**
 * Decide si la parte de despiece de una línea es valorable.
 *
 * @param incalculables      nº de piezas sin medida (de `calcularDespiece`).
 * @param sinPrecio          artículos sin precio en la tarifa (de `valorarDespiece`).
 * @param variablesFaltantes cotas/variables que faltaron al evaluar fórmulas (opcional).
 */
export function lineaValorable(args: {
  incalculables: number
  sinPrecio: readonly string[]
  variablesFaltantes?: readonly string[]
}): VeredictoGuarda {
  const motivos: string[] = []
  if (args.incalculables > 0) {
    motivos.push(
      `${args.incalculables} piezas sin medida` +
      (args.variablesFaltantes?.length ? ` (faltan ${args.variablesFaltantes.join(', ')})` : ''),
    )
  }
  if (args.sinPrecio.length) {
    motivos.push(`${args.sinPrecio.length} artículos sin precio en la tarifa`)
  }
  return { valorable: motivos.length === 0, motivos }
}
