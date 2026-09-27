import { afterAll, describe, expect, it } from 'vitest'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { and, eq } from 'drizzle-orm'
import { valorarEstructura, type EntradaValoracionEstructura } from '../valorar-estructura.ts'
import { valorarCerramiento } from '../../cerramientos/valorar-cerramiento.ts'

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
        ['QA-MO', 'UD'], ['QA-VIDRIO', 'M2'], ['QA-G', 'ML'], ['QA-G-HH', 'ML'], ['QA-G-HV', 'ML'], ['QA-G-INF', 'ML'],
        ['QA-G-MO', 'UD'], ['QA-G-CRISTAL', 'M2']]
      await tx.insert(schema.articulos).values(articulos.map(([codigo, tipoMetraje]) => ({ codigo: codigo!, descripcion: codigo!, tipoMetraje: tipoMetraje!,
        ...(codigo === 'QA-VIDRIO' ? { metrajeMultiploLargo: '6', metrajeMultiploAncho: '6', metrajeMinimo: '0.5' } : {}) })))
      await tx.insert(schema.articulosDespiece).values(articulos.map(([codigo]) => ({ articuloCodigo: codigo!,
        componente: { 'QA-G-HH': '23', 'QA-G-HV': '21', 'QA-G-INF': 'EHC', 'QA-G-MO': '39', 'QA-G-CRISTAL': '1' }[codigo!] ?? null,
        generico: codigo!.startsWith('QA-G'),
        dobleAcristalamiento: codigo === 'QA-VIDRIO', grosorAcristalar: codigo === 'QA-VIDRIO' ? '16' : '0', incrementosPrecio: false })))
      await tx.insert(schema.articulosPvp).values([['QA-MARCO', 'L', '10'], ['QA-HOJA', 'L', '8'], ['QA-ROD', 'L', '6'],
        ['QA-FELPUDO', 'UNI', '1'], ['QA-CIERRE', 'UNI', '4'], ['QA-MO', 'UNI', '0.5'], ['QA-VIDRIO', 'UNI', '50']]
        .map(([articuloCodigo, acabadoCodigo, precio]) => ({ articuloCodigo: articuloCodigo!, acabadoCodigo: acabadoCodigo!, tarifa: 1, precio: precio! })))
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
      await tx.insert(schema.manoObraConceptos).values({ codigo: 'QA-M8', minutos: '20', articulo: 'QA-MO', modulo: '8', conIncrementos: false })
      await verificar(tx)
      throw rollback
    })
  } catch (e) { if (e !== rollback) throw e }
}

const entrada: EntradaValoracionEstructura = {
  codigo: 'QA-CORR', serieCodigo: 'QA-SERIE', anchoMm: 1200, altoMm: 1300, vidrioCodigo: 'QA-VIDRIO',
  varianteAcristalamiento: '2', acabadoCodigo: 'L', tarifa: 1, opcionesHerraje: ['QA-HERR|1'],
}

async function alternativaAcristalamiento(tx: Tx) {
  await tx.insert(schema.articulos).values({ codigo: 'QA-J2', descripcion: 'Junquillo alternativo', tipoMetraje: 'ML' })
  await tx.insert(schema.articulosPvp).values({ articuloCodigo: 'QA-J2', acabadoCodigo: 'L', tarifa: 1, precio: '2' })
  await tx.insert(schema.tacrisFilas).values({ tabla: 'QA-T2', posicion: '*', grosor: '99', junquillo: 'QA-J2' })
  await tx.insert(schema.conjuntoAcristalamientos).values([
    { conjuntoCodigo: 'QA-SERIE', opcion: 1, tablaHojas: 'QA-T', tablaFijos: 'QA-T' },
    { conjuntoCodigo: 'QA-SERIE', opcion: 2, tablaHojas: 'QA-T2', tablaFijos: 'QA-T2' },
  ])
  await tx.insert(schema.conjuntoDescuentosCorte).values([['HVL', 'JH'], ['HH', 'JV']].map(([grupoPrincipal, grupo]) => ({
    conjuntoCodigo: 'QA-SERIE', familia: '001', grupoPrincipal: grupoPrincipal!, grupo: grupo!, tipoHoja: 'G', descuentoMm: '0',
  })))
}

