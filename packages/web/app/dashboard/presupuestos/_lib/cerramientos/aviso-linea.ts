/**
 * Aviso visible de una línea de cerramiento.
 *
 * El aviso es lo que lee el operador en la línea: solo lleva lo que afecta al
 * precio o a lo que debe revisar. Se quedan fuera, y siguen en el resultado
 * guardado y en el registro `[valoracion]`:
 * - los diagnósticos de coste de compra (`ambito: 'COSTE'`): no cambian el PVP;
 * - el grosor de vidrio «por encima del rango de doble acristalamiento»: sale en
 *   casi todas las líneas de PVC con vidrio de 28 mm, que cuadran al céntimo con
 *   Productor, y no hay evidencia de que Productor avise.
 * Un mismo texto en varios elementos se escribe una vez con todos ellos.
 */
import { CODIGO_SIN_PRECIO } from '@aluminior/core/estructuras'

interface OrigenConDiagnosticos {
  origen: { tipo: string; id: string }
  diagnosticos: readonly { codigo: string; ambito: string; detalle: string }[]
}

const PREFIJO_AVISOS = 'Valorado con avisos: '
const SIN_IMPACTO = /^vidrio de [\d.,]+ mm por encima del rango de doble acristalamiento/

/** Quita del texto «Valorado con avisos: a; b.» las partes sin impacto; null si no queda ninguna. */
export function filtrarAvisoMotor(detalle: string): string | null {
  if (!detalle.startsWith(PREFIJO_AVISOS)) return detalle
  const partes = detalle.slice(PREFIJO_AVISOS.length).replace(/\.$/, '').split('; ')
    .filter((p) => !SIN_IMPACTO.test(p.trim()))
  return partes.length ? `${PREFIJO_AVISOS}${partes.join('; ')}.` : null
}

export function avisoVisibleLinea(origenes: readonly OrigenConDiagnosticos[], notasExtra: readonly string[] = []): string | null {
  const grupos = new Map<string, { tipo: string; detalle: string; ids: string[] }>()
  for (const o of origenes) {
    for (const d of o.diagnosticos) {
      if (d.codigo === CODIGO_SIN_PRECIO || d.ambito === 'COSTE') continue
      const detalle = filtrarAvisoMotor(d.detalle)
      if (!detalle) continue
      const clave = `${o.origen.tipo}|${detalle}`
      const g = grupos.get(clave) ?? { tipo: o.origen.tipo, detalle, ids: [] }
      if (!g.ids.includes(o.origen.id)) g.ids.push(o.origen.id)
      grupos.set(clave, g)
    }
  }
  const notas = [...grupos.values()].map((g) => `${g.tipo} ${g.ids.join(', ')}: ${g.detalle}`)
  notas.push(...notasExtra)
  return notas.length ? [...new Set(notas)].join('; ') : null
}
