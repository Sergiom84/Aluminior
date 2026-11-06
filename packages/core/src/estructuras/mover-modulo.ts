/**
 * Recolocar un elemento ya colocado en otro anclaje libre (DS2, decisión de
 * Sergio del 01/11/2026). Mejora deliberada sobre Productor, donde hay que
 * eliminar y volver a arrastrar. Los elementos que colgaban del movido se
 * quedan fijos: se re-anclan a un vecino que los deje exactamente donde
 * estaban, o el movimiento se rechaza. Si se mueve el primero, la referencia
 * pasa a otro elemento que deje a todos en su sitio.
 */
import type { RectVisual } from './diseno.ts'
import type { ConfiguracionCerramiento, ConfiguracionCerramientoV3, ModuloCerramiento, UnionCerramiento } from './cerramiento.ts'
import {
  UNION_SIN_CONFIGURAR, anclajesCerramiento, anclajesLibresCerramiento, composicionExplicita,
  insertarModuloEnAnclaje, posicionesCerramiento, type AnclajeLibre, type AnclajeModulo, type LadoAnclaje,
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

const NO_FIJOS = 'Hay elementos colgados de este que no pueden quedarse fijos en su sitio.'

/**
 * Reconstruye los anclajes sin `quitado` partiendo de `raiz`: cada pieza
 * conserva su anclaje si su padre sigue colocado; si no, se re-ancla a una
 * pieza colocada que la deje exactamente donde estaba, con unión nueva sin
 * configurar. Devuelve null si alguna no puede quedarse en su sitio.
 */
function reanclar(base: ConfiguracionCerramientoV3, rects: ReadonlyMap<string, RectVisual>,
  quitado: string, raiz: ModuloCerramiento): ConfiguracionCerramientoV3 | null {
  const colocados: ModuloCerramiento[] = [raiz]
  const usados = new Set<string>()
  const nuevos = new Map<string, AnclajeModulo | undefined>([[raiz.id, undefined]])
  const uniones: UnionCerramiento[] = []
  let siguienteUnion = numero(base.uniones.map((u) => u.id))
  let pendientes = base.modulos.filter((m) => m.id !== quitado && m.id !== raiz.id)
  const colocar = (m: ModuloCerramiento, anclaje: AnclajeModulo) => {
    usados.add(`${anclaje.moduloId}:${anclaje.lado}`)
    nuevos.set(m.id, anclaje)
    colocados.push(m)
    pendientes = pendientes.filter((p) => p.id !== m.id)
  }
  while (pendientes.length) {
    // Primero las que conservan su anclaje: su padre ya está colocado.
    const conserva = pendientes.find((m) => m.anclaje && colocados.some((c) => c.id === m.anclaje!.moduloId)
      && !usados.has(`${m.anclaje.moduloId}:${m.anclaje.lado}`))
    if (conserva) { colocar(conserva, conserva.anclaje!); continue }
    // Si ninguna puede, se re-ancla la primera que quepa exactamente en su sitio.
    const destino = pendientes.flatMap((hijo) => colocados.flatMap((padre) => LADOS.map((lado) => ({ hijo, padre, lado }))))
      .find(({ hijo, padre, lado }) => !usados.has(`${padre.id}:${lado}`)
        && mismoRect(rectColgado(rects.get(padre.id)!, lado, rects.get(hijo.id)!), rects.get(hijo.id)!))
    if (!destino) return null
    const unionId = `union-${++siguienteUnion}`
    uniones.push({ id: unionId, codigo: UNION_SIN_CONFIGURAR.codigo, grosorMm: UNION_SIN_CONFIGURAR.grosorMm,
      longitudMm: destino.lado === 'abajo' ? destino.padre.anchoMm : destino.padre.altoMm })
    colocar(destino.hijo, { moduloId: destino.padre.id, lado: destino.lado, unionId })
  }
  const vigentes = new Set([...nuevos.values()].flatMap((a) => a ? [a.unionId] : []))
  const modulos = ordenarPorAnclajes(colocados.map((m) => {
    const { anclaje: _anclaje, ...resto } = m
    const anclaje = nuevos.get(m.id)
    return anclaje ? { ...resto, anclaje } : resto
  }))
  if (!modulos) return null
  return { ...base, modulos, uniones: [...base.uniones.filter((u) => vigentes.has(u.id)), ...uniones] }
}

/**
 * Quita el elemento dejando fijos los demás, o explica por qué no se puede.
 * Si es el primero, la referencia pasa al primer elemento restante que permita
 * dejar a todos en su sitio (DS2, decisión de Sergio del 06/11/2026).
 */
function quitarDejandoFijos(configuracion: ConfiguracionCerramiento, id: string): ConfiguracionCerramientoV3 | string {
  const base = composicionExplicita(configuracion)
  const rects = posicionesCerramiento(base).modulos
  const raiz = base.modulos[0]
  const candidatas = raiz.id === id ? base.modulos.filter((m) => m.id !== id) : [raiz]
  for (const candidata of candidatas) {
    const resultado = reanclar(base, rects, id, candidata)
    if (resultado) return resultado
  }
  return NO_FIJOS
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
  if (!modulo) return { ok: false, motivo: 'El elemento no existe.' }
  if (configuracion.modulos.length === 1) return { ok: false, motivo: 'Un único elemento no tiene dónde moverse.' }
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
  if (configuracion.modulos.length < 2 || !configuracion.modulos.some((m) => m.id === id)) return []
  const sin = quitarDejandoFijos(configuracion, id)
  if (typeof sin === 'string') return []
  // Referencia común a ambos conjuntos: la del conjunto sin el elemento.
  const raiz = sin.modulos[0].id
  const antes = posicionesCerramiento(configuracion).modulos.get(raiz)!
  const despues = posicionesCerramiento(sin).modulos.get(raiz)!
  const actual = anclajesCerramiento(configuracion).get(id)
  return anclajesLibresCerramiento(sin, true)
    .filter((a) => !(a.moduloId === actual?.moduloId && a.lado === actual.lado))
    .filter((a) => moverModuloCerramiento(configuracion, id, a).ok)
    .map((a) => ({ ...a, x: a.x + antes.x - despues.x, y: a.y + antes.y - despues.y }))
}
