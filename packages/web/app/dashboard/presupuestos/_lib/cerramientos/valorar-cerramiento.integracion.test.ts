import { afterAll, describe, expect, it } from 'vitest'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { eq } from 'drizzle-orm'
import { esResultadoCerramiento } from '@aluminior/core/estructuras'
import { totalLineaCerramiento } from '@aluminior/core/precios'
import { valorarCerramiento } from './valorar-cerramiento.ts'
import { J04, configuracionJ04, sembrarCatalogoJ04 } from './catalogo-j04.fixture.ts'
import { resolverMaterialesEstructura } from '../estructuras/materiales-estructura.ts'
import { partidasValoracion } from '../estructuras/partidas-valoracion.ts'
import { completarCostesOrigen } from './origen-valorado.ts'

const db = crearDb(urlDePruebasValidada(process.env.TEST_DATABASE_URL))
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]
const entrada = () => ({ configuracion: configuracionJ04(), serieCodigo: J04.serie,
  acabadoCodigo: J04.acabado, vidrioCodigo: J04.vidrio, tarifa: J04.tarifa,
  varianteAcristalamiento: '1' as const })
const rollback = new Error('J04 rollback deliberado')
async function caso(fn: (tx: Tx) => Promise<void>) {
  try {
    await db.transaction(async tx => { await sembrarCatalogoJ04(tx); await fn(tx); throw rollback })
  } catch (error) { if (error !== rollback) throw error }
}
afterAll(() => db.$client.end())

