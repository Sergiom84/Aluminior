import { describe, expect, it } from 'vitest'
import { cambiarInvisibleModulo, esModuloInvisible } from './elemento-invisible.ts'
import { esConfiguracionCerramiento } from './validar-configuracion-cerramiento.ts'
import { medidasCerramiento, type ConfiguracionCerramiento } from './cerramiento.ts'
import { esResultadoCerramiento } from './resultado-cerramiento/validar.ts'
import { origenInvisible } from './resultado-cerramiento/invisible.ts'
import type { ResultadoCerramientoV1, ResultadoOrigenCerramiento } from './resultado-cerramiento/tipos.ts'

const fijo: ConfiguracionCerramiento = {
  version: 1, modulos: [{ id: 'm1', estructuraCodigo: '0', anchoMm: 400, altoMm: 400 }], uniones: [],
}

describe('elemento invisible (DS3)', () => {
  it('marca y desmarca sin dejar `invisible: false` y pasa a la composición v3', () => {
    const marcada = cambiarInvisibleModulo(fijo, 'm1', true)
    expect(marcada.version).toBe(3)
    expect(esModuloInvisible(marcada.modulos[0])).toBe(true)
    expect(esConfiguracionCerramiento(marcada)).toBe(true)
    const desmarcada = cambiarInvisibleModulo(marcada, 'm1', false)
    expect(Object.hasOwn(desmarcada.modulos[0], 'invisible')).toBe(false)
    expect(cambiarInvisibleModulo(fijo, 'no-existe', true)).toBe(fijo)
  })

  it('sigue contando en las medidas del conjunto', () => {
    expect(medidasCerramiento(cambiarInvisibleModulo(fijo, 'm1', true))).toEqual(medidasCerramiento(fijo))
  })

  it('rechaza el campo fuera de v3 o con otro valor que true', () => {
    expect(esConfiguracionCerramiento({ ...fijo, modulos: [{ ...fijo.modulos[0], invisible: true }] })).toBe(false)
    const marcada = cambiarInvisibleModulo(fijo, 'm1', true)
    expect(esConfiguracionCerramiento({ ...marcada, modulos: [{ ...marcada.modulos[0], invisible: false }] })).toBe(false)
  })

  it('el snapshot solo admite la regla del invisible en un elemento marcado, y viceversa', () => {
    const base: ResultadoOrigenCerramiento = {
      origen: { tipo: 'MODULO', id: 'm1' }, codigo: '0', serieCodigo: 'S', acabadoCodigo: 'L', vidrioCodigo: 'V',
      varianteAcristalamiento: '1', reglaMaterial: null, venta: { completo: false, importe: null },
      coste: { completo: false, importe: null }, piezas: [], partidasValoracion: [], acristalamiento: [],
      opcionesHerraje: [], diagnosticos: [],
    }
    const resultado = (configuracion: ConfiguracionCerramiento): ResultadoCerramientoV1 => ({
      version: 1, redondeoVenta: 'FILA_CENTIMOS', configuracion,
      motor: { codigo: 'CATALOGO_CERRAMIENTO', version: '2' }, tarifa: 9,
      unidadMateriales: 'COMPOSICION', ambitoManoObraManual: 'LINEA', origenes: [origenInvisible(base)],
      ventaMateriales: { completo: true, importe: '0.00' }, costeMateriales: { completo: true, importe: '0.0000' },
    })
    expect(esResultadoCerramiento(resultado(cambiarInvisibleModulo(fijo, 'm1', true)))).toBe(true)
    expect(esResultadoCerramiento(resultado(fijo))).toBe(false)
    const conPieza = resultado(cambiarInvisibleModulo(fijo, 'm1', true))
    expect(esResultadoCerramiento({ ...conPieza, origenes: [{ ...conPieza.origenes[0],
      venta: { completo: true, importe: '5.00' } }] })).toBe(false)
  })
})
