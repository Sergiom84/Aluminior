import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { crearConfiguracionCerramiento, plantillaDiseno } from '@aluminior/core/estructuras'
import { PanelElemento } from './disenador/panel-elemento.tsx'

const panel = (bloqueado: boolean, eliminable: boolean) => {
  const modulo = crearConfiguracionCerramiento(plantillaDiseno('2O')!).modulos[0]
  return renderToStaticMarkup(<PanelElemento
    modulo={modulo} borrador={{ anchoMm: NaN, altoMm: NaN }} indice={1}
    rect={{ x: 0, y: 0, ancho: modulo.anchoMm, alto: modulo.altoMm }}
    pendiente bloqueado={bloqueado} preparada={null} eliminable={eliminable}
    generales={{ serieCodigo: null, vidrioCodigo: null }} series={[]} moviendo={false} movible
    onChange={vi.fn()} onActualizar={vi.fn()} onDescartar={vi.fn()} onSustituir={vi.fn()}
    onEliminar={vi.fn()} onMover={vi.fn()} />)
}
const eliminarDeshabilitado = (html: string) =>
  /<button[^>]*disabled=""[^>]*>Eliminar elemento<\/button>/.test(html)

describe('Eliminar elemento con cambios pendientes', () => {
  it('sigue disponible aunque haya cambios sin actualizar (un elemento recién añadido nace pendiente)', () => {
    expect(eliminarDeshabilitado(panel(true, true))).toBe(false)
  })
  it('el elemento raíz no se elimina', () => {
    expect(eliminarDeshabilitado(panel(false, false))).toBe(true)
  })
})
