import { afterAll, describe, expect, it } from 'vitest'
import { schema } from '@aluminior/db'
import { eq } from 'drizzle-orm'
import { TIPO_COTA, TIPO_NODO, type NodoDiseno } from '@aluminior/core/despiece'
import { actualizarDisenoPropioModuloCerramiento, crearConfiguracionCerramiento, plantillaDiseno } from '@aluminior/core/estructuras'
import { valorarEstructura } from '../valorar-estructura.ts'
import { valorarCerramiento } from '../../cerramientos/valorar-cerramiento.ts'
import { leerCatalogoLinea } from './leer-catalogo.ts'
import { caso, db, entrada, fila, type Tx } from './catalogo-qa-corr.fixture.ts'

afterAll(() => db.$client.end({ timeout: 5 }))

/** Diseño propio: la plantilla de catálogo con otro vidrio en el segundo cristal. */
async function plantillaConVidrioPropio(tx: Tx, estructura: string) {
  await tx.insert(schema.articulos).values({ codigo: 'QA-LAMINADO', descripcion: 'Laminado', tipoMetraje: 'M2' })
  await tx.insert(schema.articulosDespiece).values({ articuloCodigo: 'QA-LAMINADO', precioEnTabla: false, generico: false,
    dobleAcristalamiento: true, grosorAcristalar: '16', incrementosPrecio: false })
  await tx.insert(schema.articulosPvp).values({ articuloCodigo: 'QA-LAMINADO', acabadoCodigo: 'UNI', tarifa: 1, precio: '100' })
  const catalogo = await leerCatalogoLinea(tx, { estructura, serie: 'QA-SERIE', vidrio: 'QA-VIDRIO', tarifa: 1 })
  return catalogo!.plantilla(estructura).map(f => f.id === 23 ? { ...f, vidrioPropio: 'QA-LAMINADO' } : f)
}

