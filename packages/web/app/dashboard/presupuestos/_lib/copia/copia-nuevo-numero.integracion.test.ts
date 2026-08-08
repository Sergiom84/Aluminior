/**
 * Integración de `copiarPresupuesto` con destino NUEVO_NUMERO (T.72.2), contra
 * el Postgres EFÍMERO. `copia.integracion.test.ts` ya prueba a fondo la copia
 * de satélites y la conservación de precios para MISMO_NUMERO_NUEVA_REVISION;
 * aquí sólo lo que NUEVO_NUMERO cambia: el destino se calcula del ejercicio
 * de la fecha, no del documento origen, con revisión 0 siempre.
 *
 * Ejercicio 2033 aislado: ningún otro fichero de esta suite reserva
 * NUMERO_NUEVO en ese año, así que no compite por el mismo lock ni el mismo
 * rango de `MAX(numero)`.
 *
 *   docker compose -f packages/db/docker-compose.yml up -d
 *   npm run -w @aluminior/web test
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { asc, eq } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { copiarPresupuesto, copiarPresupuestoParaPruebas } from './copiar-presupuesto.ts'
import { MAPA_VACIO } from './mapa-sustitucion.ts'
import { OPCIONES_COPIA_IDENTICA } from './plan-copia.ts'

const urlPruebas = urlDePruebasValidada(process.env.TEST_DATABASE_URL)
const NOMBRE_PRUEBA = 'PRUEBA AUTOMÁTICA COPIA NUEVO NUMERO'
const NUMERO_ORIGEN = 888001
const EJERCICIO = 2033
const FECHA = '2033-06-15'

describe('copiarPresupuesto con NUEVO_NUMERO, contra PostgreSQL', () => {
  let db: ReturnType<typeof crearDb>
  let origenId = ''
  let lineaCerramientoId = ''

  const limpiar = () => db.delete(schema.presupuestos)
    .where(eq(schema.presupuestos.nombreLibre, NOMBRE_PRUEBA))

  const lineasDe = (presupuestoId: string) => db.select().from(schema.lineas)
    .where(eq(schema.lineas.presupuestoId, presupuestoId))
    .orderBy(asc(schema.lineas.orden))

  beforeAll(async () => {
    db = crearDb(urlPruebas)
    await limpiar()

    const [cabecera] = await db.insert(schema.presupuestos).values({
      numero: NUMERO_ORIGEN, revision: 0, serie: 'A', fecha: FECHA,
      nombreLibre: NOMBRE_PRUEBA, obraTexto: 'VERIFICACIÓN NUEVO NÚMERO', tarifa: 1, estado: 'PENDIENTE',
      observaciones: 'texto de cabecera que debe viajar a la copia',
    }).returning({ id: schema.presupuestos.id })
    origenId = cabecera.id

    const [cerramiento] = await db.insert(schema.lineas).values({
      presupuestoId: origenId, orden: 1, tipo: 'CERRAMIENTO',
      descripcion: 'CERRAMIENTO SEGÚN DIBUJO · 2O', cantidad: '1', anchoMm: 1200, altoMm: 1000,
      precioUnitario: '80.0000', total: '80.00', valoracionCompleta: true,
    }).returning({ id: schema.lineas.id })
    lineaCerramientoId = cerramiento.id
    await db.insert(schema.lineasCerramiento).values({
      lineaId: lineaCerramientoId, version: 1,
      configuracion: { version: 1, modulos: [] } as unknown as Record<string, unknown>,
      serieCodigo: 'ELEGANTPVC', vidrioCodigo: 'V420AGS4', acabadoCodigo: 'L',
      varianteAcristalamiento: '2',
    })
    await db.insert(schema.lineasManoObra).values({
      lineaId: lineaCerramientoId, concepto: 'COLOCACION', origen: 'MANUAL',
      horas: '1.00', minutos: '60.00',
      articuloCodigo: 'MOCOL', articuloDescripcion: 'MANO DE OBRA DE COLOCACIÓN (MINUTOS)',
      unidad: 'MINUTO', acabadoCodigo: 'UNI', tarifa: 1,
      precioMinuto: '0.5000', importe: '30.00', costeMinuto: '0.5000', costeTotal: '30.00',
      valoracionCompleta: true,
    })

    const [estructura] = await db.insert(schema.lineas).values({
      presupuestoId: origenId, orden: 2, tipo: 'ESTRUCTURA',
      descripcion: 'VENTANA 1 HOJA', cantidad: '1', anchoMm: 900, altoMm: 900,
      precioUnitario: '40.0000', total: '40.00', valoracionCompleta: true,
      descripcionManual: true,
    }).returning({ id: schema.lineas.id })
    await db.insert(schema.lineasEstructura).values({
      lineaId: estructura.id, serieCodigo: 'ELEGANTPVC', estructuraCodigo: '1O',
      acabadoCodigo: 'L', accesoriosAcabado: 'BLANCO', maderaCodigo: null,
      horasFabricacion: '0', horasColocacion: '0',
    })
    await db.insert(schema.lineasAcristalamiento).values({
      lineaId: estructura.id, slot: 1, vidrioHojas: 'V420AGS4', vidrioFijos: null, variante: '2',
    })
    await db.insert(schema.lineasDespiece).values({
      lineaId: estructura.id, articuloCodigo: 'PSM001', cantidad: '2.000',
      largoCorteMm: '900.00', funcion: 'MV', costeUnitario: '1.0000', costeTotal: '2.0000',
    })
    await db.insert(schema.lineasOpcionesHerraje).values({
      lineaId: estructura.id, categoria: 'CIERRE', opcionCodigo: 'C1', descripcion: 'CIERRE 1',
    })
  }, 60_000)

  afterAll(async () => { await limpiar() })

  it('crea un número nuevo con revisión 0, misma serie, todas las líneas y precios conservados', async () => {
    const antes = await lineasDe(origenId)

    const resultado = await copiarPresupuesto(db, {
      presupuestoId: origenId,
      destino: { estrategia: 'NUEVO_NUMERO' },
      opciones: { ...OPCIONES_COPIA_IDENTICA, mapa: MAPA_VACIO },
      fecha: FECHA,
      creadoPor: 'prueba@aluminior',
    })

    expect(resultado.ok).toBe(true)
    if (!resultado.ok) return
    // Nuevo número, distinto del origen, dentro del ejercicio 2033.
    expect(resultado.numero).not.toBe(NUMERO_ORIGEN)
    expect(resultado.numero).toBeGreaterThanOrEqual(EJERCICIO % 100 * 10000)
    expect(resultado.numero).toBeLessThan((EJERCICIO % 100 + 1) * 10000)
    expect(resultado.revision).toBe(0)
    expect(resultado.lineasCopiadas).toBe(2)
    expect(resultado.sustitucionesAplicadas).toBe(0)

    // El origen no ha cambiado ni una fila.
    expect(await lineasDe(origenId)).toEqual(antes)

    const [cabecera] = await db.select().from(schema.presupuestos)
      .where(eq(schema.presupuestos.id, resultado.presupuestoId))
    expect(cabecera.serie).toBe('A')
    expect(cabecera.revision).toBe(0)
    expect(cabecera.fecha).toBe(FECHA)
    expect(cabecera.creadoPor).toBe('prueba@aluminior')
    expect(cabecera.estado).toBe('PENDIENTE')
    expect(cabecera.observaciones).toBe('texto de cabecera que debe viajar a la copia')

    const copia = await lineasDe(resultado.presupuestoId)
    expect(copia).toHaveLength(2)
    // Mapa vacío: precios y valoración se conservan exactamente.
    expect(copia[0].precioUnitario).toBe('80.0000')
    expect(copia[0].valoracionCompleta).toBe(true)
    expect(copia[1].precioUnitario).toBe('40.0000')
    expect(copia[1].valoracionCompleta).toBe(true)
    expect(Number(cabecera.subtotal)).toBeCloseTo(120, 2)

    const [manoObra] = await db.select().from(schema.lineasManoObra)
      .where(eq(schema.lineasManoObra.lineaId, copia[0].id))
    expect(manoObra.articuloCodigo).toBe('MOCOL')
    const despiece = await db.select().from(schema.lineasDespiece)
      .where(eq(schema.lineasDespiece.lineaId, copia[1].id))
    expect(despiece).toHaveLength(1)
  })

  it('con intercalación FORZADA (no azar): dos copias como NUEVO_NUMERO dan números consecutivos', async () => {
    const [r1, r2] = await Promise.all([
      copiarPresupuestoParaPruebas(db, {
        presupuestoId: origenId,
        destino: { estrategia: 'NUEVO_NUMERO' },
        opciones: { ...OPCIONES_COPIA_IDENTICA, mapa: MAPA_VACIO },
        fecha: FECHA,
      }, { pausaTrasLecturaMs: 200 }),
      (async () => {
        await new Promise((resolver) => setTimeout(resolver, 40))
        return copiarPresupuesto(db, {
          presupuestoId: origenId,
          destino: { estrategia: 'NUEVO_NUMERO' },
          opciones: { ...OPCIONES_COPIA_IDENTICA, mapa: MAPA_VACIO },
          fecha: FECHA,
        })
      })(),
    ])

    expect(r1.ok).toBe(true)
    expect(r2.ok).toBe(true)
    if (!r1.ok || !r2.ok) return
    expect(new Set([r1.numero, r2.numero]).size).toBe(2)
    expect(Math.abs(r1.numero - r2.numero)).toBe(1)
    expect(r1.revision).toBe(0)
    expect(r2.revision).toBe(0)
  })
})
