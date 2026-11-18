import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { ModuloCerramiento } from '@aluminior/core/estructuras'
import { MaterialesElemento } from './materiales-elemento.tsx'
import { EditorUnion } from '../editor-union.tsx'

const acabados = [{ codigo: 'VS', descripcion: 'LACADO VARIOS ESTANDAR' }, { codigo: 'L', descripcion: 'L. BLANCO' }]
const modulo: ModuloCerramiento = { id: 'm1', estructuraCodigo: '2O', anchoMm: 1200, altoMm: 1200 }
const generales = { serieCodigo: 'ELEGANTPVC', vidrioCodigo: 'V420AGS4' }

describe('acabado propio en el diseñador', () => {
  it('el elemento ofrece Acabado y Aca. Acc. con «Según línea» y marca el propio', () => {
    const html = renderToStaticMarkup(createElement(MaterialesElemento, {
      modulo: { ...modulo, materiales: { acabadoCodigo: 'L' } }, borrador: {}, generales, series: [], acabados,
      onChange: () => undefined,
    }))
    expect(html).toContain('aria-label="Acabado del elemento"')
    expect(html).toContain('aria-label="Aca. Acc. del elemento"')
    expect(html.match(/<option value="">Según línea<\/option>/g)).toHaveLength(1)
    expect(html).toContain('<option value="L" selected="">L · L. BLANCO</option>')
  })

  it('sin catálogo de acabados no añade selectores', () => {
    const html = renderToStaticMarkup(createElement(MaterialesElemento, {
      modulo, borrador: {}, generales, series: [], onChange: () => undefined,
    }))
    expect(html).not.toContain('Según línea')
  })

  it('la unión muestra el acabado del borrador antes que el guardado', () => {
    const union = { id: 'u1', codigo: 'GMU038', grosorMm: 60, longitudMm: 1200, materiales: { acabadoCodigo: 'VS' } }
    const html = (acabadoCodigo?: string | null) => renderToStaticMarkup(createElement(EditorUnion, {
      union: acabadoCodigo === undefined ? union : { ...union, acabadoCodigo }, indice: 1, pendiente: false, acabados,
      onChange: () => undefined, onActualizar: () => undefined, onDescartar: () => undefined,
    }))
    expect(html()).toContain('aria-label="Acabado unión 1"')
    expect(html()).toContain('<option value="VS" selected="">')
    expect(html('L')).toContain('<option value="L" selected="">')
    expect(html(null)).toContain('<option value="" selected="">Según línea</option>')
  })
})
