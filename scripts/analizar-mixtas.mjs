/**
 * ESTRUCTURAS MIXTAS (hoja + fijo), fase de medición.
 *
 *  1. ¿Qué estructuras reales tienen hojas Y más vidrios que hojas?
 *  2. En la plantilla: ¿qué distingue la ranura de cristal de la hoja de la
 *     del fijo? (DisVidrio, DisTipoHoja, DisIdHoja, DisGrupo…)
 *  3. En el documento real: ¿de qué cortes salen las medidas del vidrio
 *     del fijo? (¿marco? ¿travesaño? ¿perfil FV/FH?)
 *
 * Solo lectura. Uso: node scripts/analizar-mixtas.mjs
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse/sync'
import { tsImport } from 'tsx/esm/api'

const { evaluar } = await tsImport('../packages/core/src/despiece/formula.ts', import.meta.url)

for (const l of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = l.match(/^\s*([A-Z_]+)=(.*)$/); if (m) process.env[m[1]] ??= m[2].trim()
}
const ORIGEN = process.env.RUTA_CSV_ORIGEN
const leer = (n) => parse(readFileSync(join(ORIGEN, n)), {
  columns: true, bom: true, skip_empty_lines: true, relax_quotes: true,
})
const col = (f, n) => (f[n] ?? '').trim()
const num = (v) => Number(String(v).replace(',', '.')) || 0

const estArt = leer('EstructurasArticulos.csv')
const estDis = leer('EstructurasDiseño.csv')
const estructurasDa = leer('EstructurasDA.csv')
const medidasDa = leer('VMedidasDA.csv')
const vLin = leer('VPresupuestosLin.csv')
const datosLin = leer('VDatosLinEstr.csv')
const detallesDis = leer('VDatosLinDetDis.csv')
const conjuntosLin = leer('ConjuntosLin.csv')
const articulos = leer('Articulos.csv')
const porArt = new Map(articulos.map((a) => [col(a, 'Codigo'), a]))
const detallePorLinea = new Map(detallesDis.map((f) => [col(f, 'nVLinea'), f]))
const resolucionDirecta = new Map()
for (const f of conjuntosLin) {
  const art = col(f, 'Articulo')
  if (!art || art === '0') continue
  const clave = `${col(f, 'Conjunto')}|${col(f, 'Componente')}`
  const lista = resolucionDirecta.get(clave) ?? new Set()
  lista.add(art)
  resolucionDirecta.set(clave, lista)
}
const plantillasVidrio = new Map()
for (const f of estArt) {
  if (col(f, 'TipoDoc') || col(f, 'DisComponente') !== '1') continue
  const estructura = col(f, 'Estructura')
  const lista = plantillasVidrio.get(estructura) ?? []
  lista.push(f)
  plantillasVidrio.set(estructura, lista)
}

const cotasPlantilla = new Map()
const cotasInstancia = new Map()
const disenyoPorEstructura = new Map()
for (const f of estDis) {
  if (!col(f, 'TipoDoc')) {
    const estructura = col(f, 'Estructura')
    const porId = disenyoPorEstructura.get(estructura) ?? new Map()
    porId.set(col(f, 'Id'), f)
    disenyoPorEstructura.set(estructura, porId)
  }
  const simbolo = col(f, 'Simbolo')
  if (!simbolo) continue
  const destino = col(f, 'TipoDoc') ? cotasInstancia : cotasPlantilla
  const clave = col(f, 'TipoDoc')
    ? `${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
    : col(f, 'Estructura')
  if (!clave) continue
  const mapa = destino.get(clave) ?? {}
  mapa[simbolo] = num(col(f, 'Cota'))
  destino.set(clave, mapa)
}

// Algunas instancias conservan la cota pero dejan Simbolo vacÃ­o. El Id del
// nodo de diseÃ±o es estable respecto a la plantilla, de donde se recupera el
// sÃ­mbolo (p. ej. Id=1 -> FI en 2OFI).
for (const f of estDis) {
  if (!col(f, 'TipoDoc')) continue
  const plantilla = disenyoPorEstructura.get(col(f, 'Estructura'))?.get(col(f, 'Id'))
  const simbolo = plantilla ? col(plantilla, 'Simbolo') : ''
  if (!simbolo) continue
  const clave = `${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  const mapa = cotasInstancia.get(clave) ?? {}
  mapa[simbolo] = num(col(f, 'Cota'))
  cotasInstancia.set(clave, mapa)
}

// En documentos recientes las cotas elegidas por el usuario no se duplican
// en EstructurasDiseÃ±o: viven en VMedidasDA y nDA se traduce a sÃ­mbolo por
// EstructurasDA. Sin esta fuente se usarÃ­a por error el valor de catÃ¡logo.
const simboloDa = new Map(estructurasDa.map((f) => [
  `${col(f, 'Estructura')}|${col(f, 'nDA')}`,
  col(f, 'SimboloDA'),
]))
for (const f of medidasDa) {
  const simbolo = simboloDa.get(`${col(f, 'Estructura')}|${col(f, 'nDA')}`)
  if (!simbolo) continue
  const clave = `${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  const mapa = cotasInstancia.get(clave) ?? {}
  mapa[simbolo] = num(col(f, 'Medida'))
  cotasInstancia.set(clave, mapa)
}

const seriePorLinea = new Map()
for (const f of datosLin) {
  seriePorLinea.set(`${col(f, 'nVDoc')}|${col(f, 'nVLinea')}`, col(f, 'Conjunto1'))
}
const padres = vLin.filter((f) => col(f, 'EstructuraSN') === 'True')
const hijasPorPadre = new Map()
for (const f of vLin) {
  const p = col(f, 'nEstr')
  if (!p || p === '0') continue
  if (!hijasPorPadre.has(p)) hijasPorPadre.set(p, [])
  hijasPorPadre.get(p).push(f)
}

// 1. Mixtas: con hojas y con vidrios de MÁS de una medida
const estMixtas = new Map()
for (const p of padres) {
  const e = col(p, 'Articulo')
  const slots = plantillasVidrio.get(e) ?? []
  const tieneFijo = slots.some((s) => col(s, 'DisTipoHoja') === '-1')
  const tieneHoja = slots.some((s) => col(s, 'DisTipoHoja') !== '-1')
  if (!tieneFijo || !tieneHoja) continue
  const hijas = hijasPorPadre.get(col(p, 'nLinea')) ?? []
  const hvs = hijas.filter((h) => col(h, 'Funcion') === 'HV')
  if (!hvs.length) continue
  const vidrios = hijas.filter((h) => {
    const a = porArt.get(col(h, 'Articulo'))
    return a && col(a, 'Familia') === '050' && col(a, 'TipoMetraje') === 'M2'
  })
  const medidas = new Set(vidrios.map((h) => `${col(h, 'Largo')}|${col(h, 'Ancho')}`))
  if (medidas.size < 2) continue
  estMixtas.set(e, (estMixtas.get(e) ?? 0) + 1)
}
console.log('Estructuras mixtas confirmadas por sus ranuras (hoja + fijo):')
for (const [e, n] of [...estMixtas.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)) {
  console.log(`  ${e.padEnd(10)} ${n}`)
}

// 2. Plantilla de la estructura mixta más frecuente (que no sea '0')
const eMix = [...estMixtas.entries()].filter(([e]) => e !== '0').sort((a, b) => b[1] - a[1])[0]?.[0]
const ejemplos = eMix
  ? padres.filter((p) => col(p, 'Articulo') === eMix).slice(0, 2)
  : []
if (eMix) {
  console.log(`\n=== Plantilla de ${eMix}: ranuras de cristal y hojas ===`)
  const CAMPOS = ['Articulo', 'Funcion', 'DisComponente', 'DisVidrio', 'DisTipoHoja', 'DisIdHoja', 'DisGrupo', 'DisIdIt', 'FormulaLargo', 'FormulaAncho', 'FormulaLargoCorte']
  console.log(CAMPOS.map((c) => c.slice(0, 11).padEnd(12)).join(''))
  for (const f of estArt) {
    if (col(f, 'TipoDoc')) continue
    if (col(f, 'Estructura') !== eMix) continue
    console.log(CAMPOS.map((c) => col(f, c).slice(0, 11).padEnd(12)).join(''))
  }
}

// 3. Documento real de esa estructura
for (const p of ejemplos.slice(0, 1)) {
  const serie = seriePorLinea.get(`${col(p, 'nDoc')}|${col(p, 'nLinea')}`)
  console.log(`\n=== Doc ${col(p, 'nDoc')} estructura ${col(p, 'Articulo')} serie ${serie} hueco ${col(p, 'Largo')}×${col(p, 'Ancho')} ===`)
  for (const h of hijasPorPadre.get(col(p, 'nLinea')) ?? []) {
    const art = col(h, 'Articulo')
    const a = porArt.get(art)
    const fn = col(h, 'Funcion')
    const esVidrio = a && col(a, 'Familia') === '050'
    if (!fn && !esVidrio) continue
    console.log(`  ${art.padEnd(12)} fn=${fn.padEnd(10)} x${col(h, 'Cdad').padEnd(3)} L=${col(h, 'Largo').padEnd(9)} A=${col(h, 'Ancho').padEnd(9)} corte=${col(h, 'LargoCorte').padEnd(9)} ${(a ? col(a, 'Descripcion') : '').slice(0, 32)}`)
  }
}

// 4. HipÃ³tesis medible: cada ranura de cristal declara su mÃ³dulo con
// FormulaLargo/FormulaAncho. En una instancia real, la diferencia entre ese
// mÃ³dulo y el vidrio es el descuento de galce propio de la ranura. Medimos si
// el par de descuentos es constante por estructura + serie + DisIdIt antes de
// plantear su uso en valoraciÃ³n.
function mejorEmparejamiento(modulos, vidrios) {
  if (modulos.length !== vidrios.length || modulos.length === 0 || modulos.length > 8) return null
  let mejor = null
  const usados = new Set()
  const pares = []
  const buscar = (i, error) => {
    if (mejor && error >= mejor.error) return
    if (i === modulos.length) {
      mejor = { error, pares: [...pares] }
      return
    }
    for (let j = 0; j < vidrios.length; j++) {
      if (usados.has(j)) continue
      usados.add(j)
      pares.push([modulos[i], vidrios[j]])
      const e = Math.abs(modulos[i].l - vidrios[j].l) + Math.abs(modulos[i].a - vidrios[j].a)
      buscar(i + 1, error + e)
      pares.pop()
      usados.delete(j)
    }
  }
  buscar(0, 0)
  return mejor
}

const gruposDelta = new Map()
const casosMedibles = []
for (const p of padres) {
  const estructura = col(p, 'Articulo')
  if (!estMixtas.has(estructura) || estructura === '0') continue
  const serie = seriePorLinea.get(`${col(p, 'nDoc')}|${col(p, 'nLinea')}`)
  const slots = plantillasVidrio.get(estructura) ?? []
  if (!serie || !slots.length) continue

  const contexto = {
    L: num(col(p, 'Largo')),
    A: num(col(p, 'Ancho')),
    ...(cotasPlantilla.get(estructura) ?? {}),
    ...(cotasInstancia.get(`${col(p, 'nDoc')}|${col(p, 'nLinea')}`) ?? {}),
  }
  const modulos = []
  try {
    for (const s of slots) {
      const fl = col(s, 'FormulaLargo')
      const fa = col(s, 'FormulaAncho')
      if (!fl || !fa) throw new Error('ranura sin dos fÃ³rmulas')
      modulos.push({
        slot: `${col(s, 'DisTipoHoja')}|${col(s, 'DisIdHoja')}|${col(s, 'DisGrupo')}|${col(s, 'DisIdIt')}`,
        fila: s,
        l: evaluar(fl, contexto),
        a: evaluar(fa, contexto),
      })
    }
  } catch { continue }

  const vidrios = []
  for (const h of hijasPorPadre.get(col(p, 'nLinea')) ?? []) {
    const a = porArt.get(col(h, 'Articulo'))
    if (!a || col(a, 'Familia') !== '050' || col(a, 'TipoMetraje') !== 'M2') continue
    const cantidad = Math.max(1, Math.round(num(col(h, 'Cdad'))))
    for (let i = 0; i < cantidad; i++) {
      vidrios.push({ l: num(col(h, 'Largo')), a: num(col(h, 'Ancho')), linea: col(h, 'nLinea') })
    }
  }
  const emp = mejorEmparejamiento(modulos, vidrios)
  if (!emp) continue
  const caso = {
    estructura, serie, pares: emp.pares, contexto,
    doc: col(p, 'nDoc'), linea: col(p, 'nLinea'),
    cotasDeInstancia: cotasInstancia.has(`${col(p, 'nDoc')}|${col(p, 'nLinea')}`),
    hijas: hijasPorPadre.get(col(p, 'nLinea')) ?? [],
  }
  casosMedibles.push(caso)
  for (const [m, v] of emp.pares) {
    const clave = `${estructura}|${serie}|${m.slot}`
    const delta = `${Math.round((m.l - v.l) * 10) / 10}|${Math.round((m.a - v.a) * 10) / 10}`
    const conteo = gruposDelta.get(clave) ?? new Map()
    conteo.set(delta, (conteo.get(delta) ?? 0) + 1)
    gruposDelta.set(clave, conteo)
  }
}

const reglasEstables = new Map()
let gruposInestables = 0
for (const [clave, conteo] of gruposDelta) {
  const total = [...conteo.values()].reduce((a, b) => a + b, 0)
  const [delta, n] = [...conteo.entries()].sort((a, b) => b[1] - a[1])[0]
  if (total >= 3 && n / total >= 0.9) reglasEstables.set(clave, delta.split('|').map(Number))
  else gruposInestables++
}
for (const caso of casosMedibles.filter((c) => c.estructura === '2OFI' && c.serie === 'ELEGANTPVC')) {
  for (const [m, v] of caso.pares) {
    if (col(m.fila, 'DisTipoHoja') !== '-1') continue
    const dl = Math.round((m.l - v.l) * 10) / 10
    if (dl !== 68.5) {
      console.log(`  muestra 2OFI irregular: doc=${caso.doc} linea=${caso.linea} FI=${caso.contexto.FI} instancia=${caso.cotasDeInstancia} modulo=${m.l} vidrio=${v.l} delta=${dl}`)
    }
  }
}

let reproducidos = 0
for (const caso of casosMedibles) {
  const completo = caso.pares.every(([m, v]) => {
    const regla = reglasEstables.get(`${caso.estructura}|${caso.serie}|${m.slot}`)
    return regla && Math.abs(m.l - regla[0] - v.l) <= 0.51 && Math.abs(m.a - regla[1] - v.a) <= 0.51
  })
  if (completo) reproducidos++
}

console.log('\n=== HipÃ³tesis ranura -> descuento medido ===')
console.log(`Casos mixtos emparejables por cantidad: ${casosMedibles.length}`)
console.log(`Reglas estables (n>=3, consistencia>=90%): ${reglasEstables.size}`)
console.log(`Grupos aÃºn inestables o con pocas muestras: ${gruposInestables}`)
console.log(`Casos reproducidos exactamente con reglas estables: ${reproducidos}/${casosMedibles.length}`)
for (const [clave, delta] of [...reglasEstables.entries()].slice(0, 12)) {
  console.log(`  ${clave} -> delta ${delta[0]} / ${delta[1]} mm`)
}
for (const [clave, conteo] of gruposDelta) {
  if (!clave.startsWith('2OFI|ELEGANTPVC|-1|')) continue
  console.log(`  detalle ${clave}: ${[...conteo.entries()].sort((a, b) => b[1] - a[1]).map(([d, n]) => `${d} (${n})`).join(', ')}`)
}

// 5. LÃ­mites fÃ­sicos de los huecos fijos.
//
// EstructurasDiseÃ±o forma un Ã¡rbol: marco (Tipo=1), divisiones/travesaÃ±os
// (Tipo=6), huecos resultantes (Tipo=2), hojas (Tipo=3) y vidrios (Tipo=5).
// Un hueco conoce el travesaÃ±o que lo generÃ³ (idTrav) y el lado (posHueco).
// Con eso reconstruimos sus cuatro bordes y medimos el descuento por PAREJA
// DE PERFILES, no por cÃ³digo de estructura.
function limitesDeContenedor(estructura, id, visitados = new Set()) {
  const porId = disenyoPorEstructura.get(estructura)
  const nodo = porId?.get(String(id))
  if (!nodo || visitados.has(String(id))) return null
  visitados.add(String(id))

  if (col(nodo, 'Tipo') === '1') {
    return {
      sup: { clase: 'M', orientacion: 'H', id: '0' },
      inf: { clase: 'M', orientacion: 'H', id: '0' },
      izq: { clase: 'M', orientacion: 'V', id: '0' },
      der: { clase: 'M', orientacion: 'V', id: '0' },
    }
  }
  if (col(nodo, 'Tipo') !== '2') return null

  const padreId = col(nodo, 'ContenidoEn')
  const limites = limitesDeContenedor(estructura, padreId, visitados)
  if (!limites) return null
  const travId = col(nodo, 'idTrav')
  const trav = porId?.get(travId)
  if (!trav || col(trav, 'Tipo') !== '6') return limites
  const tipoTrav = col(trav, 'TipoTrav').toUpperCase()
  const pos = col(nodo, 'posHueco')
  const borde = {
    clase: col(trav, 'bInvisible') === 'True' ? 'I' : 'T',
    orientacion: tipoTrav.startsWith('H') ? 'H' : 'V', id: travId,
    tipoTrav,
  }
  if (borde.orientacion === 'H') {
    if (pos === '1') limites.inf = borde
    else if (pos === '2') limites.sup = borde
  } else {
    if (pos === '1') limites.der = borde
    else if (pos === '2') limites.izq = borde
  }
  return limites
}

function limitesDeVidrioFijo(estructura, filaSlot) {
  const porId = disenyoPorEstructura.get(estructura)
  const vidrio = porId?.get(col(filaSlot, 'DisIdIt'))
  if (!vidrio || col(vidrio, 'Tipo') !== '5') return null
  return limitesDeContenedor(estructura, col(vidrio, 'ContenidoEn'))
}

function articuloDeLimite(caso, limite) {
  if (limite.clase === 'I') return `@INVISIBLE:${limite.tipoTrav}`
  if (limite.clase === 'M') {
    const funcion = limite.orientacion === 'V' ? 'MV' : 'MH'
    const arts = new Set(caso.hijas
      .filter((h) => col(h, 'Funcion') === funcion && col(h, 'Articulo') !== '0')
      .map((h) => col(h, 'Articulo')))
    return arts.size === 1 ? [...arts][0] : null
  }

  const candidatos = estArt.filter((f) =>
    !col(f, 'TipoDoc') && col(f, 'Estructura') === caso.estructura &&
    col(f, 'DisIdIt') === limite.id && col(f, 'Funcion') === 'TM')
  const encontrados = new Set()
  for (const c of candidatos) {
    const formula = col(c, 'FormulaLargoCorte') || col(c, 'FormulaLargo')
    if (!formula) continue
    let largo
    try { largo = evaluar(formula, caso.contexto) } catch { continue }
    for (const h of caso.hijas) {
      if (col(h, 'Funcion') !== 'TM' || col(h, 'Articulo') === '0') continue
      if (Math.abs(num(col(h, 'LargoCorte')) - largo) <= 0.51) encontrados.add(col(h, 'Articulo'))
    }
  }
  // La fÃ³rmula de plantilla expresa el mÃ³dulo; el perfil real del travesaÃ±o
  // puede llevar descuentos de encuentro y no coincidir en largo. Si todo el
  // documento usa un Ãºnico artÃ­culo TM, la identificaciÃ³n sigue siendo
  // inequÃ­voca. Con varios artÃ­culos no se adivina.
  if (encontrados.size === 0) {
    const todosTm = new Set(caso.hijas
      .filter((h) => col(h, 'Funcion') === 'TM' && col(h, 'Articulo') !== '0')
      .map((h) => col(h, 'Articulo')))
    if (todosTm.size === 1) return [...todosTm][0]
  }
  return encontrados.size === 1 ? [...encontrados][0] : null
}

const deltasPorPareja = new Map()
let fijosConLimites = 0
let fijosSinPerfil = 0
for (const caso of casosMedibles) {
  for (const [m, v] of caso.pares) {
    if (col(m.fila, 'DisTipoHoja') !== '-1') continue
    const limites = limitesDeVidrioFijo(caso.estructura, m.fila)
    if (!limites) continue
    const perfiles = {
      sup: articuloDeLimite(caso, limites.sup), inf: articuloDeLimite(caso, limites.inf),
      izq: articuloDeLimite(caso, limites.izq), der: articuloDeLimite(caso, limites.der),
    }
    if (Object.values(perfiles).some((x) => !x)) { fijosSinPerfil++; continue }
    fijosConLimites++
    const registrar = (eje, a, b, delta) => {
      const pareja = [a, b].sort().join('+')
      const clave = `${eje}|${pareja}`
      const valor = Math.round(delta * 10) / 10
      const conteo = deltasPorPareja.get(clave) ?? new Map()
      conteo.set(valor, (conteo.get(valor) ?? 0) + 1)
      deltasPorPareja.set(clave, conteo)
    }
    registrar('L', perfiles.sup, perfiles.inf, m.l - v.l)
    registrar('A', perfiles.izq, perfiles.der, m.a - v.a)
  }
}

let parejasEstables = 0
let observacionesEstables = 0
console.log('\n=== Descuento por perfiles que delimitan el fijo ===')
console.log(`Vidrios fijos con cuatro perfiles identificados: ${fijosConLimites}`)
console.log(`Vidrios fijos descartados por perfil ambiguo: ${fijosSinPerfil}`)
for (const [clave, conteo] of [...deltasPorPareja.entries()].sort((a, b) => {
  const ta = [...a[1].values()].reduce((x, y) => x + y, 0)
  const tb = [...b[1].values()].reduce((x, y) => x + y, 0)
  return tb - ta
})) {
  const total = [...conteo.values()].reduce((a, b) => a + b, 0)
  const [delta, n] = [...conteo.entries()].sort((a, b) => b[1] - a[1])[0]
  const pct = n / total
  if (total >= 3 && pct >= 0.9) { parejasEstables++; observacionesEstables += n }
  console.log(`  ${clave.padEnd(32)} delta=${String(delta).padStart(6)} n=${String(n).padStart(3)}/${String(total).padEnd(3)} ${Math.round(pct * 100)}%`)
}
console.log(`Parejas estables (n>=3, >=90%): ${parejasEstables}; observaciones cubiertas: ${observacionesEstables}/${fijosConLimites * 2}`)

// 6. Firma completa del alojamiento: perfiles exteriores que delimitan el
// hueco y, cuando hay hoja, su perfil horizontal/vertical. VDatosLinDetDis
// enlaza la pieza histÃ³rica real con DisIdIt, evitando asignar perfiles por
// proximidad cuando una estructura tiene varias hojas distintas.
function alojamientoDeSlot(estructura, filaSlot) {
  const porId = disenyoPorEstructura.get(estructura)
  const vidrio = porId?.get(col(filaSlot, 'DisIdIt'))
  if (!vidrio || col(vidrio, 'Tipo') !== '5') return null
  const padre = porId?.get(col(vidrio, 'ContenidoEn'))
  if (!padre) return null
  if (col(padre, 'Tipo') === '3') {
    return { huecoId: col(padre, 'ContenidoEn'), hojaId: col(padre, 'Id') }
  }
  if (col(padre, 'Tipo') === '2') return { huecoId: col(padre, 'Id'), hojaId: null }
  return null
}

function perfilHoja(caso, hojaId, funcion) {
  const exactos = new Set()
  for (const h of caso.hijas) {
    if (col(h, 'Funcion') !== funcion || col(h, 'Articulo') === '0') continue
    const det = detallePorLinea.get(col(h, 'nLinea'))
    if (det && col(det, 'DisIdIt') === hojaId && col(det, 'DisGrupo') === 'HP') {
      exactos.add(col(h, 'Articulo'))
    }
  }
  if (exactos.size === 1) return [...exactos][0]
  if (exactos.size > 1) return null
  const componentes = new Set(estArt
    .filter((f) => !col(f, 'TipoDoc') && col(f, 'Estructura') === caso.estructura &&
      col(f, 'DisIdIt') === hojaId && col(f, 'Funcion') === funcion && col(f, 'DisGrupo') === 'HP')
    .map((f) => col(f, 'DisComponente')).filter(Boolean))
  const resueltos = new Set()
  for (const componente of componentes) {
    for (const art of resolucionDirecta.get(`${caso.serie}|${componente}`) ?? []) resueltos.add(art)
  }
  if (resueltos.size === 1) return [...resueltos][0]
  if (resueltos.size > 1) return null
  const globales = new Set(caso.hijas
    .filter((h) => col(h, 'Funcion') === funcion && col(h, 'Articulo') !== '0')
    .map((h) => col(h, 'Articulo')))
  return globales.size === 1 ? [...globales][0] : null
}

const deltasPorAlojamiento = new Map()
const observacionesAlojamiento = []
const descartesAlojamiento = { sinAlojamiento: 0, sinLimites: 0, sinPerfilExterior: 0, sinPerfilHoja: 0, hojas: 0, fijos: 0 }
for (const caso of casosMedibles) {
  for (const [m, v] of caso.pares) {
    const alojamiento = alojamientoDeSlot(caso.estructura, m.fila)
    if (!alojamiento) { descartesAlojamiento.sinAlojamiento++; continue }
    const limites = limitesDeContenedor(caso.estructura, alojamiento.huecoId)
    if (!limites) { descartesAlojamiento.sinLimites++; continue }
    const perfiles = {
      sup: articuloDeLimite(caso, limites.sup), inf: articuloDeLimite(caso, limites.inf),
      izq: articuloDeLimite(caso, limites.izq), der: articuloDeLimite(caso, limites.der),
    }
    if (Object.values(perfiles).some((x) => !x)) { descartesAlojamiento.sinPerfilExterior++; continue }
    const hh = alojamiento.hojaId ? perfilHoja(caso, alojamiento.hojaId, 'HH') : null
    const hv = alojamiento.hojaId ? perfilHoja(caso, alojamiento.hojaId, 'HV') : null
    if (alojamiento.hojaId && (!hh || !hv)) { descartesAlojamiento.sinPerfilHoja++; continue }
    if (alojamiento.hojaId) descartesAlojamiento.hojas++
    else descartesAlojamiento.fijos++
    const firmaL = `${[perfiles.sup, perfiles.inf].sort().join('+')}${hh ? `|HH:${hh}` : '|FIJO'}`
    const firmaA = `${[perfiles.izq, perfiles.der].sort().join('+')}${hv ? `|HV:${hv}` : '|FIJO'}`
    for (const [eje, firma, delta] of [
      ['L', firmaL, m.l - v.l], ['A', firmaA, m.a - v.a],
    ]) {
      const clave = `${eje}|${firma}`
      const valor = Math.round(delta * 10) / 10
      const conteo = deltasPorAlojamiento.get(clave) ?? new Map()
      conteo.set(valor, (conteo.get(valor) ?? 0) + 1)
      deltasPorAlojamiento.set(clave, conteo)
      observacionesAlojamiento.push({ caso, m, v, clave, valor })
    }
  }
}

const reglasAlojamiento = new Map()
for (const [clave, conteo] of deltasPorAlojamiento) {
  const total = [...conteo.values()].reduce((a, b) => a + b, 0)
  const [delta, n] = [...conteo.entries()].sort((a, b) => b[1] - a[1])[0]
  if (total >= 3 && n / total >= 0.9) reglasAlojamiento.set(clave, { delta, n, total })
}
const casosConObservaciones = new Map()
for (const o of observacionesAlojamiento) {
  const lista = casosConObservaciones.get(o.caso) ?? []
  lista.push(o)
  casosConObservaciones.set(o.caso, lista)
}
let casosExactosAlojamiento = 0
for (const [caso, obs] of casosConObservaciones) {
  if (obs.length !== caso.pares.length * 2) continue
  if (obs.every((o) => reglasAlojamiento.get(o.clave)?.delta === o.valor)) casosExactosAlojamiento++
}
const obsCubiertas = observacionesAlojamiento.filter((o) => reglasAlojamiento.get(o.clave)?.delta === o.valor).length
console.log('\n=== Firma completa: lÃ­mites exteriores + perfil de hoja ===')
console.log(`Observaciones con firma inequÃ­voca: ${observacionesAlojamiento.length}`)
console.log(`Slots incluidos: hojas=${descartesAlojamiento.hojas}, fijos=${descartesAlojamiento.fijos}; descartes=${JSON.stringify(descartesAlojamiento)}`)
console.log(`Reglas estables: ${reglasAlojamiento.size}`)
console.log(`Observaciones reproducidas: ${obsCubiertas}/${observacionesAlojamiento.length}`)
console.log(`Casos mixtos completos reproducidos: ${casosExactosAlojamiento}/${casosMedibles.length}`)
for (const [clave, r] of [...reglasAlojamiento.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 20)) {
  console.log(`  ${clave} -> ${r.delta} mm (${r.n}/${r.total})`)
}
