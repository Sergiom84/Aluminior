/**
 * Recorrido de una unión configurada a lo largo de la junta, leído de los
 * rectángulos de módulo. No usa `longitudMm` ni el rectángulo de la unión.
 *
 * Un hueco mayor que 0,05 mm corta el recorrido. Una unión sin configurar
 * separa 20 mm, así que ese hueco la corta: no hace falta leer su rectángulo.
 * 0,05 mm es la tolerancia con la que el contraste trata dos medidas como
 * iguales; no es una cota observada de Productor.
 *
 * Hipótesis, sin observación de Productor: dos uniones colineales no se
 * invaden el tramo anclado; si una pieza toca varias, pierde una sola mitad,
 * la del mayor solape (y, a igualdad, la del grosor mayor). La misma geometría
 * en horizontal es simetría por construcción, no una observación.
 */
import type { ConfiguracionCerramiento } from './cerramiento.ts'
import { anclajesCerramiento, posicionesCerramiento, unionConfigurada, type LadoAnclaje } from './composicion-cerramiento.ts'
import type { RectVisual } from './diseno.ts'

const TOLERANCIA_MM = 0.05

export interface RecorridoUnion {
  unionId: string
  longitudMm: number
  eje: 'vertical' | 'horizontal'
  modulos: readonly string[]
}

interface Intervalo { inicio: number; fin: number }
interface Junta {
  unionId: string
  eje: 'vertical' | 'horizontal'
  coordenada: number
  anclado: Intervalo
  grosorMm: number
}

const largo = (i: Intervalo) => Math.max(0, i.fin - i.inicio)
const cerca = (a: number, b: number) => Math.abs(a - b) <= TOLERANCIA_MM
const solapa = (a: Intervalo, b: Intervalo) => a.inicio < b.fin - TOLERANCIA_MM && b.inicio < a.fin - TOLERANCIA_MM

function fusionar(intervalos: readonly Intervalo[]): Intervalo[] {
  const ordenados = intervalos.filter(i => largo(i) > TOLERANCIA_MM).sort((a, b) => a.inicio - b.inicio)
  const salida: Intervalo[] = []
  for (const actual of ordenados) {
    const ultimo = salida.at(-1)
    if (ultimo && actual.inicio <= ultimo.fin + TOLERANCIA_MM) ultimo.fin = Math.max(ultimo.fin, actual.fin)
    else salida.push({ inicio: actual.inicio, fin: actual.fin })
  }
  return salida
}

function cruzar(a: readonly Intervalo[], b: readonly Intervalo[]): Intervalo[] {
  const salida: Intervalo[] = []
  for (const x of a) for (const y of b) {
    const inicio = Math.max(x.inicio, y.inicio)
    const fin = Math.min(x.fin, y.fin)
    if (fin - inicio > TOLERANCIA_MM) salida.push({ inicio, fin })
  }
  return fusionar(salida)
}

/** Quita los tramos anclados de las otras uniones. El borde compartido no cuenta como invasión. */
function restar(base: readonly Intervalo[], prohibidos: readonly Intervalo[]): Intervalo[] {
  let actual = fusionar(base)
  for (const prohibido of fusionar(prohibidos)) {
    const siguiente: Intervalo[] = []
    for (const intervalo of actual) {
      if (intervalo.fin <= prohibido.inicio + TOLERANCIA_MM || intervalo.inicio >= prohibido.fin - TOLERANCIA_MM) {
        siguiente.push(intervalo)
        continue
      }
      if (intervalo.inicio < prohibido.inicio - TOLERANCIA_MM) {
        siguiente.push({ inicio: intervalo.inicio, fin: prohibido.inicio })
      }
      if (intervalo.fin > prohibido.fin + TOLERANCIA_MM) {
        siguiente.push({ inicio: prohibido.fin, fin: intervalo.fin })
      }
    }
    actual = siguiente
  }
  return actual.filter(i => largo(i) > TOLERANCIA_MM)
}

function proyeccion(rect: RectVisual, eje: Junta['eje']): Intervalo {
  return eje === 'vertical'
    ? { inicio: rect.y, fin: rect.y + rect.alto }
    : { inicio: rect.x, fin: rect.x + rect.ancho }
}

function enLado(rect: RectVisual, junta: Junta, positivo: boolean): boolean {
  if (junta.eje === 'vertical') {
    const borde = positivo ? rect.x : rect.x + rect.ancho
    return cerca(borde, junta.coordenada)
  }
  const borde = positivo ? rect.y : rect.y + rect.alto
  return cerca(borde, junta.coordenada)
}

