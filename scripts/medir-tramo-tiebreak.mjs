/**
 * T.49 (medición): error de CONJUNTO del herraje del oscilobatiente.
 *
 * Reproduce EXACTO el predictor v5 (medir-seleccion-v5.mjs) y, sobre sus
 * FP/FN, clasifica los artículos de herraje de oscilobatiente (GM53xx,
 * brazos de compás, tirantes, cremonas, cerraderos, pletinas) en:
 *   - SWAP de tramo: hay un hermano de la MISMA familia (conjunto|comp|opción)
 *     en el otro conjunto de la misma línea → conjunto neto correcto, tramo mal
 *     (residuo CANTIDAD, ya descrito en S.9.1).
 *   - FP puro: v5 lo mete, el oráculo no, y NINGÚN hermano de familia lo
 *     compensa → artículo sobrante real.
 *   - FN puro: el oráculo lo trae, v5 no, sin hermano → artículo que falta.
 * Para cada clase, imprime la condición/gate de la fila ConjuntosAsoc
 * ofensora (nOpcion, ArticuloAsoc, FormulaOpcion, SoloUnaSN, GrupoAsoc,
 * TipoMedCV, TablaHerrajeInsertar, ManoID, presencia en ConfigSeriesAsoc).
 *
 * Solo lectura. Uso: npx tsx scripts/medir-conjunto-oscilobatiente.mjs
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse/sync'
import { evaluar } from '../packages/core/src/despiece/formula.ts'

for (const l of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = l.match(/^\s*([A-Z_]+)=(.*)$/); if (m) process.env[m[1]] ??= m[2].trim()
}
const ORIGEN = process.env.RUTA_CSV_ORIGEN
const leer = (n) => parse(readFileSync(join(ORIGEN, n)), {
  columns: true, bom: true, skip_empty_lines: true, relax_quotes: true,
})
const col = (f, n) => (f[n] ?? '').trim()
const num = (f, n) => Number(col(f, n).replace(',', '.')) || 0

const conjuntosAsoc = leer('ConjuntosAsoc.csv')
const configSeriesAsoc = leer('ConfigSeriesAsoc.csv')
const opcionesDoc = leer('VOpcionesHerraje.csv')
const articulos = leer('Articulos.csv')
const estArt = leer('EstructurasArticulos.csv')
const estDis = leer('EstructurasDiseño.csv')
const estructurasDa = leer('EstructurasDA.csv')
const medidasDa = leer('VMedidasDA.csv')
const descArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Descripcion')]))
const famPorArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Familia')]))

const DOCS = [
  { tipo: 'VPRES', lin: 'VPresupuestosLin.csv' },
  { tipo: 'VALB', lin: 'VAlbaranesLin.csv' },
  { tipo: 'VFAC', lin: 'VFacturasLin.csv' },
]

const asocPorConjunto = new Map()
const poblacionAsoc = new Set()
for (const f of conjuntosAsoc) {
  const cj = col(f, 'Conjunto'), art = col(f, 'Articulo')
  if (!cj || !art || art === '0') continue
  poblacionAsoc.add(art)
  if (!asocPorConjunto.has(cj)) asocPorConjunto.set(cj, [])
  asocPorConjunto.get(cj).push(f)
}

// familias de tramos: (conjunto,comp,nOpcion) con >=2 artículos distintos
const familiaDe = new Map() // articulo -> Set(clave familia)
const familiaArts = new Map() // clave -> Set(articulos)
{
  const grupos = new Map()
  for (const f of conjuntosAsoc) {
    const art = col(f, 'Articulo'); if (!art || art === '0') continue
    const clave = `${col(f, 'Conjunto')}|${col(f, 'ComponenteAsoc')}|${col(f, 'nOpcion')}`
    if (!grupos.has(clave)) grupos.set(clave, new Set())
    grupos.get(clave).add(art)
  }
  for (const [clave, arts] of grupos) {
    if (arts.size < 2) continue
    familiaArts.set(clave, arts)
    for (const a of arts) {
      if (!familiaDe.has(a)) familiaDe.set(a, new Set())
      familiaDe.get(a).add(clave)
    }
  }
}

// familias con rangos SOLAPADOS (donde v5 emite fantasmas) — clave conjunto|comp|nOpcion
const familiaSolapada = new Set()
{
  const porClave = new Map()
  for (const f of conjuntosAsoc) {
    const art = col(f, 'Articulo'); if (!art || art === '0') continue
    if (num(f, 'MedidaMax') <= 0) continue
    const clave = `${col(f, 'Conjunto')}|${col(f, 'ComponenteAsoc')}|${col(f, 'nOpcion')}`
    if (!porClave.has(clave)) porClave.set(clave, [])
    porClave.get(clave).push([num(f, 'MedidaMin'), num(f, 'MedidaMax'), art])
  }
  for (const [clave, rangos] of porClave) {
    const arts = new Set(rangos.map((r) => r[2])); if (arts.size < 2) continue
    // sólo escaleras de tramo PURAS (cada artículo una sola fila): excluye
    // los cerraderos ACUMULATIVOS (S.1) que repiten artículo por tramo.
    if (arts.size !== rangos.length) continue
    let solapa = false
    for (let i = 0; i < rangos.length; i++) for (let j = i + 1; j < rangos.length; j++) {
      if (rangos[i][2] === rangos[j][2]) continue
      if (rangos[i][0] <= rangos[j][1] && rangos[j][0] <= rangos[i][1]) solapa = true
    }
    if (solapa) familiaSolapada.add(clave)
  }
}
// MODO_TIEBREAK: 'v5' (emite todos), 'ancho' (gana rango más ancho), 'estrecho'
const MODO = process.env.MODO_TIEBREAK || 'ancho'

// ConfigSeriesAsoc: qué artículos existen por (conjunto) con TipoHoja
const configSerieArts = new Set(configSeriesAsoc.map((f) => col(f, 'Articulo')))

// --- plantilla ranuras ---
const ranurasPlantilla = new Map()
for (const f of estArt) {
  if (col(f, 'TipoDoc')) continue
  const comp = col(f, 'DisComponente')
  if (!comp || comp === '0') continue
  const e = col(f, 'Estructura')
  if (!ranurasPlantilla.has(e)) ranurasPlantilla.set(e, new Map())
  const m = ranurasPlantilla.get(e)
  if (!m.has(comp)) m.set(comp, [])
  m.get(comp).push({
    formula: col(f, 'FormulaLargoCorte') || col(f, 'FormulaLargo'),
    mano: col(f, 'DisManoID'),
  })
}

const cotasDefecto = new Map()
const simboloPorId = new Map()
for (const f of estDis) {
  if (col(f, 'TipoDoc')) continue
  const e = col(f, 'Estructura'); const simbolo = col(f, 'Simbolo')
  if (!simbolo) continue
  if (!cotasDefecto.has(e)) cotasDefecto.set(e, {})
  cotasDefecto.get(e)[simbolo] = num(f, 'Cota')
  const id = col(f, 'Id'); if (id) simboloPorId.set(`${e}|${id}`, simbolo)
}
const cotasInstancia = new Map()
for (const f of estDis) {
  const t = col(f, 'TipoDoc'); if (!t) continue
  const e = col(f, 'Estructura')
  const simbolo = col(f, 'Simbolo') || simboloPorId.get(`${e}|${col(f, 'Id')}`) || ''
  if (!simbolo) continue
  const k = `${t}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!cotasInstancia.has(k)) cotasInstancia.set(k, {})
  cotasInstancia.get(k)[simbolo] = num(f, 'Cota')
}
const simboloDa = new Map(estructurasDa.map((f) => [
  `${col(f, 'Estructura')}|${col(f, 'nDA')}`, col(f, 'SimboloDA')]))
for (const f of medidasDa) {
  const simbolo = simboloDa.get(`${col(f, 'Estructura')}|${col(f, 'nDA')}`)
  if (!simbolo) continue
  const k = `${col(f, 'TipoDoc')}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!cotasInstancia.has(k)) cotasInstancia.set(k, {})
  cotasInstancia.get(k)[simbolo] = num(f, 'Medida')
}

const opcionesPorLinea = new Map()
for (const f of opcionesDoc) {
  const k = `${col(f, 'TipoDoc')}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!opcionesPorLinea.has(k)) opcionesPorLinea.set(k, new Map())
  const porConj = opcionesPorLinea.get(k)
  const cj = col(f, 'Conjunto')
  if (!porConj.has(cj)) porConj.set(cj, new Set())
  if (col(f, 'SelecSN') === 'True') porConj.get(cj).add(col(f, 'nOpcion'))
}
const ranurasInstancia = new Map()
const manosInstancia = new Map()
const rasgosInstancia = new Map()
const hojasPorLinea = new Map()
for (const f of estArt) {
  const t = col(f, 'TipoDoc'); if (!t) continue
  const k = `${t}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  const dis = col(f, 'DisComponente')
  if (dis && dis !== '0') {
    if (!ranurasInstancia.has(k)) ranurasInstancia.set(k, new Map())
    const m = ranurasInstancia.get(k)
    m.set(dis, (m.get(dis) ?? 0) + (num(f, 'Cantidad') || 1))
    if (!manosInstancia.has(k)) manosInstancia.set(k, new Map())
    const mm = manosInstancia.get(k)
    if (!mm.has(dis)) mm.set(dis, [])
    mm.get(dis).push(col(f, 'DisManoID'))
  }
  const fn = col(f, 'Funcion'), gen = col(f, 'Articulo')
  const cant = num(f, 'Cantidad') || 1
  if (!rasgosInstancia.has(k)) rasgosInstancia.set(k, new Map())
  const rr = rasgosInstancia.get(k)
  if (fn) rr.set(`fn:${fn}`, (rr.get(`fn:${fn}`) ?? 0) + cant)
  if (gen && gen !== '0') rr.set(`gen:${gen}`, (rr.get(`gen:${gen}`) ?? 0) + cant)
  if (gen === '11' || fn === 'TH') rr.set('trvPeq', (rr.get('trvPeq') ?? 0) + cant)
  const idHoja = num(f, 'DisIdHoja')
  if (idHoja > 0) {
    if (!hojasPorLinea.has(k)) hojasPorLinea.set(k, new Set())
    hojasPorLinea.get(k).add(idHoja)
  }
}

const FUNCIONES_PERFIL = new Set(['MV', 'MH', 'HV', 'HH', 'TM', 'TH', 'TV'])
const lineas = []
for (const doc of DOCS) {
  const vLin = leer(doc.lin)
  const hijasPorPadre = new Map()
  for (const f of vLin) {
    const p = col(f, 'nEstr'); if (!p || p === '0') continue
    if (!hijasPorPadre.has(p)) hijasPorPadre.set(p, [])
    hijasPorPadre.get(p).push(f)
  }
  for (const p of vLin) {
    if (col(p, 'EstructuraSN') !== 'True') continue
    const k = `${doc.tipo}|${col(p, 'nDoc')}|${col(p, 'nLinea')}`
    const opciones = opcionesPorLinea.get(k)
    const ranuras = ranurasInstancia.get(k)
    if (!opciones || !ranuras) continue
    const hijas = hijasPorPadre.get(col(p, 'nLinea')) ?? []
    const reales = new Map()
    const perfilesLinea = new Set()
    for (const h of hijas) {
      const art = col(h, 'Articulo'), fn = col(h, 'Funcion')
      if (!art || art === '0') continue
      if (FUNCIONES_PERFIL.has(fn)) { perfilesLinea.add(art); continue }
      const fam = famPorArt.get(art) ?? ''
      if (fam === '050' || fam === '051') continue
      if (!poblacionAsoc.has(art)) continue
      reales.set(art, (reales.get(art) ?? 0) + (num(h, 'Cdad') || 0))
    }
    if (!reales.size) continue
    const estructura = col(p, 'Articulo')
    const contexto = {
      L: num(p, 'Largo'), A: num(p, 'Ancho'),
      ...(cotasDefecto.get(estructura) ?? {}),
      ...(cotasInstancia.get(k) ?? {}),
    }
    const medidasRanura = new Map()
    for (const [comp, apariciones] of ranurasPlantilla.get(estructura) ?? []) {
      medidasRanura.set(comp, apariciones.map(({ formula, mano }) => {
        let medida = null
        if (formula) { try { medida = evaluar(formula, contexto) } catch { /**/ } }
        return { medida, mano }
      }))
    }
    lineas.push({
      k, opciones, ranuras, reales, medidasRanura, perfilesLinea, estructura,
      manos: manosInstancia.get(k) ?? new Map(),
      rasgosExtra: rasgosInstancia.get(k) ?? new Map(),
      nHojas: hojasPorLinea.get(k)?.size ?? 0,
    })
  }
}

