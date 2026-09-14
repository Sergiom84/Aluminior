import { and, eq } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import {
  ESCALA_PVP_CATALOGO, normalizarAcabado, resolverPorAcabado,
} from '@aluminior/core/precios'

type Db = ReturnType<typeof crearDb>

export interface FilaPrecioArticulo {
  acabadoCodigo: string
  precio: string
}

export type PrecioArticuloResuelto =
  | { precio: string; acabadoAplicado: string }
  | { precio: null; aviso: string }

/**
 * Resuelve el precio sin depender del orden de PostgreSQL.
 *
 * La clave contractual es (artículo, acabado, tarifa). Una fila `UNI` o `*`
 * declara que el precio no depende del acabado. Cualquier otra fila sólo se
 * puede usar cuando el operador ha elegido exactamente ese acabado.
 *
 * La DECISIÓN vive en `resolverPorAcabado` (core) desde T.73, no aquí: es el
 * mismo criterio que aplican el despiece, el acristalamiento y el vidrio, y
 * tenerlo escrito dos veces ya los hacía divergir en dos puntos. Uno, la cadena
 * vacía: aquí no contaba como genérica y en el criterio compartido sí, de modo
 * que un artículo con una única fila de acabado `''` se valoraba en una línea de
 * estructura y quedaba sin precio en una línea de artículo suelto. Dos, la
 * comparación: aquí los genéricos se comparaban en coma flotante con `Number()`,
 * que es justo lo que `decimal.ts` prohíbe para importes.
 *
 * Lo que sigue siendo de este módulo es la PRESENTACIÓN, que el criterio puro no
 * puede dar: el precio como el texto exacto de la fila —no normalizado a la
 * escala—, qué acabado acabó aplicándose, y cuál de los cuatro avisos ve el
 * operador.
 */
export function resolverPrecioArticulo(
  filas: readonly FilaPrecioArticulo[],
  acabadoSolicitado: string | null,
  tarifa: number,
): PrecioArticuloResuelto {
  const resolucion = resolverPorAcabado(
    filas.map((fila) => ({ acabadoCodigo: fila.acabadoCodigo, valor: fila.precio })),
    acabadoSolicitado,
    ESCALA_PVP_CATALOGO,
  )

  if (resolucion.estado === 'RESUELTO') {
    const ganadora = filaGanadora(filas, acabadoSolicitado)!
    return { precio: ganadora.precio, acabadoAplicado: ganadora.acabadoCodigo }
  }

  if (resolucion.estado === 'AMBIGUO') {
    // Sólo puede venir de los genéricos: la clave primaria de `articulos_pvp`
    // es (artículo, acabado, tarifa), así que un acabado exacto no se repite.
    return {
      precio: null,
      aviso: `Importe incompleto: la tarifa ${tarifa} contiene precios genéricos incompatibles para el artículo.`,
    }
  }

  if (!acabadoSolicitado && filas.length) {
    return {
      precio: null,
      aviso: 'Importe incompleto: elige un acabado con precio para este artículo.',
    }
  }

  return {
    precio: null,
    aviso: acabadoSolicitado
      ? `Importe incompleto: el artículo no tiene precio para el acabado ${acabadoSolicitado} en la tarifa ${tarifa}.`
      : `Importe incompleto: el artículo no tiene precio en la tarifa ${tarifa}.`,
  }
}

/**
 * La fila de la que sale el precio mostrado, una vez el criterio ya ha decidido
 * que hay uno. Repite la precedencia —exacto antes que genérico— porque el
 * criterio devuelve el importe, no su procedencia, y el operador necesita ver
 * qué acabado se le aplicó.
 *
 * Entre genéricos empatados gana `UNI` sobre `*`: el mismo precio con dos
 * nombres, y `UNI` es el canónico. Si no hubiera preferencia, el acabado
 * mostrado dependería del orden de las filas.
 */
function filaGanadora(
  filas: readonly FilaPrecioArticulo[],
  acabadoSolicitado: string | null,
): FilaPrecioArticulo | undefined {
  if (acabadoSolicitado !== null) {
    const exacto = normalizarAcabado(acabadoSolicitado)
    const exacta = exacto === 'UNI' ? undefined
      : filas.find((fila) => normalizarAcabado(fila.acabadoCodigo) === exacto)
    if (exacta) return exacta
  }
  const genericas = filas.filter((fila) => normalizarAcabado(fila.acabadoCodigo) === 'UNI')
  return genericas.find((fila) => fila.acabadoCodigo === 'UNI') ?? genericas[0]
}

export type ValoracionArticulo =
  | { ok: false; error: string }
  | {
      ok: true
      descripcion: string
      precioUnitario: string | null
      aviso: string | null
      acabadoAplicado: string | null
    }

/** Lee todas las candidatas de la tarifa y delega la decisión a una regla pura. */
export async function valorarArticulo(
  db: Db,
  entrada: { codigo: string; tarifa: number; acabadoCodigo: string | null },
): Promise<ValoracionArticulo> {
  const [articulo] = await db.select({
    descripcion: schema.articulos.descripcion,
    tipoMetraje: schema.articulos.tipoMetraje,
  })
    .from(schema.articulos)
    .where(eq(schema.articulos.codigo, entrada.codigo))
    .limit(1)

  if (!articulo) return { ok: false, error: 'Artículo no encontrado' }

  // Cdad son unidades del documento. El alta de artículo no captura medidas;
  // un precio por metro o m² no puede cobrarse como si fuera un precio por UD.
  if (articulo.tipoMetraje === 'ML' || articulo.tipoMetraje === 'M2') {
    return {
      ok: true,
      descripcion: articulo.descripcion,
      precioUnitario: null,
      aviso: `Importe incompleto: el artículo ${articulo.tipoMetraje} necesita medidas para calcular el metraje.`,
      acabadoAplicado: null,
    }
  }

  const filas = await db.select({
    acabadoCodigo: schema.articulosPvp.acabadoCodigo,
    precio: schema.articulosPvp.precio,
  })
    .from(schema.articulosPvp)
    .where(and(
      eq(schema.articulosPvp.articuloCodigo, entrada.codigo),
      eq(schema.articulosPvp.tarifa, entrada.tarifa),
    ))

  const resuelta = resolverPrecioArticulo(filas, entrada.acabadoCodigo, entrada.tarifa)
  return resuelta.precio === null
    ? {
        ok: true,
        descripcion: articulo.descripcion,
        precioUnitario: null,
        aviso: resuelta.aviso,
        acabadoAplicado: null,
      }
    : {
        ok: true,
        descripcion: articulo.descripcion,
        precioUnitario: resuelta.precio,
        aviso: null,
        acabadoAplicado: resuelta.acabadoAplicado,
      }
}
