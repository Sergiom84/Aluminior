import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { esConfiguracionCerramiento, type ConfiguracionCerramiento } from '@aluminior/core/estructuras'
import { LineaPresupuesto } from './linea-presupuesto.tsx'

vi.mock('./boton-borrar-linea.tsx', () => ({ BotonBorrarLinea: () => <button>Eliminar</button> }))
vi.mock('./editar-articulo.tsx', () => ({ EditarArticulo: () => null }))
vi.mock('./editar-cerramiento.tsx', () => ({ EditarCerramiento: () => null }))

function renderizarLinea(configuracion: ConfiguracionCerramiento) {
  expect(esConfiguracionCerramiento(configuracion)).toBe(true)
  return renderToStaticMarkup(<table><tbody><LineaPresupuesto
    editable={false}
    linea={{
      id: 'linea-1', orden: 1, tipo: 'CERRAMIENTO', articuloCodigo: null,
      descripcion: 'CERRAMIENTO SEGÚN DIBUJO · 1OFI', referencia: null,
      anchoMm: 900, altoMm: 1800, cantidad: '1', precioUnitario: null,
      descuento: '0', total: null, valoracionCompleta: false,
      avisoValoracion: 'Configuración guardada sin valorar',
    }}
    resultado={null} manoObra={[]} presupuestoId="presupuesto-1" despiece={[]}
    edicion={{
      configuracion,
      serieCodigo: null, vidrioCodigo: null, acabadoCodigo: null,
      varianteAcristalamiento: '1', referencia: null, cantidad: '1',
      horasFabricacion: '0', horasColocacion: '0',
    }}
    series={[]} acabados={[]}
  /></tbody></table>)
}

describe('miniatura del cerramiento persistido', () => {
  it('dibuja 1OFI con el FI guardado en vez del reparto legado', () => {
    const html = renderizarLinea({ version: 2, modulos: [{
      id: 'modulo-1', estructuraCodigo: '1OFI', anchoMm: 900, altoMm: 1800, fiMm: 400,
    }], uniones: [] })

    const travesano = html.match(
      /<rect x="[\d.]+" y="([\d.]+)" width="[\d.]+" height="([\d.]+)" class="al-traverse"/,
    )
    expect(travesano).not.toBeNull()
    const marco = html.match(
      /<rect x="[\d.]+" y="([\d.]+)" width="[\d.]+" height="([\d.]+)" class="al-frame"/,
    )
    expect(marco).not.toBeNull()
    // El eje del fijo guardado está 400 mm por encima de la base de 1800 mm.
    const eje = Number(travesano![1]) + Number(travesano![2]) / 2
    expect((eje - Number(marco![1])) / Number(marco![2])).toBeCloseTo(1400 / 1800)
    expect(html).not.toContain('>Editar<')
    expect(html).not.toContain('>Eliminar<')
    // El diagnóstico debe ser texto visible, también sin hover en un móvil.
    expect(html).toMatch(/<div[^>]*>Configuración guardada sin valorar<\/div>/)
  })

  it('incluye todos los módulos y la unión de una única línea GRUPO guardada', () => {
    const html = renderizarLinea({ version: 1, modulos: [
      { id: 'modulo-1', estructuraCodigo: '0', anchoMm: 900, altoMm: 1800 },
      { id: 'modulo-2', estructuraCodigo: '0', anchoMm: 600, altoMm: 1000 },
    ], uniones: [{ id: 'union-1', codigo: 'GMU038', grosorMm: 60, longitudMm: 1800 }] })
    expect(html).toContain('>GRUPO</td>')
    expect(html.match(/class="al-frame"/g)).toHaveLength(2)
    expect(html.match(/class="al-union"/g)).toHaveLength(1)
    expect(html.match(/<tr /g)).toHaveLength(1)
    expect(html).toContain('aria-label="Cerramiento 0 + 0: 1560 × 1800 mm"')
  })
})
