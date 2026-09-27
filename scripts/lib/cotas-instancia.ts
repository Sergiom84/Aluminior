/** Entradas elegidas, nunca MedidaStd ni dimensiones de un despiece guardado. */
export type FilaCotasCsv = Readonly<Record<string, string | undefined>>
export interface IdentidadCotas {
  tipoDoc: string
  documento: string
  linea: string
  estructura: string
}
export interface TrazaCota {
  identidad: IdentidadCotas
  nDA: string
  simbolo: string
  medida: number
  medidaOriginal: string
  filaMedidas: number
  filasDefinicion: number[]
}
export interface ResultadoCotas {
  estado: 'valida' | 'sin-entrada' | 'invalida'
  cotas: Record<string, number>
  incidencias: string[]
  trazas: TrazaCota[]
}

const texto = (v: string | undefined) => v?.trim() ?? ''
const clave = (...campos: string[]) => JSON.stringify(campos.map(texto))
const normalizar = (i: IdentidadCotas): IdentidadCotas => ({
  tipoDoc: texto(i.tipoDoc).toUpperCase(), documento: texto(i.documento),
  linea: texto(i.linea), estructura: texto(i.estructura),
})
const reservadas = new Set(['A', 'L', 'REF'])

/** No convierte vacío, texto, infinito o notación hexadecimal en cero. */
export function medidaCota(v: string | undefined): number | null {
  const valor = texto(v).replace(',', '.')
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(valor)) return null
  const n = Number(valor)
  return Number.isFinite(n) ? n : null
}

/** La clave incluye tipo documental e instancia; no mezcla facturas y presupuestos. */
export function crearResolvedorCotasInstancia(
  medidas: readonly FilaCotasCsv[], definiciones: readonly FilaCotasCsv[],
) {
  type Fuente = { fila: FilaCotasCsv; registro: number }
  const porInstancia = new Map<string, Fuente[]>()
  const porDA = new Map<string, Fuente[]>()
  for (const [i, fila] of medidas.entries()) {
    const k = clave(texto(fila.TipoDoc).toUpperCase(), texto(fila.nDoc), texto(fila.nLinEstr))
    porInstancia.set(k, [...(porInstancia.get(k) ?? []), { fila, registro: i + 2 }])
  }
  for (const [i, fila] of definiciones.entries()) {
    const k = clave(texto(fila.Estructura), texto(fila.nDA))
    porDA.set(k, [...(porDA.get(k) ?? []), { fila, registro: i + 2 }])
  }
  return (entrada: IdentidadCotas): ResultadoCotas => {
    const identidad = normalizar(entrada)
    const cotas: Record<string, number> = {}
    const incidencias: string[] = []
    const trazas: TrazaCota[] = []
    if (Object.values(identidad).some(v => !v)) {
      return { estado: 'invalida', cotas, incidencias: ['cotas: identidad documental incompleta'], trazas }
    }
    const filas = porInstancia.get(clave(identidad.tipoDoc, identidad.documento, identidad.linea)) ?? []
    for (const { fila, registro } of filas) {
      const nDA = texto(fila.nDA)
      if (texto(fila.Estructura) !== identidad.estructura || !nDA) {
        incidencias.push('cotas: estructura incompatible o nDA ausente en la instancia')
        continue
      }
      const defs = porDA.get(clave(identidad.estructura, nDA)) ?? []
      const simbolos = new Set(defs.map(d => texto(d.fila.SimboloDA).toUpperCase()))
      const simbolo = [...simbolos][0] ?? ''
      if (simbolos.size !== 1 || !/^[A-Z][A-Z0-9_]*$/.test(simbolo) || reservadas.has(simbolo)) {
        incidencias.push(`cotas: definición ausente, ambigua o símbolo reservado para nDA ${nDA}`)
        continue
      }
      const medida = medidaCota(fila.Medida)
      if (medida === null) {
        incidencias.push(`cotas: medida no finita o inválida para ${simbolo}`)
        continue
      }
      trazas.push({ identidad, nDA, simbolo, medida, medidaOriginal: fila.Medida ?? '',
        filaMedidas: registro, filasDefinicion: defs.map(d => d.registro) })
      if (cotas[simbolo] !== undefined && cotas[simbolo] !== medida) {
        incidencias.push(`cotas: valores incompatibles para ${simbolo}`)
        continue
      }
      cotas[simbolo] = medida
    }
    return {
      estado: incidencias.length ? 'invalida' : filas.length ? 'valida' : 'sin-entrada',
      cotas: incidencias.length ? {} : cotas, incidencias: [...new Set(incidencias)], trazas,
    }
  }
}
