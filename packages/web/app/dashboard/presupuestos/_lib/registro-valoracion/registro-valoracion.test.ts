import { describe, expect, it } from 'vitest'
import type { ResultadoCerramientoV1 } from '@aluminior/core/estructuras'
import type { AltaCerramiento } from '../cerramientos/alta-cerramiento.ts'
import { construirRegistroValoracion, PREFIJO_REGISTRO_VALORACION, registrarValoracion, type EntradaRegistroValoracion } from './index.ts'

const alta = {
  configuracion: { version: 3, acabadoAccesoriosCodigo: 'UNI',
    modulos: [{ id: 'modulo-1', estructuraCodigo: '1OFI', anchoMm: 750, altoMm: 2295, cotas: { FI: 1000 },
      compacto: { estructuraCodigo: 'COM009', altoCajonMm: 185 } }],
    uniones: [{ id: 'union-1', codigo: '', longitudMm: 2295, grosorMm: 20 }] },
  descripcion: 'VENTANA', anchoMm: 750, altoMm: 2295, precioUnitario: null, aviso: '',
  datos: { configuracionSerializada: null, serieCodigo: 'ELEGANTPVC', vidrioCodigo: 'VM420AGS4', acabadoCodigo: 'L',
    varianteAcristalamiento: '2' },
} as unknown as AltaCerramiento

const resultado = {
  motor: { codigo: 'cerramiento', version: '1' }, tarifa: 1,
  origenes: [
    { origen: { tipo: 'MODULO', id: 'modulo-1' }, diagnosticos: [
      { codigo: 'AVISO_VALORACION', ambito: 'VENTA', bloqueante: false, detalle: 'vidrio de 28 mm' },
      { codigo: 'SIN_PRECIO', ambito: 'VENTA', bloqueante: false, detalle: JSON.stringify({ articulo: 'PSESQCOM', acabado: 'VS' }) },
    ] },
    { origen: { tipo: 'UNION', id: 'union-1' }, diagnosticos: [
      { codigo: 'VENTA_INCOMPLETA', ambito: 'VENTA', bloqueante: true, detalle: 'x'.repeat(500) },
    ] },
  ],
} as unknown as ResultadoCerramientoV1

const entrada: EntradaRegistroValoracion = {
  operacion: 'alta', presupuestoId: 'p-1', lineaId: 'l-1', tipo: 'CERRAMIENTO', articulo: null,
  cantidad: '4', anchoMm: 750, altoMm: 2295, precioUnitario: null, total: null, valoracionCompleta: false,
  pvpManual: false, aviso: 'MODULO modulo-1: vidrio de 28 mm', cerramiento: alta, resultado,
}

describe('registro de valoración', () => {
  it('recoge entradas, resultado y causas, con las bloqueantes primero', () => {
    const r = construirRegistroValoracion(entrada)
    expect(r).toMatchObject({ evento: 'valoracion', estado: 'INCOMPLETA', cantidad: 4, precioUnitario: null,
      motor: 'cerramiento', tarifa: 1, sinPvp: ['PSESQCOM|VS'] })
    expect(r.cerramiento).toEqual({ serie: 'ELEGANTPVC', vidrio: 'VM420AGS4', acabado: 'L', acabadoAccesorios: 'UNI',
      modulos: [{ estructura: '1OFI', anchoMm: 750, altoMm: 2295, cotas: { FI: 1000 }, compacto: 'COM009', altoCajonMm: 185 }],
      uniones: ['SIN_CONFIGURAR'], preciosManuales: 0 })
    expect(r.causas.map(c => [c.origen, c.codigo, c.bloqueante])).toEqual([
      ['UNION union-1', 'VENTA_INCOMPLETA', true], ['MODULO modulo-1', 'AVISO_VALORACION', false]])
    expect(r.causas[0]!.detalle.length).toBe(300)
  })
  it('distingue precio manual y valoración completa', () => {
    expect(construirRegistroValoracion({ ...entrada, pvpManual: true, valoracionCompleta: true }).estado).toBe('PVP_MANUAL')
    expect(construirRegistroValoracion({ ...entrada, valoracionCompleta: true, precioUnitario: '923.48' }))
      .toMatchObject({ estado: 'COMPLETA', precioUnitario: 923.48 })
  })
  it('escribe una línea con prefijo y JSON legible, sin nombre de cliente ni obra', () => {
    const escritas: string[] = []
    registrarValoracion(entrada, t => escritas.push(t))
    expect(escritas).toHaveLength(1)
    expect(escritas[0]!.startsWith(`${PREFIJO_REGISTRO_VALORACION} {`)).toBe(true)
    const json = JSON.parse(escritas[0]!.slice(PREFIJO_REGISTRO_VALORACION.length + 1)) as Record<string, unknown>
    expect(Object.keys(json)).not.toEqual(expect.arrayContaining(['cliente']))
    expect(Object.keys(json).some(k => /cliente|obra|nombre/i.test(k))).toBe(false)
  })
  it('nunca lanza aunque falle la escritura o el resultado venga roto', () => {
    expect(() => registrarValoracion(entrada, () => { throw new Error('stdout cerrado') })).not.toThrow()
    expect(() => registrarValoracion({ ...entrada, resultado: { origenes: null } as unknown as ResultadoCerramientoV1 },
      () => undefined)).not.toThrow()
    expect(() => registrarValoracion(() => { throw new Error('entrada rota') }, () => undefined)).not.toThrow()
  })
})
