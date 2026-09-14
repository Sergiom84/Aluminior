/**
 * Cómo se elige el PVP de un artículo cuando la tarifa ofrece varios acabados.
 *
 * Hermano de `coste-catalogo.ts`, y por el mismo motivo: `articulos_pvp` tiene
 * una fila por `(artículo, acabado, tarifa)`, así que un artículo puede traer
 * varios precios dentro de la misma tarifa y hay que decidir cuál aplica.
 *
 * Lo que sustituye. El criterio anterior estaba escrito en SQL, cuatro veces,
 * como `ORDER BY (acabado_codigo = <línea>) DESC, (acabado_codigo = '*') DESC,
 * acabado_codigo LIMIT 1`. Esa última cláusula —el desempate **alfabético**— es
 * el defecto que este módulo elimina: cuando el artículo no tenía precio ni en
 * el acabado de la línea ni en el genérico, la consulta no se rendía, sino que
 * cobraba el precio del acabado que saliera antes por orden de código. Un perfil
 * lacado podía facturarse al precio del anodizado porque `ANOD` precede a `LAC`.
 * No es un empate resuelto: es un precio de otro producto.
 *
 * La regla, en orden:
 *
 *   1. Si hay filas del acabado aplicado, deciden ELLAS y sólo ellas: si todas
 *      coinciden se usa ese precio, y si difieren es ambiguo. No se mira al
 *      genérico: el acabado aplicado es la respuesta, aunque no sea unánime.
 *   2. Si no hay ninguna fila de ese acabado, deciden las GENÉRICAS —las que
 *      normalizan a `UNI`: `UNI`, `*` y la cadena vacía—, con el mismo criterio
 *      de unanimidad. Un precio genérico es el que el catálogo declara como no
 *      dependiente del acabado; usarlo no es adivinar.
 *   3. Si no hay ni exacto ni genérico, NO hay precio. Aquí es donde el criterio
 *      viejo inventaba uno.
 *   4. Sin filas, no hay precio.
 *
 * **El resultado no depende del orden de las filas**, que es lo que lo hace
 * reproducible: quien llama trae las filas sin `ORDER BY` ni `LIMIT`, porque
 * filtrar en SQL escondería justo el caso que hay que detectar.
 *
 * Diferencia deliberada con `resolverCosteCatalogo`: allí el paso 2 acepta la
 * unanimidad de TODAS las filas del artículo, sea cual sea su acabado. Aquí no.
 * Un coste unánime es el mismo número mirado desde cualquier acabado, y darlo
 * por bueno no mueve el margen; un PVP unánime entre acabados ajenos seguiría
 * siendo el precio de un producto que no es el que se vende. Venta y coste
 * toleran cosas distintas y por eso son dos funciones.
 *
 * Función PURA. La lectura del catálogo es de quien la llama.
 */

import { normalizarDecimal, type Decimal } from './decimal.ts'
import { normalizarAcabado } from './tarifa.ts'

/** Escala de `articulos_pvp.precio`: `numeric(12,4)`. */
export const ESCALA_PVP_CATALOGO = 4

export interface FilaPvpCatalogo {
  acabadoCodigo: string
  /** Texto decimal tal y como lo devuelve `numeric`. */
  precio: Decimal
}

/**
 * La misma fila, con el importe sin nombrar: el criterio no depende de si lo
 * que se resuelve es una venta o un coste.
 */
export interface FilaPorAcabado {
  acabadoCodigo: string
  valor: Decimal
}

export type ResolucionPorAcabado =
  | { estado: 'RESUELTO'; valor: Decimal }
  | { estado: 'SIN_PRECIO' }
  | { estado: 'AMBIGUO' }

/**
 * Los tres desenlaces posibles, distinguidos.
 *
 * `SIN_PRECIO` y `AMBIGUO` se separan porque significan cosas distintas y se
 * investigan distinto —el artículo no está en la tarifa, frente a está varias
 * veces y ninguna manda—, y porque el aviso que ve el operador no es el mismo.
 * Los dos bloquean por igual: ninguno se convierte en cero ni en un precio.
 */
