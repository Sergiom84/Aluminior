/**
 * Mano de obra de punta a punta contra el Postgres EFÍMERO en Docker.
 *
 *   docker compose -f packages/db/docker-compose.yml up -d
 *   npm run -w @aluminior/web test
 *
 * Lee el catálogo de verdad, resuelve, y escribe por `guardarLinea`, el MISMO
 * servicio que usa `anyadirLinea`. Lo que aquí se prueba y no puede probarse sin
 * base de datos: que el snapshot que produce el resolutor CABE en el esquema con
 * sus restricciones, que las filas viajan en la transacción de la línea, y que
 * el texto decimal vuelve idéntico de `numeric`.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { eq, sql } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import {
  anadirModuloCerramiento, crearConfiguracionCerramiento, plantillaDiseno, UNIONES_VISUALES,
} from '@aluminior/core/estructuras'
import { lineaValorable } from '@aluminior/core/precios'
import { guardarLinea } from '../lineas/guardar-linea.ts'
import { prepararAltaCerramiento } from '../cerramientos/index.ts'
import { conceptosConHoras, leerCatalogoManoObra, resolverManoObra } from './index.ts'

const urlPruebas = urlDePruebasValidada(process.env.TEST_DATABASE_URL)
const NOMBRE_PRUEBA = 'PRUEBA AUTOMÁTICA MANO DE OBRA LÍNEA'

/** Tarifa del documento en las pruebas. Distinta de la que se deja sin precio. */
const TARIFA = 1
/** Tarifa sin fila de PVP, como las 2 y 3 reales de la mano de obra. */
const TARIFA_SIN_PRECIO = 7

const configuracion = anadirModuloCerramiento(
  crearConfiguracionCerramiento(plantillaDiseno('2O')!),
  plantillaDiseno('2O')!,
  UNIONES_VISUALES.find((union) => union.codigo === 'PSU001')!,
)

const preparado = prepararAltaCerramiento({
  configuracionSerializada: JSON.stringify(configuracion),
  serieCodigo: 'ELEGANTPVC',
  vidrioCodigo: 'V420AGS4',
  acabadoCodigo: 'L',
  varianteAcristalamiento: '2',
})
if (!preparado.ok) throw new Error('la composición de prueba debería ser válida')
const alta = preparado.alta

