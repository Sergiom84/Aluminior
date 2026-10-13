import { beforeEach, describe, expect, it, vi } from 'vitest'

const dobles = vi.hoisted(() => ({ usuario: vi.fn(), db: vi.fn(), crear: vi.fn(), alta: vi.fn(),
  borrar: vi.fn(), revalidar: vi.fn(), catalogo: vi.fn(), registrar: vi.fn(),
}))
vi.mock('./usuario-actual.ts', () => ({ usuarioActual: dobles.usuario }))
vi.mock('@aluminior/db', async importar => ({ ...await importar<typeof import('@aluminior/db')>(), crearDb: dobles.db }))
vi.mock('./presupuestos/crear-presupuesto.ts', () => ({ crearPresupuestoAlta: dobles.crear }))
vi.mock('./lineas/alta-linea.ts', () => ({ altaLinea: dobles.alta }))
vi.mock('./lineas/borrar-linea.ts', () => ({ borrarLineaDePresupuesto: dobles.borrar }))
vi.mock('./catalogo-diseno/index.ts', () => ({ asegurarCatalogoDiseno: dobles.catalogo, necesitaCatalogoDiseno: () => true }))
vi.mock('./errores.ts', () => ({ registrarFallo: dobles.registrar }))
vi.mock('next/cache', () => ({ revalidatePath: dobles.revalidar }))

import { anyadirLinea, borrarLinea, crearPresupuesto } from './acciones.ts'
const presupuestoId = '11111111-1111-4111-8111-111111111111'
const formulario = (campos: Record<string, string>) => {
  const datos = new FormData()
  for (const [campo, valor] of Object.entries(campos)) datos.set(campo, valor)
  return datos
}
beforeEach(() => {
  vi.resetAllMocks()
  dobles.db.mockReturnValue({ sintetica: true })
  dobles.registrar.mockReturnValue('No se pudo guardar. El detalle queda en el registro del servidor.')
})

describe('las acciones devuelven resultados recuperables', () => {
  it('crear rechaza una sesión caducada antes de abrir base o reservar número', async () => {
    dobles.usuario.mockResolvedValue(null)
    expect(await crearPresupuesto(null, formulario({ nombreLibre: 'QA sintético' })))
      .toEqual({ ok: false, errores: {}, mensaje: 'Sesión no válida' })
    expect(dobles.db).not.toHaveBeenCalled()
    expect(dobles.crear).not.toHaveBeenCalled()
  })

  it('crear convierte un fallo de conexión en error visible', async () => {
    dobles.usuario.mockResolvedValue('qa@example.test')
    dobles.db.mockImplementation(() => { throw new Error('conexión sintética fallida') })
    expect(await crearPresupuesto(null, formulario({ nombreLibre: 'QA sintético' })))
      .toMatchObject({ ok: false, mensaje: expect.stringContaining('No se pudo guardar') })
    expect(dobles.crear).not.toHaveBeenCalled()
  })

  it('la carga de diseños se autentica y su fallo no escapa de la acción', async () => {
    const datos = formulario({ presupuestoId, tipo: 'CERRAMIENTO', codigo: 'GRUPO',
      configuracionCerramiento: '{"version":1,"modulos":[]}' })
    dobles.usuario.mockResolvedValue(null)
    expect(await anyadirLinea(null, datos)).toMatchObject({ ok: false, mensaje: 'Sesión no válida' })
    expect(dobles.catalogo).not.toHaveBeenCalled()
    expect(dobles.db).not.toHaveBeenCalled()
    dobles.usuario.mockResolvedValue('qa@example.test')
    dobles.catalogo.mockRejectedValue(new Error('catálogo sintético fallido'))
    expect(await anyadirLinea(null, datos)).toMatchObject({ ok: false, mensaje: expect.stringContaining('No se pudo guardar') })
    expect(dobles.alta).not.toHaveBeenCalled()
  })

  it('borrar rechaza sesión caducada y conserva el rechazo del servicio', async () => {
    dobles.usuario.mockResolvedValue(null)
    expect(await borrarLinea('linea', presupuestoId)).toEqual({ ok: false, mensaje: 'Sesión no válida' })
    expect(dobles.borrar).not.toHaveBeenCalled()
    dobles.usuario.mockResolvedValue('qa@example.test')
    dobles.borrar.mockResolvedValue({ ok: false, mensaje: 'Presupuesto no encontrado' })
    expect(await borrarLinea('linea', presupuestoId)).toEqual({ ok: false, mensaje: 'Presupuesto no encontrado' })
    expect(dobles.revalidar).not.toHaveBeenCalled()
  })

  it('borrar admite reintento tras fallo y revalida documento/listado sólo tras éxito', async () => {
    dobles.usuario.mockResolvedValue('qa@example.test')
    dobles.borrar.mockRejectedValueOnce(new Error('fallo sintético')).mockResolvedValueOnce({ ok: true })
    expect(await borrarLinea('linea', presupuestoId)).toMatchObject({ ok: false, mensaje: expect.stringContaining('No se pudo guardar') })
    expect(dobles.revalidar).not.toHaveBeenCalled()
    expect(await borrarLinea('linea', presupuestoId)).toEqual({ ok: true })
    expect(dobles.revalidar.mock.calls).toEqual([[`/dashboard/presupuestos/${presupuestoId}`], ['/dashboard/presupuestos']])
  })

  it.each(['crearPresupuesto', 'anyadirLinea', 'borrarLinea'] as const)(
    '%s conserva el éxito confirmado aunque falle la revalidación', async accion => {
      const fallo = new Error('fallo sintético de caché después del commit')
      dobles.usuario.mockResolvedValue('qa@example.test')
      dobles.revalidar.mockImplementation(() => { throw fallo })
      dobles.crear.mockResolvedValue({ ok: true, id: presupuestoId })
      dobles.alta.mockResolvedValue({ ok: true, id: presupuestoId, mensaje: 'Aviso de valoración conservado' })
      dobles.borrar.mockResolvedValue({ ok: true })

      const resultado = accion === 'crearPresupuesto'
        ? await crearPresupuesto(null, formulario({ nombreLibre: 'QA sintético' }))
        : accion === 'anyadirLinea'
          ? await anyadirLinea(null, formulario({ presupuestoId, tipo: 'ARTICULO', codigo: 'QA-ARTICULO' }))
          : await borrarLinea('linea', presupuestoId)
      expect(resultado).toEqual(accion === 'borrarLinea' ? { ok: true }
        : { ok: true, id: presupuestoId,
          ...(accion === 'anyadirLinea' ? { mensaje: 'Aviso de valoración conservado' } : {}) })
      const servicio = accion === 'crearPresupuesto' ? dobles.crear : accion === 'anyadirLinea' ? dobles.alta : dobles.borrar
      expect(servicio).toHaveBeenCalledTimes(1)
      expect(dobles.registrar).toHaveBeenCalledWith(expect.stringContaining(`${accion}: revalidación tras escritura`), fallo)
    },
  )
})
