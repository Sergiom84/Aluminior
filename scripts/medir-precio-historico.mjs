/**
 * T.55 (medición, SOLO LECTURA): la máquina de PRECIO contra el histórico.
 *
 * PIVOTE (T.54): el 86,5% de las líneas se valora por TARIFA, no por despiece. Este script
 * mide si el precio histórico se reconstruye desde las tablas de tarifa del propio export,
 * SIN necesidad de la tarifa 2026 (que el titular consigue por su lado). Enlace EXACTO por
 * (Articulo, Acabado, Tarifa) — regla 8, nunca por proximidad de medida.
 *
 * Hechos medidos que fundamentan el modelo (ver anexo T.55):
 *  - ImporteTotal = Precio × Metraje  (100% de las hijas; Metraje = cantidad facturable ya
 *    calculada por el sistema: UD=unidades, ML=metros, M2=área).
 *  - El PRECIO unitario de una hija de despiece ES el PVP de ArticulosPVP (tarifa 1) en el
 *    96,1% de los casos, exacto al céntimo, con DescuentoPorc=0.
 *  => máquina de precio = lookup PVP(Articulo, Acabado, Tarifa); swap 2026 = reemplazar PVP.
 *
 * Reconstruye a tres niveles: (1) hija de despiece, (2) VENTANA (padre estructural = Σ hijas),
 * (3) línea suelta (artículo directo). Nunca inventa un precio; sin PVP -> "sin valorar".
 *
 * Uso: npx tsx scripts/medir-precio-historico.mjs
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse/sync'

for (const l of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = l.match(/^\s*([A-Z_]+)=(.*)$/); if (m) process.env[m[1]] ??= m[2].trim()
}
const O = process.env.RUTA_CSV_ORIGEN
const leer = (n) => parse(readFileSync(join(O, n)), { columns: true, bom: true, skip_empty_lines: true, relax_quotes: true })
const c = (f, n) => (f[n] ?? '').trim()
const num = (f, n) => Number(c(f, n).replace(',', '.')) || 0

const vLin = leer('VPresupuestosLin.csv')
const pvpT = leer('ArticulosPVP.csv')
const TAR = '1' // única tarifa en VPresupuestos (verificado: todos los docs Tarifa=1)

// índice PVP: (Articulo,Acabado)->PVP y (Articulo)->{acabado->PVP} para diagnóstico
const pvp = new Map(), pvpArtAca = new Map()
for (const r of pvpT) {
  if (c(r, 'Tarifa') !== TAR) continue
  const a = c(r, 'Articulo'), ac = c(r, 'Acabado'), v = num(r, 'PVP')
  pvp.set(`${a}|${ac}`, v)
  if (!pvpArtAca.has(a)) pvpArtAca.set(a, new Map())
  pvpArtAca.get(a).set(ac, v)
}
// lookup: acabado exacto -> UNI -> acabado único del artículo
function pvpLookup(art, aca) {
  if (pvp.has(`${art}|${aca}`)) return pvp.get(`${art}|${aca}`)
  if (pvp.has(`${art}|UNI`)) return pvp.get(`${art}|UNI`)
  const m = pvpArtAca.get(art); if (m && m.size === 1) return [...m.values()][0]
  return null
}
// ¿algún acabado de ese artículo casa con el precio stored? (diagnóstico acabado-dependiente)
function algunAcabadoCasa(art, precio) {
  const m = pvpArtAca.get(art); if (!m) return false
  for (const v of m.values()) if (v > 0 && Math.abs(precio - v) / v <= 0.01) return true
  return false
}

const esEstr = (f) => c(f, 'EstructuraSN') === 'True'
const esHija = (f) => !esEstr(f) && c(f, 'nEstr') && c(f, 'nEstr') !== '0'
const esSuelta = (f) => !esEstr(f) && !(c(f, 'nEstr') && c(f, 'nEstr') !== '0')

const TOLS = [0, 0.01, 0.02, 0.05] // exacto, ±1%, ±2%, ±5%
const dentro = (a, b, tol) => (b === 0 ? a === 0 : Math.abs(a - b) / Math.abs(b) <= tol)

// ══ (1) NIVEL HIJA: unit price == PVP ════════════════════════════════════════
console.log('════════ (1) HIJAS DE DESPIECE — precio unitario vs PVP (tarifa 1) ════════')
{
  let n = 0, eur = 0, conPVP = 0, sinPVP = 0, recAcaDep = 0
  const okLin = TOLS.map(() => 0), okEur = TOLS.map(() => 0)
  for (const f of vLin) {
    if (!esHija(f)) continue
    const imp = num(f, 'ImporteTotal'); if (imp === 0) continue
    n++; eur += imp
    const precio = num(f, 'Precio')
    const p = pvpLookup(c(f, 'Articulo'), c(f, 'Acabado'))
    if (p === null) { sinPVP++; continue }
    conPVP++
    TOLS.forEach((tol, i) => { if (dentro(precio, p, tol)) { okLin[i]++; okEur[i] += imp } })
    if (!dentro(precio, p, 0.01) && algunAcabadoCasa(c(f, 'Articulo'), precio)) recAcaDep++
  }
  console.log(`  hijas con importe: ${n}  (€ ${eur.toFixed(0)})`)
  console.log(`  con PVP en tarifa 1: ${conPVP} (${(100 * conPVP / n).toFixed(1)}%)   SIN PVP (sin valorar): ${sinPVP}`)
  TOLS.forEach((tol, i) => console.log(`   precio≈PVP ±${(tol * 100).toFixed(0)}%: ${okLin[i]} líneas (${(100 * okLin[i] / n).toFixed(1)}%)   € ${okEur[i].toFixed(0)} (${(100 * okEur[i] / eur).toFixed(1)}%)`))
  console.log(`  de los fallos (>±1%): ${recAcaDep} casarían con OTRO acabado del artículo (acabado-dependiente, recuperable con lookup exacto de acabado)`)
}

// ══ (2) NIVEL VENTANA: padre estructural = Σ hijas reconstruidas ══════════════
console.log('\n════════ (2) VENTANAS (padre estructural = Σ hijas, reconstruido con PVP×Metraje) ════════')
{
  const hijasPorPadre = new Map()
  for (const f of vLin) {
    const p = c(f, 'nEstr'); if (!p || p === '0') continue
    const k = `${c(f, 'nDoc')}|${p}`
    if (!hijasPorPadre.has(k)) hijasPorPadre.set(k, [])
    hijasPorPadre.get(k).push(f)
  }
  let n = 0, eur = 0, sinValorar = 0
  const okLin = TOLS.map(() => 0), okEur = TOLS.map(() => 0)
  for (const f of vLin) {
    if (!esEstr(f)) continue
    const imp = num(f, 'ImporteTotal'); if (imp === 0) continue
    n++; eur += imp
    const hijas = hijasPorPadre.get(`${c(f, 'nDoc')}|${c(f, 'nLinea')}`) ?? []
    let recon = 0, falta = false
    for (const h of hijas) {
      const met = num(h, 'Metraje'); const impH = num(h, 'ImporteTotal')
      if (impH === 0) continue // aporta 0 € (nota/componente sin metraje); no afecta al precio
      const p = pvpLookup(c(h, 'Articulo'), c(h, 'Acabado'))
      if (p === null) { falta = true; break } // regla 3: una hija con metraje pero sin precio -> ventana sin valorar
      recon += p * met
    }
    if (falta || !hijas.length) { sinValorar++; continue }
    recon *= Math.max(num(f, 'Cdad'), 1) // ImporteTotal padre = Σhijas(por unidad) × Cdad
    TOLS.forEach((tol, i) => { if (dentro(recon, imp, tol)) { okLin[i]++; okEur[i] += imp } })
  }
  console.log(`  ventanas (estructurales con importe): ${n}  (€ ${eur.toFixed(0)})`)
  console.log(`  sin valorar (alguna hija sin PVP o sin hijas): ${sinValorar}`)
  TOLS.forEach((tol, i) => console.log(`   Σhijas≈padre ±${(tol * 100).toFixed(0)}%: ${okLin[i]} ventanas (${(100 * okLin[i] / n).toFixed(1)}%)   € ${okEur[i].toFixed(0)} (${(100 * okEur[i] / eur).toFixed(1)}%)`))
}

// ══ (3) NIVEL SUELTA: artículo directo (PVP) vs manual (VARIOS/GRUPO) ═════════
console.log('\n════════ (3) LÍNEAS SUELTAS (artículo directo) ════════')
{
  let n = 0, eur = 0, conPVP = 0, eurConPVP = 0, manual = 0, eurManual = 0
  const okEur = TOLS.map(() => 0)
  const sinArt = new Map()
  for (const f of vLin) {
    if (!esSuelta(f)) continue
    const imp = num(f, 'ImporteTotal'); if (imp === 0) continue
    n++; eur += imp
    const art = c(f, 'Articulo'), precio = num(f, 'Precio')
    const p = pvpLookup(art, c(f, 'Acabado'))
    if (p === null) { manual++; eurManual += imp; sinArt.set(art, (sinArt.get(art) ?? 0) + imp); continue }
    conPVP++; eurConPVP += imp
    TOLS.forEach((tol, i) => { if (dentro(precio, p, tol)) okEur[i] += imp })
  }
  console.log(`  sueltas con importe: ${n}  (€ ${eur.toFixed(0)})`)
  console.log(`  con PVP: ${conPVP} (€ ${eurConPVP.toFixed(0)}, ${(100 * eurConPVP / eur).toFixed(1)}%)`)
  console.log(`  sin PVP / manuales (VARIOS, GRUPO, ...): ${manual} (€ ${eurManual.toFixed(0)}, ${(100 * eurManual / eur).toFixed(1)}%)`)
  TOLS.forEach((tol, i) => console.log(`   precio≈PVP ±${(tol * 100).toFixed(0)}%: € ${okEur[i].toFixed(0)} (${(100 * okEur[i] / eur).toFixed(1)}% del € suelto)`))
  console.log('  top artículos sin PVP (€):', [...sinArt].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([a, e]) => `${a}:${e.toFixed(0)}`).join('  '))
}

// ══ (4) CLIENTE: € reconstruido sobre el total facturable (ventanas + sueltas) ═
console.log('\n════════ (4) COBERTURA € CLIENTE (ventanas + sueltas; sin doble conteo de hijas) ════════')
{
  const hijasPorPadre = new Map()
  for (const f of vLin) {
    const p = c(f, 'nEstr'); if (!p || p === '0') continue
    const k = `${c(f, 'nDoc')}|${p}`
    if (!hijasPorPadre.has(k)) hijasPorPadre.set(k, [])
    hijasPorPadre.get(k).push(f)
  }
  let eurTot = 0
  const okEur = TOLS.map(() => 0)
  let eurSinValorar = 0
  for (const f of vLin) {
    const imp = num(f, 'ImporteTotal'); if (imp === 0) continue
    if (c(f, 'GrupoSN') === 'True') continue // cabecera de subtotal: doble conteo de sus miembros
    let recon = null
    if (esEstr(f)) {
      const hijas = hijasPorPadre.get(`${c(f, 'nDoc')}|${c(f, 'nLinea')}`) ?? []
      recon = 0; let falta = !hijas.length
      for (const h of hijas) { const met = num(h, 'Metraje'); if (num(h, 'ImporteTotal') === 0) continue; const p = pvpLookup(c(h, 'Articulo'), c(h, 'Acabado')); if (p === null) { falta = true; break } recon += p * met }
      if (falta) recon = null; else recon *= Math.max(num(f, 'Cdad'), 1) // padre = Σhijas × Cdad
    } else if (esSuelta(f)) {
      const p = pvpLookup(c(f, 'Articulo'), c(f, 'Acabado'))
      recon = p === null ? null : p * num(f, 'Metraje')
    } else continue // hijas no cuentan al total cliente (son el desglose del padre)
    eurTot += imp
    if (recon === null) { eurSinValorar += imp; continue }
    TOLS.forEach((tol, i) => { if (dentro(recon, imp, tol)) okEur[i] += imp })
  }
  console.log(`  € total cliente (ventanas+sueltas): ${eurTot.toFixed(0)}`)
  console.log(`  € sin valorar (falta algún PVP / manual): ${eurSinValorar.toFixed(0)} (${(100 * eurSinValorar / eurTot).toFixed(1)}%)`)
  TOLS.forEach((tol, i) => console.log(`   € reconstruido ±${(tol * 100).toFixed(0)}%: ${okEur[i].toFixed(0)} (${(100 * okEur[i] / eurTot).toFixed(1)}%)`))
}
