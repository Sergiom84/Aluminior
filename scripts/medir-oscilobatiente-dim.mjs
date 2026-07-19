/**
 * MEDICIÓN, no construcción. Punto 1 del plan retomado (T.24):
 *
 *   T.23 dejó OBC/OBPH partidos 66% (comp. 25/26) + 33% (comp. 29). La tarea es
 *   identificar QUÉ dimensión separa el 66% del 33% — candidato natural
 *   (T.23.3): la posición/eje de la pieza en el diseño (hoja vs vierteaguas).
 *
 * Cuatro ajustes obligatorios del encargo:
 *   1. Ancla de regresión: reproducir primero los números de T.23 con el MISMO
 *      test determinista (OBC 1.965 / 66,2%; OBPH 1.200 / 66,3%). Si divergen al
 *      restringir a OBC/OBPH es un bug de la restricción, no un descubrimiento.
 *   2. Clasificar cada candidato UTILIZABLE / INUTILIZABLE: sólo sirve si vive
 *      en la PLANTILLA o el ÁRBOL DE DISEÑO en el momento de resolver. Un campo
 *      que sólo existe en la instancia ya calculada predice el pasado.
 *   3. Candidato #3 añadido: pertenencia de la pieza a una hoja del árbol
 *      (DisIdHoja + posición del nodo vía ContenidoEn/posHueco). El vierteaguas
 *      es la pieza baja DE una hoja: mejor mecánica causal.
 *   4. Separación limpia = ≥99% de pureza sobre las piezas discriminantes, con
 *      ≥5 obs por valor, sosteniéndose INTRA-serie. Un 95% no vale. Si nadie lo
 *      alcanza: se dice y se para (regla 7).
 *
 * Enlace con el oráculo EXACTO por VDatosLinDetDis (regla 8: nunca por
 * proximidad de medida). Se imprime el dato aunque sea nulo (regla 7).
 *
 * Sólo lectura. No se implementa nada a partir de esto sin verlo antes.
 */
import postgres from 'postgres'
import { readFileSync } from 'node:fs'
import { expandirCadena } from '../packages/core/src/series/resolver.ts'

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const leerEnv = (k) => {
  const m = env.match(new RegExp(`^${k}=(.*)$`, 'm'))
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : null
}
const url = leerEnv('DATABASE_URL')
const RUTA = leerEnv('RUTA_CSV_ORIGEN')
const DIR = new URL(`file:///${RUTA.replace(/\\/g, '/').replace(/\/?$/, '/')}`)
const sql = postgres(url)

// La familia entera del oscilobatiente. El punto 1 pedía OBC/OBPH; el encargo
// extiende la prueba de fuego a OBCR/OBP/OBM porque T.23.2 midió su 99,5% con la
// MISMA clave ambigua y ese 99,5% puede ser la misma tautología.
const OBJETIVO = new Set(['OBC', 'OBPH', 'OBCR', 'OBP', 'OBM'])
const HOJA = new Set(['25', '26'])          // 25 y 26 resuelven al mismo artículo (T.23)
const VIERTEAGUAS = '29'

function leerCsv(nombre) {
  const txt = readFileSync(new URL(nombre, DIR), 'utf8').replace(/^﻿/, '')
  const filas = []
  let campo = '', fila = [], enComillas = false
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i]
    if (enComillas) {
      if (c === '"') { if (txt[i + 1] === '"') { campo += '"'; i++ } else enComillas = false }
      else campo += c
    } else if (c === '"') enComillas = true
    else if (c === ',') { fila.push(campo); campo = '' }
    else if (c === '\n') { fila.push(campo); filas.push(fila); fila = []; campo = '' }
    else if (c !== '\r') campo += c
  }
  if (campo || fila.length) { fila.push(campo); filas.push(fila) }
  const cab = filas.shift()
  return filas.map((f) => Object.fromEntries(cab.map((h, i) => [h, f[i]])))
}
const vacio = (v) => v === undefined || v === null || v === '' || v === '0'
const muestra = (v) => (v === undefined || v === null || v === '') ? '(nulo)' : v

