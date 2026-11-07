/**
 * Descripción generada de la línea GRUPO, al aceptar el cerramiento.
 *
 * Un bloque por elemento, en el orden de `configuracion.modulos`. Las medidas
 * son las nominales del elemento, no las de fabricación ni las del conjunto.
 * La unión no entra. Sin I/O: los nombres ya vienen resueltos.
 *
 * Evidencia: RECON-CERRAMIENTOS §4 ter y comparativa 01/11, casos 1–4.
 * La serie se muestra como código: la tabla de series no tiene descripción
 * migrada (DG1b). El orden cuando la composición no es una cadena sigue el
 * array de módulos; eso es hipótesis hasta verlo en Productor.
 */
import type { ConfiguracionCerramiento, ModuloCerramiento } from './cerramiento.ts'
import { plantillaDiseno } from './diseno.ts'
import { formatoMedida } from './formato-medida.ts'

export interface DatosDescripcionGrupo {
  /** Clave: código recortado en mayúsculas. Valor: texto del catálogo, sin transformar. */
  readonly estructuras: ReadonlyMap<string, string>
  readonly acabados: ReadonlyMap<string, string>
  readonly articulos: ReadonlyMap<string, string>
  readonly serieCodigo: string | null
  readonly vidrioCodigo: string | null
  readonly acabadoCodigo: string | null
}

function clave(codigo: string | null | undefined): string | null {
  const texto = codigo?.trim()
  return texto ? texto.toUpperCase() : null
}

function resuelto(mapa: ReadonlyMap<string, string>, codigo: string | null | undefined): string | null {
  const id = clave(codigo)
  if (!id) return null
  const texto = mapa.get(id)?.trim()
  return texto || null
}

function descripcionElemento(codigo: string, datos: DatosDescripcionGrupo): string {
  return resuelto(datos.estructuras, codigo) ?? plantillaDiseno(codigo)?.descripcion ?? codigo.trim()
}

function serieDe(modulo: ModuloCerramiento, datos: DatosDescripcionGrupo): string | null {
  const propio = modulo.materiales?.serieCodigo?.trim()
  if (propio) return propio
  return datos.serieCodigo?.trim() || null
}

function vidrioDe(modulo: ModuloCerramiento, datos: DatosDescripcionGrupo): string | null {
  const codigo = modulo.materiales?.vidrioCodigo?.trim() || datos.vidrioCodigo?.trim() || null
  if (!codigo) return null
  return resuelto(datos.articulos, codigo)
}

function bloque(modulo: ModuloCerramiento, datos: DatosDescripcionGrupo): string {
  const lineas = [
    `${descripcionElemento(modulo.estructuraCodigo, datos)} DE MEDIDAS : ${formatoMedida(modulo.anchoMm)} x ${formatoMedida(modulo.altoMm)}`,
  ]
  const color = resuelto(datos.acabados, datos.acabadoCodigo)
  if (color) lineas.push(`EN COLOR ${color}`)
  const serie = serieDe(modulo, datos)
  if (serie) lineas.push(serie)
  const vidrio = vidrioDe(modulo, datos)
  if (vidrio) lineas.push(vidrio)
  if (modulo.compacto) {
    const compacto = resuelto(datos.estructuras, modulo.compacto.estructuraCodigo)
    if (compacto) lineas.push(compacto)
  }
  if (modulo.tapajuntas) {
    const tapajuntas = resuelto(datos.estructuras, modulo.tapajuntas.estructuraCodigo)
    if (tapajuntas) lineas.push(tapajuntas)
  }
  return lineas.join('\n')
}

export function descripcionGrupo(
  configuracion: ConfiguracionCerramiento,
  datos: DatosDescripcionGrupo,
): string {
  return configuracion.modulos.map((modulo) => bloque(modulo, datos)).join('\n\n')
}
