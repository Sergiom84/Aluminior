/**
 * Recolocar un elemento ya colocado en otro anclaje libre (DS2, decisión de
 * Sergio del 01/11/2026). Mejora deliberada sobre Productor, donde hay que
 * eliminar y volver a arrastrar. Los elementos que colgaban del movido se
 * quedan fijos: se re-anclan a un vecino que los deje exactamente donde
 * estaban, o el movimiento se rechaza. El primero sigue siendo la referencia.
 */
import type { RectVisual } from './diseno.ts'
import type { ConfiguracionCerramiento, ConfiguracionCerramientoV3, ModuloCerramiento, UnionCerramiento } from './cerramiento.ts'
import {
  UNION_SIN_CONFIGURAR, anclajesCerramiento, anclajesLibresCerramiento, composicionExplicita, dependientesModulo,
  esModuloRaiz, insertarModuloEnAnclaje, posicionesCerramiento, type AnclajeLibre, type AnclajeModulo, type LadoAnclaje,
} from './composicion-cerramiento.ts'

export type ResultadoMover =
  | { ok: true; configuracion: ConfiguracionCerramiento }
  | { ok: false; motivo: string }

const LADOS: readonly LadoAnclaje[] = ['derecha', 'abajo', 'izquierda']

/** Dónde queda un elemento colgado de `padre` en `lado` con una unión nueva. */
function rectColgado(padre: RectVisual, lado: LadoAnclaje, hijo: RectVisual): RectVisual {
  const g = UNION_SIN_CONFIGURAR.grosorMm
  if (lado === 'derecha') return { ...hijo, x: padre.x + padre.ancho + g, y: padre.y }
  if (lado === 'izquierda') return { ...hijo, x: padre.x - g - hijo.ancho, y: padre.y }
  return { ...hijo, x: padre.x, y: padre.y + padre.alto + g }
}

const mismoRect = (a: RectVisual, b: RectVisual) =>
  a.x === b.x && a.y === b.y && a.ancho === b.ancho && a.alto === b.alto

const numero = (ids: readonly string[]) => Math.max(0, ...ids.map((id) => Number(id.match(/(\d+)$/)?.[1] ?? 0)))

/** Padres antes que dependientes, conservando el orden de creación; null si hay ciclo. */
function ordenarPorAnclajes(modulos: readonly ModuloCerramiento[]): ModuloCerramiento[] | null {
  const colocados = new Set<string>()
  const orden: ModuloCerramiento[] = []
  let pendientes = [...modulos]
  while (pendientes.length) {
    const listos = pendientes.filter((m, i) => (i === 0 && orden.length === 0 && !m.anclaje)
      || (m.anclaje !== undefined && colocados.has(m.anclaje.moduloId)))
    if (!listos.length) return null
    for (const m of listos) { orden.push(m); colocados.add(m.id) }
    pendientes = pendientes.filter((m) => !colocados.has(m.id))
  }
  return orden
}

