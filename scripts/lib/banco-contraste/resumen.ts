import type { Caso, Medicion, Estado } from './datos.ts'
export function resumir(casos: readonly Caso[], mediciones: readonly Medicion[]) {
  const estados: Estado[] = ['igual', 'cercano', 'distinto', 'sin valorar', 'error']
  function conteo(xs: readonly Medicion[]) {
    const cantidades = Object.fromEntries(estados.map(s => [s, xs.filter(x => x.estado === s).length])) as Record<Estado, number>
    return { lineas: xs.length, ...cantidades,
      porcentajeIgual: xs.length ? xs.filter(x => x.estado === 'igual').length * 100 / xs.length : null }
  }
  const modelos = [...new Set(casos.map(c => c.modelo))]
  const exclusiones: Record<string, number> = {}, excluidasPrimarias: Record<string, number> = {}
  for (const c of casos.filter(c => c.exclusiones.length)) {
    excluidasPrimarias[c.exclusiones[0]!] = (excluidasPrimarias[c.exclusiones[0]!] ?? 0) + 1
    for (const m of new Set(c.exclusiones)) exclusiones[m] = (exclusiones[m] ?? 0) + 1
  }
  const causas = new Map<string, { causa: string; lineas: number; importeEsperado: number; desviacionMedible: number; sinImporte: number }>()
  for (const m of mediciones.filter(m => m.estado !== 'igual' && m.estado !== 'cercano')) for (const c of new Set(m.causas)) {
    const a = causas.get(c) ?? { causa: c, lineas: 0, importeEsperado: 0, desviacionMedible: 0, sinImporte: 0 }
    a.lineas++; a.importeEsperado += m.esperado
    if (m.diferencia !== null) a.desviacionMedible += Math.abs(m.diferencia); else a.sinImporte++
    causas.set(c, a)
  }
  return { total: conteo(mediciones), excluidas: casos.filter(c => c.exclusiones.length).length,
    universo: casos.length, exclusiones, excluidasPrimarias,
    porModelo: modelos.map(modelo => ({ modelo, universo: casos.filter(c => c.modelo === modelo).length,
      excluidas: casos.filter(c => c.modelo === modelo && c.exclusiones.length).length,
      ...conteo(mediciones.filter(m => m.modelo === modelo)) })).sort((a, b) => b.lineas - a.lineas || a.modelo.localeCompare(b.modelo)),
    porAno: ['2026', '2025'].map(ano => ({ ano, ...conteo(mediciones.filter(m => m.fecha.startsWith(ano))) })),
    porFechaTarifa: ['anterior-o-igual', 'posterior', 'desconocida'].map(v => ({ contexto: v,
      ...conteo(mediciones.filter(m => v === 'posterior' ? m.tarifaPosterior === true : v === 'desconocida' ? m.tarifaPosterior === null : m.tarifaPosterior === false)) })),
    causas: [...causas.values()].map(c => ({ ...c, importeEsperado: Math.round(c.importeEsperado * 100) / 100,
      desviacionMedible: Math.round(c.desviacionMedible * 100) / 100 })).sort((a, b) => b.lineas - a.lineas || b.importeEsperado - a.importeEsperado),
    nota: 'Causas solapadas de diagnóstico, no prueba de causalidad ni promesa de líneas que un arreglo resolverá. Importes unitarios agregados.',
  }
}
