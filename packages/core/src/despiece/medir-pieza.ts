import { evaluar, variablesDe, type Contexto } from './formula.ts'
import type { ComponentePlantilla, OpcionesDespiece } from './calcular.ts'

const FUNCIONES_HOJA = new Set(['HV', 'HH'])

/** Medida y rebaje de una pieza; independiente de agregación y consumo. */
export function medirPieza(c: ComponentePlantilla, contexto: Contexto, opciones: OpcionesDespiece) {
  const catalogo = opciones.corteDeCatalogo?.(c)
  if (catalogo !== undefined) {
    const valido = catalogo.largoMm !== null && Number.isFinite(catalogo.largoMm) && catalogo.largoMm > 0
    return {
      largoMm: valido ? catalogo.largoMm : null,
      incidencia: valido ? null : catalogo.incidencia ?? 'corte de catálogo sin medida válida',
      aviso: catalogo.aviso ?? null, variablesFaltantes: [] as string[],
    }
  }
  const variablesFaltantes = new Set<string>()
  let largoMm: number | null = null
  let incidencia: string | null = null
  let aviso: string | null = null

  if (c.formulaLargo) {
    try {
      largoMm = evaluar(c.formulaLargo, contexto)
      if (!Number.isFinite(largoMm)) {
        largoMm = null
        incidencia = 'resultado no numérico'
      } else if (largoMm < 0) {
        // Medida negativa: la fórmula es correcta pero las cotas no encajan
        // en el hueco. Hay que avisar, no cortar en negativo.
        incidencia = `medida negativa (${Math.round(largoMm)} mm): revisa las cotas`
        largoMm = null
      }
    } catch {
      const faltan = variablesDe(c.formulaLargo).filter((v) => !(v in contexto))
      faltan.forEach((v) => variablesFaltantes.add(v))
      incidencia = faltan.length
        ? `faltan valores: ${faltan.join(', ')}`
        : 'fórmula no evaluable'
    }
  } else {
    incidencia = 'sin fórmula de largo'
  }

  // Rebaje de hoja (anexo T). Sólo aplica a HV/HH y sólo si el llamante
  // aporta la tabla de reglas; sin ella el motor se comporta como antes.
  if (largoMm !== null && opciones.rebajeDeHoja && FUNCIONES_HOJA.has(c.funcion ?? '')) {
    const rebaje = opciones.rebajeDeHoja({
      articuloCodigo: c.articuloCodigo,
      funcion: c.funcion ?? '',
      formula: c.formulaLargo ?? '',
      serie: opciones.serie ?? '',
    })
    if (rebaje === null) {
      // No hay regla medida. No se inventa un rebaje ni se deja la medida
      // del hueco: la pieza queda sin medida y la línea, sin valorar.
      incidencia = 'sin regla de rebaje de hoja para (perfil, eje, fórmula, serie)'
      largoMm = null
    } else {
      largoMm -= rebaje.mm
      if (largoMm < 0) {
        incidencia = `rebaje mayor que la medida (${Math.round(largoMm)} mm): revisa la regla`
        largoMm = null
      } else if (rebaje.muestras < rebaje.totalMuestras) {
        // Regla no exacta: la medida vale para valorar, pero el riesgo se
        // hace visible. Nunca en silencio.
        const pct = (100 * rebaje.muestras / rebaje.totalMuestras).toFixed(1)
        aviso = `medida de hoja obtenida con una regla no exacta (${rebaje.muestras}/${rebaje.totalMuestras} = ${pct}%): confírmala antes de cortar`
      }
    }
  }


  return { largoMm, incidencia, aviso, variablesFaltantes: [...variablesFaltantes] }
}
