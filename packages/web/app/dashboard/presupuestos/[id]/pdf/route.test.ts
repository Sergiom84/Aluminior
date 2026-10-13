import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  crearDb: vi.fn(() => ({ marcador: 'db' })),
  asegurarCatalogoDiseno: vi.fn(),
  cargarPresupuestoPdf: vi.fn(),
  renderToBuffer: vi.fn(),
  documentoPresupuesto: vi.fn(),
}))
vi.mock('@aluminior/db', () => ({ crearDb: mocks.crearDb }))
vi.mock('../../_lib/catalogo-diseno/index.ts', () => ({ asegurarCatalogoDiseno: mocks.asegurarCatalogoDiseno }))
vi.mock('./datos.ts', () => ({ cargarPresupuestoPdf: mocks.cargarPresupuestoPdf }))
vi.mock('./documento.tsx', () => ({ documentoPresupuesto: mocks.documentoPresupuesto }))
vi.mock('@react-pdf/renderer', () => ({ renderToBuffer: mocks.renderToBuffer }))

import { GET } from './route'

const solicitar = (id: string) => GET(new Request(`http://localhost/presupuestos/${id}/pdf`), {
  params: Promise.resolve({ id }),
})

describe('ruta PDF: identidad del documento', () => {
  beforeEach(() => vi.clearAllMocks())

  it.each(['no-es-uuid', '260001', ''])('rechaza %s sin consultar la base ni renderizar', async id => {
    const respuesta = await solicitar(id)

    expect(respuesta.status).toBe(404)
    expect(await respuesta.text()).toBe('Presupuesto no encontrado')
    expect(respuesta.headers.get('Cache-Control')).toBe('no-store')
    expect(mocks.crearDb).not.toHaveBeenCalled()
    expect(mocks.asegurarCatalogoDiseno).not.toHaveBeenCalled()
    expect(mocks.cargarPresupuestoPdf).not.toHaveBeenCalled()
    expect(mocks.renderToBuffer).not.toHaveBeenCalled()
  })

  it('conserva la consulta para un UUID válido que no existe', async () => {
    const id = '11111111-1111-4111-8111-111111111111'
    mocks.cargarPresupuestoPdf.mockResolvedValue(null)

    expect((await solicitar(id)).status).toBe(404)
    expect(mocks.cargarPresupuestoPdf).toHaveBeenCalledWith({ marcador: 'db' }, id)
    expect(mocks.renderToBuffer).not.toHaveBeenCalled()
  })
})
