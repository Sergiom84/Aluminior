import { and, eq } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'

type Db = ReturnType<typeof crearDb>

export interface FilaPrecioArticulo {
  acabadoCodigo: string
  precio: string
}

export type PrecioArticuloResuelto =
  | { precio: string; acabadoAplicado: string }
  | { precio: null; aviso: string }

const ACABADOS_GENERICOS = new Set(['UNI', '*'])

/**
 * Resuelve el precio sin depender del orden de PostgreSQL.
 *
 * La clave contractual es (artículo, acabado, tarifa). Una fila `UNI` o `*`
 * declara que el precio no depende del acabado. Cualquier otra fila sólo se
 * puede usar cuando el operador ha elegido exactamente ese acabado.
 */
export function resolverPrecioArticulo(
  filas: readonly FilaPrecioArticulo[],
  acabadoSolicitado: string | null,
  tarifa: number,
): PrecioArticuloResuelto {
  if (acabadoSolicitado && !ACABADOS_GENERICOS.has(acabadoSolicitado)) {
    const exacta = filas.find((fila) => fila.acabadoCodigo === acabadoSolicitado)
    if (exacta) return { precio: exacta.precio, acabadoAplicado: exacta.acabadoCodigo }
  }

  const genericas = filas.filter((fila) => ACABADOS_GENERICOS.has(fila.acabadoCodigo))
  if (genericas.length) {
    const importes = new Set(genericas.map((fila) => Number(fila.precio)))
    if (importes.size === 1) {
      const generica = genericas.find((fila) => fila.acabadoCodigo === 'UNI') ?? genericas[0]!
      return { precio: generica.precio, acabadoAplicado: generica.acabadoCodigo }
    }
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
  const [articulo] = await db.select({ descripcion: schema.articulos.descripcion })
    .from(schema.articulos)
    .where(eq(schema.articulos.codigo, entrada.codigo))
    .limit(1)

  if (!articulo) return { ok: false, error: 'Artículo no encontrado' }

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
