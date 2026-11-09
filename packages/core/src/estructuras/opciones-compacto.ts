/**
 * Opciones de compacto que el operador puede ver y que el despiece necesita
 * para no dejar la ventana sin valorar.
 *
 * La tabla `estructura_opciones_accesorio` de la base que usa la web está vacía.
 * Estas funciones cubren ese hueco con el catálogo exportado de EMP0016, sin
 * inventar una opción cuando el grupo no tiene ninguna.
 */
import type { CompactoModulo } from './compacto-cerramiento.ts'
import { alturaCajonCompacto, type TramoAlturaCajon } from './editor-linea/compacto.ts'
import {
  CATALOGO_OPCIONES_COMPACTO, type GrupoCatalogoCompacto,
} from './opciones-compacto-catalogo.ts'

/** 155 hasta 1.600 mm; 185 por encima. El tramo de 200 mm no está demostrado. */
export const TRAMOS_CAJON_OBSERVADOS: readonly TramoAlturaCajon[] = [
  { altoCajonMm: 155, desdeMm: 0, hastaMm: 1600 },
  { altoCajonMm: 185, desdeMm: 1601, hastaMm: 100000 },
]

const TERMINO = /^G(\d+)O(\d+)$/i

export function gruposOpcionesCompacto(codigo: string): readonly GrupoCatalogoCompacto[] {
  return CATALOGO_OPCIONES_COMPACTO[codigo.trim().toUpperCase()] ?? []
}

/** Grupos con al menos una opción elegible. Los vacíos no se muestran ni se marcan. */
export function gruposOpcionesVisibles(codigo: string): readonly GrupoCatalogoCompacto[] {
  return gruposOpcionesCompacto(codigo).filter((grupo) => grupo.opciones.length > 0)
}

export function opcionesPredeterminadasCompacto(codigo: string): string[] {
  return gruposOpcionesVisibles(codigo).flatMap((grupo) => {
    const pred = grupo.opciones.find((opcion) => opcion.predeterminada) ?? grupo.opciones[0]
    return pred ? [`G${grupo.grupo}O${pred.opcion}`] : []
  })
}

export function opcionMarcadaCompacto(opciones: readonly string[] | undefined, grupo: number): number | null {
  for (const marca of opciones ?? []) {
    const termino = TERMINO.exec(marca.trim())
    if (termino && Number(termino[1]) === grupo) return Number(termino[2])
  }
  return null
}

export function marcarOpcionCompacto(
  opciones: readonly string[] | undefined, grupo: number, opcion: number,
): string[] {
  const resto = (opciones ?? []).filter((marca) => {
    const termino = TERMINO.exec(marca.trim())
    return !termino || Number(termino[1]) !== grupo
  })
  return [...resto, `G${grupo}O${opcion}`]
}

export function tituloGrupoCompacto(codigo: string, grupo: number): string | null {
  return gruposOpcionesCompacto(codigo).find((item) => item.grupo === grupo)?.titulo ?? null
}

/** Traduce el aviso interno del despiece al nombre que ve el operador. */
export function explicarIncidenciaCompacto(incidencia: string): string {
  const marca = /^accesorio (\S+): grupo G(\d+) sin una opción marcada$/.exec(incidencia)
  if (!marca) return incidencia
  const titulo = tituloGrupoCompacto(marca[1]!, Number(marca[2]))
  return titulo
    ? `compacto ${marca[1]}: falta elegir ${titulo}`
    : `compacto ${marca[1]}: falta elegir la opción ${marca[2]}`
}

export function compactoAlElegir(
  codigo: string, altoHuecoMm: number, previo?: CompactoModulo | null,
): CompactoModulo {
  const estructura = codigo.trim().toUpperCase()
  const mismo = previo?.estructuraCodigo.trim().toUpperCase() === estructura
  return {
    estructuraCodigo: estructura,
    altoCajonMm: mismo
      ? previo!.altoCajonMm
      : alturaCajonCompacto(TRAMOS_CAJON_OBSERVADOS, altoHuecoMm) ?? 155,
    descontarHueco: mismo ? previo!.descontarHueco ?? true : true,
    opciones: mismo && previo!.opciones?.length
      ? [...previo!.opciones]
      : opcionesPredeterminadasCompacto(estructura),
    ...(previo?.guiaIzquierda ? { guiaIzquierda: previo.guiaIzquierda } : {}),
    ...(previo?.guiaDerecha ? { guiaDerecha: previo.guiaDerecha } : {}),
    ...(mismo && previo?.acabadoCodigo ? { acabadoCodigo: previo.acabadoCodigo } : {}),
  }
}

/**
 * La base manda cuando tiene predeterminadas. Si no tiene ninguna fila de esa
 * estructura, se usan las del catálogo exportado.
 */
export function fusionarOpcionesPredeterminadas(
  pedidas: readonly string[],
  desdeBd: ReadonlyMap<string, readonly string[]>,
): Map<string, readonly string[]> {
  const resultado = new Map<string, readonly string[]>()
  for (const codigo of pedidas) {
    const clave = codigo.trim().toUpperCase()
    if (!clave || resultado.has(clave)) continue
    const guardadas = desdeBd.get(clave) ?? desdeBd.get(codigo)
    resultado.set(clave, guardadas && guardadas.length ? [...guardadas] : opcionesPredeterminadasCompacto(clave))
  }
  return resultado
}
