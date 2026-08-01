/**
 * FASE 3 del RECON del CONFIGURADOR: ¿el despiece GENERADO desde plantillas
 * coincide con el despiece REAL histórico?
 *
 * Entrada del generador: serie + código de estructura + ancho + alto.
 * Salida:                lista de piezas (articulo, cota, cantidad).
 *
 * Fuentes (SOLO estas, y solo lectura):
 *   - `EstructurasArticulos.csv` filas PLANTILLA (`TipoDoc=''`): el despiece
 *     genérico de la estructura, con su fórmula de largo y su cantidad.
 *   - `ConjuntosLin.csv`: `(Conjunto=serie, Componente=DisComponente) → perfil real`.
 *   - `EstructurasDiseño.csv` filas plantilla: cotas simbólicas por defecto.
 *   - El rebaje de hoja de T.10 (`rebaje = f(perfil, eje, fórmula, serie)`),
 *     REUTILIZADO tal cual a través de `calcularDespiece` de `packages/core`.
 *
 * Guarda dura (regla 3): pieza sin regla de rebaje → cota `null` ("sin
 * valorar"). Nunca la medida del hueco, nunca una suposición.
 *
 * ORÁCULO: las líneas históricas de EMP0016 con árbol de diseño
 * (`VDatosLinDetDis`). El enlace generado↔real es por **id exacto**: el código
 * de componente genérico (`EstructurasArticulos.DisComponente` ↔
 * `VDatosLinDetDis.Componente`) dentro de la misma instancia
 * (`nVDoc` + `nVLinEstr`), que a su vez apunta a la línea hija real por
 * `nVLinea`. JAMÁS por proximidad de medida (regla 8).
 *
 * Del oráculo se toma SOLO la entrada (serie, estructura, ancho, alto).
 *
 * Uso:
 *   npx tsx scripts/medir-configurador.mjs                       (informe completo)
 *   npx tsx scripts/medir-configurador.mjs --generar ELEGANTPVC 2O 1050 1200
 *   npx tsx scripts/medir-configurador.mjs --precheck            (solo ejes)
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse/sync'
import { calcularDespiece } from '../packages/core/src/despiece/calcular.ts'
import { evaluar } from '../packages/core/src/despiece/formula.ts'

for (const l of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = l.match(/^\s*([A-Z_]+)=(.*)$/); if (m) process.env[m[1]] ??= m[2].trim()
}
const ORIGEN = process.env.RUTA_CSV_ORIGEN
const leer = (n) => parse(readFileSync(join(ORIGEN, n)), {
  columns: true, bom: true, skip_empty_lines: true, relax_quotes: true,
})
const col = (f, n) => (f?.[n] ?? '').trim()
const num = (f, n) => Number(col(f, n).replace(',', '.')) || 0
const TOL = 1.0            // ±1 mm, el criterio de la Fase 3
const FUNCIONES_HOJA = new Set(['HV', 'HH'])
const FUNCIONES_MARCO = new Set(['MV', 'MH'])

// ---------------------------------------------------------------- catálogo
const estArt = leer('EstructurasArticulos.csv')
const estDis = leer('EstructurasDiseño.csv')
const estructurasDa = leer('EstructurasDA.csv')
const medidasDa = leer('VMedidasDA.csv')
const conjLin = leer('ConjuntosLin.csv')
const vLin = leer('VPresupuestosLin.csv')
const datosLin = leer('VDatosLinEstr.csv')
const detDis = leer('VDatosLinDetDis.csv')

/** Plantilla por estructura: filas con `TipoDoc=''`, en orden de `nLin`. */
const plantillaPorEstructura = new Map()
for (const f of estArt) {
  if (col(f, 'TipoDoc')) continue
  const e = col(f, 'Estructura')
  if (!plantillaPorEstructura.has(e)) plantillaPorEstructura.set(e, [])
  plantillaPorEstructura.get(e).push(f)
}
for (const v of plantillaPorEstructura.values()) v.sort((a, b) => +col(a, 'nLin') - +col(b, 'nLin'))

/** `(serie, genérico) → perfil real`. */
const perfilReal = new Map()
for (const f of conjLin) perfilReal.set(`${col(f, 'Conjunto')}|${col(f, 'Componente')}`, col(f, 'Articulo'))

