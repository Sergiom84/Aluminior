/**
 * Diseño propio de un elemento del cerramiento (DS4): el árbol de nodos de
 * `Diseño V3` persistido en la configuración del módulo (`v3`).
 *
 * Entrada pública del submódulo: reexporta la validación y la proyección visual
 * (que consume `resolverRegiones`, la misma lectura del árbol que el precio) y
 * ofrece la generación de plantilla y la escritura inmutable sobre la línea.
 */
import {
  generarPlantillaDisenoPropio, TIPO_COTA, TIPO_NODO,
} from '../despiece/diseno-propio/index.ts'
import type { FilaPlantillaCatalogo } from '../despiece/linea-catalogo/tipos.ts'
import type { ConfiguracionCerramiento, ModuloCerramiento } from './cerramiento.ts'
import { cotasEfectivasModulo } from './cotas-cerramiento.ts'
import { composicionExplicita } from './composicion-cerramiento.ts'
import { plantillaDiseno } from './diseno.ts'
import {
  composicionVisualDisenoPropio, lineasBarrotilloVisual,
  type DisenoPropioModulo, type SegmentoBarrotillo,
} from './diseno-propio/composicion-visual.ts'
import {
  inspeccionarDisenoPropio,
  type DivisionEditableDiseno, type HuecoEditableDiseno,
  type InspeccionDisenoPropio, type ModoHuecoEditable,
} from './diseno-propio/inspeccionar.ts'
import {
  actualizarDivisionDisenoPropio, cambiarBarrotilloHuecoDisenoPropio,
  cambiarHojaHuecoDisenoPropio, cambiarVidrioHuecoDisenoPropio,
  dividirHuecoDisenoPropio, eliminarDivisionDisenoPropio,
  type SeleccionHojaHueco,
} from './diseno-propio/operaciones.ts'
import { normalizarArbolDiseno, sembrarDisenoPropioModulo } from './diseno-propio/sembrar.ts'
import { disenoPropioModuloValido } from './diseno-propio/validar.ts'
import {
  VERSION_COMPOSICION_CERRAMIENTO, VERSION_CONFIGURACION_CERRAMIENTO,
} from './versiones-cerramiento.ts'

export {
  actualizarDivisionDisenoPropio, cambiarBarrotilloHuecoDisenoPropio,
  cambiarHojaHuecoDisenoPropio, cambiarVidrioHuecoDisenoPropio,
  composicionVisualDisenoPropio, disenoPropioModuloValido,
  dividirHuecoDisenoPropio, eliminarDivisionDisenoPropio,
  inspeccionarDisenoPropio, lineasBarrotilloVisual,
  normalizarArbolDiseno, sembrarDisenoPropioModulo,
  type DisenoPropioModulo, type DivisionEditableDiseno, type HuecoEditableDiseno,
  type InspeccionDisenoPropio, type ModoHuecoEditable,
  type SegmentoBarrotillo, type SeleccionHojaHueco,
}

/** Plantilla de despiece generada para el módulo, o `null` si no lleva diseño propio. */
export function plantillaDisenoPropioModulo(
  modulo: Pick<ModuloCerramiento, 'disenoPropio'>,
): readonly FilaPlantillaCatalogo[] | null {
  if (!modulo.disenoPropio) return null
  const r = generarPlantillaDisenoPropio({ nodos: modulo.disenoPropio.nodos })
  return r.ok ? r.filas : null
}

/** Altura del fijo de abajo (`FI` variable) que hay que escribir en la línea. */
function alturaFijoAbajo(diseno: DisenoPropioModulo): number | null {
  for (const n of diseno.nodos) {
    if (n.tipo === TIPO_NODO.travesano && n.tipoCota === TIPO_COTA.variable && n.simbolo?.trim() === 'FI' &&
      typeof n.cota === 'number' && Number.isFinite(n.cota) && n.cota > 0) return n.cota
  }
  return null
}

/** Misma escritura que `actualizarFiModuloCerramiento`: `fiMm` solo en `1OFI`. */
function escribirFiEnLinea(
  configuracion: ConfiguracionCerramiento,
  id: string,
  fiMm: number,
): ConfiguracionCerramiento {
  const modulo = configuracion.modulos.find(actual => actual.id === id)
  if (!modulo || plantillaDiseno(modulo.estructuraCodigo)?.codigo !== '1OFI') return configuracion
  return {
    ...configuracion,
    version: configuracion.version === VERSION_COMPOSICION_CERRAMIENTO
      ? VERSION_COMPOSICION_CERRAMIENTO : VERSION_CONFIGURACION_CERRAMIENTO,
    modulos: configuracion.modulos.map(actual => actual.id === id ? { ...actual, fiMm } : actual),
  }
}

/**
 * Asigna o quita (`null`) el diseño propio de un módulo. En `1OFI` la altura
 * del fijo de abajo se escribe en `fiMm`. No aplica el cambio si el diseño
 * no cabe con esa altura.
 */
export function actualizarDisenoPropioModuloCerramiento(
  configuracion: ConfiguracionCerramiento,
  id: string,
  disenoPropio: DisenoPropioModulo | null,
): ConfiguracionCerramiento {
  const actual = configuracion.modulos.find(m => m.id === id)
  if (!actual) return configuracion
  if (disenoPropio === null) {
    if (!Object.hasOwn(actual, 'disenoPropio')) return configuracion
    return {
      ...configuracion,
      modulos: configuracion.modulos.map(m => {
        if (m.id !== id) return m
        const { disenoPropio: _quitar, ...resto } = m
        return resto
      }),
    }
  }
  const altura = alturaFijoAbajo(disenoPropio)
  const conLinea = altura === null ? configuracion : escribirFiEnLinea(configuracion, id, altura)
  const modulo = conLinea.modulos.find(m => m.id === id) ?? actual
  if (!disenoPropioModuloValido(disenoPropio, modulo.anchoMm, modulo.altoMm, cotasEfectivasModulo(modulo))) {
    return configuracion
  }
  const base = composicionExplicita(conLinea)
  const copia: DisenoPropioModulo = {
    nodos: disenoPropio.nodos.map(n => ({
      ...n,
      ...(n.cortes ? { cortes: [...n.cortes] } : {}),
      ...(n.accesorios ? { accesorios: [...n.accesorios] } : {}),
    })),
  }
  return {
    ...base,
    modulos: base.modulos.map(m => m.id === id ? { ...m, disenoPropio: copia } : m),
  }
}
