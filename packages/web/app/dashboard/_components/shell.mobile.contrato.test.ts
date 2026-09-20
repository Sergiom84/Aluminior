import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const leer = (ruta: URL) => readFileSync(fileURLToPath(ruta), 'utf8')
const css = ['marco', 'adaptacion'].map((nombre) =>
  leer(new URL(`../../styles/${nombre}.css`, import.meta.url)),
).join('\n')
const shell = leer(new URL('./shell.tsx', import.meta.url))

describe('contrato móvil del shell operativo', () => {
  it('mantiene todos los módulos en un carril horizontal que no encoge sus enlaces', () => {
    expect(css).toMatch(/\.al-primary-nav\s*>\s*ul\s*{[^}]*width:\s*max-content;[^}]*min-width:\s*max-content;/s)
    expect(css).toMatch(/\.al-primary-nav li\s*{[^}]*flex:\s*0 0 auto;/s)
    expect(css).toMatch(/\.al-primary-nav\s*{[^}]*overflow-x:\s*auto;/s)
  })

  it('reserva en móvil espacio independiente para navegación y salida', () => {
    const movil = css.match(/@media \(max-width:\s*760px\)\s*{([\s\S]*)\n}/)?.[1] ?? ''

    expect(movil).toMatch(/\.al-appbar\s*{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*minmax\(0, 1fr\) auto;/s)
    expect(movil).toMatch(/\.al-primary-nav\s*{[^}]*grid-column:\s*1;[^}]*width:\s*100%;/s)
    expect(movil).toMatch(/\.al-session-form\s*{[^}]*grid-column:\s*2;/s)
  })

  it('conserva foco semántico y targets táctiles de al menos 44 px', () => {
    expect(shell).toContain('<nav className="al-primary-nav" aria-label="Módulos">')
    expect(shell).toContain("aria-current={activo ? 'page' : undefined}")
    expect(shell).toContain('className="al-session-exit"')
    expect(css).toMatch(/\.al-session-exit\s*{[^}]*min-width:\s*44px;[^}]*min-height:\s*44px;/s)
    expect(css).toMatch(/@media \(max-width:\s*760px\)[\s\S]*\.al-primary-nav a\s*{[^}]*min-height:\s*44px;/s)
  })
})
