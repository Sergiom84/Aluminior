/**
 * Separa de un GRUPO de Productor lo que Aluminior aún no representa (compacto,
 * tapajuntas, elemento invisible) para valorar el resto y atribuir la diferencia.
 * Puro: nunca ajusta un precio con el importe esperado.
 */
import { numero, si, texto, type Caso } from '../banco-contraste/datos.ts'

/** Exclusiones que impiden reproducir el GRUPO aunque se aparten sus elementos adicionales. */
const BLOQUEANTES = new Set(['precio-manual', 'medidas-o-cantidad-no-positivas', 'cerramiento-ausente-o-ambiguo',
  'elemento-no-enlazado'])
const DISENO = 'diseno-especifico-no-reproducible'
const TOLERADAS_SIN_DESPIECE = new Set([DISENO, 'entradas-incompletas', 'despiece-no-enlazado'])

export interface Apartados { elementos: number; importe: number }
export interface VarianteGrupo {
  variante: Caso
  bloqueos: string[]
  compactos: Apartados; tapajuntas: Apartados; otros: Apartados
  /** Módulos `modulo-<Orden>` con diseño específico y precio 0 en Productor. */
  invisibles: string[]
  /** Diseño específico con precio: se valora como el módulo normal y se anota. */
  especificos: number
  /** Suma de elementos frente al precio del GRUPO (precio por unidad de GRUPO). */
  reconciliado: boolean
}

const importe = (es: Caso[], cantidad: number) => ({ elementos: es.length,
  importe: es.reduce((s, e) => s + (e.esperado ?? 0) * (e.cantidad ?? 0), 0) / cantidad })

export function prepararVariante(c: Caso): VarianteGrupo {
  const cantidad = c.cantidad! > 0 ? c.cantidad! : 1
  const geometria = c.geometria ?? [], conGeometria = new Set(geometria.map(g => texto(g.nLinEstr)))
  const elementos = c.elementos ?? []
  const adicionales = elementos.filter(e => !conGeometria.has(texto(e.padre.nLinea)))
  const compactos = adicionales.filter(e => /^COM/.test(e.modelo)), tapajuntas = adicionales.filter(e => /^GMT/.test(e.modelo))
  const otros = adicionales.filter(e => !compactos.includes(e) && !tapajuntas.includes(e))
  const porLinea = new Map(elementos.map(e => [texto(e.padre.nLinea), e]))
  const disenos = geometria.filter(g => !si(g.EsUnionSN) && si(g.DisEspecificoSN))
  const invisibles = disenos.filter(g => porLinea.get(texto(g.nLinEstr))?.esperado === 0)
  const uniones = new Set(geometria.filter(g => si(g.EsUnionSN)).map(g => texto(g.nLinEstr)))
  // La unión no tiene serie propia ni, si es `U`, despiece: el servicio la valida aparte.
  // El invisible tampoco tiene despiece: Productor lo cobra a 0.
  const sinDespiece = new Set([...uniones, ...invisibles.map(g => texto(g.nLinEstr))])
  const propias = (e: Caso) => sinDespiece.has(texto(e.padre.nLinea)) ? TOLERADAS_SIN_DESPIECE : new Set([DISENO])
  const conservados = elementos.filter(e => conGeometria.has(texto(e.padre.nLinea)))
    .map(e => ({ ...e, exclusiones: e.exclusiones.filter(x => !propias(e).has(x)) }))
  const bloqueos = [...new Set([...c.exclusiones.filter(x => BLOQUEANTES.has(x)),
    ...conservados.flatMap(e => e.exclusiones), ...(otros.length ? ['elemento-adicional-desconocido'] : [])])]
  const suma = elementos.reduce((s, e) => s + (e.esperado ?? 0) * (e.cantidad ?? 0), 0)
  return {
    variante: { ...c, elementos: conservados, accesorios: [], exclusiones: [], piezas: conservados.flatMap(e => e.piezas) },
    bloqueos, compactos: importe(compactos, cantidad), tapajuntas: importe(tapajuntas, cantidad), otros: importe(otros, cantidad),
    invisibles: invisibles.map(g => `modulo-${texto(g.Orden)}`), especificos: disenos.length - invisibles.length,
    reconciliado: c.esperado !== null && Math.abs(suma / cantidad - c.esperado) <= .01 + 1e-6,
  }
}

/**
 * Para dibujar desde el hueco, el alto de las piezas con compacto conserva la resta
 * del cajón que hizo Productor (E5): así la valoración nominal aísla el reparto de uniones.
 */
export function descontarCajon(c: Caso, piezas: readonly { orden: string; compacto: boolean; prevista: [number, number]; guardada: [number, number] }[]): Caso {
  const resta = new Map(piezas.filter(p => p.compacto).map(p => [p.orden, p.prevista[1] - p.guardada[1]]))
  if (!resta.size) return c
  return { ...c, geometria: (c.geometria ?? []).map(g => resta.has(texto(g.Orden)) && !si(g.EsUnionSN)
    ? { ...g, AltoHueco: (numero(g.AltoHueco)! > 0 ? numero(g.AltoHueco)! : numero(g.Alto)!) - resta.get(texto(g.Orden))! } : g) }
}

/** Precio por unidad del GRUPO sin lo apartado: es lo comparable con la variante. */
export const esperadoResto = (c: Caso, v: VarianteGrupo) => c.esperado! - v.compactos.importe - v.tapajuntas.importe - v.otros.importe
export const cantidadGrupo = (c: Caso) => numero(c.cantidad) ?? 1
