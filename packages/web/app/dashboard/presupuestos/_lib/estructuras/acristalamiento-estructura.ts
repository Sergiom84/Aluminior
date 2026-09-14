import { partidasValoracion } from './partidas-valoracion.ts'
import type { PartidaValoracionCerramiento } from '@aluminior/core/estructuras'
import { eq, inArray } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import {
  evaluar, calcularVidriosPorAlojamiento,
  type ComponentePlantilla, type NodoDisenyo, type ResultadoDespiece,
} from '@aluminior/core/despiece'
import { valorarDespiece, medidasVidrio, type DatosArticuloPrecio } from '@aluminior/core/precios'
import type { ClienteEscritura } from '../cliente-db.ts'
import type { PiezaDespiece, RanuraAcristalamiento } from '../lineas/guardar-linea.ts'
import { COMPONENTE_CRISTAL } from './componentes-disenyo.ts'
import { resolverCosteAcristalamiento } from './coste-acristalamiento.ts'
import { emparejarVidrio } from './emparejamiento-vidrio.ts'
import { leerGalceVidrio } from './galce-vidrio.ts'
import { piezasAcristalamiento, type CristalAcris } from './junquillos.ts'
import { resolverValoracionVidrio } from './valoracion-vidrio.ts'
import {
  articulosAmbiguos, avisoAmbiguos, leerPvpArticulos, precioDe, pvpPorArticuloDe,
} from './pvp-articulos.ts'

export interface EntradaAcristalamientoEstructura {
  serieCodigo: string
  estructuraCodigo: string
  vidrioCodigo: string | null
  varianteAcristalamiento: '1' | '2'
  acabadoCodigo: string | null
  anchoMm: number
  altoMm: number
  tarifa: number
  plantillaResuelta: readonly ComponenteAcristalamiento[]
  genericos: ReadonlySet<string>
  cotas: Readonly<Record<string, number>>
  despiece: ResultadoDespiece
  precioInicial: number
  trazabilidad?: boolean
}

/** Columnas de diseño que el acristalamiento necesita además del despiece. */
export interface ComponenteAcristalamiento extends ComponentePlantilla {
  formulaAncho: string | null
  componenteDisenyo: string | null
  idItemDisenyo: number | null
  tipoHojaDisenyo: number | null
}

export type ResultadoAcristalamientoEstructura =
  | { ok: false; errores: Record<string, string[]> }
  | {
      ok: true
      precio: number
      piezas: PiezaDespiece[]
      acristalamiento: RanuraAcristalamiento[]
      problemas: string[]
      partidas?: PartidaValoracionCerramiento[]
      materialCompleto?: boolean
    }

/**
 * Acristalamiento completo de una estructura ya despiezada.
 *
 * Conserva literalmente las dos rutas históricas (mixta y no mixta), sus
 * precedencias de acabado, redondeos, avisos y omisiones. Este módulo no decide
 * si la línea completa es valorable: devuelve sus problemas al orquestador.
 */
