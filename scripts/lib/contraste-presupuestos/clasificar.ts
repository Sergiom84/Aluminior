/**
 * Clasificación de un GRUPO real: coincide al céntimo, difiere (con causas e
 * importe atribuible), sin valorar o no reproducible. Pura; lo no valorado
 * queda sin importe, nunca como cero.
 */
import { clasificar as estadoPrecio, causasAviso } from '../banco-contraste/comparar.ts'

export type Resultado = 'coincide' | 'difiere' | 'sin-valorar' | 'no-reproducible' | 'excluido'
export type Causa = 'reparto-uniones' | 'compacto' | 'invisible' | 'diseno-especifico' | 'tapajuntas' | 'herraje-o-componentes'
  | 'vidrio' | 'acabado' | 'tarifa' | 'mano-de-obra' | 'cortes' | 'despunte' | 'union-otra-serie' | 'no-dibujable'
  | 'precio-manual' | 'entrada-no-enlazada' | 'importe-de-fila' | 'cota-fi-fs' | 'otra'

const NO_DIBUJABLE = new Set(['modelo-sin-plantilla-visual', 'union-fuera-del-configurador', 'configuracion-no-admitida-por-web',
  'anclaje-no-representable', 'anclaje-no-demostrado', 'composicion-no-representable', 'orden-geometrico-ambiguo',
  'elementos-adicionales-sin-geometria', 'medidas-no-validas', 'longitud-de-union-no-demostrada'])
const MAPA: Record<string, Causa> = {
  'pvp-o-tarifa': 'tarifa', 'pvp-ausente-o-ambiguo': 'tarifa', 'acabado-de-articulo': 'acabado',
  'acabados-por-elemento-no-representables': 'acabado', 'acabados-accesorios-por-elemento-no-representables': 'acabado',
  'pieza-ausente': 'herraje-o-componentes', 'pieza-de-mas': 'herraje-o-componentes', 'cantidad-de-piezas': 'herraje-o-componentes',
  'resolucion-de-componentes-y-herrajes': 'herraje-o-componentes', 'opciones-por-elemento-no-representables': 'herraje-o-componentes',
  'opcion-invalida': 'herraje-o-componentes', 'vidrio-y-acristalamiento': 'vidrio', 'acristalamiento-alternativo-sin-mapeo': 'vidrio',
  'segundo-vidrio-no-representable': 'vidrio', 'variantes-de-vidrio-por-elemento-no-representables': 'vidrio',
  'mano-de-obra': 'mano-de-obra', 'reglas-de-mano-de-obra': 'mano-de-obra', 'horas-por-elemento-no-representables': 'mano-de-obra',
  'horas-no-representables': 'mano-de-obra', 'longitud-de-corte': 'cortes', 'reglas-de-corte-o-division': 'cortes',
  'metraje-facturable': 'importe-de-fila', 'importe-de-fila': 'importe-de-fila', 'coste-de-articulo': 'importe-de-fila',
  'compactos-y-accesorios-adicionales': 'compacto', 'accesorios-de-grupo-no-representables': 'compacto',
  'despunte-de-documento-sin-regla': 'despunte', 'serie-de-union-no-representable': 'union-otra-serie',
  'precio-manual': 'precio-manual', 'accesorio-de-linea-no-representable': 'compacto',
}
const causa = (m: string): Causa => NO_DIBUJABLE.has(m) ? 'no-dibujable' : MAPA[m] ?? (m.endsWith('-no-enlazado') || m === 'entradas-incompletas' ||
  m.startsWith('cerramiento-') || m === 'elemento-adicional-desconocido' ? 'entrada-no-enlazada' : 'otra')

