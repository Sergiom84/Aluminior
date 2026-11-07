import { plantillaDiseno, UNIONES_VISUALES } from './diseno.ts'
import { unionAdmitida, type CatalogoAdmision } from './catalogo-uniones.ts'
import { cotasModuloValidas } from './cotas-cerramiento.ts'
import { compactoModuloValido } from './compacto-cerramiento.ts'
import { resolverGeometriaFi1Ofi } from './geometria-1ofi.ts'
import { resolverGeometriaComposicion } from './geometria-composicion.ts'
import { materialesModuloValidos, materialesUnionValidos } from './materiales-cerramiento.ts'
import { invisibleValido } from './elemento-invisible.ts'
import { anclajesV3Validos, VERSION_COMPOSICION_CERRAMIENTO } from './composicion-cerramiento.ts'
import type { ConfiguracionCerramiento } from './cerramiento.ts'
import { VERSION_CONFIGURACION_CERRAMIENTO } from './versiones-cerramiento.ts'

/**
 * Guarda de datos recibidos del navegador o leídos de la base. Al escribir se
 * pasa el catálogo cargado; al leer un snapshot guardado, `CATALOGO_SNAPSHOT`.
 */
export function esConfiguracionCerramiento(
  valor: unknown,
  catalogo: CatalogoAdmision = UNIONES_VISUALES,
): valor is ConfiguracionCerramiento {
  if (!valor || typeof valor !== 'object') return false
  const candidato = valor as Partial<ConfiguracionCerramiento>
  if ((candidato.version !== 1 && candidato.version !== VERSION_CONFIGURACION_CERRAMIENTO &&
      candidato.version !== VERSION_COMPOSICION_CERRAMIENTO) ||
      !Array.isArray(candidato.modulos) || !Array.isArray(candidato.uniones) ||
      candidato.modulos.length === 0 ||
      candidato.uniones.length !== candidato.modulos.length - 1 ||
      (Object.hasOwn(candidato, 'repartoUniones') && candidato.repartoUniones !== 'PIEZAS')) return false
  const modulosValidos = candidato.modulos.every((modulo) => {
    if (!modulo || typeof modulo.id !== 'string' || typeof modulo.estructuraCodigo !== 'string' ||
      !Number.isFinite(modulo.anchoMm) || modulo.anchoMm <= 0 ||
      !Number.isFinite(modulo.altoMm) || modulo.altoMm <= 0) return false
    if (candidato.version !== VERSION_COMPOSICION_CERRAMIENTO &&
      (Object.hasOwn(modulo, 'anclaje') || Object.hasOwn(modulo, 'materiales') || Object.hasOwn(modulo, 'cotas') || Object.hasOwn(modulo, 'compacto') || Object.hasOwn(modulo, 'invisible'))) return false
    if (!invisibleValido(modulo.invisible)) return false
    if (!materialesModuloValidos(modulo.materiales) || !cotasModuloValidas(modulo.cotas, modulo.altoMm, modulo.anchoMm) || !compactoModuloValido(modulo.compacto)) return false
    const plantilla = plantillaDiseno(modulo.estructuraCodigo)
    if (!plantilla) return false
    if (!resolverGeometriaComposicion(plantilla.composicion, modulo.anchoMm, modulo.altoMm).valido) return false
    const tieneFi = Object.hasOwn(modulo, 'fiMm')
    if (candidato.version === 1) return !tieneFi
    if (plantilla.codigo !== '1OFI') return !tieneFi
    if (!tieneFi) return true
    return resolverGeometriaFi1Ofi(modulo.anchoMm, modulo.altoMm, modulo.fiMm).valido
  })
  const unionesValidas = candidato.uniones.every((union) =>
    union && typeof union.id === 'string' && typeof union.codigo === 'string' &&
    (candidato.version === VERSION_COMPOSICION_CERRAMIENTO || !Object.hasOwn(union, 'materiales')) &&
    materialesUnionValidos(union.materiales) &&
    unionAdmitida(union, catalogo) &&
    Number.isFinite(union.longitudMm) && union.longitudMm > 0 &&
    Number.isFinite(union.grosorMm))
  const ids = [...candidato.modulos.map((modulo) => modulo.id),
    ...candidato.uniones.map((union) => union.id)]
  const versionCoherente = candidato.version === VERSION_COMPOSICION_CERRAMIENTO
    ? anclajesV3Validos(candidato.modulos, candidato.uniones)
    : candidato.version === 1 || candidato.modulos.some((modulo) => Object.hasOwn(modulo, 'fiMm'))
  return modulosValidos && unionesValidas && versionCoherente && new Set(ids).size === ids.length
}