const ESPECIALES = new Set(['A', 'L', '!', '59R'])
function filasOpcionOk(linea) {
  const activas = []
  for (const [cj, marcadas] of linea.opciones) {
    for (const f of asocPorConjunto.get(cj) ?? []) {
      const nOp = col(f, 'nOpcion')
      if (nOp && nOp !== '0' && !marcadas.has(nOp)) continue
      const artAsoc = col(f, 'ArticuloAsoc')
      if (artAsoc && artAsoc !== '0' && !linea.perfilesLinea.has(artAsoc)) continue
      activas.push(f)
    }
  }
  return activas
}
function rasgosDe(linea) {
  const r = new Map([['const1', 1], ['nHojas', linea.nHojas]])
  for (const [dis, n] of linea.ranuras) r.set(`dis:${dis}`, n)
  for (const [nombre, n] of linea.rasgosExtra) r.set(nombre, n)
  return r
}

// aprender multiplicadores '!' (idéntico a v5)
const obsCategoria = new Map()
for (const linea of lineas) {
  const porArt = new Map()
  for (const f of filasOpcionOk(linea)) {
    const comp = col(f, 'ComponenteAsoc'); const art = col(f, 'Articulo')
    if (comp === '!') {
      const acc = porArt.get(art) ?? { bang: 0, otras: 0, textos: new Set() }
      acc.bang += num(f, 'Cantidad'); acc.textos.add(col(f, 'AsociadoA')); porArt.set(art, acc)
    } else if (!comp || linea.ranuras.has(comp) || ESPECIALES.has(comp)) {
      const acc = porArt.get(art) ?? { bang: 0, otras: 0, textos: new Set() }
      acc.otras++; porArt.set(art, acc)
    }
  }
  for (const [art, acc] of porArt) {
    if (acc.bang <= 0 || acc.otras > 0 || acc.textos.size !== 1) continue
    const texto = [...acc.textos][0]
    if (!obsCategoria.has(texto)) obsCategoria.set(texto, [])
    obsCategoria.get(texto).push({ base: acc.bang, real: linea.reales.get(art) ?? 0, rasgos: rasgosDe(linea) })
  }
}
const multiplicador = new Map()
for (const [texto, obs] of obsCategoria) {
  if (obs.length < 5) continue
  const nombres = new Set()
  for (const o of obs) for (const n of o.rasgos.keys()) nombres.add(n)
  let mejor = null, tasa = 0
  for (const nombre of nombres) {
    const ratios = new Map()
    for (const o of obs) {
      const v = o.rasgos.get(nombre) ?? 0
      if (o.base * v <= 0) continue
      const r = Math.round((o.real / (o.base * v)) * 100) / 100
      ratios.set(r, (ratios.get(r) ?? 0) + 1)
    }
    if (!ratios.size) continue
    const [k] = [...ratios.entries()].sort((a, b) => b[1] - a[1])[0]
    if (k <= 0) continue
    let ok = 0
    for (const o of obs) {
      const v = o.rasgos.get(nombre) ?? 0
      if (Math.abs(o.base * v * k - o.real) < 0.01) ok++
    }
    const tasaK = ok / obs.length - (k === 1 ? 0 : 0.001)
    if (tasaK > tasa) { tasa = tasaK; mejor = { rasgo: nombre, k } }
  }
  if (mejor && tasa >= 0.9) multiplicador.set(texto, mejor)
}

