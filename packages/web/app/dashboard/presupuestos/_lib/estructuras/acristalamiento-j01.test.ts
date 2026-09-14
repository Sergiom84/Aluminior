import { describe, expect, it, vi } from 'vitest'
import type { PiezaCortada } from '@aluminior/core/despiece'
import type { ClienteEscritura } from '../cliente-db.ts'
import { resolverAcristalamientoEstructura } from './acristalamiento-estructura.ts'
import { piezasAcristalamiento } from './junquillos.ts'

// Aislamiento de la generación geométrica y del galce. La valoración de vidrio,
// el lookup por acabado, el metraje y el consumidor de diagnósticos son reales.
// No acredita consultas SQL ni una composición comercial completa (J04).
vi.mock('./galce-vidrio.ts', () => ({ leerGalceVidrio: vi.fn(async () => 0) }))
vi.mock('./junquillos.ts', () => ({ piezasAcristalamiento: vi.fn() }))

const pieza = (funcion: string, largoMm: number | null): PiezaCortada => ({
  articuloCodigo: '__J01_JUNQ', cantidad: 2, largoMm, funcion,
  formula: null, tipoCorte: null, anguloIzquierdo: null, anguloDerecho: null, incidencia: null,
})

async function resolver(tipoMetraje: string, largo: number | null, precio: string | null = '10') {
  vi.mocked(piezasAcristalamiento).mockResolvedValue({ piezas: [pieza('JUNQ', largo)], avisos: [] })
  const respuestas = [
    [{ codigo: '__J01_V', familiaCodigo: '050', tipoMetraje: 'M2',
      metrajeMinimo: null, metrajeMultiploLargo: null, metrajeMultiploAncho: null }],
    [{ articuloCodigo: '__J01_V', acabadoCodigo: 'UNI', precio: '20' }],
    [],
    [{ codigo: '__J01_JUNQ', tipoMetraje, metrajeMinimo: null, metrajeMultiploLargo: null }],
    precio === null ? [] : [{ articuloCodigo: '__J01_JUNQ', acabadoCodigo: 'UNI', precio }],
    [],
  ]
  let consultas = 0
  const cliente = { select: () => ({ from: () => ({ where: () => {
    const filas = respuestas[consultas++]
    return Object.assign(Promise.resolve(filas), { limit: async () => filas })
  } }) }) } as unknown as ClienteEscritura
  const r = await resolverAcristalamientoEstructura(cliente, {
    serieCodigo: '__J01_S', estructuraCodigo: '__J01_E', vidrioCodigo: '__J01_V',
    varianteAcristalamiento: '2', acabadoCodigo: 'BLA', anchoMm: 500, altoMm: 1000,
    tarifa: 9101, precioInicial: 40, genericos: new Set(), cotas: {},
    plantillaResuelta: [{ articuloCodigo: '__J01_SLOT', cantidad: 1, formulaLargo: 'L', formulaAncho: 'A',
      funcion: null, tipoCorte: null, anguloIzquierdo: null, anguloDerecho: null,
      componenteDisenyo: '1', idItemDisenyo: 1, tipoHojaDisenyo: -1 }],
    despiece: { piezas: [pieza('MV', 1000), pieza('MH', 500)], incalculables: 0,
      variablesFaltantes: [], consumoPorArticulo: new Map(), avisos: [] },
  })
  expect(consultas).toBe(respuestas.length)
  return r
}

describe('J01 — consumidor de metraje de junquillos/juntas', () => {
  it('40 inicial + 0,5 m² ×20 + 2×1,25 m ×10 =75 €', async () => {
    expect(await resolver('ML', 1250)).toMatchObject({ ok: true, precio: 75, problemas: [] })
  })
  it.each([['M2', 1250], ['ML', null]] as const)('%s sin medidas suficientes no pasa como completo', async (tipo, largo) => {
    const r = await resolver(tipo, largo)
    expect(r).toMatchObject({ ok: true, precio: 50,
      problemas: ['1 artículos de acristalamiento sin medidas suficientes para calcular el metraje'] })
  })
  it('sin precio tampoco autoriza el subtotal como completo', async () => {
    expect(await resolver('ML', 1250, null)).toMatchObject({ ok: true, precio: 50,
      problemas: ['1 artículos de acristalamiento sin precio en la tarifa'] })
  })
  it('ausencia simultánea conserva medida y precio en el diagnóstico', async () => {
    expect(await resolver('M2', 1250, null)).toMatchObject({ ok: true, precio: 50,
      problemas: ['1 artículos de acristalamiento sin medidas suficientes para calcular el metraje; 1 artículos de acristalamiento sin precio en la tarifa'] })
  })
})