/** Quita el elemento dejando fijos los que colgaban de él, o explica por qué no se puede. */
function quitarDejandoFijos(configuracion: ConfiguracionCerramiento, id: string): ConfiguracionCerramientoV3 | string {
  const base = composicionExplicita(configuracion)
  const anclajes = anclajesCerramiento(base)
  const rects = posicionesCerramiento(base).modulos
  const hijos = base.modulos.filter((m) => m.anclaje?.moduloId === id)
  const excluidos = new Set([id, ...dependientesModulo(base, id)])
  const usados = new Set([...anclajes.entries()]
    .filter(([moduloId, anclaje]) => moduloId !== id && anclaje.moduloId !== id)
    .map(([, anclaje]) => `${anclaje.moduloId}:${anclaje.lado}`))
  let siguienteUnion = numero(base.uniones.map((u) => u.id))
  const nuevos = new Map<string, AnclajeModulo>()
  const uniones: UnionCerramiento[] = []
  for (const hijo of hijos) {
    const rect = rects.get(hijo.id)!
    const destino = base.modulos.filter((m) => !excluidos.has(m.id))
      .flatMap((padre) => LADOS.map((lado) => ({ padre, lado })))
      .find(({ padre, lado }) => !usados.has(`${padre.id}:${lado}`)
        && mismoRect(rectColgado(rects.get(padre.id)!, lado, rect), rect))
    if (!destino) return 'Hay elementos colgados de este que no pueden quedarse fijos en su sitio.'
    usados.add(`${destino.padre.id}:${destino.lado}`)
    const unionId = `union-${++siguienteUnion}`
    nuevos.set(hijo.id, { moduloId: destino.padre.id, lado: destino.lado, unionId })
    uniones.push({ id: unionId, codigo: UNION_SIN_CONFIGURAR.codigo, grosorMm: UNION_SIN_CONFIGURAR.grosorMm,
      longitudMm: destino.lado === 'abajo' ? destino.padre.anchoMm : destino.padre.altoMm })
  }
  const descartadas = new Set([anclajes.get(id)!.unionId, ...hijos.map((h) => h.anclaje!.unionId)])
  const modulos = ordenarPorAnclajes(base.modulos.filter((m) => m.id !== id)
    .map((m) => nuevos.has(m.id) ? { ...m, anclaje: nuevos.get(m.id) } : m))
  if (!modulos) return 'Hay elementos colgados de este que no pueden quedarse fijos en su sitio.'
  return { ...base, modulos, uniones: [...base.uniones.filter((u) => !descartadas.has(u.id)), ...uniones] }
}

/**
 * Mueve el elemento al anclaje indicado. Su unión y las de los elementos
 * re-anclados nacen sin configurar, porque unen piezas distintas.
 */
export function moverModuloCerramiento(
  configuracion: ConfiguracionCerramiento,
  id: string,
  destino: { moduloId: string; lado: LadoAnclaje },
): ResultadoMover {
  const modulo = configuracion.modulos.find((m) => m.id === id)
  if (!modulo || esModuloRaiz(configuracion, id)) {
    return { ok: false, motivo: 'El primer elemento es la referencia del conjunto y no se mueve.' }
  }
  if (destino.moduloId === id) return { ok: false, motivo: 'Un elemento no puede colocarse junto a sí mismo.' }
  const actual = anclajesCerramiento(configuracion).get(id)
  if (actual?.moduloId === destino.moduloId && actual.lado === destino.lado) return { ok: true, configuracion }
  const sin = quitarDejandoFijos(configuracion, id)
  if (typeof sin === 'string') return { ok: false, motivo: sin }
  const { id: _id, anclaje: _anclaje, ...resto } = modulo
  const movida = insertarModuloEnAnclaje(sin, resto, destino)
  if (movida === sin) return { ok: false, motivo: 'No cabe ahí sin solapar otro elemento.' }
  const nuevoId = movida.modulos.at(-1)!.id
  return { ok: true, configuracion: {
    ...movida, modulos: movida.modulos.map((m) => m.id === nuevoId ? { ...m, id } : m),
  } }
}

/** Anclajes donde puede soltarse el elemento, en coordenadas del conjunto actual. */
export function anclajesParaMover(configuracion: ConfiguracionCerramiento, id: string): AnclajeLibre[] {
  if (esModuloRaiz(configuracion, id) || !configuracion.modulos.some((m) => m.id === id)) return []
  const sin = quitarDejandoFijos(configuracion, id)
  if (typeof sin === 'string') return []
  const raiz = configuracion.modulos[0].id
  const antes = posicionesCerramiento(configuracion).modulos.get(raiz)!
  const despues = posicionesCerramiento(sin).modulos.get(raiz)!
  const actual = anclajesCerramiento(configuracion).get(id)
  return anclajesLibresCerramiento(sin, true)
    .filter((a) => !(a.moduloId === actual?.moduloId && a.lado === actual.lado))
    .filter((a) => moverModuloCerramiento(configuracion, id, a).ok)
    .map((a) => ({ ...a, x: a.x + antes.x - despues.x, y: a.y + antes.y - despues.y }))
}