// ── Resolución por ConjuntosLin (cadena de la serie) ─────────────────────
const resol = await sql`select conjunto_codigo, componente, articulo_codigo from conjunto_resoluciones`
const porConjuntoLin = new Map()
for (const r of resol) {
  const m = porConjuntoLin.get(r.conjunto_codigo) ?? new Map()
  m.set(r.componente, r.articulo_codigo)
  porConjuntoLin.set(r.conjunto_codigo, m)
}
const deleg = await sql`select conjunto_codigo, delegado_codigo from conjunto_delegaciones`
const mapaDeleg = new Map()
for (const d of deleg) {
  if (!mapaDeleg.has(d.conjunto_codigo)) mapaDeleg.set(d.conjunto_codigo, [])
  mapaDeleg.get(d.conjunto_codigo).push(d.delegado_codigo)
}
const cacheCadena = new Map()
function resolEnSerie(serie, comp) {
  let cadena = cacheCadena.get(serie)
  if (!cadena) cacheCadena.set(serie, (cadena = expandirCadena(serie, mapaDeleg)))
  for (const conjunto of cadena) {
    const v = porConjuntoLin.get(conjunto)?.get(comp)
    if (v) return v
  }
  return null
}

// ── Oráculo ──────────────────────────────────────────────────────────────
const estArt = leerCsv('EstructurasArticulos.csv')
// (A) mapa T.23: clave Estructura|Funcion|DisIdIt -> DisComponente (last-wins).
//     Ambiguo a propósito: reproduce el enlace del anexo T.23 tal cual.
const plantillaA = new Map()
// (B) mapa limpio: clave Estructura|DisComponente|DisIdIt -> fila de plantilla.
const plantillaB = new Map()
const colisionesB = new Map()
for (const f of estArt) {
  if (f.TipoDoc) continue
  const idIt = f.DisIdIt
  if (!idIt || idIt === '0') continue
  plantillaA.set(`${f.Estructura}|${f.Funcion}|${idIt}`, f.DisComponente)
  const kB = `${f.Estructura}|${f.DisComponente}|${idIt}`
  if (plantillaB.has(kB) && plantillaB.get(kB).Funcion !== f.Funcion) {
    colisionesB.set(kB, (colisionesB.get(kB) || 1) + 1)
  }
  plantillaB.set(kB, f)
}

const datosLin = leerCsv('VDatosLinEstr.csv')
const seriePorLinea = new Map()
for (const f of datosLin) {
  if (f.TipoDoc !== 'VPRES') continue
  seriePorLinea.set(f.nVLinea, f.Conjunto1)
}
const detalles = leerCsv('VDatosLinDetDis.csv')
const detallePorLinea = new Map(detalles.map((f) => [f.nVLinea, f]))
const vLin = leerCsv('VPresupuestosLin.csv')
const hijasPorPadre = new Map()
for (const f of vLin) {
  if (!f.nEstr || f.nEstr === '0') continue
  const l = hijasPorPadre.get(f.nEstr) ?? []
  l.push(f)
  hijasPorPadre.set(f.nEstr, l)
}

// ── Árbol de diseño: nodo por (Estructura, Id) y grupos por hoja ──────────
const diseno = leerCsv('EstructurasDiseño.csv')
const nodoPorEst = new Map()             // `${Est}|${Id}` -> nodo
const nodosPorHoja = new Map()           // `${Est}|${idHoja}` -> [nodos]  (idHoja != 0)
for (const n of diseno) {
  nodoPorEst.set(`${n.Estructura}|${n.Id}`, n)
  if (n.idHoja && n.idHoja !== '0') {
    const k = `${n.Estructura}|${n.idHoja}`
    if (!nodosPorHoja.has(k)) nodosPorHoja.set(k, [])
    nodosPorHoja.get(k).push(n)
  }
}
/** Heurística #3: ¿es el nodo el de posHueco máximo dentro de su hoja? (candidato a "pieza baja") */
function esNodoBajoDeHoja(est, nodo) {
  if (!nodo || !nodo.idHoja || nodo.idHoja === '0') return null
  const grupo = nodosPorHoja.get(`${est}|${nodo.idHoja}`) ?? []
  if (grupo.length < 2) return null
  const max = Math.max(...grupo.map((g) => Number(g.posHueco) || 0))
  return (Number(nodo.posHueco) || 0) === max ? 'sí(max)' : 'no'
}

// ── Recorrido común: cada pieza real OBC/OBPH con sus dos enlaces ─────────
/** Etiqueta ground-truth: hoja(25/26) vs vierteaguas(29) vs otro. */
function etiqueta(real, r25, r26, r29) {
  if (real === r25 || real === r26) return 'hoja(25/26)'
  if (real === r29) return '29'
  return 'otro/ninguno'
}

