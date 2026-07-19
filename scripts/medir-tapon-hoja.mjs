/**
 * ¿Dónde está el tapón que impide ver el rebaje de hoja en la aplicación?
 *
 * Tres medidas que deciden el orden de trabajo (T.19.2 dejó abierto esto):
 *
 *   1. Estructuras CON pieza de hoja que resuelven TODAS sus ranuras, por serie.
 *   2. A qué series pertenecen los 11 grupos válidos al 90% pero no al 99%.
 *   3. Para las estructuras con hoja que NO resuelven: ¿lo que falta son
 *      ranuras de PERFIL o de ASOCIADO (anexo S)?
 *
 * Ojo con la pregunta 1: "resuelve todas sus ranuras" es condición NECESARIA
 * para valorar, no suficiente — la valoración además exige vidrio elegido,
 * cero piezas incalculables y precio en tarifa para todos los artículos. Aquí
 * se mide el techo, y se dice cuál es.
 *
 * El bloque de agrupación de la pregunta 2 está DUPLICADO de
 * packages/etl/src/medir-rebaje-hoja.ts a propósito: este script no debe poder
 * cambiar el comportamiento del ETL. Si aquel cambia, este queda obsoleto.
 *
 * Sólo lectura.
 */
import postgres from 'postgres'
import { readFileSync } from 'node:fs'
import { construirResoluciones, expandirCadena, resolverComponente }
  from '../packages/core/src/series/resolver.ts'
import { medirRebajeHoja } from '../packages/etl/src/medir-rebaje-hoja.ts'
import { rutaTabla, leerLotes, txt, num } from '../packages/etl/src/csv.ts'
import { evaluar } from '../packages/core/src/despiece/formula.ts'

