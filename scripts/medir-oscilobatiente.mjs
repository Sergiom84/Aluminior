/**
 * MEDICIÓN, no construcción. Hipótesis de T.21.4 punto 2:
 *
 *   las ranuras OBC / OBM / OBCR / OBP / OBPH (y quizá PRC / PRPV / PRPH)
 *   NO resuelven por ConjuntosLin sino por **ConjuntosAsoc**, usando el mismo
 *   DisComponente como ComponenteAsoc (anexo S.2: 50 de los 54 valores de
 *   ComponenteAsoc son DisComponente, y cita OBC y OBCR).
 *
 * Se contrasta contra el oráculo como en el anexo J: el perfil REAL que eligió
 * GAIA está en las líneas hijas de VPresupuestosLin, y el enlace con la fila
 * de plantilla es EXACTO por VDatosLinDetDis.DisIdIt — no por proximidad de
 * medida (regla 8).
 *
 * Sólo lectura. No se implementa nada a partir de esto sin verlo antes.
 */
import postgres from 'postgres'
import { readFileSync } from 'node:fs'
import { expandirCadena } from '../packages/core/src/series/resolver.ts'

const DIR = new URL('../export_datos/EMP0016/', import.meta.url)
const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const url = env.match(/^DATABASE_URL=(.*)$/m)[1].trim().replace(/^["']|["']$/g, '')
const sql = postgres(url)

const OSCILO = new Set(['OBC', 'OBM', 'OBCR', 'OBP', 'OBPH'])
const PRACTICABLE = new Set(['PRC', 'PRPV', 'PRPH'])
const DIANA = new Set([...OSCILO, ...PRACTICABLE])

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

// ── ¿Existen siquiera esas ranuras en ConjuntosAsoc? ─────────────────────
const asoc = leerCsv('ConjuntosAsoc.csv')
const presentes = new Map()
for (const f of asoc) {
  const c = f.ComponenteAsoc
  if (!DIANA.has(c)) continue
  if (!presentes.has(c)) presentes.set(c, [])
  presentes.get(c).push(f)
}
console.log('══ 0. ¿Están esas ranuras en ConjuntosAsoc? ══')
for (const c of DIANA) {
  const filas = presentes.get(c) ?? []
  const conjuntos = new Set(filas.map((f) => f.Conjunto))
  const articulos = new Set(filas.map((f) => f.Articulo).filter(Boolean))
  console.log(`  ${c.padEnd(5)} ${String(filas.length).padStart(5)} filas · ` +
    `${conjuntos.size} conjuntos · ${articulos.size} artículos distintos`)
}
if ([...DIANA].every((c) => !presentes.has(c))) {
  console.log('\n  Ninguna aparece: la hipótesis queda REFUTADA aquí mismo.')
  await sql.end({ timeout: 5 })
  process.exit(0)
}

// ── Índice conjunto → componente → artículos (con sus condiciones) ───────
const porConjunto = new Map()
for (const f of asoc) {
  if (!f.ComponenteAsoc) continue
  const m = porConjunto.get(f.Conjunto) ?? new Map()
  const lista = m.get(f.ComponenteAsoc) ?? []
  lista.push(f)
  m.set(f.ComponenteAsoc, lista)
  porConjunto.set(f.Conjunto, m)
}

const deleg = await sql`select conjunto_codigo, delegado_codigo from conjunto_delegaciones`
const mapaDeleg = new Map()
for (const d of deleg) {
  if (!mapaDeleg.has(d.conjunto_codigo)) mapaDeleg.set(d.conjunto_codigo, [])
  mapaDeleg.get(d.conjunto_codigo).push(d.delegado_codigo)
}
/** Candidatos de una serie para un componente, recorriendo su cadena. */
function candidatos(serie, componente) {
  for (const conjunto of expandirCadena(serie, mapaDeleg)) {
    const filas = porConjunto.get(conjunto)?.get(componente)
    if (filas?.length) return filas
  }
  return []
}

// ── Oráculo: perfil real por (línea hija) con enlace exacto ──────────────
const estArt = leerCsv('EstructurasArticulos.csv')
const plantilla = new Map()          // estructura|funcion|DisIdIt -> DisComponente
for (const f of estArt) {
  if (f.TipoDoc) continue
  const idIt = f.DisIdIt
  if (!idIt || idIt === '0') continue
  plantilla.set(`${f.Estructura}|${f.Funcion}|${idIt}`, f.DisComponente)
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

const res = { total: 0, sinCandidato: 0, unico: 0, acierto: 0, fallo: 0, ambiguo: 0 }
const porRanura = new Map()
const ejemplosFallo = []
for (const p of vLin) {
  if (p.EstructuraSN !== 'True') continue
  const serie = seriePorLinea.get(p.nLinea)
  if (!serie) continue
  for (const h of hijasPorPadre.get(p.nLinea) ?? []) {
    const det = detallePorLinea.get(h.nLinea)
    const idIt = det?.DisIdIt
    if (!idIt || idIt === '0') continue
    const comp = plantilla.get(`${p.Articulo}|${h.Funcion}|${idIt}`)
    if (!comp || !DIANA.has(comp)) continue
    const real = h.Articulo
    if (!real || real === '0') continue
    res.total++
    const r = porRanura.get(comp) ?? { total: 0, acierto: 0, fallo: 0, sinCandidato: 0, ambiguo: 0 }
    r.total++
    const cands = candidatos(serie, comp)
    const arts = [...new Set(cands.map((f) => f.Articulo).filter(Boolean))]
    if (arts.length === 0) { res.sinCandidato++; r.sinCandidato++ }
    else if (arts.length === 1) {
      res.unico++
      if (arts[0] === real) { res.acierto++; r.acierto++ }
      else {
        res.fallo++; r.fallo++
        if (ejemplosFallo.length < 8) ejemplosFallo.push(`${serie} ${comp}: predice ${arts[0]}, real ${real}`)
      }
    } else {
      res.ambiguo++; r.ambiguo++
      if (arts.includes(real)) r.aciertoEnConjunto = (r.aciertoEnConjunto ?? 0) + 1
    }
    porRanura.set(comp, r)
  }
}

console.log(`\n══ 1. Contraste con el oráculo (${res.total} piezas reales) ══`)
const pct = (x) => res.total ? `${(x / res.total * 100).toFixed(1)}%` : '—'
console.log(`  candidato único y ACIERTA : ${res.acierto}  ${pct(res.acierto)}`)
console.log(`  candidato único y falla   : ${res.fallo}  ${pct(res.fallo)}`)
console.log(`  varios candidatos         : ${res.ambiguo}  ${pct(res.ambiguo)}`)
console.log(`  sin candidato             : ${res.sinCandidato}  ${pct(res.sinCandidato)}`)

console.log('\n══ 2. Por ranura ══')
for (const [comp, r] of [...porRanura].sort((a, b) => b[1].total - a[1].total)) {
  const familia = OSCILO.has(comp) ? 'oscilo' : 'practic'
  console.log(`  ${comp.padEnd(5)} [${familia}] ${String(r.total).padStart(4)} piezas · ` +
    `acierta ${r.acierto} · falla ${r.fallo} · ambiguo ${r.ambiguo}` +
    (r.aciertoEnConjunto ? ` (el real está entre los candidatos en ${r.aciertoEnConjunto})` : '') +
    ` · sin candidato ${r.sinCandidato}`)
  // El dato que decide: si el perfil real NUNCA está entre los candidatos,
  // ConjuntosAsoc no es la vía, por muchas condiciones que se le añadan.
  console.log(`        el perfil real está entre los candidatos en ` +
    `${r.aciertoEnConjunto ?? 0} de ${r.ambiguo} casos ambiguos`)
}
if (ejemplosFallo.length) {
  console.log('\n  ejemplos de fallo:')
  for (const e of ejemplosFallo) console.log(`    ${e}`)
}

// ── 3. Si no es ConjuntosAsoc, ¿está el perfil real en ConjuntosLin bajo
// OTRO componente de la misma serie? Eso apuntaría a que estas ranuras son
// variantes de apertura de un perfil de hoja que la serie ya resuelve — la
// "dimensión pendiente" que el anexo J dejó anotada.
const resol = await sql`select conjunto_codigo, componente, articulo_codigo from conjunto_resoluciones`
const porConjuntoLin = new Map()
for (const r of resol) {
  const m = porConjuntoLin.get(r.conjunto_codigo) ?? new Map()
  m.set(r.componente, r.articulo_codigo)
  porConjuntoLin.set(r.conjunto_codigo, m)
}
const enLin = { si: 0, no: 0 }
const componentesQueLoDan = new Map()
for (const p of vLin) {
  if (p.EstructuraSN !== 'True') continue
  const serie = seriePorLinea.get(p.nLinea)
  if (!serie) continue
  for (const h of hijasPorPadre.get(p.nLinea) ?? []) {
    const det = detallePorLinea.get(h.nLinea)
    const idIt = det?.DisIdIt
    if (!idIt || idIt === '0') continue
    const comp = plantilla.get(`${p.Articulo}|${h.Funcion}|${idIt}`)
    if (!comp || !DIANA.has(comp)) continue
    const real = h.Articulo
    if (!real || real === '0') continue
    let encontrado = null
    for (const conjunto of expandirCadena(serie, mapaDeleg)) {
      const m = porConjuntoLin.get(conjunto)
      if (!m) continue
      for (const [c, art] of m) if (art === real) { encontrado = c; break }
      if (encontrado) break
    }
    if (encontrado) {
      enLin.si++
      const k = `${comp} → componente ${encontrado}`
      componentesQueLoDan.set(k, (componentesQueLoDan.get(k) || 0) + 1)
    } else enLin.no++
  }
}
console.log(`\n══ 3. ¿El perfil real está en ConjuntosLin bajo otro componente? ══`)
console.log(`  sí: ${enLin.si}  ·  no: ${enLin.no}`)
console.log('  ⚠ Este test sólo demuestra CONTENCIÓN, no la correspondencia: busca')
console.log('    cualquier componente cuyo artículo coincida y se queda con el')
console.log('    primero. Si varios lo dan, el que sale es arbitrario (regla 8).')
console.log('    Las cifras de abajo NO son una regla; el test determinista es el 4.')
for (const [k, n] of [...componentesQueLoDan].sort((a, b) => b[1] - a[1]).slice(0, 8)) {
  console.log(`    ${k.padEnd(34)} ×${n}`)
}

// ── 4. Test DETERMINISTA: fijamos el componente candidato de antemano y
// medimos, sin elegir emparejamiento a posteriori.
const CANDIDATOS = ['25', '26', '29', '25P', '25PE', '22', '23']
console.log(`\n══ 4. Determinista: ¿resoluciones[X] == perfil real? ══`)
const acc = new Map()   // ranura -> candidato -> aciertos
const totalPorRanura = new Map()
for (const p of vLin) {
  if (p.EstructuraSN !== 'True') continue
  const serie = seriePorLinea.get(p.nLinea)
  if (!serie) continue
  for (const h of hijasPorPadre.get(p.nLinea) ?? []) {
    const det = detallePorLinea.get(h.nLinea)
    const idIt = det?.DisIdIt
    if (!idIt || idIt === '0') continue
    const comp = plantilla.get(`${p.Articulo}|${h.Funcion}|${idIt}`)
    if (!comp || !DIANA.has(comp)) continue
    const real = h.Articulo
    if (!real || real === '0') continue
    totalPorRanura.set(comp, (totalPorRanura.get(comp) || 0) + 1)
    for (const x of CANDIDATOS) {
      let art = null
      for (const conjunto of expandirCadena(serie, mapaDeleg)) {
        const v = porConjuntoLin.get(conjunto)?.get(x)
        if (v) { art = v; break }
      }
      if (art === real) {
        const m = acc.get(comp) ?? new Map()
        m.set(x, (m.get(x) || 0) + 1)
        acc.set(comp, m)
      }
    }
  }
}
for (const [comp, total] of [...totalPorRanura].sort((a, b) => b[1] - a[1])) {
  const m = acc.get(comp) ?? new Map()
  const mejores = [...m].sort((a, b) => b[1] - a[1]).slice(0, 3)
    .map(([x, n]) => `${x}=${(n / total * 100).toFixed(1)}%`)
  console.log(`  ${comp.padEnd(5)} ${String(total).padStart(4)} piezas · ${mejores.join('  ') || 'ningún candidato acierta'}`)
}

await sql.end({ timeout: 5 })
