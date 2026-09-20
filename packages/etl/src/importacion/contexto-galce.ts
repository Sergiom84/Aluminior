import { leerLotes, rutaTabla } from '../csv.ts'

export async function leerContextoGalce(ORIGEN: string) {
  const aNum = (v: string | undefined) => Number((v ?? '').replace(',', '.')) || 0

  // Familia, tipo de metraje y tamaño de junquillo/goma por artículo
  const famArt = new Map<string, { familia: string; m2: boolean; tamJunq: number }>()
  for await (const lote of leerLotes(rutaTabla(ORIGEN, 'Articulos')!, 1000)) {
    for (const f of lote) {
      famArt.set((f.Codigo ?? '').trim(), {
        familia: (f.Familia ?? '').trim(),
        m2: (f.TipoMetraje ?? '').trim() === 'M2',
        tamJunq: Number((f.TamJunqGoma ?? '').replace(',', '.')) || 0,
      })
    }
  }
  // TablaHojas por conjunto y filas de acristalamiento, para saber qué
  // junquillo esperar en cada línea (anexo M).
  const tablaHojasPorConjunto = new Map<string, string>()
  const tablaFijosPorConjunto = new Map<string, string>()
  for await (const lote of leerLotes(rutaTabla(ORIGEN, 'Conjuntos')!, 1000)) {
    for (const f of lote) {
      tablaHojasPorConjunto.set((f.Codigo ?? '').trim(), (f.TablaHojas ?? '').trim())
      tablaFijosPorConjunto.set((f.Codigo ?? '').trim(), (f.TablaFijos ?? '').trim())
    }
  }
  const filasTacris = new Map<string, { grosor: number; junq: string }[]>()
  for await (const lote of leerLotes(rutaTabla(ORIGEN, 'TAcristalamientoLin')!, 1000)) {
    for (const f of lote) {
      const t = (f.TAcris ?? '').trim()
      if (!filasTacris.has(t)) filasTacris.set(t, [])
      filasTacris.get(t)!.push({
        grosor: Number((f.Grosor ?? '').replace(',', '.')) || 0,
        junq: (f.Junquillo ?? '').trim(),
      })
    }
  }
  for (const lista of filasTacris.values()) lista.sort((a, b) => a.grosor - b.grosor)
  const junquilloDeTabla = (tabla: string | undefined, tamJunq: number): string | null => {
    const lista = filasTacris.get(tabla ?? '') ?? []
    for (const f of lista) {
      if (f.grosor >= tamJunq - 1e-9) return f.junq && f.junq !== '0' ? f.junq : null
    }
    return null
  }
  const junquilloEsperado = (serie: string, tamJunq: number): string | null =>
    junquilloDeTabla(tablaHojasPorConjunto.get(serie), tamJunq)
  const junquilloEsperadoFijo = (serie: string, tamJunq: number): string | null =>
    junquilloDeTabla(tablaFijosPorConjunto.get(serie), tamJunq)
  // Serie por línea de documento
  const seriePorLinea = new Map<string, string>()
  for await (const lote of leerLotes(rutaTabla(ORIGEN, 'VDatosLinEstr')!, 1000)) {
    for (const f of lote) {
      seriePorLinea.set(`${(f.nVDoc ?? '').trim()}|${(f.nVLinea ?? '').trim()}`, (f.Conjunto1 ?? '').trim())
    }
  }
  // Agrupar hijas por línea padre
  interface Hoja {
    hv: Set<number>; hh: Set<number>; artHV: Set<string>
    mv: Set<number>; mh: Set<number>; artMV: Set<string>
    vidrios: { l: number; a: number; art: string }[]
    cortes: Map<string, number[]>
  }
  const padres = new Map<string, string>() // nLinea -> serie
  const grupos = new Map<string, Hoja>()
  for await (const lote of leerLotes(rutaTabla(ORIGEN, 'VPresupuestosLin')!, 1000)) {
    for (const f of lote) {
      if ((f.EstructuraSN ?? '').trim() === 'True') {
        const serie = seriePorLinea.get(`${(f.nDoc ?? '').trim()}|${(f.nLinea ?? '').trim()}`)
        if (serie) padres.set((f.nLinea ?? '').trim(), serie)
        continue
      }
      const nEstr = (f.nEstr ?? '').trim()
      if (!nEstr || nEstr === '0') continue
      let g = grupos.get(nEstr)
      if (!g) grupos.set(nEstr, (g = { hv: new Set(), hh: new Set(), artHV: new Set(), mv: new Set(), mh: new Set(), artMV: new Set(), vidrios: [], cortes: new Map() }))
      const fn = (f.Funcion ?? '').trim()
      const art = (f.Articulo ?? '').trim()
      if (fn === 'HV') {
        g.hv.add(aNum(f.LargoCorte))
        if (art && art !== '0') g.artHV.add(art)
      } else if (fn === 'HH') {
        g.hh.add(aNum(f.LargoCorte))
      } else if (fn === 'MV') {
        g.mv.add(aNum(f.LargoCorte))
        if (art && art !== '0') g.artMV.add(art)
        if (art && art !== '0') {
          const lista = g.cortes.get(art) ?? []
          lista.push(aNum(f.LargoCorte))
          g.cortes.set(art, lista)
        }
      } else if (fn === 'MH') {
        g.mh.add(aNum(f.LargoCorte))
      } else {
        const info = famArt.get(art)
        if (info?.familia === '050' && info.m2) {
          g.vidrios.push({ l: aNum(f.Largo), a: aNum(f.Ancho), art })
        } else if (art && art !== '0') {
          const lista = g.cortes.get(art) ?? []
          lista.push(aNum(f.LargoCorte))
          g.cortes.set(art, lista)
        }
      }
    }
  }

  return { padres, grupos, famArt, junquilloEsperado, junquilloEsperadoFijo }
}

export type ContextoGalce = Awaited<ReturnType<typeof leerContextoGalce>>
