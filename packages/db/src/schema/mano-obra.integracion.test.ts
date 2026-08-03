/**
 * Las restricciones de `lineas_mano_obra`, contra PostgreSQL de verdad.
 *
 * Un CHECK escrito y no ejecutado es una intención, no una garantía. Aquí se
 * comprueba que cada estado imposible lo es, y que lo que produce el módulo
 * puro de `@aluminior/core` cabe en el esquema: si contrato económico y SQL se
 * separan, esta suite lo detecta antes de que llegue al flujo del operador.
 *
 *   docker compose -f packages/db/docker-compose.yml up -d
 *   npm run -w @aluminior/db test
 */
import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { eq, sql } from 'drizzle-orm'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { valorarManoObra } from '@aluminior/core/precios'
import { crearDb } from '../index.ts'
import { urlDePruebasValidada } from '../pruebas.ts'
import * as schema from './index.ts'

const urlPruebas = urlDePruebasValidada(process.env.TEST_DATABASE_URL)
const migraciones = fileURLToPath(new URL('../../migrations', import.meta.url))
const NOMBRE_PRUEBA = 'PRUEBA AUTOMÁTICA MANO DE OBRA'

type Fila = typeof schema.lineasManoObra.$inferInsert

describe('restricciones de lineas_mano_obra', () => {
  let db: ReturnType<typeof crearDb>
  let lineaId = ''

  const limpiar = () => db.delete(schema.presupuestos)
    .where(eq(schema.presupuestos.nombreLibre, NOMBRE_PRUEBA))

  /** Fila completa y correcta: 1,5 h de colocación a 0,5 €/min. */
  const valida = (): Fila => ({
    lineaId,
    concepto: 'COLOCACION',
    origen: 'MANUAL',
    horas: '1.50',
    minutos: '90.00',
    articuloCodigo: 'MOCOL',
    articuloDescripcion: 'MANO DE OBRA DE COLOCACIÓN (MINUTOS)',
    unidad: 'MINUTO',
    acabadoCodigo: 'UNI',
    tarifa: 1,
    precioMinuto: '0.5000',
    importe: '45.00',
    costeMinuto: '0.5000',
    costeTotal: '45.00',
    valoracionCompleta: true,
    motivoCodigo: null,
    motivoCosteCodigo: null,
  })

  const insertar = (cambios: Partial<Fila> = {}) =>
    db.insert(schema.lineasManoObra).values({ ...valida(), ...cambios })

  const borrarTodo = () => db.delete(schema.lineasManoObra)
    .where(eq(schema.lineasManoObra.lineaId, lineaId))

  beforeAll(async () => {
    db = crearDb(urlPruebas)
    await migrate(db, { migrationsFolder: migraciones })
    await limpiar()
    const [presupuesto] = await db.insert(schema.presupuestos).values({
      numero: 999998, revision: 0, serie: 'A',
      fecha: new Date().toISOString().slice(0, 10),
      nombreLibre: NOMBRE_PRUEBA, tarifa: 1, estado: 'PENDIENTE',
    }).returning({ id: schema.presupuestos.id })
    const [linea] = await db.insert(schema.lineas).values({
      presupuestoId: presupuesto.id, orden: 1, tipo: 'CERRAMIENTO',
      descripcion: 'CERRAMIENTO DE PRUEBA', cantidad: '1',
      precioUnitario: null, total: null, valoracionCompleta: false,
    }).returning({ id: schema.lineas.id })
    lineaId = linea.id
  }, 60_000)

  // Sin esto, una fila superviviente haría que las pruebas de rechazo pasaran
  // por violar el índice único en vez de la restricción que se quiere probar.
  beforeEach(async () => { if (lineaId) await borrarTodo() })

  afterAll(async () => { await limpiar() })

  describe('lo que el esquema debe aceptar', () => {
    it('guarda una fila completa y la devuelve intacta', async () => {
      await insertar()
      const [fila] = await db.select().from(schema.lineasManoObra)
        .where(eq(schema.lineasManoObra.lineaId, lineaId))
      expect(fila).toMatchObject({
        concepto: 'COLOCACION', origen: 'MANUAL',
        horas: '1.50', minutos: '90.00',
        articuloCodigo: 'MOCOL', unidad: 'MINUTO', tarifa: 1,
        precioMinuto: '0.5000', importe: '45.00',
        costeMinuto: '0.5000', costeTotal: '45.00',
        valoracionCompleta: true, motivoCodigo: null, motivoCosteCodigo: null,
      })
      expect(fila.articuloDescripcion).toContain('COLOCACIÓN')
      expect(fila.evaluadoEn).toBeInstanceOf(Date)
      await borrarTodo()
    })

    /**
     * El punto de esta suite: lo que decide `core` tiene que caber en el SQL, y
     * con el código que `core` eligió, no con otro. Se comprueba también el
     * motivo, porque una fila que entra con el código equivocado pasaría el
     * `INSERT` y mentiría después.
     *
     * Los valores llegan de `core` como texto decimal, en la escala de la
     * columna: se escriben tal cual, sin volver a pasar por `number`.
     */
    it.each([
      ['venta completa', { precioMinuto: '0.5000', costeMinuto: '0.5000' }, null, null],
      ['SIN_PVP', { precioMinuto: null, costeMinuto: '0.5000' }, 'SIN_PVP', null],
      ['PVP_CERO', { precioMinuto: '0.0000', costeMinuto: '0.5000' }, 'PVP_CERO', null],
      ['PVP_NEGATIVO', { precioMinuto: '-0.5000', costeMinuto: '0.5000' }, 'PVP_NEGATIVO', null],
      ['IMPORTE_FUERA_RANGO',
        { precioMinuto: '9999999.0000', costeMinuto: '0.5000' }, 'IMPORTE_FUERA_RANGO', null],
      ['SIN_COSTE', { precioMinuto: '0.5000', costeMinuto: null }, null, 'SIN_COSTE'],
      ['COSTE_NEGATIVO',
        { precioMinuto: '0.5000', costeMinuto: '-0.5000' }, null, 'COSTE_NEGATIVO'],
      ['COSTE_FUERA_RANGO',
        { precioMinuto: '0.5000', costeMinuto: '9999999.0000' }, null, 'COSTE_FUERA_RANGO'],
      ['COSTE_AMBIGUO',
        { precioMinuto: '0.5000', costeMinuto: '0.5000', costeAmbiguo: true },
        null, 'COSTE_AMBIGUO'],
    ] as const)('acepta lo que produce core: %s', async (_caso, entrada, venta, coste) => {
      const v = valorarManoObra({ minutos: '599999.40', ...entrada })
      expect(v.motivoCodigo).toBe(venta)
      expect(v.motivoCosteCodigo).toBe(coste)
      await insertar({
        horas: '9999.99',
        minutos: '599999.40',
        precioMinuto: v.precioMinuto,
        importe: v.importe,
        costeMinuto: v.costeMinuto,
        costeTotal: v.costeTotal,
        valoracionCompleta: v.valoracionCompleta,
        motivoCodigo: v.motivoCodigo,
        motivoCosteCodigo: v.motivoCosteCodigo,
      })
      await borrarTodo()
    })

    /**
     * El texto decimal que devuelve `core` entra en `numeric` y vuelve idéntico:
     * ni la aplicación ni PostgreSQL tienen que redondear una segunda vez. Es lo
     * que hace que el importe del documento no dependa de la coma flotante.
     */
    it('escribe y relee el decimal exacto que calculó core', async () => {
      const v = valorarManoObra({
        minutos: '142.20', precioMinuto: '0.3335', costeMinuto: '0.3335',
      })
      expect(v).toMatchObject({ importe: '47.42', costeTotal: '47.42' })
      await insertar({
        horas: '2.37', minutos: '142.20',
        precioMinuto: v.precioMinuto, importe: v.importe,
        costeMinuto: v.costeMinuto, costeTotal: v.costeTotal,
      })
      const [fila] = await db.select().from(schema.lineasManoObra)
        .where(eq(schema.lineasManoObra.lineaId, lineaId))
      expect(fila).toMatchObject({
        minutos: '142.20', precioMinuto: '0.3335', importe: '47.42',
        costeMinuto: '0.3335', costeTotal: '47.42',
      })
      await borrarTodo()
    })

    // El valor defectuoso se conserva: es la evidencia del catálogo corrupto, y
    // sólo es escribible acompañado del código que lo declara.
    it('devuelve intactos el precio y el coste negativos', async () => {
      await insertar({
        precioMinuto: '-0.5000', importe: null,
        valoracionCompleta: false, motivoCodigo: 'PVP_NEGATIVO',
        costeMinuto: '-0.5000', costeTotal: null, motivoCosteCodigo: 'COSTE_NEGATIVO',
      })
      const [fila] = await db.select().from(schema.lineasManoObra)
        .where(eq(schema.lineasManoObra.lineaId, lineaId))
      expect(fila).toMatchObject({ precioMinuto: '-0.5000', costeMinuto: '-0.5000' })
      await borrarTodo()
    })

    it('acepta dos conceptos distintos en la misma línea', async () => {
      await insertar()
      await insertar({
        concepto: 'FABRICACION_ADICIONAL', articuloCodigo: 'MO',
        articuloDescripcion: 'MANO DE OBRA DE TALLER (MINUTOS)',
      })
      const filas = await db.select().from(schema.lineasManoObra)
        .where(eq(schema.lineasManoObra.lineaId, lineaId))
      expect(filas).toHaveLength(2)
      await borrarTodo()
    })
  })

  describe('lo que el esquema debe rechazar', () => {
    /**
     * Se exige el NOMBRE de la restricción, no un fallo cualquiera: si sólo se
     * comprobara que la escritura falla, un residuo de otra prueba la haría
     * pasar por violar el índice único. Donde hay dos restricciones violadas a
     * la vez se admiten ambas, y se dice por qué.
     */
    const rechaza = (caso: string, cambios: Partial<Fila>, restriccion: RegExp) =>
      it(caso, async () => { await expect(insertar(cambios)).rejects.toThrow(restriccion) })

    // Estado de venta imposible
    rechaza('completa sin importe', { importe: null }, /mano_obra_venta_check/)
    rechaza('completa con motivo',
      { motivoCodigo: 'IMPORTE_FUERA_RANGO' }, /mano_obra_venta_check/)
    rechaza('completa sin precio', { precioMinuto: null }, /mano_obra_venta_check/)
    rechaza('completa con precio cero', { precioMinuto: '0.0000' }, /mano_obra_venta_check/)
    rechaza('incompleta con importe', {
      valoracionCompleta: false, motivoCodigo: 'PVP_CERO', precioMinuto: '0.0000',
      importe: '45.00',
    }, /mano_obra_venta_check/)
    rechaza('incompleta sin motivo',
      { valoracionCompleta: false, importe: null }, /mano_obra_venta_check/)

    // Evidencia falseada: el código y el precio deben concordar
    rechaza('SIN_PVP con precio', {
      valoracionCompleta: false, importe: null, motivoCodigo: 'SIN_PVP',
      precioMinuto: '0.5000',
    }, /mano_obra_sin_pvp_check/)
    rechaza('PVP_CERO con precio distinto de cero', {
      valoracionCompleta: false, importe: null, motivoCodigo: 'PVP_CERO',
      precioMinuto: '0.5000',
    }, /mano_obra_pvp_cero_check/)
    rechaza('IMPORTE_FUERA_RANGO sin precio', {
      valoracionCompleta: false, importe: null, motivoCodigo: 'IMPORTE_FUERA_RANGO',
      precioMinuto: null,
    }, /mano_obra_fuera_rango_check/)
    rechaza('PVP_NEGATIVO con precio positivo', {
      valoracionCompleta: false, importe: null, motivoCodigo: 'PVP_NEGATIVO',
      precioMinuto: '0.5000',
    }, /mano_obra_pvp_negativo_check/)
    rechaza('PVP_NEGATIVO sin precio', {
      valoracionCompleta: false, importe: null, motivoCodigo: 'PVP_NEGATIVO',
      precioMinuto: null,
    }, /mano_obra_pvp_negativo_check/)

    /**
     * Un precio negativo sólo es escribible bajo `PVP_NEGATIVO`. Con cualquier
     * otro código viola a la vez el rango y el `CHECK` de ese código: las dos
     * son la restricción correcta, y la alternativa se admite igual que en la
     * duración nula.
     */
    rechaza('precio negativo bajo otro código', {
      valoracionCompleta: false, importe: null, motivoCodigo: 'IMPORTE_FUERA_RANGO',
      precioMinuto: '-0.5000',
    }, /mano_obra_precio_check|mano_obra_fuera_rango_check/)
    rechaza('coste negativo bajo otro código', {
      costeTotal: null, motivoCosteCodigo: 'COSTE_FUERA_RANGO', costeMinuto: '-0.5000',
    }, /mano_obra_coste_minuto_check|mano_obra_coste_fuera_rango_check/)
    // Sin motivo de coste, los cuatro CHECK por código no opinan y el de rango
    // queda solo: es el único caso que lo señala a él y a nadie más.
    rechaza('coste por minuto negativo sin motivo que lo declare', {
      costeMinuto: '-0.5000',
    }, /mano_obra_coste_minuto_check/)
    rechaza('importe negativo', {
      importe: '-45.00',
    }, /mano_obra_importe_check/)
    rechaza('coste total negativo', {
      costeTotal: '-45.00',
    }, /mano_obra_coste_total_check/)

    // Estado de coste imposible
    rechaza('coste total con motivo',
      { motivoCosteCodigo: 'SIN_COSTE' }, /mano_obra_coste_check/)
    rechaza('coste total nulo sin motivo', { costeTotal: null }, /mano_obra_coste_check/)

    // Evidencia de coste falseada. Cada código exige exactamente el coste por
    // minuto que le corresponde, igual que en la venta.
    rechaza('SIN_COSTE con coste por minuto', {
      costeTotal: null, motivoCosteCodigo: 'SIN_COSTE', costeMinuto: '0.5000',
    }, /mano_obra_sin_coste_check/)
    rechaza('COSTE_AMBIGUO con coste por minuto', {
      costeTotal: null, motivoCosteCodigo: 'COSTE_AMBIGUO', costeMinuto: '0.5000',
    }, /mano_obra_coste_ambiguo_check/)
    rechaza('COSTE_FUERA_RANGO sin coste por minuto', {
      costeTotal: null, motivoCosteCodigo: 'COSTE_FUERA_RANGO', costeMinuto: null,
    }, /mano_obra_coste_fuera_rango_check/)
    rechaza('COSTE_FUERA_RANGO con coste cero', {
      costeTotal: null, motivoCosteCodigo: 'COSTE_FUERA_RANGO', costeMinuto: '0.0000',
    }, /mano_obra_coste_fuera_rango_check/)
    rechaza('COSTE_NEGATIVO con coste positivo', {
      costeTotal: null, motivoCosteCodigo: 'COSTE_NEGATIVO', costeMinuto: '0.5000',
    }, /mano_obra_coste_negativo_check/)
    rechaza('COSTE_NEGATIVO sin coste por minuto', {
      costeTotal: null, motivoCosteCodigo: 'COSTE_NEGATIVO', costeMinuto: null,
    }, /mano_obra_coste_negativo_check/)

    // Duración. Una duración nula viola a la vez el mínimo de horas y el de
    // minutos; ambas son la restricción correcta.
    rechaza('minutos que no son las horas por 60',
      { horas: '1.50', minutos: '80.00' }, /mano_obra_conversion_check/)
    rechaza('duración cero',
      { horas: '0.00', minutos: '0.00' }, /mano_obra_horas_check|mano_obra_minutos_check/)
    rechaza('horas negativas',
      { horas: '-1.00', minutos: '-60.00' }, /mano_obra_horas_check|mano_obra_minutos_check/)
    rechaza('manual sin horas',
      { horas: null, minutos: '90.00' }, /mano_obra_manual_horas_check/)

    // Vocabulario cerrado
    rechaza('concepto desconocido',
      { concepto: 'FABRICACION_BASE' }, /mano_obra_concepto_check/)
    rechaza('origen desconocido',
      { origen: 'CALCULADO', horas: null }, /mano_obra_origen_check/)
    rechaza('motivo desconocido', {
      valoracionCompleta: false, importe: null, precioMinuto: null,
      motivoCodigo: 'PORQUE_SI',
    }, /mano_obra_motivo_check/)
    rechaza('motivo de coste desconocido',
      { costeTotal: null, motivoCosteCodigo: 'PORQUE_SI' }, /mano_obra_motivo_coste_check/)

    it('rechaza dos filas del mismo concepto en la misma línea', async () => {
      await insertar()
      await expect(insertar()).rejects.toThrow(/mano_obra_linea_concepto_uq/)
    })
  })

  it('desaparece con su línea', async () => {
    await insertar()
    await db.delete(schema.lineas).where(eq(schema.lineas.id, lineaId))
    const [residuo] = (await db.execute<{ n: number }>(sql`
      SELECT count(*)::int AS n FROM lineas_mano_obra WHERE linea_id = ${lineaId}
    `)) as unknown as { n: number }[]
    expect(residuo.n).toBe(0)
  })
})
