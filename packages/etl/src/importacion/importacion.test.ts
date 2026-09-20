import { readFileSync, rmSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { importarCatalogo } from './index.ts'
import { crearEscenario } from './pruebas/escenario.ts'

describe('importación por módulos', () => {
  it('conserva operaciones, orden, conversiones y descartes del importador anterior', async () => {
    const { origen, sql, operaciones } = crearEscenario()
    try {
      const resultados = await importarCatalogo(sql, origen)
      const obtenido = JSON.parse(JSON.stringify({
        operaciones,
        resultados: resultados.map(r => ({ ...r, motivos: [...r.motivos] })),
      }))
      // Capturado ANTES de la extracción con este mismo catálogo sintético.
      const anterior = JSON.parse(readFileSync(new URL('./pruebas/importacion-anterior.json', import.meta.url), 'utf8'))
      expect(obtenido).toEqual(anterior)
    } finally {
      rmSync(origen, { recursive: true, force: true })
    }
  })
})
