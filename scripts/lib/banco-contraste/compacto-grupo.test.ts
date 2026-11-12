import { test } from 'node:test'
import assert from 'node:assert/strict'
import { compactosDeGrupo } from './compacto-grupo.ts'
import { configuracionGrupo } from './geometria.ts'
import { prepararVariante } from '../contraste-presupuestos/variantes.ts'
import { CON_COMPACTO, grupo } from '../contraste-presupuestos/fixtures.ts'
import type { Caso } from './datos.ts'

// Registros sintéticos con la forma de VAccesorios y VOpciones de la línea GRUPO.
const compacto = { TipoDoc: 'VPRES', nDoc: 1, nLinEstr: 1, FamiliaAcc: '100', Accesorio: 'COM009', Acabado: 'L', AltoCajon: 155,
  compDtoHuecoSN: true, nModulo: 2, VueloI: 0, VueloD: 0, PosGuiaCentral: 0, DtoHuecoH: 0, DtoHuecoV: 0 }
const opcion = (g: number, o: number, nModulo = 0) => ({ TipoDoc: 'VPRES', nDoc: 1, nLinEstr: 1, CodEstr: 'COM009', OPCgrupo: g, OPCnOpcion: o, nModulo })
const opciones = [opcion(1, 0), opcion(10, 0)]
const con = (accesorios: Caso['accesorios'], opcionesAccesorio: Caso['opcionesAccesorio'] = opciones): Caso =>
  ({ ...grupo(CON_COMPACTO), accesorios, opcionesAccesorio })

test('asigna cada compacto a su módulo por nModulo con sus opciones guardadas', () => {
  const r = compactosDeGrupo(con([{ ...compacto, nModulo: 1 }, compacto], [...opciones, opcion(2, 2, 2)]), 2)
  assert.deepEqual(r.motivos, [])
  assert.deepEqual([...r.porModulo].map(([i, c]) => [i, c.opciones]), [[0, ['G1O0', 'G10O0']], [1, ['G1O0', 'G10O0', 'G2O2']]])
  assert.deepEqual(compactosDeGrupo(con([{ ...compacto, nModulo: 0 }]), 1).porModulo.has(0), true)
})

test('sin módulo, repetido, no COM o con medidas manuales no se transmite; guías y acabados sin guía central sí', () => {
  const motivos = (accesorios: Caso['accesorios'], ops: Caso['opcionesAccesorio'] = opciones) => compactosDeGrupo(con(accesorios, ops), 2).motivos
  assert.deepEqual(motivos([{ ...compacto, nModulo: 0 }]), ['compacto-sin-modulo'])
  assert.deepEqual(motivos([{ ...compacto, nModulo: 3 }]), ['compacto-sin-modulo'])
  assert.deepEqual(motivos([compacto, compacto]), ['compacto-repetido-en-modulo'])
  assert.deepEqual(motivos([{ ...compacto, Accesorio: 'PERX' }]), ['compacto-no-representable'])
  // Sin VOpciones el motor aplica las predeterminadas del catálogo: no bloquea.
  assert.deepEqual(motivos([compacto], []), [])
  assert.deepEqual(motivos([{ ...compacto, CerrAltoManual: 1500 }]), ['accesorio-con-guias-o-medidas-manuales'])
  assert.deepEqual(motivos([{ ...compacto, CerrCodGuiaI: 'GMG010', CompAccAcaGuias: 'VS' }]), [])
  assert.deepEqual(motivos([{ ...compacto, GuiaCentralSN: true, CompAccAcaGuias: 'VS' }]), ['acabados-de-accesorio-distintos'])
})

test('el módulo del GRUPO recibe el compacto; sin módulo identificable la configuración se bloquea', () => {
  const r = configuracionGrupo(con([compacto]))
  assert.deepEqual(r.motivos, [])
  assert.deepEqual(r.configuracion!.modulos.map(m => m.compacto?.opciones ?? null), [null, ['G1O0', 'G10O0']])
  assert.deepEqual(configuracionGrupo(con([{ ...compacto, nModulo: 0 }])), { configuracion: null, motivos: ['compacto-sin-modulo'] })
})

test('la variante valora el compacto con evidencia completa y si no lo aparta con su importe', () => {
  const valorado = prepararVariante(con([compacto]))
  assert.deepEqual([valorado.compactos.elementos, valorado.variante.accesorios!.length], [0, 1])
  assert.equal(valorado.variante.compactosElementos!.length, 1)
  const apartado = prepararVariante(con([{ ...compacto, nModulo: 0 }]))
  assert.deepEqual([apartado.compactos.elementos, apartado.compactos.importe, apartado.variante.accesorios!.length], [1, 81.45, 0])
})

test('nModulo indexa la fila superior y cada compacto toma su elemento COM por orden cuando nLinEstrGrupo es 0 (871 y 1249)', () => {
  const geo = [
    { nCerr: 1, Orden: 1, nLinEstr: 11, CodEstr: '2O', EsUnionSN: false },
    { nCerr: 1, Orden: 2, nLinEstr: 12, CodEstr: 'PSU001', EsUnionSN: true, UOrdenElem1: 1, UOrdenElem2: 3, UnionVH: 'H', UGrosor: 2, ULongitud: 1000 },
    { nCerr: 1, Orden: 3, nLinEstr: 13, CodEstr: '0', EsUnionSN: false },
    { nCerr: 1, Orden: 4, nLinEstr: 14, CodEstr: 'PSU001', EsUnionSN: true, UOrdenElem1: 1, UOrdenElem2: 5, UnionVH: 'V', UGrosor: 2, ULongitud: 2000 },
    { nCerr: 1, Orden: 5, nLinEstr: 15, CodEstr: '1OI', EsUnionSN: false },
  ]
  const elem = (nLinea: number, modelo: string, ancho: number, alto: number) =>
    ({ modelo, serie: 'ELEGANTPVC', dimensiones: { ancho, alto }, padre: { nDoc: 1, nLinea, nGrupo: 100 }, piezas: [], exclusiones: [] }) as unknown as Caso
  const casoMultifila: Caso = {
    padre: { nDoc: 1, nLinea: 100 },
    geometria: geo,
    elementos: [elem(11, '2O', 1000, 1980), elem(12, 'PSU001', 0, 1000), elem(13, '0', 1000, 800), elem(14, 'PSU001', 0, 2000), elem(15, '1OI', 900, 1260)],
    compactosElementos: [elem(21, 'COM009', 1000, 2165), elem(22, 'COM009', 900, 1445)],
    accesorios: [
      { ...compacto, nModulo: 1, AltoCajon: 185, nLinEstrGrupo: 0 },
      { ...compacto, nModulo: 2, AltoCajon: 185, nLinEstrGrupo: 0 },
    ],
    opcionesAccesorio: [],
    exclusiones: [],
  } as unknown as Caso
  const { configuracion, motivos } = configuracionGrupo(casoMultifila, 'linea')
  assert.deepEqual(motivos, [])
  // modulo-1 (índice 0) y modulo-5 (índice 2) reciben el compacto; modulo-3 (fijo inferior, índice 1) no.
  // Además, el segundo compacto toma su propio COM009 de 1445 (= 1260 + 185), sin heredar alturaTotalMm 2165 del primero.
  assert.deepEqual(configuracion!.modulos.map(m => [m.id, Boolean(m.compacto), m.compacto?.alturaTotalMm ?? null]), [
    ['modulo-1', true, null],
    ['modulo-3', false, null],
    ['modulo-5', true, null],
  ])
})