const RAIZ = new URL('..', import.meta.url)
const env = readFileSync(new URL('.env', RAIZ), 'utf8')
const url = env.match(/^DATABASE_URL=(.*)$/m)[1].trim().replace(/^["']|["']$/g, '')
const sql = postgres(url)

const FUNCIONES_HOJA = new Set(['HV', 'HH'])
/** Ranuras de asociado: herrajes, escuadras, mano de obra (anexo S.2). */
const esAsociado = (fn) => !!fn && (fn.startsWith('inf') || fn.startsWith('Acc'))

// ─────────────────────────────────────────────────────────────────────────
// Datos comunes
// ─────────────────────────────────────────────────────────────────────────
const series = (await sql`select codigo from series order by codigo`).map((s) => s.codigo)
const deleg = await sql`select conjunto_codigo, delegado_codigo from conjunto_delegaciones`
const mapaDeleg = new Map()
for (const d of deleg) {
  if (!mapaDeleg.has(d.conjunto_codigo)) mapaDeleg.set(d.conjunto_codigo, [])
  mapaDeleg.get(d.conjunto_codigo).push(d.delegado_codigo)
}
const genericos = new Set(
  (await sql`select codigo from articulos where descripcion like '(**%'`).map((a) => a.codigo))

const comps = await sql`
  select estructura_codigo, articulo_codigo, componente_disenyo, funcion
  from estructura_componentes`
const porEstr = new Map()
for (const c of comps) {
  if (!porEstr.has(c.estructura_codigo)) porEstr.set(c.estructura_codigo, [])
  porEstr.get(c.estructura_codigo).push(c)
}
const conHoja = new Set()
for (const [estr, cs] of porEstr) {
  if (cs.some((c) => FUNCIONES_HOJA.has(c.funcion))) conHoja.add(estr)
}
console.log(`estructuras totales: ${porEstr.size} · con pieza de hoja: ${conHoja.size}`)

// ─────────────────────────────────────────────────────────────────────────
// 1 y 3
// ─────────────────────────────────────────────────────────────────────────
const limpiasPorSerie = new Map()
/** estructura con hoja -> {soloAsoc, soloPerfil, ambos} agregado por serie */
let bloqSoloAsoc = 0, bloqSoloPerfil = 0, bloqAmbos = 0, bloqTotal = 0
const ejemploPerfil = new Map()

for (const serie of series) {
  const cadena = expandirCadena(serie, mapaDeleg)
  const filas = await sql`
    select conjunto_codigo, componente, articulo_codigo
    from conjunto_resoluciones where conjunto_codigo = any(${cadena})`
  const resoluciones = construirResoluciones(cadena, filas.map((r) => ({
    conjuntoCodigo: r.conjunto_codigo, componente: r.componente, articuloCodigo: r.articulo_codigo,
  })))

  const limpias = []
  for (const estr of conHoja) {
    let asoc = 0, perfil = 0
    const faltanPerfil = []
    for (const c of porEstr.get(estr)) {
      let falla
      if (!c.componente_disenyo) falla = genericos.has(c.articulo_codigo)
      else {
        const r = resolverComponente(c.componente_disenyo, resoluciones, '2')
        falla = !r.articuloCodigo && genericos.has(c.articulo_codigo)
      }
      if (!falla) continue
      if (esAsociado(c.funcion)) asoc++
      else { perfil++; faltanPerfil.push(`${c.articulo_codigo}(${c.funcion})`) }
    }
    if (asoc === 0 && perfil === 0) { limpias.push(estr); continue }
    bloqTotal++
    if (perfil === 0) bloqSoloAsoc++
    else if (asoc === 0) { bloqSoloPerfil++; }
    else bloqAmbos++
    if (perfil > 0 && ejemploPerfil.size < 6 && !ejemploPerfil.has(`${serie}|${estr}`)) {
      ejemploPerfil.set(`${serie}|${estr}`, faltanPerfil.slice(0, 6).join(' '))
    }
  }
  if (limpias.length) limpiasPorSerie.set(serie, limpias)
}

// ¿Cuánto pesa el frente de perfiles? Ranuras de perfil distintas que ninguna
// serie resuelve, para saber si es un conjunto pequeño o una cola larga.
const ranuraPerfil = new Map()
for (const serie of series) {
  const cadena = expandirCadena(serie, mapaDeleg)
  const filas = await sql`
    select conjunto_codigo, componente, articulo_codigo
    from conjunto_resoluciones where conjunto_codigo = any(${cadena})`
  const resoluciones = construirResoluciones(cadena, filas.map((r) => ({
    conjuntoCodigo: r.conjunto_codigo, componente: r.componente, articuloCodigo: r.articulo_codigo,
  })))
  for (const estr of conHoja) {
    for (const c of porEstr.get(estr)) {
      if (esAsociado(c.funcion)) continue
      let falla
      if (!c.componente_disenyo) falla = genericos.has(c.articulo_codigo)
      else {
        const r = resolverComponente(c.componente_disenyo, resoluciones, '2')
        falla = !r.articuloCodigo && genericos.has(c.articulo_codigo)
      }
      if (!falla) continue
      const k = `${c.articulo_codigo}|${c.funcion}|${c.componente_disenyo ?? 'sin-componente'}`
      ranuraPerfil.set(k, (ranuraPerfil.get(k) || 0) + 1)
    }
  }
}
console.log(`\n══ 3b. Ranuras de PERFIL sin resolver: ${ranuraPerfil.size} distintas ══`)
const top = [...ranuraPerfil].sort((a, b) => b[1] - a[1])
console.log(`  las 15 más frecuentes (apariciones serie × estructura):`)
for (const [k, n] of top.slice(0, 15)) console.log(`    ${k}  ×${n}`)
const sinComponente = top.filter(([k]) => k.endsWith('sin-componente'))
console.log(`  de ellas, sin componente_disenyo (no resolubles por la cadena): ${sinComponente.length}`)

console.log('\n══ 1. Estructuras CON hoja que resuelven todas sus ranuras ══')
if (limpiasPorSerie.size === 0) console.log('  NINGUNA, en ninguna de las 57 series.')
for (const [serie, l] of limpiasPorSerie) {
  console.log(`  ${serie}: ${l.length} → ${l.slice(0, 8).join(', ')}`)
}

console.log('\n══ 3. Clasificación del bloqueo (serie × estructura con hoja) ══')
console.log(`  combinaciones bloqueadas: ${bloqTotal}`)
console.log(`    sólo asociados pendientes : ${bloqSoloAsoc}`)
console.log(`    sólo perfiles pendientes  : ${bloqSoloPerfil}`)
console.log(`    ambos                     : ${bloqAmbos}`)
console.log('  ejemplos de ranuras de PERFIL sin resolver:')
for (const [k, v] of ejemploPerfil) console.log(`    ${k}: ${v}`)

// ─────────────────────────────────────────────────────────────────────────
// 2. Los 11 grupos entre umbrales, con su serie
// ─────────────────────────────────────────────────────────────────────────
const ORIGEN = new URL('export_datos/EMP0016/', RAIZ).pathname.replace(/^\//, '')
const res = await medirRebajeHoja(ORIGEN)
const entreUmbrales = await gruposEntreUmbrales(ORIGEN)
console.log(`\n══ 2. Grupos 90–99% ══`)
console.log(`  el ETL cuenta ${res.gruposEntreUmbrales}; aquí salen ${entreUmbrales.length}`)
if (res.gruposEntreUmbrales !== entreUmbrales.length) {
  console.log('  ⚠ NO COINCIDEN: la copia de la agrupación ha divergido del ETL.')
}
const porSerie = new Map()
for (const g of entreUmbrales) porSerie.set(g.serie, (porSerie.get(g.serie) || 0) + 1)
console.log('  por serie:', [...porSerie].map(([s, n]) => `${s}=${n}`).join(', '))
for (const g of entreUmbrales) {
  console.log(`    ${g.serie} · ${g.perfil} · ${g.eje} · "${g.formula}" ` +
    `→ ${g.muestras}/${g.total} (${(g.consistencia * 100).toFixed(1)}%)`)
}
const seriesQueValoran = new Set(limpiasPorSerie.keys())
const dentro = entreUmbrales.filter((g) => seriesQueValoran.has(g.serie)).length
console.log(`\n  de esos grupos, en series con alguna estructura de hoja que valora: ${dentro}`)

await sql.end({ timeout: 5 })

/**
 * Copia de la agrupación de packages/etl/src/medir-rebaje-hoja.ts, quedándose
 * con los grupos que superan el 90% pero no el 99%. Duplicada a propósito: el
 * recuento del ETL se compara arriba contra este, y si divergen se avisa.
 */
async function gruposEntreUmbrales(origen) {
  const UMBRAL = 0.99, TOLERANCIA_MM = 0.51, MUESTRAS_MINIMAS = 3
  const t = (f, c) => txt(f[c]) ?? ''
  const n = (f, c) => Number(num(f[c]) ?? 0)
  const leer = async (tabla) => {
    const ruta = rutaTabla(origen, tabla)
    if (!ruta) return []
    const filas = []
    for await (const lote of leerLotes(ruta, 1000)) filas.push(...lote)
    return filas
  }
  const [estArt, estDis, vLin, detalles, datosLin, estructurasDa, medidasDa] =
    await Promise.all(['EstructurasArticulos', 'EstructurasDiseño', 'VPresupuestosLin',
      'VDatosLinDetDis', 'VDatosLinEstr', 'EstructurasDA', 'VMedidasDA'].map(leer))

  const detallePorLinea = new Map(detalles.map((f) => [t(f, 'nVLinea'), f]))
  const plantillaHoja = new Map()
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
  const cotasDefecto = new Map(), simboloPorId = new Map()
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
  const cotasInstancia = new Map()
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
    `${t(f, 'Estructura')}|${t(f, 'nDA')}`, t(f, 'SimboloDA')]))
  for (const f of medidasDa) {
    if (t(f, 'TipoDoc') !== 'VPRES') continue
    const s = simboloDa.get(`${t(f, 'Estructura')}|${t(f, 'nDA')}`)
    if (!s) continue
    const k = `${t(f, 'nDoc')}|${t(f, 'nLinEstr')}`
    const mapa = cotasInstancia.get(k) ?? {}
    mapa[s] = n(f, 'Medida')
    cotasInstancia.set(k, mapa)
  }
  const seriePorLinea = new Map()
  for (const f of datosLin) {
    if (t(f, 'TipoDoc') !== 'VPRES') continue
    seriePorLinea.set(`${t(f, 'nVDoc')}|${t(f, 'nVLinea')}`, t(f, 'Conjunto1'))
  }
  const hijasPorPadre = new Map()
  for (const f of vLin) {
    const p = t(f, 'nEstr')
    if (!p || p === '0') continue
    const lista = hijasPorPadre.get(p) ?? []
    lista.push(f)
    hijasPorPadre.set(p, lista)
  }
  const grupos = new Map()
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
      let previsto
      try { previsto = evaluar(formula, contexto) } catch { continue }
      const clave = JSON.stringify([perfil, fn, formula, serie])
      const lista = grupos.get(clave) ?? []
      lista.push({ delta: previsto - corte, previsto })
      grupos.set(clave, lista)
    }
  }
  const salida = []
  for (const [clave, obs] of grupos) {
    if (obs.length < MUESTRAS_MINIMAS) continue
    let mejorN = 0
    for (const o of obs) {
      const cuantos = obs.filter((x) => Math.abs(x.delta - o.delta) <= TOLERANCIA_MM).length
      if (cuantos > mejorN) mejorN = cuantos
    }
    const consistencia = mejorN / obs.length
    const medidasDistintas = new Set(obs.map((o) => Math.round(o.previsto))).size > 1
    if (consistencia >= UMBRAL || !medidasDistintas) continue
    if (consistencia < 0.9) continue
    const [perfil, eje, formula, serie] = JSON.parse(clave)
    salida.push({ perfil, eje, formula, serie, consistencia, muestras: mejorN, total: obs.length })
  }
  return salida
}
