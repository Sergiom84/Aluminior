/** Frecuencias agregadas del contraste: sin documentos, clientes ni importes individuales. */
import type { ContrasteGrupo } from './ejecutar.ts'
import type { Causa, Resultado } from './clasificar.ts'

const r2 = (v: number) => Math.round(v * 100) / 100
const linea = (g: ContrasteGrupo) => g.esperado * g.cantidad

export function resumirContraste(gs: readonly ContrasteGrupo[]) {
  const resultados: Resultado[] = ['coincide', 'difiere', 'sin-valorar', 'no-reproducible', 'excluido']
  const porResultado = Object.fromEntries(resultados.map(r => {
    const xs = gs.filter(g => g.clasificacion.resultado === r)
    return [r, { grupos: xs.length, documentos: new Set(xs.map(g => g.documento)).size, importeLineas: r2(xs.reduce((s, g) => s + linea(g), 0)) }]
  }))
  const causas = new Map<Causa, { grupos: number; principal: number; documentos: Set<string>; importeLineas: number; atribuible: number; medidos: number }>()
  for (const g of gs) for (const c of g.clasificacion.causas) {
    const a = causas.get(c) ?? { grupos: 0, principal: 0, documentos: new Set<string>(), importeLineas: 0, atribuible: 0, medidos: 0 }
    a.grupos++; a.documentos.add(g.documento); a.importeLineas += linea(g)
    if (g.clasificacion.principal === c) a.principal++
    const v = g.clasificacion.importes[c]
    if (v !== undefined) { a.atribuible += v * g.cantidad; a.medidos++ }
    causas.set(c, a)
  }
  const reparto: Record<string, number> = {}, patrones: Record<string, number> = {}, uniones: Record<string, number> = {}
  for (const g of gs) {
    reparto[g.reparto.estado] = (reparto[g.reparto.estado] ?? 0) + 1
    for (const p of g.reparto.patrones) patrones[p] = (patrones[p] ?? 0) + 1
    for (const u of g.reparto.uniones) {
      const k = `${u.codigo === 'U' ? 'U' : 'perfil'}|${u.patron}|alturas-${u.alturasDistintas ? 'distintas' : 'iguales'}${u.invisible ? '|invisible' : ''}`
      uniones[k] = (uniones[k] ?? 0) + 1
    }
  }
  return {
    grupos: gs.length, documentos: new Set(gs.map(g => g.documento)).size, nuevosDesdeJulio: gs.filter(g => g.nuevo).length,
    porResultado, porResultadoNuevos: Object.fromEntries(resultados.map(r => [r, gs.filter(g => g.nuevo && g.clasificacion.resultado === r).length])),
    causas: [...causas].map(([causa, a]) => ({ causa, grupos: a.grupos, principal: a.principal, documentos: a.documentos.size,
      importeLineas: r2(a.importeLineas), atribuible: r2(a.atribuible), atribuibleMedido: a.medidos }))
      .sort((x, y) => y.importeLineas - x.importeLineas),
    reparto, patrones, uniones: Object.fromEntries(Object.entries(uniones).sort()),
    sinReconciliar: gs.filter(g => !g.reconciliado).length,
    nota: 'Causas solapadas: un GRUPO puede tener varias. Importe de líneas = precio de Productor × cantidad; atribuible = parte medida de la causa.',
  }
}