/** Cotas simbólicas por defecto de la estructura (plantilla). */
const cotasDefecto = new Map(); const simboloPorId = new Map()
for (const f of estDis) {
  if (col(f, 'TipoDoc')) continue
  const e = col(f, 'Estructura'), s = col(f, 'Simbolo')
  const id = col(f, 'Id'); if (id) simboloPorId.set(`${e}|${id}`, s)
  if (!s) continue
  if (!cotasDefecto.has(e)) cotasDefecto.set(e, {})
  cotasDefecto.get(e)[s] = num(f, 'Cota')
}
/** Cotas de la INSTANCIA (solo para derivar el rebaje, como hizo T.10). */
const cotasInstancia = new Map()
for (const f of estDis) {
  if (col(f, 'TipoDoc') !== 'VPRES') continue
  const e = col(f, 'Estructura')
  const s = col(f, 'Simbolo') || simboloPorId.get(`${e}|${col(f, 'Id')}`) || ''
  if (!s) continue
  const k = `${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!cotasInstancia.has(k)) cotasInstancia.set(k, {})
  cotasInstancia.get(k)[s] = num(f, 'Cota')
}
const simboloDa = new Map(estructurasDa.map((f) => [`${col(f, 'Estructura')}|${col(f, 'nDA')}`, col(f, 'SimboloDA')]))
for (const f of medidasDa) {
  if (col(f, 'TipoDoc') !== 'VPRES') continue
  const s = simboloDa.get(`${col(f, 'Estructura')}|${col(f, 'nDA')}`)
  if (!s) continue
  const k = `${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!cotasInstancia.has(k)) cotasInstancia.set(k, {})
  cotasInstancia.get(k)[s] = num(f, 'Medida')
}

// ---------------------------------------------------------------- oráculo
const seriePorLinea = new Map()
for (const f of datosLin) {
  if (col(f, 'TipoDoc') !== 'VPRES') continue
  seriePorLinea.set(`${col(f, 'nVDoc')}|${col(f, 'nVLinea')}`, col(f, 'Conjunto1'))
}
const hijaPorId = new Map()      // nDoc|nLinea → fila hija
const hijasPorPadre = new Map()  // nDoc|nLineaPadre → [hijas]
for (const f of vLin) {
  hijaPorId.set(`${col(f, 'nDoc')}|${col(f, 'nLinea')}`, f)
  const p = col(f, 'nEstr'); if (!p || p === '0') continue
  const k = `${col(f, 'nDoc')}|${p}`
  if (!hijasPorPadre.has(k)) hijasPorPadre.set(k, [])
  hijasPorPadre.get(k).push(f)
}
/** Árbol de diseño de la instancia: filas (Componente → línea hija real). */
const arbolPorInstancia = new Map()
for (const d of detDis) {
  if (col(d, 'TipoDoc') !== 'VPRES') continue
  const k = `${col(d, 'nVDoc')}|${col(d, 'nVLinEstr')}`
  if (!arbolPorInstancia.has(k)) arbolPorInstancia.set(k, [])
  arbolPorInstancia.get(k).push(d)
}
for (const v of arbolPorInstancia.values()) v.sort((a, b) => +col(a, 'DisId') - +col(b, 'DisId') || +col(a, 'nVLinea') - +col(b, 'nVLinea'))

/** Instancias del oráculo: padres estructurales con árbol y medidas. */
const instancias = []
for (const p of vLin) {
  if (col(p, 'EstructuraSN') !== 'True') continue
  const k = `${col(p, 'nDoc')}|${col(p, 'nLinea')}`
  const arbol = arbolPorInstancia.get(k)
  if (!arbol || !arbol.length) continue
  const estructura = col(p, 'Articulo')
  const plantilla = plantillaPorEstructura.get(estructura)
  if (!plantilla || !plantilla.length) continue
  const ancho = num(p, 'Ancho'), largo = num(p, 'Largo')
  if (ancho <= 0 || largo <= 0) continue
  instancias.push({
    k, doc: col(p, 'nDoc'), linea: col(p, 'nLinea'), estructura,
    serie: seriePorLinea.get(k) ?? '',
    anchoCol: ancho, largoCol: largo, plantilla, arbol,
    cotasInst: cotasInstancia.get(k) ?? {},
    nHijas: (hijasPorPadre.get(k) ?? []).length,
  })
}

/**
 * Enlace generado↔real, por ID EXACTO: el código de componente genérico.
 * Dentro de una instancia, las filas de plantilla con el mismo `DisComponente`
 * son intercambiables (misma fórmula y misma cantidad), así que emparejarlas
 * en orden no fabrica ningún dato. Devuelve pares y sobrantes/faltantes.
 */
/**
 * Enlace ALTERNATIVO, aún más estricto: `EstructurasArticulos.id` ↔
 * `VDatosLinDetDis.DisId`. Solo vale en las instancias cuyo árbol se emitió en
 * el mismo orden que la plantilla; sirve para comprobar que el resultado no
 * depende de cómo se emparejaron las filas (regla 8).
 */
let MODO_ENLACE = process.argv.includes('--enlace-id') ? 'id' : 'componente'
function enlazarPorId(inst) {
  const porDisId = new Map()
  for (const d of inst.arbol) {
    const id = col(d, 'DisId')
    if (!id || id === '0' || porDisId.has(id)) continue      // 0 = fila fuera del árbol numerado
    const hija = hijaPorId.get(`${inst.doc}|${col(d, 'nVLinea')}`)
    if (hija) porDisId.set(id, { d, hija })
  }
  let coincide = true
  const pares = inst.plantilla.map((fila) => {
    const id = col(fila, 'id')
    if (!id || id === '0') return { fila, real: null, componente: col(fila, 'DisComponente'), ignorar: true }
    const e = porDisId.get(id)
    if (!e || col(e.d, 'Componente') !== col(fila, 'DisComponente')) coincide = false
    return { fila, real: e ? e.hija : null, componente: col(fila, 'DisComponente') }
  })
  return { pares, sobranArbol: 0, coincide }
}

