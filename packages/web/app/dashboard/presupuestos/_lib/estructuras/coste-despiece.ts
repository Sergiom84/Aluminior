/**
 * Coste real de cada pieza del despiece, para persistirlo con trazabilidad.
 *
 * Es lo que permite responder «cuánto costó de verdad esta línea» sin suponer
 * que el catálogo de hoy era el de entonces. NO interviene en el precio de
 * venta: eso lo decide `valorarDespiece`, y un coste que falta no deja la línea
 * sin valorar.
 *
 * Extraído de `acciones.ts` en T.69.2 SIN cambiar comportamiento.
 *
 * ARITMÉTICA: se conserva EXACTAMENTE la que había, en `number`, con
 * `coste × metros × cantidad` y `Math.round(v * 10000) / 10000`. Se sabe que la
 * coma flotante desvía el último dígito —es lo que T.68 corrigió en la mano de
 * obra— pero cambiarla aquí mueve cifras de coste ya persistidas y es una
 * decisión económica con su propia medición, no un efecto secundario de mover
 * código. Cuando se aborde, esta es la línea que hay que tocar y las pruebas de
 * caracterización dirán qué cambia.
 */

import { inArray } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import { resolverCosteCatalogo, type DatosArticuloPrecio } from '@aluminior/core/precios'
import type { PiezaCortada } from '@aluminior/core/despiece'
import type { ClienteEscritura } from '../cliente-db.ts'
import type { PiezaDespiece } from '../lineas/guardar-linea.ts'

/** Fila de `articulos_coste` tal y como la necesita el desempate. */
export interface FilaCosteArticulo {
  articuloCodigo: string
  acabadoCodigo: string
  coste: string
}

/**
 * Costes de los artículos del despiece, sin filtrar por acabado.
 *
 * Sin filtrar a propósito: el desempate necesita ver todas las filas para saber
 * si hay ambigüedad, y filtrar en SQL escondería justo el caso a detectar.
 */
export async function leerCostesDespiece(
  cliente: ClienteEscritura,
  codigos: readonly string[],
): Promise<FilaCosteArticulo[]> {
  if (!codigos.length) return []
  return cliente.select({
    articuloCodigo: schema.articulosCoste.articuloCodigo,
    acabadoCodigo: schema.articulosCoste.acabadoCodigo,
    coste: schema.articulosCoste.coste,
  }).from(schema.articulosCoste)
    // `[...codigos]` porque `inArray` pide un array mutable; la entrada es
    // `readonly` para dejar claro que este módulo no la toca.
    .where(inArray(schema.articulosCoste.articuloCodigo, [...codigos]))
}

/**
 * Un coste por artículo, o `null` si no se puede decidir.
 *
 * El desempate es `resolverCosteCatalogo`, compartido con la mano de obra: un
 * solo criterio, no dos con el mismo nombre. Aquí se colapsa a `null` porque el
 * despiece no distingue «sin coste» de «ambiguo»; la mano de obra sí, y por eso
 * la función devuelve los tres estados.
 */
export function costePorArticuloDe(
  costes: readonly FilaCosteArticulo[],
  acabadoAplicado: string | null,
): Map<string, number | null> {
  const porArticulo = new Map<string, FilaCosteArticulo[]>()
  for (const fila of costes) {
    const filas = porArticulo.get(fila.articuloCodigo) ?? []
    filas.push(fila)
    porArticulo.set(fila.articuloCodigo, filas)
  }

  const resultado = new Map<string, number | null>()
  for (const [articuloCodigo, filas] of porArticulo) {
    const resolucion = resolverCosteCatalogo(filas, acabadoAplicado)
    resultado.set(
      articuloCodigo,
      resolucion.estado === 'RESUELTO' ? Number(resolucion.coste) : null,
    )
  }
  return resultado
}

export interface EntradaPiezasDespiece {
  piezas: readonly PiezaCortada[]
  /** Artículos YA leídos por la valoración. Aquí no se relee el catálogo. */
  mapa: ReadonlyMap<string, DatosArticuloPrecio>
  costePorArticulo: ReadonlyMap<string, number | null>
}

/**
 * Las filas de `lineas_despiece` listas para escribir. Función PURA.
 *
 * Cada pieza se calcula por separado: dos piezas del mismo artículo dan dos
 * filas, sin agregar. Es lo contrario de `valorarDespiece`, que sí agrupa por
 * artículo para aplicar mínimos y múltiplos —ahí el mínimo es del elemento, no
 * del corte—; aquí se persiste el detalle de cada corte.
 */
export function prepararPiezasDespiece(entrada: EntradaPiezasDespiece): PiezaDespiece[] {
  return entrada.piezas.map((pz) => {
    const art = entrada.mapa.get(pz.articuloCodigo)
    const coste = entrada.costePorArticulo.get(pz.articuloCodigo) ?? null
    let costeTotal: number | null = null
    if (coste !== null) {
      if (art?.tipoMetraje === 'ML') {
        // Sin largo no hay metros que cobrar: queda sin coste total, no en cero.
        costeTotal = pz.largoMm !== null ? coste * (pz.largoMm / 1000) * pz.cantidad : null
      } else {
        costeTotal = coste * pz.cantidad
      }
    }
    return {
      articuloCodigo: pz.articuloCodigo,
      cantidad: String(pz.cantidad),
      largoCorteMm: pz.largoMm !== null ? String(pz.largoMm) : null,
      anguloIzquierdo: pz.anguloIzquierdo !== null ? String(pz.anguloIzquierdo) : null,
      anguloDerecho: pz.anguloDerecho !== null ? String(pz.anguloDerecho) : null,
      funcion: pz.funcion,
      costeUnitario: coste !== null ? String(coste) : null,
      costeTotal: costeTotal !== null ? String(Math.round(costeTotal * 10000) / 10000) : null,
    }
  })
}

export interface EntradaCosteDespiece {
  piezas: readonly PiezaCortada[]
  /** Códigos únicos del despiece, ya calculados para la valoración. */
  codigos: readonly string[]
  mapa: ReadonlyMap<string, DatosArticuloPrecio>
  /** Acabado de la línea. `null` = la línea no fija acabado. */
  acabadoCodigo: string | null
}

/** Lee los costes y devuelve las piezas preparadas. */
export async function resolverCosteDespiece(
  cliente: ClienteEscritura,
  entrada: EntradaCosteDespiece,
): Promise<PiezaDespiece[]> {
  const costes = await leerCostesDespiece(cliente, entrada.codigos)
  return prepararPiezasDespiece({
    piezas: entrada.piezas,
    mapa: entrada.mapa,
    costePorArticulo: costePorArticuloDe(costes, entrada.acabadoCodigo),
  })
}
