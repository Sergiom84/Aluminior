/**
 * Guarda de contrato (T.72.1): la única acción productiva que hoy invoca
 * `copiarPresupuesto` debe fijar la copia idéntica por dentro y no debe poder
 * recibir mapa, selección, destino manual ni regeneración desde fuera. Barre
 * el fichero REAL de la acción en vez de confiar en que nadie lo cambie sin
 * que esta prueba se entere.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { copiarComoRevision } from './copiar-revision-identica.ts'

describe('copiarComoRevision fija la copia idéntica y no admite parámetros externos', () => {
  const ruta = fileURLToPath(new URL('./copiar-revision-identica.ts', import.meta.url))
  const fuente = readFileSync(ruta, 'utf8')
  // Sólo el código, sin el bloque de comentario de cabecera: la prosa explica
  // por qué la acción NO usa FormData, y esa mención legítima no debe contarse.
  const codigo = fuente.slice(fuente.indexOf('*/') + 2)

  it('el barrido encontró el fichero real de la acción', () => {
    expect(fuente.length).toBeGreaterThan(0)
    expect(typeof copiarComoRevision).toBe('function')
  })

  it('usa MISMO_NUMERO_NUEVA_REVISION como estrategia de destino', () => {
    expect(fuente).toMatch(/estrategia:\s*['"]MISMO_NUMERO_NUEVA_REVISION['"]/)
  })

  it('usa MAPA_VACIO como mapa de sustitución', () => {
    expect(fuente).toMatch(/import\s*\{\s*MAPA_VACIO\s*\}/)
    expect(fuente).toMatch(/mapa:\s*MAPA_VACIO/)
  })

  it('no lee FormData: la única entrada es el id del presupuesto', () => {
    expect(codigo).not.toMatch(/FormData/)
    expect(codigo).not.toMatch(/\.get\(/)
  })

  it('no acepta mapa, selección, destino manual ni regeneración como parámetros', () => {
    // La firma exportada declara un único parámetro de tipo string.
    const firma = fuente.match(/export async function copiarComoRevision\(([^)]*)\)/)
    expect(firma).not.toBeNull()
    const parametros = firma![1]
    expect(parametros).toMatch(/^presupuestoId:\s*string$/)
    for (const prohibido of ['mapa', 'seleccion', 'destinoManual', 'regenerarDescripcion', 'regenerarDibujo', 'detalleEstructuras']) {
      expect(parametros).not.toContain(prohibido)
    }
  })
})
