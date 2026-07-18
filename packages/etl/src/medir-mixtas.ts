import { rutaTabla, leerLotes, txt, num, ent, type Fila } from './csv.ts'
import {
  evaluar, alojamientoDeVidrio, limitesDeHueco, marcadorLimiteInvisible,
  type NodoDisenyo, type LimiteHueco,
} from '@aluminior/core/despiece'

export interface ReglaAlojamientoMedida {
  eje: 'L' | 'A'
  limite_1: string
  limite_2: string
  perfil_hoja: string
  delta_mm: number
  muestras: number
  total_muestras: number
}

export interface ResultadoMixtas {
  reglas: ReglaAlojamientoMedida[]
  casos: number
  casosExactos: number
  observaciones: number
  observacionesCubiertas: number
}

const t = (f: Fila, campo: string) => txt(f[campo]) ?? ''
const n = (f: Fila, campo: string): number => Number(num(f[campo]) ?? 0)

async function leerTodo(origen: string, tabla: string): Promise<Fila[]> {
  const ruta = rutaTabla(origen, tabla)
  if (!ruta) return []
  const filas: Fila[] = []
  for await (const lote of leerLotes(ruta, 1000)) filas.push(...lote)
  return filas
}

function mejorEmparejamiento<T extends { l: number; a: number }, V extends { l: number; a: number }>(
  modulos: T[], vidrios: V[],
): [T, V][] | null {
  if (!modulos.length || modulos.length !== vidrios.length || modulos.length > 8) return null
  let mejor: { error: number; pares: [T, V][] } | null = null
  const usados = new Set<number>()
  const pares: [T, V][] = []
  const buscar = (i: number, error: number) => {
    if (mejor && error >= mejor.error) return
    if (i === modulos.length) { mejor = { error, pares: [...pares] }; return }
    for (let j = 0; j < vidrios.length; j++) {
      if (usados.has(j)) continue
      usados.add(j)
      pares.push([modulos[i], vidrios[j]])
      buscar(i + 1, error + Math.abs(modulos[i].l - vidrios[j].l) + Math.abs(modulos[i].a - vidrios[j].a))
      pares.pop()
      usados.delete(j)
    }
  }
  buscar(0, 0)
  return (mejor as { error: number; pares: [T, V][] } | null)?.pares ?? null
}