describe('J04 agregado auténtico, catálogo sintético y PostgreSQL', () => {
  it('fijo no cuadrado integra vidrio sin comprar la ranura geométrica', () => caso(async tx => {
    const e = entrada(); e.configuracion.modulos = e.configuracion.modulos.slice(0, 1); e.configuracion.uniones = []
    const r = await valorarCerramiento(tx, e)
    expect(esResultadoCerramiento(r)).toBe(true)
    expect(r.ventaMateriales).toEqual({ completo: true, importe: '76.84' })
    expect(r.costeMateriales).toEqual({ completo: true, importe: '28.8960' })
    expect(r.origenes[0].piezas).toHaveLength(9)
    expect(r.origenes[0].piezas.find(p => p.funcion === 'VIDRIO')).toMatchObject({ largoCorteMm: '780', anchoCorteMm: '1180' })
    expect(r.origenes[0].piezas.some(p => p.articuloCodigo === 'QA-J04-SLOT')).toBe(false)
  }))
  it('dos módulos y receta explícita de unión: oráculo y mano de obra total', () => caso(async tx => {
    const r = await valorarCerramiento(tx, entrada())
    expect(r.ventaMateriales).toEqual({ completo: true, importe: '140.83' })
    expect(r.costeMateriales).toEqual({ completo: true, importe: '53.6720' })
    expect(r.origenes.map(o => o.piezas.length)).toEqual([9, 9, 2])
    expect(r.origenes.map(o => o.origen.id)).toEqual(['m1', 'm2', 'u1'])
    expect(r.origenes.slice(0, 2).map(o => o.acristalamiento[0].slot)).toEqual([1, 1])
    expect(totalLineaCerramiento(r.ventaMateriales, '2', [{ completo: true, importe: '30' }]).importe).toBe('311.66')
    expect(totalLineaCerramiento(r.ventaMateriales, '3', [{ completo: true, importe: '30' }]).importe).toBe('452.49')
  }))
  it('módulos idénticos preservan procedencias y cantidad de cada receta', () => caso(async tx => {
    const e = entrada(); e.configuracion.modulos = [e.configuracion.modulos[0], { ...e.configuracion.modulos[0], id: 'm2' }]
    const r = await valorarCerramiento(tx, e)
    expect(r.ventaMateriales.importe).toBe('164.08')
    expect(r.origenes.slice(0, 2).map(o => o.piezas.length)).toEqual([9, 9])
  }))
  it.each(['QA-J04-P', 'QA-J04-V', 'QA-J04-T'])('PVP ausente %s no deja precio global parcial', codigo => caso(async tx => {
    await tx.delete(schema.articulosPvp).where(eq(schema.articulosPvp.articuloCodigo, codigo))
    const r = await valorarCerramiento(tx, entrada())
    expect(r.ventaMateriales).toEqual({ completo: false, importe: null })
    expect(r.origenes.some(o => o.diagnosticos.some(d => d.bloqueante))).toBe(true)
    expect(r.costeMateriales).toEqual({ completo: true, importe: '53.6720' })
    expect(r.origenes.map(o => o.piezas.length)).toEqual([9, 9, 2])
  }))
  it('junquillo configurado inexistente no se omite silenciosamente', () => caso(async tx => {
    await tx.delete(schema.articulosPvp).where(eq(schema.articulosPvp.articuloCodigo, 'QA-J04-J'))
    await tx.delete(schema.articulosCoste).where(eq(schema.articulosCoste.articuloCodigo, 'QA-J04-J'))
    await tx.delete(schema.articulos).where(eq(schema.articulos.codigo, 'QA-J04-J'))
    expect((await valorarCerramiento(tx, entrada())).ventaMateriales.completo).toBe(false)
  }))
  it.each(['acabado', 'tarifa', 'vidrio', 'galce', 'union', 'herraje', 'm2'])('ausencia %s permanece explícita', falta => caso(async tx => {
    const e = entrada()
    if (falta === 'acabado') e.acabadoCodigo = 'AJENO'
    if (falta === 'tarifa') e.tarifa = 8
    if (falta === 'vidrio') e.vidrioCodigo = ''
    if (falta === 'galce') await tx.delete(schema.vidrioGalceFijo).where(eq(schema.vidrioGalceFijo.serieCodigo, J04.serie))
    if (falta === 'union') await tx.delete(schema.estructuras).where(eq(schema.estructuras.codigo, 'GMU038'))
    if (falta === 'herraje') await tx.insert(schema.estructuraComponentes).values({ estructuraCodigo: '0', articuloCodigo: 'QA-J04-HERRAJE', cantidad: '1', componenteDisenyo: 'OBC', funcion: 'HV' })
    if (falta === 'm2') await tx.update(schema.articulos).set({ tipoMetraje: 'M2' }).where(eq(schema.articulos.codigo, 'QA-J04-U'))
    const r = await valorarCerramiento(tx, e)
    expect(r.ventaMateriales).toEqual({ completo: false, importe: null })
    if (falta === 'm2') expect(r.origenes[2].piezas.find(p => p.articuloCodigo === 'QA-J04-U')?.costeTotal).toBeNull()
  }))
  it('precio genérico guarda UNI y conserva acabado solicitado', () => caso(async tx => {
    await tx.update(schema.articulosPvp).set({ acabadoCodigo: '*' })
      .where(eq(schema.articulosPvp.articuloCodigo, 'QA-J04-P'))
    const r = await valorarCerramiento(tx, entrada())
    expect(r.ventaMateriales.importe).toBe('140.83')
    expect(r.origenes[0].acabadoCodigo).toBe(J04.acabado)
    expect(r.origenes[0].partidasValoracion.find(p => p.articuloCodigo === 'QA-J04-P'))
      .toMatchObject({ criterioPrecio: 'GENERICO', acabadoCodigo: 'UNI' })
  }))
  it('ausencia de coste no elimina PVP ni inventa coste cero', () => caso(async tx => {
    await tx.delete(schema.articulosCoste).where(eq(schema.articulosCoste.articuloCodigo, 'QA-J04-P'))
    const r = await valorarCerramiento(tx, entrada())
    expect(r.ventaMateriales).toEqual({ completo: true, importe: '140.83' })
    expect(r.costeMateriales).toEqual({ completo: false, importe: null })
    expect(r.origenes[0].piezas.filter(p => p.articuloCodigo === 'QA-J04-P').map(p => p.costeTotal)).toEqual([null, null])
  }))
  it('opción de herraje persistible no equivale a asociado valorado', () => caso(async tx => {
    await tx.insert(schema.herrajeConjuntos).values({ serieCodigo: J04.serie, estructuraCodigo: '0', conjuntos: J04.serie, muestras: 3, totalMuestras: 3 })
    await tx.insert(schema.opcionesHerraje).values({ conjuntoCodigo: J04.serie, opcionCodigo: '1', descripcion: 'Opción sintética no resuelta', oculta: true, porDefecto: true })
    const r = await valorarCerramiento(tx, entrada())
    expect(r.origenes[0].opcionesHerraje).toHaveLength(1)
    expect(r.ventaMateriales.completo).toBe(false)
    expect(r.origenes[0].diagnosticos.some(d => d.detalle.includes('Herrajes'))).toBe(true)
  }))
  it('una tarifa cambiada entre cálculo y traza no mezcla precios de dos lecturas', () => caso(async tx => {
    const e = { ...entrada(), codigo: '0', anchoMm: 1200, altoMm: 800, opcionesHerraje: [] }
    const material = await resolverMaterialesEstructura(tx, e)
    expect(material.ok).toBe(true)
    if (!material.ok) throw new Error('Fixture sin material')
    await tx.update(schema.articulosPvp).set({ precio: '99' }).where(eq(schema.articulosPvp.articuloCodigo, 'QA-J04-P'))
    const [actual] = await tx.select().from(schema.articulosPvp).where(eq(schema.articulosPvp.articuloCodigo, 'QA-J04-P'))
    expect(actual.precio).toBe('99.0000')
    const [partida] = partidasValoracion(material.valoracion.lineas, e, 'MATERIALES', material.filasPvp)
    expect(material.valoracion.importe).toBe(40)
    expect(partida).toMatchObject({ precioUnitario: '10.0000', importeExacto: '40.0000000000' })
  }))
  it('unidad capturada no se sustituye por la unidad posterior del catálogo', () => caso(async tx => {
    const r = await valorarCerramiento(tx, entrada())
    await tx.update(schema.articulos).set({ tipoMetraje: 'UD' }).where(eq(schema.articulos.codigo, 'QA-J04-P'))
    const [actual] = await tx.select().from(schema.articulos).where(eq(schema.articulos.codigo, 'QA-J04-P'))
    expect(actual.tipoMetraje).toBe('UD')
    const origen = completarCostesOrigen(r.origenes[0], r.origenes[0].piezas)
    expect(origen.piezas.filter(p => p.articuloCodigo === 'QA-J04-P').map(p => p.unidad)).toEqual(['ML', 'ML'])
    expect(origen.coste.importe).toBe('28.8960')
  }))
})
