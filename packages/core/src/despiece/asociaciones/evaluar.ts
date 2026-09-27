/**
 * Evaluación de asociaciones de catálogo (`ConjuntosAsoc`).
 *
 * Cada regla elige sus elementos («Asociado A») dentro de un ámbito, aplica
 * sus filtros y emite una fila por elemento: `Cantidad × cantidad del
 * elemento`, con mínimo de unidades y, en artículos por metro, el corte del
 * elemento menos `Descuento`. Todo filtro es acumulativo (CHM 5.1.2.12.7.7.1).
 *
 * Nunca completa un dato ausente: una medida o un artículo desconocido, o un
 * rasgo no contrastado en una regla que sí aplica, se devuelve como incidencia.
 */

import { evaluarFormulaOpciones, parsearFormulaOpciones } from '../../estructuras/editor-linea/formula-opciones.ts'
import type {
  AmbitoAsociacion, AsociadoEmitido, ElementoAsociable, ReglaAsociacion, ResultadoAsociaciones,
} from './tipos.ts'

const FUNCIONES_PERFIL = new Set(['MV', 'MH', 'HV', 'HH'])

export interface EntradaAsociaciones {
  ambitos: readonly AmbitoAsociacion[]
  /** Reglas por conjunto. */
  reglas: ReadonlyMap<string, readonly ReglaAsociacion[]>
  /** Opciones marcadas por conjunto (códigos sin la `o`). */
  opciones: ReadonlyMap<string, ReadonlySet<string>>
  /** `FamiliasGruposAsoc`: código de grupo -> componentes. */
  gruposAsociacion: ReadonlyMap<string, ReadonlySet<string>>
  /** true si el artículo se mide por metro; null si no está en el catálogo. */
  esPorMetro: (articulo: string) => boolean | null
}

function opcionActiva(regla: ReglaAsociacion, marcadas: ReadonlySet<string>): boolean {
  if (regla.formulaOpcion?.trim()) {
    const formula = parsearFormulaOpciones(regla.formulaOpcion)
    return formula ? evaluarFormulaOpciones(formula, marcadas) : true
  }
  return !regla.opcion || marcadas.has(regla.opcion)
}

function rasgosNoContrastados(regla: ReglaAsociacion): string[] {
  const rasgos = [...(regla.noContrastado ?? [])]
  if (regla.intervalo > 0) rasgos.push('intervalo')
  if (regla.unidadesMax > 0) rasgos.push('unidades máximas')
  if (regla.formulaLargo?.trim()) rasgos.push('fórmula de largo')
  if (regla.formulaAncho?.trim()) rasgos.push('fórmula de ancho')
  if (regla.tipoMedida && regla.tipoMedida !== 'C') rasgos.push(`medida ${regla.tipoMedida}`)
  return rasgos
}

/** Elementos del «Asociado A»; null si la regla no tiene destino. */
function destino(
  regla: ReglaAsociacion,
  ambito: AmbitoAsociacion,
  grupos: ReadonlyMap<string, ReadonlySet<string>>,
): ElementoAsociable[] | null | 'grupo-desconocido' {
  const els = ambito.elementos
  if (regla.componente && regla.componente !== '!') return els.filter(e => e.componente === regla.componente)
  if (regla.grupo && regla.grupo !== '!') return els.filter(e => e.grupo === regla.grupo)
  if (regla.modulos) {
    const modulos = regla.modulos.split(';').map(m => m.trim()).filter(Boolean)
    return els.filter(e => e.modulo != null && modulos.includes(e.modulo))
  }
  if (regla.grupoAsociacion) {
    const componentes = grupos.get(regla.grupoAsociacion)
    if (!componentes) return 'grupo-desconocido'
    return els.filter(e => componentes.has(e.componente) ||
      (e.componenteVariante != null && componentes.has(e.componenteVariante)))
  }
  return null
}

/**
 * Artículo principal en escuadras: el informativo se sustituye por los perfiles
 * con ese artículo del mismo marco u hoja. Contrastado en ELEGANTPVC, GMA350 y
 * GMA60RL; el resto de destinos exige que el propio elemento lleve el artículo.
 */
