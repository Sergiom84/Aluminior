/**
 * NO CONECTADO. Mapeos de carga para la migración `0021_editor_linea`
 * (aplicada en Supabase el 19/09/2026; tablas nuevas aún vacías).
 *
 * No se importa desde `importar.ts`, que vacía también documentos y clientes:
 * estos mapeos deben usarse desde un cargador de catálogo acotado (el de
 * `ConjuntosOpcionesHerraje` sustituye al actual).
 * Sólo configuración de catálogo; ningún documento ni cliente.
 */

import { bool, txt, type Fila } from '../csv.ts'

/** `ConjuntosOpcionesHerraje` con fórmulas (CHM 5.1.2.12.7.7.2). */
export function opcionHerrajeConFormulas(f: Fila): Record<string, unknown> | null {
  const conjunto = txt(f.Conjunto)
  const opcion = txt(f.nOpcion)
  if (!conjunto || !opcion) return null
  return {
    conjunto_codigo: conjunto,
    opcion_codigo: opcion,
    descripcion: txt(f.Descripcion) ?? '',
    por_defecto: bool(f.SelecDefSN),
    oculta: bool(f.OcultaSN),
    categoria: txt(f.CategoriaOH),
    activa_solo_si: txt(f.fOpcSoloActiva),
    incompatible: txt(f.fOpcIncompatible),
    descripcion_auto: bool(f.DescrAutoSN),
  }
}

/** `ConjuntosCatOH`: descripción por conjunto y `Opciones Excluyentes`. */
export function categoriaHerraje(f: Fila): Record<string, unknown> | null {
  const conjunto = txt(f.Conjunto)
  const codigo = txt(f.Codigo)
  if (!conjunto || !codigo) return null
  return {
    conjunto_codigo: conjunto,
    codigo,
    descripcion: txt(f.Descripcion) ?? '',
    excluyentes: bool(f.OpcExcluyentesSN),
  }
}

const SUFIJOS = ['', '2', '3', '4', '5'] as const

/** `Conjuntos`: una fila por opción 1..5 con alguna tabla. */
export function acristalamientosDeConjunto(f: Fila): Record<string, unknown>[] {
  const conjunto = txt(f.Codigo)
  if (!conjunto) return []
  return SUFIJOS.flatMap((sufijo, indice) => {
    const hojas = txt(f[`TablaHojas${sufijo}`])
    const fijos = txt(f[`TablaFijos${sufijo}`])
    return hojas || fijos
      ? [{ conjunto_codigo: conjunto, opcion: indice + 1, tabla_hojas: hojas, tabla_fijos: fijos }]
      : []
  })
}

/** `TAcristalamiento`: código y descripción de la tabla de junquillos. */
export function tablaAcristalamiento(f: Fila): Record<string, unknown> | null {
  const codigo = txt(f.Codigo)
  return codigo ? { codigo, descripcion: txt(f.Descripcion) ?? '' } : null
}
