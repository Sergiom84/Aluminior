import type { Sql } from 'postgres'
import type { ContextoGalce } from './contexto-galce.ts'
import { excluir, type Resultado } from './resultado.ts'

export async function cargarGalceFijos(sql: Sql, contexto: ContextoGalce): Promise<Resultado[]> {
  const { padres, grupos, famArt, junquilloEsperadoFijo } = contexto
  const resultados: Resultado[] = []
  // --- FIJOS (anexo N): mismo método sobre líneas SIN hojas ---
  // El vidrio del fijo se descuenta del corte del CERCO, con el mismo delta
  // en ambas dimensiones; el junquillo sale de TablaFijos con sus propios
  // ajustes. Para los ajustes se omiten vidrios casi cuadrados
  // (|largo−ancho| < 60 mm): la asignación de cada corte a una dimensión
  // sería ambigua y contaminaría la moda.
  const rgf: Resultado = {
    tabla: 'vidrio_galce_fijo', leidas: 0, insertadas: 0, descartadas: 0,
    excluidas: 0, motivos: new Map(),
  }
  const rjf: Resultado = {
    tabla: 'junquillo_ajustes_fijo', leidas: 0, insertadas: 0, descartadas: 0,
    excluidas: 0, motivos: new Map(),
  }
  const deltasFijo = new Map<string, Map<number, number>>()
  const ajustesFijo = new Map<string, { largo: Map<number, number>; ancho: Map<number, number> }>()
  for (const [nLinea, serie] of padres) {
    const g = grupos.get(nLinea)
    if (!g || g.hv.size > 0) continue // tiene hojas: no es un fijo puro
    if (g.mv.size !== 1 || g.mh.size !== 1 || g.artMV.size !== 1) continue
    if (!g.vidrios.length) continue
    const medidas = new Set(g.vidrios.map((v) => `${v.l}|${v.a}`))
    if (medidas.size !== 1) continue
    const v = g.vidrios[0]
    if (v.l <= 0 || v.a <= 0) continue

    const dL = [...g.mv][0] - v.l
    const dA = [...g.mh][0] - v.a
    if (Math.abs(dL - dA) < 0.51 && dL >= 0 && dL < 200) {
      const clave = `${serie}|${[...g.artMV][0]}`
      const delta = Math.round(dL * 10) / 10
      let m = deltasFijo.get(clave)
      if (!m) deltasFijo.set(clave, (m = new Map()))
      m.set(delta, (m.get(delta) ?? 0) + 1)
      rgf.leidas++
    }

    const tamJunq = famArt.get(v.art)?.tamJunq ?? 0
    if (!tamJunq || Math.abs(v.l - v.a) < 60) continue
    const junq = junquilloEsperadoFijo(serie, tamJunq)
    if (!junq) continue
    let acc = ajustesFijo.get(serie)
    if (!acc) ajustesFijo.set(serie, (acc = { largo: new Map(), ancho: new Map() }))
    for (const corte of g.cortes.get(junq) ?? []) {
      const jL = Math.round((corte - v.l) * 10) / 10
      const jA = Math.round((corte - v.a) * 10) / 10
      if (Math.abs(jL) > 100 && Math.abs(jA) > 100) continue
      const esL = Math.abs(jL) <= Math.abs(jA)
      const mapa = esL ? acc.largo : acc.ancho
      mapa.set(esL ? jL : jA, (mapa.get(esL ? jL : jA) ?? 0) + 1)
    }
  }
  const filasGalceFijo: Record<string, unknown>[] = []
  for (const [clave, conteo] of deltasFijo) {
    const total = [...conteo.values()].reduce((a, b) => a + b, 0)
    const [delta, n] = [...conteo.entries()].sort((a, b) => b[1] - a[1])[0]
    if (total < 3 || n / total < 0.9) {
      excluir(rgf, 'muestras insuficientes o inconsistentes: no se emite')
      continue
    }
    const [serie, perfil] = clave.split('|')
    filasGalceFijo.push({ serie_codigo: serie, perfil_codigo: perfil, delta_mm: delta, muestras: n })
  }
  if (filasGalceFijo.length) {
    await sql`INSERT INTO vidrio_galce_fijo ${sql(filasGalceFijo)} ON CONFLICT DO NOTHING`
    rgf.insertadas = filasGalceFijo.length
  }
  resultados.push(rgf)

  const filasAjusteFijo: Record<string, unknown>[] = []
  for (const [serie, acc] of ajustesFijo) {
    const moda = (m: Map<number, number>) => {
      const total = [...m.values()].reduce((a, b) => a + b, 0)
      if (!total) return null
      const [valor, n] = [...m.entries()].sort((a, b) => b[1] - a[1])[0]
      return { valor, n, total }
    }
    const mL = moda(acc.largo), mA = moda(acc.ancho)
    rjf.leidas++
    if (!mL || !mA || mL.total < 3 || mA.total < 3 || mL.n / mL.total < 0.9 || mA.n / mA.total < 0.9) {
      excluir(rjf, 'muestras insuficientes o inconsistentes: no se emite')
      continue
    }
    filasAjusteFijo.push({
      serie_codigo: serie,
      ajuste_largo_mm: mL.valor,
      ajuste_ancho_mm: mA.valor,
      muestras: Math.min(mL.n, mA.n),
    })
  }
  if (filasAjusteFijo.length) {
    await sql`INSERT INTO junquillo_ajustes_fijo ${sql(filasAjusteFijo)} ON CONFLICT DO NOTHING`
    rjf.insertadas = filasAjusteFijo.length
  }
  resultados.push(rjf)
  return resultados
}
