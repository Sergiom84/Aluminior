import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { textoTotalListado } from './listado-presupuestos.ts'

describe('lista de presupuestos', () => {
  const euros = (valor: number) => `${valor.toFixed(2)} EUR`

  it('no convierte en cero una línea con valoración incompleta', () => {
    expect(textoTotalListado('0.00', true, euros)).toBe('sin valorar')
  })

  it('no presenta un total de cabecera nulo como cero', () => {
    expect(textoTotalListado(null, false, euros)).toBe('sin valorar')
  })

  it('formatea un presupuesto completamente valorado, incluido el cero real', () => {
    expect(textoTotalListado('125.50', false, euros)).toBe('125.50 EUR')
    expect(textoTotalListado('0.00', false, euros)).toBe('0.00 EUR')
  })

  it('busca también por el cliente unido y su código canónico', () => {
    const pagina = readFileSync(new URL('../page.tsx', import.meta.url), 'utf8')
    const bloqueFiltro = pagina.slice(pagina.indexOf('const filtro'), pagina.indexOf('const filas'))

    expect(bloqueFiltro).toContain('schema.clientes.nombre')
    expect(bloqueFiltro).toContain('schema.presupuestos.clienteCodigo')
  })

  it('no aplica acciones globales a la primera fila y ofrece acciones inequívocas por fila', () => {
    const pagina = readFileSync(new URL('../page.tsx', import.meta.url), 'utf8')
    const lista = readFileSync(new URL('../_components/lista-presupuestos.tsx', import.meta.url), 'utf8')

    expect(pagina).not.toContain('const presupuestoActivo = filas[0]')
    expect(lista).not.toContain('filas[0]')
    expect(lista).toContain('href={`/dashboard/presupuestos/${p.id}/pdf`}')
    expect(lista).toContain('<CopiarRevisionBoton presupuestoId={p.id}')
  })

  it('opera sobre la fila seleccionada, no sobre la primera', () => {
    const lista = readFileSync(new URL('../_components/lista-presupuestos.tsx', import.meta.url), 'utf8')
    expect(lista).toContain('aria-selected={seleccionado === p.id}')
    expect(lista).toContain('disabled={!activo}')
  })
})