// ═══ SECCIÓN A — Ancla de regresión: método T.23 exacto ═══════════════════
console.log('═══ A. Ancla de regresión (enlace T.23: plantilla Est|Funcion|DisIdIt, last-wins) ═══')
const anclaA = new Map()   // comp -> {total, c25, c26, c29, compReal:Map}
for (const p of vLin) {
  if (p.EstructuraSN !== 'True') continue
  const serie = seriePorLinea.get(p.nLinea)
  if (!serie) continue
  for (const h of hijasPorPadre.get(p.nLinea) ?? []) {
    const det = detallePorLinea.get(h.nLinea)
    const idIt = det?.DisIdIt
    if (!idIt || idIt === '0') continue
    const comp = plantillaA.get(`${p.Articulo}|${h.Funcion}|${idIt}`)
    if (!comp || !OBJETIVO.has(comp)) continue
    const real = h.Articulo
    if (vacio(real)) continue
    const a = anclaA.get(comp) ?? { total: 0, c25: 0, c26: 0, c29: 0, compReal: new Map() }
    a.total++
    if (resolEnSerie(serie, '25') === real) a.c25++
    if (resolEnSerie(serie, '26') === real) a.c26++
    if (resolEnSerie(serie, VIERTEAGUAS) === real) a.c29++
    // PRUEBA DE FUEGO: ¿cuál es el Componente VERDADERO (de la instancia) de las
    // piezas que la clave T.23 mete en el bucket OBC/OBPH?
    const cr = det.Componente || '(vacío)'
    a.compReal.set(cr, (a.compReal.get(cr) || 0) + 1)
    anclaA.set(comp, a)
  }
}
// [total, % de acierto al fijar comp 25/26] según T.23.2. OBM no está en esa tabla.
const esperado = { OBC: [1965, 66.2], OBPH: [1200, 66.3], OBCR: [1310, 99.2], OBP: [800, 99.5], OBM: null }
for (const comp of ['OBC', 'OBPH', 'OBCR', 'OBP', 'OBM']) {
  const a = anclaA.get(comp) ?? { total: 0, c25: 0, c26: 0, c29: 0 }
  const p = (x) => a.total ? (x / a.total * 100).toFixed(1) : '—'
  const e = esperado[comp]
  const ok = e && a.total === e[0] && Math.abs(Number(p(a.c25)) - e[1]) < 0.3
  console.log(`  ${comp}: ${a.total} piezas · 25=${p(a.c25)}% 26=${p(a.c26)}% 29=${p(a.c29)}%` +
    (e ? `   [T.23 esperaba ${e[0]}/${e[1]}%] ${ok ? '✓ ancla OK' : '✗ DIVERGE'}` : '   [T.23 no lo tabuló]'))
  const comps = [...(a.compReal ?? new Map())].sort((x, y) => y[1] - x[1])
  console.log(`      Componente REAL (instancia) de ese bucket: ` +
    (comps.map(([k, v]) => `${k}=${v} (${(v / a.total * 100).toFixed(1)}%)`).join('  ') || '(bucket vacío)'))
}

