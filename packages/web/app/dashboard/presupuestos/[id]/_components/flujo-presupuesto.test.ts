import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const leer = (relativo: string) =>
  readFileSync(new URL(relativo, import.meta.url), 'utf8')

describe('flujo de alta de presupuesto', () => {
  it('abre en el configurador de cerramientos unificado, con Artículos a un clic', () => {
    const alta = leer('./anyadir-linea.tsx')
    expect(alta).toContain("useState<TipoLinea>('CERRAMIENTO')")
    expect(alta).toContain("['CERRAMIENTO', 'Cerramiento']")
    expect(alta).toContain("['ARTICULO', 'Artículos']")
    expect(alta).not.toContain("['ESTRUCTURA', 'Catálogo']")
    expect(alta).toContain('opcionesCatalogo={{')
    expect(alta).toContain('onHerrajeChange: setHerraje')
    expect(alta).toContain('onAcristalamientoChange: setAcristalamiento')
  })

  it('tras crear el presupuesto sustituye el alta en el historial, no la apila', () => {
    const alta = leer('../../nuevo/use-alta-presupuesto.ts')
    expect(alta).toContain('router.replace(`/dashboard/presupuestos/${resultado.id}#configurador`)')
    expect(alta).not.toContain('router.push(`/dashboard/presupuestos/${resultado.id}')
  })

  it('el alta no ofrece Potencial y muestra el Nº Presupuesto asignado', () => {
    const nuevo = leer('../../nuevo/page.tsx')
    expect(nuevo).not.toContain('potencialCodigo')
    expect(nuevo).toContain('Nº Presupuesto')
    expect(nuevo).toContain('siguienteNumeroPresupuesto')
  })

  it('reinicia el configurador tras un alta correcta', () => {
    const alta = leer('./anyadir-linea.tsx')
    expect(alta).toContain('if (estado?.ok) resetTrasAlta()')
    expect(alta).toContain('setConfiguracion(null)')
  })

  it('mantiene lista y ficha como vistas del mismo documento', () => {
    const lista = leer('../../page.tsx')
    const ficha = leer('../page.tsx')
    expect(lista).toContain('<PestanasDocumento vista="lista" />')
    expect(ficha).toContain('<PestanasDocumento vista="ficha"')
    expect(ficha).toContain('className="al-document-window"')
  })
})
