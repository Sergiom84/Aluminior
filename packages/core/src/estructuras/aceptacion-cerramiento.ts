/**
 * Qué impide aceptar un cerramiento, antes de valorar y sin I/O.
 *
 * Productor, al aceptar, avisa «Datos incompletos para el Elemento…» si falta
 * serie, vidrio o acabado, y «Debe seleccionar el Perfil de Unión y su Acabado»
 * si la unión no está configurada (comparativa 01/11/2026; guía, uniones;
 * fase-2 paso 6). No comprueba que el código exista en el catálogo: eso es de
 * la valoración.
 *
 * Hipótesis declaradas, no observadas: el texto que sigue a «Elemento» es la
 * identificación de la lista de Aluminior; se avisa de todas las faltas a la
 * vez; el vidrio se exige también si la estructura no tiene hueco acristalado.
 * El sufijo «(n sin configurar)» no está en el literal de Productor: identifica
 * cuántas uniones faltan cuando hay más de una.
 */
import type { ConfiguracionCerramiento, ModuloCerramiento } from './cerramiento.ts'
import { unionConfigurada } from './composicion-cerramiento.ts'

export interface GeneralesAceptacion {
  serieCodigo: string | null
  vidrioCodigo: string | null
  acabadoCodigo: string | null
}

export type CampoFaltaElemento = 'serie' | 'vidrio' | 'acabado'

export interface FaltaElemento {
  tipo: 'elemento'
  moduloId: string
  /** Misma identificación que la lista del diseñador: «código de ancho x alto». */
  identificacion: string
  campos: readonly CampoFaltaElemento[]
}

export interface FaltaUnion {
  tipo: 'union'
  unionId: string
}

/** Uniones ya configuradas cuyo acabado general no está informado. */
export interface FaltaAcabadoUnion {
  tipo: 'acabado-union'
}

export type FaltaAceptacion = FaltaElemento | FaltaUnion | FaltaAcabadoUnion

export const LITERAL_DATOS_ELEMENTO = 'Datos incompletos para el Elemento'
export const LITERAL_UNION = 'Debe seleccionar el Perfil de Unión y su Acabado'

function textoPresente(valor: string | null | undefined): boolean {
  return (valor ?? '').trim() !== ''
}

/** El propio solo pisa al general si, tras recortar, queda un código. */
function efectivo(propio: string | undefined, general: string | null): boolean {
  return textoPresente(propio) || textoPresente(general)
}

function identificacionElemento(modulo: ModuloCerramiento): string {
  return `${modulo.estructuraCodigo} de ${modulo.anchoMm} x ${modulo.altoMm}`
}

function unirCampos(campos: readonly string[]): string {
  if (campos.length <= 1) return campos[0] ?? ''
  if (campos.length === 2) return `${campos[0]} y ${campos[1]}`
  return `${campos.slice(0, -1).join(', ')} y ${campos[campos.length - 1]}`
}

/**
 * Faltas en orden de módulos y, después, de uniones. Vacía si se puede aceptar.
 * Un código vacío o solo espacios cuenta como ausente y no bloquea la herencia.
 */
export function faltasParaAceptar(
  configuracion: ConfiguracionCerramiento,
  generales: GeneralesAceptacion,
): FaltaAceptacion[] {
  const faltas: FaltaAceptacion[] = []
  for (const modulo of configuracion.modulos) {
    const campos: CampoFaltaElemento[] = []
    if (!efectivo(modulo.materiales?.serieCodigo, generales.serieCodigo)) campos.push('serie')
    if (!efectivo(modulo.materiales?.vidrioCodigo, generales.vidrioCodigo)) campos.push('vidrio')
    if (!textoPresente(generales.acabadoCodigo)) campos.push('acabado')
    if (campos.length) faltas.push({
      tipo: 'elemento', moduloId: modulo.id, identificacion: identificacionElemento(modulo), campos,
    })
  }
  let hayConfigurada = false
  for (const union of configuracion.uniones) {
    if (!unionConfigurada(union)) faltas.push({ tipo: 'union', unionId: union.id })
    else hayConfigurada = true
  }
  if (hayConfigurada && !textoPresente(generales.acabadoCodigo)) faltas.push({ tipo: 'acabado-union' })
  return faltas
}

/** Un mensaje por elemento incompleto y, como mucho, uno de unión. Todas a la vez. */
export function mensajesParaAceptar(faltas: readonly FaltaAceptacion[]): string[] {
  const mensajes = faltas.flatMap((falta) => falta.tipo === 'elemento'
    ? [`${LITERAL_DATOS_ELEMENTO} ${falta.identificacion}: falta ${unirCampos(falta.campos)}`]
    : [])
  const sinConfigurar = faltas.filter((falta) => falta.tipo === 'union').length
  const faltaAcabado = faltas.some((falta) => falta.tipo === 'acabado-union')
  if (sinConfigurar || faltaAcabado) {
    mensajes.push(sinConfigurar ? `${LITERAL_UNION} (${sinConfigurar} sin configurar)` : LITERAL_UNION)
  }
  return mensajes
}
