/**
 * MEDICIÓN v3: predictor de asociados con TODOS los mecanismos conocidos
 * (anexo S) y el oráculo ampliado a presupuestos + albaranes + facturas.
 *
 *   - Ranuras (S.2): ComponenteAsoc debe existir como DisComponente en la
 *     instancia; filas acumulativas con correcciones negativas (S.1).
 *   - nOpcion contra las opciones marcadas de la línea.
 *   - Rangos de medida: eje aprendido por (Conjunto|ComponenteAsoc) por
 *     consistencia (≥90%, ≥5 muestras) sobre dimensiones de hoja/línea.
 *   - 'A'/'L' (patillas): cantidad = Cantidad × max(UnidadesMin, 1); con
 *     Intervalo=0 constante (verificado: 8 por línea en 1.150 casos).
 *   - '!' (categoría en texto): multiplicador APRENDIDO por categoría —
 *     se busca el rasgo de la instancia (recuento de un DisComponente,
 *     nº de hojas, constante) que reproduce la cantidad real al ≥90%.
 *
 * Solo lectura. Uso: node scripts/medir-seleccion-v3.mjs
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse/sync'

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
const opcionesDoc = leer('VOpcionesHerraje.csv')
const articulos = leer('Articulos.csv')
const estArt = leer('EstructurasArticulos.csv')
const descArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Descripcion')]))
const famPorArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Familia')]))

const DOCS = [
  { tipo: 'VPRES', lin: 'VPresupuestosLin.csv' },
  { tipo: 'VALB', lin: 'VAlbaranesLin.csv' },
  { tipo: 'VFAC', lin: 'VFacturasLin.csv' },
]

// --- candidatas por conjunto ---
const asocPorConjunto = new Map()
const poblacionAsoc = new Set()
for (const f of conjuntosAsoc) {
  const cj = col(f, 'Conjunto'), art = col(f, 'Articulo')
  if (!cj || !art || art === '0') continue
  poblacionAsoc.add(art)
  if (!asocPorConjunto.has(cj)) asocPorConjunto.set(cj, [])
  asocPorConjunto.get(cj).push(f)
}

// --- opciones e instancias por (tipo|doc|linea) ---
const opcionesPorLinea = new Map()
for (const f of opcionesDoc) {
  const k = `${col(f, 'TipoDoc')}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!opcionesPorLinea.has(k)) opcionesPorLinea.set(k, new Map())
  const porConj = opcionesPorLinea.get(k)
  const cj = col(f, 'Conjunto')
  if (!porConj.has(cj)) porConj.set(cj, new Set())
  if (col(f, 'SelecSN') === 'True') porConj.get(cj).add(col(f, 'nOpcion'))
}
const ranurasPorLinea = new Map()
const hojasPorLinea = new Map()
for (const f of estArt) {
  const t = col(f, 'TipoDoc')
  if (!t) continue
  const k = `${t}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  const dis = col(f, 'DisComponente')
  if (dis && dis !== '0') {
    if (!ranurasPorLinea.has(k)) ranurasPorLinea.set(k, new Map())
    const m = ranurasPorLinea.get(k)
    m.set(dis, (m.get(dis) ?? 0) + (num(f, 'Cantidad') || 1))
  }
  const idHoja = num(f, 'DisIdHoja')
  if (idHoja > 0) {
    if (!hojasPorLinea.has(k)) hojasPorLinea.set(k, new Set())
    hojasPorLinea.get(k).add(idHoja)
  }
}

// --- construir líneas del oráculo (3 tipos de documento) ---
const FUNCIONES_PERFIL = new Set(['MV', 'MH', 'HV', 'HH', 'TM', 'TH', 'TV'])
const lineas = []
for (const doc of DOCS) {
  const vLin = leer(doc.lin)
  const hijasPorPadre = new Map()
  for (const f of vLin) {
    const p = col(f, 'nEstr')
    if (!p || p === '0') continue
    if (!hijasPorPadre.has(p)) hijasPorPadre.set(p, [])
    hijasPorPadre.get(p).push(f)
  }
  for (const p of vLin) {
    if (col(p, 'EstructuraSN') !== 'True') continue
    const k = `${doc.tipo}|${col(p, 'nDoc')}|${col(p, 'nLinea')}`
    const opciones = opcionesPorLinea.get(k)
    const ranuras = ranurasPorLinea.get(k)
    if (!opciones || !ranuras) continue
    const hijas = hijasPorPadre.get(col(p, 'nLinea')) ?? []
    const cortesHH = [], cortesHV = []
    const reales = new Map()
    for (const h of hijas) {
      const art = col(h, 'Articulo'), fn = col(h, 'Funcion')
      const lc = num(h, 'LargoCorte')
      if (fn === 'HH' && lc) cortesHH.push(lc)
      if (fn === 'HV' && lc) cortesHV.push(lc)
      if (!art || art === '0' || FUNCIONES_PERFIL.has(fn)) continue
      const fam = famPorArt.get(art) ?? ''
      if (fam === '050' || fam === '051') continue
      if (!poblacionAsoc.has(art)) continue
      reales.set(art, (reales.get(art) ?? 0) + (num(h, 'Cdad') || 0))
    }
    if (!reales.size) continue
    lineas.push({
      k, opciones, ranuras, reales,
      nHojas: hojasPorLinea.get(k)?.size ?? 0,
      dims: {
        L: num(p, 'Largo'), A: num(p, 'Ancho'),
        HHx: cortesHH.length ? Math.max(...cortesHH) : 0,
        HVx: cortesHV.length ? Math.max(...cortesHV) : 0,
      },
    })
  }
}
console.log(`Líneas del oráculo (VPRES+VALB+VFAC): ${lineas.length}`)

const ESPECIALES = new Set(['A', 'L', '!', '59R'])

function filasOpcionOk(linea) {
  const activas = []
  for (const [cj, marcadas] of linea.opciones) {
    for (const f of asocPorConjunto.get(cj) ?? []) {
      const nOp = col(f, 'nOpcion')
      if (nOp && nOp !== '0' && !marcadas.has(nOp)) continue
      activas.push(f)
    }
  }
  return activas
}

// --- fase 1a: aprender eje de rango por (Conjunto|ComponenteAsoc) ---
const EJES = ['HHx', 'HVx', 'L', 'A']
const votos = new Map()
for (const linea of lineas) {
  for (const f of filasOpcionOk(linea)) {
    const comp = col(f, 'ComponenteAsoc')
    if (ESPECIALES.has(comp)) continue
    if (comp && !linea.ranuras.has(comp)) continue
    const max = num(f, 'MedidaMax')
    if (max <= 0 || num(f, 'Cantidad') <= 0) continue
    const grupo = `${col(f, 'Conjunto')}|${comp}`
    const presente = linea.reales.has(col(f, 'Articulo'))
    const min = num(f, 'MedidaMin')
    if (!votos.has(grupo)) votos.set(grupo, Object.fromEntries(EJES.map((e) => [e, { ok: 0, n: 0 }])))
    const v = votos.get(grupo)
    for (const eje of EJES) {
      const dentro = linea.dims[eje] >= min && linea.dims[eje] <= max
      v[eje].n++
      if (dentro === presente) v[eje].ok++
    }
  }
}
const ejePorGrupo = new Map()
for (const [grupo, v] of votos) {
  let mejor = null, tasa = 0
  for (const eje of EJES) {
    if (v[eje].n >= 5 && v[eje].ok / v[eje].n > tasa) { tasa = v[eje].ok / v[eje].n; mejor = eje }
  }
  if (mejor && tasa >= 0.9) ejePorGrupo.set(grupo, mejor)
}
console.log(`Ejes de rango aprendidos (≥90%): ${ejePorGrupo.size} de ${votos.size} grupos`)

// --- fase 1b: aprender multiplicador por categoría '!' ---
// rasgo candidato: constante 1, nº de hojas, o recuento de un DisComponente
function rasgosDe(linea) {
  const r = new Map([['const1', 1], ['nHojas', linea.nHojas]])
  for (const [dis, n] of linea.ranuras) r.set(`dis:${dis}`, n)
  return r
}
const obsCategoria = new Map() // texto -> [{base, real, rasgos}]
for (const linea of lineas) {
  // artículos cuyo único aporte activo viene de filas '!' (sin contaminar)
  const porArt = new Map() // art -> {bang: Σcant, otras: n, texto}
  for (const f of filasOpcionOk(linea)) {
    const comp = col(f, 'ComponenteAsoc')
    const art = col(f, 'Articulo')
    if (comp === '!') {
      const t = col(f, 'AsociadoA')
      const acc = porArt.get(art) ?? { bang: 0, otras: 0, textos: new Set() }
      acc.bang += num(f, 'Cantidad')
      acc.textos.add(t)
      porArt.set(art, acc)
    } else if (!comp || linea.ranuras.has(comp) || ESPECIALES.has(comp)) {
      const acc = porArt.get(art) ?? { bang: 0, otras: 0, textos: new Set() }
      acc.otras++
      porArt.set(art, acc)
    }
  }
  for (const [art, acc] of porArt) {
    if (acc.bang <= 0 || acc.otras > 0 || acc.textos.size !== 1) continue
    const texto = [...acc.textos][0]
    if (!obsCategoria.has(texto)) obsCategoria.set(texto, [])
    obsCategoria.get(texto).push({
      base: acc.bang,
      real: linea.reales.get(art) ?? 0,
      rasgos: rasgosDe(linea),
    })
  }
}
const multiplicador = new Map() // texto -> nombre del rasgo
for (const [texto, obs] of obsCategoria) {
  if (obs.length < 5) continue
  const nombres = new Set()
  for (const o of obs) for (const n of o.rasgos.keys()) nombres.add(n)
  let mejor = null, tasa = 0
  for (const nombre of nombres) {
    let ok = 0
    for (const o of obs) {
      const v = o.rasgos.get(nombre) ?? 0
      if (Math.abs(o.base * v - o.real) < 0.01) ok++
    }
    if (ok / obs.length > tasa) { tasa = ok / obs.length; mejor = nombre }
  }
  if (mejor && tasa >= 0.9) multiplicador.set(texto, mejor)
}
console.log(`Multiplicadores '!' aprendidos (≥90%, ≥5 obs): ${multiplicador.size} de ${obsCategoria.size} categorías`)
for (const [t, r] of [...multiplicador].slice(0, 15)) console.log(`   ${t.padEnd(32)} → ${r}`)

// --- fase 2: predicción completa ---
// Dos políticas para filas con rango cuyo grupo no tiene eje aprendido:
// aceptarlas (cobertura) o excluirlas (precisión). Se miden ambas.
for (const EXCLUIR_SIN_EJE of [false, true]) {
let tp = 0, fp = 0, fn = 0, exactasArt = 0, exactasCdad = 0
const fpFrec = new Map(), fnFrec = new Map()
for (const linea of lineas) {
  const predicho = new Map()
  const rasgos = rasgosDe(linea)
  for (const f of filasOpcionOk(linea)) {
    const comp = col(f, 'ComponenteAsoc')
    const art = col(f, 'Articulo')
    let aporte = null
    if (comp === 'A' || comp === 'L') {
      aporte = num(f, 'Cantidad') * Math.max(num(f, 'UnidadesMin'), 1)
    } else if (comp === '!') {
      const rasgo = multiplicador.get(col(f, 'AsociadoA'))
      if (!rasgo) continue
      aporte = num(f, 'Cantidad') * (rasgos.get(rasgo) ?? 0)
    } else if (comp === '59R') {
      continue
    } else {
      if (comp && !linea.ranuras.has(comp)) continue
      const min = num(f, 'MedidaMin'), max = num(f, 'MedidaMax')
      if (max > 0) {
        const eje = ejePorGrupo.get(`${col(f, 'Conjunto')}|${comp}`)
        if (eje) {
          if (!(linea.dims[eje] >= min && linea.dims[eje] <= max)) continue
        } else if (EXCLUIR_SIN_EJE) continue
      }
      aporte = num(f, 'Cantidad')
    }
    predicho.set(art, (predicho.get(art) ?? 0) + aporte)
  }
  for (const [art, cdad] of [...predicho]) if (cdad <= 0) predicho.delete(art)

  let iguales = 0
  for (const art of linea.reales.keys()) {
    if (predicho.has(art)) { tp++; iguales++ }
    else { fn++; fnFrec.set(art, (fnFrec.get(art) ?? 0) + 1) }
  }
  for (const art of predicho.keys()) {
    if (!linea.reales.has(art)) { fp++; fpFrec.set(art, (fpFrec.get(art) ?? 0) + 1) }
  }
  if (iguales === linea.reales.size && predicho.size === linea.reales.size) {
    exactasArt++
    let ok = true
    for (const [art, cdad] of linea.reales) {
      if (Math.abs((predicho.get(art) ?? 0) - cdad) > 0.01) { ok = false; break }
    }
    if (ok) exactasCdad++
  }
}
console.log(`\n=== rangos sin eje: ${EXCLUIR_SIN_EJE ? 'EXCLUIR' : 'aceptar'} ===`)
console.log(`Precisión: ${(100 * tp / (tp + fp)).toFixed(1)}%   cobertura: ${(100 * tp / (tp + fn)).toFixed(1)}%`)
console.log(`Líneas exactas en artículos: ${exactasArt}/${lineas.length}   y en cantidades: ${exactasCdad}/${lineas.length}`)
const top = (m) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)
console.log('--- FP frecuentes ---')
for (const [a, n] of top(fpFrec)) console.log(`  ${String(n).padStart(5)}  ${a.padEnd(12)} ${(descArt.get(a) ?? '').slice(0, 40)}`)
console.log('--- FN frecuentes ---')
for (const [a, n] of top(fnFrec)) console.log(`  ${String(n).padStart(5)}  ${a.padEnd(12)} ${(descArt.get(a) ?? '').slice(0, 40)}`)
}
