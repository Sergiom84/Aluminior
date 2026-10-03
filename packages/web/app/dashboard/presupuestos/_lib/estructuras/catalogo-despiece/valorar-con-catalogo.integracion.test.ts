import { afterAll, describe, expect, it } from 'vitest'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { eq, sql } from 'drizzle-orm'
import { valorarEstructura, type EntradaValoracionEstructura } from '../valorar-estructura.ts'

const db = crearDb(urlDePruebasValidada(process.env.TEST_DATABASE_URL))
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]
const rollback = new Error('rollback del ensayo de catálogo de despiece')
afterAll(() => db.$client.end({ timeout: 5 }))

// Catálogo sintético con la forma de una corredera de dos hojas; códigos y valores inventados.
const fila = (lineaOrigen: number, f: Partial<typeof schema.estructuraPlantillaCatalogo.$inferInsert>) => ({
  estructuraCodigo: 'QA-CORR', lineaOrigen, idPieza: lineaOrigen, articulo: 'QA-G', cantidad: '1', tipoHoja: '-1', hoja: 0,
  formulaLargo: 'L', gruposAdicionales: ['', '', '', ''], ...f,
})
const hoja = (n: number, base: number) => [
  fila(base, { articulo: 'QA-G-HH', componente: '23', funcion: 'HH', tipoHoja: '10', hoja: n, referenciaLargo: 3,
    formulaLargo: '(A)/2', formulaReferenciaLargo: '(REF)/2', grupo: 'HH', grupoIzquierdo: 'MV', grupoDerecho: 'MV', posicionTrabajo: 'A' }),
  fila(base + 1, { articulo: 'QA-G-HV', componente: '21', funcion: 'HV', tipoHoja: '10', hoja: n, referenciaLargo: 1,
    formulaReferenciaLargo: 'REF', grupo: 'HVL', grupoIzquierdo: 'MH', grupoDerecho: 'MH', posicionTrabajo: 'L' }),
  fila(base + 2, { articulo: 'QA-G-INF', componente: 'EHC', funcion: 'infEHC', tipoHoja: '10', hoja: n, referenciaLargo: base + 1,
    formulaReferenciaLargo: 'REF' }),
  fila(base + 3, { articulo: 'QA-G-CRISTAL', componente: '1', tipoHoja: '10', referenciaLargo: base + 1, referenciaAncho: base,
    formulaAncho: '(A)/2', formulaReferenciaLargo: 'REF', formulaReferenciaAncho: 'REF', grupo: 'C',
    grupoIzquierdo: 'HVL', grupoDerecho: 'HVL', grupoSuperior: 'HH', grupoInferior: 'HH' }),
]

