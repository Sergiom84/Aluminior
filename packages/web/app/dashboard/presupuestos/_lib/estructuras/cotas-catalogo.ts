import { inArray } from 'drizzle-orm'
import { schema, type crearDb } from '@aluminior/db'
import {
  PLANTILLAS_DISENO, SIMBOLOS_COTA_MODULO, type CotaCatalogo, type CotasCatalogoPorEstructura,
  type PlantillaDiseno, type SimboloCotaModulo,
} from '@aluminior/core/estructuras'

type Db = Pick<ReturnType<typeof crearDb>, 'select'>

export interface FilaCotaCatalogo {
  estructuraCodigo: string
  simbolo: string
  valorPorDefecto: string | number | null
  nombre: string | null
  orientacion: string | null
}

const SIMBOLOS = new Set<string>(SIMBOLOS_COTA_MODULO)

function numeroCota(valor: string | number | null): number | null {
  if (valor === null || valor === '') return null
  const numero = typeof valor === 'number' ? valor : Number(valor)
  return Number.isFinite(numero) ? numero : null
}

/**
 * Agrupa una sola lectura de `estructura_cotas`. Solo entran códigos dibujables
 * y símbolos de módulo; el primero gana si el catálogo repite el símbolo.
 * Un valor ausente sigue ausente: no se convierte en cero.
 */
export function agruparCotasCatalogo(
  filas: readonly FilaCotaCatalogo[],
  dibujables: readonly string[],
): CotasCatalogoPorEstructura {
  const permitidas = new Set(dibujables.map((codigo) => codigo.trim()).filter(Boolean))
  const porEstructura = new Map<string, CotaCatalogo[]>()
  const vistos = new Set<string>()
  for (const fila of filas) {
    const estructura = fila.estructuraCodigo.trim()
    const simbolo = fila.simbolo.trim().toUpperCase()
    if (!permitidas.has(estructura) || !SIMBOLOS.has(simbolo) || vistos.has(`${estructura}:${simbolo}`)) continue
    vistos.add(`${estructura}:${simbolo}`)
    const lista = porEstructura.get(estructura) ?? []
    lista.push({
      simbolo: simbolo as SimboloCotaModulo,
      nombre: fila.nombre?.trim() || null,
      valorPorDefecto: numeroCota(fila.valorPorDefecto),
      orientacion: fila.orientacion?.trim() || null,
    })
    porEstructura.set(estructura, lista)
  }
  for (const lista of porEstructura.values()) {
    lista.sort((a, b) => SIMBOLOS_COTA_MODULO.indexOf(a.simbolo) - SIMBOLOS_COTA_MODULO.indexOf(b.simbolo))
  }
  return Object.fromEntries(porEstructura)
}

/**
 * Códigos que el configurador puede dibujar: las plantillas verificadas del
 * núcleo (2O, 1OFI, C2FI…) más las importadas. Las verificadas no vienen en
 * la lista del catálogo importado y sin ellas su cota no se mostraría.
 */
export function codigosDibujables(importadas: readonly Pick<PlantillaDiseno, 'codigo'>[]): string[] {
  return [...new Set([...PLANTILLAS_DISENO, ...importadas].map((plantilla) => plantilla.codigo))]
}

/** Una consulta para todas las estructuras dibujables, no una por elemento. */
export async function leerCotasCatalogoDiseno(
  db: Db,
  dibujables: readonly string[],
): Promise<CotasCatalogoPorEstructura> {
  const codigos = [...new Set(dibujables.map((codigo) => codigo.trim()).filter(Boolean))]
  if (codigos.length === 0) return {}
  const filas = await db.select({
    estructuraCodigo: schema.estructuraCotas.estructuraCodigo,
    simbolo: schema.estructuraCotas.simbolo,
    valorPorDefecto: schema.estructuraCotas.valorPorDefecto,
    nombre: schema.estructuraCotas.nombre,
    orientacion: schema.estructuraCotas.orientacion,
  }).from(schema.estructuraCotas)
    .where(inArray(schema.estructuraCotas.estructuraCodigo, codigos))
  return agruparCotasCatalogo(filas, codigos)
}
