import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { snapshotSintetico } from './snapshot-pdf.fixture'
import { cargarPresupuestoPdf } from './datos'
import { DatosPdfIncoherentes } from './cerramiento-pdf'

const cliente = postgres(urlDePruebasValidada(process.env.TEST_DATABASE_URL), { max: 3 })
const db = drizzle(cliente, { schema })
const codigo = `J06-${randomUUID()}`
const documentos: string[] = []
let numero = 0

async function documento() {
  const [p] = await db.insert(schema.presupuestos).values({ numero: ++numero, serie: codigo,
    revision: 2, fecha: '2026-09-08', nombreLibre: 'Nombre libre conservado',
    obraTexto: 'Obra intacta', formaPago: 'Primer plazo\nSegundo plazo',
    observaciones: 'Ángulos y condición\nFinal', baseImponible: '181.00', total: '219.01',
    cuotaIva: '38.01', tarifa: 1 }).returning()
  documentos.push(p.id)
  return p
}

async function cerramiento(id: string) {
  const resultado = snapshotSintetico()
  const [l] = await db.insert(schema.lineas).values({ presupuestoId: id, orden: 7,
    tipo: 'CERRAMIENTO', descripcion: 'Composición congelada', anchoMm: 1760, altoMm: 800,
    cantidad: '3', precioUnitario: '60', total: '181', valoracionCompleta: true }).returning()
  await db.insert(schema.lineasCerramiento).values({ lineaId: l.id,
    configuracion: { ...resultado.configuracion } })
  await db.insert(schema.lineasCerramientoResultados).values({ lineaId: l.id, version: 1, resultado })
  await db.insert(schema.lineasManoObra).values({ lineaId: l.id, concepto: 'COLOCACION', origen: 'MANUAL',
    horas: '1', minutos: '60', articuloCodigo: 'J06-NO-CATALOGO', articuloDescripcion: 'Snapshot MO',
    tarifa: 1, precioMinuto: '0.0167', importe: '1', costeMinuto: null, costeTotal: null,
    motivoCosteCodigo: 'SIN_COSTE', valoracionCompleta: true })
  return l
}