describe('mano de obra de una línea, contra PostgreSQL', () => {
  let db: ReturnType<typeof crearDb>
  let presupuestoId = ''
  let orden = 0

  const limpiar = () => db.delete(schema.presupuestos)
    .where(eq(schema.presupuestos.nombreLibre, NOMBRE_PRUEBA))

  /**
   * El camino productivo entero: horas tecleadas -> conceptos -> catálogo real
   * -> resolución -> guarda -> escritura transaccional.
   */
  const altaConHoras = async (
    horas: { fabricacion: string; colocacion: string },
    tarifa = TARIFA,
  ) => {
    const conceptos = conceptosConHoras(horas)
    const catalogo = await leerCatalogoManoObra(
      db, ['MO', 'MOCOL'].slice(0, conceptos.length ? 2 : 0), tarifa,
    )
    const { filas, guarda } = resolverManoObra({ conceptos, catalogo, tarifa })
    const veredicto = lineaValorable({ incalculables: 0, sinPrecio: [], manoObra: guarda })
    const lineaId = await guardarLinea(db, {
      tipo: 'CERRAMIENTO',
      valores: {
        presupuestoId,
        orden: ++orden,
        descripcion: alta.descripcion,
        cantidad: '1',
        anchoMm: alta.anchoMm,
        altoMm: alta.altoMm,
        precioUnitario: null,
        total: null,
        valoracionCompleta: false,
        avisoValoracion: alta.aviso,
      },
      cerramiento: alta,
      manoObra: filas,
    })
    return { lineaId, veredicto }
  }

  const filasDe = (lineaId: string) => db.select().from(schema.lineasManoObra)
    .where(eq(schema.lineasManoObra.lineaId, lineaId))
    .orderBy(schema.lineasManoObra.concepto)

  beforeAll(async () => {
    db = crearDb(urlPruebas)
    await limpiar()

    // Catálogo mínimo con los valores REALES medidos: PVP y coste a 0,5000 en
    // acabado UNI, que es margen cero (pregunta abierta 4 de la spec).
    await db.insert(schema.articulos).values([
      { codigo: 'MO', descripcion: 'MANO DE OBRA DE TALLER (MINUTOS)', tipoMetraje: 'UD' },
      { codigo: 'MOCOL', descripcion: 'MANO DE OBRA DE COLOCACIÓN (MINUTOS)', tipoMetraje: 'UD' },
    ]).onConflictDoNothing()
    await db.insert(schema.articulosPvp).values([
      { articuloCodigo: 'MO', acabadoCodigo: 'UNI', tarifa: TARIFA, precio: '0.5000' },
      { articuloCodigo: 'MOCOL', acabadoCodigo: 'UNI', tarifa: TARIFA, precio: '0.5000' },
    ]).onConflictDoNothing()
    await db.insert(schema.articulosCoste).values([
      { articuloCodigo: 'MO', proveedorCodigo: 'PRUEBA', acabadoCodigo: 'UNI', coste: '0.5000' },
      { articuloCodigo: 'MOCOL', proveedorCodigo: 'PRUEBA', acabadoCodigo: 'UNI', coste: '0.5000' },
    ]).onConflictDoNothing()

    const [fila] = await db.insert(schema.presupuestos).values({
      numero: 999997, revision: 0, serie: 'A',
      fecha: new Date().toISOString().slice(0, 10),
      nombreLibre: NOMBRE_PRUEBA, obraTexto: 'VERIFICACIÓN', tarifa: TARIFA, estado: 'PENDIENTE',
    }).returning({ id: schema.presupuestos.id })
    presupuestoId = fila.id
  }, 60_000)

  afterAll(async () => { await limpiar() })

  describe('cuántas filas se escriben', () => {
    it('ninguna cuando no se teclean horas', async () => {
      const { lineaId, veredicto } = await altaConHoras({ fabricacion: '0', colocacion: '0' })
      expect(await filasDe(lineaId)).toHaveLength(0)
      expect(veredicto.valorable).toBe(true)
    })

    it('una cuando sólo se teclea un concepto', async () => {
      const { lineaId } = await altaConHoras({ fabricacion: '0', colocacion: '1.50' })
      const filas = await filasDe(lineaId)
      expect(filas).toHaveLength(1)
      expect(filas[0].concepto).toBe('COLOCACION')
    })

    it('dos cuando se teclean ambos', async () => {
      const { lineaId } = await altaConHoras({ fabricacion: '2.37', colocacion: '1.50' })
      const filas = await filasDe(lineaId)
      expect(filas.map((f) => f.concepto)).toEqual(['COLOCACION', 'FABRICACION_ADICIONAL'])
    })
  })

  it('congela el snapshot completo y lo devuelve intacto', async () => {
    const { lineaId, veredicto } = await altaConHoras({ fabricacion: '2.37', colocacion: '0' })
    const [fila] = await filasDe(lineaId)
    expect(fila).toMatchObject({
      concepto: 'FABRICACION_ADICIONAL',
      origen: 'MANUAL',
      horas: '2.37',
      // Sin redondear a entero: es la medición de los 11 casos históricos.
      minutos: '142.20',
      articuloCodigo: 'MO',
      articuloDescripcion: 'MANO DE OBRA DE TALLER (MINUTOS)',
      unidad: 'MINUTO',
      acabadoCodigo: 'UNI',
      tarifa: TARIFA,
      precioMinuto: '0.5000',
      importe: '71.10',
      costeMinuto: '0.5000',
      costeTotal: '71.10',
      valoracionCompleta: true,
      motivoCodigo: null,
      motivoCosteCodigo: null,
    })
    expect(fila.evaluadoEn).toBeInstanceOf(Date)
    expect(veredicto.valorable).toBe(true)
    expect(veredicto.advertencias).toEqual([])
  })

  // Tarifa sin fila de PVP: el caso real de MOMOSQ y de las tarifas 2 y 3.
  it('deja la línea sin valorar cuando la tarifa no tiene precio', async () => {
    const { lineaId, veredicto } = await altaConHoras(
      { fabricacion: '0', colocacion: '1.50' }, TARIFA_SIN_PRECIO,
    )
    const [fila] = await filasDe(lineaId)
    expect(fila).toMatchObject({
      precioMinuto: null, importe: null,
      valoracionCompleta: false, motivoCodigo: 'SIN_PVP',
      // El coste corre por su cuenta y sí se resuelve.
      costeMinuto: '0.5000', costeTotal: '45.00', motivoCosteCodigo: null,
    })
    expect(veredicto.valorable).toBe(false)
    expect(veredicto.motivos).toEqual(['mano de obra de colocación sin precio en la tarifa'])

    // Regla del dinero: la línea GRUPO no muestra ni cero ni un total parcial.
    const [linea] = await db.select().from(schema.lineas).where(eq(schema.lineas.id, lineaId))
    expect(linea.precioUnitario).toBeNull()
    expect(linea.total).toBeNull()
    expect(linea.valoracionCompleta).toBe(false)
  })

  it('no deja línea ni media mano de obra cuando la segunda fila revienta', async () => {
    const antes = await db.select({ id: schema.lineas.id }).from(schema.lineas)
      .where(eq(schema.lineas.presupuestoId, presupuestoId))

    const conceptos = conceptosConHoras({ fabricacion: '1.00', colocacion: '1.00' })
    const catalogo = await leerCatalogoManoObra(db, ['MO', 'MOCOL'], TARIFA)
    const { filas } = resolverManoObra({ conceptos, catalogo, tarifa: TARIFA })
    expect(filas).toHaveLength(2)

    // La PRIMERA fila es válida y la SEGUNDA viola `mano_obra_conversion_check`.
    // Así el fallo ocurre con la línea, la configuración y una fila de mano de
    // obra ya insertadas: el punto intermedio que interesa.
    await expect(guardarLinea(db, {
      tipo: 'CERRAMIENTO',
      valores: {
        presupuestoId, orden: ++orden,
        descripcion: alta.descripcion, cantidad: '1',
        anchoMm: alta.anchoMm, altoMm: alta.altoMm,
        precioUnitario: null, total: null,
        valoracionCompleta: false, avisoValoracion: alta.aviso,
      },
      cerramiento: alta,
      manoObra: [filas[0], { ...filas[1], minutos: '7.00' }],
    })).rejects.toThrow(/mano_obra_conversion_check/)

    expect(await db.select({ id: schema.lineas.id }).from(schema.lineas)
      .where(eq(schema.lineas.presupuestoId, presupuestoId))).toEqual(antes)

    const restos = (await db.execute<{ n: number }>(sql`
      SELECT count(*)::int AS n FROM lineas_mano_obra mo
      JOIN lineas l ON l.id = mo.linea_id
      WHERE l.presupuesto_id = ${presupuestoId} AND l.orden = ${orden}
    `)) as unknown as { n: number }[]
    expect(restos[0].n).toBe(0)
  })

  it('desaparece con su línea', async () => {
    const { lineaId } = await altaConHoras({ fabricacion: '0', colocacion: '1.50' })
    await db.delete(schema.lineas).where(eq(schema.lineas.id, lineaId))
    expect(await filasDe(lineaId)).toHaveLength(0)
  })
})

