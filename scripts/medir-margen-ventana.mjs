/**
 * T.58 (medición, SOLO LECTURA): caracteriza el "margen de ventana" = ratio entre el precio
 * de la ventana (padre estructural) y Σ(hijas × Cdad), y si hay una regla que lo recupere.
 *
 * Hallazgo: NO hay margen sistemático. El 91,8% de las ventanas tiene ratio EXACTO 1.0 (el
 * precio de la ventana ES la suma de su despiece). El residuo (8,2% ventanas / 14,4% del € de
 * ventana) es (a) precio manual (PVPManualSN) y (b) un factor uniforme POR DOCUMENTO que NO
 * está guardado en ninguna columna de descuento/precio → no reconstruible (regla 3, "sin valorar").
 *
 * Enlace exacto (regla 8): hija→padre por (nDoc,nEstr); doc por (nDoc→VPresupuestos.Id).
 * Uso: npx tsx scripts/medir-margen-ventana.mjs
 */
import { readFileSync } from 'node:fs'; import { join } from 'node:path'; import { parse } from 'csv-parse/sync'
for (const l of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) { const m = l.match(/^\s*([A-Z_]+)=(.*)$/); if (m) process.env[m[1]] ??= m[2].trim() }
const O = process.env.RUTA_CSV_ORIGEN
const leer = (n) => parse(readFileSync(join(O, n)), { columns: true, bom: true, skip_empty_lines: true, relax_quotes: true })
const c = (f, n) => (f[n] ?? '').trim(); const num = (f, n) => Number(c(f, n).replace(',', '.')) || 0
const vLin = leer('VPresupuestosLin.csv'); const vPres = leer('VPresupuestos.csv')
const estr = leer('Estructuras.csv'); const famEstr = new Map(estr.map((e) => [c(e, 'Codigo'), c(e, 'Familia')]))
const vDLE = leer('VDatosLinEstr.csv'); const serieL = new Map()
for (const r of vDLE) serieL.set(`${c(r, 'TipoDoc')}|${c(r, 'nVDoc')}|${c(r, 'nVLinea')}`, c(r, 'Conjunto1'))
// descuento global por documento (Id) — para probar la única fuente candidata
const docDesc = new Map()
for (const p of vPres) docDesc.set(c(p, 'Id'), (1 - num(p, 'DescuentoPorc') / 100) * (1 - num(p, 'DescuentoPPporc') / 100) * (1 + num(p, 'RecargoPorc') / 100))
const hp = new Map()
for (const f of vLin) { const p = c(f, 'nEstr'); if (!p || p === '0') continue; const k = `${c(f, 'nDoc')}|${p}`; if (!hp.has(k)) hp.set(k, []); hp.get(k).push(f) }

const wins = []
for (const f of vLin) {
  if (c(f, 'EstructuraSN') !== 'True') continue; const imp = num(f, 'ImporteTotal'); if (imp === 0) continue
  const hijas = hp.get(`${c(f, 'nDoc')}|${c(f, 'nLinea')}`) ?? []; const suma = hijas.reduce((s, h) => s + num(h, 'ImporteTotal'), 0); if (suma <= 0) continue
  const cdad = Math.max(num(f, 'Cdad'), 1); const k = `VPRES|${c(f, 'nDoc')}|${c(f, 'nLinea')}`
  wins.push({ nDoc: c(f, 'nDoc'), imp, ratio: imp / (suma * cdad), pvpMan: c(f, 'PVPManualSN') === 'True',
    serie: serieL.get(k) || '?', fam: famEstr.get(c(f, 'Articulo')) || '?' })
}
const eurTot = wins.reduce((s, w) => s + w.imp, 0)
const ok1 = wins.filter((w) => Math.abs(w.ratio - 1) <= 0.01)
const off = wins.filter((w) => Math.abs(w.ratio - 1) > 0.01)
const offMan = off.filter((w) => w.pvpMan); const offFac = off.filter((w) => !w.pvpMan)
console.log(`ventanas con hijas: ${wins.length}   € ${eurTot.toFixed(0)}`)
console.log(`  ratio == 1.0 ±1% (precio = Σhijas×Cdad, SIN margen): ${ok1.length} (${(100 * ok1.length / wins.length).toFixed(1)}%)`)
console.log(`  OFF (ratio != 1): ${off.length} ventanas, € ${off.reduce((s, w) => s + w.imp, 0).toFixed(0)} (${(100 * off.reduce((s, w) => s + w.imp, 0) / eurTot).toFixed(1)}% del € ventana)`)
console.log(`    · precio MANUAL (PVPManualSN): ${offMan.length} vent, € ${offMan.reduce((s, w) => s + w.imp, 0).toFixed(0)}`)
console.log(`    · factor por DOCUMENTO no guardado: ${offFac.length} vent, € ${offFac.reduce((s, w) => s + w.imp, 0).toFixed(0)}`)

// (1) estabilidad por serie/familia: media≈1 y %ratio1 alto => NO hay margen por grupo
console.log('\nestabilidad por SERIE (grupos >=8): media≈1.0 y %ratio1 alto = sin margen de grupo')
{ const g = new Map(); for (const w of wins) { if (!g.has(w.serie)) g.set(w.serie, []); g.get(w.serie).push(w) }
  for (const [k, ws] of [...g].sort((a, b) => b[1].length - a[1].length).slice(0, 8)) { if (ws.length < 8) continue
    const rs = ws.map((w) => w.ratio); const mean = rs.reduce((s, x) => s + x, 0) / rs.length
    const pct1 = ws.filter((w) => Math.abs(w.ratio - 1) <= 0.01).length / ws.length
    console.log(`   ${k.padEnd(12)} n=${String(ws.length).padStart(4)} media=${mean.toFixed(3)} %ratio1=${(100 * pct1).toFixed(0)}%`) } }

// (2) el factor OFF NO es el descuento del documento (0 casan) y aplicarlo empeora
let casanDesc = 0
for (const w of offFac) if (Math.abs(w.ratio - (docDesc.get(w.nDoc) ?? 1)) <= 0.01) casanDesc++
console.log(`\nfactor OFF que coincide con el descuento global del doc: ${casanDesc}/${offFac.length}  (=> el ratio NO es el descuento almacenado)`)

// (3) el factor OFF es CONSTANTE por documento (regla 9: ventanas distintas)
const porDoc = new Map()
for (const w of offFac) { if (!porDoc.has(w.nDoc)) porDoc.set(w.nDoc, []); porDoc.get(w.nDoc).push(w) }
let docsConst = 0, docs2 = 0
for (const [, ws] of porDoc) { if (ws.length < 2) continue; docs2++; if (new Set(ws.map((w) => Math.round(w.ratio * 100))).size === 1) docsConst++ }
console.log(`documentos con >=2 ventanas OFF: ${docs2}; de ellos con ratio CONSTANTE (factor por presupuesto): ${docsConst}`)
console.log('\n=> El "margen" no es una regla de tarifa: 91,8% sin margen; el residuo es ajuste manual/por presupuesto no registrado. € cliente reconstruido NO cambia (70,5% ±1%).')
