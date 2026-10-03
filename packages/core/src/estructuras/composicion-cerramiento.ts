/**
 * Composición bidimensional del cerramiento observada en Productor el
 * 25/09/2026 (docs/paridad/fase-3/01-evidencia-composicion.md): cada elemento
 * ofrece un anclaje a su derecha, alineado arriba, y otro debajo, alineado a la
 * izquierda. Cada elemento añadido cuelga de uno solo y crea una sola unión.
 *
 * Las configuraciones v1/v2 no guardan anclajes: se leen como la cadena
 * horizontal con la que se crearon, sin reescribirlas.
 */
import type { RectVisual } from './diseno.ts'
import type {
  ConfiguracionCerramiento, ConfiguracionCerramientoV3, ModuloCerramiento, UnionCerramiento,
} from './cerramiento.ts'

export type LadoAnclaje = 'derecha' | 'abajo' | 'izquierda'

export interface AnclajeModulo {
  moduloId: string
  lado: LadoAnclaje
  unionId: string
}

import { VERSION_COMPOSICION_CERRAMIENTO } from './versiones-cerramiento.ts'
export { VERSION_COMPOSICION_CERRAMIENTO }

/** Unión que crea Productor al insertar: sin código y 20 mm de grosor. */
export const UNION_SIN_CONFIGURAR = { codigo: '', grosorMm: 20 } as const

export function unionConfigurada(union: Pick<UnionCerramiento, 'codigo'>): boolean {
  return union.codigo.trim() !== ''
}

/** Anclaje de cada módulo no raíz, explícito (v3) o implícito (cadena v1/v2). */
export function anclajesCerramiento(
  configuracion: ConfiguracionCerramiento,
): ReadonlyMap<string, AnclajeModulo> {
  const anclajes = new Map<string, AnclajeModulo>()
  configuracion.modulos.forEach((modulo, indice) => {
    if (indice === 0) return
    const explicito = modulo.anclaje
    if (explicito) anclajes.set(modulo.id, explicito)
    else if (configuracion.version !== VERSION_COMPOSICION_CERRAMIENTO) {
      const union = configuracion.uniones[indice - 1]
      if (union) anclajes.set(modulo.id, {
        moduloId: configuracion.modulos[indice - 1].id, lado: 'derecha', unionId: union.id,
      })
    }
  })
  return anclajes
}

export interface PosicionesCerramiento {
  modulos: ReadonlyMap<string, RectVisual>
  uniones: ReadonlyMap<string, RectVisual>
}

/** Posiciones físicas en mm. Un padre siempre precede a sus dependientes. */
export function posicionesCerramiento(configuracion: ConfiguracionCerramiento): PosicionesCerramiento {
  const anclajes = anclajesCerramiento(configuracion)
  const uniones = new Map(configuracion.uniones.map((union) => [union.id, union]))
  const rectModulos = new Map<string, RectVisual>()
  const rectUniones = new Map<string, RectVisual>()
  for (const modulo of configuracion.modulos) {
    const anclaje = anclajes.get(modulo.id)
    const padre = anclaje && rectModulos.get(anclaje.moduloId)
    const union = anclaje && uniones.get(anclaje.unionId)
    if (!anclaje || !padre || !union) {
      rectModulos.set(modulo.id, { x: 0, y: 0, ancho: modulo.anchoMm, alto: modulo.altoMm })
      continue
    }
    if (anclaje.lado === 'derecha') {
      rectUniones.set(union.id, { x: padre.x + padre.ancho, y: padre.y,
        ancho: union.grosorMm, alto: union.longitudMm })
      rectModulos.set(modulo.id, { x: padre.x + padre.ancho + union.grosorMm, y: padre.y,
        ancho: modulo.anchoMm, alto: modulo.altoMm })
    } else if (anclaje.lado === 'izquierda') {
      rectUniones.set(union.id, { x: padre.x - union.grosorMm, y: padre.y,
        ancho: union.grosorMm, alto: union.longitudMm })
      rectModulos.set(modulo.id, { x: padre.x - union.grosorMm - modulo.anchoMm, y: padre.y,
        ancho: modulo.anchoMm, alto: modulo.altoMm })
    } else {
      rectUniones.set(union.id, { x: padre.x, y: padre.y + padre.alto,
        ancho: union.longitudMm, alto: union.grosorMm })
      rectModulos.set(modulo.id, { x: padre.x, y: padre.y + padre.alto + union.grosorMm,
        ancho: modulo.anchoMm, alto: modulo.altoMm })
    }
  }
  // Normalizar el origen permite dibujar y exportar inserciones a la izquierda
  // sin cambiar la identidad, las medidas ni los anclajes persistidos.
  const minimoX = Math.min(0, ...[...rectModulos.values()].map(rect => rect.x))
  if (minimoX < 0) {
    for (const mapa of [rectModulos, rectUniones]) {
      for (const [id, rect] of mapa) mapa.set(id, { ...rect, x: rect.x - minimoX })
    }
  }
  return { modulos: rectModulos, uniones: rectUniones }
}

