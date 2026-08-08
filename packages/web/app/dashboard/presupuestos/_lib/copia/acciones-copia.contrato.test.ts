/**
 * Guarda de contrato (T.72.2): las dos únicas acciones productivas de
 * `_lib/copia/` fijan su estrategia por dentro y no aceptan nada más desde
 * fuera. Barre los ficheros REALES en vez de confiar en que nadie los
 * cambie sin que esta prueba se entere.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { copiarComoRevision } from './copiar-revision-identica.ts'
import { copiarComoNuevo } from './copiar-como-nuevo.ts'

const leer = (nombre: string) => readFileSync(fileURLToPath(new URL(`./${nombre}`, import.meta.url)), 'utf8')

// Sólo el código, sin el bloque de comentario de cabecera: la prosa explica
// el porqué y menciona términos (FormData, estrategia...) que no cuentan.
const codigoDe = (fuente: string) => fuente.slice(fuente.indexOf('*/') + 2)

describe('acciones productivas de copia idéntica: fijan su estrategia, nada más desde fuera', () => {
  const revision = leer('copiar-revision-identica.ts')
  const nuevo = leer('copiar-como-nuevo.ts')

  it('el barrido encontró los dos ficheros reales de las acciones', () => {
    expect(revision.length).toBeGreaterThan(0)
    expect(nuevo.length).toBeGreaterThan(0)
    expect(typeof copiarComoRevision).toBe('function')
    expect(typeof copiarComoNuevo).toBe('function')
  })

  it('copiarComoRevision fija MISMO_NUMERO_NUEVA_REVISION', () => {
    expect(revision).toMatch(/copiarIdentica\(\s*['"]MISMO_NUMERO_NUEVA_REVISION['"]/)
  })

  it('copiarComoNuevo fija NUEVO_NUMERO', () => {
    expect(nuevo).toMatch(/copiarIdentica\(\s*['"]NUEVO_NUMERO['"]/)
  })

  it('ninguna acción lee FormData: la única entrada es el id del presupuesto', () => {
    for (const codigo of [codigoDe(revision), codigoDe(nuevo)]) {
      expect(codigo).not.toMatch(/FormData/)
      expect(codigo).not.toMatch(/\.get\(/)
    }
  })

  it('ninguna firma exportada acepta estrategia, número, revisión, serie, mapa, selección o regeneración', () => {
    const prohibidos = [
      'mapa', 'seleccion', 'destinoManual', 'regenerarDescripcion', 'regenerarDibujo',
      'detalleEstructuras', 'estrategia', 'numero', 'revision', 'serie',
    ]
    for (const [fuente, nombre] of [[revision, 'copiarComoRevision'], [nuevo, 'copiarComoNuevo']] as const) {
      const firma = fuente.match(new RegExp(`export async function ${nombre}\\(([^)]*)\\)`))
      expect(firma).not.toBeNull()
      const parametros = firma![1]
      expect(parametros).toMatch(/^presupuestoId:\s*string$/)
      for (const prohibido of prohibidos) expect(parametros).not.toContain(prohibido)
    }
  })

  it('las funciones exportadas sólo declaran un parámetro (comprobación en tiempo de ejecución)', () => {
    expect(copiarComoRevision.length).toBe(1)
    expect(copiarComoNuevo.length).toBe(1)
  })
})