async function caso(verificar: (tx: Tx) => Promise<void>) {
  try {
    await db.transaction(async tx => {
      await tx.insert(schema.estructuras).values({ codigo: 'QA-CORR', descripcion: 'Corredera sintética' })
      const articulos = [['QA-MARCO', 'ML'], ['QA-HOJA', 'ML'], ['QA-ROD', 'ML'], ['QA-FELPUDO', 'ML'], ['QA-CIERRE', 'UD'],
        ['MO', 'UD'], ['QA-VIDRIO', 'M2'], ['QA-G', 'ML'], ['QA-G-HH', 'ML'], ['QA-G-HV', 'ML'], ['QA-G-INF', 'ML'],
        ['QA-G-MO', 'UD'], ['QA-G-CRISTAL', 'M2']]
      await tx.insert(schema.articulos).values(articulos.map(([codigo, tipoMetraje]) => ({ codigo: codigo!, descripcion: codigo!, tipoMetraje: tipoMetraje!,
        ...(codigo === 'QA-VIDRIO' ? { metrajeMultiploLargo: '6', metrajeMultiploAncho: '6', metrajeMinimo: '0.5' } : {}) })))
        // `MO` es el artículo real de mano de obra: otras suites lo dejan sembrado.
        .onConflictDoNothing()
      await tx.insert(schema.articulosDespiece).values(articulos.map(([codigo]) => ({ articuloCodigo: codigo!,
        componente: { 'QA-G-HH': '23', 'QA-G-HV': '21', 'QA-G-INF': 'EHC', 'QA-G-MO': '39', 'QA-G-CRISTAL': '1' }[codigo!] ?? null,
        generico: codigo!.startsWith('QA-G'),
        dobleAcristalamiento: codigo === 'QA-VIDRIO', grosorAcristalar: codigo === 'QA-VIDRIO' ? '16' : '0', incrementosPrecio: false })))
      await tx.insert(schema.articulosPvp).values([['QA-MARCO', 'L', '10'], ['QA-HOJA', 'L', '8'], ['QA-ROD', 'L', '6'],
        ['QA-FELPUDO', 'UNI', '1'], ['QA-CIERRE', 'UNI', '4'], ['MO', 'UNI', '0.5'], ['QA-VIDRIO', 'UNI', '50']]
        .map(([articuloCodigo, acabadoCodigo, precio]) => ({ articuloCodigo: articuloCodigo!, acabadoCodigo: acabadoCodigo!, tarifa: 1, precio: precio! })))
        .onConflictDoUpdate({ target: [schema.articulosPvp.articuloCodigo, schema.articulosPvp.acabadoCodigo, schema.articulosPvp.tarifa],
          set: { precio: sql`excluded.precio` } })
      await tx.insert(schema.estructuraPlantillaCatalogo).values([
        fila(1, { articulo: 'QA-G', componente: '12', funcion: 'MV', grupo: 'MV', grupoIzquierdo: 'E', grupoDerecho: 'E', posicionTrabajo: 'L' }),
        fila(3, { articulo: 'QA-G', componente: '10', funcion: 'MH', formulaLargo: 'A', grupo: 'MH', grupoIzquierdo: 'MV', grupoDerecho: 'MV', posicionTrabajo: 'A' }),
        fila(5, { articulo: 'QA-G-MO', componente: '39', funcion: 'infMOmof', tipoHoja: '0', disVidrio: '8' }),
        ...hoja(1, 10), ...hoja(2, 20),
      ])
      await tx.insert(schema.conjuntos).values({ codigo: 'QA-SERIE', tablaHojas: 'QA-T', tablaFijos: 'QA-T' })
      await tx.insert(schema.conjuntoParametrosDespiece).values({ conjuntoCodigo: 'QA-SERIE', herrajes: { '2HC': 'QA-HERR' },
        manoObra: {}, grosorMaximoSimple: '10', grosorMaximoDoble: '18' })
      await tx.insert(schema.tacrisFilas).values({ tabla: 'QA-T', posicion: '*', grosor: '99', junquillo: null })
      await tx.insert(schema.conjuntoResoluciones).values([['12', 'QA-MARCO'], ['10', 'QA-MARCO'], ['21', 'QA-HOJA'], ['23.2', 'QA-ROD']]
        .map(([componente, articuloCodigo]) => ({ conjuntoCodigo: 'QA-SERIE', componente: componente!, familia: '001', articuloCodigo: articuloCodigo! })))
      await tx.insert(schema.conjuntoRanurasVacias).values({ conjuntoCodigo: 'QA-SERIE', componente: '39' })
      await tx.insert(schema.conjuntoDescuentosCorte).values([['E', 'MV', 'G', '0'], ['MV', 'MH', 'G', '20'], ['MV', 'HH', '2HC', '0'],
        ['MH', 'HVL', 'G', '25'], ['HH', 'C', 'G', '40'], ['HVL', 'C', '2HC', '30']]
        .map(([grupoPrincipal, grupo, tipoHoja, descuentoMm]) => ({ conjuntoCodigo: 'QA-SERIE', familia: '001',
          grupoPrincipal: grupoPrincipal!, grupo: grupo!, tipoHoja: tipoHoja!, descuentoMm: descuentoMm! })))
      await tx.insert(schema.tiposHojaCatalogo).values({ id: '10', tipo: 't2HC' })
      const asociacion = { cantidad: '1', acabado: '---A', intervalo: '0', medidaMin: '0', medidaMax: '0', unidadesMin: '0',
        unidadesMax: '0', tipoMedida: 'C', descuento: '0', soloUna: false, grupo: '!', apertura: 0, asociadoA: 'X', noContrastado: [] }
      await tx.insert(schema.conjuntoAsociaciones).values([
        { ...asociacion, id: 'QA-1', conjuntoCodigo: 'QA-HERR', articulo: 'QA-FELPUDO', cantidad: '2', componente: '21' },
        { ...asociacion, id: 'QA-2', conjuntoCodigo: 'QA-HERR', articulo: 'QA-CIERRE', componente: 'EHC', opcion: '1' },
      ])
      await tx.insert(schema.opcionesHerraje).values({ conjuntoCodigo: 'QA-HERR', opcionCodigo: '1', descripcion: 'Cierre', porDefecto: true })
      await tx.insert(schema.manoObraConceptos).values({ codigo: 'QA-M8', minutos: '20', articulo: 'MO', modulo: '8', conIncrementos: false })
      await verificar(tx)
      throw rollback
    })
  } catch (e) { if (e !== rollback) throw e }
}