/**
 * Casos del catálogo defectuoso, con el artículo real modificado en la base.
 *
 * Van en su propio bloque porque cada uno necesita el catálogo en un estado
 * distinto, y mezclarlos con los de arriba obligaría a restaurarlo entre
 * pruebas de otro asunto.
 */
describe('catálogo defectuoso, contra PostgreSQL', () => {
  let db: ReturnType<typeof crearDb>
  const CODIGO = 'MOPRUEBA'
  const TARIFA_D = 8

  const resolver = async (tarifa = TARIFA_D) => {
    const catalogo = await leerCatalogoManoObra(db, [CODIGO], tarifa)
    // Se resuelve como si `MOCOL` fuese este artículo, para no depender de que
    // el catálogo real tenga un precio absurdo.
    return catalogo.get(CODIGO)!
  }

  beforeAll(async () => {
    db = crearDb(urlPruebas)
    await db.insert(schema.articulos)
      .values({ codigo: CODIGO, descripcion: 'MANO DE OBRA DE PRUEBA', tipoMetraje: 'UD' })
      .onConflictDoNothing()
  }, 60_000)

  beforeEach(async () => {
    await db.delete(schema.articulosPvp).where(eq(schema.articulosPvp.articuloCodigo, CODIGO))
    await db.delete(schema.articulosCoste).where(eq(schema.articulosCoste.articuloCodigo, CODIGO))
  })

  afterAll(async () => {
    await db.delete(schema.articulosPvp).where(eq(schema.articulosPvp.articuloCodigo, CODIGO))
    await db.delete(schema.articulosCoste).where(eq(schema.articulosCoste.articuloCodigo, CODIGO))
    await db.delete(schema.articulos).where(eq(schema.articulos.codigo, CODIGO))
  })

  it('lee el PVP sólo de la tarifa pedida y del acabado de la mano de obra', async () => {
    await db.insert(schema.articulosPvp).values([
      { articuloCodigo: CODIGO, acabadoCodigo: 'UNI', tarifa: TARIFA_D, precio: '0.5000' },
      { articuloCodigo: CODIGO, acabadoCodigo: 'UNI', tarifa: TARIFA_D + 1, precio: '0.9000' },
      { articuloCodigo: CODIGO, acabadoCodigo: 'L', tarifa: TARIFA_D, precio: '9.0000' },
    ])
    expect((await resolver()).precio).toBe('0.5000')
    expect((await resolver(TARIFA_D + 1)).precio).toBe('0.9000')
    expect((await resolver(TARIFA_D + 5)).precio).toBeNull()
  })

  it('trae TODAS las filas de coste, para poder ver la ambigüedad', async () => {
    await db.insert(schema.articulosCoste).values([
      { articuloCodigo: CODIGO, proveedorCodigo: 'A', acabadoCodigo: 'L', coste: '0.5000' },
      { articuloCodigo: CODIGO, proveedorCodigo: 'B', acabadoCodigo: 'ANOD', coste: '0.7500' },
    ])
    const articulo = await resolver()
    expect(articulo.costes).toHaveLength(2)
    // Filtrar por acabado en SQL habría escondido justo el caso a detectar.
    expect(articulo.costes.map((c) => c.acabadoCodigo).sort()).toEqual(['ANOD', 'L'])
  })

  it('deja el artículo sin precio ni costes cuando el catálogo no lo tiene', async () => {
    const articulo = await resolver()
    expect(articulo).toEqual({
      descripcion: 'MANO DE OBRA DE PRUEBA', precio: null, costes: [],
    })
  })
})
