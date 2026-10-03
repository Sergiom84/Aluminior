/**
 * Estructuras de diseño: ranuras resueltas por la serie, medidas de la
 * plantilla, asociaciones por ámbito, vidrio y mano de obra de fabricación.
 */

import { medirPlantilla, type FilaMedible } from '../medidas-plantilla.ts'
import {
  clavesTipoHoja, construirAmbitos, esTipoHojaMarco, evaluarAsociaciones, opcionesMarcadas,
  type ElementoPlantilla,
} from '../asociaciones/index.ts'
import { minutosFabricacion } from '../mano-obra-fabricacion.ts'
import type { VarianteAcristalamiento } from '../../series/resolver.ts'
import { fila, parcialVacio, type DespieceParcial } from './parcial.ts'
import { despiezarVidrios } from './vidrios.ts'
import type { ArticuloCatalogo, CatalogoLinea, EntradaLineaCatalogo, FilaPlantillaCatalogo, SerieCatalogo } from './tipos.ts'

const COMPONENTE_VIDRIO = '1'
/** Informativos y accesorios de diseño: describen, nunca son material propio. */
const sinMaterial = (f: FilaPlantillaCatalogo) => /^(inf|Acc)/.test(f.funcion ?? '')

/** Variante de perfil de hoja por el grosor del vidrio (CHM 5.1.2.12.3.2). */
export function varianteAcristalamiento(serie: SerieCatalogo, vidrio: ArticuloCatalogo | null): VarianteAcristalamiento {
  if (!vidrio) return '2'
  if (serie.grosorMaximoSimple > 0) return vidrio.grosorAcristalar <= serie.grosorMaximoSimple ? '1' : '2'
  return vidrio.dobleAcristalamiento ? '2' : '1'
}

