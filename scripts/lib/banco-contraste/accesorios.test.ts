import { test } from 'node:test'
import assert from 'node:assert/strict'
import { accesoriosDeCaso } from './accesorios.ts'
import type { Caso } from './datos.ts'

// Registros sintéticos con la forma de VAccesorios y VOpciones; códigos inventados.
const base = { TipoDoc: 'VPRES', nDoc: 1, nLinEstr: 10, nModulo: 0, Acabado: 'L', AltoCajon: 0, CerrCodGuiaI: '', CerrCodGuiaD: '',
  DtoHuecoH: 0, DtoHuecoV: 0, VueloI: 0, VueloD: 0, PosGuiaCentral: 0, compDtoHuecoSN: false, compDtoTapH: 0, compDtoTapV: 0,
  CompAccAcaLamas: 'L', CompAccAcaGuias: 'L', CompAccAcaAcc: 'L', CerrAltoManual: 0 }
const compacto = { ...base, FamiliaAcc: '100', Accesorio: 'COMX', AltoCajon: 155, compDtoHuecoSN: true }
const tapajuntas = { ...base, FamiliaAcc: '102', Accesorio: 'TAPX', DtoHuecoH: 3, DtoHuecoV: 3 }
const mosquitera = { ...base, FamiliaAcc: '101', Accesorio: 'MOSX', Acabado: 'B', CompAccAcaLamas: '', CompAccAcaGuias: '', CompAccAcaAcc: '' }
const opcion = (CodEstr: string, g: number, o: number, extra = {}) => ({ TipoDoc: 'VPRES', nDoc: 1, nLinEstr: 10, CodEstr, OPCgrupo: g, OPCnOpcion: o, ...extra })
const caso = (c: Partial<Caso>) => ({ tipo: 'ESTRUCTURA', accesorios: [compacto],
  opcionesAccesorio: [opcion('COMX', 1, 0), opcion('COMX', 10, 0), opcion('TAPX', 1, 0)], ...c }) as Caso

test('traduce compacto, tapajuntas y mosquitera con sus opciones', () => {
  const r = accesoriosDeCaso(caso({ accesorios: [compacto, { ...tapajuntas }, mosquitera].map(a => a === compacto ? { ...a, compDtoTapH: 3 } : a) }))
  assert.deepEqual(r.motivos, [])
  assert.deepEqual(r.compacto, { estructura: 'COMX', acabado: 'L', opciones: ['G1O0', 'G10O0'], altoCajonMm: 155,
    vueloIzquierdoMm: 0, vueloDerechoMm: 0, posicionGuiaCentralMm: 0, descuentoVerticalMm: 0 })
  assert.deepEqual(r.accesorios, [{ estructura: 'TAPX', acabado: 'L', opciones: ['G1O0'] }, { estructura: 'MOSX', acabado: 'B', opciones: [] }])
  assert.deepEqual(accesoriosDeCaso(caso({ accesorios: [] })), { compacto: null, accesorios: [], motivos: [] })
})
test('no representa tubos, repetidos, guías, acabados mixtos ni tapas sin tapajuntas', () => {
  const motivos = (c: Partial<Caso>) => accesoriosDeCaso(caso(c)).motivos
  assert.deepEqual(motivos({ accesorios: [{ ...base, FamiliaAcc: '112', Accesorio: 'TUBX' }] }), ['accesorio-de-linea-no-representable'])
  assert.deepEqual(motivos({ accesorios: [compacto, compacto] }), ['accesorio-de-linea-no-representable'])
  assert.deepEqual(motivos({ accesorios: [{ ...compacto, CerrCodGuiaI: 'G1' }] }), ['accesorio-con-guias-o-medidas-manuales'])
  assert.deepEqual(motivos({ accesorios: [{ ...compacto, compDtoTapH: 3 }] }), ['accesorio-con-guias-o-medidas-manuales'])
  assert.deepEqual(motivos({ accesorios: [{ ...compacto, CompAccAcaGuias: 'VS' }] }), ['acabados-de-accesorio-distintos'])
  assert.deepEqual(motivos({ accesorios: [{ ...compacto, compDtoHuecoSN: false }] }), ['compacto-sobre-hueco-no-contrastado'])
  assert.deepEqual(motivos({ opcionesAccesorio: [opcion('OTRO', 1, 0), opcion('COMX', 1, 1, { GrupoDesactivadoSN: true })] }),
    ['opciones-de-compacto-ausentes'])
})
