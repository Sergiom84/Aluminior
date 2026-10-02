import { and, eq } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import { resolverCortesReferenciados, type ComponentePlantilla, type CorteCatalogo } from '@aluminior/core/despiece'
import type { ClienteEscritura } from '../cliente-db.ts'
import { tablasMotorCatalogo } from './catalogo-despiece/disponible.ts'

// Alcance contrastado: perfiles ordinarios de C2/C3 GMC400. Los herrajes siguen
// su propia resolución; sus códigos 222–229 nunca se convierten en perfiles.
const PERFILES = new Set(['GM440', 'GM443', 'GM455', 'GM449', 'GM450', 'GM451'])
const TIPOS_HOJA = new Map([[-1, 'G'], [10, '2HC'], [13, '3HC']])

export async function prepararCortesCatalogo(
  cliente: ClienteEscritura,
  entrada: { codigo: string; serieCodigo: string; anchoMm: number; altoMm: number },
  cotas: Record<string, number>,
) {
  if (entrada.serieCodigo !== 'GMC400' || !['C2', 'C3'].includes(entrada.codigo)) return undefined
  if (!await tablasMotorCatalogo(cliente)) return undefined
  const [referencias, descuentos] = await Promise.all([
    cliente.select().from(schema.estructuraReferenciasCorte)
      .where(eq(schema.estructuraReferenciasCorte.estructuraCodigo, entrada.codigo)),
    cliente.select().from(schema.conjuntoDescuentosCorte).where(and(
      eq(schema.conjuntoDescuentosCorte.conjuntoCodigo, entrada.serieCodigo),
      eq(schema.conjuntoDescuentosCorte.familia, '001'),
    )),
  ])
  const porLinea = new Map(referencias.map(r => [r.lineaOrigen, r]))
  const resultados = resolverCortesReferenciados(referencias.map(r => ({
    id: r.idPieza, referencia: r.idReferencia,
    formula: r.formula, formulaReferencia: r.formulaReferencia,
    grupo: r.grupo, grupoInicio: r.grupoInicio, grupoFin: r.grupoFin,
    tipoHoja: TIPOS_HOJA.get(r.tipoHoja ?? NaN) ?? null,
    perfilAdicional: r.perfilAdicional,
  })), descuentos.map(r => ({ ...r, mm: Number(r.descuentoMm) })), {
    ...cotas, A: entrada.anchoMm, L: entrada.altoMm,
  })
  return (pieza: ComponentePlantilla): CorteCatalogo | undefined => {
    if (!PERFILES.has(pieza.articuloCodigo) || !['MV', 'MH', 'HV', 'HH'].includes(pieza.funcion ?? '')) return undefined
    const referencia = pieza.lineaOrigen == null ? undefined : porLinea.get(pieza.lineaOrigen)
    if (!referencia) return { largoMm: null, incidencia: 'faltan enlaces de corte en el catálogo importado' }
    return resultados.get(referencia.idPieza) ?? { largoMm: null, incidencia: 'referencia de corte no resuelta' }
  }
}