/** Mide reglas de acristalamiento mixto exclusivamente contra el histÃ³rico. */
export async function medirDescuentosAlojamiento(origen: string): Promise<ResultadoMixtas> {
  const [estArt, estDis, vLin, datosLin, articulos, detalles, conjuntosLin, estructurasDa, medidasDa] =
    await Promise.all([
      leerTodo(origen, 'EstructurasArticulos'), leerTodo(origen, 'EstructurasDiseño'),
      leerTodo(origen, 'VPresupuestosLin'), leerTodo(origen, 'VDatosLinEstr'),
      leerTodo(origen, 'Articulos'), leerTodo(origen, 'VDatosLinDetDis'),
      leerTodo(origen, 'ConjuntosLin'), leerTodo(origen, 'EstructurasDA'),
      leerTodo(origen, 'VMedidasDA'),
    ])

  const porArticulo = new Map(articulos.map((f) => [t(f, 'Codigo'), f]))
  const detallePorLinea = new Map(detalles.map((f) => [t(f, 'nVLinea'), f]))
  const seriePorLinea = new Map(datosLin.map((f) => [
    `${t(f, 'nVDoc')}|${t(f, 'nVLinea')}`, t(f, 'Conjunto1'),
  ]))
  const resolucionDirecta = new Map<string, Set<string>>()
  for (const f of conjuntosLin) {
    const art = t(f, 'Articulo')
    if (!art || art === '0') continue
    const clave = `${t(f, 'Conjunto')}|${t(f, 'Componente')}`
    const lista = resolucionDirecta.get(clave) ?? new Set<string>()
    lista.add(art)
    resolucionDirecta.set(clave, lista)
  }

  const componentesPorEstructura = new Map<string, Fila[]>()
  const slotsPorEstructura = new Map<string, Fila[]>()
  for (const f of estArt) {
    if (t(f, 'TipoDoc')) continue
    const estructura = t(f, 'Estructura')
    const lista = componentesPorEstructura.get(estructura) ?? []
    lista.push(f)
    componentesPorEstructura.set(estructura, lista)
    if (t(f, 'DisComponente') === '1') {
      const slots = slotsPorEstructura.get(estructura) ?? []
      slots.push(f)
      slotsPorEstructura.set(estructura, slots)
    }
  }
  const mixtas = new Set([...slotsPorEstructura].filter(([, slots]) =>
    slots.some((s) => t(s, 'DisTipoHoja') === '-1') &&
    slots.some((s) => t(s, 'DisTipoHoja') !== '-1')).map(([e]) => e))

  const nodosPorEstructura = new Map<string, Map<number, NodoDisenyo>>()
  const plantillaDisPorEstructura = new Map<string, Map<number, Fila>>()
  const cotasDefecto = new Map<string, Record<string, number>>()
  const cotasInstancia = new Map<string, Record<string, number>>()
  for (const f of estDis) {
    const estructura = t(f, 'Estructura')
    const id = ent(f.Id)
    if (!t(f, 'TipoDoc')) {
      if (id !== null) {
        const nodos = nodosPorEstructura.get(estructura) ?? new Map<number, NodoDisenyo>()
        nodos.set(id, {
          idItem: id, tipo: ent(f.Tipo) ?? 0, contenidoEn: ent(f.ContenidoEn),
          idTravesano: ent(f.idTrav), posicionHueco: ent(f.posHueco),
          tipoTravesano: txt(f.TipoTrav), invisible: t(f, 'bInvisible') === 'True',
        })
        nodosPorEstructura.set(estructura, nodos)
        const plant = plantillaDisPorEstructura.get(estructura) ?? new Map<number, Fila>()
        plant.set(id, f)
        plantillaDisPorEstructura.set(estructura, plant)
      }
      const simbolo = t(f, 'Simbolo')
      if (simbolo) {
        const mapa = cotasDefecto.get(estructura) ?? {}
        mapa[simbolo] = n(f, 'Cota')
        cotasDefecto.set(estructura, mapa)
      }
    }
  }
  for (const f of estDis) {
    if (!t(f, 'TipoDoc')) continue
    const estructura = t(f, 'Estructura')
    const id = ent(f.Id)
    const plantilla = id === null ? null : plantillaDisPorEstructura.get(estructura)?.get(id)
    const simbolo = t(f, 'Simbolo') || (plantilla ? t(plantilla, 'Simbolo') : '')
    if (!simbolo) continue
    const clave = `${t(f, 'nDoc')}|${t(f, 'nLinEstr')}`
    const mapa = cotasInstancia.get(clave) ?? {}
    mapa[simbolo] = n(f, 'Cota')
    cotasInstancia.set(clave, mapa)
  }
  const simboloDa = new Map(estructurasDa.map((f) => [
    `${t(f, 'Estructura')}|${t(f, 'nDA')}`, t(f, 'SimboloDA'),
  ]))
  for (const f of medidasDa) {
    const simbolo = simboloDa.get(`${t(f, 'Estructura')}|${t(f, 'nDA')}`)
    if (!simbolo) continue
    const clave = `${t(f, 'nDoc')}|${t(f, 'nLinEstr')}`
    const mapa = cotasInstancia.get(clave) ?? {}
    mapa[simbolo] = n(f, 'Medida')
    cotasInstancia.set(clave, mapa)
  }

  const padres = vLin.filter((f) => t(f, 'EstructuraSN') === 'True' && mixtas.has(t(f, 'Articulo')))
  const hijasPorPadre = new Map<string, Fila[]>()
  for (const f of vLin) {
    const padre = t(f, 'nEstr')
    if (!padre || padre === '0') continue
    const lista = hijasPorPadre.get(padre) ?? []
    lista.push(f)
    hijasPorPadre.set(padre, lista)
  }

  interface Modulo { fila: Fila; l: number; a: number }
  interface Vidrio { l: number; a: number }
  interface Caso {
    estructura: string; serie: string; contexto: Record<string, number>
    hijas: Fila[]; pares: [Modulo, Vidrio][]
  }
  const casos: Caso[] = []
  for (const p of padres) {
    const estructura = t(p, 'Articulo')
    const serie = seriePorLinea.get(`${t(p, 'nDoc')}|${t(p, 'nLinea')}`) ?? ''
    if (!serie) continue
    const contexto = {
      L: n(p, 'Largo'), A: n(p, 'Ancho'), ...(cotasDefecto.get(estructura) ?? {}),
      ...(cotasInstancia.get(`${t(p, 'nDoc')}|${t(p, 'nLinea')}`) ?? {}),
    }
    const modulos: Modulo[] = []
    try {
      for (const fila of slotsPorEstructura.get(estructura) ?? []) {
        const fl = t(fila, 'FormulaLargo'), fa = t(fila, 'FormulaAncho')
        if (!fl || !fa) throw new Error('ranura incompleta')
        modulos.push({ fila, l: evaluar(fl, contexto), a: evaluar(fa, contexto) })
      }
    } catch { continue }
    const hijas = hijasPorPadre.get(t(p, 'nLinea')) ?? []
    const vidrios: Vidrio[] = []
    for (const h of hijas) {
      const art = porArticulo.get(t(h, 'Articulo'))
      if (!art || t(art, 'Familia') !== '050' || t(art, 'TipoMetraje') !== 'M2') continue
      const cantidad = Math.max(1, Math.round(n(h, 'Cdad')))
      for (let i = 0; i < cantidad; i++) vidrios.push({ l: n(h, 'Largo'), a: n(h, 'Ancho') })
    }
    const pares = mejorEmparejamiento(modulos, vidrios)
    if (pares) casos.push({ estructura, serie, contexto, hijas, pares })
  }

  const articuloLimite = (caso: Caso, limite: LimiteHueco): string | null => {
    const invisible = marcadorLimiteInvisible(limite)
    if (invisible) return invisible
    if (limite.clase === 'MARCO') {
      const funcion = limite.orientacion === 'V' ? 'MV' : 'MH'
      const arts = new Set(caso.hijas.filter((h) => t(h, 'Funcion') === funcion && t(h, 'Articulo') !== '0').map((h) => t(h, 'Articulo')))
      return arts.size === 1 ? [...arts][0] : null
    }
    const encontrados = new Set<string>()
    for (const c of componentesPorEstructura.get(caso.estructura) ?? []) {
      if (ent(c.DisIdIt) !== limite.idItem || t(c, 'Funcion') !== 'TM') continue
      const formula = t(c, 'FormulaLargoCorte') || t(c, 'FormulaLargo')
      if (!formula) continue
      let largo: number
      try { largo = evaluar(formula, caso.contexto) } catch { continue }
      for (const h of caso.hijas) {
        if (t(h, 'Funcion') === 'TM' && t(h, 'Articulo') !== '0' && Math.abs(n(h, 'LargoCorte') - largo) <= 0.51) encontrados.add(t(h, 'Articulo'))
      }
    }
    if (!encontrados.size) {
      const todos = new Set(caso.hijas.filter((h) => t(h, 'Funcion') === 'TM' && t(h, 'Articulo') !== '0').map((h) => t(h, 'Articulo')))
      if (todos.size === 1) return [...todos][0]
    }
    return encontrados.size === 1 ? [...encontrados][0] : null
  }

  const perfilHoja = (caso: Caso, hojaId: number, funcion: 'HV' | 'HH'): string | null => {
    const exactos = new Set<string>()
    for (const h of caso.hijas) {
      if (t(h, 'Funcion') !== funcion || t(h, 'Articulo') === '0') continue
      const det = detallePorLinea.get(t(h, 'nLinea'))
      if (det && ent(det.DisIdIt) === hojaId && t(det, 'DisGrupo') === 'HP') exactos.add(t(h, 'Articulo'))
    }
    if (exactos.size === 1) return [...exactos][0]
    const componentes = new Set((componentesPorEstructura.get(caso.estructura) ?? [])
      .filter((f) => ent(f.DisIdIt) === hojaId && t(f, 'Funcion') === funcion && t(f, 'DisGrupo') === 'HP')
      .map((f) => t(f, 'DisComponente')).filter(Boolean))
    const resueltos = new Set<string>()
    for (const componente of componentes) {
      for (const art of resolucionDirecta.get(`${caso.serie}|${componente}`) ?? []) resueltos.add(art)
    }
    return resueltos.size === 1 ? [...resueltos][0] : null
  }

  type Obs = { caso: Caso; clave: string; valor: number }
  const conteos = new Map<string, Map<number, number>>()
  const observaciones: Obs[] = []
  for (const caso of casos) {
    const nodos = nodosPorEstructura.get(caso.estructura)
    if (!nodos) continue
    for (const [m, v] of caso.pares) {
      const vidrioId = ent(m.fila.DisIdIt)
      if (vidrioId === null) continue
      const alojamiento = alojamientoDeVidrio(nodos, vidrioId)
      if (!alojamiento) continue
      const limites = limitesDeHueco(nodos, alojamiento.huecoId)
      if (!limites) continue
      const sup = articuloLimite(caso, limites.superior), inf = articuloLimite(caso, limites.inferior)
      const izq = articuloLimite(caso, limites.izquierdo), der = articuloLimite(caso, limites.derecho)
      if (!sup || !inf || !izq || !der) continue
      const hh = alojamiento.hojaId === null ? '' : perfilHoja(caso, alojamiento.hojaId, 'HH')
      const hv = alojamiento.hojaId === null ? '' : perfilHoja(caso, alojamiento.hojaId, 'HV')
      if (alojamiento.hojaId !== null && (!hh || !hv)) continue
      const registrar = (eje: 'L' | 'A', limitesEje: string[], perfil: string, delta: number) => {
        limitesEje.sort()
        const clave = JSON.stringify([eje, limitesEje[0], limitesEje[1], perfil])
        const valor = Math.round(delta * 10) / 10
        const mapa = conteos.get(clave) ?? new Map<number, number>()
        mapa.set(valor, (mapa.get(valor) ?? 0) + 1)
        conteos.set(clave, mapa)
        observaciones.push({ caso, clave, valor })
      }
      registrar('L', [sup, inf], hh ?? '', m.l - v.l)
      registrar('A', [izq, der], hv ?? '', m.a - v.a)
    }
  }

  const reglas: ReglaAlojamientoMedida[] = []
  const porClave = new Map<string, number>()
  for (const [clave, conteo] of conteos) {
    const total = [...conteo.values()].reduce((a, b) => a + b, 0)
    const [delta, muestras] = [...conteo.entries()].sort((a, b) => b[1] - a[1])[0]
    if (total < 3 || muestras / total < 0.9) continue
    const [eje, limite1, limite2, perfilHoja] = JSON.parse(clave) as ['L' | 'A', string, string, string]
    reglas.push({ eje, limite_1: limite1, limite_2: limite2, perfil_hoja: perfilHoja, delta_mm: delta, muestras, total_muestras: total })
    porClave.set(clave, delta)
  }
  const obsCubiertas = observaciones.filter((o) => porClave.get(o.clave) === o.valor).length
  const obsPorCaso = new Map<Caso, Obs[]>()
  for (const o of observaciones) {
    const lista = obsPorCaso.get(o.caso) ?? []
    lista.push(o)
    obsPorCaso.set(o.caso, lista)
  }
  let casosExactos = 0
  for (const caso of casos) {
    const obs = obsPorCaso.get(caso) ?? []
    if (obs.length === caso.pares.length * 2 && obs.every((o) => porClave.get(o.clave) === o.valor)) casosExactos++
  }
  return {
    reglas, casos: casos.length, casosExactos,
    observaciones: observaciones.length, observacionesCubiertas: obsCubiertas,
  }
}
