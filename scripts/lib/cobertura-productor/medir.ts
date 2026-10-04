/** Cobertura del oráculo guardado: no ejecuta ni modifica el motor. */
import { clasificar, diagnosticar } from '../banco-contraste/comparar.ts'
import { numero, texto, type Caso, type Medicion, type Pieza } from '../banco-contraste/datos.ts'
import { AVISOS_PRODUCTOR } from '../contraste-despiece-facturas.ts'

export const REGLAS = ['piezas', 'funciones', 'cantidades', 'cortes', 'acabados', 'unidades', 'metraje', 'pvp', 'importes', 'costes'] as const
export type Regla = typeof REGLAS[number]
type EstadoRegla = 'coincide' | 'difiere' | 'sin contraste'
const campos: Record<Regla, string[]> = {
  piezas: ['multiplicidad'], funciones: ['funcion'], cantidades: ['cantidad'], cortes: ['largo', 'ancho'],
  acabados: ['acabado'], unidades: ['unidad'], metraje: ['metraje'], pvp: ['precio'],
  importes: ['importe'], costes: ['coste'],
}
const material = (p: Pieza) => !!p.articulo && p.articulo !== '0' && !AVISOS_PRODUCTOR.has(p.articulo) && p.cantidad !== 0
const funcion = (p: Pieza) => ['MO', 'MOCOL'].includes(p.articulo) ? 'MO' : p.funcion
const clave = (p: Pieza) => p.articulo

export function contrastarReglas(c: Caso, m: Medicion): Record<Regla, EstadoRegla> {
  const resultado = Object.fromEntries(REGLAS.map(r => [r, 'sin contraste'])) as Record<Regla, EstadoRegla>
  // Despieces parciales de resultados incompletos no acreditan ausencia de piezas.
  if (!['igual', 'cercano', 'distinto'].includes(m.estado)) return resultado
  const esperadas = c.piezas.filter(material), obtenidas = m.piezas.filter(material)
  if (!esperadas.length || !obtenidas.length) return resultado
  const agrupar = (ps: Pieza[]) => {
    const grupos = new Map<string, Pieza[]>()
    for (const p of ps) { const k = clave(p); grupos.set(k, [...(grupos.get(k) ?? []), p]) }
    return grupos
  }
  const a = agrupar(esperadas), b = agrupar(obtenidas)
  const detalles = [...new Set([...a.keys(), ...b.keys()])].flatMap(k => diagnosticar(a.get(k) ?? [], b.get(k) ?? []).detalles)
  const identidadIgual = !detalles.some(d => d.campo === 'multiplicidad')
  resultado.piezas = identidadIgual ? 'coincide' : 'difiere'
  if (!identidadIgual) return resultado
  // Compara unidad como multiconjunto dentro de artículo; no presupone ML.
  const unidadesIguales = [...a.keys()].every(k =>
    JSON.stringify(a.get(k)!.map(p => p.unidad).sort()) === JSON.stringify(b.get(k)!.map(p => p.unidad).sort()))
  const todas = [...esperadas, ...obtenidas]
  // Función histórica vacía no demuestra una pieza ausente ni autoriza inventar su función.
  const funcionesIguales = [...a.keys()].every(k =>
    JSON.stringify(a.get(k)!.map(funcion).sort()) === JSON.stringify(b.get(k)!.map(funcion).sort()))
  resultado.funciones = todas.some(p => !funcion(p)) ? 'sin contraste' : funcionesIguales ? 'coincide' : 'difiere'
  resultado.unidades = todas.some(p => !p.unidad) ? 'sin contraste' : unidadesIguales ? 'coincide' : 'difiere'
  for (const r of REGLAS.filter(r => r !== 'piezas' && r !== 'unidades' && r !== 'funciones')) {
    if (['cortes', 'metraje'].includes(r) && resultado.unidades !== 'coincide') continue
    const relevantes = r === 'cortes' ? todas.filter(p => ['ML', 'M2'].includes(p.unidad)) : todas
    if (!relevantes.length) continue
    const presentes = r === 'cortes'
      ? relevantes.every(p => p.largo !== null && (p.unidad !== 'M2' || p.ancho !== null))
      : relevantes.every(p => campos[r].every(campo => p[campo as keyof Pieza] !== null && p[campo as keyof Pieza] !== undefined))
    if (!presentes) continue
    if (r === 'acabados' && relevantes.some(p => !p.acabado)) continue
    resultado[r] = detalles.some(d => campos[r].includes(d.campo)) ? 'difiere' : 'coincide'
  }
  return resultado
}

export function serieCaso(c: Caso): string {
  if (c.tipo !== 'GRUPO') return c.serie || 'sin serie'
  const series = [...new Set((c.elementos ?? []).map(e => e.serie).filter((s): s is string => !!s))].sort()
  return series.length ? `GRUPO: ${series.join(' + ')}` : 'GRUPO sin serie'
}