describe('plantilla propia del módulo (diseño específico)', () => {
  it('la estructura se valora con su plantilla y el vidrio propio del hueco; sin ella, con la de catálogo', () => caso(async tx => {
    const plantillaPropia = await plantillaConVidrioPropio(tx, 'QA-CORR')
    const propio = await valorarEstructura(tx, { ...entrada, plantillaPropia })
    if (!propio.ok) throw new Error('rechazada')
    // 139,56 − 32,50 del vidrio de línea + 0,61 m2 × 100 del laminado.
    expect(propio).toMatchObject({ motor: 'catalogo', precioUnitario: 168.06, materialCompleto: true })
    expect(propio.piezas.filter(p => /VIDRIO|LAMINADO/.test(p.articuloCodigo)).map(p => p.articuloCodigo)).toEqual(['QA-VIDRIO', 'QA-LAMINADO'])
    expect(await valorarEstructura(tx, entrada)).toMatchObject({ ok: true, precioUnitario: 139.56 })
  }))

  it('en un GRUPO la plantilla propia se aplica por id de módulo', () => caso(async tx => {
    await tx.insert(schema.estructuras).values({ codigo: 'C2', descripcion: 'Corredera de prueba' })
    await tx.update(schema.estructuraPlantillaCatalogo).set({ estructuraCodigo: 'C2' })
      .where(eq(schema.estructuraPlantillaCatalogo.estructuraCodigo, 'QA-CORR'))
    const propia = await plantillaConVidrioPropio(tx, 'C2')
    const configuracion = { version: 1 as const, modulos: [{ id: 'b', estructuraCodigo: 'C2', anchoMm: 1200, altoMm: 1300 }], uniones: [] }
    const venta = async (id: string) => (await valorarCerramiento(tx, { ...entrada, configuracion,
      plantillasPropias: new Map([[id, propia]]) })).ventaMateriales
    expect(await venta('b')).toEqual({ completo: true, importe: '168.06' })
    // La plantilla de otro módulo no afecta a este: sigue con la de catálogo.
    expect(await venta('otro')).toEqual({ completo: true, importe: '139.56' })
  }))

  it('valora `modulo.disenoPropio` persistido en la configuración sin inyectar `plantillasPropias`', () => caso(async tx => {
    await tx.insert(schema.estructuras).values({ codigo: '0', descripcion: 'Fijo de 1 hueco' })
    await tx.insert(schema.articulos).values([
      { codigo: 'QA-TMP', descripcion: 'Travesaño de marco', tipoMetraje: 'ML' },
      { codigo: 'QA-LAMINADO', descripcion: 'Laminado', tipoMetraje: 'M2' },
      { codigo: '1', descripcion: 'Genérico MV', tipoMetraje: 'ML' },
      { codigo: '2', descripcion: 'Genérico MH sup', tipoMetraje: 'ML' },
      { codigo: '3', descripcion: 'Genérico MH inf', tipoMetraje: 'ML' },
      { codigo: '8', descripcion: 'Genérico vidrio', tipoMetraje: 'M2' },
      { codigo: '11', descripcion: 'Genérico TMP', tipoMetraje: 'ML' },
      { codigo: '62', descripcion: 'Genérico final', tipoMetraje: 'UD' },
      { codigo: '105', descripcion: 'Genérico escuadra', tipoMetraje: 'UD' },
      { codigo: '148', descripcion: 'Genérico MO', tipoMetraje: 'UD' },
    ])
    await tx.insert(schema.articulosDespiece).values([
      { articuloCodigo: 'QA-TMP', precioEnTabla: false, generico: false, dobleAcristalamiento: false, grosorAcristalar: '0', incrementosPrecio: false },
      { articuloCodigo: 'QA-LAMINADO', precioEnTabla: false, generico: false, dobleAcristalamiento: true, grosorAcristalar: '16', incrementosPrecio: false },
      { articuloCodigo: '1', componente: '12', precioEnTabla: false, generico: true, dobleAcristalamiento: false, grosorAcristalar: '0', incrementosPrecio: false },
      { articuloCodigo: '2', componente: '11', precioEnTabla: false, generico: true, dobleAcristalamiento: false, grosorAcristalar: '0', incrementosPrecio: false },
      { articuloCodigo: '3', componente: '10', precioEnTabla: false, generico: true, dobleAcristalamiento: false, grosorAcristalar: '0', incrementosPrecio: false },
      { articuloCodigo: '8', componente: '1', precioEnTabla: false, generico: true, dobleAcristalamiento: false, grosorAcristalar: '0', incrementosPrecio: false },
      { articuloCodigo: '11', componente: '16', precioEnTabla: false, generico: true, dobleAcristalamiento: false, grosorAcristalar: '0', incrementosPrecio: false },
      { articuloCodigo: '62', precioEnTabla: false, generico: true, dobleAcristalamiento: false, grosorAcristalar: '0', incrementosPrecio: false },
      { articuloCodigo: '105', componente: '58', precioEnTabla: false, generico: true, dobleAcristalamiento: false, grosorAcristalar: '0', incrementosPrecio: false },
      { articuloCodigo: '148', componente: '39', precioEnTabla: false, generico: true, dobleAcristalamiento: false, grosorAcristalar: '0', incrementosPrecio: false },
    ])
    await tx.insert(schema.articulosPvp).values([
      { articuloCodigo: 'QA-TMP', acabadoCodigo: 'L', tarifa: 1, precio: '12' },
      { articuloCodigo: 'QA-LAMINADO', acabadoCodigo: 'UNI', tarifa: 1, precio: '100' },
    ])
    await tx.delete(schema.conjuntos).where(eq(schema.conjuntos.codigo, 'QA-SERIE-X'))
    await tx.insert(schema.conjuntos).values({ codigo: 'QA-SERIE-X', tablaHojas: 'QA-T', tablaFijos: 'QA-T' })
    await tx.delete(schema.conjuntoResoluciones).where(eq(schema.conjuntoResoluciones.conjuntoCodigo, 'QA-SERIE-X'))
    await tx.insert(schema.conjuntoResoluciones).values([
      { conjuntoCodigo: 'QA-SERIE-X', componente: '11', familia: '001', articuloCodigo: 'QA-MARCO' },
      { conjuntoCodigo: 'QA-SERIE-X', componente: '12', familia: '001', articuloCodigo: 'QA-MARCO' },
      { conjuntoCodigo: 'QA-SERIE-X', componente: '10', familia: '001', articuloCodigo: 'QA-MARCO' },
      { conjuntoCodigo: 'QA-SERIE-X', componente: '16', familia: '001', articuloCodigo: 'QA-TMP' },
      { conjuntoCodigo: 'QA-SERIE-X', componente: '1', familia: '001', articuloCodigo: 'QA-VIDRIO' },
      { conjuntoCodigo: 'QA-SERIE-X', componente: '13', familia: '001', articuloCodigo: '2' },
    ])
    for (const c of ['58']) {
      await tx.insert(schema.conjuntoRanurasVacias).values({ conjuntoCodigo: 'QA-SERIE-2', componente: c })
    }
    await tx.delete(schema.conjuntoDescuentosCorte).where(eq(schema.conjuntoDescuentosCorte.conjuntoCodigo, 'QA-SERIE'))
    await tx.insert(schema.conjuntoDescuentosCorte).values([
      ['E', 'MV', 'G', '0'], ['MV', 'MH', 'G', '20'], ['MV', 'C', 'G', '20'], ['MH', 'C', 'G', '20'], ['TMP', 'C', 'G', '10'],
    ].map(([grupoPrincipal, grupo, tipoHoja, descuentoMm]) => ({
      conjuntoCodigo: 'QA-SERIE', familia: '001', grupoPrincipal: grupoPrincipal!, grupo: grupo!, tipoHoja: tipoHoja!, descuentoMm: descuentoMm!,
    })))
    await tx.insert(schema.estructuraPlantillaCatalogo).values([
      fila(1, { estructuraCodigo: '0', articulo: '1', componente: '12', funcion: 'MV', grupo: 'MV', grupoIzquierdo: 'E', grupoDerecho: 'E', posicionTrabajo: 'L' }),
    ])

    const base = {
      ...crearConfiguracionCerramiento(plantillaDiseno('0')!),
      modulos: [{ id: 'modulo-1', estructuraCodigo: '0', anchoMm: 1000, altoMm: 1000 }],
    }
    const sinHerraje = { ...entrada, opcionesHerraje: [] }
    const nodosSimple: readonly NodoDiseno[] = [
      { id: 0, tipo: TIPO_NODO.marco, contenidoEn: -1, tipoMarco: 'NOR', cortes: [1, 1, 1, 1] },
      { id: 1, tipo: TIPO_NODO.vidrio, contenidoEn: 0, vidrio: null },
    ]
    const simple = actualizarDisenoPropioModuloCerramiento(base, 'modulo-1', { nodos: nodosSimple })
    const sinTravesano = await valorarCerramiento(tx, { ...sinHerraje, configuracion: simple })
    // eslint-disable-next-line no-console
    console.log(sinTravesano.origenes[0]?.diagnosticos)
    expect(sinTravesano.ventaMateriales.completo).toBe(true)

    const nodos: readonly NodoDiseno[] = [
      { id: 0, tipo: TIPO_NODO.marco, contenidoEn: -1, tipoMarco: 'NOR', cortes: [1, 1, 1, 1] },
      { id: 1, tipo: TIPO_NODO.travesano, contenidoEn: 0, posicion: 'HB', division: 1, orden: 1, tipoCota: TIPO_COTA.fija, cota: 400, material: 'M', clase: 'V' },
      { id: 2, tipo: TIPO_NODO.hueco, contenidoEn: 0, division: 1, orden: 1 },
      { id: 3, tipo: TIPO_NODO.vidrio, contenidoEn: 2, vidrio: null },
      { id: 4, tipo: TIPO_NODO.hueco, contenidoEn: 0, division: 1, orden: 2 },
      { id: 5, tipo: TIPO_NODO.vidrio, contenidoEn: 4, vidrio: 'QA-LAMINADO' },
    ]
    const conDiseno = actualizarDisenoPropioModuloCerramiento(base, 'modulo-1', { nodos })
    const valorado = await valorarCerramiento(tx, { ...sinHerraje, configuracion: conDiseno })

    expect(valorado.ventaMateriales.completo).toBe(true)
    expect(Number(valorado.ventaMateriales.importe)).toBeGreaterThan(Number(sinTravesano.ventaMateriales.importe))
    expect(valorado.origenes[0]?.piezas.map(p => p.articuloCodigo)).toContain('QA-TMP')
    expect(valorado.origenes[0]?.piezas.map(p => p.articuloCodigo)).toContain('QA-LAMINADO')
  }))
})
