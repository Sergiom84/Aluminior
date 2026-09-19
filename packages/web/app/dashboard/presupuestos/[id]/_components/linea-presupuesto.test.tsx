import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { LineaPresupuesto } from './linea-presupuesto.tsx'

vi.mock('./anyadir-linea.tsx', () => ({ BotonBorrarLinea: () => null }))
vi.mock('./editar-articulo.tsx', () => ({ EditarArticulo: () => null }))
vi.mock('./editar-cerramiento.tsx', () => ({ EditarCerramiento: () => null }))

describe('miniatura del cerramiento persistido', () => {
  it('dibuja 1OFI con el FI guardado en vez del reparto legado', () => {
    const html = renderToStaticMarkup(<table><tbody><LineaPresupuesto
      articuloEditable={false}
      linea={{
        id: 'linea-1', orden: 1, tipo: 'CERRAMIENTO', articuloCodigo: null,
        descripcion: 'CERRAMIENTO SEGÚN DIBUJO · 1OFI', referencia: null,
        anchoMm: 900, altoMm: 1800, cantidad: '1', precioUnitario: null,
        descuento: '0', total: null, valoracionCompleta: false,
        avisoValoracion: 'Configuración guardada sin valorar',
      }}
      resultado={null} manoObra={[]} presupuestoId="presupuesto-1" despiece={[]}
      edicion={{
        configuracion: { version: 2, modulos: [{
          id: 'modulo-1', estructuraCodigo: '1OFI', anchoMm: 900, altoMm: 1800, fiMm: 400,
        }], uniones: [] },
        serieCodigo: null, vidrioCodigo: null, acabadoCodigo: null,
        varianteAcristalamiento: '1', referencia: null, cantidad: '1',
        horasFabricacion: '0', horasColocacion: '0',
      }}
      series={[]} acabados={[]}
    /></tbody></table>)

    const travesano = html.match(
      /<rect x="[\d.]+" y="([\d.]+)" width="[\d.]+" height="([\d.]+)" class="al-traverse"/,
    )
    expect(travesano).not.toBeNull()
    // Caja compacta: margen 24 + eje físico 1400/1800 sobre 372 px útiles.
    expect(Number(travesano![1]) + Number(travesano![2]) / 2).toBeCloseTo(313.3333333333)
  })
})