function filtrarArticuloPrincipal(
  regla: ReglaAsociacion,
  elementos: ElementoAsociable[],
  ambito: AmbitoAsociacion,
  escuadras: ReadonlySet<string>,
): ElementoAsociable[] {
  const principal = regla.articuloPrincipal
  if (!principal) return elementos
  const resultado: ElementoAsociable[] = []
  for (const e of elementos) {
    if (escuadras.has(e.componente)) {
      for (const perfil of ambito.elementos) {
        if (perfil.articulo === principal && (perfil.hoja ?? 0) === (e.hoja ?? 0) &&
          FUNCIONES_PERFIL.has(perfil.funcion ?? '')) resultado.push({ ...perfil, cantidad: 1 })
      }
    } else if (e.articulo === principal) resultado.push(e)
  }
  return resultado
}

export function evaluarAsociaciones(entrada: EntradaAsociaciones): ResultadoAsociaciones {
  const asociados: AsociadoEmitido[] = []
  const incidencias = new Set<string>()
  const escuadras = entrada.gruposAsociacion.get('ESC') ?? new Set<string>()

  for (const ambito of entrada.ambitos) {
    const marcadas = entrada.opciones.get(ambito.conjunto) ?? new Set<string>()
    for (const regla of entrada.reglas.get(ambito.conjunto) ?? []) {
      if (!regla.articulo || regla.articulo === '0') continue
      if (!opcionActiva(regla, marcadas)) continue
      if (regla.apertura > 0 && String(regla.apertura) !== ambito.tipoHoja) continue

      const elegidos = destino(regla, ambito, entrada.gruposAsociacion)
      if (elegidos === null) continue
      if (elegidos === 'grupo-desconocido') {
        incidencias.add(`asociación ${regla.id}: grupo ${regla.grupoAsociacion} sin definición`)
        continue
      }
      let els = filtrarArticuloPrincipal(regla, elegidos, ambito, escuadras)
      if (regla.mano) els = els.filter(e => e.mano === regla.mano)
      if (regla.posicionTrabajo) els = els.filter(e => e.posicionTrabajo === regla.posicionTrabajo)
      if (regla.medidaMin > 0 || regla.medidaMax > 0) {
        if (els.some(e => e.medidaMm === null)) {
          incidencias.add(`asociación ${regla.id}: elemento sin medida para filtrar ${regla.articulo}`)
          continue
        }
        els = els.filter(e => (regla.medidaMin <= 0 || e.medidaMm! >= regla.medidaMin) &&
          (regla.medidaMax <= 0 || e.medidaMm! <= regla.medidaMax))
      }
      if (regla.soloUna) els = els.slice(0, 1)
      if (!els.length) continue

      const rasgos = rasgosNoContrastados(regla)
      if (rasgos.length) {
        incidencias.add(`asociación ${regla.id} (${regla.articulo}): ${rasgos.join(', ')} sin contrastar`)
        continue
      }
      const porMetro = entrada.esPorMetro(regla.articulo)
      if (porMetro === null) {
        incidencias.add(`asociación ${regla.id}: artículo ${regla.articulo} ausente del catálogo`)
        continue
      }
      for (const e of els) {
        let cantidad = regla.cantidad * e.cantidad
        if (regla.unidadesMin > 0 && cantidad < regla.unidadesMin) cantidad = regla.unidadesMin
        let largoMm: number | null = null
        if (porMetro) {
          if (e.medidaMm === null) {
            incidencias.add(`asociación ${regla.id}: ${regla.articulo} sin medida del elemento`)
            continue
          }
          largoMm = e.medidaMm - regla.descuento
          if (!(largoMm > 0)) {
            incidencias.add(`asociación ${regla.id}: ${regla.articulo} con medida no positiva`)
            continue
          }
        }
        asociados.push({
          articulo: regla.articulo, cantidad, largoMm, acabado: regla.acabado,
          reglaId: regla.id, conjunto: regla.conjunto,
        })
      }
    }
  }
  return { asociados, incidencias: [...incidencias] }
}
