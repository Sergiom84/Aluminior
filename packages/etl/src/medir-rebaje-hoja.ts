/**
 * Mide el REBAJE de las piezas de perfil de hoja contra el histórico.
 *
 * La hoja encaja dentro del marco, así que su corte es menor que la medida
 * del hueco que da la fórmula de la plantilla. Sin esta corrección el motor
 * emitía la medida del hueco: el anexo T midió que reproducía **0 de las
 * 1.003 líneas con hoja**. Con ella, el 91,8% de las piezas de hoja.
 *
 * Clave de la regla: (perfil real, eje, fórmula, serie) — anexos T.9/T.10.
 * Ni la serie sola ni el perfil solo bastan (15%); con la fórmula sube al
 * 79,6% y con las cuatro al 93,0%, contra un techo demostrado del 94,4%.
 *
 * El emparejamiento pieza real ↔ fila de plantilla es EXACTO, por ítem de
 * diseño (`VDatosLinDetDis.DisIdIt`). No se empareja por proximidad de
 * medida: hacerlo fabricó señal falsa tres veces en este proyecto (S.7.2,
 * T.6, T.15).
 *
 * Sólo lectura sobre los CSV.
 */
import { rutaTabla, leerLotes, txt, num, type Fila } from './csv.ts'
import { evaluar } from '@aluminior/core/despiece'

/**
 * Consistencia mínima para publicar una regla.
 *
 * El proyecto usa ≥90% para DESCUBRIR reglas, pero aquí se corta aluminio:
 * una regla al 90% falla una de cada diez piezas, y el anexo T.13 midió que
 * esos fallos no son milimétricos (el 79,3% se desvía más de 10 mm; el mayor,
 * 630 mm). Decisión tomada con el titular del negocio: **99%**, aceptando
 * menos cobertura a cambio de menos piezas mal cortadas.
 *
 *   umbral  piezas valoradas  cortes malos
 *      90%             91,8%            92
 *      99%             61,9%            16
 *     100%             18,7%             0
 */
const UMBRAL_CONSISTENCIA = 0.99
/** Dos medidas a menos de esto son la misma. La del resto del proyecto. */
const TOLERANCIA_MM = 0.51
const MUESTRAS_MINIMAS = 3

export interface ReglaRebajeHoja {
  perfil_codigo: string
  eje: string
  formula: string
  serie_codigo: string
  rebaje_mm: number
  muestras: number
  total_muestras: number
}

