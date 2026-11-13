/** Valora cada GRUPO real con el servicio de la web (Postgres local) y lo clasifica. */
import { asegurarCatalogoDiseno, type ClienteEscritura } from '@aluminior/web/banco-contraste'
import { ejecutarServicio, type SalidaServicio } from '../banco-contraste/servicio-web.ts'
import { diagnosticar, precioComparable } from '../banco-contraste/comparar.ts'
import { si, texto, type Caso } from '../banco-contraste/datos.ts'
import { analizarReparto, type AnalisisReparto } from './uniones.ts'
import { prepararVariante, esperadoResto, descontarCajon } from './variantes.ts'
import { clavePlantilla } from './plantillas-documento.ts'
import type { FilaPlantillaCatalogo } from '@aluminior/core/despiece'
import { clasificarGrupo, type Clasificacion, type EntradaClasificacion, type Valoracion } from './clasificar.ts'

export interface ContrasteGrupo {
  id: string; documento: string; fecha: string; nuevo: boolean; cantidad: number; esperado: number
  modulos: string[]; uniones: string[]; serie: string | null; vidrio: string | null; acabado: string
  compacto: boolean; invisible: boolean; especificos: number; reconciliado: boolean
  guardadas: number | null; nominales: number | null; clasificacion: Clasificacion; reparto: AnalisisReparto
  /** Motivos y avisos del servicio para la valoración con medidas guardadas. */
  motivos: string[]
  /** Entrada de la clasificación: permite reclasificar sin volver a valorar. */
  entrada: EntradaClasificacion
}

async function valorar(db: ClienteEscritura, c: Caso, medidas: 'linea' | 'nominal'): Promise<{ v: Valoracion; s: SalidaServicio | null }> {
  try {
    const s = await ejecutarServicio(db, c, medidas)
    const precio = precioComparable(s.precio, s.motivos)
    const causas = precio !== null && s.piezas.length ? diagnosticar(c.piezas, s.piezas).causas : []
    return { v: { precio, causas, motivos: s.motivos, avisos: s.avisos }, s }
  } catch (error) {
    return { v: { precio: null, causas: [], motivos: ['error-del-servicio'], avisos: [error instanceof Error ? error.message : String(error)] }, s: null }
  }
}

export async function contrastarGrupos(db: ClienteEscritura, casos: Caso[], nuevos: (c: Caso) => boolean,
  plantillas: ReadonlyMap<string, readonly FilaPlantillaCatalogo[]> = new Map()) {
  // Plantillas del catálogo importado, como la web: sin ellas solo se dibujan las verificadas.
  await asegurarCatalogoDiseno(db)
  const salida: ContrasteGrupo[] = []
  for (const [i, c] of casos.entries()) {
    const v = prepararVariante(conPlantillasPropias(c, plantillas)), reparto = analizarReparto(c)
    let guardadas: Valoracion = { precio: null, causas: [], motivos: [], avisos: [] }, nominales: Valoracion | null = null, invisible: number | null = null
    if (!v.bloqueos.length) {
      const a = await valorar(db, v.variante, 'linea'); guardadas = a.v
      if (guardadas.precio !== null) {
        nominales = (await valorar(db, descontarCajon(v.variante, reparto.piezas), 'nominal')).v
        const origenes = a.s?.origenes ?? []
        // Con comisión de cabecera el módulo no se puede aislar del total: no se atribuye.
        const importes = v.invisibles.map(id => origenes.find(o => o.id === id)?.importe ?? null)
        invisible = !v.invisibles.length ? 0 : c.comision || importes.some(x => x === null) ? null
          : importes.reduce<number>((s, x) => s + x!, 0)
      }
    }
    const entrada: EntradaClasificacion = { bloqueos: v.bloqueos, esperado: c.esperado!, esperadoResto: esperadoResto(c, v),
      compacto: v.compactos.importe, tapajuntas: v.tapajuntas.importe, invisible, invisibles: v.invisibles.length,
      especificos: v.especificos, guardadas: recortar(guardadas), nominales: nominales && recortar(nominales) }
    const clasificacion = clasificarGrupo(entrada)
    const geo = c.geometria ?? []
    salida.push({ id: c.id, documento: texto(c.padre.nDoc), fecha: c.fecha.slice(0, 10), nuevo: nuevos(c), cantidad: c.cantidad!, esperado: c.esperado!,
      modulos: geo.filter(g => !si(g.EsUnionSN)).map(g => texto(g.CodEstr)), uniones: geo.filter(g => si(g.EsUnionSN)).map(g => texto(g.CodEstr)),
      serie: v.variante.elementos?.find(e => e.serie)?.serie ?? null, vidrio: v.variante.elementos?.find(e => e.vidrio)?.vidrio ?? null,
      acabado: texto(c.padre.Acabado) || texto(v.variante.elementos?.[0]?.padre.Acabado),
      compacto: v.compactos.elementos > 0, invisible: v.invisibles.length > 0, especificos: v.especificos, reconciliado: v.reconciliado,
      guardadas: guardadas.precio, nominales: nominales?.precio ?? null, clasificacion, reparto,
      motivos: [...v.bloqueos, ...guardadas.motivos, ...guardadas.avisos.slice(0, 5)], entrada })
    if ((i + 1) % 25 === 0) console.log(`GRUPO ${i + 1}/${casos.length}; sin escrituras`)
  }
  return salida
}

/** Adjunta a cada elemento con diseño específico la plantilla que Productor guardó con el documento. */
export function conPlantillasPropias(c: Caso, plantillas: ReadonlyMap<string, readonly FilaPlantillaCatalogo[]>): Caso {
  const propias = Object.fromEntries((c.geometria ?? []).flatMap(g => {
    const p = si(g.DisEspecificoSN) && !si(g.EsUnionSN) ? plantillas.get(clavePlantilla(c.padre.nDoc, g.nLinEstr)) : undefined
    return p?.length ? [[texto(g.nLinEstr), p]] : []
  }))
  return Object.keys(propias).length ? { ...c, plantillasPropias: propias } : c
}

const recortar = (v: Valoracion): Valoracion => ({ ...v, avisos: [...new Set(v.avisos)].slice(0, 20) })
