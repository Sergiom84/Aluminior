import { afterEach, expect, it, vi } from 'vitest'
import type { ConfiguracionCerramiento } from '@aluminior/core/estructuras'
import type { ClienteEscritura } from '../cliente-db.ts'
import { valorarEstructura } from '../estructuras/valorar-estructura.ts'
import { valorarCerramiento } from './valorar-cerramiento.ts'

vi.mock('../estructuras/valorar-estructura.ts', () => ({
  valorarEstructura: vi.fn(async () => ({ ok: false, errores: { catalogo: ['sin catálogo en la prueba'] } })),
}))
vi.mock('../estructuras/catalogo-despiece/cargado.ts', () => ({ catalogoDespieceCargado: async () => false }))
afterEach(() => vi.clearAllMocks())

const entrada = { serieCodigo: 'ELEGANTPVC', acabadoCodigo: 'L', vidrioCodigo: 'VCG4', varianteAcristalamiento: '1' as const, tarifa: 1 }
const compacto = { estructuraCodigo: 'COM001', altoCajonMm: 155, descontarHueco: true }
const medidas = async (configuracion: ConfiguracionCerramiento) => {
  await valorarCerramiento({} as ClienteEscritura, { ...entrada, configuracion })
  return vi.mocked(valorarEstructura).mock.calls.map(([, p]) => ({
    anchoMm: p.anchoMm, altoMm: p.altoMm, descuentoGuiasMm: p.compacto?.descuentoGuiasMm,
  }))
}
const una = (c: object, altoMm = 1200): ConfiguracionCerramiento => ({
  version: 3, uniones: [], modulos: [{ id: 'm1', estructuraCodigo: '2O', anchoMm: 1200, altoMm, compacto: { ...compacto, ...c } }],
} as ConfiguracionCerramiento)

// Productor, empresa de pruebas, presupuesto 260504 (12/11/2026).
it('con GMG010 a ambos lados la 2O de 1.200 x 1.200 se valora a 1.094 x 1.045 y el compacto recupera el hueco', async () => {
  expect(await medidas(una({ guiaIzquierda: 'GMG010', guiaDerecha: 'GMG010' })))
    .toEqual([{ anchoMm: 1094, altoMm: 1045, descuentoGuiasMm: 106 }])
})

it('con PSG002 solo a la izquierda y cajón 185 la 2O de 1.200 x 1.700 se valora a 1.160 x 1.515', async () => {
  expect(await medidas(una({ guiaIzquierda: 'PSG002', altoCajonMm: 185 }, 1700)))
    .toEqual([{ anchoMm: 1160, altoMm: 1515, descuentoGuiasMm: 40 }])
})

it('sin guías la ventana conserva el ancho del hueco', async () => {
  expect(await medidas(una({}))).toEqual([{ anchoMm: 1200, altoMm: 1045, descuentoGuiasMm: undefined }])
})
