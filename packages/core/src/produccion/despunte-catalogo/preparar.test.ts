import { describe, expect, it } from 'vitest'
import { prepararDespunteCatalogo, type DetalleFisicoDespunte } from './preparar.ts'

const detalle = (cambios: Partial<DetalleFisicoDespunte> = {}): DetalleFisicoDespunte => ({
  lineaId: 'L1', detalleId: 'D1', articuloCodigo: 'P1', acabadoCodigo: 'A1', tonalidadCodigo: 'T1',
  metrajeDetalleM: '2.4', cantidadPrincipal: 3, cantidadDetalle: 2, longitudCorteMm: 1200, largoArticuloMm: 6400,
  ...cambios,
})
const preparar = (detalles: readonly DetalleFisicoDespunte[], largoBarraEstandarMm: number | null = 6000) =>
  prepararDespunteCatalogo({ detalles, largoBarraEstandarMm })

describe('preparación física de despunte desde catálogo', () => {
  it('multiplica metraje solo por cantidad principal y cortes por ambas cantidades', () => {
    const resultado = preparar([detalle()])
    expect(resultado.estado).toBe('LISTO')
    expect(resultado.incidencias).toEqual([])
    expect(resultado.grupos).toEqual([{ articuloCodigo: 'P1', acabadoCodigo: 'A1', tonalidadCodigo: 'T1',
      longitudBarraMm: 6400, metrajeDespieceM: '7.2', cantidadCortes: 6,
      cortes: [{ lineaId: 'L1', detalleId: 'D1', longitudMm: 1200, cantidad: 6 }] }])
  })

  it('agrupa identidades iguales sin perder el origen ni redondear metraje', () => {
    const resultado = preparar([detalle(), detalle({ lineaId: 'L2', metrajeDetalleM: '1.1', cantidadPrincipal: 2 })])
    expect(resultado.grupos).toHaveLength(1)
    expect(resultado.grupos[0]).toMatchObject({ metrajeDespieceM: '9.4', cantidadCortes: 10 })
    expect(resultado.grupos[0]?.cortes).toHaveLength(2)
    expect(resultado.grupos[0]?.cortes).toEqual([
      { lineaId: 'L1', detalleId: 'D1', longitudMm: 1200, cantidad: 6 },
      { lineaId: 'L2', detalleId: 'D1', longitudMm: 1200, cantidad: 4 },
    ])
    const fino = preparar([detalle({ metrajeDetalleM: '0.00000000000000000001' })])
    expect(fino.grupos[0]?.metrajeDespieceM).toBe('0.00000000000000000003')
  })

  it.each(['articuloCodigo', 'acabadoCodigo', 'tonalidadCodigo'] as const)('separa la identidad %s', campo => {
    const resultado = preparar([detalle(), detalle({ detalleId: 'D2', [campo]: 'OTRO' })])
    expect(resultado.estado).toBe('LISTO')
    expect(resultado.grupos).toHaveLength(2)
    expect(resultado.grupos.map(grupo => grupo.metrajeDespieceM)).toEqual(['7.2', '7.2'])
  })

  it('conserva la identidad exacta, sin normalizar códigos', () => {
    const resultado = preparar([detalle(), detalle({ detalleId: 'D2', tonalidadCodigo: 't1' })])
    expect(resultado.grupos.map(grupo => grupo.tonalidadCodigo)).toEqual(['T1', 't1'])
  })

  it('usa largo de artículo y exige estándar únicamente cuando aquel vale cero', () => {
    expect(preparar([detalle()], null).grupos[0]?.longitudBarraMm).toBe(6400)
    expect(preparar([detalle({ largoArticuloMm: 0 })]).grupos[0]?.longitudBarraMm).toBe(6000)
    expect(preparar([detalle({ largoArticuloMm: 0 })], null)).toMatchObject({ estado: 'BLOQUEADO', grupos: [] })
    expect(prepararDespunteCatalogo({ detalles: [detalle()] }).estado).toBe('LISTO')
  })

  it('admite la misma barra resuelta desde artículo o estándar', () => {
    expect(preparar([detalle({ largoArticuloMm: 6000 }), detalle({ detalleId: 'D2', largoArticuloMm: 0 })])
      .grupos[0]).toMatchObject({ longitudBarraMm: 6000, cantidadCortes: 12 })
  })

  it('permite cero explícito coherente y una selección vacía', () => {
    const resultado = preparar([detalle({ metrajeDetalleM: '0.00', cantidadDetalle: 0, longitudCorteMm: 0 })])
    expect(resultado.estado).toBe('LISTO')
    expect(resultado.grupos[0]).toMatchObject({ metrajeDespieceM: '0.00', cantidadCortes: 0 })
    expect(preparar([])).toEqual({ estado: 'LISTO', grupos: [], incidencias: [] })
  })

  it('no confunde metraje valorado con longitud física de corte', () => {
    const resultado = preparar([detalle({ metrajeDetalleM: '5', longitudCorteMm: 1000 })])
    expect(resultado.grupos[0]).toMatchObject({ metrajeDespieceM: '15', cantidadCortes: 6 })
  })

  it('admite el límite Int32 y bloquea el producto superior', () => {
    expect(preparar([detalle({ cantidadPrincipal: 1, cantidadDetalle: 2_147_483_647 })]).estado).toBe('LISTO')
    expect(preparar([detalle({ cantidadPrincipal: 2, cantidadDetalle: 1_073_741_824 })]))
      .toMatchObject({ estado: 'BLOQUEADO', grupos: [], incidencias: [{ codigo: 'CANTIDAD_DESBORDADA' }] })
  })

  it.each([
    { cantidadPrincipal: 0 }, { cantidadPrincipal: -1 }, { cantidadPrincipal: 1.5 }, { cantidadPrincipal: NaN },
    { cantidadPrincipal: Infinity }, { cantidadPrincipal: Number.MAX_SAFE_INTEGER + 1 },
    { cantidadDetalle: -1 }, { cantidadDetalle: 0.5 }, { cantidadDetalle: NaN }, { cantidadDetalle: Infinity },
    { metrajeDetalleM: '' }, { metrajeDetalleM: '-1' }, { metrajeDetalleM: 'NaN' }, { metrajeDetalleM: 'Infinity' },
    { cantidadDetalle: 0, metrajeDetalleM: '1' }, { longitudCorteMm: 0 }, { longitudCorteMm: -1 },
    { longitudCorteMm: NaN }, { largoArticuloMm: -1 }, { largoArticuloMm: Infinity },
    { largoArticuloMm: NaN }, { articuloCodigo: '' }, { acabadoCodigo: ' ' }, { tonalidadCodigo: '' },
    { lineaId: '' }, { detalleId: '' },
  ])('bloquea datos inválidos sin entregar grupos parciales: %o', cambios => {
    const resultado = preparar([detalle(), detalle({ ...cambios, lineaId: cambios.lineaId ?? 'L2' })])
    expect(resultado.estado).toBe('BLOQUEADO')
    expect(resultado.grupos).toEqual([])
    expect(resultado.incidencias.length).toBeGreaterThan(0)
  })

  it.each([0, -1, NaN, Infinity])('bloquea estándar inválido cuando se necesita: %s', largo => {
    expect(preparar([detalle({ largoArticuloMm: 0 })], largo)).toMatchObject({ estado: 'BLOQUEADO', grupos: [] })
  })

  it('detecta origen repetido incluso si cambia la identidad material', () => {
    expect(preparar([detalle(), detalle({ articuloCodigo: 'P2' })]))
      .toMatchObject({ estado: 'BLOQUEADO', grupos: [], incidencias: [{ codigo: 'ORIGEN_DUPLICADO' }] })
  })

  it('bloquea longitudes incompatibles dentro de la misma identidad triple', () => {
    expect(preparar([detalle(), detalle({ detalleId: 'D2', largoArticuloMm: 6000 })]))
      .toMatchObject({ estado: 'BLOQUEADO', grupos: [], incidencias: [{ codigo: 'BARRAS_INCOMPATIBLES' }] })
  })

  it('no muta entradas ni acumula entre cálculos', () => {
    const detalles = Object.freeze([Object.freeze(detalle()), Object.freeze(detalle({ detalleId: 'D2' }))])
    const foto = JSON.stringify(detalles)
    const primero = preparar(detalles)
    expect(preparar(detalles)).toEqual(primero)
    expect(JSON.stringify(detalles)).toBe(foto)
    expect(primero.grupos[0]).toMatchObject({ metrajeDespieceM: '14.4', cantidadCortes: 12 })
  })
})
