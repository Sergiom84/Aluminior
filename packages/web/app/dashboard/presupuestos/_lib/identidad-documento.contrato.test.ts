import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const leer = (ruta: URL) => readFileSync(fileURLToPath(ruta), 'utf8')

describe('contratos de identidad del alta y el detalle', () => {
  it('el alta obtiene la fecha civil mediante la autoridad Europe/Madrid', () => {
    const acciones = leer(new URL('./acciones.ts', import.meta.url))

    expect(acciones).toMatch(/import\s*\{\s*fechaLocalMadrid\s*\}\s*from\s*['"]\.\/fecha-local\.ts['"]/) 
    expect(acciones).toMatch(/const fecha = fechaLocalMadrid\(\)/)
    expect(acciones).not.toMatch(/const fecha = new Date\(\)\.toISOString\(\)\.slice\(0, 10\)/)
  })

  it('el detalle compone el título con número y revisión', () => {
    const detalle = leer(new URL('../[id]/page.tsx', import.meta.url))

    expect(detalle).toMatch(/referenciaPresupuesto\(p\.numero, p\.revision\)/)
  })
})
