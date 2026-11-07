import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { AltaSinEdicionActiva, EdicionLineaActiva } from './edicion-linea-activa.tsx'
import { LineaPresupuesto } from './linea-presupuesto.tsx'

vi.mock('./boton-borrar-linea.tsx', () => ({ BotonBorrarLinea: () => null }))
vi.mock('./editar-articulo.tsx', () => ({ EditarArticulo: () => null }))
vi.mock('./editar-cerramiento.tsx', () => ({ EditarCerramiento: () => <form aria-label="Editar cerramiento" /> }))

const linea = (id: string) => <LineaPresupuesto key={id} editable presupuestoId="p" despiece={[]} manoObra={[]} resultado={null}
  linea={{ id, orden: 1, tipo: 'CERRAMIENTO', articuloCodigo: null, acabadoArticuloCodigo: null, descripcion: 'GRUPO',
    referencia: null, anchoMm: 1200, altoMm: 1200, cantidad: '1', precioUnitario: null, descuento: '0', total: null,
    valoracionCompleta: false, avisoValoracion: null }}
  edicion={{ configuracion: { version: 1, modulos: [{ id: 'm1', estructuraCodigo: '2', anchoMm: 1200, altoMm: 1200 }], uniones: [] },
    serieCodigo: null, vidrioCodigo: null, acabadoCodigo: null, varianteAcristalamiento: '2', referencia: null,
    cantidad: '1', horasFabricacion: '0', horasColocacion: '0' }}
  series={[]} acabados={[]} />

const pagina = (inicial: string | null) => renderToStaticMarkup(<EdicionLineaActiva inicial={inicial}>
  <AltaSinEdicionActiva><form aria-label="Introducir línea" /></AltaSinEdicionActiva>
  <table><tbody>{linea('l1')}{linea('l2')}</tbody></table>
</EdicionLineaActiva>)

describe('un solo editor de línea a la vez', () => {
  it('sin edición, el alta se ve y no hay configurador de edición', () => {
    const html = pagina(null)
    expect(html).toMatch(/<div><form aria-label="Introducir línea">/)
    expect(html).not.toContain('Editar cerramiento')
  })

  it('al editar una línea, el alta se oculta y las demás no se pueden editar', () => {
    const html = pagina('l1')
    expect(html).toMatch(/<div hidden=""><form aria-label="Introducir línea">/)
    expect(html.match(/aria-label="Editar cerramiento"/g)).toHaveLength(1)
    expect(html).toContain('Cerrar edición')
    expect(html).toMatch(/<button type="button" disabled=""[^>]*aria-expanded="false">Editar<\/button>/)
  })
})