// --- ¿es herraje de oscilobatiente? ---
function esOscilo(art) {
  const d = (descArt.get(art) ?? '').toUpperCase()
  if (/^GM53/.test(art)) return true
  return /COMPAS|CREMONA|CREM\.|TIRANTE|PLETINA|CERRADERO|BRAZO|O\/B|OSCILO|BASC|BASK|PUNTO CIERRE|TRASM/.test(d)
}

// --- predicción + clasificación de FP/FN de oscilobatiente ---
const clases = { swapFP: new Map(), swapFN: new Map(), fpPuro: new Map(), fnPuro: new Map() }
const gatesFP = new Map() // razón -> count
const causasFN = new Map()
const noEnConjuntos = new Map()
const lineaVeredicto = { exacta: 0, soloTramo: 0, gapGenuino: 0 }
let lineasSoloOverlap = 0
// conjuntos que ofrece cada art (cualquier conjunto)
const asocPorConjunto2Art = new Set()
for (const [, filas] of asocPorConjunto) for (const f of filas) asocPorConjunto2Art.add(col(f, 'Articulo'))
let lineasConErrorConjunto = 0
const ejemplosFP = [], ejemplosFN = []

// helper: filas ConjuntosAsoc de un art que están en algún conjunto-opción de la línea
function filasDeArtEnLinea(linea, art) {
  const out = []
  for (const [cj] of linea.opciones) {
    for (const f of asocPorConjunto.get(cj) ?? []) {
      if (col(f, 'Articulo') === art) out.push({ cj, f })
    }
  }
  return out
}

