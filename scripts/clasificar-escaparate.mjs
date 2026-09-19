/** Ejecutar con node >=22 o npx tsx. Solo lee CSV de catálogo. */
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { leerCatalogoDiseno, firmaDibujo } from './lib/catalogo-diseno.mjs'
import { generarPlantillaCatalogo } from '../packages/core/src/estructuras/diseno-catalogo.ts'
import { PLANTILLAS_DISENO } from '../packages/core/src/estructuras/diseno.ts'

const raiz = resolve(fileURLToPath(new URL('..', import.meta.url)))
const origen = resolve(process.argv[2] ?? join(raiz, 'export_datos', 'EMP0016'))
// Destino fijo dentro de output/ (ignorado); no permite exportar datos al código.
const destino = join(raiz, 'output', 'escaparate')
const { estructuras, familias } = leerCatalogoDiseno(origen)
const resultados = estructuras.map(e => ({ codigo: e.codigo, familia: e.familiaCodigo,
  ...generarPlantillaCatalogo(e) }))
const golden = PLANTILLAS_DISENO.map(actual => {
  const generada = resultados.find(r => r.codigo === actual.codigo)
  if (generada?.estado !== 'dibujable') return { codigo: actual.codigo, estado: 'pendiente',
    motivos: generada?.motivos ?? ['ausente'] }
  return { codigo: actual.codigo, estado: 'comparada',
    mismoDibujo: JSON.stringify(firmaDibujo(actual)) === JSON.stringify(firmaDibujo(generada.plantilla)),
    mismasMedidas: actual.anchoMm === generada.plantilla.anchoMm && actual.altoMm === generada.plantilla.altoMm }
})
const familiasInforme = [...familias]
for (const codigo of new Set(resultados.map(r => r.familia))) {
  if (!familiasInforme.some(f => f.codigo === codigo)) familiasInforme.push({ codigo,
    descripcion: codigo ? 'Familia sin ficha' : 'Sin familia', orden: 999 })
}
const resumen = familiasInforme.filter(f => resultados.some(r => r.familia === f.codigo)).map(f => ({
  familia: f.codigo, descripcion: f.descripcion,
  total: resultados.filter(r => r.familia === f.codigo).length,
  dibujables: resultados.filter(r => r.familia === f.codigo && r.estado === 'dibujable').length,
}))
mkdirSync(destino, { recursive: true })
writeFileSync(join(destino, 'catalogo.json'), JSON.stringify({ version: 1,
  nota: 'Candidatas visuales a la medida inicial; sin garantía al redimensionar. No habilitadas comercialmente ni verificadas en precio.', resultados }, null, 2))
writeFileSync(join(destino, 'control-golden.json'), JSON.stringify(golden, null, 2))
writeFileSync(join(destino, 'resumen.json'), JSON.stringify(resumen, null, 2))
console.log(JSON.stringify({ total: resultados.length, resumen, golden }, null, 2))
