/** Diagnóstico puro: nunca reajusta precios ni alimenta al motor con el oráculo. */
import type { Pieza, Estado } from './datos.ts'
import { AVISOS_PRODUCTOR } from '../contraste-despiece-facturas.ts'
export const precioComparable = (precio: number | null, motivos: readonly string[]): number | null => motivos.length ? null : precio
export function clasificar(esperado: number, obtenido: number | null): Estado {
  if (obtenido === null || !Number.isFinite(obtenido)) return 'sin valorar'
  if (!Number.isFinite(esperado)) return 'error'
  // Access REAL tiene ruido binario; el umbral económico se expresa en céntimos.
  const centimosEsperados = Math.round(esperado * 100), centimosObtenidos = Math.round(obtenido * 100)
  const diferencia = Math.abs(centimosObtenidos - centimosEsperados)
  if (diferencia <= 1) return 'igual'
  if (centimosEsperados !== 0 && diferencia <= Math.abs(centimosEsperados) * .01 + 1e-8) return 'cercano'
  return 'distinto'
}
// MO tiene Función vacía en el histórico y 'MO' en la web: no inventar piezas distintas.
const key = (p: Pieza) => p.articulo
const por = (ps: readonly Pieza[]) => {
  const m = new Map<string, Pieza[]>()
  for (const p of ps) { const k = key(p), a = m.get(k) ?? []; a.push(p); m.set(k, a) }
  return m
}
const diff = (a: number | null, b: number | null, epsilon: number) => a !== b &&
  (a === null || b === null || Math.abs(a - b) > epsilon)
export function diagnosticar(esperadas: readonly Pieza[], motor: readonly Pieza[]) {
  const causas = new Set<string>(), detalles: { clave: string; campo: string; esperado: unknown; obtenido: unknown }[] = []
  // Cero explícito y avisos se conservan en el banco, pero no son piezas materiales.
  const material = (p: Pieza) => !!p.articulo && p.articulo !== '0' && !AVISOS_PRODUCTOR.has(p.articulo) && p.cantidad !== 0
  const a = por(esperadas.filter(material)), b = por(motor.filter(material))
  for (const k of new Set([...a.keys(), ...b.keys()])) {
    const ordenar = (x: Pieza, y: Pieza) => (x.largo ?? 0) - (y.largo ?? 0) || (x.ancho ?? 0) - (y.ancho ?? 0) || (x.cantidad ?? 0) - (y.cantidad ?? 0) || x.acabado.localeCompare(y.acabado)
    const xs = [...(a.get(k) ?? [])].sort(ordenar), ys = [...(b.get(k) ?? [])].sort(ordenar)
    const mo = xs.some(p => ['MO', 'MOCOL'].includes(p.articulo)) || ys.some(p => ['MO', 'MOCOL'].includes(p.articulo))
    if (xs.length !== ys.length) {
      causas.add(mo ? 'mano-de-obra' : xs.length > ys.length ? 'pieza-ausente' : 'pieza-de-mas')
      if (xs.length > ys.length && (/^(COM|PSM)/.test(k) || ['MOCOMP', 'MOTAP'].includes(k))) causas.add('compactos-y-accesorios-adicionales')
      detalles.push({ clave: k, campo: 'multiplicidad', esperado: xs.length, obtenido: ys.length })
    }
    for (let i = 0; i < Math.min(xs.length, ys.length); i++) {
      const x = xs[i]!, y = ys[i]!
      if (x.acabado !== y.acabado) {
        causas.add('acabado-de-articulo'); detalles.push({ clave: k, campo: 'acabado', esperado: x.acabado, obtenido: y.acabado })
      }
      for (const [campo, causa, epsilon] of [
        ['cantidad', mo ? 'mano-de-obra' : 'cantidad-de-piezas', .001], ['largo', 'longitud-de-corte', .05],
        ['ancho', 'longitud-de-corte', .05], ['precio', 'pvp-o-tarifa', .0001],
        ['coste', 'coste-de-articulo', .0001], ['metraje', 'metraje-facturable', .005],
        ['importe', mo ? 'mano-de-obra' : 'importe-de-fila', .01],
      ] as const) if (!((campo === 'largo' || campo === 'ancho') && !(x[campo]! > 0) && !(y[campo]! > 0)) && diff(x[campo], y[campo], epsilon)) {
        causas.add(causa); detalles.push({ clave: k, campo, esperado: x[campo], obtenido: y[campo] })
      }
    }
  }
  return { causas: [...causas], detalles }
}
export function causasAviso(avisos: readonly string[]): string[] {
  const s = avisos.join('; ').toLowerCase(), causas = new Set<string>()
  if (/sin precio|sin pvp|precio.*ausente|ambigu|sin importe/.test(s)) causas.add('pvp-ausente-o-ambiguo')
  if (/sin descuento|descuento.*ausente|referencia|grupo adicional|cota|divisi[oó]n/.test(s)) causas.add('reglas-de-corte-o-division')
  if (/sin resolver|no resuelve|sin art[ií]culo|ranura|asociaci[oó]n|herraje/.test(s)) causas.add('resolucion-de-componentes-y-herrajes')
  if (/mano de obra|fabricaci[oó]n|incremento.*tiempo/.test(s)) causas.add('reglas-de-mano-de-obra')
  if (/vidrio|junquillo|grosor|acristalamiento|junta/.test(s)) causas.add('vidrio-y-acristalamiento')
  if (!causas.size && s) causas.add('otra-incidencia-del-servicio')
  return [...causas]
}