export function despiezarDiseno(
  catalogo: CatalogoLinea,
  entrada: EntradaLineaCatalogo,
  serie: SerieCatalogo,
  plantilla: readonly FilaPlantillaCatalogo[],
): DespieceParcial {
  const r = parcialVacio()
  const vidrio = entrada.vidrio ? catalogo.articulo(entrada.vidrio) : null
  if (entrada.vidrio && !vidrio) r.incidencias.push(`vidrio ${entrada.vidrio} ausente del catálogo`)
  if (vidrio && serie.grosorMaximoDoble > 0 && vidrio.grosorAcristalar > serie.grosorMaximoDoble) {
    r.avisos.push(`vidrio de ${vidrio.grosorAcristalar} mm por encima del rango de doble acristalamiento de la serie`)
  }
  const variante = varianteAcristalamiento(serie, vidrio)
  const claves = (tipoHoja: string | null) => esTipoHojaMarco(tipoHoja) ? null : clavesTipoHoja(catalogo.nombreTipoHoja(tipoHoja!))
  for (const t of new Set(plantilla.map(f => f.tipoHoja).filter(t => !esTipoHojaMarco(t)))) {
    const c = claves(t)
    if (!c) r.incidencias.push(`tipo de hoja ${t} sin lectura de claves`)
    else if (!c.contrastado) r.avisos.push(`tipo de hoja ${catalogo.nombreTipoHoja(t!)} leído por nombre, sin caso contrastado`)
  }

  // Artículo de cada ranura
  const articuloDe = new Map<number, string | null>()
  for (const f of plantilla) {
    if (f.componente === COMPONENTE_VIDRIO) { articuloDe.set(f.id, entrada.vidrio); continue }
    const resuelto = f.componente ? catalogo.resolverComponente(entrada.serie, f.componente, variante) : null
    if (resuelto !== null) { articuloDe.set(f.id, resuelto); continue }
    const propio = catalogo.articulo(f.articulo)
    if (propio && !propio.generico) { articuloDe.set(f.id, f.articulo); continue }
    articuloDe.set(f.id, null)
    // Una ranura genérica sin componente (62 fijo independiente) solo informa.
    if (!sinMaterial(f) && f.componente) r.incidencias.push(`la serie no resuelve el componente ${f.componente} (${f.articulo})`)
  }

  // Medidas
  const contexto = { ...(entrada.cotas ?? {}), A: entrada.anchoMm, L: entrada.altoMm }
  const claveDescuento = (t: string | null) => claves(t)?.descuento ?? 'G'
  const medibles: FilaMedible[] = plantilla.map(f => ({ ...f, tipoHoja: claveDescuento(f.tipoHoja) }))
  const medidas = medirPlantilla(medibles, catalogo.descuentos(entrada.serie), contexto)

  // Filas de plantilla con material
  for (const f of plantilla) {
    const articulo = articuloDe.get(f.id)
    if (f.componente === COMPONENTE_VIDRIO || sinMaterial(f) || !articulo || articulo === '0') continue
    const medida = medidas.get(f.id)
    if (catalogo.articulo(articulo)?.tipoMetraje !== 'UD' && medida?.largoMm == null) {
      r.incidencias.push(`${articulo} (${f.funcion ?? f.componente}): ${medida?.incidencia ?? 'sin medida'}`)
    }
    r.filas.push(fila({ origen: 'plantilla', articulo, acabado: entrada.acabado, cantidad: f.cantidad,
      largoMm: medida?.largoMm ?? null, funcion: f.funcion }))
  }

  // Asociaciones
  const elementos: ElementoPlantilla[] = plantilla.map(f => ({
    componente: catalogo.articulo(f.articulo)?.componente || f.componente || '', grupo: f.grupo,
    cantidad: f.cantidad, medidaMm: medidas.get(f.id)?.largoMm ?? null, articulo: articuloDe.get(f.id) ?? null,
    funcion: f.funcion, posicionTrabajo: f.posicionTrabajo, mano: f.mano, hoja: f.hoja,
    modulo: f.funcion === 'infMOmof' ? f.disVidrio : null, tipoHoja: f.tipoHoja,
  }))
  const { ambitos, incidencias: sinHerraje } = construirAmbitos({
    serie: entrada.serie, esAccesorio: catalogo.esAccesorio(entrada.estructura),
    anchoMm: entrada.anchoMm, altoMm: entrada.altoMm, elementos,
    conjuntoHerraje: t => { const c = claves(t); return c ? serie.herrajes[c.herraje] ?? null : null },
  })
  r.incidencias.push(...sinHerraje)
  const conjuntos = ambitos.map(a => a.conjunto)
  const asociaciones = evaluarAsociaciones({
    ambitos,
    reglas: new Map(conjuntos.map(c => [c, catalogo.asociaciones(c)])),
    opciones: opcionesMarcadas(conjuntos, conjuntos.flatMap(c => catalogo.opciones(c)), entrada.opcionesGuardadas),
    gruposAsociacion: catalogo.gruposAsociacion(),
    esPorMetro: a => { const d = catalogo.articulo(a); return d ? d.tipoMetraje === 'ML' : null },
  })
  r.incidencias.push(...asociaciones.incidencias)
  for (const a of asociaciones.asociados) {
    const acabado = a.acabado === '---P' ? entrada.acabado : a.acabado === '---A' ? entrada.acabadoAccesorios : a.acabado
    r.filas.push(fila({ origen: 'asociado', articulo: a.articulo, acabado, cantidad: a.cantidad, largoMm: a.largoMm }))
  }

  // Vidrio, junquillos y juntas
  const vidrios = despiezarVidrios({
    catalogo, linea: entrada, serie, vidrio, medidas, contexto, claveDescuento,
    cristales: plantilla.filter(x => x.componente === COMPONENTE_VIDRIO),
  })
  r.filas.push(...vidrios.filas)
  r.incidencias.push(...vidrios.incidencias)
  r.avisos.push(...vidrios.avisos)

  // Mano de obra de fabricación
  const mo = minutosFabricacion({
    elementos: plantilla.map(f => ({ modulo: f.funcion === 'infMOmof' ? f.disVidrio : null, articuloPlantilla: f.articulo,
      componente: f.componente, grupo: f.grupo, cantidad: f.cantidad })),
    conceptos: catalogo.conceptosManoObra(), tipoPerfil: catalogo.tipoPerfil?.(entrada.estructura) ?? null,
    conceptosApertura: [...new Set(plantilla.map(f => claves(f.tipoHoja)?.manoObra).filter((x): x is string => !!x))]
      .map(k => serie.manoObra[k]).filter((x): x is string => !!x),
  })
  r.incidencias.push(...mo.incidencias)
  for (const l of mo.lineas) {
    r.filas.push(fila({ origen: 'mano-obra', articulo: l.articulo, acabado: entrada.acabadoAccesorios, cantidad: l.minutos,
      largoMm: null, funcion: 'MO' }))
  }
  return r
}