for (const linea of lineas) {
  const predicho = new Map()
  const rasgos = rasgosDe(linea)
  const tramoEmitido = new Map() // famKey -> [{art,min,max}]  (para post-filtro)
  for (const f of filasOpcionOk(linea)) {
    const comp = col(f, 'ComponenteAsoc'); const art = col(f, 'Articulo')
    let aporte = null
    if (comp === 'A' || comp === 'L') {
      aporte = num(f, 'Cantidad') * Math.max(num(f, 'UnidadesMin'), 1)
    } else if (comp === '!') {
      const regla = multiplicador.get(col(f, 'AsociadoA'))
      if (!regla) continue
      aporte = num(f, 'Cantidad') * (rasgos.get(regla.rasgo) ?? 0) * regla.k
    } else if (comp === '59R') { continue }
    else if (comp) {
      if (!linea.ranuras.has(comp)) continue
      const mano = col(f, 'ManoID')
      const manosReales = linea.manos.get(comp) ?? []
      const nAparicionesMano = mano ? manosReales.filter((m) => m === mano).length : Math.max(manosReales.length, 1)
      if (!nAparicionesMano) continue
      const medidas = linea.medidasRanura.get(comp) ?? []
      const min = num(f, 'MedidaMin'), max = num(f, 'MedidaMax')
      let apariciones
      if (max > 0) {
        const conMedida = medidas.filter((ap) => ap.medida !== null)
        if (!conMedida.length) { continue }
        const enRango = conMedida.filter((ap) => ap.medida >= min && ap.medida <= max).length
        if (!enRango) continue
        apariciones = Math.min(enRango, nAparicionesMano)
      } else { apariciones = nAparicionesMano }
      aporte = num(f, 'Cantidad') * apariciones
      if (max > 0) {
        const famKey = `${col(f, 'Conjunto')}|${comp}|${col(f, 'nOpcion')}`
        if (familiaSolapada.has(famKey)) {
          if (!tramoEmitido.has(famKey)) tramoEmitido.set(famKey, [])
          tramoEmitido.get(famKey).push({ art, min, max })
        }
      }
    } else { aporte = num(f, 'Cantidad') }
    predicho.set(art, (predicho.get(art) ?? 0) + aporte)
  }
  // POST-FILTRO tramo fantasma: en una escalera de tramo pura, si v5 emite un
  // tramo B cuyo rango está ESTRICTAMENTE contenido en el de otro tramo A
  // emitido de la misma familia, B es el fantasma del solape → se descarta.
  // (oracle-blind: sólo geometría de rangos.)
  if (MODO !== 'v5') {
    for (const [famKey, arts] of tramoEmitido) {
      const comp = famKey.split('|')[1]
      // guarda por multiplicidad: sólo cuando la ranura tiene UNA ocurrencia
      // (una hoja) el contenedor gana limpio (18/18). Con varias hojas el
      // tramo contenido puede ser legítimo (51 pares ambos-reales).
      const nOcc = linea.ranuras.get(comp) ?? 0
      if (MODO === 'ancho1' && nOcc !== 1) continue
      for (const b of arts) {
        const contenido = arts.some((a) => a.art !== b.art
          && a.min <= b.min && b.max <= a.max && (a.min < b.min || b.max < a.max))
        if (contenido) predicho.delete(b.art)
      }
    }
  }
  for (const [art, cdad] of [...predicho]) if (cdad <= 0) predicho.delete(art)

  // FP y FN de esta línea
  const fpArts = [...predicho.keys()].filter((a) => !linea.reales.has(a))
  const fnArts = [...linea.reales.keys()].filter((a) => !predicho.has(a))
  const fpSet = new Set(fpArts), fnSet = new Set(fnArts)

  // ¿hermano de familia en el otro conjunto?
  const tieneHermano = (art, otroSet) => {
    const fams = familiaDe.get(art); if (!fams) return false
    for (const other of otroSet) {
      const ofams = familiaDe.get(other); if (!ofams) continue
      for (const fam of fams) if (ofams.has(fam)) return true
    }
    return false
  }

  // ¿hay un hermano de familia entre los TP (predicho ∩ real)?  => overlap de rangos
  const tpSet = new Set([...predicho.keys()].filter((a) => linea.reales.has(a)))
  // ¿el ÚNICO error de la línea es overlap-FP (fantasma)? entonces quitar el
  // fantasma la vuelve exacta, sin FN ni swap ni FP puro.
  {
    const soloOverlap = fnArts.length === 0 && fpArts.length > 0 && fpArts.every((a) =>
      esOscilo(a) && !tieneHermano(a, fnSet) && tieneHermano(a, tpSet))
    if (soloOverlap) lineasSoloOverlap++
  }
  let errorConjuntoEnLinea = false
  for (const art of fpArts) {
    if (!esOscilo(art)) continue
    if (tieneHermano(art, fnSet)) {
      clases.swapFP.set(art, (clases.swapFP.get(art) ?? 0) + 1)
    } else if (tieneHermano(art, tpSet)) {
      clases.overlapFP = clases.overlapFP ?? new Map()
      clases.overlapFP.set(art, (clases.overlapFP.get(art) ?? 0) + 1)
      errorConjuntoEnLinea = true
    } else {
      clases.fpPuro.set(art, (clases.fpPuro.get(art) ?? 0) + 1)
      errorConjuntoEnLinea = true
      // gate: examinar filas del art
      const filas = filasDeArtEnLinea(linea, art)
      for (const { f } of filas) {
        const razones = []
        if (col(f, 'FormulaOpcion')) razones.push('FormulaOpcion')
        if (col(f, 'SoloUnaSN') === 'True') razones.push('SoloUnaSN')
        if (col(f, 'GrupoAsoc') && col(f, 'GrupoAsoc') !== '0') razones.push('GrupoAsoc')
        if (col(f, 'AsocAGrupoAsoc') && col(f, 'AsocAGrupoAsoc') !== '0') razones.push('AsocAGrupoAsoc')
        if (col(f, 'TablaHerrajeInsertar') && col(f, 'TablaHerrajeInsertar') !== '0') razones.push('TablaHerraje')
        if (col(f, 'FormulaTablaHerrAlto') || col(f, 'FormulaTablaHerrAncho')) razones.push('FormulaTablaHerr')
        if (col(f, 'TipoMedCV') && col(f, 'TipoMedCV') !== '0') razones.push(`TipoMedCV=${col(f, 'TipoMedCV')}`)
        if (col(f, 'ManoID')) razones.push(`ManoID=${col(f, 'ManoID')}`)
        if (col(f, 'AltoALMin') || col(f, 'AltoALMax')) razones.push('AltoAL')
        if (col(f, 'PlHojasX') || col(f, 'PlHojasY')) razones.push('PlHojas')
        const key = razones.length ? razones.join('+') : 'sin-gate-extra'
        gatesFP.set(key, (gatesFP.get(key) ?? 0) + 1)
      }
      if (ejemplosFP.length < 14) {
        const filasStr = filas.map(({ cj, f }) => `${cj}|comp=${col(f, 'ComponenteAsoc')}|op=${col(f, 'nOpcion') || '·'}|rango=${col(f, 'MedidaMin')}-${col(f, 'MedidaMax')}|artAsoc=${col(f, 'ArticuloAsoc') || '·'}|SoloUna=${col(f, 'SoloUnaSN')}|Grupo=${col(f, 'GrupoAsoc')}|FOpc=${col(f, 'FormulaOpcion') ? 'SÍ' : '·'}|Tabla=${col(f, 'TablaHerrajeInsertar') || '·'}`).join(' ; ')
        ejemplosFP.push(`  [FPpuro] ${art} (${(descArt.get(art) ?? '').slice(0, 28)}) L=${linea.k}\n      ${filasStr}`)
      }
    }
  }
  for (const art of fnArts) {
    if (!esOscilo(art)) continue
    if (tieneHermano(art, fpSet)) {
      clases.swapFN.set(art, (clases.swapFN.get(art) ?? 0) + 1)
    } else {
      clases.fnPuro.set(art, (clases.fnPuro.get(art) ?? 0) + 1)
      errorConjuntoEnLinea = true
      // causa: ¿estaba en alguna fila de opción de la línea?
      const filas = filasDeArtEnLinea(linea, art)
      let causa
      if (!filas.length) {
        // ¿existe en ConjuntosAsoc de algún conjunto NO marcado, o via ConfigSeriesAsoc?
        const enAlgunConjunto = asocPorConjunto2Art.has(art)
        causa = configSerieArts.has(art)
          ? 'solo-en-ConfigSeriesAsoc(TipoHoja)'
          : (enAlgunConjunto ? 'en-conjunto-no-ofertado-a-la-linea' : 'art-fuera-de-todo-ConjuntosAsoc')
        noEnConjuntos.set(art, (noEnConjuntos.get(art) ?? 0) + 1)
      } else {
        // estaba, pero se filtró: ver por qué
        const motivos = new Set()
        for (const { f } of filas) {
          const nOp = col(f, 'nOpcion')
          const marcadas = linea.opciones.get(col(f, 'Conjunto')) ?? new Set()
          if (nOp && nOp !== '0' && !marcadas.has(nOp)) { motivos.add('opcion-no-marcada'); continue }
          const artAsoc = col(f, 'ArticuloAsoc')
          if (artAsoc && artAsoc !== '0' && !linea.perfilesLinea.has(artAsoc)) { motivos.add('ArticuloAsoc-perfil-ausente'); continue }
          const comp = col(f, 'ComponenteAsoc')
          if (comp === '!') {
            const regla = multiplicador.get(col(f, 'AsociadoA'))
            motivos.add(regla ? 'bang-multiplicador=0' : 'bang-categoria-no-aprendida'); continue
          }
          if (comp && !ESPECIALES.has(comp) && !linea.ranuras.has(comp)) { motivos.add('ranura-ausente'); continue }
          const max = num(f, 'MedidaMax')
          if (max > 0) { motivos.add('fuera-de-rango/medida'); continue }
          motivos.add('pasa-filtros-pero-cdad<=0')
        }
        causa = [...motivos].join('/') || 'desconocida'
      }
      causasFN.set(causa, (causasFN.get(causa) ?? 0) + 1)
      if (ejemplosFN.length < 14) {
        const filasStr = filas.length
          ? filas.map(({ cj, f }) => `${cj}|comp=${col(f, 'ComponenteAsoc')}|op=${col(f, 'nOpcion') || '·'}|rango=${col(f, 'MedidaMin')}-${col(f, 'MedidaMax')}|ranuraEnInst=${linea.ranuras.has(col(f, 'ComponenteAsoc'))}|artAsoc=${col(f, 'ArticuloAsoc') || '·'}`).join(' ; ')
          : '(no aparece en ningún conjunto-opción de la línea)'
        ejemplosFN.push(`  [FNpuro/${causa}] ${art} (${(descArt.get(art) ?? '').slice(0, 28)}) L=${linea.k}\n      ${filasStr}`)
      }
    }
  }
  if (errorConjuntoEnLinea) lineasConErrorConjunto++

  // Veredicto por línea: exacta ya / recuperable-solo-con-tramo / bloqueada por gap genuino
  const setEq = fpArts.length === 0 && fnArts.length === 0
  if (setEq) { lineaVeredicto.exacta++; continue }
  // ¿todos los errores son SWAP/OVERLAP/measure (tramo)? entonces sólo falta resolver tramo
  let soloTramo = true
  for (const art of fpArts) {
    if (!esOscilo(art)) { soloTramo = false; continue }
    if (!tieneHermano(art, fnSet) && !tieneHermano(art, tpSet)) soloTramo = false
  }
  for (const art of fnArts) {
    if (!esOscilo(art)) { soloTramo = false; continue }
    if (tieneHermano(art, fpSet)) continue // swap
    const filas = filasDeArtEnLinea(linea, art)
    // measure residue: está en filas y su bloqueo es de rango/medida (no gate ni categoría)
    let esMeasure = filas.length > 0
    for (const { f } of filas) {
      const comp = col(f, 'ComponenteAsoc')
      if (comp === '!' || (comp && !ESPECIALES.has(comp) && !linea.ranuras.has(comp))) esMeasure = false
    }
    if (!esMeasure) soloTramo = false
  }
  if (soloTramo) lineaVeredicto.soloTramo++
  else lineaVeredicto.gapGenuino++
}

