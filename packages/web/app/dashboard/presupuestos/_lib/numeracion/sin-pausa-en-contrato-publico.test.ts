/**
 * Guarda de ausencia (T.71.4): el gancho de pausa de las pruebas de
 * concurrencia (`pausaTrasLecturaMs`, antes `_pausaTrasLecturaMs` en el
 * contrato público) no debe ser alcanzable desde ningún consumidor de
 * producción. Sólo `reservar.ts` —donde vive la implementación interna— lo
 * conoce; `index.ts` (la frontera pública) y los consumidores no.
 *
 * Barre los ficheros REALES de `_lib/numeracion`, `_lib/copia` y
 * `_lib/presupuestos`, más `acciones.ts`, en vez de comprobar una lista
 * escrita a mano.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

describe('el contrato público no expone el gancho de pausa de pruebas', () => {
  it('barre _lib/numeracion, _lib/copia, _lib/presupuestos y acciones.ts', () => {
    const numeracionDir = fileURLToPath(new URL('.', import.meta.url))
    const libDir = fileURLToPath(new URL('..', import.meta.url))
    const copiaDir = `${libDir}copia/`
    const presupuestosDir = `${libDir}presupuestos/`

    // Sólo ficheros de PRODUCCIÓN: los `.test.ts` legítimamente componen el
    // gancho para forzar concurrencia, que es justo lo que están probando.
    const esProduccion = (f: string) => f.endsWith('.ts') && !f.includes('.test.') && !f.includes('.tipos-')

    const rutas = [
      ...readdirSync(numeracionDir).filter(esProduccion).map((f) => `${numeracionDir}${f}`),
      ...readdirSync(copiaDir).filter(esProduccion).map((f) => `${copiaDir}${f}`),
      ...readdirSync(presupuestosDir).filter(esProduccion).map((f) => `${presupuestosDir}${f}`),
      `${libDir}acciones.ts`,
    ]
    // Confirma que el barrido examinó ficheros reales, no una lista vacía.
    expect(rutas.length).toBeGreaterThan(5)

    // Excepciones documentadas: donde vive cada gancho interno.
    const excepciones = new Set([
      `${numeracionDir}reservar.ts`,
      `${presupuestosDir}crear-presupuesto.ts`,
      `${copiaDir}copiar-presupuesto.ts`,
    ])

    const conGancho = rutas
      .filter((ruta) => !excepciones.has(ruta))
      .filter((ruta) => /pausaTrasLectura/i.test(readFileSync(ruta, 'utf8')))

    expect(conGancho).toEqual([])
  })
})
