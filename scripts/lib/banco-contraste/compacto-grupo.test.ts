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

test('sin módulo, repetido, no COM o sin opciones guardadas no se transmite', () => {
  const motivos = (accesorios: Caso['accesorios'], ops: Caso['opcionesAccesorio'] = opciones) => compactosDeGrupo(con(accesorios, ops), 2).motivos
  assert.deepEqual(motivos([{ ...compacto, nModulo: 0 }]), ['compacto-sin-modulo'])
  assert.deepEqual(motivos([{ ...compacto, nModulo: 3 }]), ['compacto-sin-modulo'])
  assert.deepEqual(motivos([compacto, compacto]), ['compacto-repetido-en-modulo'])
  assert.deepEqual(motivos([{ ...compacto, Accesorio: 'PERX' }]), ['compacto-no-representable'])
  assert.deepEqual(motivos([compacto], []), ['opciones-de-compacto-ausentes'])
  assert.deepEqual(motivos([compacto], [opcion(1, 0, 1)]), ['opciones-de-compacto-ausentes'])
  assert.deepEqual(motivos([{ ...compacto, CerrCodGuiaI: 'G1' }]), ['accesorio-con-guias-o-medidas-manuales'])
})

test('el módulo del GRUPO recibe el compacto; sin opciones guardadas la configuración se bloquea', () => {
  const r = configuracionGrupo(con([compacto]))
  assert.deepEqual(r.motivos, [])
  assert.deepEqual(r.configuracion!.modulos.map(m => m.compacto?.opciones ?? null), [null, ['G1O0', 'G10O0']])
  assert.deepEqual(configuracionGrupo(con([compacto], [])), { configuracion: null, motivos: ['opciones-de-compacto-ausentes'] })
})

test('la variante valora el compacto con evidencia completa y si no lo aparta con su importe', () => {
  const valorado = prepararVariante(con([compacto]))
  assert.deepEqual([valorado.compactos.elementos, valorado.variante.accesorios!.length], [0, 1])
  assert.equal(valorado.variante.compactosElementos!.length, 1)
  const apartado = prepararVariante(con([compacto], []))
  assert.deepEqual([apartado.compactos.elementos, apartado.compactos.importe, apartado.variante.accesorios!.length], [1, 81.45, 0])
})