function juntaDe(
  lado: LadoAnclaje, padre: RectVisual, hijo: RectVisual, unionId: string, grosorMm: number,
): Junta | null {
  const vertical = lado !== 'abajo'
  const coordenada = lado === 'derecha' ? padre.x + padre.ancho
    : lado === 'izquierda' ? padre.x
      : padre.y + padre.alto
  const anclado = vertical
    ? { inicio: Math.max(padre.y, hijo.y), fin: Math.min(padre.y + padre.alto, hijo.y + hijo.alto) }
    : { inicio: Math.max(padre.x, hijo.x), fin: Math.min(padre.x + padre.ancho, hijo.x + hijo.ancho) }
  if (largo(anclado) <= TOLERANCIA_MM) return null
  return { unionId, eje: vertical ? 'vertical' : 'horizontal', coordenada, anclado, grosorMm }
}

function colineales(a: Junta, b: Junta): boolean {
  return a.eje === b.eje && cerca(a.coordenada, b.coordenada)
}

function solape(modulo: Intervalo, tramo: Intervalo): number {
  return Math.max(0, Math.min(modulo.fin, tramo.fin) - Math.max(modulo.inicio, tramo.inicio))
}

/**
 * Uniones configuradas con `repartoUniones: 'PIEZAS'`. Sin ese reparto los
 * módulos no se tocan y el recorrido no se calcula: el llamador deja la
 * geometría guardada.
 */
export function recorridosUniones(configuracion: ConfiguracionCerramiento): readonly RecorridoUnion[] {
  if (configuracion.repartoUniones !== 'PIEZAS') return []
  const rects = posicionesCerramiento(configuracion).modulos
  const porId = new Map(configuracion.uniones.map(u => [u.id, u]))
  const juntas: Junta[] = []
  for (const [hijoId, anclaje] of anclajesCerramiento(configuracion)) {
    const union = porId.get(anclaje.unionId)
    const padre = rects.get(anclaje.moduloId)
    const hijo = rects.get(hijoId)
    if (!union || !padre || !hijo || !unionConfigurada(union)) continue
    const junta = juntaDe(anclaje.lado, padre, hijo, union.id, union.grosorMm)
    if (junta) juntas.push(junta)
  }
  const tramos = new Map<string, Intervalo>()
  for (const junta of juntas) {
    // Un tramo libre entre dos uniones colineales es de la primera que lo
    // alcanza, en el orden de los anclajes: nunca de las dos.
    const otros = juntas.filter(otra => otra !== junta && colineales(junta, otra))
      .map(otra => tramos.get(otra.unionId) ?? otra.anclado)
    const lados = [false, true].map(positivo => fusionar(
      [...rects].filter(([, rect]) => enLado(rect, junta, positivo)).map(([, rect]) => proyeccion(rect, junta.eje)),
    ))
    const cobertura = cruzar(lados[0] ?? [], lados[1] ?? [])
    const disponible = restar(cobertura, otros)
    const propio = fusionar([junta.anclado, ...disponible.filter(i => solapa(i, junta.anclado))])
    const tramo = propio.find(i => solapa(i, junta.anclado))
    if (tramo) tramos.set(junta.unionId, tramo)
  }
  const tocados = juntas.flatMap(junta => {
    const tramo = tramos.get(junta.unionId)
    if (!tramo) return []
    const modulos = [...rects].filter(([, rect]) =>
      (enLado(rect, junta, false) || enLado(rect, junta, true)) && solape(proyeccion(rect, junta.eje), tramo) > TOLERANCIA_MM,
    ).map(([id, rect]) => ({ id, solape: solape(proyeccion(rect, junta.eje), tramo) }))
    return [{ junta, tramo, modulos }]
  })
  const dueno = new Map<string, { unionId: string; solape: number; grosorMm: number }>()
  for (const actual of tocados) {
    for (const modulo of actual.modulos) {
      const clave = `${actual.junta.eje}|${actual.junta.coordenada}|${modulo.id}`
      const previo = dueno.get(clave)
      if (!previo || modulo.solape > previo.solape + TOLERANCIA_MM ||
        (cerca(modulo.solape, previo.solape) && actual.junta.grosorMm > previo.grosorMm)) {
        dueno.set(clave, { unionId: actual.junta.unionId, solape: modulo.solape, grosorMm: actual.junta.grosorMm })
      }
    }
  }
  return tocados.map(({ junta, tramo, modulos }) => ({
    unionId: junta.unionId,
    longitudMm: largo(tramo),
    eje: junta.eje,
    modulos: modulos.filter(modulo => dueno.get(`${junta.eje}|${junta.coordenada}|${modulo.id}`)?.unionId === junta.unionId)
      .map(modulo => modulo.id),
  }))
}
