/**
 * Techo de una causa del banco, solo lectura, para decidir la unidad siguiente.
 *
 * Existe para que el techo se calcule y no se opine: cuántas líneas exactas
 * puede mover una causa, en qué estado están hoy, cuánto valor hay detrás y qué
 * otras causas arrastran esas mismas líneas. `coCausasEnTodas` es la que decide:
 * una causa que comparte otro bloqueo con TODAS sus líneas no puede producir
 * igualdades por mucha regla que reconstruyas.
 *
 * JavaScript plano a propósito, sin `tsx`: tiene que arrancar en sandboxes donde
 * el worker de esbuild no puede hacer `spawn`.
 *
 * Uso: node scripts/techo-de-causa.mjs [patrón] [--aviso texto] [--resultados ruta]
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseArgs } from 'node:util'

const { positionals, values } = parseArgs({ allowPositionals: true, options: {
  resultados: { type: 'string', default: 'export_datos/banco-contraste/resultados.json' },
  aviso: { type: 'string' },
} })

const datos = JSON.parse(readFileSync(resolve(values.resultados), 'utf8'))
const patron = positionals[0]?.toLowerCase()
const centimos = n => Math.round(n * 100)

function techo(causa, lineas) {
  const estados = {}
  for (const m of lineas) estados[m.estado] = (estados[m.estado] ?? 0) + 1
  const coCausas = {}
  for (const m of lineas) for (const c of m.causas) if (c !== causa) coCausas[c] = (coCausas[c] ?? 0) + 1
  const medibles = lineas.filter(m => m.obtenido !== null)
  return {
    causa,
    lineas: lineas.length,
    identidades: lineas.map(m => m.id),
    estados,
    esperadoAgregado: centimos(lineas.reduce((s, m) => s + m.esperado, 0)) / 100,
    desviacionMedible: medibles.reduce((s, m) => s + Math.abs(centimos(m.obtenido) - centimos(m.esperado)), 0) / 100,
    sinImporteCalculado: lineas.length - medibles.length,
    conTarifaPosterior: lineas.filter(m => m.tarifaPosterior === true).length,
    coCausasEnTodas: Object.entries(coCausas).filter(([, n]) => n === lineas.length).map(([c]) => c).sort(),
    coCausas: Object.fromEntries(Object.entries(coCausas).sort((a, b) => b[1] - a[1])),
  }
}

const porCausa = new Map()
for (const m of datos.mediciones) {
  for (const c of m.causas) {
    if (patron && !c.toLowerCase().includes(patron)) continue
    porCausa.set(c, [...(porCausa.get(c) ?? []), m])
  }
}

const porAviso = values.aviso
  ? datos.mediciones.filter(m => m.avisos.some(a => a.toLowerCase().includes(values.aviso.toLowerCase())))
  : null

console.log(JSON.stringify({
  ejecutado: datos.ejecutado,
  revisionGit: datos.revisionGit,
  total: datos.mediciones.length,
  causas: [...porCausa.entries()].map(([c, l]) => techo(c, l)).sort((a, b) => b.lineas - a.lineas),
  ...(porAviso ? { porAviso: techo(`aviso: ${values.aviso}`, porAviso) } : {}),
}, null, 2))