export interface AnclajeLibre {
  moduloId: string
  lado: LadoAnclaje
  /** Punto del anclaje en mm: esquina superior derecha o inferior izquierda. */
  x: number
  y: number
}

function solapan(a: RectVisual, b: RectVisual): boolean {
  return a.x < b.x + b.ancho && b.x < a.x + a.ancho && a.y < b.y + b.alto && b.y < a.y + a.alto
}

/** Rectángulo que ocuparía un elemento nuevo en el anclaje, con la unión provisional. */
function rectEnAnclaje(padre: RectVisual, lado: LadoAnclaje, ancho: number, alto: number): RectVisual {
  const separacion = UNION_SIN_CONFIGURAR.grosorMm
  if (lado === 'izquierda') return { x: padre.x - separacion - ancho, y: padre.y, ancho, alto }
  return lado === 'derecha'
    ? { x: padre.x + padre.ancho + separacion, y: padre.y, ancho, alto }
    : { x: padre.x, y: padre.y + padre.alto + separacion, ancho, alto }
}

/**
 * Puntos verdes: los dos anclajes de cada elemento que aún no están usados.
 * Mejora sobre Productor, que también ofrecía anclajes ya cubiertos por otro
 * elemento: se omite el anclaje cuyo arranque cae dentro de un elemento.
 */
export function anclajesLibresCerramiento(configuracion: ConfiguracionCerramiento, incluirIzquierda = false): AnclajeLibre[] {
  const usados = new Set([...anclajesCerramiento(configuracion).values()]
    .map((anclaje) => `${anclaje.moduloId}:${anclaje.lado}`))
  const { modulos } = posicionesCerramiento(configuracion)
  const ocupados = [...modulos.values()]
  const libres: AnclajeLibre[] = []
  for (const modulo of configuracion.modulos) {
    const rect = modulos.get(modulo.id)!
    for (const lado of (incluirIzquierda ? ['derecha', 'abajo', 'izquierda'] : ['derecha', 'abajo']) as LadoAnclaje[]) {
      if (usados.has(`${modulo.id}:${lado}`)) continue
      if (ocupados.some((otro) => solapan(rectEnAnclaje(rect, lado, 1, 1), otro))) continue
      libres.push(lado === 'izquierda'
        ? { moduloId: modulo.id, lado, x: rect.x, y: rect.y }
        : lado === 'derecha'
        ? { moduloId: modulo.id, lado, x: rect.x + rect.ancho, y: rect.y }
        : { moduloId: modulo.id, lado, x: rect.x, y: rect.y + rect.alto })
    }
  }
  return libres
}

/** Anclaje libre más próximo dentro del radio, o null: soltar lejos no inserta. */
export function anclajeLibreMasProximo(
  configuracion: ConfiguracionCerramiento,
  punto: { x: number; y: number },
  radioMm: number,
): AnclajeLibre | null {
  let mejor: AnclajeLibre | null = null
  let distanciaMejor = radioMm
  for (const anclaje of anclajesLibresCerramiento(configuracion)) {
    const distancia = Math.hypot(anclaje.x - punto.x, anclaje.y - punto.y)
    if (distancia <= distanciaMejor) {
      mejor = anclaje
      distanciaMejor = distancia
    }
  }
  return mejor
}

/** Convierte una cadena implícita en anclajes explícitos sin mover nada. */
export function composicionExplicita(configuracion: ConfiguracionCerramiento): ConfiguracionCerramientoV3 {
  if (configuracion.version === VERSION_COMPOSICION_CERRAMIENTO) return configuracion
  const anclajes = anclajesCerramiento(configuracion)
  return {
    ...configuracion,
    version: VERSION_COMPOSICION_CERRAMIENTO,
    modulos: configuracion.modulos.map((modulo) => {
      const anclaje = anclajes.get(modulo.id)
      return anclaje ? { ...modulo, anclaje } : modulo
    }),
  }
}

function siguienteNumero(ids: readonly string[]): number {
  return Math.max(0, ...ids.map((id) => Number(id.match(/(\d+)$/)?.[1] ?? 0))) + 1
}

/**
 * Inserta en un anclaje libre. El elemento conserva la medida de su plantilla y
 * la unión nace sin configurar, con la longitud del lado del elemento padre.
 */
