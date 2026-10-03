import { afterAll, describe, expect, it } from 'vitest'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { esResultadoCerramiento } from '@aluminior/core/estructuras'
import { eq } from 'drizzle-orm'
import { valorarCerramiento } from './valorar-cerramiento.ts'

const db = crearDb(urlDePruebasValidada(process.env.TEST_DATABASE_URL))
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]
const rollback = new Error('rollback sintético SIN UNION')
afterAll(() => db.$client.end({ timeout: 5 }))

async function caso(fn: (tx: Tx) => Promise<void>) {
  try {
    await db.transaction(async tx => {
      await tx.insert(schema.estructuras).values([
        { codigo: '0', descripcion: 'Módulo SINTÉTICO' },
        { codigo: 'U', descripcion: 'SIN UNION SINTÉTICA', familia: '103', esAccesorio: true },
      ])
      await tx.insert(schema.conjuntos).values({ codigo: 'QA-SIN-UNION' })
      await tx.insert(schema.conjuntoParametrosDespiece).values({ conjuntoCodigo: 'QA-SIN-UNION',
        herrajes: {}, manoObra: {}, grosorMaximoSimple: '10', grosorMaximoDoble: '20' })
      await tx.insert(schema.articulos).values({ codigo: 'QA-SIN-UNION-P', descripcion: 'Perfil SINTÉTICO', tipoMetraje: 'ML' })
      await tx.insert(schema.articulosDespiece).values({ articuloCodigo: 'QA-SIN-UNION-P', generico: false,
        dobleAcristalamiento: false, grosorAcristalar: '0', incrementosPrecio: false })
      await tx.insert(schema.articulosPvp).values({ articuloCodigo: 'QA-SIN-UNION-P', acabadoCodigo: 'UNI', tarifa: 1, precio: '10' })
      await tx.insert(schema.articulosCoste).values({ articuloCodigo: 'QA-SIN-UNION-P', acabadoCodigo: 'UNI', proveedorCodigo: 'QA', coste: '4' })
      const fila = { idPieza: 1, lineaOrigen: 1, cantidad: '1', tipoHoja: '-1', hoja: 0, gruposAdicionales: ['', '', '', ''] }
      await tx.insert(schema.estructuraPlantillaCatalogo).values([
        { ...fila, estructuraCodigo: '0', articulo: 'QA-SIN-UNION-P', formulaLargo: 'L' },
        { ...fila, estructuraCodigo: 'U', articulo: 'QA-SIN-UNION-P', cantidad: '0', formulaLargo: 'L' },
      ])
      await fn(tx)
      throw rollback
    })
  } catch (e) { if (e !== rollback) throw e }
}

const entrada = (codigo = 'U') => ({ configuracion: { version: 1 as const,
  modulos: [{ id: 'm1', estructuraCodigo: '0', anchoMm: 439.5, altoMm: 1250 },
    { id: 'm2', estructuraCodigo: '0', anchoMm: 439.5, altoMm: 1250 }],
  uniones: [{ id: 'u1', codigo, grosorMm: 1, longitudMm: 1250 }] },
  serieCodigo: 'QA-SIN-UNION', acabadoCodigo: 'UNI', vidrioCodigo: null,
  varianteAcristalamiento: '1' as const, tarifa: 1 })

describe('SIN UNION con catálogo sintético: servicio y lectura del snapshot', () => {
  it('valora el módulo fraccionario y conserva U como ausencia explícita de material', () => caso(async tx => {
    const r = await valorarCerramiento(tx, entrada())
    expect(esResultadoCerramiento(JSON.parse(JSON.stringify(r)))).toBe(true)
    expect(r.ventaMateriales).toEqual({ completo: true, importe: '25.00' })
    expect(r.costeMateriales).toEqual({ completo: true, importe: '10.0000' })
    expect(r.origenes[2]).toMatchObject({ codigo: 'U', reglaMaterial: 'SIN_UNION_U',
      venta: { completo: true, importe: '0.00' }, coste: { completo: true, importe: '0.0000' },
      piezas: [], partidasValoracion: [], diagnosticos: [] })
    expect(r.configuracion.modulos[0].anchoMm).toBe(439.5)
  }))

  it.each(['U', 'GMU038'])('sin receta de %s mantiene importe nulo y snapshot válido', codigo => caso(async tx => {
    await tx.delete(schema.estructuraPlantillaCatalogo).where(eq(schema.estructuraPlantillaCatalogo.estructuraCodigo, 'U'))
    const r = await valorarCerramiento(tx, entrada(codigo))
    expect(esResultadoCerramiento(r)).toBe(true)
    expect(r.ventaMateriales).toEqual({ completo: false, importe: null })
    expect(r.origenes[2].venta).toEqual({ completo: false, importe: null })
  }))

  it('una receta cero de otra unión no se convierte en SIN UNION', () => caso(async tx => {
    await tx.insert(schema.estructuras).values({ codigo: 'GMU038', descripcion: 'Unión sin material sintética', esAccesorio: true })
    await tx.update(schema.estructuraPlantillaCatalogo).set({ estructuraCodigo: 'GMU038' })
      .where(eq(schema.estructuraPlantillaCatalogo.estructuraCodigo, 'U'))
    const r = await valorarCerramiento(tx, entrada('GMU038'))
    expect(esResultadoCerramiento(r)).toBe(true)
    expect(r.origenes[2].venta).toEqual({ completo: false, importe: null })
    expect(r.origenes[2].diagnosticos.some(d => d.detalle === 'Receta material vacía')).toBe(true)
  }))
})