/**
 * ¿La instancia se compuso con la topología LITERAL de la plantilla, o el
 * usuario la modificó en el diseñador (travesaños, huecos, hojas de más)?
 * Se decide con el multiset de códigos de componente del árbol frente al de
 * la plantilla — dato de ENTRADA, no de medida.
 */
function esCanonica(inst) {
  const cta = new Map()
  for (const f of inst.plantilla) { const c = col(f, 'DisComponente'); cta.set(c, (cta.get(c) ?? 0) + 1) }
  const ctb = new Map()
  for (const d of inst.arbol) { const c = col(d, 'Componente'); if (cta.has(c)) ctb.set(c, (ctb.get(c) ?? 0) + 1) }
  if (cta.size !== ctb.size) return false
  for (const [c, n] of cta) if (ctb.get(c) !== n) return false
  return true
}

function enlazar(inst) {
  if (MODO_ENLACE === 'id') return enlazarPorId(inst)
  const realPorComp = new Map()
  for (const d of inst.arbol) {
    const c = col(d, 'Componente')
    const hija = hijaPorId.get(`${inst.doc}|${col(d, 'nVLinea')}`)
    if (!hija) continue
    if (!realPorComp.has(c)) realPorComp.set(c, [])
    realPorComp.get(c).push(hija)
  }
  const usados = new Map()
  const pares = []
  for (const fila of inst.plantilla) {
    const c = col(fila, 'DisComponente')
    const i = usados.get(c) ?? 0
    const lista = realPorComp.get(c) ?? []
    const real = lista[i] ?? null
    usados.set(c, i + 1)
    pares.push({ fila, real, componente: c })
  }
  // filas del árbol sin contrapartida en la plantilla (junquillos JH/JV…)
  let sobranArbol = 0
  for (const [c, lista] of realPorComp) sobranArbol += Math.max(0, lista.length - (usados.get(c) ?? 0))
  return { pares, sobranArbol }
}

// ------------------------------------------------- PRE-CHECK: ejes A / L
/**
 * ¿`A` es ANCHO y `L` es ALTO, o al revés? Se decide con datos: para 10 líneas
 * históricas con árbol se evalúan las fórmulas de MARCO (que NO llevan rebaje,
 * así que su corte es la fórmula pura) bajo las dos convenciones y se cuenta
 * cuál reproduce el corte real.
 */
function precheck(nLineas = 10) {
  const filas = []
  let okDirecta = 0, okInvertida = 0, total = 0
  for (const inst of instancias) {
    if (filas.length >= nLineas) break
    if (inst.anchoCol === inst.largoCol) continue      // no distingue: inútil
    const { pares } = enlazar(inst)
    const cot = { ...(cotasDefecto.get(inst.estructura) ?? {}), ...inst.cotasInst }
    const ctxA = { A: inst.anchoCol, L: inst.largoCol, ...cot }   // catálogo: A=ANCHO
    const ctxB = { A: inst.largoCol, L: inst.anchoCol, ...cot }   // invertida
    let a = 0, b = 0, n = 0
    for (const { fila, real, ignorar } of pares) {
      if (!real || ignorar) continue
      if (!FUNCIONES_MARCO.has(col(fila, 'Funcion'))) continue
      const art = col(real, 'Articulo'); if (!art || art === '0') continue
      const corte = num(real, 'LargoCorte') || num(real, 'Largo'); if (corte <= 0) continue
      const f = col(fila, 'FormulaLargoCorte') || col(fila, 'FormulaLargo'); if (!f) continue
      let va, vb
      try { va = evaluar(f, ctxA); vb = evaluar(f, ctxB) } catch { continue }
      n++; if (Math.abs(va - corte) <= TOL) a++; if (Math.abs(vb - corte) <= TOL) b++
    }
    if (!n) continue
    total += n; okDirecta += a; okInvertida += b
    filas.push({ k: inst.k, estructura: inst.estructura, serie: inst.serie, ancho: inst.anchoCol, largo: inst.largoCol, n, a, b })
  }
  console.log('=== PRE-CHECK DE EJES (A = ¿ancho o alto?) ===\n')
  console.log('  Piezas de MARCO (MV/MH): no llevan rebaje, su corte ES la fórmula.')
  console.log('  Convención CATÁLOGO  = { A: columna Ancho, L: columna Largo }')
  console.log('  Convención INVERTIDA = { A: columna Largo, L: columna Ancho }\n')
  console.log('  doc|línea      estructura  serie         Ancho  Largo   n   catálogo  invertida')
  for (const f of filas) {
    console.log(`  ${f.k.padEnd(14)} ${f.estructura.padEnd(11)} ${f.serie.padEnd(13)} ${String(f.ancho).padStart(5)} ${String(f.largo).padStart(6)} ${String(f.n).padStart(3)}   ${String(f.a).padStart(8)}  ${String(f.b).padStart(9)}`)
  }
  console.log(`\n  TOTAL ${total} piezas de marco: catálogo ${okDirecta} (${(100 * okDirecta / total).toFixed(1)}%) · invertida ${okInvertida} (${(100 * okInvertida / total).toFixed(1)}%)`)
  const veredicto = okDirecta > okInvertida
    ? 'A = ANCHO, L = ALTO (columna Ancho → A, columna Largo → L). El catálogo manda.'
    : 'A = ALTO, L = ANCHO. El catálogo NO manda; revisar.'
  console.log(`  VEREDICTO: ${veredicto}`)
  return okDirecta > okInvertida
}

