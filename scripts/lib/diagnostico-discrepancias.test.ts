import { describe, expect, it } from 'vitest'
import type { FilaDespieceCatalogo } from '../../packages/core/src/despiece/linea-catalogo/tipos.ts'
import type { ArticuloTarifado } from '../../packages/core/src/precios/importe-fila.ts'
import type { HijaFactura } from './contraste-despiece-facturas.ts'
import { diagnosticarEconomia, diagnosticarGeometria, emparejarPiezas, medidasPresupuestoOrigen } from './diagnostico-discrepancias.ts'

// Todas las filas y precios de esta prueba son sintéticos.
const motor = (f: Partial<FilaDespieceCatalogo> = {}): FilaDespieceCatalogo => ({
  articulo: 'P', cantidad: 1, largoMm: 1000, anchoMm: null, metraje: 1, importe: 3,
  origen: 'plantilla', acabado: 'UNI', funcion: null, ...f,
})

describe('procedencia inequívoca del presupuesto', () => {
  const padre = { nAlbaran: 'N-A', nLinAlb: 'L-A', Articulo: 'E' }
  const alb = [{ Numero: 'N-A', Id: 'ID-A' }]
  const la = [{ nDoc: 'ID-A', nLinea: 'L-A', Articulo: 'E', EstructuraSN: 'True', TipoDocOrig: 'VPRES', nDocOrigen: 'N-P', nLinOrig: 'L-P' }]
  const pre = [{ Numero: 'N-P', Id: 'ID-P' }]
  const lp = [{ nDoc: 'ID-P', nLinea: 'L-P', Articulo: 'E', EstructuraSN: 'True', Ancho: '900,5', Largo: '1200' }]
  it('recupera solo las medidas del destino de una cadena única', () => {
    expect(medidasPresupuestoOrigen(padre, alb, la, pre, lp)).toEqual({ anchoMm: 900.5, altoMm: 1200 })
  })
  it.each([0, 1, 2, 3])('rechaza un salto ambiguo en la posición %i aunque termine en una sola línea', indice => {
    const fuentes = [alb, la, pre, lp].map((filas, i) => i === indice ? [...filas, ...filas] : filas)
    expect(medidasPresupuestoOrigen(padre, fuentes[0]!, fuentes[1]!, fuentes[2]!, fuentes[3]!)).toBeNull()
  })
  it('rechaza estructuras distintas, tipo documental incorrecto y medidas ausentes', () => {
    expect(medidasPresupuestoOrigen(padre, alb, [{ ...la[0]!, TipoDocOrig: 'VFAC' }], pre, lp)).toBeNull()
    expect(medidasPresupuestoOrigen(padre, alb, la, pre, [{ ...lp[0]!, Articulo: 'OTRO' }])).toBeNull()
    expect(medidasPresupuestoOrigen(padre, alb, la, pre, [{ ...lp[0]!, Ancho: '' }])).toBeNull()
  })
})
const factura = (f: Partial<HijaFactura> = {}): HijaFactura => ({
  articulo: 'P', cantidad: 1, largoMm: 1000, anchoMm: 0, precio: 3, importe: 3, funcion: '', ...f,
})
const tarifa = (a: Partial<ArticuloTarifado> = {}): ArticuloTarifado => ({
  tipoMetraje: 'ML', pvp: 3, multiploLargoCm: 0, multiploAnchoCm: 0, minimo: 0, incrementos: [], ...a,
})

describe('diagnóstico de discrepancias, sin modificar el motor', () => {
  it('consume cada pieza una sola vez y no oculta una ausencia', () => {
    const r = emparejarPiezas([motor(), motor()], [factura()], () => true)
    expect(r.pares).toHaveLength(1)
    expect(r.soloMotor).toHaveLength(1)
  })
  it('declara ambiguas todas las copias sin asignar precios por orden', () => {
    const r = diagnosticarEconomia([motor(), motor()], [factura(), factura({ precio: 5, importe: 5 })], () => true, () => tarifa())
    expect(r.filas.map(f => f.causa)).toEqual(['emparejamiento-o-precio-no-acreditado', 'emparejamiento-o-precio-no-acreditado'])
  })
  it('no calcula a partir de un metraje infinito ni un importe no numérico', () => {
    for (const [m, h] of [[motor({ metraje: Infinity }), factura()], [motor(), factura({ importe: NaN })]] as const) {
      expect(diagnosticarEconomia([m], [h], () => true, () => tarifa()).filas[0]?.causa).toBe('emparejamiento-o-precio-no-acreditado')
    }
  })
  it('localiza un céntimo sin atribuirlo a una tarifa ni alterar el precio', () => {
    const h = factura({ precio: 2.549999952316284, importe: 1.79 })
    const m = motor({ cantidad: 2, largoMm: 350, metraje: 0.7 })
    h.cantidad = 2; h.largoMm = 350
    const r = diagnosticarEconomia([m], [h], () => true, () => tarifa())
    expect(r.filas[0]).toMatchObject({ causa: 'precio-exportado-con-residuo', diferenciaCentimos: -1, importePrecioDecimal: 1.79 })
    expect(h.precio).toBe(2.549999952316284)
    expect(m.importe).toBe(3)
  })
  it('separa el incremento incluido en metraje de la base de superficie', () => {
    const m = motor({ largoMm: 1000, anchoMm: 1000, metraje: 1.08 })
    const h = factura({ anchoMm: 1000, precio: 10.8, importe: 10.8 })
    const r = diagnosticarEconomia([m], [h], () => false, () => tarifa({ tipoMetraje: 'M2', pvp: 10,
      incrementos: [{ tipo: 'MET', desde: 0, hasta: 2, porcentaje: 8 }] }))
    expect(r.filas[0]).toMatchObject({ causa: 'superficie-o-incremento-m2', metrajeSinIncrementos: 1, importeSinIncrementos: 10.8, importeRevalorado: 11.66 })
  })
  it('observa residuos pequeños sin declararlos piezas coincidentes', () => {
    const r = diagnosticarGeometria([motor({ largoMm: 433.35 })], [factura({ largoMm: 433.34998 })], () => true)
    expect(r).toMatchObject({ soloMotor: 1, soloFactura: 1, residuosPequenos: 1 })
    expect(r.causa).not.toBe('piezas-coincidentes')
  })
  it('conserva un tubo adicional y no interpreta su presencia como una regla', () => {
    expect(diagnosticarGeometria([motor()], [factura(), factura({ articulo: 'TUBO', funcion: 'TUBODE' })], () => true))
      .toMatchObject({ causa: 'filas-adicionales', filasAdicionales: [{ articulo: 'TUBO', funcion: 'TUBODE' }] })
  })
  it('no convierte una medida ausente en un residuo frente a cero', () => {
    expect(diagnosticarGeometria([motor({ largoMm: null })], [factura({ largoMm: 0 })], () => true))
      .toMatchObject({ causa: 'geometria-pendiente', residuosPequenos: 0 })
    expect(diagnosticarGeometria([motor({ anchoMm: null })],
      [factura({ anchoMm: 0.00005 })], () => false))
      .toMatchObject({ causa: 'geometria-pendiente', residuosPequenos: 0 })
  })
  it('no explica una diferencia real en el ancho del vidrio con residuos decimales', () => {
    expect(diagnosticarGeometria([motor({ anchoMm: 800 })], [factura({ anchoMm: 801 })], () => false))
      .toMatchObject({ causa: 'geometria-pendiente', residuosPequenos: 0 })
  })
})
