import type { Sql } from 'postgres'
import type { ContextoGalce } from './contexto-galce.ts'
import { excluir, type Resultado } from './resultado.ts'

export async function cargarGalceHojas(sql: Sql, contexto: ContextoGalce, r: Resultado): Promise<Resultado[]> {
  const { padres, grupos, famArt, junquilloEsperado } = contexto
  const resultados: Resultado[] = []
  // Deltas por (serie, perfil)
  const muestras = new Map<string, Map<number, number>>()
  for (const [nLinea, serie] of padres) {
    const g = grupos.get(nLinea)
    if (!g || g.hv.size !== 1 || g.hh.size < 1 || g.artHV.size !== 1 || !g.vidrios.length) continue
    const medidas = new Set(g.vidrios.map((v) => `${v.l}|${v.a}`))
    if (medidas.size !== 1) continue
    const v = g.vidrios[0]
    if (v.l <= 0 || v.a <= 0) continue
    const delta = Math.round(([...g.hv][0] - v.l) * 10) / 10
    if (delta < 0 || delta > 200) continue
    const clave = `${serie}|${[...g.artHV][0]}`
    let m = muestras.get(clave)
    if (!m) muestras.set(clave, (m = new Map()))
    m.set(delta, (m.get(delta) ?? 0) + 1)
    r.leidas++
  }
  const filas: Record<string, unknown>[] = []
  for (const [clave, conteo] of muestras) {
    const total = [...conteo.values()].reduce((a, b) => a + b, 0)
    const [delta, n] = [...conteo.entries()].sort((a, b) => b[1] - a[1])[0]
    if (total < 3 || n / total < 0.9) {
      excluir(r, 'muestras insuficientes o inconsistentes: no se emite')
      continue
    }
    const [serie, perfil] = clave.split('|')
    filas.push({ serie_codigo: serie, perfil_codigo: perfil, delta_mm: delta, muestras: n })
  }
  if (filas.length) {
    await sql`INSERT INTO vidrio_galce ${sql(filas)} ON CONFLICT DO NOTHING`
    r.insertadas = filas.length
  }

  // --- Ajustes de longitud del junquillo, con los mismos datos (anexo M) ---
  // Cada corte del junquillo esperado se asigna a la dimensión del vidrio
  // más próxima; el ajuste es la diferencia. Se emite la moda por serie si
  // hay ≥3 muestras y ≥90% de consistencia en ambas dimensiones.
  const ajustes = new Map<string, { largo: Map<number, number>; ancho: Map<number, number> }>()
  for (const [nLinea, serie] of padres) {
    const g = grupos.get(nLinea)
    if (!g || !g.vidrios.length) continue
    const artsVid = new Set(g.vidrios.map((v) => v.art))
    if (artsVid.size !== 1) continue
    const medidas = new Set(g.vidrios.map((v) => `${v.l}|${v.a}`))
    if (medidas.size !== 1) continue
    const v = g.vidrios[0]
    if (v.l <= 0 || v.a <= 0) continue
    const tamJunq = famArt.get(v.art)?.tamJunq ?? 0
    if (!tamJunq) continue
    const junq = junquilloEsperado(serie, tamJunq)
    if (!junq) continue
    const cortes = g.cortes.get(junq) ?? []
    let acc = ajustes.get(serie)
    if (!acc) ajustes.set(serie, (acc = { largo: new Map(), ancho: new Map() }))
    for (const corte of cortes) {
      const dL = Math.round((corte - v.l) * 10) / 10
      const dA = Math.round((corte - v.a) * 10) / 10
      if (Math.abs(dL) > 100 && Math.abs(dA) > 100) continue
      const mapa = Math.abs(dL) <= Math.abs(dA) ? acc.largo : acc.ancho
      const d = Math.abs(dL) <= Math.abs(dA) ? dL : dA
      mapa.set(d, (mapa.get(d) ?? 0) + 1)
    }
  }
  const rj: Resultado = {
    tabla: 'junquillo_ajustes', leidas: 0, insertadas: 0, descartadas: 0,
    excluidas: 0, motivos: new Map(),
  }
  const filasAjuste: Record<string, unknown>[] = []
  for (const [serie, acc] of ajustes) {
    const moda = (m: Map<number, number>) => {
      const total = [...m.values()].reduce((a, b) => a + b, 0)
      if (!total) return null
      const [valor, n] = [...m.entries()].sort((a, b) => b[1] - a[1])[0]
      return { valor, n, total }
    }
    const mL = moda(acc.largo), mA = moda(acc.ancho)
    rj.leidas++
    if (!mL || !mA || mL.total < 3 || mA.total < 3 || mL.n / mL.total < 0.9 || mA.n / mA.total < 0.9) {
      excluir(rj, 'muestras insuficientes o inconsistentes: no se emite')
      continue
    }
    filasAjuste.push({
      serie_codigo: serie,
      ajuste_largo_mm: mL.valor,
      ajuste_ancho_mm: mA.valor,
      muestras: Math.min(mL.n, mA.n),
    })
  }
  if (filasAjuste.length) {
    await sql`INSERT INTO junquillo_ajustes ${sql(filasAjuste)} ON CONFLICT DO NOTHING`
    rj.insertadas = filasAjuste.length
  }
  resultados.push(rj)


  return resultados
}
