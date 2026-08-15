import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const directorio = new URL('./', import.meta.url)
const css = readFileSync(new URL('presupuesto-movil.module.css', directorio), 'utf8')
const detalle = readFileSync(new URL('page.tsx', directorio), 'utf8')
const alta = readFileSync(new URL('_components/anyadir-linea.tsx', directorio), 'utf8')
const edicion = readFileSync(new URL('_components/editar-cerramiento.tsx', directorio), 'utf8')
const disenador = readFileSync(new URL('_components/disenador-estructura.tsx', directorio), 'utf8')
const linea = readFileSync(new URL('_components/linea-presupuesto.tsx', directorio), 'utf8')

describe('contrato móvil del editor de presupuestos', () => {
  it('activa el layout estrecho hasta 620 px sin depender del ancho del contenedor', () => {
    expect(css).toContain('@media (max-width: 620px)')
    expect(css).toMatch(/\.fields\s*>\s*\*\s*{[\s\S]*?grid-column:\s*1\s*\/\s*-1\s*!important/)
    expect(css).toMatch(/\.workFields\s*{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)/)
    expect(alta).toContain('className={styles.fields}')
    expect(edicion).toContain('styles.fields')
    expect(edicion).toContain('styles.workFields')
  })

  it('mantiene catálogo y tablas dentro de desplazadores locales accesibles', () => {
    expect(css).toMatch(/\.tableScroll,[\s\S]*?overflow-x:\s*auto/)
    expect(css).toMatch(/\.budgetTable\s*{[\s\S]*?min-width:\s*760px/)
    expect(css).toMatch(/\.designer\s+:global\(\.al-designer-catalog\)/)
    expect(detalle).toContain('styles.tableScroll')
    expect(detalle).toContain('tabIndex={0}')
    expect(detalle).toContain('aria-label="Líneas del presupuesto, tabla desplazable"')
    expect(linea).toContain('tabIndex={0}')
    expect(linea).toContain('aria-label="Despiece desplazable"')
  })

  it('aplica el contrato al diseñador, acciones y tarjeta de edición reales', () => {
    expect(disenador).toContain('styles.designer')
    expect(alta).toContain('styles.formCard')
    expect(edicion).toContain('styles.editorForm')
    expect(edicion).toContain('styles.formActions')
    expect(linea).toContain('styles.editorCell')
    expect(css).toMatch(/\.editorForm\s*{[\s\S]*?position:\s*sticky;[\s\S]*?left:\s*\.5rem;/)
  })
})
