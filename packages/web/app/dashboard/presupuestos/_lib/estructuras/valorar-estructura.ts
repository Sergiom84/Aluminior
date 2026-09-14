import { partidasValoracion } from './partidas-valoracion.ts'
import type { PartidaValoracionCerramiento } from '@aluminior/core/estructuras'
import { resolverMaterialesEstructura } from './materiales-estructura.ts'
import { lineaValorable } from '@aluminior/core/precios'
import type { ClienteEscritura } from '../cliente-db.ts'
import type {
  OpcionHerrajeElegida, PiezaDespiece, RanuraAcristalamiento,
} from '../lineas/guardar-linea.ts'
import { resolverAcristalamientoEstructura } from './acristalamiento-estructura.ts'
import { resolverOpcionesHerraje } from './herraje.ts'
import {
  articulosAmbiguos, avisoAmbiguos,
} from './pvp-articulos.ts'

export interface EntradaValoracionEstructura {
  codigo: string
  serieCodigo: string | null
  anchoMm: number | null
  altoMm: number | null
  vidrioCodigo: string | null
  varianteAcristalamiento: '1' | '2'
  acabadoCodigo: string | null
  tarifa: number
  opcionesHerraje: readonly string[]
  trazabilidad?: boolean
}

export type ResultadoValoracionEstructura =
  | { ok: false; errores: Record<string, string[]> }
  | {
      ok: true
      descripcion: string
      precioUnitario: number | null
      aviso: string | null
      piezas: PiezaDespiece[]
      acristalamiento: RanuraAcristalamiento[]
      opcionesHerraje: OpcionHerrajeElegida[]
      partidas?: PartidaValoracionCerramiento[]
      materialCompleto?: boolean
    }

/**
 * Caso de uso completo de valoración de UNA estructura.
 *
 * Extraído de la server action sin cambiar consultas, precedencias, redondeos
 * ni mensajes. La acción valida el formulario y coordina; este módulo lee el
 * catálogo, calcula y devuelve todos los satélites listos para persistir.
 */
export async function valorarEstructura(
  cliente: ClienteEscritura,
  entrada: EntradaValoracionEstructura,
): Promise<ResultadoValoracionEstructura> {
  const material = await resolverMaterialesEstructura(cliente, entrada)
  if (!material.ok) return { ok: false, errores: material.errores }
  if (!entrada.anchoMm || !entrada.altoMm || !entrada.serieCodigo) throw new Error('Material válido sin medidas')
  const { estructura, plantillaResuelta, genericos, sinResolver, sinResolverAsoc,
    variantesAplicadas, cotas, despiece, valoracion, piezas, pvp } = material
  let precioUnitario: number | null = material.precioUnitario

  const acristalamiento = await resolverAcristalamientoEstructura(cliente, {
    serieCodigo: entrada.serieCodigo,
    estructuraCodigo: entrada.codigo,
    vidrioCodigo: entrada.vidrioCodigo,
    varianteAcristalamiento: entrada.varianteAcristalamiento,
    acabadoCodigo: entrada.acabadoCodigo,
    anchoMm: entrada.anchoMm,
    altoMm: entrada.altoMm,
    tarifa: entrada.tarifa,
    plantillaResuelta,
    genericos,
    cotas,
    despiece,
    precioInicial: precioUnitario,
    trazabilidad: entrada.trazabilidad,
  })
  if (!acristalamiento.ok) return acristalamiento
  precioUnitario = acristalamiento.precio
  piezas.push(...acristalamiento.piezas)

  const problemas = [...acristalamiento.problemas]
  // Faltar un precio y sobrar son incidencias distintas y se arreglan en sitios
  // distintos del catálogo, así que cada una tiene su aviso. Los ambiguos se
  // RESTAN de `sinPrecio` antes de contarlos: sin eso, el mismo artículo salía
  // en los dos mensajes y el operador leía a la vez que no tiene precio y que
  // tiene varios, sin poder saber cuántos artículos distintos hay.
  const ambiguos = articulosAmbiguos(pvp)
  const avisoAmbiguo = avisoAmbiguos(ambiguos, 'artículos del despiece')
  if (avisoAmbiguo) problemas.push(avisoAmbiguo)
  const soloAmbiguos = new Set(ambiguos)
  const sinPrecio = valoracion.sinPrecio.filter((codigo) => !soloAmbiguos.has(codigo))
  if (sinResolver.size) {
    problemas.push(
      `${sinResolver.size} ranuras de perfil que la serie ${entrada.serieCodigo} no resuelve (quedan sin valorar)`,
    )
  }
  if (sinResolverAsoc.size) {
    problemas.push(
      `${sinResolverAsoc.size} ranuras de asociado sin valorar (herrajes, escuadras y mano de obra: pendiente)`,
    )
  }
  problemas.push(...lineaValorable({
    incalculables: despiece.incalculables,
    sinPrecio,
    sinMedida: valoracion.sinMedida,
    variablesFaltantes: despiece.variablesFaltantes,
  }).motivos)

  let aviso: string | null = null
  if (problemas.length) {
    precioUnitario = null
    aviso = `Importe incompleto: ${problemas.join('; ')}.`
  } else {
    const informativos: string[] = []
    if (variantesAplicadas > 0) {
      const nombreVariante = entrada.varianteAcristalamiento === '2' ? 'doble' : 'sencillo'
      informativos.push(
        `variante de cristal ${nombreVariante} en ${variantesAplicadas} componentes`,
      )
    }
    informativos.push(...despiece.avisos)
    if (informativos.length) aviso = `Valorado con avisos: ${informativos.join('; ')}.`
  }

  const opcionesHerraje = await resolverOpcionesHerraje(cliente, {
    serieCodigo: entrada.serieCodigo,
    estructuraCodigo: entrada.codigo,
    elegidas: entrada.opcionesHerraje,
  })
  return {
    ok: true,
    descripcion: estructura.descripcion,
    precioUnitario,
    aviso,
    piezas,
    acristalamiento: acristalamiento.acristalamiento,
    opcionesHerraje,
    materialCompleto: sinResolver.size === 0 && sinResolverAsoc.size === 0 &&
      despiece.incalculables === 0 && valoracion.sinMedida.length === 0 &&
      despiece.piezas.every(p => material.mapa.has(p.articuloCodigo)) &&
      acristalamiento.materialCompleto !== false,
    partidas: [...(entrada.trazabilidad ? partidasValoracion(valoracion.lineas, entrada, 'MATERIALES', material.filasPvp) : []),
      ...(acristalamiento.partidas ?? [])].map((p, ordinal) => ({ ...p, ordinal })),
  }
}
