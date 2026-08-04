/**
 * Coste real de las piezas de acristalamiento —junquillos y juntas—.
 *
 * Mismo papel que `coste-despiece.ts`: se persiste para trazabilidad y NO
 * interviene en el precio de venta. Y mismo desempate de catálogo, compartido en
 * `coste-articulos.ts`.
 *
 * Pero NO es el mismo caso de uso, y por eso no comparte la preparación de
 * piezas. Dos diferencias reales, ninguna corregida aquí:
 *
 *   1. `largoMm` es obligatorio para calcular el coste total **también en los
 *      artículos por unidades**. En el despiece, un artículo UD se costea sin
 *      largo; aquí, sin largo no hay coste total aunque se cobre por unidades.
 *   2. Los ángulos de corte se escriben siempre a `null`, aunque la pieza los
 *      traiga. Es lo que hacía la implementación anterior; el motivo funcional
 *      —si el original no los detalla para juntas y junquillos, o si es un
 *      descuido— NO está medido.
 *
 * Extraído de `acciones.ts` en T.69.3 conservando ambas. Igualarlas al despiece
 * cambiaría costes ya persistidos y necesita su propia medición.
 *
 * ARITMÉTICA: se conserva la que había, en `number`, con
 * `Math.round(v * 10000) / 10000`. La misma deuda declarada en `coste-despiece`.
 */

import type { DatosArticuloPrecio } from '@aluminior/core/precios'
import type { PiezaCortada } from '@aluminior/core/despiece'
import type { ClienteEscritura } from '../cliente-db.ts'
import type { PiezaDespiece } from '../lineas/guardar-linea.ts'
import { costePorArticuloDe, leerCostesArticulos } from './coste-articulos.ts'

export interface EntradaPiezasAcristalamiento {
  /** Piezas que SÍ están en el catálogo. El marcador «sin junquillos» ya se filtró. */
  piezas: readonly PiezaCortada[]
  /** Artículos YA leídos por la valoración del acristalamiento. */
  mapa: ReadonlyMap<string, DatosArticuloPrecio>
  costePorArticulo: ReadonlyMap<string, number | null>
}

/**
 * Las filas de `lineas_despiece` del acristalamiento. Función PURA.
 *
 * Una fila por pieza, en el mismo orden y sin agregar: dos juntas del mismo
 * artículo con largos distintos son dos filas.
 */
export function prepararPiezasAcristalamiento(
  entrada: EntradaPiezasAcristalamiento,
): PiezaDespiece[] {
  return entrada.piezas.map((pz) => {
    const coste = entrada.costePorArticulo.get(pz.articuloCodigo) ?? null
    const esML = entrada.mapa.get(pz.articuloCodigo)?.tipoMetraje === 'ML'
    // El largo condiciona AMBAS ramas, no sólo la de metro lineal. Es la
    // diferencia con el despiece, y se conserva tal cual.
    const costeTotal = coste !== null && pz.largoMm !== null
      ? (esML ? coste * (pz.largoMm / 1000) * pz.cantidad : coste * pz.cantidad)
      : null
    return {
      articuloCodigo: pz.articuloCodigo,
      cantidad: String(pz.cantidad),
      largoCorteMm: pz.largoMm !== null ? String(pz.largoMm) : null,
      anguloIzquierdo: null,
      anguloDerecho: null,
      funcion: pz.funcion,
      costeUnitario: coste !== null ? String(coste) : null,
      costeTotal: costeTotal !== null ? String(Math.round(costeTotal * 10000) / 10000) : null,
    }
  })
}

export interface EntradaCosteAcristalamiento {
  piezas: readonly PiezaCortada[]
  /** Códigos únicos, ya calculados para la valoración del acristalamiento. */
  codigos: readonly string[]
  mapa: ReadonlyMap<string, DatosArticuloPrecio>
  /** Acabado de la línea. `null` = la línea no fija acabado. */
  acabadoCodigo: string | null
}

/** Lee los costes y devuelve las piezas listas para añadir a las de la línea. */
export async function resolverCosteAcristalamiento(
  cliente: ClienteEscritura,
  entrada: EntradaCosteAcristalamiento,
): Promise<PiezaDespiece[]> {
  const costes = await leerCostesArticulos(cliente, entrada.codigos)
  return prepararPiezasAcristalamiento({
    piezas: entrada.piezas,
    mapa: entrada.mapa,
    costePorArticulo: costePorArticuloDe(costes, entrada.acabadoCodigo),
  })
}