const suma = (m) => [...m.values()].reduce((a, b) => a + b, 0)
const top = (m, n = 15) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n)
console.log(`Líneas del oráculo: ${lineas.length}`)
console.log(`Multiplicadores '!' aprendidos: ${multiplicador.size}`)
console.log(`\n=== VOLUMEN por clase (solo herraje oscilobatiente) ===`)
console.log(`  SWAP de tramo (conjunto neto OK, tramo mal): FP=${suma(clases.swapFP)}  FN=${suma(clases.swapFN)}`)
console.log(`  OVERLAP FP (rango solapado, hermano TP correcto): ${suma(clases.overlapFP ?? new Map())}`)
console.log(`  FP PURO neto (artículo sobrante, sin hermano):    ${suma(clases.fpPuro)}`)
console.log(`  FN PURO (artículo que falta de verdad):      ${suma(clases.fnPuro)}`)
console.log(`  Líneas con ALGÚN error de conjunto puro:     ${lineasConErrorConjunto}/${lineas.length}`)

console.log(`\n=== FP PURO por artículo ===`)
for (const [a, n] of top(clases.fpPuro)) console.log(`  ${String(n).padStart(4)}  ${a.padEnd(11)} ${(descArt.get(a) ?? '').slice(0, 38)}`)
console.log(`\n=== FN PURO por artículo ===`)
for (const [a, n] of top(clases.fnPuro)) console.log(`  ${String(n).padStart(4)}  ${a.padEnd(11)} ${(descArt.get(a) ?? '').slice(0, 38)}`)
console.log(`\n=== SWAP FP (tramo mal) por artículo ===`)
for (const [a, n] of top(clases.swapFP, 10)) console.log(`  ${String(n).padStart(4)}  ${a.padEnd(11)} ${(descArt.get(a) ?? '').slice(0, 38)}`)

