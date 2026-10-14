import { compararDecimal } from '../decimal.ts'
import type {
  EntradaSeleccionRegistroTarifaDinamica, EtapaSeleccionTarifaDinamica,
  RegistroTarifaDinamica, SeleccionRegistroTarifaDinamica,
} from './tipos.ts'

const FUENTE = 'TARIFA_DINAMICA_REGISTRO' as const
const codigoValido = (codigo: unknown): codigo is string =>
  typeof codigo === 'string' && codigo.trim().length > 0

function decimalValido(valor: unknown): valor is string {
  if (typeof valor !== 'string') return false
  try { compararDecimal(valor, '0'); return true } catch { return false }
}

function sinRegistro(
  estado: 'SIN_COINCIDENCIA' | 'BLOQUEADO', incidencias: readonly string[] = [],
): SeleccionRegistroTarifaDinamica {
  return { fuente: FUENTE, estado, etapa: null, registro: null, registrosAmbiguos: [], incidencias }
}

/** No conserva campos económicos o metadatos ajenos recibidos en tiempo de ejecución. */
function copiarCriterios(registro: RegistroTarifaDinamica): RegistroTarifaDinamica {
  return {
    id: registro.id, clienteCodigo: registro.clienteCodigo,
    grupoAcabadoCodigo: registro.grupoAcabadoCodigo, tipoArticuloCodigo: registro.tipoArticuloCodigo,
    tamanoCodigo: registro.tamanoCodigo, metrajeDesde: registro.metrajeDesde, metrajeHasta: registro.metrajeHasta,
  }
}

/**
 * Selección pura de registro: cuatro búsquedas demostradas, sin activar tarifa.
 * Claves sin normalizar e intervalos inclusivos comparados como decimal exacto.
 * 0/0 es también un intervalo: con metraje cero puede ganar la primera búsqueda.
 * Ambigüedad y datos pertinentes inválidos se bloquean por contención de Aluminior.
 */
export function seleccionarRegistroTarifaDinamica(
  entrada: EntradaSeleccionRegistroTarifaDinamica,
): SeleccionRegistroTarifaDinamica {
  if (![entrada.clienteCodigo, entrada.grupoAcabadoCodigo,
    entrada.tipoArticuloCodigo, entrada.tamanoCodigo].every(codigoValido)) {
    return sinRegistro('BLOQUEADO', ['claves de selección ausentes o inválidas'])
  }
  if (!decimalValido(entrada.metraje)) return sinRegistro('BLOQUEADO', ['metraje ausente o inválido'])
  if (!Array.isArray(entrada.registros)) return sinRegistro('BLOQUEADO', ['catálogo de registros inválido'])
  const pertinentes = entrada.registros.filter(registro =>
    registro.clienteCodigo === entrada.clienteCodigo && registro.grupoAcabadoCodigo === entrada.grupoAcabadoCodigo
    && registro.tipoArticuloCodigo === entrada.tipoArticuloCodigo
    && (registro.tamanoCodigo === entrada.tamanoCodigo || registro.tamanoCodigo === '*'))
  const incidencias = new Set<string>()
  const identidades = new Set<string>()
  for (const registro of pertinentes) {
    if (!codigoValido(registro.id) || identidades.has(registro.id)) {
      incidencias.add('identidad de registro ausente o duplicada')
    } else identidades.add(registro.id)
    if (!decimalValido(registro.metrajeDesde) || !decimalValido(registro.metrajeHasta)) {
      incidencias.add('límites de metraje inválidos')
    } else if (compararDecimal(registro.metrajeDesde, registro.metrajeHasta) > 0) {
      incidencias.add('intervalo de metraje invertido')
    }
  }
  if (incidencias.size) return sinRegistro('BLOQUEADO', [...incidencias].sort())
  const intervalo = (registro: RegistroTarifaDinamica): boolean =>
    compararDecimal(registro.metrajeDesde, entrada.metraje!) <= 0
    && compararDecimal(entrada.metraje!, registro.metrajeHasta) <= 0
  const general = (registro: RegistroTarifaDinamica): boolean =>
    compararDecimal(registro.metrajeDesde, '0') === 0 && compararDecimal(registro.metrajeHasta, '0') === 0
  const etapas: readonly [EtapaSeleccionTarifaDinamica, string, (registro: RegistroTarifaDinamica) => boolean][] = [
    ['TAMANO_EXACTO_INTERVALO', entrada.tamanoCodigo!, intervalo],
    ['TAMANO_EXACTO_GENERAL', entrada.tamanoCodigo!, general],
    ['TAMANO_COMODIN_INTERVALO', '*', intervalo],
    ['TAMANO_COMODIN_GENERAL', '*', general],
  ]
  for (const [etapa, tamanoCodigo, cumple] of etapas) {
    const candidatas = pertinentes.filter(registro => registro.tamanoCodigo === tamanoCodigo && cumple(registro))
    if (candidatas.length > 1) {
      return { fuente: FUENTE, estado: 'AMBIGUO', etapa, registro: null,
        registrosAmbiguos: candidatas.map(registro => registro.id).sort(), incidencias: [] }
    }
    if (candidatas.length === 1) {
      return { fuente: FUENTE, estado: 'RESUELTO', etapa, registro: copiarCriterios(candidatas[0]!),
        registrosAmbiguos: [], incidencias: [] }
    }
  }
  return sinRegistro('SIN_COINCIDENCIA')
}
