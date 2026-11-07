/**
 * Nombres de catálogo para la descripción del GRUPO.
 *
 * Como máximo una consulta por tabla, aunque el cerramiento tenga varios
 * elementos. No abre conexión: usa la transacción de quien graba la línea.
 */
import { inArray } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import type { ConfiguracionCerramiento, DatosDescripcionGrupo } from '@aluminior/core/estructuras'
import type { ClienteEscritura } from '../cliente-db.ts'

export interface EntradaNombresDescripcion {
  configuracion: ConfiguracionCerramiento
  serieCodigo: string | null
  vidrioCodigo: string | null
  acabadoCodigo: string | null
}

function texto(valor: string | null | undefined): string | null {
  const recortado = valor?.trim()
  return recortado ? recortado : null
}

function variantes(codigos: Iterable<string>): string[] {
  const todos = new Set<string>()
  for (const codigo of codigos) {
    const recortado = codigo.trim()
    if (!recortado) continue
    todos.add(recortado)
    todos.add(recortado.toUpperCase())
  }
  return [...todos]
}

function mapa(filas: readonly { codigo: string; descripcion: string }[]): Map<string, string> {
  const nombres = new Map<string, string>()
  for (const fila of filas) {
    const descripcion = fila.descripcion.trim()
    const codigo = fila.codigo.trim().toUpperCase()
    if (descripcion && codigo && !nombres.has(codigo)) nombres.set(codigo, descripcion)
  }
  return nombres
}

export async function leerNombresDescripcion(
  cliente: ClienteEscritura,
  entrada: EntradaNombresDescripcion,
): Promise<DatosDescripcionGrupo> {
  const estructuras = new Set<string>()
  const articulos = new Set<string>()
  const vidrioGeneral = texto(entrada.vidrioCodigo)
  for (const modulo of entrada.configuracion.modulos) {
    const estructura = texto(modulo.estructuraCodigo)
    if (estructura) estructuras.add(estructura)
    const compacto = texto(modulo.compacto?.estructuraCodigo)
    if (compacto) estructuras.add(compacto)
    const tapajuntas = texto(modulo.tapajuntas?.estructuraCodigo)
    if (tapajuntas) estructuras.add(tapajuntas)
    const vidrio = texto(modulo.materiales?.vidrioCodigo) ?? vidrioGeneral
    if (vidrio) articulos.add(vidrio)
  }
  const acabado = texto(entrada.acabadoCodigo)

  const filasEstructura = estructuras.size
    ? await cliente.select({ codigo: schema.estructuras.codigo, descripcion: schema.estructuras.descripcion })
      .from(schema.estructuras)
      .where(inArray(schema.estructuras.codigo, variantes(estructuras)))
    : []
  const filasAcabado = acabado
    ? await cliente.select({ codigo: schema.acabados.codigo, descripcion: schema.acabados.descripcion })
      .from(schema.acabados)
      .where(inArray(schema.acabados.codigo, variantes([acabado])))
    : []
  const filasArticulo = articulos.size
    ? await cliente.select({ codigo: schema.articulos.codigo, descripcion: schema.articulos.descripcion })
      .from(schema.articulos)
      .where(inArray(schema.articulos.codigo, variantes(articulos)))
    : []

  return {
    estructuras: mapa(filasEstructura),
    acabados: mapa(filasAcabado),
    articulos: mapa(filasArticulo),
    serieCodigo: texto(entrada.serieCodigo),
    vidrioCodigo: vidrioGeneral,
    acabadoCodigo: acabado,
  }
}
