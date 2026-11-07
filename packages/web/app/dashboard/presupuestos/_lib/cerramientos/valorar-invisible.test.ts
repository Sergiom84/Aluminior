import { afterEach, expect, it, vi } from 'vitest'
import { cambiarInvisibleModulo, esResultadoCerramiento, type ConfiguracionCerramiento } from '@aluminior/core/estructuras'
import type { ClienteEscritura } from '../cliente-db.ts'
import { valorarEstructura } from '../estructuras/valorar-estructura.ts'
import { valorarCerramiento } from './valorar-cerramiento.ts'

vi.mock('../estructuras/valorar-estructura.ts', () => ({ valorarEstructura: vi.fn() }))
vi.mock('../estructuras/catalogo-despiece/cargado.ts', () => ({ catalogoDespieceCargado: async () => false }))
afterEach(() => vi.clearAllMocks())

const fijo: ConfiguracionCerramiento = {
  version: 1, modulos: [{ id: 'm1', estructuraCodigo: '0', anchoMm: 400, altoMm: 400 }], uniones: [],
}
const entrada = { serieCodigo: 'S', acabadoCodigo: 'L', vidrioCodigo: 'V', varianteAcristalamiento: '1' as const, tarifa: 9 }

it('valora el elemento invisible a 0 completo, sin piezas y sin consultar el catálogo', async () => {
  const resultado = await valorarCerramiento({} as ClienteEscritura, {
    ...entrada, configuracion: cambiarInvisibleModulo(fijo, 'm1', true),
  })
  expect(valorarEstructura).not.toHaveBeenCalled()
  expect(esResultadoCerramiento(resultado)).toBe(true)
  expect(resultado.origenes[0]).toMatchObject({
    reglaMaterial: 'ELEMENTO_INVISIBLE', piezas: [], diagnosticos: [],
    venta: { completo: true, importe: '0.00' }, coste: { completo: true, importe: '0.0000' },
  })
  expect(resultado.ventaMateriales).toEqual({ completo: true, importe: '0.00' })
})

it('sin marcar, el mismo fijo pasa por el motor', async () => {
  vi.mocked(valorarEstructura).mockResolvedValue({ ok: false, errores: { serieCodigo: ['Sintético'] } })
  const resultado = await valorarCerramiento({} as ClienteEscritura, { ...entrada, configuracion: fijo })
  expect(valorarEstructura).toHaveBeenCalledOnce()
  expect(resultado.origenes[0].reglaMaterial).not.toBe('ELEMENTO_INVISIBLE')
  expect(resultado.ventaMateriales.completo).toBe(false)
})