// --------------------------------------- rebaje de hoja (T.10, reutilizado)
/**
 * Observaciones de rebaje sobre TODO el histórico, con el mismo enlace exacto.
 * Clave del grupo = (perfil real, eje/función, fórmula, serie), la de T.10.
 */
const gruposRebaje = new Map()
for (const inst of instancias) {
  const { pares } = enlazar(inst)
  const ctx = { A: inst.anchoCol, L: inst.largoCol, ...(cotasDefecto.get(inst.estructura) ?? {}), ...inst.cotasInst }
  for (const { fila, real, ignorar } of pares) {
    if (!real || ignorar) continue
    const fn = col(fila, 'Funcion'); if (!FUNCIONES_HOJA.has(fn)) continue
    const art = col(real, 'Articulo'); if (!art || art === '0') continue
    const corte = num(real, 'LargoCorte') || num(real, 'Largo'); if (corte <= 0) continue
    const f = col(fila, 'FormulaLargoCorte') || col(fila, 'FormulaLargo'); if (!f) continue
    let previsto; try { previsto = evaluar(f, ctx) } catch { continue }
    if (!Number.isFinite(previsto)) continue
    const c = `${art}|${fn}|${f}|${inst.serie}`
    if (!gruposRebaje.has(c)) gruposRebaje.set(c, [])
    gruposRebaje.get(c).push({ delta: previsto - corte, previsto, duenyo: inst.k })
  }
}
/**
 * Regla de un grupo: la moda del delta (±0,51 mm), con ≥3 observaciones,
 * ≥90% de consistencia y **medidas distintas** (regla 9). `excluir` permite
 * dejar fuera la propia línea que se va a medir (held-out por línea).
 */
const cacheRegla = new Map()
function reglaDe(clave, excluir = null) {
  const ck = `${clave}##${excluir ?? ''}`
  if (cacheRegla.has(ck)) return cacheRegla.get(ck)
  const todas = gruposRebaje.get(clave)
  let res = null
  if (todas) {
    const obs = excluir ? todas.filter((o) => o.duenyo !== excluir) : todas
    if (obs.length >= 3 && new Set(obs.map((o) => Math.round(o.previsto))).size > 1) {
      const cuentas = new Map()
      for (const o of obs) { const d = Math.round(o.delta * 10) / 10; cuentas.set(d, (cuentas.get(d) ?? 0) + 1) }
      const claves = [...cuentas.keys()]
      let mejor = null, mejorN = 0
      for (const d of claves) {
        let n = 0
        for (const e of claves) if (Math.abs(e - d) <= 0.51) n += cuentas.get(e)
        if (n > mejorN) { mejorN = n; mejor = d }
      }
      if (mejorN / obs.length >= 0.9) res = { mm: mejor, muestras: mejorN, totalMuestras: obs.length }
    }
  }
  cacheRegla.set(ck, res)
  return res
}

// ---------------------------------------------------------- EL GENERADOR
/**
 * Genera el despiece de (serie, estructura, ancho, alto) usando SOLO plantilla
 * + ConjuntosLin + fórmulas + rebaje T.10. Devuelve una pieza por fila de
 * plantilla; `articulo` vacío = la fila no resuelve a perfil real (herraje,
 * escuadra, junta, MO, vidrio: se surten por otras tablas, fuera de esta
 * cadena). `cota` null = sin regla → SIN VALORAR (nunca una suposición).
 */
