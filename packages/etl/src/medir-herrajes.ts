import { rutaTabla, leerLotes, txt, type Fila } from './csv.ts'

/**
 * Mide del histórico qué juego de conjuntos de herraje usa cada
 * (serie, estructura).
 *
 * Origen: VOpcionesHerraje sobre presupuestos reales (TipoDoc VPRES). Cada
 * línea configurada registra opciones de VARIOS conjuntos a la vez (la serie
 * y una tabla de herraje según la apertura: HU529 para 1 oscilo, HU532 para
 * hojas oscilo múltiples…). La firma —los conjuntos ordenados y unidos por
 * '+'— resulta determinista por (serie, estructura) en 70 de 80
 * combinaciones; las excepciones son variantes de apertura del usuario.
 *
 * Igual que el resto de reglas medidas (galces, descuentos, junquillos):
 * solo se emite la firma dominante con ≥3 muestras y ≥90% de consistencia.
 * Sin regla, el configurador no ofrece opciones y no se inventa nada.
 */
export interface ReglaHerrajeMedida {
  serie_codigo: string
  estructura_codigo: string
  conjuntos: string
  muestras: number
  total_muestras: number
}

export interface ResultadoHerrajes {
  reglas: ReglaHerrajeMedida[]
  combinaciones: number
  lineas: number
}

const t = (f: Fila, campo: string) => txt(f[campo]) ?? ''

async function leerTodo(origen: string, tabla: string): Promise<Fila[]> {
  const ruta = rutaTabla(origen, tabla)
  if (!ruta) return []
  const filas: Fila[] = []
  for await (const lote of leerLotes(ruta, 1000)) filas.push(...lote)
  return filas
}

export async function medirHerrajeConjuntos(origen: string): Promise<ResultadoHerrajes> {
  const [opciones, datosLin, vLin] = await Promise.all([
    leerTodo(origen, 'VOpcionesHerraje'),
    leerTodo(origen, 'VDatosLinEstr'),
    leerTodo(origen, 'VPresupuestosLin'),
  ])

  const seriePorLinea = new Map<string, string>()
  for (const f of datosLin) {
    if (t(f, 'TipoDoc') !== 'VPRES') continue
    seriePorLinea.set(`${t(f, 'nVDoc')}|${t(f, 'nVLinea')}`, t(f, 'Conjunto1'))
  }
  const estructuraPorLinea = new Map<string, string>()
  for (const f of vLin) {
    if (t(f, 'EstructuraSN') !== 'True') continue
    estructuraPorLinea.set(`${t(f, 'nDoc')}|${t(f, 'nLinea')}`, t(f, 'Articulo'))
  }

  // línea → conjuntos de herraje que registró el configurador original
  const conjuntosPorLinea = new Map<string, Set<string>>()
  for (const f of opciones) {
    if (t(f, 'TipoDoc') !== 'VPRES') continue
    const clave = `${t(f, 'nDoc')}|${t(f, 'nLinEstr')}`
    const conjunto = t(f, 'Conjunto')
    if (!conjunto) continue
    const set = conjuntosPorLinea.get(clave) ?? new Set<string>()
    set.add(conjunto)
    conjuntosPorLinea.set(clave, set)
  }

  // (serie|estructura) → recuento por firma
  const firmas = new Map<string, Map<string, number>>()
  let lineas = 0
  for (const [clave, cjs] of conjuntosPorLinea) {
    const serie = seriePorLinea.get(clave)
    const estructura = estructuraPorLinea.get(clave)
    if (!serie || !estructura) continue
    lineas++
    const combinacion = `${serie}|${estructura}`
    const firma = [...cjs].sort().join('+')
    const porFirma = firmas.get(combinacion) ?? new Map<string, number>()
    porFirma.set(firma, (porFirma.get(firma) ?? 0) + 1)
    firmas.set(combinacion, porFirma)
  }

  const reglas: ReglaHerrajeMedida[] = []
  for (const [combinacion, porFirma] of firmas) {
    const total = [...porFirma.values()].reduce((a, b) => a + b, 0)
    let dominante = '', muestras = 0
    for (const [firma, cuenta] of porFirma) {
      if (cuenta > muestras) { dominante = firma; muestras = cuenta }
    }
    if (muestras < 3 || muestras / total < 0.9) continue
    const [serie, estructura] = combinacion.split('|')
    reglas.push({
      serie_codigo: serie,
      estructura_codigo: estructura,
      conjuntos: dominante,
      muestras,
      total_muestras: total,
    })
  }

  return { reglas, combinaciones: firmas.size, lineas }
}