// ═══ SECCIÓN B — Enlace limpio por VDatosLinDetDis.Componente ═════════════
console.log('\n═══ B. Enlace limpio (VDatosLinDetDis.Componente = genérico por pieza) ═══')
console.log(`  Colisiones de la clave T.23 (misma Est|Funcion|DisIdIt con Funcion distinta en B): ${colisionesB.size} claves`)
const limpio = new Map()   // comp -> {total, c25, c26, c29}
const piezas = []          // dataset para la sección C
let nodoJoinOK = 0, nodoJoinNo = 0
const obArt = new Map()   // comp real OB* -> {con, sin}  ¿la ranura REAL lleva perfil?
for (const p of vLin) {
  if (p.EstructuraSN !== 'True') continue
  const serie = seriePorLinea.get(p.nLinea)
  if (!serie) continue
  for (const h of hijasPorPadre.get(p.nLinea) ?? []) {
    const det = detallePorLinea.get(h.nLinea)
    if (!det) continue
    const comp = det.Componente
    if (!OBJETIVO.has(comp)) continue
    const real = h.Articulo
    const ea = obArt.get(comp) ?? { con: 0, sin: 0 }
    if (vacio(real)) { ea.sin++; obArt.set(comp, ea); continue }
    ea.con++; obArt.set(comp, ea)
    const r25 = resolEnSerie(serie, '25')
    const r26 = resolEnSerie(serie, '26')
    const r29 = resolEnSerie(serie, VIERTEAGUAS)
    const l = limpio.get(comp) ?? { total: 0, c25: 0, c26: 0, c29: 0 }
    l.total++
    if (r25 === real) l.c25++
    if (r26 === real) l.c26++
    if (r29 === real) l.c29++
    limpio.set(comp, l)

    const est = p.Articulo
    const plant = plantillaB.get(`${est}|${comp}|${det.DisIdIt}`) ?? null
    const nodo = nodoPorEst.get(`${est}|${det.DisId}`) ?? null
    if (nodo) nodoJoinOK++; else nodoJoinNo++
    // discriminante sólo si 25 y 29 resuelven a artículos DISTINTOS (regla 9)
    const discriminante = r25 && r29 && r25 !== r29
    piezas.push({
      comp, serie, est, real, r25, r26, r29,
      etiqueta: etiqueta(real, r25, r26, r29),
      discriminante,
      plant, det, nodo,
      esBaja: esNodoBajoDeHoja(est, nodo),
    })
  }
}
console.log('  ¿la ranura OB* REAL (Componente de instancia) lleva perfil en el oráculo?')
let totalCon = 0, totalSin = 0
for (const comp of ['OBC', 'OBPH', 'OBCR', 'OBP', 'OBM']) {
  const ea = obArt.get(comp) ?? { con: 0, sin: 0 }
  totalCon += ea.con; totalSin += ea.sin
  console.log(`    ${comp.padEnd(5)} con perfil=${ea.con}  ·  Articulo=0 (sin perfil)=${ea.sin}`)
}
console.log(`  → TOTAL OB*: ${totalCon} con perfil · ${totalSin} sin perfil. La ranura OB* real es`)
console.log('    herraje (compás/mecanismo/cremona), no perfil. Los buckets OB* de T.23 son')
console.log('    piezas 25/26/29 mal etiquetadas por la colisión de la clave Est|Funcion|DisIdIt.')
console.log(`  join al nodo de diseño (Est|DisId): ${nodoJoinOK} con nodo · ${nodoJoinNo} sin nodo`)