const entrada: EntradaValoracionEstructura = {
  codigo: 'QA-CORR', serieCodigo: 'QA-SERIE', anchoMm: 1200, altoMm: 1300, vidrioCodigo: 'QA-VIDRIO',
  varianteAcristalamiento: '2', acabadoCodigo: 'L', tarifa: 1, opcionesHerraje: ['QA-HERR|1'],
}

describe('valoración con el catálogo de despiece completo', () => {
  it('valora perfiles, asociados, vidrio y mano de obra desde PostgreSQL', () => caso(async tx => {
    const r = await valorarEstructura(tx, entrada)
    expect(r).toMatchObject({ ok: true, motor: 'catalogo', precioUnitario: 139.56, aviso: null, materialCompleto: true })
    if (!r.ok) throw new Error('rechazada')
    expect(r.piezas.map(p => p.articuloCodigo)).toEqual(['QA-MARCO', 'QA-MARCO', 'QA-ROD', 'QA-HOJA', 'QA-ROD', 'QA-HOJA',
      'QA-FELPUDO', 'QA-FELPUDO', 'QA-CIERRE', 'QA-CIERRE', 'QA-VIDRIO', 'QA-VIDRIO', 'MO'])
    expect(r.opcionesHerraje).toEqual([{ categoria: 'QA-HERR', opcionCodigo: '1', descripcion: 'Cierre' }])
    expect(r.acristalamiento).toHaveLength(2)
  }))
  it('la comisión sumada cambia solo el precio de la línea, no el despiece', () => caso(async tx => {
    const r = await valorarEstructura(tx, { ...entrada, comisionPorc: '10', trazabilidad: true })
    if (!r.ok) throw new Error('rechazada')
    expect(r.precioUnitario).toBe(153.52)
    expect(r.partidas!.reduce((s, p) => s + Number(p.importeExacto), 0)).toBeCloseTo(139.56, 2)
  }))
  it('cobra las horas manuales por unidad como filas MO y MOCOL del despiece', () => caso(async tx => {
    await tx.insert(schema.articulos).values({ codigo: 'MOCOL', descripcion: 'MOCOL', tipoMetraje: 'UD' }).onConflictDoNothing()
    await tx.insert(schema.articulosPvp).values({ articuloCodigo: 'MOCOL', acabadoCodigo: 'UNI', tarifa: 1, precio: '0.5' })
      .onConflictDoUpdate({ target: [schema.articulosPvp.articuloCodigo, schema.articulosPvp.acabadoCodigo, schema.articulosPvp.tarifa],
        set: { precio: sql`excluded.precio` } })
    const r = await valorarEstructura(tx, { ...entrada, horasFabricacion: '1', horasColocacion: '6.07', trazabilidad: true })
    if (!r.ok) throw new Error('rechazada')
    // 139,56 de material + 60 min y 364,2 min a 0,5 por minuto, dentro del precio unitario.
    expect(r.precioUnitario).toBe(351.66)
    expect(r.partidas!.slice(-2).map(p => [p.articuloCodigo, p.cantidadFacturable])).toEqual([['MO', '60.000000'], ['MOCOL', '364.200000']])
    const sinCatalogo = await valorarEstructura(tx, { ...entrada, serieCodigo: 'QA-SIN-SERIE', horasColocacion: '2' })
    expect(sinCatalogo.ok).toBe(false)
  }))
  it('añade el compacto con sus filas seleccionadas a ventana + cajón y bloquea sin catálogo', () => caso(async tx => {
    await tx.insert(schema.estructuras).values({ codigo: 'QA-COMP', descripcion: 'Compacto sintético', esAccesorio: true })
    await tx.insert(schema.articulos).values([
      { codigo: 'QA-LAMA', descripcion: 'QA-LAMA', tipoMetraje: 'M2', metrajeMultiploLargo: '5', metrajeMultiploAncho: '5', metrajeMinimo: '1.5' },
      { codigo: 'QA-MOCOMP', descripcion: 'QA-MOCOMP', tipoMetraje: 'UD' }])
    await tx.insert(schema.articulosPvp).values([{ articuloCodigo: 'QA-LAMA', acabadoCodigo: 'L', tarifa: 1, precio: '80' },
      { articuloCodigo: 'QA-MOCOMP', acabadoCodigo: 'UNI', tarifa: 1, precio: '0.5' }])
    const compactoFila = (lineaOrigen: number, f: Partial<typeof schema.estructuraPlantillaCatalogo.$inferInsert>) =>
      fila(lineaOrigen, { estructuraCodigo: 'QA-COMP', idPieza: 0, ...f })
    await tx.insert(schema.estructuraPlantillaCatalogo).values([
      compactoFila(1, { articulo: 'QA-LAMA', funcion: 'COMPVAL', formulaAncho: 'A+CVI+CVD', formulaSeleccion: 'G1O0' }),
      compactoFila(2, { articulo: 'QA-LAMA', funcion: 'COMPVAL', formulaAncho: 'CGC+CVD', formulaSeleccion: 'G1O1' }),
      compactoFila(3, { articulo: 'QA-MOCOMP', funcion: 'MO', cantidad: '15', formulaLargo: null }),
    ])
    const compacto = { estructura: 'QA-COMP', acabado: 'L', altoCajonMm: 155, vueloIzquierdoMm: 0, vueloDerechoMm: 0,
      posicionGuiaCentralMm: 0, descuentoVerticalMm: 0, opciones: ['G1O0', 'G10O0'] }
    const r = await valorarEstructura(tx, { ...entrada, compacto, trazabilidad: true })
    if (!r.ok) throw new Error('rechazada')
    // 1200 × 1455 -> 1,20 × 1,50 m2 a 80 + 15 min a 0,5, sobre los 139,56 de la ventana.
    expect(r.precioUnitario).toBe(291.06)
    expect(r.partidas!.slice(-2).map(p => [p.articuloCodigo, p.cantidadFacturable, p.acabadoCodigo]))
      .toEqual([['QA-LAMA', '1.800000', 'L'], ['QA-MOCOMP', '15.000000', 'L']])
    const sinCatalogo = await valorarEstructura(tx, { ...entrada, serieCodigo: 'QA-SIN-SERIE', compacto })
    expect(sinCatalogo.ok).toBe(false)
  }))
  it('usa Acabado2 para accesorios, vidrio y MO, manteniendo el acabado de perfiles', () => caso(async tx => {
    await tx.insert(schema.articulosPvp).values(['QA-FELPUDO', 'QA-CIERRE', 'QA-VIDRIO', 'MO'].map(articuloCodigo => ({
      articuloCodigo, acabadoCodigo: 'ACC', tarifa: 1, precio: '2',
    })))
    const r = await valorarEstructura(tx, { ...entrada, acabadoAccesoriosCodigo: 'ACC', trazabilidad: true })
    if (!r.ok) throw new Error('rechazada')
    expect(r.precioUnitario).toBe(108.16)
    expect(r.piezas.slice(0, 6).every(p => p.acabadoCodigo === 'L')).toBe(true)
    expect(r.piezas.slice(6).every(p => p.acabadoCodigo === 'ACC')).toBe(true)
    expect(r.partidas!.slice(6).every(p => p.precioUnitario === '2.0000')).toBe(true)
  }))
  it('una opción visible desmarcada en el formulario no vuelve por defecto', () => caso(async tx => {
    const r = await valorarEstructura(tx, { ...entrada, opcionesHerraje: [] })
    expect(r).toMatchObject({ ok: true, motor: 'catalogo', precioUnitario: 131.56, opcionesHerraje: [] })
  }))
  it('sin precio de un asociado no da total y lo explica', () => caso(async tx => {
    await tx.delete(schema.articulosPvp).where(eq(schema.articulosPvp.articuloCodigo, 'QA-FELPUDO'))
    const r = await valorarEstructura(tx, entrada)
    expect(r).toMatchObject({ ok: true, motor: 'catalogo', precioUnitario: null, materialCompleto: false })
    if (!r.ok) throw new Error('rechazada')
    expect(r.aviso).toContain('QA-FELPUDO: sin PVP en la tarifa')
  }))
  it('las partidas de trazabilidad son filas valoradas', () => caso(async tx => {
    const r = await valorarEstructura(tx, { ...entrada, trazabilidad: true })
    if (!r.ok) throw new Error('rechazada')
    expect(r.partidas).toHaveLength(13)
    expect(r.partidas![0]).toMatchObject({ grupoValoracion: 'MATERIALES', articuloCodigo: 'QA-MARCO', cantidadFacturable: '1.300000', precioUnitario: '10.0000' })
  }))
})
