import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { catalogosEstructuraListos, claveCatalogoHerraje, type EstadoCargaCatalogo } from './disponibilidad-catalogos.ts'
import { PestanasEditor } from './pestanas-editor.tsx'

describe('disponibilidad de las opciones antes de guardar una estructura', () => {
  const herraje: EstadoCargaCatalogo = { clave: claveCatalogoHerraje('SERIE', '2O'), estado: 'LISTO' }
  const acristalamiento: EstadoCargaCatalogo = { clave: 'SERIE', estado: 'LISTO' }

  it('no permite guardar antes de recibir ambos catálogos', () => {
    expect(catalogosEstructuraListos('SERIE', '2O', null, null)).toBe(false)
    expect(catalogosEstructuraListos('SERIE', '2O', herraje, null)).toBe(false)
    expect(catalogosEstructuraListos('SERIE', '2O', null, acristalamiento)).toBe(false)
  })

  it.each(['PENDIENTE', 'ERROR'] as const)('bloquea %s sin convertirlo en ninguna opción marcada', estado => {
    expect(catalogosEstructuraListos('SERIE', '2O', { ...herraje, estado }, acristalamiento)).toBe(false)
    expect(catalogosEstructuraListos('SERIE', '2O', herraje, { ...acristalamiento, estado })).toBe(false)
  })

  it('una respuesta anterior no desbloquea otra serie ni otro modelo', () => {
    expect(catalogosEstructuraListos('OTRA', '2O', herraje, acristalamiento)).toBe(false)
    expect(catalogosEstructuraListos('SERIE', '1O', herraje, acristalamiento)).toBe(false)
  })

  it('permite respuestas resueltas aunque sus catálogos estén vacíos', () => {
    expect(catalogosEstructuraListos('SERIE', '2O', herraje, acristalamiento)).toBe(true)
  })
})

it('cambiar pestaña mantiene los campos de selección en el formulario', () => {
  const html = renderToStaticMarkup(<PestanasEditor activa="estructura" onCambiar={vi.fn()}
    etiqueta="Edición de Línea"
    pestanas={[{ id: 'estructura', etiqueta: 'Estructura' }, { id: 'herraje', etiqueta: 'Opc.Herraje' }]}
    paneles={{ estructura: <input name="serieCodigo" defaultValue="SERIE" />,
      herraje: <input type="hidden" name="opcionHerraje" value="CONJUNTO|1" /> }} />)
  expect(html).toMatch(/id="panel-herraje"[^>]*hidden=""[^>]*><input type="hidden" name="opcionHerraje" value="CONJUNTO\|1"/)
  expect(html).not.toContain('disabled')
})
