import { afterAll, describe, expect, it } from 'vitest'
import { schema } from '@aluminior/db'
import { eq } from 'drizzle-orm'
import { valorarEstructura } from '../valorar-estructura.ts'
import { valorarCerramiento } from '../../cerramientos/valorar-cerramiento.ts'
import { leerCatalogoLinea } from './leer-catalogo.ts'
import { caso, db, entrada, type Tx } from './catalogo-qa-corr.fixture.ts'

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
})
