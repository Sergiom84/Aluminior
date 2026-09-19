/**
 * Pestaña `Acristalamiento` de la edición de línea.
 *
 * Evidencia: CHM 5.3.1.3.2.4 («las opciones disponibles son las introducidas
 * en la configuración de la serie») y 5.1.2.12.5 («hasta 5 opciones [...] la
 * opción 1 será la predeterminada»; cada opción tiene tabla de `Hojas` y de
 * `Fijos`). Recon 18/09: cinco radios con código y descripción para `Hojas` y
 * `Fijos`. Datos: `Conjuntos.TablaHojas..TablaHojas5` / `TablaFijos..5` y
 * `TAcristalamiento.Descripcion`.
 *
 * No confundir con la variante `.1/.2` (cristal sencillo o doble) que hoy
 * muestra Aluminior con el mismo nombre: aquella elige perfiles dependientes
 * del vidrio; ésta elige la tabla de junquillos.
 */

export const MAXIMO_OPCIONES_ACRISTALAMIENTO = 5

export interface TablasOpcionAcristalamiento {
  readonly hojas: string | null
  readonly fijos: string | null
}

export interface OpcionAcristalamiento {
  /** 1..5, la posición de la pestaña en la configuración de la serie. */
  readonly numero: number
  readonly hojas: { codigo: string; descripcion: string | null } | null
  readonly fijos: { codigo: string; descripcion: string | null } | null
  readonly predeterminada: boolean
}

const limpio = (codigo: string | null) => {
  const valor = codigo?.trim()
  return valor && valor !== '0' ? valor : null
}

/**
 * Opciones ofrecidas para una serie, en su orden. Una posición sin ninguna
 * tabla no se ofrece. Si sólo falta la de fijos se ofrece con `fijos: null`:
 * el manual no dice qué tabla usa entonces el original (HIPÓTESIS).
 */
export function opcionesAcristalamiento(
  tablas: readonly TablasOpcionAcristalamiento[],
  descripciones: ReadonlyMap<string, string> = new Map(),
): OpcionAcristalamiento[] {
  const tabla = (codigo: string | null) => {
    const valor = limpio(codigo)
    return valor ? { codigo: valor, descripcion: descripciones.get(valor) ?? null } : null
  }
  return tablas.slice(0, MAXIMO_OPCIONES_ACRISTALAMIENTO).flatMap((opcion, indice) => {
    const hojas = tabla(opcion.hojas)
    const fijos = tabla(opcion.fijos)
    if (!hojas && !fijos) return []
    return [{ numero: indice + 1, hojas, fijos, predeterminada: indice === 0 }]
  })
}