export interface Valoracion { precio: number | null; causas: string[]; motivos: string[]; avisos: string[] }
export interface EntradaClasificacion {
  bloqueos: string[]; esperado: number; esperadoResto: number
  compacto: number; tapajuntas: number; invisible: number | null; invisibles: number; especificos: number
  guardadas: Valoracion; nominales: Valoracion | null
}
export interface Clasificacion {
  resultado: Resultado; causas: Causa[]; principal: Causa | null
  /** Importe unitario atribuible a cada causa cuando se puede medir. */
  importes: Partial<Record<Causa, number>>; desviacion: number | null
  /**
   * Con medidas guardadas: `igual` si cortes, metrajes y cantidades coinciden aunque cambie
   * el PVP (otra tarifa). Comparable entre ejercicios. Coste, MO, acabado y pieza ausente
   * no cuentan: el diagnóstico de GRUPO los marca también en los que coinciden al céntimo.
   */
  receta: 'igual' | 'distinta' | null
}
/** Diferencias de pieza que distinguen la receta (observado el 02/11/2026 en la 0016). */
const DISTINGUEN_RECETA = new Set(['longitud-de-corte', 'metraje-facturable', 'cantidad-de-piezas', 'pieza-de-mas'])

const unicas = (cs: Causa[]) => [...new Set(cs)]
export function clasificarGrupo(e: EntradaClasificacion): Clasificacion {
  const vacio = (resultado: Resultado, causas: Causa[]): Clasificacion => ({ resultado, causas: unicas(causas), principal: causas[0] ?? null, importes: {}, desviacion: null, receta: null })
  if (e.bloqueos.includes('precio-manual')) return vacio('excluido', ['precio-manual'])
  if (e.bloqueos.length) return vacio('no-reproducible', e.bloqueos.map(causa))
  const a = e.guardadas
  if (a.precio === null) {
    const cs = unicas([...a.motivos.map(causa), ...(a.motivos.length ? [] : causasDeAvisos(a.avisos))])
    return vacio(cs.includes('no-dibujable') ? 'no-reproducible' : 'sin-valorar', cs.length ? cs : ['otra'])
  }
  const importes: Partial<Record<Causa, number>> = {}, causas: Causa[] = []
  // El elemento invisible cuesta 0 en Productor; su módulo valorado en Aluminior es la diferencia.
  const precio = a.precio - (e.invisible ?? 0)
  const resto = estadoPrecio(e.esperadoResto, precio)
  if (resto !== 'igual') {
    if (e.especificos) causas.push('diseno-especifico')
    causas.push(...unicas(a.causas.map(causa)))
    if (!causas.length) causas.push('otra')
    importes[causas[0]!] = Math.abs(precio - e.esperadoResto)
  }
  for (const [c, v] of [['compacto', e.compacto], ['tapajuntas', e.tapajuntas]] as const) if (v > 0.005) { causas.push(c); importes[c] = v }
  if (e.invisibles) { causas.push('invisible'); if (e.invisible !== null) importes.invisible = e.invisible }
  // Mismo conjunto dibujado desde el hueco: lo que añade el reparto de uniones de Aluminior.
  if (e.nominales?.precio != null && estadoPrecio(a.precio, e.nominales.precio) !== 'igual') {
    causas.push('reparto-uniones'); importes['reparto-uniones'] = Math.abs(e.nominales.precio - a.precio)
  }
  const desviacion = (e.nominales?.precio ?? a.precio) - e.esperado
  const receta = !a.causas.some(c => DISTINGUEN_RECETA.has(c)) ? 'igual' : 'distinta'
  return { resultado: causas.length ? 'difiere' : 'coincide', causas: unicas(causas), principal: causas[0] ?? null, importes, desviacion, receta }
}

/** La cota del fijo inferior o superior (1OFI, 2OFI…) no llega al módulo del GRUPO: causa propia. */
function causasDeAvisos(avisos: readonly string[]): Causa[] {
  const cota = avisos.some(a => /Variable "F[IS]" sin valor/.test(a))
  const resto = avisos.filter(a => !/Variable "F[IS]" sin valor/.test(a) && !/^Faltan costes o materiales/.test(a))
  return unicas([...(cota ? ['cota-fi-fs' as const] : []), ...causasAviso(resto).map(causa)])
}