function generar(serie, estructura, anchoMm, altoMm, excluirLinea = null) {
  const plantilla = plantillaPorEstructura.get(estructura)
  if (!plantilla) return null
  const cotas = { ...(cotasDefecto.get(estructura) ?? {}) }
  const filasPerfil = [], indicePerfil = []
  const piezas = plantilla.map((fila, i) => {
    const gen = col(fila, 'DisComponente')
    const art = perfilReal.get(`${serie}|${gen}`) ?? ''
    const p = {
      i, componente: gen, funcion: col(fila, 'Funcion'),
      articulo: (art && art !== '0') ? art : '',
      cantidad: num(fila, 'Cantidad'),
      formula: col(fila, 'FormulaLargoCorte') || col(fila, 'FormulaLargo'),
      cota: null, incidencia: null, generada: false,
    }
    if (!p.articulo) { p.incidencia = 'no resuelve a perfil real en ConjuntosLin'; return p }
    p.generada = true
    filasPerfil.push({
      articuloCodigo: p.articulo, cantidad: p.cantidad, formulaLargo: p.formula || null,
      tipoCorte: null, anguloIzquierdo: null, anguloDerecho: null, funcion: p.funcion,
    })
    indicePerfil.push(i)
    return p
  })
  // El motor de `packages/core` es quien evalúa y aplica el rebaje de T.10.
  const r = calcularDespiece(filasPerfil, { anchoMm: altoMm, altoMm: anchoMm }, cotas, {
    serie,
    rebajeDeHoja: (c) => reglaDe(`${c.articuloCodigo}|${c.funcion}|${c.formula}|${c.serie}`, excluirLinea),
  })
  //  ^ `calcularDespiece` liga L←anchoMm y A←altoMm. El catálogo usa A=ANCHO
  //    y L=ALTO (verificado en el pre-check), así que aquí se le pasa el ALTO
  //    en `anchoMm` y el ANCHO en `altoMm` para que el contexto quede
  //    { A: ancho, L: alto }. Es la misma compensación que ya hacen los
  //    scripts de medición del proyecto; la web NO la hace (ver informe).
  r.piezas.forEach((pz, j) => {
    const p = piezas[indicePerfil[j]]
    p.cota = pz.largoMm
    if (pz.largoMm === null) p.incidencia = pz.incidencia
  })
  return piezas
}

// ------------------------------------------------------------ MEDICIÓN
const ABATIBLES = new Set(['2O', '1O', '2OFI', '1OFI', '1OI', '3HO', '2O+1OFI', '1P', '2', '1', '02V', '02H'])

