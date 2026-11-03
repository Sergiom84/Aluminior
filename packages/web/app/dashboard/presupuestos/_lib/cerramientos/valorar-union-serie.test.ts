/**
 * E2: la unión de otra serie se valora con su serie. El doble del catálogo
 * registra la serie recibida por cada origen; sin base de datos.
 */
import { afterEach, expect, it, vi } from 'vitest'
import type { ClienteEscritura } from '../cliente-db.ts'
import { valorarEstructura } from '../estructuras/valorar-estructura.ts'
import { valorarConCatalogo } from '../estructuras/catalogo-despiece/valorar-con-catalogo.ts'
import { valorarCerramiento } from './valorar-cerramiento.ts'

vi.mock('../estructuras/valorar-estructura.ts', () => ({ valorarEstructura: vi.fn() }))
vi.mock('../estructuras/catalogo-despiece/valorar-con-catalogo.ts', () => ({ valorarConCatalogo: vi.fn() }))
vi.mock('../estructuras/catalogo-despiece/cargado.ts', () => ({ catalogoDespieceCargado: async () => true }))
afterEach(() => vi.clearAllMocks())

const modulo = (id: string, materiales?: { serieCodigo: string }) => ({
  id, estructuraCodigo: 'C2', anchoMm: 1200, altoMm: 1200,
  ...(id === 'modulo-2'
    ? { anclaje: { moduloId: 'modulo-1', unionId: 'union-1', lado: 'derecha' as const } }
    : {}),
  ...(materiales ? { materiales } : {}),
})

const configuracion = (materiales?: { serieCodigo: string }) => ({
  version: 3 as const,
  modulos: [modulo('modulo-1'), modulo('modulo-2', { serieCodigo: 'GMC400' })],
  uniones: [{
    id: 'union-1', codigo: 'GMU038', grosorMm: 60, longitudMm: 2440,
    ...(materiales ? { materiales } : {}),
  }],
})

// Importe pendiente: la prueba fija la serie recibida, no la cifra valorada.
const resultadoCatalogo = {
  ok: true as const, descripcion: 'Unión sintética', precioUnitario: null,
  aviso: 'Importe pendiente en la prueba', motor: 'catalogo' as const, materialCompleto: false,
  acristalamiento: [], opcionesHerraje: [], partidas: [],
  piezas: [{ articuloCodigo: 'GM60X60', cantidad: '1', largoCorteMm: '2440',
    costeUnitario: '2', costeTotal: '4.88' }],
}

async function seriesPorOrigen(materiales?: { serieCodigo: string }) {
  vi.mocked(valorarEstructura).mockResolvedValue({ ok: true, descripcion: 'Módulo sintético',
    precioUnitario: null, aviso: 'Importe pendiente en la prueba', motor: 'catalogo',
    materialCompleto: false, partidas: [], acristalamiento: [], opcionesHerraje: [],
    piezas: [{ articuloCodigo: 'P', cantidad: '1', costeUnitario: '2', costeTotal: '2' }] })
  vi.mocked(valorarConCatalogo).mockResolvedValue(resultadoCatalogo)
  const resultado = await valorarCerramiento({} as ClienteEscritura, {
    configuracion: configuracion(materiales), serieCodigo: 'GMA350', acabadoCodigo: 'L',
    vidrioCodigo: 'VCG4', varianteAcristalamiento: '1', tarifa: 9,
  })
  return {
    recibidaPorLaUnion: vi.mocked(valorarConCatalogo).mock.calls.at(-1)?.[1],
    origenes: resultado.origenes.map(o => ({ tipo: o.origen.tipo, serie: o.serieCodigo, vidrio: o.vidrioCodigo })),
  }
}

it('pasa a la unión su propia serie y no el vidrio general', async () => {
  const { recibidaPorLaUnion, origenes } = await seriesPorOrigen({ serieCodigo: 'GMC400' })
  expect(recibidaPorLaUnion).toMatchObject({ codigo: 'GMU038', serieCodigo: 'GMC400', vidrioCodigo: null })
  expect(origenes).toEqual([
    { tipo: 'MODULO', serie: 'GMA350', vidrio: 'VCG4' },
    { tipo: 'MODULO', serie: 'GMC400', vidrio: 'VCG4' },
    { tipo: 'UNION', serie: 'GMC400', vidrio: null },
  ])
})

it('sin serie propia la unión conserva la general', async () => {
  const { recibidaPorLaUnion, origenes } = await seriesPorOrigen()
  expect(recibidaPorLaUnion).toMatchObject({ serieCodigo: 'GMA350', vidrioCodigo: null })
  expect(origenes.at(-1)).toEqual({ tipo: 'UNION', serie: 'GMA350', vidrio: null })
})
