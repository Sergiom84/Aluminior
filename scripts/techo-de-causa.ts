/**
 * Techo de una causa del banco, solo lectura, para decidir la unidad siguiente.
 *
 * Existe para que el techo se calcule y no se opine: cuántas líneas exactas
 * puede mover una causa, a qué estado están hoy, cuánto valor hay detrás y qué
 * otras causas arrastran esas mismas líneas. Una causa que comparte todas sus
 * líneas con `pvp-o-tarifa` no va a producir igualdades por mucha regla que
 * reconstruyas.
 *
 * Uso: node --import tsx scripts/techo-de-causa.ts [patrón] [--aviso texto]
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseArgs } from 'node:util'
import type { Medicion } from './lib/banco-contraste/datos.ts'

const { positionals, values } = parseArgs({ allowPositionals: true, options: {
  resultados: { type: 'string', default: 'export_datos/banco-contraste/resultados.json' },
  aviso: { type: 'string' },
} })

const datos = JSON.parse(readFileSync(resolve(values.resultados!), 'utf8')) as {
  ejecutado: string; revisionGit: string; mediciones: Medicion[]
}
const patron = positionals[0]?.toLowerCase()

function techo(causa: string, lineas: readonly Medicion[]) {
  const estados: Record<string, number> = {}
  for (const m of lineas) estados[m.estado] = (estados[m.estado] ?? 0) + 1
  const coCausas: Record<string, number> = {}
  for (const m of lineas) for (const c of m.causas) if (c !== causa) coCausas[c] = (coCausas[c] ?? 0) + 1
  const medibles = lineas.filter(m => m.obtenido !== null)
  const céntimos = (n: number) => Math.round(n * 100)
  return {
    causa,
    lineas: lineas.length,
    identidades: lineas.map(m => m.id),
    estados,
    esperadoAgregado: céntimos(lineas.reduce((s, m) => s + m.esperado, 0)) / 100,
    desviacionMedible: medibles.reduce((s, m) => s + Math.abs(céntimos(m.obtenido!) - céntimos(m.esperado)), 0) / 100,
    sinImporteCalculado: lineas.length - medibles.length,
    conTarifaPosterior: lineas.filter(m => m.tarifaPosterior === true).length,
    // Compartidas con todas sus líneas: resolver la causa no las vuelve iguales.
    coCausasEnTodas: Object.entries(coCausas).filter(([, n]) => n === lineas.length).map(([c]) => c).sort(),
    coCausas: Object.fromEntries(Object.entries(coCausas).sort((a, b) => b[1] - a[1])),
  }
}

const porCausa = new Map<string, Medicion[]>()
for (const m of datos.mediciones) {
  for (const c of m.causas) {
    if (patron && !c.toLowerCase().includes(patron)) continue
    porCausa.set(c, [...(porCausa.get(c) ?? []), m])
  }
}

const porAviso = values.aviso
  ? datos.mediciones.filter(m => m.avisos.some(a => a.toLowerCase().includes(values.aviso!.toLowerCase())))
  : null

console.log(JSON.stringify({
  ejecutado: datos.ejecutado,
  revisionGit: datos.revisionGit,
  total: datos.mediciones.length,
  causas: [...porCausa.entries()].map(([c, l]) => techo(c, l)).sort((a, b) => b.lineas - a.lineas),
  ...(porAviso ? { porAviso: techo(`aviso: ${values.aviso}`, porAviso) } : {}),
}, null, 2))
