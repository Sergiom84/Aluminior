import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { cargarProduccion } from './datos-produccion'
import { fixtureProduccion } from './produccion.fixture'
import { prepararProduccion } from './preparar-produccion'
import { parametrosProduccion } from './parametros'
import type { ResultadoCerramientoV1 } from '@aluminior/core/estructuras'

const db = crearDb(urlDePruebasValidada(process.env.TEST_DATABASE_URL))
const prefijo = `QA-J08-${randomUUID().slice(0, 8)}`
const datos: ReturnType<typeof fixtureProduccion> = JSON.parse(JSON.stringify(fixtureProduccion()).replaceAll('QA-J04', prefijo))
let id: string
let lineaId: string
let copiaId: string
const ids: string[] = []

async function insertar(revision: number, ordenes = [1]) {
  const [p] = await db.insert(schema.presupuestos).values({ numero: 938008, serie: prefijo, revision,
    fecha: '2026-09-08', nombreLibre: 'QA J08 LECTURA', tarifa: 9 }).returning()
  ids.push(p.id)
  let primeraLinea = ''
  for (const orden of ordenes) {
  const [l] = await db.insert(schema.lineas).values({ presupuestoId: p.id, orden, referencia: 'SALÓN', tipo: 'CERRAMIENTO',
    descripcion: 'Sintético J08', cantidad: '2', anchoMm: 1960, altoMm: 800 }).returning()
  primeraLinea ||= l.id
  const snapshot = datos.lineas[0].resultado as ResultadoCerramientoV1
  await db.insert(schema.lineasCerramiento).values({ lineaId: l.id, configuracion: { ...snapshot.configuracion } })
  await db.insert(schema.lineasCerramientoResultados).values({ lineaId: l.id, version: 1, resultado: { ...snapshot } })
  await db.insert(schema.lineasDespiece).values(datos.lineas[0].piezas.map(({ id: _id, ...pieza }) => ({ ...pieza, lineaId: l.id })))
  }
  return { id: p.id, lineaId: primeraLinea }
}
beforeAll(async () => {
  await db.insert(schema.articulos).values([...datos.articulos])
  const original = await insertar(0); id = original.id; lineaId = original.lineaId
  copiaId = (await insertar(1)).id
})
afterAll(async () => {
  try {
    for (const creado of ids) await db.delete(schema.presupuestos).where(eq(schema.presupuestos.id, creado))
    for (const articulo of datos.articulos) await db.delete(schema.articulos).where(eq(schema.articulos.codigo, articulo.codigo))
  } finally { await db.$client.end({ timeout: 5 }) }
})

it('lee20 piezas, flags y revisión por UUID sin escribir ni multiplicar dos veces', async () => {
  const antes = await db.select().from(schema.presupuestos).where(eq(schema.presupuestos.id, id))
  const leido = await cargarProduccion(db, id)
  expect(leido!.lineas[0].piezas).toHaveLength(20)
  const r = prepararProduccion(leido!, parametrosProduccion({}))
  expect(r.corte!.resumen.reduce((n, g) => n + g.nBarras, 0)).toBe(7)
  expect(r.planes.flatMap(g => g.plan.barras.flatMap(b => b.cortes))).toHaveLength(34)
  expect(await db.select().from(schema.presupuestos).where(eq(schema.presupuestos.id, id))).toEqual(antes)
  expect(await cargarProduccion(db, id)).toEqual(leido)
  const copia = await cargarProduccion(db, copiaId)
  expect(copia!.documento.revision).toBe(1)
  expect(copia!.lineas[0].id).not.toBe(lineaId)
  for (const c of prepararProduccion(copia!, parametrosProduccion({})).consumos) expect(c.referencia.documentoId).toBe(copiaId)
})

it('lee también residuo sin medidas y bloquea producción; no lo oculta mediante filtro SQL', async () => {
  const [residuo] = await db.insert(schema.lineasDespiece).values({ lineaId, articuloCodigo: datos.articulos[0].codigo, cantidad: '1' }).returning()
  try {
    const leido = await cargarProduccion(db, id)
    expect(leido!.lineas[0].piezas).toHaveLength(21)
    expect(prepararProduccion(leido!, parametrosProduccion({})).estado).toBe('NO_DISPONIBLE')
  } finally { await db.delete(schema.lineasDespiece).where(eq(schema.lineasDespiece.id, residuo.id)) }
})

