import { afterAll, describe, expect, it } from 'vitest'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { and, eq } from 'drizzle-orm'
import { resolverMaterialesEstructura } from './materiales-estructura.ts'
import { valorarEstructura, type EntradaValoracionEstructura } from './valorar-estructura.ts'

const db = crearDb(urlDePruebasValidada(process.env.TEST_DATABASE_URL))
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]
const rollback = new Error('rollback del ensayo de cortes')
afterAll(() => db.$client.end({ timeout: 5 }))

// Los códigos ejercitan el ámbito habilitado; medidas y descuentos son inventados.
async function caso(verificar: (tx: Tx) => Promise<void>) {
  try {
    await db.transaction(async tx => {
      if ((await tx.select().from(schema.estructuras).where(eq(schema.estructuras.codigo, 'C2'))).length)
        throw new Error('C2 existente protegido: usar base de pruebas vacía')
      await tx.insert(schema.estructuras).values({ codigo: 'C2', descripcion: 'Fixture sintética de referencias' })
      await tx.insert(schema.series).values({ codigo: 'GMC400' })
      await tx.insert(schema.articulos).values([
        { codigo: 'GM440', descripcion: 'Marco sintético', tipoMetraje: 'ML' },
        { codigo: 'GM451', descripcion: 'Hoja sintética', tipoMetraje: 'ML' },
      ])
      await tx.insert(schema.estructuraComponentes).values([
        { estructuraCodigo: 'C2', lineaOrigen: 901, articuloCodigo: 'GM440', cantidad: '2', formulaLargo: 'A', funcion: 'MH' },
        { estructuraCodigo: 'C2', lineaOrigen: 902, articuloCodigo: 'GM451', cantidad: '4', formulaLargo: 'A/2', funcion: 'HH' },
      ])
      await tx.insert(schema.estructuraReferenciasCorte).values([
        { estructuraCodigo: 'C2', lineaOrigen: 901, idPieza: 1, formula: 'A', grupo: 'M', grupoInicio: 'E', grupoFin: 'E', tipoHoja: -1, perfilAdicional: -1 },
        { estructuraCodigo: 'C2', lineaOrigen: 902, idPieza: 2, idReferencia: 1, formula: 'A/2', formulaReferencia: 'REF/2', grupo: 'H', grupoInicio: 'M', grupoFin: 'M', tipoHoja: 10, perfilAdicional: -1 },
      ])
      await tx.insert(schema.conjuntoDescuentosCorte).values([
        { conjuntoCodigo: 'GMC400', familia: '001', grupoPrincipal: 'E', grupo: 'M', tipoHoja: 'G', descuentoMm: '30' },
        { conjuntoCodigo: 'GMC400', familia: '001', grupoPrincipal: 'M', grupo: 'H', tipoHoja: '2HC', descuentoMm: '-2' },
      ])
      await verificar(tx)
      throw rollback
    })
  } catch (e) { if (e !== rollback) throw e }
}

const entrada: EntradaValoracionEstructura = {
  codigo: 'C2', serieCodigo: 'GMC400', anchoMm: 1000, altoMm: 900,
  vidrioCodigo: null, varianteAcristalamiento: '2', acabadoCodigo: 'UNI', tarifa: 1,
  opcionesHerraje: [],
}
const valorar = (tx: Tx) => resolverMaterialesEstructura(tx, entrada)
async function comprobarBloqueoPrecio(tx: Tx) {
  const resultado = await valorarEstructura(tx, entrada)
  expect(resultado).toMatchObject({ ok: true, precioUnitario: null })
}

describe('cortes de catálogo desde PostgreSQL hasta el despiece material', () => {
  it('resuelve sin tabla de rebajes y conserva cantidades y consumo', () => caso(async tx => {
    const r = await valorar(tx)
    expect(r.ok).toBe(true)
    if (!r.ok) throw new Error('Valoración rechazada')
    expect(r.despiece.piezas.map(p => [p.articuloCodigo, p.largoMm])).toEqual([
      ['GM440', 940], ['GM451', 474],
    ])
    expect(r.despiece.consumoPorArticulo.get('GM451')?.metrosLineales).toBeCloseTo(1.896)
    await comprobarBloqueoPrecio(tx)
  }))
  it('propaga a la hoja la falta del descuento del marco', () => caso(async tx => {
    await tx.delete(schema.conjuntoDescuentosCorte).where(and(
      eq(schema.conjuntoDescuentosCorte.conjuntoCodigo, 'GMC400'),
      eq(schema.conjuntoDescuentosCorte.grupo, 'M'),
    ))
    const r = await valorar(tx)
    if (!r.ok) throw new Error('Valoración rechazada')
    expect(r.despiece.piezas.every(p => p.largoMm === null)).toBe(true)
    expect(r.despiece.piezas[1]?.incidencia).toContain('antecedente')
    await comprobarBloqueoPrecio(tx)
  }))
  it('no usa fórmula plana si faltan metadatos importados', () => caso(async tx => {
    await tx.delete(schema.estructuraReferenciasCorte).where(eq(schema.estructuraReferenciasCorte.estructuraCodigo, 'C2'))
    const r = await valorar(tx)
    if (!r.ok) throw new Error('Valoración rechazada')
    expect(r.despiece.piezas.every(p => p.incidencia?.includes('faltan enlaces'))).toBe(true)
    await comprobarBloqueoPrecio(tx)
  }))
})