export function insertarModuloEnAnclaje(
  configuracion: ConfiguracionCerramiento,
  modulo: Omit<ModuloCerramiento, 'id' | 'anclaje'>,
  destino: { moduloId: string; lado: LadoAnclaje },
): ConfiguracionCerramiento {
  const libre = anclajesLibresCerramiento(configuracion, destino.lado === 'izquierda')
    .some((anclaje) => anclaje.moduloId === destino.moduloId && anclaje.lado === destino.lado)
  const padre = configuracion.modulos.find((actual) => actual.id === destino.moduloId)
  if (!libre || !padre) return configuracion
  const { modulos: rects } = posicionesCerramiento(configuracion)
  const nuevo = rectEnAnclaje(rects.get(padre.id)!, destino.lado, modulo.anchoMm, modulo.altoMm)
  if ([...rects.values()].some((otro) => solapan(nuevo, otro))) return configuracion
  const base = composicionExplicita(configuracion)
  const id = `modulo-${siguienteNumero(base.modulos.map((actual) => actual.id))}`
  const unionId = `union-${siguienteNumero(base.uniones.map((actual) => actual.id))}`
  return {
    ...base,
    modulos: [...base.modulos, { ...modulo, id, anclaje: { ...destino, unionId } }],
    uniones: [...base.uniones, {
      id: unionId, codigo: UNION_SIN_CONFIGURAR.codigo, grosorMm: UNION_SIN_CONFIGURAR.grosorMm,
      longitudMm: destino.lado !== 'abajo' ? padre.altoMm : padre.anchoMm,
    }],
  }
}

/** Elementos que cuelgan, directa o indirectamente, del indicado. */
export function dependientesModulo(configuracion: ConfiguracionCerramiento, id: string): string[] {
  const anclajes = anclajesCerramiento(configuracion)
  const dependientes: string[] = []
  const pendientes = [id]
  while (pendientes.length) {
    const actual = pendientes.pop()!
    for (const modulo of configuracion.modulos) {
      if (anclajes.get(modulo.id)?.moduloId === actual) {
        dependientes.push(modulo.id)
        pendientes.push(modulo.id)
      }
    }
  }
  return configuracion.modulos.map((modulo) => modulo.id).filter((actual) => dependientes.includes(actual))
}

export function esModuloRaiz(configuracion: ConfiguracionCerramiento, id: string): boolean {
  return configuracion.modulos[0]?.id === id
}

/**
 * Elimina el elemento, los que dependen de él y sus uniones. El primero es la
 * referencia de posición del conjunto y no se elimina.
 */
export function eliminarModuloConDependientes(
  configuracion: ConfiguracionCerramiento,
  id: string,
): ConfiguracionCerramiento {
  if (esModuloRaiz(configuracion, id) || !configuracion.modulos.some((modulo) => modulo.id === id)) {
    return configuracion
  }
  const anclajes = anclajesCerramiento(configuracion)
  const eliminados = new Set([id, ...dependientesModulo(configuracion, id)])
  const unionesEliminadas = new Set([...eliminados].map((actual) => anclajes.get(actual)!.unionId))
  const base = composicionExplicita(configuracion)
  const modulos = base.modulos.filter((modulo) => !eliminados.has(modulo.id))
  return {
    ...base,
    modulos,
    uniones: base.uniones.filter((union) => !unionesEliminadas.has(union.id)),
  }
}

/** Valida la estructura de anclajes explícitos de una configuración v3. */
export function anclajesV3Validos(
  modulos: readonly Partial<ModuloCerramiento>[],
  uniones: readonly Partial<UnionCerramiento>[],
): boolean {
  if (modulos[0]?.anclaje !== undefined) return false
  const vistos = new Set<string>()
  const lados = new Set<string>()
  const unionesUsadas = new Set<string>()
  const unionIds = new Set(uniones.map((union) => union.id))
  for (const [indice, modulo] of modulos.entries()) {
    if (indice > 0) {
      const anclaje = modulo.anclaje
      if (!anclaje || typeof anclaje !== 'object' || typeof anclaje.moduloId !== 'string' ||
        typeof anclaje.unionId !== 'string' || !['derecha', 'abajo', 'izquierda'].includes(anclaje.lado) ||
        !vistos.has(anclaje.moduloId) || !unionIds.has(anclaje.unionId) ||
        lados.has(`${anclaje.moduloId}:${anclaje.lado}`) || unionesUsadas.has(anclaje.unionId)) return false
      lados.add(`${anclaje.moduloId}:${anclaje.lado}`)
      unionesUsadas.add(anclaje.unionId)
    }
    if (typeof modulo.id === 'string') vistos.add(modulo.id)
  }
  return unionesUsadas.size === uniones.length
}