function medir({ soloElegant2O = false, minInstancias = 5 } = {}) {
  const grupos = new Map()
  for (const inst of instancias) {
    if (!ABATIBLES.has(inst.estructura)) continue
    if (!inst.serie) continue
    if (soloElegant2O && !(inst.serie === 'ELEGANTPVC' && inst.estructura === '2O')) continue
    const g = `${inst.serie}|${inst.estructura}`
    if (!grupos.has(g)) grupos.set(g, [])
    grupos.get(g).push(inst)
  }
  const activos = [...grupos.entries()].filter(([, v]) => v.length >= minInstancias)
    .sort((a, b) => b[1].length - a[1].length)

  const acc = {
    instancias: 0, medidasDistintas: new Set(), articulosDistintos: new Set(),
    filas: 0, filasConReal: 0, artOk: 0,
    generadas: 0, generadasConReal: 0, genArtOk: 0,
    conCota: 0, sinValorar: 0, cotaOk: 0,
    cdadOk: 0, cdadEval: 0,
    exactas: 0, exactasGen: 0, exactasMH: 0, exactasUnaPieza: 0, exactasMHunaPieza: 0, exactasTotales: 0,
    canon: 0, canonMH: 0, canonGen: 0, noCanon: 0, noCanonMH: 0,
    faltan: 0, sobran: 0, sobranArbol: 0, sobranHijas: 0,
    fallo: { marcoArt: 0, marcoCota: 0, hojaArt: 0, hojaCota: 0, restoArt: 0, restoCota: 0, sinRegla: 0 },
    perfilFallo: new Map(), ejemplosOk: [], ejemplosKo: [],
  }
  const porGrupo = []

  for (const [g, lista] of activos) {
    const s = { g, n: lista.length, medidas: new Set(), generadas: 0, genArtOk: 0, conCota: 0, cotaOk: 0, sinValorar: 0, exactas: 0 }
    for (const inst of lista) {
      const { pares, sobranArbol, coincide } = enlazar(inst)
      if (MODO_ENLACE === 'id' && coincide === false) continue   // el árbol no está en el orden de la plantilla
      const piezas = generar(inst.serie, inst.estructura, inst.anchoCol, inst.largoCol, inst.k)
      if (!piezas) continue
      const canonica = esCanonica(inst)
      if (canonica) acc.canon++; else acc.noCanon++
      acc.instancias++; s.medidas.add(`${inst.anchoCol}x${inst.largoCol}`)
      acc.medidasDistintas.add(`${inst.anchoCol}x${inst.largoCol}`)
      acc.sobranArbol += sobranArbol
      acc.sobranHijas += Math.max(0, inst.nHijas - pares.filter((p) => p.real).length)

      // Tres niveles de "estructura exacta", los tres reportados:
      //  okMH   — solo marco (MV/MH) + hoja (HV/HH): lo que la cadena
      //           plantilla→ConjuntosLin→rebaje T.10 dice cubrir.
      //  okGen  — todas las piezas que el generador EMITE.
      //  okTodo — además, ninguna pieza real dentro del enlace sin generar
      //           (incluye vidrio y perfiles de función no cubierta).
      let okMH = true, okGen = true, okTodo = true
      let nGenerada = 0, nMH = 0
      const diff = []
      const detalleMH = []
      for (let i = 0; i < pares.length; i++) {
        const { fila, real, ignorar } = pares[i]
        if (ignorar) continue
        const p = piezas[i]
        const fn = col(fila, 'Funcion')
        const esMH = FUNCIONES_MARCO.has(fn) || FUNCIONES_HOJA.has(fn)
        const clase = FUNCIONES_MARCO.has(fn) ? 'marco' : FUNCIONES_HOJA.has(fn) ? 'hoja' : 'resto'
        const mal = (txt) => { okTodo = false; okGen = false; if (esMH) okMH = false; diff.push(txt) }
        acc.filas++
        if (!real) {
          acc.faltan++
          if (p.generada) mal(`${p.componente} ${fn}: generada (${p.articulo}) y sin contrapartida en el árbol`)
          continue
        }
        acc.filasConReal++
        const artReal = col(real, 'Articulo')
        const artGen = p.articulo || '0'
        const artOk = artGen === (artReal || '0')
        if (artOk) acc.artOk++
        if (p.generada) {
          acc.generadas++; nGenerada++; s.generadas++; acc.generadasConReal++
          acc.articulosDistintos.add(p.articulo)
          if (esMH) nMH++
          if (artOk) { acc.genArtOk++; s.genArtOk++ }
          else { acc.fallo[`${clase}Art`]++; mal(`${p.componente} ${fn}: artículo gen=${artGen} real=${artReal}`) }
          const corte = num(real, 'LargoCorte') || num(real, 'Largo')
          if (esMH) detalleMH.push({ c: p.componente, fn, cd: p.cantidad, ag: p.articulo, ar: artReal, cg: p.cota, cr: corte })
          if (p.cota === null) {
            acc.sinValorar++; s.sinValorar++
            if (/rebaje/.test(p.incidencia ?? '')) acc.fallo.sinRegla++
            mal(`${p.componente} ${fn}: SIN VALORAR (${p.incidencia}) · real ${corte}`)
          } else if (corte > 0) {
            acc.conCota++; s.conCota++
            if (Math.abs(p.cota - corte) <= TOL) { acc.cotaOk++; s.cotaOk++ }
            else {
              acc.fallo[`${clase}Cota`]++
              const key = `${p.componente}|${fn}|${p.articulo}|${inst.serie}`
              if (!acc.perfilFallo.has(key)) acc.perfilFallo.set(key, [])
              acc.perfilFallo.get(key).push(p.cota - corte)
              mal(`${p.componente} ${fn}: cota gen=${p.cota.toFixed(1)} real=${corte} (Δ${(p.cota - corte).toFixed(1)})`)
            }
          }
          acc.cdadEval++
          if (Math.abs(p.cantidad - num(real, 'Cdad')) < 0.01) acc.cdadOk++
          else mal(`${p.componente} ${fn}: cantidad gen=${p.cantidad} real=${num(real, 'Cdad')}`)
        } else if (artReal && artReal !== '0') {
          // el oráculo tiene pieza real donde el generador no emite nada
          acc.sobran++; okTodo = false
          if (esMH) okMH = false
          diff.push(`${p.componente} ${fn}: el oráculo trae ${artReal} y el generador no emite nada`)
        }
      }
      if (okTodo && nGenerada > 0) {
        acc.exactas++; s.exactas++
        if (nGenerada === 1) acc.exactasUnaPieza++
      }
      if (okGen && nGenerada > 0) { acc.exactasGen++; if (canonica) acc.canonGen++ }
      if (okMH && nMH > 0) {
        acc.exactasMH++; if (nMH === 1) acc.exactasMHunaPieza++
        if (canonica) acc.canonMH++; else acc.noCanonMH++
        if (acc.ejemplosOk.length < 3) acc.ejemplosOk.push({ inst, detalleMH, canonica })
      } else if (nMH > 0 && acc.ejemplosKo.length < 3 && diff.length) {
        acc.ejemplosKo.push({ inst, diff, detalleMH, canonica })
      }
      acc.exactasTotales++
    }
    porGrupo.push(s)
  }
  return { acc, porGrupo }
}

// ---------------------------------------------------------------- salida
const args = process.argv.slice(2)

if (args[0] === '--generar') {
  const [, serie, estructura, ancho, alto] = args
  const piezas = generar(serie, estructura, Number(ancho), Number(alto))
  if (!piezas) { console.log(`No hay plantilla para la estructura ${estructura}`); process.exit(1) }
  console.log(`\nDespiece GENERADO · serie ${serie} · estructura ${estructura} · ${ancho} (ancho) x ${alto} (alto) mm\n`)
  console.log('  componente  función      artículo    cdad        cota  nota')
  for (const p of piezas) {
    console.log(`  ${p.componente.padEnd(11)} ${(p.funcion || '').padEnd(12)} ${(p.articulo || '—').padEnd(11)} ${String(p.cantidad).padStart(4)} ${(p.cota === null ? 'sin valorar' : p.cota.toFixed(1)).padStart(11)}  ${p.incidencia ?? ''}`)
  }
  const g = piezas.filter((p) => p.generada)
  console.log(`\n  ${g.length} piezas de perfil · ${g.filter((p) => p.cota !== null).length} con cota · ${g.filter((p) => p.cota === null).length} sin valorar`)
  console.log(`  ${piezas.length - g.length} filas de plantilla no resueltas por ConjuntosLin (herraje/escuadra/junta/MO/vidrio: otras tablas)`)
  process.exit(0)
}