console.log(`\n=== GATES presentes en las filas de FP PURO (frecuencia) ===`)
for (const [r, n] of top(gatesFP, 20)) console.log(`  ${String(n).padStart(4)}  ${r}`)
console.log(`\n=== CAUSAS de FN PURO ===`)
for (const [r, n] of top(causasFN, 20)) console.log(`  ${String(n).padStart(4)}  ${r}`)

console.log(`\n=== EJEMPLOS FP PURO ===`)
for (const e of ejemplosFP) console.log(e)
console.log(`\n=== EJEMPLOS FN PURO ===`)
for (const e of ejemplosFN) console.log(e)

console.log(`\n=== FN puro "no en filas de la línea": a dónde pertenecen ===`)
for (const [a, n] of top(noEnConjuntos, 20)) console.log(`  ${String(n).padStart(4)}  ${a.padEnd(11)} ${(descArt.get(a) ?? '').slice(0, 34)}`)

console.log(`\n=== VEREDICTO por línea (216) ===`)
console.log(`  ya exactas en conjunto de artículos:                 ${lineaVeredicto.exacta}`)
console.log(`  se volverían exactas SÓLO resolviendo tramo/medida:  ${lineaVeredicto.soloTramo}`)
console.log(`  bloqueadas por gap genuino (categoría '!' / conjunto no ofertado / ranura ausente): ${lineaVeredicto.gapGenuino}`)
console.log(`  de las cuales, líneas cuyo ÚNICO error es overlap-FP fantasma: ${lineasSoloOverlap}`)
