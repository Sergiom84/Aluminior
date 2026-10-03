import { test } from 'node:test'
import assert from 'node:assert/strict'
import { compactoDeCaso } from './compacto.ts'
import type { Caso } from './datos.ts'

// Registros sintéticos con la forma de VAccesorios y VOpciones; códigos inventados.
const accesorio = { TipoDoc: 'VPRES', nDoc: 1, nLinEstr: 10, nModulo: 0, FamiliaAcc: '100', Accesorio: 'COMX', Acabado: 'L',
  AltoCajon: 155, CerrCodGuiaI: '', CerrCodGuiaD: '', DtoHuecoH: 0, DtoHuecoV: 0, VueloI: 0, VueloD: 0, PosGuiaCentral: 0,
  compDtoHuecoSN: true, compDtoTapH: 0, compDtoTapV: 0, CompAccAcaLamas: 'L', CompAccAcaGuias: 'L', CompAccAcaAcc: 'L', CerrAltoManual: 0 }
const opcion = (g: number, o: number, extra = {}) => ({ TipoDoc: 'VPRES', nDoc: 1, nLinEstr: 10, CodEstr: 'COMX', OPCgrupo: g, OPCnOpcion: o, ...extra })
const caso = (c: Partial<Caso>) => ({ tipo: 'ESTRUCTURA', accesorios: [accesorio], opcionesAccesorio: [opcion(1, 0), opcion(10, 0)], ...c }) as Caso

test('traduce un compacto contrastado con sus opciones marcadas', () => {
  assert.deepEqual(compactoDeCaso(caso({})), { motivos: [], compacto: { estructura: 'COMX', acabado: 'L', altoCajonMm: 155,
    vueloIzquierdoMm: 0, vueloDerechoMm: 0, posicionGuiaCentralMm: 0, descuentoVerticalMm: 0, opciones: ['G1O0', 'G10O0'] } })
  assert.deepEqual(compactoDeCaso(caso({ accesorios: [] })), { compacto: null, motivos: [] })
})
test('no representa otros accesorios, guías, tapas, acabados mixtos ni opciones ausentes', () => {
  const motivos = (c: Partial<Caso>) => compactoDeCaso(caso(c)).motivos
  assert.deepEqual(motivos({ accesorios: [{ ...accesorio, FamiliaAcc: '102', Accesorio: 'TAPX' }] }), ['accesorio-de-linea-no-representable'])
  assert.deepEqual(motivos({ accesorios: [accesorio, accesorio] }), ['accesorio-de-linea-no-representable'])
  assert.deepEqual(motivos({ accesorios: [{ ...accesorio, CerrCodGuiaI: 'G1' }] }), ['compacto-con-guias-tapas-o-medidas-manuales'])
  assert.deepEqual(motivos({ accesorios: [{ ...accesorio, CompAccAcaGuias: 'VS' }] }), ['acabados-de-compacto-distintos'])
  assert.deepEqual(motivos({ accesorios: [{ ...accesorio, compDtoHuecoSN: false }] }), ['compacto-sobre-hueco-no-contrastado'])
  assert.deepEqual(motivos({ opcionesAccesorio: [opcion(1, 0, { CodEstr: 'OTRO' }), opcion(1, 1, { GrupoDesactivadoSN: true })] }),
    ['opciones-de-compacto-ausentes'])
})