const ejesOk = precheck(10)
if (args[0] === '--precheck') process.exit(0)
if (!ejesOk) { console.log('\nEl pre-check no confirma la convención del catálogo. Paro (regla 7).'); process.exit(1) }

console.log(`\n\nOráculo: ${instancias.length} instancias con árbol de diseño sobre ${vLin.filter((f) => col(f, 'EstructuraSN') === 'True').length} líneas estructurales.`)
console.log(`Reglas de rebaje T.10: ${gruposRebaje.size} grupos (perfil, eje, fórmula, serie) con observación.\n`)

for (const [titulo, opts] of [
  ['MUESTRA PRINCIPAL — ELEGANTPVC · 2O', { soloElegant2O: true, minInstancias: 1 }],
  ['MUESTRA AMPLIADA — todas las (serie, topología) abatibles con ≥5 instancias', { minInstancias: 5 }],
]) {
  const { acc, porGrupo } = medir(opts)
  console.log(`\n${'='.repeat(78)}\n${titulo}\n${'='.repeat(78)}\n`)
  console.log(`  instancias medidas ....................... ${acc.instancias}`)
  console.log(`  medidas DISTINTAS (ancho×alto) ........... ${acc.medidasDistintas.size}   ← control de trivialidad (regla 9)`)
  console.log(`  cobertura del oráculo .................... ${acc.instancias} de ${vLin.filter((f) => col(f, 'EstructuraSN') === 'True').length} líneas estructurales del ejercicio (${(100 * acc.instancias / 2071).toFixed(1)}%)`)
  console.log(`\n  --- grupos ---`)
  console.log('    serie|estructura        n   medidas distintas   piezas gen   art OK   cota OK   sin valorar   exactas')
  for (const s of porGrupo) {
    console.log(`    ${s.g.padEnd(22)} ${String(s.n).padStart(3)}   ${String(s.medidas.size).padStart(17)}   ${String(s.generadas).padStart(10)}   ${String(s.genArtOk).padStart(6)}   ${String(s.cotaOk).padStart(7)}   ${String(s.sinValorar).padStart(11)}   ${String(s.exactas).padStart(7)}`)
  }
  const pct = (a, b) => b ? `${(100 * a / b).toFixed(1)}%` : 'n/a'
  console.log(`\n  --- LAS TRES MÉTRICAS, SEPARADAS ---`)
  console.log(`  (a) piezas con ARTÍCULO correcto ......... ${acc.genArtOk}/${acc.generadasConReal} = ${pct(acc.genArtOk, acc.generadasConReal)}   (sobre piezas de perfil GENERADAS con contrapartida real)`)
  console.log(`      idem incluyendo las filas que el generador declara "no es perfil": ${acc.artOk}/${acc.filasConReal} = ${pct(acc.artOk, acc.filasConReal)}`)
  console.log(`  (b) piezas con COTA correcta a ±1 mm ..... ${acc.cotaOk}/${acc.conCota} = ${pct(acc.cotaOk, acc.conCota)}   (sobre piezas CON cota generada)`)
  console.log(`      piezas SIN VALORAR (sin regla) ....... ${acc.sinValorar}  (${pct(acc.sinValorar, acc.generadas)} de las generadas)`)
  console.log(`      cantidad correcta .................... ${acc.cdadOk}/${acc.cdadEval} = ${pct(acc.cdadOk, acc.cdadEval)}`)
  console.log(`  (c) ESTRUCTURAS COMPLETAS EXACTAS, tres niveles   ← la que decide la PUERTA 3`)
  console.log(`      c1 ESTRICTA (nada falta: incluye vidrio y funciones no cubiertas) ... ${acc.exactas}/${acc.exactasTotales} = ${pct(acc.exactas, acc.exactasTotales)}`)
  console.log(`      c2 todas las piezas que el generador EMITE, correctas .............. ${acc.exactasGen}/${acc.exactasTotales} = ${pct(acc.exactasGen, acc.exactasTotales)}`)
  console.log(`      c3 solo MARCO + HOJA (el alcance que la cadena T.10 dice cubrir) ... ${acc.exactasMH}/${acc.exactasTotales} = ${pct(acc.exactasMH, acc.exactasTotales)}`)
  console.log(`      de las c1 exactas, con UNA SOLA pieza: ${acc.exactasUnaPieza} · de las c3, con UNA SOLA pieza: ${acc.exactasMHunaPieza}   (regla 9)`)
  console.log(`      artículos de perfil DISTINTOS emitidos en la muestra: ${acc.articulosDistintos.size}   (regla 9)`)
  console.log(`
      ¿la instancia se compuso con la topología LITERAL de la plantilla?`)
  console.log(`      canónicas ${acc.canon}/${acc.instancias} (${pct(acc.canon, acc.instancias)})  →  c3 ${acc.canonMH}/${acc.canon} = ${pct(acc.canonMH, acc.canon)} · c2 ${acc.canonGen}/${acc.canon} = ${pct(acc.canonGen, acc.canon)}`)
  console.log(`      modificadas en el diseñador ${acc.noCanon}/${acc.instancias} (${pct(acc.noCanon, acc.instancias)})  →  c3 ${acc.noCanonMH}/${acc.noCanon} = ${pct(acc.noCanonMH, acc.noCanon)}`)
  console.log(`\n  --- desglose del fallo ---`)
  console.log(`    artículo mal: marco ${acc.fallo.marcoArt} · hoja ${acc.fallo.hojaArt} · resto ${acc.fallo.restoArt}`)
  console.log(`    cota mal:     marco ${acc.fallo.marcoCota} · hoja ${acc.fallo.hojaCota} · resto ${acc.fallo.restoCota}`)
  console.log(`    sin regla de rebaje (sin valorar, no es fallo): ${acc.fallo.sinRegla}`)
  console.log(`    piezas que FALTAN (plantilla sin contrapartida en el árbol): ${acc.faltan}`)
  console.log(`    piezas que SOBRAN dentro del enlace (el oráculo trae artículo donde el generador no emite): ${acc.sobran}`)
  console.log(`    líneas hijas reales FUERA de la cadena de plantilla (herraje, escuadras, juntas, junquillos, vidrio, MO): ${acc.sobranHijas}`)

  console.log(`\n  --- perfil del fallo de COTA: ¿desviación constante o ruido? ---`)
  const top = [...acc.perfilFallo.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 12)
  console.log('    componente|función|artículo|serie                       n    Δ mediana   Δ min    Δ max   constante')
  for (const [k, ds] of top) {
    const o = [...ds].sort((a, b) => a - b)
    const med = o[Math.floor(o.length / 2)]
    const cte = (o[o.length - 1] - o[0]) <= 1.0
    const enModa = o.filter((x) => Math.abs(x - med) <= 0.51).length
    console.log(`    ${k.padEnd(42)} ${String(ds.length).padStart(4)}   ${med.toFixed(1).padStart(9)} ${o[0].toFixed(1).padStart(8)} ${o[o.length - 1].toFixed(1).padStart(8)}   ${cte ? 'SÍ' : 'no'}   ${(100 * enModa / o.length).toFixed(1)}%`)
  }
  const nCte = [...acc.perfilFallo.values()].filter((ds) => { const o = [...ds].sort((a, b) => a - b); return (o[o.length - 1] - o[0]) <= 1.0 }).length
  const piezasCte = [...acc.perfilFallo.values()].filter((ds) => { const o = [...ds].sort((a, b) => a - b); return (o[o.length - 1] - o[0]) <= 1.0 }).reduce((a, b) => a + b.length, 0)
  console.log(`    grupos de fallo con Δ CONSTANTE (±1 mm): ${nCte}/${acc.perfilFallo.size}  →  ${piezasCte} de las ${acc.conCota - acc.cotaOk} piezas mal`)
  console.log(`    (constante = el rebaje existe y es medible, pero su función está FUERA de {HV,HH}, que es el alcance de T.10)`)

  const pintaDetalle = (e) => {
    for (const d of e.detalleMH) {
      const ok = d.ag === d.ar && d.cg !== null && Math.abs(d.cg - d.cr) <= TOL
      console.log(`        ${d.c.padEnd(5)} ${d.fn.padEnd(3)} cdad ${String(d.cd).padStart(2)}  gen ${(`${d.ag} ${d.cg === null ? 'sin valorar' : d.cg.toFixed(1)}`).padEnd(22)} real ${(`${d.ar} ${d.cr}`).padEnd(22)} ${ok ? 'ok' : '<-- MAL'}`)
    }
  }
  console.log(`\n  --- 3 estructuras EXACTAS en marco+hoja (c3), pieza a pieza ---`)
  for (const e of acc.ejemplosOk) {
    console.log(`    ${e.inst.k}  ${e.inst.serie}|${e.inst.estructura}  ancho ${e.inst.anchoCol} x alto ${e.inst.largoCol}`)
    pintaDetalle(e)
  }
  console.log(`\n  --- 3 estructuras FALLIDAS, pieza a pieza ---`)
  for (const e of acc.ejemplosKo) {
    console.log(`    ${e.inst.k}  ${e.inst.serie}|${e.inst.estructura}  ancho ${e.inst.anchoCol} x alto ${e.inst.largoCol}${e.canonica ? '' : '  [topología de la instancia DISTINTA de la plantilla]'}`)
    pintaDetalle(e)
    console.log(`      diferencias completas:`)
    for (const d of e.diff.slice(0, 8)) console.log(`        ${d.trim()}`)
  }
}
