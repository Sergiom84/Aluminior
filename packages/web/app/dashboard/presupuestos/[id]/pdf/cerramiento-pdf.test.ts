import { expect, it } from 'vitest'
import { snapshotSintetico } from './snapshot-pdf.fixture'
import { adaptarCerramientoPdf, DatosPdfIncoherentes, type EntradaCerramientoPdf } from './cerramiento-pdf'

const entrada = (): EntradaCerramientoPdf => {
  const resultado = snapshotSintetico()
  return { configuracion: structuredClone(resultado.configuracion), version: 1,
    resultado: { version: 1, resultado }, anchoMm: 1760, altoMm: 800,
    manoObra: [{ concepto: 'COLOCACION', horas: '1', importe: '30.00', valoracionCompleta: true }] }
}

it('proyecta geometría y MO congeladas sin multiplicar ni incluir costes', () => {
  const fuente = entrada()
  const antes = structuredClone(fuente)
  expect(adaptarCerramientoPdf(fuente)).toEqual({ configuracion: fuente.configuracion,
    estadoSnapshot: 'con-snapshot', manoObra: fuente.manoObra })
  expect(fuente).toEqual(antes)
})
it('distingue snapshot antiguo ausente, nulo y cero de MO', () => {
  const fuente = entrada()
  const antiguo = adaptarCerramientoPdf({ ...fuente, resultado: null })
  expect(antiguo.estadoSnapshot).toBe('anterior-sin-snapshot')
  expect(antiguo.configuracion).toEqual(fuente.configuracion)
  for (const importe of [null, '0.00']) {
    expect(adaptarCerramientoPdf({ ...fuente, manoObra: [{ concepto: 'COLOCACION',
      horas: '1', importe, valoracionCompleta: importe !== null }] }).manoObra[0].importe).toBe(importe)
  }
})
it.each(['ausente', 'version', 'corrupto', 'geometria', 'medidas'] as const)(
  'rechaza incoherencia %s sin tratarla como antiguo', defecto => {
    const fuente = entrada()
    if (defecto === 'ausente') fuente.configuracion = null
    if (defecto === 'version') fuente.resultado!.version = 2
    if (defecto === 'corrupto') fuente.resultado!.resultado = { version: 1 }
    if (defecto === 'geometria') {
      const otro = snapshotSintetico()
      otro.configuracion.modulos[0].anchoMm = 900
      fuente.resultado!.resultado = otro
    }
    if (defecto === 'medidas') fuente.anchoMm = 999
    expect(() => adaptarCerramientoPdf(fuente)).toThrow(DatosPdfIncoherentes)
  },
)

it('rechaza un snapshot anterior frente a una configuración con FI distinto', () => {
  const fuente = entrada()
  fuente.configuracion = { version: 2, modulos: [{
    id: 'modulo-1', estructuraCodigo: '1OFI', anchoMm: 900, altoMm: 1800, fiMm: 400,
  }], uniones: [] }
  fuente.version = 2
  fuente.anchoMm = 900
  fuente.altoMm = 1800

  expect(() => adaptarCerramientoPdf(fuente)).toThrow(DatosPdfIncoherentes)
})

