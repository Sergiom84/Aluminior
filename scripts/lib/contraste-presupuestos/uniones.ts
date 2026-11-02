/**
 * Reparto del grosor de las uniones: medida guardada por Productor en cada pieza
 * frente a la que daría Aluminior (`repartoUniones: 'PIEZAS'`) desde el hueco
 * nominal del dibujo. Puro: no consulta precios ni la base de datos.
 */
import { anclajesCerramiento, medidasFabricacionCerramiento, unionConfigurada,
  type ConfiguracionCerramientoV3 } from '@aluminior/core/estructuras'
import { configuracionGrupo } from '../banco-contraste/geometria.ts'
import { numero, si, texto, type Caso } from '../banco-contraste/datos.ts'

const TOLERANCIA_MM = 0.05
export type EstadoReparto = 'sin-uniones-configuradas' | 'coincide' | 'difiere' | 'no-analizable'
/** Patrones observados en las piezas que no coinciden; un GRUPO puede tener varios. */
export type PatronReparto = 'union-recorre-varias-piezas' | 'ajuste-decimal-al-total' | 'asimetrico' | 'medida-no-valida'
export interface PiezaReparto {
  orden: string; codigo: string; nominal: [number, number]; prevista: [number, number]; guardada: [number, number]
  /** Productor restó el cajón del compacto a su alto (E5); el alto no se compara. */
  compacto: boolean
  /** Diseño específico con precio 0 en Productor: elemento invisible (DS3). */
  invisible: boolean
}
/** Reparto observado de una unión entre dos piezas que solo tienen esa unión en su dirección. */
export interface UnionReparto {
  codigo: string; grosor: number; lado: 'derecha' | 'abajo'
  restaPadre: number; restaHijo: number; alturasDistintas: boolean; invisible: boolean
  patron: 'mitad-y-mitad' | 'asimetrico-suma-grosor' | 'otro'
}
export interface AnalisisReparto {
  estado: EstadoReparto; piezas: PiezaReparto[]; uniones: UnionReparto[]; patrones: PatronReparto[]; motivos: string[]
}

const cerca = (a: number, b: number, t = TOLERANCIA_MM) => Math.abs(a - b) <= t
const fraccionRara = (v: number) => !cerca(v * 2, Math.round(v * 2), 0.02)

export function analizarReparto(c: Caso): AnalisisReparto {
  const { configuracion, motivos } = configuracionGrupo(c, 'nominal')
  if (!configuracion) return { estado: 'no-analizable', piezas: [], uniones: [], patrones: [], motivos }
  const fabricacion = medidasFabricacionCerramiento(configuracion)
  const elementos = new Map((c.elementos ?? []).map(e => [texto(e.padre.nLinea), e]))
  const geometria = new Map((c.geometria ?? []).filter(g => !si(g.EsUnionSN)).map(g => [`modulo-${texto(g.Orden)}`, g]))
  const cajones = (c.accesorios ?? []).map(a => numero(a.AltoCajon)!).filter(v => v > 0)
  const piezas: PiezaReparto[] = configuracion.modulos.map(m => {
    const g = geometria.get(m.id)!, e = elementos.get(texto(g.nLinEstr))!, p = fabricacion.modulos.get(m.id)!
    const guardada: [number, number] = [e.dimensiones.ancho!, e.dimensiones.alto!]
    // El compacto no se enlaza a su módulo por clave: se reconoce por la resta exacta del cajón.
    const compacto = cajones.some(h => cerca(p.altoMm - guardada[1], h, 2)) || numero(g.DisAltoCaj)! > 0
    return { orden: texto(g.Orden), codigo: m.estructuraCodigo, nominal: [m.anchoMm, m.altoMm], prevista: [p.anchoMm, p.altoMm],
      guardada, compacto, invisible: si(g.DisEspecificoSN) && e.esperado === 0 }
  })
  // Sin uniones configuradas no hay reparto que medir; las piezas sirven para el cajón.
  if (!configuracion.uniones.some(unionConfigurada)) return { estado: 'sin-uniones-configuradas', piezas, uniones: [], patrones: [], motivos: [] }
  const distintas = piezas.filter(p => !cerca(p.prevista[0], p.guardada[0]) || (!p.compacto && !cerca(p.prevista[1], p.guardada[1])))
  return { estado: distintas.length ? 'difiere' : 'coincide', piezas, uniones: unionesAisladas(configuracion, piezas),
    patrones: patrones(configuracion, distintas), motivos: [] }
}

function patrones(configuracion: ConfiguracionCerramientoV3, distintas: PiezaReparto[]): PatronReparto[] {
  const salida = new Set<PatronReparto>()
  const mitades = configuracion.uniones.filter(unionConfigurada).map(u => u.grosorMm / 2)
  for (const p of distintas) {
    const eje = cerca(p.prevista[0], p.guardada[0]) ? 1 : 0, resta = p.prevista[eje] - p.guardada[eje]
    if (p.guardada[eje] <= 0) salida.add('medida-no-valida')
    else if (fraccionRara(p.guardada[eje])) salida.add('ajuste-decimal-al-total')
    // Productor recorta todas las piezas que toca una unión larga; Aluminior solo el par anclado.
    else if (mitades.some(m => cerca(resta, m))) salida.add('union-recorre-varias-piezas')
    else salida.add('asimetrico')
  }
  return [...salida]
}

/** Solo uniones cuyas dos piezas no tienen otra unión configurada en la misma dirección. */
function unionesAisladas(configuracion: ConfiguracionCerramientoV3, piezas: PiezaReparto[]): UnionReparto[] {
  const anclajes = [...anclajesCerramiento(configuracion)]
  const union = new Map(configuracion.uniones.map(u => [u.id, u]))
  const porId = new Map(configuracion.modulos.map((m, i) => [m.id, piezas[i]!]))
  const direccion = (lado: string) => lado === 'abajo' ? 'abajo' : 'derecha'
  const cuenta = new Map<string, number>()
  for (const [hijo, a] of anclajes) if (unionConfigurada(union.get(a.unionId)!))
    for (const id of [hijo, a.moduloId]) cuenta.set(`${id}|${direccion(a.lado)}`, (cuenta.get(`${id}|${direccion(a.lado)}`) ?? 0) + 1)
  const salida: UnionReparto[] = []
  for (const [hijo, a] of anclajes) {
    const u = union.get(a.unionId)!, lado = direccion(a.lado)
    if (!unionConfigurada(u) || cuenta.get(`${hijo}|${lado}`) !== 1 || cuenta.get(`${a.moduloId}|${lado}`) !== 1) continue
    const eje = lado === 'abajo' ? 1 : 0, padre = porId.get(a.moduloId)!, pieza = porId.get(hijo)!
    if (eje === 1 && (padre.compacto || pieza.compacto)) continue
    const restaPadre = padre.nominal[eje] - padre.guardada[eje], restaHijo = pieza.nominal[eje] - pieza.guardada[eje]
    const patron = cerca(restaPadre, u.grosorMm / 2) && cerca(restaHijo, u.grosorMm / 2) ? 'mitad-y-mitad'
      : cerca(restaPadre + restaHijo, u.grosorMm) ? 'asimetrico-suma-grosor' : 'otro'
    salida.push({ codigo: u.codigo, grosor: u.grosorMm, lado, restaPadre, restaHijo, patron,
      invisible: padre.invisible || pieza.invisible,
      alturasDistintas: !cerca(padre.nominal[1 - eje], pieza.nominal[1 - eje]) })
  }
  return salida
}
