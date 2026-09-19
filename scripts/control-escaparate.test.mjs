import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { leerCatalogoDiseno, firmaDibujo } from './lib/catalogo-diseno.mjs'
import { generarPlantillaCatalogo } from '../packages/core/src/estructuras/diseno-catalogo.ts'
import { PLANTILLAS_DISENO } from '../packages/core/src/estructuras/diseno.ts'

// Control local opcional: los CSV reales NO forman parte de la suite distribuida.
const origen = fileURLToPath(new URL('../export_datos/EMP0016/', import.meta.url))
const disponible = existsSync(`${origen}/EstructurasDiseño.csv`)
const estructuras = disponible ? leerCatalogoDiseno(origen).estructuras : []
const diferenciasDibujo = new Set(['1O1FL', '1O2FL', '1O+1F+1O', '1O+2F+1O', '2O+ FIJO'])
const diferenciasMedidas = new Set([...diferenciasDibujo, '1OFI'])

for (const anterior of PLANTILLAS_DISENO) {
  test(`control ${anterior.codigo}: coincidencia o divergencia documentada`, { skip: !disponible }, () => {
    const entrada = estructuras.find(e => e.codigo === anterior.codigo)
    assert.ok(entrada)
    const generado = generarPlantillaCatalogo(entrada)
    assert.equal(generado.estado, 'dibujable')
    const igualDibujo = JSON.stringify(firmaDibujo(anterior)) === JSON.stringify(firmaDibujo(generado.plantilla))
    assert.equal(igualDibujo, !diferenciasDibujo.has(anterior.codigo), 'Revisar EVIDENCIA-ESCAPARATE.md')
    const igualMedidas = anterior.anchoMm === generado.plantilla.anchoMm && anterior.altoMm === generado.plantilla.altoMm
    assert.equal(igualMedidas, !diferenciasMedidas.has(anterior.codigo))
  })
}
