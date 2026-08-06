/**
 * Integración de la copia con sustitución masiva contra el Postgres EFÍMERO.
 *
 *   docker compose -f packages/db/docker-compose.yml up -d
 *   npm run -w @aluminior/web test
 *
 * Lo que sólo se puede demostrar aquí: que el documento origen queda intacto,
 * que ambas revisiones conviven, y que los satélites viajan con los códigos
 * que dice el plan. La decisión ya está probada sin base de datos en
 * `plan-copia.test.ts`.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { asc, eq } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import {
  anadirModuloCerramiento, crearConfiguracionCerramiento, plantillaDiseno, UNIONES_VISUALES,
} from '@aluminior/core/estructuras'
import { copiarPresupuesto } from './copiar-presupuesto.ts'
import { normalizarMapa, MAPA_VACIO } from './mapa-sustitucion.ts'
import { seleccionDeLineas } from './seleccion-lineas.ts'
import { OPCIONES_COPIA_IDENTICA } from './plan-copia.ts'

const urlPruebas = urlDePruebasValidada(process.env.TEST_DATABASE_URL)
const NOMBRE_PRUEBA = 'PRUEBA AUTOMÁTICA COPIA PRESUPUESTO'
const NUMERO = 999998

const configuracion = anadirModuloCerramiento(
  crearConfiguracionCerramiento(plantillaDiseno('2O')!),
  plantillaDiseno('2O')!,
  UNIONES_VISUALES.find((union) => union.codigo === 'PSU001')!,
)

const mapa = (() => {
  const resultado = normalizarMapa([
    { ambito: 'SERIE', origen: 'ELEGANTPVC', destino: 'ELEGANT70RPT' },
    { ambito: 'VIDRIO', origen: 'V420AGS4', destino: 'V644AGS4' },
    { ambito: 'ACABADO_ACCESORIOS', origen: 'BLANCO', destino: 'NEGRO' },
  ])
  if (!resultado.ok) throw new Error(resultado.errores.join('; '))
  return resultado.mapa
})()

describe('copia de presupuesto', () => {
  let db: ReturnType<typeof crearDb>
  let origenId = ''
  let lineaCerramientoId = ''
  let lineaEstructuraId = ''

  const limpiar = () => db.delete(schema.presupuestos)
    .where(eq(schema.presupuestos.nombreLibre, NOMBRE_PRUEBA))

  const lineasDe = (presupuestoId: string) => db.select().from(schema.lineas)
    .where(eq(schema.lineas.presupuestoId, presupuestoId))
    .orderBy(asc(schema.lineas.orden))

  beforeAll(async () => {
    db = crearDb(urlPruebas)
    await limpiar()
    const [cabecera] = await db.insert(schema.presupuestos).values({
      numero: NUMERO, revision: 0, serie: 'A',
      fecha: '2026-01-15',
      nombreLibre: NOMBRE_PRUEBA, obraTexto: 'VERIFICACIÓN COPIA', tarifa: 1, estado: 'PENDIENTE',
      observaciones: 'texto de cabecera que debe viajar a la copia',
    }).returning({ id: schema.presupuestos.id })
    origenId = cabecera.id

    const [cerramiento] = await db.insert(schema.lineas).values({
      presupuestoId: origenId, orden: 1, tipo: 'CERRAMIENTO',
      descripcion: 'CERRAMIENTO SEGÚN DIBUJO · 2O + 2O',
      cantidad: '1', anchoMm: 2500, altoMm: 1200,
      precioUnitario: '100.0000', total: '100.00', valoracionCompleta: true,
    }).returning({ id: schema.lineas.id })
    lineaCerramientoId = cerramiento.id
    await db.insert(schema.lineasCerramiento).values({
      lineaId: lineaCerramientoId, version: 1,
      configuracion: configuracion as unknown as Record<string, unknown>,
      serieCodigo: 'ELEGANTPVC', vidrioCodigo: 'V420AGS4', acabadoCodigo: 'L',
      varianteAcristalamiento: '2',
    })
    await db.insert(schema.lineasManoObra).values({
      lineaId: lineaCerramientoId, concepto: 'COLOCACION', origen: 'MANUAL',
      horas: '1.50', minutos: '90.00',
      articuloCodigo: 'MOCOL', articuloDescripcion: 'MANO DE OBRA DE COLOCACIÓN (MINUTOS)',
      unidad: 'MINUTO', acabadoCodigo: 'UNI', tarifa: 1,
      precioMinuto: '0.5000', importe: '45.00', costeMinuto: '0.5000', costeTotal: '45.00',
      valoracionCompleta: true,
    })

    const [estructura] = await db.insert(schema.lineas).values({
      presupuestoId: origenId, orden: 2, tipo: 'ESTRUCTURA',
      descripcion: 'VENTANA 2 HOJAS', cantidad: '2', anchoMm: 1200, altoMm: 1000,
      precioUnitario: '50.0000', total: '100.00', valoracionCompleta: true,
      descripcionManual: true,
    }).returning({ id: schema.lineas.id })
    lineaEstructuraId = estructura.id
    await db.insert(schema.lineasEstructura).values({
      lineaId: lineaEstructuraId, serieCodigo: 'ELEGANTPVC', estructuraCodigo: '2O',
      acabadoCodigo: 'L', accesoriosAcabado: 'BLANCO', maderaCodigo: null,
      horasFabricacion: '0', horasColocacion: '0',
    })
    await db.insert(schema.lineasAcristalamiento).values({
      lineaId: lineaEstructuraId, slot: 1, vidrioHojas: 'V420AGS4', vidrioFijos: null, variante: '2',
    })
    await db.insert(schema.lineasDespiece).values({
      lineaId: lineaEstructuraId, articuloCodigo: 'PSM001', cantidad: '2.000',
      largoCorteMm: '1200.00', funcion: 'MV', costeUnitario: '1.0000', costeTotal: '2.0000',
    })
    await db.insert(schema.lineasOpcionesHerraje).values({
      lineaId: lineaEstructuraId, categoria: 'CIERRE', opcionCodigo: 'C1', descripcion: 'CIERRE 1',
    })
  }, 60_000)

  afterAll(async () => { await limpiar() })

  it('conserva el número, sube la revisión y deja el origen intacto', async () => {
    const antes = await lineasDe(origenId)
    const resultado = await copiarPresupuesto(db, {
      presupuestoId: origenId,
      destino: { estrategia: 'MISMO_NUMERO_NUEVA_REVISION' },
      opciones: { ...OPCIONES_COPIA_IDENTICA, mapa },
      fecha: '2026-02-01',
      creadoPor: 'prueba@aluminior',
    })
    expect(resultado.ok).toBe(true)
    if (!resultado.ok) return
    expect(resultado.numero).toBe(NUMERO)
    expect(resultado.revision).toBe(1)
    expect(resultado.lineasCopiadas).toBe(2)
    // Cerramiento: serie + vidrio. Estructura: serie + vidrio + accesorios.
    expect(resultado.sustitucionesAplicadas).toBe(5)

    // El origen no ha cambiado ni una fila.
    expect(await lineasDe(origenId)).toEqual(antes)
    const [satelite] = await db.select().from(schema.lineasCerramiento)
      .where(eq(schema.lineasCerramiento.lineaId, lineaCerramientoId))
    expect(satelite.serieCodigo).toBe('ELEGANTPVC')
    expect(satelite.vidrioCodigo).toBe('V420AGS4')

    // Y las dos revisiones conviven.
    const revisiones = await db.select({ revision: schema.presupuestos.revision })
      .from(schema.presupuestos).where(eq(schema.presupuestos.numero, NUMERO))
      .orderBy(asc(schema.presupuestos.revision))
    expect(revisiones.map((fila) => fila.revision)).toEqual([0, 1])

    // Los códigos sustituidos, en la copia.
    const copia = await lineasDe(resultado.presupuestoId)
    expect(copia).toHaveLength(2)
    const [nuevoCerramiento] = await db.select().from(schema.lineasCerramiento)
      .where(eq(schema.lineasCerramiento.lineaId, copia[0].id))
    expect(nuevoCerramiento.serieCodigo).toBe('ELEGANT70RPT')
    expect(nuevoCerramiento.vidrioCodigo).toBe('V644AGS4')
    expect(nuevoCerramiento.configuracion).toEqual(configuracion)

    const [nuevaEstructura] = await db.select().from(schema.lineasEstructura)
      .where(eq(schema.lineasEstructura.lineaId, copia[1].id))
    expect(nuevaEstructura.serieCodigo).toBe('ELEGANT70RPT')
    expect(nuevaEstructura.accesoriosAcabado).toBe('NEGRO')
    expect(nuevaEstructura.estructuraCodigo).toBe('2O')
    const acristalamiento = await db.select().from(schema.lineasAcristalamiento)
      .where(eq(schema.lineasAcristalamiento.lineaId, copia[1].id))
    expect(acristalamiento[0].vidrioHojas).toBe('V644AGS4')
    expect(acristalamiento[0].vidrioFijos).toBeNull()

    // «Copiar actual»: el detalle viaja tal cual.
    const despiece = await db.select().from(schema.lineasDespiece)
      .where(eq(schema.lineasDespiece.lineaId, copia[1].id))
    expect(despiece).toHaveLength(1)
    expect(despiece[0].articuloCodigo).toBe('PSM001')
    const manoObra = await db.select().from(schema.lineasManoObra)
      .where(eq(schema.lineasManoObra.lineaId, copia[0].id))
    expect(manoObra).toHaveLength(1)
    const herraje = await db.select().from(schema.lineasOpcionesHerraje)
      .where(eq(schema.lineasOpcionesHerraje.lineaId, copia[1].id))
    expect(herraje).toHaveLength(1)

    // Regla del dinero: la línea cambió de código, su precio ya no vale.
    expect(copia[0].precioUnitario).toBeNull()
    expect(copia[0].total).toBeNull()
    expect(copia[0].valoracionCompleta).toBe(false)
    expect(copia[0].avisoValoracion).toContain('Importe incompleto')

    const [cabecera] = await db.select().from(schema.presupuestos)
      .where(eq(schema.presupuestos.id, resultado.presupuestoId))
    expect(cabecera.observaciones).toBe('texto de cabecera que debe viajar a la copia')
    expect(cabecera.fecha).toBe('2026-02-01')
    expect(cabecera.creadoPor).toBe('prueba@aluminior')
    expect(Number(cabecera.total)).toBe(0)
  })

  it('aplica la sustitución sólo a la línea seleccionada y copia la otra intacta', async () => {
    const resultado = await copiarPresupuesto(db, {
      presupuestoId: origenId,
      destino: { estrategia: 'MISMO_NUMERO_NUEVA_REVISION' },
      opciones: { ...OPCIONES_COPIA_IDENTICA, mapa, seleccion: seleccionDeLineas([lineaEstructuraId]) },
    })
    expect(resultado.ok).toBe(true)
    if (!resultado.ok) return
    // La revisión 1 ya está escrita: ésta es la 2.
    expect(resultado.revision).toBe(2)
    expect(resultado.sustitucionesAplicadas).toBe(3)

    const copia = await lineasDe(resultado.presupuestoId)
    const [cerramiento] = await db.select().from(schema.lineasCerramiento)
      .where(eq(schema.lineasCerramiento.lineaId, copia[0].id))
    expect(cerramiento.serieCodigo).toBe('ELEGANTPVC')
    expect(copia[0].precioUnitario).toBe('100.0000')
    expect(copia[0].valoracionCompleta).toBe(true)

    const [estructura] = await db.select().from(schema.lineasEstructura)
      .where(eq(schema.lineasEstructura.lineaId, copia[1].id))
    expect(estructura.serieCodigo).toBe('ELEGANT70RPT')
    expect(copia[1].precioUnitario).toBeNull()
    // La cabecera cuadra con lo que quedó valorado.
    const [cabecera] = await db.select().from(schema.presupuestos)
      .where(eq(schema.presupuestos.id, resultado.presupuestoId))
    expect(Number(cabecera.total)).toBeCloseTo(121, 2)
  })

  it('con el mapa vacío la copia es idéntica y conserva los precios', async () => {
    const resultado = await copiarPresupuesto(db, {
      presupuestoId: origenId,
      destino: { estrategia: 'MISMO_NUMERO_NUEVA_REVISION' },
      opciones: { ...OPCIONES_COPIA_IDENTICA, mapa: MAPA_VACIO, regenerarDescripcion: true },
    })
    expect(resultado.ok).toBe(true)
    if (!resultado.ok) return
    expect(resultado.sustitucionesAplicadas).toBe(0)

    const copia = await lineasDe(resultado.presupuestoId)
    expect(copia[0].precioUnitario).toBe('100.0000')
    expect(copia[1].precioUnitario).toBe('50.0000')
    // Descripción regenerada desde la configuración del cerramiento…
    expect(copia[0].descripcion).toBe('CERRAMIENTO SEGÚN DIBUJO · 2O + 2O')
    // …y la escrita a mano, respetada.
    expect(copia[1].descripcion).toBe('VENTANA 2 HOJAS')
  })

  it('no escribe nada cuando el destino chocaría con una revisión existente', async () => {
    const antes = await db.select({ id: schema.presupuestos.id })
      .from(schema.presupuestos).where(eq(schema.presupuestos.numero, NUMERO))
    const resultado = await copiarPresupuesto(db, {
      presupuestoId: origenId,
      destino: { numero: NUMERO, revision: 0, serie: 'A' },
      opciones: { ...OPCIONES_COPIA_IDENTICA, mapa: MAPA_VACIO },
    })
    expect(resultado.ok).toBe(false)
    if (resultado.ok) return
    expect(resultado.errores[0]).toContain('coincide con el documento origen')
    expect(await db.select({ id: schema.presupuestos.id })
      .from(schema.presupuestos).where(eq(schema.presupuestos.numero, NUMERO))).toEqual(antes)
  })

  it('rechaza un origen inexistente sin dejar rastro', async () => {
    const resultado = await copiarPresupuesto(db, {
      presupuestoId: '00000000-0000-0000-0000-000000000000',
      destino: { estrategia: 'MISMO_NUMERO_NUEVA_REVISION' },
      opciones: { ...OPCIONES_COPIA_IDENTICA, mapa: MAPA_VACIO },
    })
    expect(resultado).toEqual({ ok: false, errores: ['Presupuesto de origen no encontrado'] })
  })
})