export interface ResultadoRebajeHoja {
  reglas: ReglaRebajeHoja[]
  observaciones: number
  observacionesCubiertas: number
  /** Reglas descartadas por no llegar al umbral, con su cobertura perdida. */
  gruposDescartados: number
  /** Reglas que serían válidas al 90% pero no al umbral elegido. */
  gruposEntreUmbrales: number
  /** Reglas exactas (muestras = total): no generan aviso al valorar. */
  gruposExactos: number
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

export async function medirRebajeHoja(origen: string): Promise<ResultadoRebajeHoja> {
  const [estArt, estDis, vLin, detalles, datosLin, estructurasDa, medidasDa] =
    await Promise.all([
      leerTodo(origen, 'EstructurasArticulos'), leerTodo(origen, 'EstructurasDiseño'),
      leerTodo(origen, 'VPresupuestosLin'), leerTodo(origen, 'VDatosLinDetDis'),
      leerTodo(origen, 'VDatosLinEstr'), leerTodo(origen, 'EstructurasDA'),
      leerTodo(origen, 'VMedidasDA'),
    ])

  const FUNCIONES_HOJA = new Set(['HV', 'HH'])
  const detallePorLinea = new Map(detalles.map((f) => [t(f, 'nVLinea'), f]))

  // fila de plantilla por (estructura, eje, ítem de diseño)
  const plantillaHoja = new Map<string, Fila>()
  for (const f of estArt) {
    if (t(f, 'TipoDoc')) continue
    const fn = t(f, 'Funcion')
    if (!FUNCIONES_HOJA.has(fn)) continue
    const idIt = t(f, 'DisIdIt')
    if (!idIt || idIt === '0') continue
    if (!(t(f, 'FormulaLargoCorte') || t(f, 'FormulaLargo'))) continue
    const k = `${t(f, 'Estructura')}|${fn}|${idIt}`
    if (!plantillaHoja.has(k)) plantillaHoja.set(k, f)
  }

  // cotas: por defecto de la plantilla, sobrescritas por las de la instancia
  const cotasDefecto = new Map<string, Record<string, number>>()
  const simboloPorId = new Map<string, string>()
  for (const f of estDis) {
    if (t(f, 'TipoDoc')) continue
    const e = t(f, 'Estructura'), s = t(f, 'Simbolo')
    if (!s) continue
    const mapa = cotasDefecto.get(e) ?? {}
    mapa[s] = n(f, 'Cota')
    cotasDefecto.set(e, mapa)
    const id = t(f, 'Id')
    if (id) simboloPorId.set(`${e}|${id}`, s)
  }
  const cotasInstancia = new Map<string, Record<string, number>>()
  for (const f of estDis) {
    if (t(f, 'TipoDoc') !== 'VPRES') continue
    const e = t(f, 'Estructura')
    const s = t(f, 'Simbolo') || simboloPorId.get(`${e}|${t(f, 'Id')}`) || ''
    if (!s) continue
    const k = `${t(f, 'nDoc')}|${t(f, 'nLinEstr')}`
    const mapa = cotasInstancia.get(k) ?? {}
    mapa[s] = n(f, 'Cota')
    cotasInstancia.set(k, mapa)
  }
  const simboloDa = new Map(estructurasDa.map((f) => [
    `${t(f, 'Estructura')}|${t(f, 'nDA')}`, t(f, 'SimboloDA'),
  ]))
  for (const f of medidasDa) {
    if (t(f, 'TipoDoc') !== 'VPRES') continue
    const s = simboloDa.get(`${t(f, 'Estructura')}|${t(f, 'nDA')}`)
    if (!s) continue
    const k = `${t(f, 'nDoc')}|${t(f, 'nLinEstr')}`
    const mapa = cotasInstancia.get(k) ?? {}
    mapa[s] = n(f, 'Medida')
    cotasInstancia.set(k, mapa)
  }
  const seriePorLinea = new Map<string, string>()
  for (const f of datosLin) {
    if (t(f, 'TipoDoc') !== 'VPRES') continue
    seriePorLinea.set(`${t(f, 'nVDoc')}|${t(f, 'nVLinea')}`, t(f, 'Conjunto1'))
  }
  const hijasPorPadre = new Map<string, Fila[]>()
  for (const f of vLin) {
    const p = t(f, 'nEstr')
    if (!p || p === '0') continue
    const lista = hijasPorPadre.get(p) ?? []
    lista.push(f)
    hijasPorPadre.set(p, lista)
  }

  interface Obs { delta: number; previsto: number }
  const grupos = new Map<string, Obs[]>()
  let observaciones = 0
  for (const p of vLin) {
    if (t(p, 'EstructuraSN') !== 'True') continue
    const estructura = t(p, 'Articulo')
    const ancho = n(p, 'Ancho'), largo = n(p, 'Largo')
    if (ancho <= 0 || largo <= 0) continue
    const k = `${t(p, 'nDoc')}|${t(p, 'nLinea')}`
    const serie = seriePorLinea.get(k) ?? ''
    const contexto = {
      L: largo, A: ancho,
      ...(cotasDefecto.get(estructura) ?? {}),
      ...(cotasInstancia.get(k) ?? {}),
    }
    for (const h of hijasPorPadre.get(t(p, 'nLinea')) ?? []) {
      const fn = t(h, 'Funcion')
      if (!FUNCIONES_HOJA.has(fn)) continue
      const perfil = t(h, 'Articulo')
      if (!perfil || perfil === '0') continue
      const corte = n(h, 'LargoCorte') || n(h, 'Largo')
      if (corte <= 0) continue
      const det = detallePorLinea.get(t(h, 'nLinea'))
      const idIt = det ? t(det, 'DisIdIt') : ''
      if (!idIt || idIt === '0') continue
      const fila = plantillaHoja.get(`${estructura}|${fn}|${idIt}`)
      if (!fila) continue
      const formula = t(fila, 'FormulaLargoCorte') || t(fila, 'FormulaLargo')
      let previsto: number
      try { previsto = evaluar(formula, contexto) } catch { continue }
      observaciones++
      const clave = JSON.stringify([perfil, fn, formula, serie])
      const lista = grupos.get(clave) ?? []
      lista.push({ delta: previsto - corte, previsto })
      grupos.set(clave, lista)
    }
  }

  const reglas: ReglaRebajeHoja[] = []
  let observacionesCubiertas = 0, gruposDescartados = 0
  let gruposEntreUmbrales = 0, gruposExactos = 0
  for (const [clave, obs] of grupos) {
    if (obs.length < MUESTRAS_MINIMAS) { gruposDescartados++; continue }
    // moda con tolerancia: el valor que más vecinos reúne
    let mejor: number | null = null, mejorN = 0
    for (const o of obs) {
      const cuantos = obs.filter((x) => Math.abs(x.delta - o.delta) <= TOLERANCIA_MM).length
      if (cuantos > mejorN) { mejorN = cuantos; mejor = o.delta }
    }
    const consistencia = mejorN / obs.length
    // Un grupo cuyas piezas comparten todas la misma medida evaluada sería
    // "estable" por trivialidad, no por regla (anexo T.9: 24 de 74 lo eran).
    const medidasDistintas = new Set(obs.map((o) => Math.round(o.previsto))).size > 1
    if (consistencia < UMBRAL_CONSISTENCIA || mejor === null || !medidasDistintas) {
      gruposDescartados++
      if (consistencia >= 0.9 && medidasDistintas) gruposEntreUmbrales++
      continue
    }
    const [perfil, eje, formula, serie] = JSON.parse(clave) as [string, string, string, string]
    reglas.push({
      perfil_codigo: perfil, eje, formula, serie_codigo: serie,
      rebaje_mm: Math.round(mejor * 100) / 100,
      muestras: mejorN, total_muestras: obs.length,
    })
    observacionesCubiertas += obs.length
    if (mejorN === obs.length) gruposExactos++
  }

  return {
    reglas, observaciones, observacionesCubiertas,
    gruposDescartados, gruposEntreUmbrales, gruposExactos,
  }
}
