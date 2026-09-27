import { plantillaDiseno, UNIONES_VISUALES } from './diseno.ts'
import { resolverGeometriaFi1Ofi } from './geometria-1ofi.ts'
import { materialesModuloValidos } from './materiales-cerramiento.ts'
import {
  anclajesV3Validos, unionConfigurada, VERSION_COMPOSICION_CERRAMIENTO,
} from './composicion-cerramiento.ts'
import type { ConfiguracionCerramiento } from './cerramiento.ts'
import { VERSION_CONFIGURACION_CERRAMIENTO } from './versiones-cerramiento.ts'

/** Guarda de datos recibidos del navegador o leídos de la base. */
export function esConfiguracionCerramiento(valor: unknown): valor is ConfiguracionCerramiento {
  if (!valor || typeof valor !== 'object') return false
  const candidato = valor as Partial<ConfiguracionCerramiento>
  if ((candidato.version !== 1 && candidato.version !== VERSION_CONFIGURACION_CERRAMIENTO &&
      candidato.version !== VERSION_COMPOSICION_CERRAMIENTO) ||
      !Array.isArray(candidato.modulos) || !Array.isArray(candidato.uniones) ||
      candidato.modulos.length === 0 ||
      candidato.uniones.length !== candidato.modulos.length - 1) return false
  const modulosValidos = candidato.modulos.every((modulo) => {
    if (!modulo || typeof modulo.id !== 'string' || typeof modulo.estructuraCodigo !== 'string' ||
      !Number.isInteger(modulo.anchoMm) || modulo.anchoMm <= 0 ||
      !Number.isInteger(modulo.altoMm) || modulo.altoMm <= 0) return false
    if (candidato.version !== VERSION_COMPOSICION_CERRAMIENTO &&
      (Object.hasOwn(modulo, 'anclaje') || Object.hasOwn(modulo, 'materiales'))) return false
    if (!materialesModuloValidos(modulo.materiales)) return false
    const plantilla = plantillaDiseno(modulo.estructuraCodigo)
    if (!plantilla) return false
    const tieneFi = Object.hasOwn(modulo, 'fiMm')
    if (candidato.version === 1) return !tieneFi
    if (plantilla.codigo !== '1OFI') return !tieneFi
    if (!tieneFi) return true
    return resolverGeometriaFi1Ofi(modulo.anchoMm, modulo.altoMm, modulo.fiMm).valido
  })
  const unionesValidas = candidato.uniones.every((union) =>
    union && typeof union.id === 'string' && typeof union.codigo === 'string' &&
    (!unionConfigurada(union) || UNIONES_VISUALES.some((catalogo) => catalogo.codigo === union.codigo)) &&
    Number.isFinite(union.longitudMm) && union.longitudMm > 0 &&
    Number.isFinite(union.grosorMm) && (union.grosorMm > 0 ||
      (union.grosorMm === 0 && UNIONES_VISUALES.some(c => c.codigo === union.codigo && c.unionTipo === 4))))
  const ids = [...candidato.modulos.map((modulo) => modulo.id),
    ...candidato.uniones.map((union) => union.id)]
  const versionCoherente = candidato.version === VERSION_COMPOSICION_CERRAMIENTO
    ? anclajesV3Validos(candidato.modulos, candidato.uniones)
    : candidato.version === 1 || candidato.modulos.some((modulo) => Object.hasOwn(modulo, 'fiMm'))
  return modulosValidos && unionesValidas && versionCoherente && new Set(ids).size === ids.length
}