export type ResolucionPvp =
  | { estado: 'RESUELTO'; precio: Decimal }
  | { estado: 'SIN_PRECIO' }
  | { estado: 'AMBIGUO' }

/**
 * Un acabado es genérico si normaliza a `UNI`. La equivalencia `'' ≡ '*' ≡ UNI`
 * no se decide aquí: es la que ya aplica el cargador de tarifas al importar, y
 * duplicarla con otro criterio dejaría el catálogo diciendo dos cosas.
 */
const GENERICO = 'UNI'

/**
 * El criterio, sobre un importe sin nombrar y con la escala de su columna.
 *
 * Lo usan el PVP de la tarifa y el coste del vidrio. Ese coste NO pasa por
 * `resolverCosteCatalogo` aunque también sea un coste: aquel resuelve por
 * unanimidad de todas las filas y no conoce el comodín, de modo que un vidrio
 * con `AAA = 5` y `* = 8` le resultaría ambiguo cuando el catálogo está diciendo
 * claramente que el genérico son 8. El vidrio usa comodín y el despiece no; el
 * criterio que respeta el catálogo del vidrio es este.
 */
export function resolverPorAcabado(
  filas: readonly FilaPorAcabado[],
  acabadoAplicado: string | null,
  escala: number,
): ResolucionPorAcabado {
  if (!filas.length) return { estado: 'SIN_PRECIO' }

  // `null` no es un acabado: no casa ni siquiera con las filas de acabado vacío,
  // que son genéricas y se resuelven en el paso siguiente.
  if (acabadoAplicado !== null) {
    const exacto = normalizarAcabado(acabadoAplicado)
    const delAcabado = filas.filter((fila) => normalizarAcabado(fila.acabadoCodigo) === exacto)
    if (delAcabado.length) return unanime(delAcabado, escala)
    // Una línea cuyo acabado ES el genérico ya se ha resuelto arriba: su exacto
    // y su genérico son el mismo conjunto de filas.
    if (exacto === GENERICO) return { estado: 'SIN_PRECIO' }
  }

  const genericas = filas.filter((fila) => normalizarAcabado(fila.acabadoCodigo) === GENERICO)
  if (genericas.length) return unanime(genericas, escala)

  // Quedan filas, pero todas de acabados ajenos. El criterio viejo cobraba la
  // primera por orden alfabético; aquí no hay precio que dar.
  return { estado: 'SIN_PRECIO' }
}

/** El criterio aplicado al PVP de la tarifa, con la escala de su columna. */
export function resolverPvpCatalogo(
  filas: readonly FilaPvpCatalogo[],
  acabadoAplicado: string | null,
): ResolucionPvp {
  const resolucion = resolverPorAcabado(
    filas.map((fila) => ({ acabadoCodigo: fila.acabadoCodigo, valor: fila.precio })),
    acabadoAplicado,
    ESCALA_PVP_CATALOGO,
  )
  return resolucion.estado === 'RESUELTO'
    ? { estado: 'RESUELTO', precio: resolucion.valor }
    : resolucion
}

/**
 * Un valor sólo si todas las filas coinciden.
 *
 * Se normaliza antes de comparar: `30` y `30.0000` son el mismo precio, y
 * compararlos como texto los haría parecer dos candidatos y daría un `AMBIGUO`
 * falso. El conjunto ignora el orden, que es lo que hace el resultado estable.
 */
function unanime(filas: readonly FilaPorAcabado[], escala: number): ResolucionPorAcabado {
  const distintos = new Set<Decimal>(
    filas.map((fila) => normalizarDecimal(fila.valor, escala)),
  )
  if (distintos.size === 1) return { estado: 'RESUELTO', valor: [...distintos][0] }
  return { estado: 'AMBIGUO' }
}
