/**
 * Acabado por elemento: cada origen se valora con su acabado (y su Acabado2)
 * o, sin él, con el de la línea, por los dos caminos (catálogo de despiece y
 * el anterior). El doble del motor registra lo que recibe cada origen; sin
 * base de datos. Caso real: 260289, PSU006 en L dentro de un GRUPO en VS.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ConfiguracionCerramiento, MaterialesModulo, MaterialesUnion } from '@aluminior/core/estructuras'
import type { ClienteEscritura } from '../cliente-db.ts'
import { valorarEstructura } from '../estructuras/valorar-estructura.ts'
import { valorarConCatalogo } from '../estructuras/catalogo-despiece/valorar-con-catalogo.ts'
import { resolverMaterialesEstructura } from '../estructuras/materiales-estructura.ts'
import { catalogoDespieceCargado } from '../estructuras/catalogo-despiece/cargado.ts'
import { valorarCerramiento } from './valorar-cerramiento.ts'

vi.mock('../estructuras/valorar-estructura.ts', () => ({ valorarEstructura: vi.fn() }))
vi.mock('../estructuras/catalogo-despiece/valorar-con-catalogo.ts', () => ({ valorarConCatalogo: vi.fn() }))
vi.mock('../estructuras/materiales-estructura.ts', () => ({ resolverMaterialesEstructura: vi.fn() }))
vi.mock('../estructuras/catalogo-despiece/cargado.ts', () => ({ catalogoDespieceCargado: vi.fn() }))
afterEach(() => vi.clearAllMocks())

function configuracion(propios: { modulo2?: MaterialesModulo; union?: MaterialesUnion } = {}): ConfiguracionCerramiento {
  return {
    version: 3,
    modulos: [
      { id: 'modulo-1', estructuraCodigo: 'C2', anchoMm: 1200, altoMm: 1200 },
      { id: 'modulo-2', estructuraCodigo: 'C2', anchoMm: 1200, altoMm: 1200,
        anclaje: { moduloId: 'modulo-1', unionId: 'union-1', lado: 'derecha' },
        ...(propios.modulo2 ? { materiales: propios.modulo2 } : {}) },
    ],
    uniones: [{ id: 'union-1', codigo: 'GMU038', grosorMm: 60, longitudMm: 1200,
      ...(propios.union ? { materiales: propios.union } : {}) }],
  }
}

// Importe pendiente: la prueba fija el acabado recibido, no la cifra valorada.
const pendiente = {
  ok: true as const, descripcion: 'Sintético', precioUnitario: null, aviso: 'Importe pendiente en la prueba',
  motor: 'catalogo' as const, materialCompleto: false, acristalamiento: [], opcionesHerraje: [], partidas: [],
  piezas: [{ articuloCodigo: 'P', cantidad: '1', costeUnitario: '2', costeTotal: '2' }],
}

async function valorar(config: ConfiguracionCerramiento, catalogo = true) {
  vi.mocked(catalogoDespieceCargado).mockResolvedValue(catalogo)
  vi.mocked(valorarEstructura).mockResolvedValue(pendiente)
  vi.mocked(valorarConCatalogo).mockResolvedValue(pendiente)
  vi.mocked(resolverMaterialesEstructura).mockResolvedValue({ ok: false, errores: { codigo: ['sintético'] } } as never)
  const resultado = await valorarCerramiento({} as ClienteEscritura, {
    configuracion: config, serieCodigo: 'ELEGANTPVC', acabadoCodigo: 'VS', acabadoAccesoriosCodigo: 'UNI',
    vidrioCodigo: 'V420AGS4', varianteAcristalamiento: '1', tarifa: 1,
  })
  const recibido = (p: { acabadoCodigo?: string | null; acabadoAccesoriosCodigo?: string | null }) =>
    [p.acabadoCodigo, p.acabadoAccesoriosCodigo]
  return {
    modulos: vi.mocked(valorarEstructura).mock.calls.map(([, p]) => recibido(p)),
    union: (catalogo ? vi.mocked(valorarConCatalogo) : vi.mocked(resolverMaterialesEstructura))
      .mock.calls.map(([, p]) => recibido(p)),
    origenes: resultado.origenes.map(o => o.acabadoCodigo),
  }
}

describe.each([['catálogo de despiece', true], ['vía anterior', false]])('acabado por elemento (%s)', (_n, catalogo) => {
  it('la unión con acabado propio se valora en su acabado; los módulos, en el de la línea', async () => {
    const r = await valorar(configuracion({ union: { acabadoCodigo: 'L' } }), catalogo)
    expect(r.union).toEqual([['L', 'UNI']])
    expect(r.modulos).toEqual([['VS', 'UNI'], ['VS', 'UNI']])
    expect(r.origenes).toEqual(['VS', 'VS', 'L'])
  })

  it('el módulo con acabado y Acabado2 propios los usa solo él', async () => {
    const r = await valorar(configuracion({ modulo2: { acabadoCodigo: 'L', acabadoAccesoriosCodigo: 'L' } }), catalogo)
    expect(r.modulos).toEqual([['VS', 'UNI'], ['L', 'L']])
    expect(r.union).toEqual([['VS', 'UNI']])
    expect(r.origenes).toEqual(['VS', 'L', 'VS'])
  })

  it('sin acabados propios (snapshot antiguo) todo hereda el de la línea, como antes', async () => {
    const r = await valorar(configuracion({ modulo2: { serieCodigo: 'GMC400' } }), catalogo)
    expect(r.modulos).toEqual([['VS', 'UNI'], ['VS', 'UNI']])
    expect(r.union).toEqual([['VS', 'UNI']])
    expect(r.origenes).toEqual(['VS', 'VS', 'VS'])
  })
})