it('MVCC mantiene cabecera y líneas anteriores cuando otro escritor confirma entre ambas lecturas', async () => {
  let resolverLectura!: () => void
  let liberar!: () => void
  const esperando = new Promise<void>(r => { resolverLectura = r })
  const continuar = new Promise<void>(r => { liberar = r })
  const instrumentado = new Proxy(db, { get(target, key) {
    if (key !== 'transaction') return Reflect.get(target, key)
    return (operacion: Parameters<typeof db.transaction>[0], opciones: Parameters<typeof db.transaction>[1]) => {
      expect(opciones).toEqual({ isolationLevel: 'repeatable read', accessMode: 'read only' })
      return db.transaction(tx => {
        let selects = 0
        const proxy = new Proxy(tx, { get(t, k) {
          if (k !== 'select') return Reflect.get(t, k)
          return (...args: Parameters<typeof tx.select>) => {
            const retrasar = ++selects === 2
            const envolver = (builder: object): object => new Proxy(builder, { get(b, prop) {
              const valor = Reflect.get(b, prop)
              if (prop === 'then' && retrasar) return async (ok: (v: unknown) => unknown, fallo: (e: unknown) => unknown) => {
                resolverLectura(); await continuar
                return valor.call(b, ok, fallo)
              }
              return typeof valor === 'function' ? (...a: unknown[]) => {
                const siguiente = valor.apply(b, a)
                return siguiente && typeof siguiente === 'object' ? envolver(siguiente) : siguiente
              } : valor
            } })
            return envolver(tx.select(...args))
          }
        } })
        return operacion(proxy)
      }, opciones)
    }
  } })
  const lectura = cargarProduccion(instrumentado, id)
  await esperando
  try {
    await db.transaction(async tx => {
      await tx.update(schema.presupuestos).set({ nombreLibre: 'QA J08 NUEVO' }).where(eq(schema.presupuestos.id, id))
      await tx.update(schema.lineas).set({ cantidad: '3' }).where(eq(schema.lineas.id, lineaId))
    })
  } finally { liberar() }
  const anterior = await lectura
  expect(anterior!.destinatario).toBe('QA J08 LECTURA')
  expect(anterior!.lineas[0].cantidad).toBe('2.00')
  const actual = await cargarProduccion(db, id)
  expect(actual!.destinatario).toBe('QA J08 NUEVO')
  expect(actual!.lineas[0].cantidad).toBe('3.00')
})

it('versión SQL de configuración discordante no permite emitir hojas', async () => {
  await db.update(schema.lineasCerramiento).set({ version: 2 }).where(eq(schema.lineasCerramiento.lineaId, lineaId))
  try {
    const leido = await cargarProduccion(db, id)
    expect(leido!.lineas[0].versionConfiguracion).toBe(2)
    const r = prepararProduccion(leido!, parametrosProduccion({}))
    expect(r.estado).toBe('NO_DISPONIBLE')
    expect(r.corte).toBeNull()
    expect(r.incidencias.some(i => i.detalle === 'Versión de configuración no válida')).toBe(true)
  } finally { await db.update(schema.lineasCerramiento).set({ version: 1 }).where(eq(schema.lineasCerramiento.lineaId, lineaId)) }
})

it('lee orden comercial7/12 desdeSQL y distingue SALÓN repetido también en otra revisión', async () => {
  const original = await insertar(2, [12, 7])
  const revision = await insertar(3, [12, 7])
  const a = await cargarProduccion(db, original.id)
  const b = await cargarProduccion(db, revision.id)
  for (const documento of [a!, b!]) {
    expect(documento.lineas.map(l => l.orden)).toEqual([7, 12])
    const r = prepararProduccion(documento, parametrosProduccion({}))
    expect(new Set(r.consumos.map(c => c.etiqueta)).size).toBe(40)
    for (const linea of documento.lineas) {
      const consumosLinea = r.consumos.filter(c => c.referencia.lineaId === linea.id)
      expect(consumosLinea).toHaveLength(20)
      expect(consumosLinea.every(c => c.etiqueta.startsWith(`Línea ${linea.orden} · SALÓN ·`))).toBe(true)
    }
    expect(r.consumos.every(c => c.referencia.documentoId === documento.id)).toBe(true)
  }
  expect(b!.lineas.every(l => !a!.lineas.some(origen => origen.id === l.id))).toBe(true)
  expect(b!.documento.revision).toBe(3)
})