describe('valoración con el catálogo de despiece completo', () => {
  it('sin selección guardada usa las opciones del catálogo en la estructura directa', () => caso(async tx => {
    const r = await valorarEstructura(tx, { ...entrada, opcionesHerraje: undefined })
    expect(r).toMatchObject({ ok: true, motor: 'catalogo', precioUnitario: 139.56,
      opcionesHerraje: [{ categoria: 'QA-HERR', opcionCodigo: '1', descripcion: 'Cierre' }] })
    if (!r.ok) throw new Error('rechazada')
    expect(r.piezas.filter(p => p.articuloCodigo === 'QA-CIERRE')).toHaveLength(2)
  }))
  it('el GRUPO conserva ausencia y selección vacía con el mismo catálogo y precio que la estructura', () => caso(async tx => {
    await tx.insert(schema.estructuras).values({ codigo: 'C2', descripcion: 'Corredera de prueba' })
    await tx.update(schema.estructuraPlantillaCatalogo).set({ estructuraCodigo: 'C2' })
      .where(eq(schema.estructuraPlantillaCatalogo.estructuraCodigo, 'QA-CORR'))
    const configuracion = { version: 1 as const, modulos: [{ id: 'sintetico', estructuraCodigo: 'C2', anchoMm: 1200, altoMm: 1300 }], uniones: [] }
    for (const opcionesHerraje of [undefined, [], ['QA-HERR|1']]) {
      const directo = await valorarEstructura(tx, { ...entrada, codigo: 'C2', opcionesHerraje })
      const grupo = await valorarCerramiento(tx, { ...entrada, configuracion, opcionesHerraje })
      if (!directo.ok) throw new Error('rechazada')
      expect(grupo.ventaMateriales).toEqual({ completo: true, importe: opcionesHerraje?.length === 0 ? '131.56' : '139.56' })
      expect(Number(grupo.ventaMateriales.importe)).toBe(directo.precioUnitario)
      expect(grupo.origenes[0]!.piezas.map(p => p.articuloCodigo)).toEqual(directo.piezas.map(p => p.articuloCodigo))
      expect(grupo.origenes[0]!.opcionesHerraje).toEqual(directo.opcionesHerraje)
    }
  }))
  it('el GRUPO conserva los avisos de grosor y junta sin bloquear la venta calculable', () => caso(async tx => {
    await tx.insert(schema.estructuras).values({ codigo: 'C2', descripcion: 'Corredera de prueba' })
    await tx.update(schema.estructuraPlantillaCatalogo).set({ estructuraCodigo: 'C2' })
      .where(eq(schema.estructuraPlantillaCatalogo.estructuraCodigo, 'QA-CORR'))
    await tx.update(schema.articulosDespiece).set({ grosorAcristalar: '20' })
      .where(eq(schema.articulosDespiece.articuloCodigo, 'QA-VIDRIO'))
    await tx.update(schema.tacrisFilas).set({ juntaExterior: 'QA-JUNTA-AUSENTE' })
      .where(eq(schema.tacrisFilas.tabla, 'QA-T'))
    const directo = await valorarEstructura(tx, { ...entrada, codigo: 'C2' })
    if (!directo.ok) throw new Error('rechazada')
    expect(directo.aviso).toContain('vidrio de 20 mm por encima del rango')
    expect(directo.aviso).toContain('junta QA-JUNTA-AUSENTE')
    const grupo = await valorarCerramiento(tx, { ...entrada, configuracion: { version: 1,
      modulos: [{ id: 'sintetico', estructuraCodigo: 'C2', anchoMm: 1200, altoMm: 1300 }], uniones: [] } })
    expect(grupo.ventaMateriales).toEqual({ completo: true, importe: '139.56' })
    expect(grupo.origenes[0]!.diagnosticos.filter(d => d.ambito === 'VENTA')).toEqual([
      { codigo: 'AVISO_VALORACION', ambito: 'VENTA', bloqueante: false, detalle: directo.aviso },
    ])
  }))
  it('aplica FI explícito a perfiles y vidrio; la ausencia no toma un valor estándar', () => caso(async tx => {
    await tx.update(schema.estructuraPlantillaCatalogo).set({ formulaReferenciaLargo: 'REF-FI' }).where(and(
      eq(schema.estructuraPlantillaCatalogo.estructuraCodigo, 'QA-CORR'),
      eq(schema.estructuraPlantillaCatalogo.componente, '21'),
    ))
    const sinCota = await valorarEstructura(tx, entrada)
    expect(sinCota).toMatchObject({ ok: true, motor: 'catalogo', precioUnitario: null, materialCompleto: false })
    for (const [FI, largoHoja, largoVidrio] of [[100, 1150, 1070], [200, 1050, 970]]) {
      const r = await valorarEstructura(tx, { ...entrada, cotas: { FI: FI! } })
      expect(r).toMatchObject({ ok: true, motor: 'catalogo', materialCompleto: true, aviso: null })
      if (!r.ok) throw new Error('rechazada')
      expect(r.precioUnitario).not.toBeNull()
      expect(r.piezas.filter(p => p.articuloCodigo === 'QA-HOJA').map(p => Number(p.largoCorteMm))).toEqual([largoHoja, largoHoja])
      expect(r.piezas.filter(p => p.articuloCodigo === 'QA-VIDRIO').map(p => Number(p.largoCorteMm))).toEqual([largoVidrio, largoVidrio])
    }
  }))
  it('si falta catálogo completo no descarta las cotas para usar la vía anterior', () => caso(async tx => {
    await tx.delete(schema.estructuraPlantillaCatalogo).where(eq(schema.estructuraPlantillaCatalogo.estructuraCodigo, 'QA-CORR'))
    expect(await valorarEstructura(tx, { ...entrada, cotas: { FI: 100 } }))
      .toMatchObject({ ok: false, errores: { cotas: ['Las cotas de instancia requieren el catálogo completo'] } })
  }))
  it('usa el junquillo y precio de la opción de acristalamiento elegida', () => caso(async tx => {
    await alternativaAcristalamiento(tx)
    const base = await valorarEstructura(tx, entrada)
    const alternativa = await valorarEstructura(tx, { ...entrada, opcionAcristalamiento: 2 })
    expect(base).toMatchObject({ ok: true, motor: 'catalogo', precioUnitario: 139.56 })
    expect(alternativa).toMatchObject({ ok: true, motor: 'catalogo', precioUnitario: 154.2, materialCompleto: true })
    if (!alternativa.ok) throw new Error('rechazada')
    expect(alternativa.piezas.filter(p => p.articuloCodigo === 'QA-J2')).toHaveLength(4)
  }))
  it('una tabla alternativa sin filas bloquea el precio y no usa la opción principal', () => caso(async tx => {
    await alternativaAcristalamiento(tx)
    await tx.delete(schema.tacrisFilas).where(eq(schema.tacrisFilas.tabla, 'QA-T2'))
    const r = await valorarEstructura(tx, { ...entrada, opcionAcristalamiento: 2 })
    expect(r).toMatchObject({ ok: true, motor: 'catalogo', precioUnitario: null, materialCompleto: false })
    if (!r.ok) throw new Error('rechazada')
    expect(r.aviso).toContain('sin filas persistidas')
  }))
  it('valora perfiles, asociados, vidrio y mano de obra desde PostgreSQL', () => caso(async tx => {
    const r = await valorarEstructura(tx, entrada)
    expect(r).toMatchObject({ ok: true, motor: 'catalogo', precioUnitario: 139.56, aviso: null, materialCompleto: true })
    if (!r.ok) throw new Error('rechazada')
    expect(r.piezas.map(p => p.articuloCodigo)).toEqual(['QA-MARCO', 'QA-MARCO', 'QA-ROD', 'QA-HOJA', 'QA-ROD', 'QA-HOJA',
      'QA-FELPUDO', 'QA-FELPUDO', 'QA-CIERRE', 'QA-CIERRE', 'QA-VIDRIO', 'QA-VIDRIO', 'QA-MO'])
    expect(r.opcionesHerraje).toEqual([{ categoria: 'QA-HERR', opcionCodigo: '1', descripcion: 'Cierre' }])
    expect(r.acristalamiento).toHaveLength(2)
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
