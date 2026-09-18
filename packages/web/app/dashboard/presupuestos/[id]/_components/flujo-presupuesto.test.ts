import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const leer = (relativo: string) =>
  readFileSync(new URL(relativo, import.meta.url), 'utf8')

describe('flujo de alta de presupuesto', () => {
  it('parte del escaparate: radios Estructuras/Artículos y botón Cerramiento', () => {
    const alta = leer('./anyadir-linea.tsx')
    expect(alta).toContain("useState<TipoLinea>('ESTRUCTURA')")
    expect(alta).toContain("['ESTRUCTURA', 'Estructuras']")
    expect(alta).toContain("['ARTICULO', 'Artículos']")
    expect(alta).not.toContain("['CERRAMIENTO', 'Cerramiento']")
    expect(alta).toContain("elegirTipo('CERRAMIENTO')")
    expect(alta).toContain('Cerramiento')
    expect(alta).toContain('<Escaparate onElegir={elegirPlantilla} />')
    expect(alta).toContain('<EditorLineaEstructura')
  })

  it('reabre el escaparate tras un alta correcta', () => {
    const alta = leer('./anyadir-linea.tsx')
    expect(alta).toContain('if (estado?.ok) resetTrasAlta()')
    expect(alta).toContain('setPlantilla(null)')
  })

  it('mantiene lista y ficha como vistas del mismo documento', () => {
    const lista = leer('../../page.tsx')
    const ficha = leer('../page.tsx')
    expect(lista).toContain('<PestanasDocumento vista="lista" />')
    expect(ficha).toContain('<PestanasDocumento vista="ficha"')
    expect(ficha).toContain('className="al-document-window"')
  })
})
