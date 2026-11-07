/**
 * Elemento invisible (DS3): un elemento del conjunto que representa un espacio
 * que no se instala, normalmente una viga o un trozo de pared.
 *
 * Evidencia (GUIA-DISENADOR-PRODUCTOR, CONTRASTE-PRESUPUESTOS-2026-11-02,
 * 8 de 8 en 0015–0017): precio 0 y sin despiece; cuenta en el ancho y en las
 * uniones, que se mantienen y se valoran; aparece en la descripción del GRUPO;
 * en el diseñador queda un hueco en blanco. Solo existe en la composición v3.
 */
import type { ConfiguracionCerramiento, ModuloCerramiento } from './cerramiento.ts'
import { composicionExplicita } from './composicion-cerramiento.ts'

export function esModuloInvisible(modulo: Pick<ModuloCerramiento, 'invisible'>): boolean {
  return modulo.invisible === true
}

/** Ausente o `true`; nunca `false` guardado, para que no haya dos formas de decir «visible». */
export function invisibleValido(valor: unknown): boolean {
  return valor === undefined || valor === true
}

export function cambiarInvisibleModulo(
  configuracion: ConfiguracionCerramiento,
  id: string,
  invisible: boolean,
): ConfiguracionCerramiento {
  const actual = configuracion.modulos.find((modulo) => modulo.id === id)
  if (!actual || esModuloInvisible(actual) === invisible) return configuracion
  const base = composicionExplicita(configuracion)
  return {
    ...base,
    modulos: base.modulos.map((modulo) => {
      if (modulo.id !== id) return modulo
      const { invisible: _anterior, ...resto } = modulo
      return invisible ? { ...resto, invisible: true } : resto
    }),
  }
}
