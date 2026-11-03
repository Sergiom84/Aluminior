/**
 * Fusión E2 + M1: una unión con serie propia que no está en el catálogo visual
 * solo se admite con el catálogo de la base, y la valoración usa esa serie.
 * Fixture sintética; el importe no es el esperado.
 */
import { afterEach, expect, it, vi } from 'vitest'
import { CATALOGO_SNAPSHOT, esConfiguracionCerramiento } from '@aluminior/core/estructuras'
import type { ClienteEscritura } from '../cliente-db.ts'
import { valorarEstructura } from '../estructuras/valorar-estructura.ts'
import { valorarConCatalogo } from '../estructuras/catalogo-despiece/valorar-con-catalogo.ts'
import { valorarCerramiento } from './valorar-cerramiento.ts'

vi.mock('../estructuras/valorar-estructura.ts', () => ({ valorarEstructura: vi.fn() }))
vi.mock('../estructuras/catalogo-despiece/valorar-con-catalogo.ts', () => ({ valorarConCatalogo: vi.fn() }))
vi.mock('../estructuras/catalogo-despiece/cargado.ts', () => ({ catalogoDespieceCargado: async () => true }))
afterEach(() => vi.clearAllMocks())

const QA = {
  codigo: 'QA-U60', descripcion: 'Tubo de prueba 60', grosorMm: 60, unionTipo: 0 as const,
}

const configuracion = {
  version: 3 as const,
  repartoUniones: 'PIEZAS' as const,
  modulos: [
    {
      id: 'modulo-1', estructuraCodigo: 'C2', anchoMm: 1200, altoMm: 1200,
      cotas: { FI: 300 }, compacto: { estructuraCodigo: 'COM001', altoCajonMm: 180 },
    },
    {
      id: 'modulo-2', estructuraCodigo: 'C2', anchoMm: 1200, altoMm: 1200,
      anclaje: { moduloId: 'modulo-1', unionId: 'union-1', lado: 'derecha' as const },
      materiales: { serieCodigo: 'GMC400' },
    },
  ],
  uniones: [{
    id: 'union-1', codigo: 'QA-U60', grosorMm: 60, longitudMm: 2440,
    materiales: { serieCodigo: 'GMC400' },
  }],
}

const pendiente = {
  ok: true as const, descripcion: 'Sintético', precioUnitario: null,
  aviso: 'Importe pendiente en la prueba', motor: 'catalogo' as const, materialCompleto: false,
  acristalamiento: [], opcionesHerraje: [], partidas: [],
  piezas: [{ articuloCodigo: 'P', cantidad: '1', costeUnitario: '2', costeTotal: '2' }],
}

it('admite en el catálogo de la base una unión con serie propia y la valora con ella', async () => {
  expect(esConfiguracionCerramiento(configuracion, [QA])).toBe(true)
  expect(esConfiguracionCerramiento(configuracion)).toBe(false)
  expect(esConfiguracionCerramiento(configuracion, CATALOGO_SNAPSHOT)).toBe(true)

  vi.mocked(valorarEstructura).mockResolvedValue(pendiente)
  vi.mocked(valorarConCatalogo).mockResolvedValue({
    ...pendiente, piezas: [{ articuloCodigo: 'GM60X60', cantidad: '1', largoCorteMm: '1200',
      costeUnitario: '2', costeTotal: '2.4' }],
  })
  const resultado = await valorarCerramiento({} as ClienteEscritura, {
    configuracion, serieCodigo: 'GMA350', acabadoCodigo: 'L', vidrioCodigo: 'VCG4',
    varianteAcristalamiento: '1', tarifa: 9,
  })

  const union = vi.mocked(valorarConCatalogo).mock.calls.at(-1)?.[1]
  expect(union).toMatchObject({
    codigo: 'QA-U60', serieCodigo: 'GMC400', vidrioCodigo: null, anchoMm: 60, altoMm: 1200,
  })
  const modulos = vi.mocked(valorarEstructura).mock.calls.map((llamada) => llamada[1])
  expect(modulos[0]).toMatchObject({
    codigo: 'C2', serieCodigo: 'GMA350', anchoMm: 1170, altoMm: 1200, cotas: { FI: 300 },
    compacto: { estructura: 'COM001', altoCajonMm: 180, acabado: 'L' },
  })
  expect(modulos[1]).toMatchObject({ serieCodigo: 'GMC400', anchoMm: 1170, altoMm: 1200 })
  expect(modulos[1]?.cotas).toBeUndefined()
  expect(resultado.origenes.map((origen) => ({
    tipo: origen.origen.tipo, serie: origen.serieCodigo, vidrio: origen.vidrioCodigo,
  }))).toEqual([
    { tipo: 'MODULO', serie: 'GMA350', vidrio: 'VCG4' },
    { tipo: 'MODULO', serie: 'GMC400', vidrio: 'VCG4' },
    { tipo: 'UNION', serie: 'GMC400', vidrio: null },
  ])
})