// ═══ SECCIÓN C — Caza de la dimensión sobre el enlace limpio ══════════════
console.log('\n═══ C. Dimensión que separa hoja(25/26) de vierteaguas(29) ═══')
console.log('  (guarda: sólo corre si alguna ranura OB* llevara perfil con enlace limpio)')
for (const comp of ['OBC', 'OBPH', 'OBCR', 'OBP', 'OBM']) {
  const todas = piezas.filter((x) => x.comp === comp)
  const disc = todas.filter((x) => x.discriminante)
  const triviales = todas.filter((x) => x.r25 && x.r29 && x.r25 === x.r29)
  const sinResol = todas.filter((x) => !x.r25 || !x.r29)
  const rep = (arr) => {
    const m = {}
    for (const x of arr) m[x.etiqueta] = (m[x.etiqueta] || 0) + 1
    return Object.entries(m).map(([k, v]) => `${k}=${v}`).join(' ')
  }
  console.log(`\n── ${comp}: ${todas.length} piezas · discriminantes(25≠29)=${disc.length} · ` +
    `triviales(25==29)=${triviales.length} · sin resolver 25 o 29=${sinResol.length}`)
  console.log(`   reparto etiquetas en discriminantes: ${rep(disc)}`)
  if (!disc.length) { console.log('   sin piezas discriminantes: nada que separar aquí.'); continue }

  const CANDIDATOS = [
    ['PLANTILLA', 'Funcion', (x) => x.plant?.Funcion],
    ['PLANTILLA', 'DisPosPerf', (x) => x.plant?.DisPosPerf],
    ['PLANTILLA', 'DisManoID', (x) => x.plant?.DisManoID],
    ['PLANTILLA', 'DisTipoHoja', (x) => x.plant?.DisTipoHoja],
    ['PLANTILLA', 'DisIdHoja', (x) => x.plant?.DisIdHoja],
    ['PLANTILLA', 'DisNHoja', (x) => x.plant?.DisNHoja],
    ['INSTANCIA', 'det.DisPosPerf', (x) => x.det?.DisPosPerf],
    ['INSTANCIA', 'det.DisManoID', (x) => x.det?.DisManoID],
    ['INSTANCIA', 'det.DisTipoHoja', (x) => x.det?.DisTipoHoja],
    ['INSTANCIA', 'det.DisIdHoja', (x) => x.det?.DisIdHoja],
    ['INSTANCIA', 'det.DisNHoja', (x) => x.det?.DisNHoja],
    ['INSTANCIA', 'det.Grupo', (x) => x.det?.Grupo],
    ['INSTANCIA', 'det.CV', (x) => x.det?.CV],
    ['DISEÑO', 'nodo.Tipo', (x) => x.nodo?.Tipo],
    ['DISEÑO', 'nodo.posHueco', (x) => x.nodo?.posHueco],
    ['DISEÑO', 'nodo.CompHojaInf', (x) => x.nodo?.CompHojaInf],
    ['DISEÑO', 'nodo.ContenidoEn', (x) => x.nodo?.ContenidoEn],
    ['DISEÑO', 'nodo.idHoja', (x) => x.nodo?.idHoja],
    ['DISEÑO', 'nodo.nHoja', (x) => x.nodo?.nHoja],
    ['DISEÑO#3', 'esNodoBajoDeHoja', (x) => x.esBaja],
  ]
  for (const [ubic, nombre, get] of CANDIDATOS) {
    // tabla de contingencia valor -> {hoja, v29, otro}
    const tabla = new Map()
    for (const x of disc) {
      const v = muestra(get(x))
      const t = tabla.get(v) ?? { hoja: 0, v29: 0, otro: 0 }
      if (x.etiqueta === 'hoja(25/26)') t.hoja++
      else if (x.etiqueta === '29') t.v29++
      else t.otro++
      tabla.set(v, t)
    }
    // ¿separa? cada valor con ≥5 obs debe ser ≥99% puro (hoja o 29), y deben
    // existir valores dominados por CADA etiqueta.
    let hayHoja = false, hayV29 = false, sucio = false, valoresConDatos = 0
    for (const [, t] of tabla) {
      const n = t.hoja + t.v29
      if (n < 5) continue
      valoresConDatos++
      const pureza = Math.max(t.hoja, t.v29) / n
      if (pureza < 0.99) sucio = true
      else if (t.hoja >= t.v29) hayHoja = true
      else hayV29 = true
    }
    const separa = !sucio && hayHoja && hayV29 && valoresConDatos >= 2
    const veredicto = valoresConDatos < 2 ? 'INSUFICIENTE (un solo valor útil)'
      : separa ? 'SEPARA ≥99%' : 'no separa'
    const util = ubic === 'INSTANCIA' ? 'INUTILIZABLE (sólo en instancia)' : 'UTILIZABLE (diseño-time)'
    console.log(`   [${ubic}] ${nombre.padEnd(16)} → ${veredicto}   ${separa ? '· ' + util : ''}`)
    // imprime la tabla completa sólo si separa o si es un candidato "estrella"
    const estrella = ['DisPosPerf', 'nodo.CompHojaInf', 'esNodoBajoDeHoja', 'nodo.posHueco'].includes(nombre)
    if (separa || estrella) {
      for (const [v, t] of [...tabla].sort((a, b) => (b[1].hoja + b[1].v29) - (a[1].hoja + a[1].v29))) {
        console.log(`        ${String(v).padEnd(10)} hoja=${t.hoja}  29=${t.v29}  otro=${t.otro}`)
      }
    }
    // guarda intra-serie para los que separan en agregado
    if (separa) {
      const series = new Map()
      for (const x of disc) {
        if (x.etiqueta === 'otro/ninguno') continue
        const s = series.get(x.serie) ?? new Map()
        const v = muestra(get(x))
        const t = s.get(v) ?? { hoja: 0, v29: 0 }
        if (x.etiqueta === 'hoja(25/26)') t.hoja++; else t.v29++
        s.set(v, t); series.set(x.serie, s)
      }
      let informativas = 0, separanIntra = 0
      for (const [, s] of series) {
        const tieneHoja = [...s.values()].some((t) => t.hoja > 0)
        const tieneV29 = [...s.values()].some((t) => t.v29 > 0)
        if (!tieneHoja || !tieneV29) continue   // serie no informativa (una sola etiqueta)
        informativas++
        const limpiaIntra = [...s.values()].every((t) => {
          const n = t.hoja + t.v29
          return n < 1 || Math.max(t.hoja, t.v29) / n >= 0.99
        })
        if (limpiaIntra) separanIntra++
      }
      console.log(`        INTRA-serie: ${separanIntra}/${informativas} series con ambas etiquetas ` +
        `siguen separando ≥99%  ${informativas === 0 ? '(⚠ ninguna serie es informativa: podría estar replicando la identidad de serie)' : ''}`)
    }
  }
}

await sql.end({ timeout: 5 })