export async function resolverAcristalamientoEstructura(
  cliente: ClienteEscritura,
  entrada: EntradaAcristalamientoEstructura,
): Promise<ResultadoAcristalamientoEstructura> {
  const partidas: PartidaValoracionCerramiento[] = []
  let materialCompleto = true
  let precio = entrada.precioInicial
  const piezas: PiezaDespiece[] = []
  const acristalamiento: RanuraAcristalamiento[] = []
  let avisoVidrio: string | null = null
  let tamJunqVidrio = 0
  let cristalesAcris: CristalAcris[] = []
  let avisoAcris: string | null = null
  /** Aparte de `avisoAcris`: faltar un precio y sobrar no son el mismo arreglo. */
  let avisoAmbiguoAcris: string | null = null

  if (entrada.vidrioCodigo) {
    const [vidrio] = await cliente.select()
      .from(schema.articulos).where(eq(schema.articulos.codigo, entrada.vidrioCodigo)).limit(1)
    if (!vidrio || vidrio.familiaCodigo !== '050' || vidrio.tipoMetraje !== 'M2') {
      return {
        ok: false,
        errores: { vidrioCodigo: ['Vidrio no válido (debe ser familia 050, facturable por m²)'] },
      }
    }
    const ranuras = entrada.plantillaResuelta
      .filter((c) => c.componenteDisenyo === COMPONENTE_CRISTAL)
    acristalamiento.push(...ranuras.map((r, i) => ({
      slot: i + 1,
      vidrioHojas: r.tipoHojaDisenyo === -1 ? null : entrada.vidrioCodigo,
      vidrioFijos: r.tipoHojaDisenyo === -1 ? entrada.vidrioCodigo : null,
      variante: entrada.varianteAcristalamiento,
    })))
    const tipos = new Set(ranuras.map((r) => r.tipoHojaDisenyo === -1 ? 'FIJO' : 'HOJA'))
    const esMixta = tipos.size > 1
    tamJunqVidrio = Number((vidrio.tamJunquilloGoma ?? '').replace(',', '.')) || 0
    const reglasMetrajeVidrio = {
      metrajeMinimo: vidrio.metrajeMinimo === null ? null : Number(vidrio.metrajeMinimo),
      multiploLargoCm: vidrio.metrajeMultiploLargo === null ? null : Number(vidrio.metrajeMultiploLargo),
      multiploAnchoCm: vidrio.metrajeMultiploAncho === null ? null : Number(vidrio.metrajeMultiploAncho),
    }

    if (esMixta) {
      const nodosFilas = await cliente.select().from(schema.estructuraDisenoNodos)
        .where(eq(schema.estructuraDisenoNodos.estructuraCodigo, entrada.estructuraCodigo))
      const nodos = new Map<number, NodoDisenyo>(nodosFilas.map((n) => [n.idItem, {
        idItem: n.idItem, tipo: n.tipo, contenidoEn: n.contenidoEn,
        idTravesano: n.idTravesano, posicionHueco: n.posicionHueco,
        tipoTravesano: n.tipoTravesano, invisible: n.invisible,
      }]))
      const reglasFilas = await cliente.select().from(schema.vidrioDescuentosAlojamiento)
      const calculo = calcularVidriosPorAlojamiento(
        ranuras.map((r) => ({
          idItemDisenyo: r.idItemDisenyo,
          formulaLargo: r.formulaLargo,
          formulaAncho: r.formulaAncho,
        })),
        { L: entrada.altoMm, A: entrada.anchoMm, ...entrada.cotas }, nodos,
        entrada.despiece.piezas.filter((pieza) => !entrada.genericos.has(pieza.articuloCodigo)),
        reglasFilas.map((r) => ({
          eje: r.eje as 'L' | 'A', limite1: r.limite1, limite2: r.limite2,
          perfilHoja: r.perfilHoja, deltaMm: Number(r.deltaMm),
        })),
      )
      if (!calculo.ok) {
        materialCompleto = false
          avisoVidrio = `vidrio sin calcular: ranura ${calculo.slot}, ${calculo.motivo}`
      } else {
        cristalesAcris = calculo.vidrios
        const valoracion = await resolverValoracionVidrio(cliente, {
          vidrioCodigo: entrada.vidrioCodigo,
          cristales: calculo.vidrios.map((v) => ({
            largoMm: v.largoMm, anchoMm: v.anchoMm, cantidad: 1,
          })),
          reglasMetraje: reglasMetrajeVidrio,
          trazabilidad: entrada.trazabilidad,
          tarifa: entrada.tarifa,
          acabadoCodigo: entrada.acabadoCodigo,
        })
        if (!valoracion.ok) {
          avisoVidrio = valoracion.aviso
          piezas.push(...(valoracion.piezas ?? []))
          partidas.push(...(valoracion.partidas ?? []))
        }
        else {
          precio = Math.round((precio + valoracion.importe) * 100) / 100
          piezas.push(...valoracion.piezas)
          partidas.push(...(valoracion.partidas ?? []))
        }
      }
    } else {
      const nCristales = ranuras.length
      const emparejamiento = emparejarVidrio(entrada.despiece.piezas, nCristales)

      if (!emparejamiento.ok) {
        materialCompleto = false
        avisoVidrio = emparejamiento.aviso
      } else {
        const { perfilCodigo: perfilRef } = emparejamiento
        const contextoVidrio = emparejamiento.contexto
        const deltaGalce = await leerGalceVidrio(
          cliente, contextoVidrio, entrada.serieCodigo, perfilRef,
        )
        if (deltaGalce === null) {
          materialCompleto = false
          avisoVidrio = `vidrio sin calcular: sin descuento de galce medido para ${entrada.serieCodigo} + ${perfilRef} (${contextoVidrio.toLowerCase()})`
        } else {
          const dims = medidasVidrio(
            emparejamiento.corteVerticalMm, emparejamiento.corteHorizontalMm, deltaGalce,
          )
          if (!dims) {
            materialCompleto = false
            avisoVidrio = 'vidrio sin calcular: el descuento de galce no cabe en la medida'
          } else {
            const contextoModulo = { L: entrada.altoMm, A: entrada.anchoMm, ...entrada.cotas }
            cristalesAcris = ranuras.flatMap((r, i) => {
              try {
                if (!r.formulaLargo || !r.formulaAncho) return []
                return [{
                  slot: i + 1, contexto: contextoVidrio,
                  largoMm: dims.largoMm, anchoMm: dims.anchoMm,
                  moduloLargoMm: evaluar(r.formulaLargo, contextoModulo),
                  moduloAnchoMm: evaluar(r.formulaAncho, contextoModulo),
                }]
              } catch { return [] }
            })
            if (cristalesAcris.length !== ranuras.length) {
              materialCompleto = false
              avisoAcris = 'junquillos/juntas sin calcular: fórmulas de módulo incompletas'
            }
            const valoracion = await resolverValoracionVidrio(cliente, {
              vidrioCodigo: entrada.vidrioCodigo,
              cristales: [{
                largoMm: dims.largoMm, anchoMm: dims.anchoMm, cantidad: nCristales,
              }],
              reglasMetraje: reglasMetrajeVidrio,
          trazabilidad: entrada.trazabilidad,
              tarifa: entrada.tarifa,
              acabadoCodigo: entrada.acabadoCodigo,
            })
            if (!valoracion.ok) {
          avisoVidrio = valoracion.aviso
          piezas.push(...(valoracion.piezas ?? []))
          partidas.push(...(valoracion.partidas ?? []))
        }
            else {
              precio = Math.round((precio + valoracion.importe) * 100) / 100
              piezas.push(...valoracion.piezas)
          partidas.push(...(valoracion.partidas ?? []))
            }
          }
        }
      }
    }
  }

  if (cristalesAcris.length) {
    const calculoAcris = await piezasAcristalamiento(cliente, {
      serieCodigo: entrada.serieCodigo,
      tamJunquillo: tamJunqVidrio,
      cristales: cristalesAcris,
    })
    const piezasAcris = calculoAcris.piezas
    if (calculoAcris.avisos.length) {
      materialCompleto = false
      avisoAcris = `junquillos/juntas sin calcular: ${calculoAcris.avisos.join('; ')}`
    }
    if (piezasAcris.length) {
      const codigosAcris = [...new Set(piezasAcris.map((p) => p.articuloCodigo))]
      const artsAcris = await cliente.select({
        codigo: schema.articulos.codigo,
        tipoMetraje: schema.articulos.tipoMetraje,
        metrajeMinimo: schema.articulos.metrajeMinimo,
        metrajeMultiploLargo: schema.articulos.metrajeMultiploLargo,
      }).from(schema.articulos).where(inArray(schema.articulos.codigo, codigosAcris))
      // Mismo desempate que el despiece desde T.73: exacto, genérico, o nada.
      const filasPvp = await leerPvpArticulos(cliente, codigosAcris, entrada.tarifa)
      const pvpAcris = pvpPorArticuloDe(
        filasPvp,
        entrada.acabadoCodigo,
      )
      const mapaAcris = new Map<string, DatosArticuloPrecio>(
        artsAcris.map((a) => [a.codigo, {
          codigo: a.codigo,
          tipoMetraje: a.tipoMetraje,
          precio: precioDe(pvpAcris.get(a.codigo)),
          metrajeMinimo: a.metrajeMinimo === null ? null : Number(a.metrajeMinimo),
          metrajeMultiploLargo: a.metrajeMultiploLargo === null
            ? null : Number(a.metrajeMultiploLargo),
        }]),
      )
      const ambiguosAcris = articulosAmbiguos(pvpAcris)
      avisoAmbiguoAcris = avisoAmbiguos(ambiguosAcris, 'artículos de acristalamiento')
      const valorables = piezasAcris.filter((p) => p.articuloCodigo !== '0' && p.articuloCodigo !== 'V1000')
      if (valorables.some(p => !mapaAcris.has(p.articuloCodigo))) materialCompleto = false
      const valAcris = valorarDespiece(valorables, mapaAcris)
      if (entrada.trazabilidad) partidas.push(...partidasValoracion(valAcris.lineas, entrada, 'ACRISTALAMIENTO', filasPvp))
      if (valAcris.sinMedida.length) {
        materialCompleto = false
        avisoAcris = `${valAcris.sinMedida.length} artículos de acristalamiento sin medidas suficientes para calcular el metraje`
      }
      precio = Math.round((precio + valAcris.importe) * 100) / 100
      // Los ambiguos ya tienen su aviso: contarlos aquí los duplicaría diciendo
      // que no tienen precio, que es lo contrario de lo que les pasa.
      const soloAmbiguos = new Set(ambiguosAcris)
      const sinPrecioAcris = valAcris.sinPrecio.filter((c) => !soloAmbiguos.has(c))
      if (sinPrecioAcris.length) {
        avisoAcris = [avisoAcris, `${sinPrecioAcris.length} artículos de acristalamiento sin precio en la tarifa`]
          .filter(Boolean).join('; ')
      }
      piezas.push(...await resolverCosteAcristalamiento(cliente, {
        piezas: valorables,
        codigos: codigosAcris,
        mapa: mapaAcris,
        acabadoCodigo: entrada.acabadoCodigo,
      }))
    }
  }

  const problemas: string[] = []
  if (avisoVidrio) problemas.push(avisoVidrio)
  if (avisoAcris) problemas.push(avisoAcris)
  if (avisoAmbiguoAcris) problemas.push(avisoAmbiguoAcris)
  if (!entrada.vidrioCodigo) {
    materialCompleto = false
    problemas.push('sin vidrio elegido: el acristalamiento no se valora')
  }
  return { ok: true, precio, piezas, acristalamiento, problemas, partidas, materialCompleto }
}
