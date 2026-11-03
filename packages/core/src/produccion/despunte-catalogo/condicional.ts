export interface ContextoDespunteCondicional {
  readonly estructuraCodigo: string | null
  readonly familiaCodigo: string | null
  readonly serieCodigo: string | null
}
export interface ReglaDespunteCondicional {
  readonly id: string
  readonly prioridad: number
  readonly estructuras: string | null
  readonly familias: string | null
  readonly series: string | null
  readonly acabados: string | null
}
export interface SeleccionDespunteCondicional {
  readonly estado: 'INACTIVO' | 'SIN_COINCIDENCIA' | 'RESUELTO' | 'AMBIGUO' | 'BLOQUEADO'
  readonly reglaId: string | null
  readonly acabados: readonly string[]
  readonly reglasAmbiguas: readonly string[]
  readonly incidencias: readonly string[]
}

function coincide(lista: string | null, codigo: string | null): boolean {
  if (lista === null || lista === '') return true
  return typeof codigo === 'string' && codigo.length > 0 && lista.toLowerCase().split(';').includes(codigo.toLowerCase())
}

/** El estado inactivo se refiere solo a selección condicional, nunca al despunte global. */
export function seleccionarDespunteCondicional(entrada: {
  readonly contexto: ContextoDespunteCondicional
  readonly reglas: readonly ReglaDespunteCondicional[]
  readonly activo?: boolean
}): SeleccionDespunteCondicional {
  const resultado = (estado: SeleccionDespunteCondicional['estado'], extra: Partial<SeleccionDespunteCondicional> = {}): SeleccionDespunteCondicional =>
    ({ estado, reglaId: null, acabados: [], reglasAmbiguas: [], incidencias: [], ...extra })
  if (entrada.activo === undefined || entrada.activo === false) return resultado('INACTIVO')
  if (entrada.activo !== true) return resultado('BLOQUEADO', { incidencias: ['activación condicional inválida'] })
  const ids = new Set<string>()
  const incidencias: string[] = []
  for (const regla of entrada.reglas) {
    if (typeof regla.id !== 'string' || !regla.id.trim() || ids.has(regla.id)) incidencias.push('identidad de regla ausente o duplicada')
    else ids.add(regla.id)
    if (!Number.isFinite(regla.prioridad)) incidencias.push('prioridad de regla inválida')
    if ([regla.estructuras, regla.familias, regla.series].some(lista => lista !== null && typeof lista !== 'string')) {
      incidencias.push('filtro de regla inválido')
    }
    if (typeof regla.acabados !== 'string' || regla.acabados.split(';').some(codigo => !codigo.trim())) {
      incidencias.push('configuración de acabados ausente o vacía')
    }
  }
  if (incidencias.length) return resultado('BLOQUEADO', { incidencias: [...new Set(incidencias)] })
  const candidatas = entrada.reglas.filter(regla => coincide(regla.estructuras, entrada.contexto.estructuraCodigo)
    && coincide(regla.familias, entrada.contexto.familiaCodigo) && coincide(regla.series, entrada.contexto.serieCodigo))
  if (!candidatas.length) return resultado('SIN_COINCIDENCIA')
  const prioridad = candidatas.reduce((max, regla) => Math.max(max, regla.prioridad), -Infinity)
  const primeras = candidatas.filter(regla => regla.prioridad === prioridad)
  // Contención de Aluminior: la evidencia no demuestra un desempate de igual prioridad.
  if (primeras.length > 1) return resultado('AMBIGUO', { reglasAmbiguas: primeras.map(regla => regla.id) })
  const regla = primeras[0]!
  return resultado('RESUELTO', { reglaId: regla.id, acabados: regla.acabados!.split(';') })
}