export function medirCobertura(casos: readonly Caso[], mediciones: readonly Medicion[]) {
  const porId = new Map<string, Medicion>()
  for (const m of mediciones) {
    if (porId.has(m.id)) throw new Error('Medición duplicada')
    porId.set(m.id, m)
  }
  const vistos = new Set<string>()
  const filas = casos.map(c => {
    if (vistos.has(c.id)) throw new Error('Caso duplicado')
    vistos.add(c.id)
    const m = porId.get(c.id)
    if (c.exclusiones.length ? !!m : !m) throw new Error('Elegibilidad y mediciones no reconciliadas')
    if (m && (m.modelo !== c.modelo || m.tipo !== c.tipo || m.fecha !== c.fecha || m.esperado !== c.esperado)) {
      throw new Error('Medición de otra entrada')
    }
    if (m && (m.estado === 'error' ? m.obtenido !== null : clasificar(m.esperado, m.obtenido) !== m.estado)) {
      throw new Error('Estado económico incoherente')
    }
    return { c, m, reglas: m ? contrastarReglas(c, m) : null }
  })
  if (porId.size !== filas.filter(f => f.m).length) throw new Error('Mediciones huérfanas')
  const pares = new Map<string, typeof filas>()
  for (const f of filas) {
    const key = JSON.stringify([f.c.modelo, serieCaso(f.c)])
    pares.set(key, [...(pares.get(key) ?? []), f])
  }
  function resumir(fs: typeof filas) {
    const elegibles = fs.filter(f => f.m)
    const reglas = Object.fromEntries(REGLAS.map(r => [r, {
      coincide: elegibles.filter(f => f.reglas![r] === 'coincide').length,
      difiere: elegibles.filter(f => f.reglas![r] === 'difiere').length,
      sinContraste: elegibles.filter(f => f.reglas![r] === 'sin contraste').length,
    }])) as Record<Regla, { coincide: number; difiere: number; sinContraste: number }>
    const conjunto = (valores: string[]) => [...new Set(valores.filter(Boolean))].sort()
    const entradas = fs.flatMap(f => f.c.tipo === 'GRUPO' ? f.c.elementos ?? [] : [f.c])
    const medidas = (campo: 'ancho' | 'alto') => {
      const xs = entradas.map(c => c.dimensiones[campo]).filter((x): x is number => x !== null && Number.isFinite(x))
      return xs.length ? `${Math.min(...xs)}..${Math.max(...xs)}` : 'sin medida'
    }
    return { universo: fs.length, excluidas: fs.length - elegibles.length, elegibles: elegibles.length,
      precioIgual: elegibles.filter(f => f.m!.estado === 'igual').length,
      cercano: elegibles.filter(f => f.m!.estado === 'cercano').length,
      distinto: elegibles.filter(f => f.m!.estado === 'distinto').length,
      sinValorar: elegibles.filter(f => f.m!.estado === 'sin valorar').length,
      error: elegibles.filter(f => f.m!.estado === 'error').length,
      piezasYCortesIgual: elegibles.filter(f => ['piezas', 'cantidades', 'cortes', 'unidades'].every(r => f.reglas![r as Regla] === 'coincide')).length,
      precioYPiezasYCortesIgual: elegibles.filter(f => f.m!.estado === 'igual' && ['piezas', 'cantidades', 'cortes', 'unidades'].every(r => f.reglas![r as Regla] === 'coincide')).length,
      fisicoIgual: elegibles.filter(f => ['piezas', 'cantidades', 'cortes', 'acabados', 'unidades'].every(r => f.reglas![r as Regla] === 'coincide')).length,
      precioYFisicoIgual: elegibles.filter(f => f.m!.estado === 'igual' && ['piezas', 'cantidades', 'cortes', 'acabados', 'unidades'].every(r => f.reglas![r as Regla] === 'coincide')).length,
      reglas, variantes: {
        ancho: medidas('ancho'), alto: medidas('alto'),
        cantidades: conjunto(fs.map(f => texto(f.c.cantidad))),
        tarifas: conjunto(fs.map(f => texto(f.c.tarifa))),
        acabados: conjunto(entradas.map(c => texto(c.padre.Acabado))),
        acabadosAccesorios: conjunto(entradas.map(c => texto(c.padre.Acabado2))),
        vidriosDistintos: conjunto(entradas.map(c => c.vidrio ?? '')).length,
        acristalamientos: conjunto(entradas.map(c => texto(c.configuracion?.nTAcris))),
        opcionesGuardadas: entradas.filter(c => c.opciones.length > 0).length,
        accesorios: conjunto(entradas.flatMap(c => (c.accesorios ?? []).map(a => texto(a.Accesorio)))),
        fracciones: entradas.filter(c => [c.dimensiones.ancho, c.dimensiones.alto].some(x => x !== null && !Number.isInteger(x))).length,
        comision: elegibles.filter(f => numero(f.c.comision) !== null && numero(f.c.comision) !== 0).length,
        despunte: elegibles.filter(f => (f.c.despunte ?? 0) !== 0).length,
      } }
  }
  return { total: resumir(filas), pares: [...pares.values()].map(fs => ({
    modelo: fs[0]!.c.modelo, serie: serieCaso(fs[0]!.c), ...resumir(fs),
  })).sort((a, b) => b.elegibles - a.elegibles || a.modelo.localeCompare(b.modelo) || a.serie.localeCompare(b.serie)) }
}
