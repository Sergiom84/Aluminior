/**
 * Integración del alta de línea contra el Postgres EFÍMERO en Docker.
 *
 * Nunca contra la base compartida: la de trabajo tiene datos reales de la
 * empresa y `packages/db/README.md` lo prohíbe expresamente. La comprobación de
 * abajo rechaza cualquier destino que no sea local y de pruebas, así que no
 * depende de que quien ejecute se acuerde.
 *
 *   docker compose -f packages/db/docker-compose.yml up -d
 *   npm run -w @aluminior/web test
 *
 * Ejecuta `guardarLinea`, el MISMO servicio que usa `anyadirLinea`. Si alguien
 * quita la transacción de producción, estas pruebas fallan; si la prueba
 * abriera la suya, no probaría nada.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { eq, sql } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import {
  anadirModuloCerramiento, crearConfiguracionCerramiento, plantillaDiseno, UNIONES_VISUALES,
} from '@aluminior/core/estructuras'
import { guardarLinea } from './guardar-linea.ts'
import { comprobarPersistenciaCerramientos, prepararAltaCerramiento } from '../cerramientos/index.ts'
import { comprobarPersistenciaManoObra, type SnapshotManoObra } from '../mano-obra/index.ts'

/**
 * Snapshot de mano de obra válido, para provocar fallos intermedios REALES.
 *
 * Se construye a mano, saltándose el resolutor, precisamente para poder
 * duplicarlo o corromperlo: la interfaz no permite llegar a estos estados, y sin
 * un fallo de la SEGUNDA escritura no se puede demostrar que la transacción
 * deshace la primera.
 */
