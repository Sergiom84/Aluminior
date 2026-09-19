/** Hipótesis de asignación, NO cargador ni resolución operativa.
 * node --import tsx scripts/herraje-contraste.mjs <CSV autorizados>
 * Sólo imprime agregados/códigos; las referencias documentales no salen del proceso.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse/sync'
import { medirHerrajeConjuntos } from '../packages/etl/src/medir-herrajes.ts'

const carpeta = process.argv[2]
if (!carpeta) throw new Error('Indique carpeta CSV histórica autorizada')
const leer = n => parse(readFileSync(join(carpeta, `${n}.csv`)), { columns: true, bom: true })
const config = new Map(leer('ConfigSeries').map(f => [f.Serie, f]))
const tipos = new Map()
for (const f of leer('EstructurasDiseño')) {
  if (f.TipoDoc.trim() || f.Tipo !== '3') continue
  const set = tipos.get(f.Estructura) ?? new Set()
  set.add(Number(f.TipoHoja))
  tipos.set(f.Estructura, set)
}
// Hipótesis limitada: describe grupos de apertura, no cuenta hojas ni bisagras.
// No se usa familia ni texto/código de estructura como clasificador.
const campoPorTipo = new Map([[1, 'Abat1H'], [2, 'Abat1H'], [5, 'Abat1OB'],
  [6, 'Abat1OB'], [7, 'Abat2H'], [8, 'Abat2OB'], [9, 'Abat2OB']])
const medida = await medirHerrajeConjuntos(carpeta)
const casos = medida.reglas.map(r => {
  const hojas = [...(tipos.get(r.estructura_codigo) ?? [])]
  const campos = [...new Set(hojas.map(t => campoPorTipo.get(t)))]
  const serie = config.get(r.serie_codigo)
  const sinResolver = !hojas.length || campos.some(c => !c || !serie?.[c]?.trim())
  const candidatos = sinResolver ? [] : [...new Set([r.serie_codigo,
    ...campos.map(c => serie[c].trim())])].sort()
  return {
    serie: r.serie_codigo, estructura: r.estructura_codigo, tipos: hojas,
    campos, muestras: r.muestras, total: r.total_muestras,
    historico: r.conjuntos, candidato: candidatos.join('+'),
    resultado: sinResolver ? 'desconocido' :
      candidatos.join('+') === r.conjuntos ? 'coincide' : 'discrepa',
  }
})
console.log(JSON.stringify({
  reglas: casos.length,
  resultados: Object.fromEntries(['coincide', 'discrepa', 'desconocido']
    .map(k => [k, casos.filter(c => c.resultado === k).length])),
  casos,
}, null, 2))