describe('lectura SQL de PDF sin valoración ni escrituras', () => {
  beforeAll(async () => {
    await db.insert(schema.clientes).values({ codigo, nombre: 'Cliente canónico' })
    await db.insert(schema.clientesPotenciales).values({ codigo, nombre: 'Potencial canónico' })
  })
  afterAll(async () => {
    vi.restoreAllMocks()
    try {
      for (const id of documentos) await db.delete(schema.presupuestos).where(eq(schema.presupuestos.id, id))
      await db.delete(schema.clientesPotenciales).where(eq(schema.clientesPotenciales.codigo, codigo))
      await db.delete(schema.clientes).where(eq(schema.clientes.codigo, codigo))
    } finally { await cliente.end() }
  })

  it('devuelve null para identidad inexistente', async () => {
    expect(await cargarPresupuestoPdf(db, randomUUID())).toBeNull()
  })

  it('resuelve las prioridades persistibles sin modificar nombre libre ni obra', async () => {
    const p = await documento()
    for (const [clienteCodigo, potencialCodigo, nombreLibre, esperado] of [
      [codigo, codigo, 'Libre', 'Cliente canónico'], [null, codigo, 'Libre', 'Potencial canónico'],
      [null, null, 'Libre', 'Libre'],
    ]) {
      await db.update(schema.presupuestos).set({ clienteCodigo, potencialCodigo, nombreLibre })
        .where(eq(schema.presupuestos.id, p.id))
      expect((await cargarPresupuestoPdf(db, p.id))?.destinatario).toBe(esperado)
      const [guardado] = await db.select().from(schema.presupuestos).where(eq(schema.presupuestos.id, p.id))
      expect(guardado).toMatchObject({ clienteCodigo, potencialCodigo, nombreLibre, obraTexto: 'Obra intacta' })
    }
    // La BD actual impide ausencia total; el fallback del resolvedor se prueba en puro.
    await expect(db.update(schema.presupuestos).set({ clienteCodigo: null, potencialCodigo: null,
      nombreLibre: null }).where(eq(schema.presupuestos.id, p.id))).rejects.toMatchObject({
      cause: { code: '23514', constraint_name: 'presupuestos_destinatario_check' },
    })
  })

  it('conserva identidad, condiciones, geometría, orden y MO una vez sin consultar catálogo', async () => {
    const p = await documento()
    const l = await cerramiento(p.id)
    const antes = await db.select().from(schema.lineas).where(eq(schema.lineas.id, l.id))
    const pdf = await cargarPresupuestoPdf(db, p.id)
    expect(pdf).toMatchObject({ id: p.id, serie: codigo, numero: p.numero, revision: 2,
      formaPago: 'Primer plazo\nSegundo plazo', observaciones: 'Ángulos y condición\nFinal',
      baseImponible: 181, total: 219.01, incompleto: false })
    expect(pdf?.lineas).toHaveLength(1)
    expect(pdf?.lineas[0]).toMatchObject({ id: l.id, orden: 7, cantidad: '3.00',
      precioUnitario: '60.0000', total: '181.00', cerramiento: {
        estadoSnapshot: 'con-snapshot', configuracion: snapshotSintetico().configuracion,
        manoObra: [{ concepto: 'COLOCACION', horas: '1.00', importe: '1.00', valoracionCompleta: true }],
      } })
    expect(await db.select().from(schema.lineas).where(eq(schema.lineas.id, l.id))).toEqual(antes)
  })

  it('distingue antiguo, corrupto y configuración ausente en registros reales', async () => {
    const p = await documento()
    const l = await cerramiento(p.id)
    await db.delete(schema.lineasCerramientoResultados).where(eq(schema.lineasCerramientoResultados.lineaId, l.id))
    expect((await cargarPresupuestoPdf(db, p.id))?.lineas[0].cerramiento?.estadoSnapshot)
      .toBe('anterior-sin-snapshot')
    // JSON válido para la restricción SQL, pero inválido para el contrato de dominio.
    await cliente`insert into lineas_cerramiento_resultados (linea_id, version, resultado)
      values (${l.id}, 1, '{"version":1}'::jsonb)`
    await expect(cargarPresupuestoPdf(db, p.id)).rejects.toThrow(DatosPdfIncoherentes)
    await db.delete(schema.lineasCerramiento).where(eq(schema.lineasCerramiento.lineaId, l.id))
    await expect(cargarPresupuestoPdf(db, p.id)).rejects.toThrow('Falta la configuración')
  })

  it('no convierte un artículo incompleto en cero ni oculta el cero válido', async () => {
    const p = await documento()
    await db.insert(schema.lineas).values([
      { presupuestoId: p.id, tipo: 'ARTICULO', descripcion: 'Ausente', orden: 2,
        precioUnitario: null, total: null, valoracionCompleta: false },
      { presupuestoId: p.id, tipo: 'ARTICULO', descripcion: 'Cero legítimo', orden: 1,
        precioUnitario: '0', total: '0', valoracionCompleta: true },
    ])
    const pdf = await cargarPresupuestoPdf(db, p.id)
    expect(pdf?.incompleto).toBe(true)
    expect(pdf?.lineas.map(l => [l.orden, l.total, l.cerramiento])).toEqual([[1, '0.00', null], [2, null, null]])
  })

  it('mantiene cabecera y líneas de una sola revisión con commit entre sus SELECT', async () => {
    const p = await documento()
    const l = await cerramiento(p.id)
    const original = db.transaction.bind(db)
    let escrituras = 0
    // La barrera espera al primer SELECT real. No sustituye datos ni aislamiento.
    const interceptar = <T extends object>(consulta: T): T => new Proxy(consulta, {
      get(target, propiedad, receptor) {
        if (propiedad === 'then') return async (resolver: (v: unknown) => unknown, rechazar: (e: unknown) => unknown) => {
          try {
            const filas = await target
            await db.transaction(async tx => {
              await tx.update(schema.presupuestos).set({ baseImponible: '241', total: '291.61' })
                .where(eq(schema.presupuestos.id, p.id))
              await tx.update(schema.lineas).set({ cantidad: '4', total: '241' }).where(eq(schema.lineas.id, l.id))
            })
            escrituras++
            return resolver(filas)
          } catch (e) { return rechazar(e) }
        }
        const valor = Reflect.get(target, propiedad, receptor)
        return typeof valor === 'function' ? (...args: unknown[]) => interceptar(valor.apply(target, args)) : valor
      },
    })
    const espia = vi.spyOn(db, 'transaction').mockImplementationOnce((operacion, opciones) =>
      original(tx => {
        const select = tx.select.bind(tx)
        let primera = true
        const envuelta = new Proxy(tx, { get(target, propiedad, receptor) {
          if (propiedad === 'select') return (...args: Parameters<typeof select>) => {
            const consulta = select(...args)
            if (!primera) return consulta
            primera = false
            return interceptar(consulta)
          }
          return Reflect.get(target, propiedad, receptor)
        } })
        return operacion(envuelta)
      }, opciones))
    try {
      const anterior = await cargarPresupuestoPdf(db, p.id)
      expect(escrituras).toBe(1)
      expect(anterior?.baseImponible).toBe(181)
      expect(anterior?.lineas[0]).toMatchObject({ cantidad: '3.00', total: '181.00' })
    } finally { espia.mockRestore() }
    const posterior = await cargarPresupuestoPdf(db, p.id)
    expect(posterior?.baseImponible).toBe(241)
    expect(posterior?.lineas[0]).toMatchObject({ cantidad: '4.00', total: '241.00' })
  })
})