const snapshot = (): SnapshotManoObra => ({
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

const urlPruebas = urlDePruebasValidada(process.env.TEST_DATABASE_URL)
const NOMBRE_PRUEBA = 'PRUEBA AUTOMÁTICA ALTA CERRAMIENTO'

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

describe('persistencia del alta de línea', () => {
  let db: ReturnType<typeof crearDb>
  let presupuestoId = ''

  const limpiar = () => db.delete(schema.presupuestos)
    .where(eq(schema.presupuestos.nombreLibre, NOMBRE_PRUEBA))

  const valoresLinea = (orden: number) => ({
    presupuestoId, orden,
    descripcion: alta.descripcion, cantidad: '1',
    anchoMm: alta.anchoMm, altoMm: alta.altoMm,
    precioUnitario: null, total: null,
    valoracionCompleta: alta.precioUnitario !== null,
    avisoValoracion: alta.aviso,
  })

  const lineasDelPresupuesto = () => db.select({ id: schema.lineas.id })
    .from(schema.lineas).where(eq(schema.lineas.presupuestoId, presupuestoId))

  beforeAll(async () => {
    db = crearDb(urlPruebas)
    await limpiar()
    const [fila] = await db.insert(schema.presupuestos).values({
      numero: 999999, revision: 0, serie: 'A',
      fecha: new Date().toISOString().slice(0, 10),
      nombreLibre: NOMBRE_PRUEBA, obraTexto: 'VERIFICACIÓN', tarifa: 1, estado: 'PENDIENTE',
    }).returning({ id: schema.presupuestos.id })
    presupuestoId = fila.id
  }, 60_000)

  afterAll(async () => { await limpiar() })

  it('tiene las migraciones satélite aplicadas', async () => {
    expect(await comprobarPersistenciaCerramientos(db)).toBe(true)
    expect(await comprobarPersistenciaManoObra(db)).toBe(true)
  })

  it('guarda línea y configuración juntas, y las devuelve intactas', async () => {
    const lineaId = await guardarLinea(db, {
      tipo: 'CERRAMIENTO', valores: valoresLinea(1), cerramiento: alta, manoObra: [],
    })

    const [guardada] = await db.select().from(schema.lineas).where(eq(schema.lineas.id, lineaId))
    expect(guardada.descripcion).toBe('CERRAMIENTO SEGÚN DIBUJO · 2O + 2O')
    expect(guardada.anchoMm).toBe(2500)
    expect(guardada.altoMm).toBe(1200)
    // Regla del dinero: sin valoración agregada no hay precio, ni un cero.
    expect(guardada.precioUnitario).toBeNull()
    expect(guardada.total).toBeNull()
    expect(guardada.valoracionCompleta).toBe(false)
    expect(guardada.avisoValoracion).toBe(alta.aviso)

    const satelite = await db.select().from(schema.lineasCerramiento)
      .where(eq(schema.lineasCerramiento.lineaId, lineaId))
    expect(satelite).toHaveLength(1)
    expect(satelite[0]).toMatchObject({
      version: 1,
      configuracion,
      serieCodigo: 'ELEGANTPVC',
      vidrioCodigo: 'V420AGS4',
      acabadoCodigo: 'L',
      varianteAcristalamiento: '2',
      // Obsoletos: ya no se escriben, y la columna aplica su DEFAULT.
      ajusteFabricacion: '0.00',
      ajusteColocacion: '0.00',
    })

    // Sin horas tecleadas no hay filas de mano de obra que filtrar después.
    const sinManoObra = (await db.execute<{ n: number }>(sql`
      SELECT count(*)::int AS n FROM lineas_mano_obra WHERE linea_id = ${lineaId}
    `)) as unknown as { n: number }[]
    expect(sinManoObra[0].n).toBe(0)

    await db.delete(schema.lineas).where(eq(schema.lineas.id, lineaId))
    const residuo = (await db.execute<{ n: number }>(sql`
      SELECT count(*)::int AS n FROM lineas_cerramiento WHERE linea_id = ${lineaId}
    `)) as unknown as { n: number }[]
    expect(residuo[0].n).toBe(0)
  })

  it('no deja línea huérfana cuando falla la escritura de la configuración', async () => {
    const antes = await lineasDelPresupuesto()

    // Fallo real de la TERCERA escritura: dos filas del mismo concepto violan
    // `mano_obra_linea_concepto_uq`. Para entonces la línea y la configuración
    // ya están insertadas, que es justo el punto intermedio que interesa.
    await expect(guardarLinea(db, {
      tipo: 'CERRAMIENTO',
      valores: valoresLinea(2),
      cerramiento: alta,
      manoObra: [snapshot(), snapshot()],
    })).rejects.toMatchObject({ cause: { code: '23505', constraint_name: 'mano_obra_linea_concepto_uq' } })

    expect(await lineasDelPresupuesto()).toEqual(antes)
    const huerfanas = (await db.execute<{ n: number }>(sql`
      SELECT count(*)::int AS n FROM lineas l
      LEFT JOIN lineas_cerramiento c ON c.linea_id = l.id
      WHERE l.presupuesto_id = ${presupuestoId} AND l.tipo = 'CERRAMIENTO' AND c.linea_id IS NULL
    `)) as unknown as { n: number }[]
    expect(huerfanas[0].n).toBe(0)
    // Y tampoco queda media mano de obra escrita.
    const restos = (await db.execute<{ n: number }>(sql`
      SELECT count(*)::int AS n FROM lineas_mano_obra mo
      JOIN lineas l ON l.id = mo.linea_id WHERE l.presupuesto_id = ${presupuestoId}
    `)) as unknown as { n: number }[]
    expect(restos[0].n).toBe(0)
  })

  it('tampoco deja huérfana una ESTRUCTURA cuyo despiece no se puede escribir', async () => {
    const antes = await lineasDelPresupuesto()

    // `cantidad` es numeric(10,3): una cantidad fuera de rango revienta la
    // escritura del despiece cuando la línea y `lineas_estructura` ya están
    // insertadas, que es justo el punto intermedio que interesa.
    await expect(guardarLinea(db, {
      tipo: 'ESTRUCTURA',
      valores: valoresLinea(3),
      estructura: {
        serieCodigo: 'ELEGANTPVC',
        estructuraCodigo: '2O',
        acabadoCodigo: 'L',
        piezas: [{
          articuloCodigo: 'PSM001', cantidad: '99999999999', largoCorteMm: '1000',
          anguloIzquierdo: null, anguloDerecho: null, funcion: 'MV',
          costeUnitario: null, costeTotal: null,
        }],
        acristalamiento: [],
        opcionesHerraje: [],
      },
    })).rejects.toThrow()

    expect(await lineasDelPresupuesto()).toEqual(antes)
  })

  it('no descuadra la cabecera contra sus líneas cuando el alta falla', async () => {
    await expect(guardarLinea(db, {
      tipo: 'CERRAMIENTO',
      valores: { ...valoresLinea(4), total: '1000.00', precioUnitario: '1000.0000' },
      cerramiento: alta,
      // `minutos` que no son `horas × 60`: viola `mano_obra_conversion_check`
      // después de haber insertado la línea con su total.
      manoObra: [{ ...snapshot(), minutos: '80.00' }],
    })).rejects.toMatchObject({ cause: { code: '23514', constraint_name: 'mano_obra_conversion_check' } })

    // El invariante del documento: el total de la cabecera es la suma de sus
    // líneas. Una línea que se quedara escrita sin recalcular lo rompe.
    const [cuadre] = (await db.execute<{ cabecera: string; lineas: string }>(sql`
      SELECT p.total::text AS cabecera,
             COALESCE((SELECT SUM(l.total) FROM lineas l
                       WHERE l.presupuesto_id = p.id), 0)::text AS lineas
      FROM presupuestos p WHERE p.id = ${presupuestoId}
    `)) as unknown as { cabecera: string; lineas: string }[]
    expect(Number(cuadre.cabecera)).toBe(Number(cuadre.lineas))
  })
})
