import { afterAll, describe, expect, it } from 'vitest'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { eq, sql } from 'drizzle-orm'
import { guardarLinea } from '../lineas/guardar-linea.ts'
import { conPresupuestoBloqueado } from '../lineas/con-presupuesto-bloqueado.ts'
import { prepararAltaCerramiento } from './alta-cerramiento.ts'
import { actualizarCerramiento } from './editar-cerramiento.ts'
import { configuracionJ04 } from './catalogo-j04.fixture.ts'
import { leerDocumentoOrigen } from '../copia/leer-origen.ts'
import { copiarPresupuesto } from '../copia/copiar-presupuesto.ts'
import { OPCIONES_COPIA_IDENTICA } from '../copia/plan-copia.ts'
import { MAPA_VACIO } from '../copia/mapa-sustitucion.ts'

const db = crearDb(urlDePruebasValidada(process.env.TEST_DATABASE_URL))
const nombre = 'QA J05 CONCURRENCIA PROPIA'
const puerta = () => { let abrir!: () => void; const promesa = new Promise<void>(r => { abrir = r }); return { abrir, promesa } }
async function preparar(numero: number) {
  const [p] = await db.insert(schema.presupuestos).values({ numero, serie: 'J05C', fecha: '2026-09-08',
    nombreLibre: nombre, tarifa: 32760 }).returning()
  const entrada = { presupuestoId: p.id, configuracionSerializada: JSON.stringify(configuracionJ04()),
    serieCodigo: 'QA-J05-SIN-CATALOGO', vidrioCodigo: null, acabadoCodigo: null,
    varianteAcristalamiento: '1' as const, referencia: 'ANTES', cantidad: 1,
    horasFabricacion: '0', horasColocacion: '0' }
  const alta = prepararAltaCerramiento(entrada); if (!alta.ok) throw new Error('Geometría inválida')
  const lineaId = await guardarLinea(db, { tipo: 'CERRAMIENTO', cerramiento: alta.alta, manoObra: [],
    valores: { presupuestoId: p.id, descripcion: alta.alta.descripcion, cantidad: '1', precioUnitario: '100', total: '100' } })
  return { ...entrada, lineaId }
}
async function esperaBloqueo(pid: number) {
  for (let i = 0; i < 150; i++) {
    const filas = await db.execute<{ query: string }>(sql`SELECT query FROM pg_stat_activity WHERE ${pid} = ANY(pg_blocking_pids(pid))`)
    if (filas.length) return filas.map(f => f.query).join('\n')
    await new Promise(r => setTimeout(r, 10))
  }
  throw new Error('No se observó el bloqueo PostgreSQL esperado')
}
afterAll(async () => {
  await db.delete(schema.presupuestos).where(eq(schema.presupuestos.nombreLibre, nombre))
  await db.$client.end()
})

describe('J05 concurrencia con bloqueo PostgreSQL observado', () => {
  it('edición espera cabecera del alta y no pierde su subtotal al quedar incompleta', async () => {
    const e = await preparar(989506), lista = puerta(), liberar = puerta()
    let pid = 0
    const alta = conPresupuestoBloqueado(db, e.presupuestoId, async tx => {
      const filas = await tx.execute<{ pid: number }>(sql`SELECT pg_backend_pid() AS pid`); pid = filas[0].pid
      await guardarLinea(tx, { tipo: 'ARTICULO', valores: { presupuestoId: e.presupuestoId,
        descripcion: 'UD concurrente', cantidad: '1', precioUnitario: '20', total: '20' } })
      lista.abrir(); await liberar.promesa
    })
    await lista.promesa
    const edicion = actualizarCerramiento(db, { ...e, referencia: 'DESPUÉS', cantidad: 3 })
    try { expect(await esperaBloqueo(pid)).toMatch(/FOR UPDATE/i) }
    finally { liberar.abrir(); await Promise.allSettled([alta, edicion]) }
    expect((await edicion).ok).toBe(true)
    const d = await leerDocumentoOrigen(db, e.presupuestoId)
    expect(d?.presupuesto.subtotal).toBe('20.00')
    expect(d?.lineas.map(l => l.linea.orden)).toEqual([1, 2])
    expect(d?.lineas[0].linea).toMatchObject({ total: null, cantidad: '3.00', referencia: 'DESPUÉS' })
  }, 15000)
  it('copia espera edición y relee línea, configuración y snapshot después del commit', async () => {
    const e = await preparar(989507), lista = puerta(), liberar = puerta()
    let pid = 0
    const cfg = configuracionJ04(); cfg.modulos[0].anchoMm = 900
    const edicion = conPresupuestoBloqueado(db, e.presupuestoId, async tx => {
      const filas = await tx.execute<{ pid: number }>(sql`SELECT pg_backend_pid() AS pid`); pid = filas[0].pid
      await actualizarCerramiento(tx, { ...e, referencia: 'REVISADO', cantidad: 3,
        configuracionSerializada: JSON.stringify(cfg) })
      lista.abrir(); await liberar.promesa
    })
    await lista.promesa
    const copia = copiarPresupuesto(db, { presupuestoId: e.presupuestoId,
      destino: { estrategia: 'MISMO_NUMERO_NUEVA_REVISION' }, opciones: { ...OPCIONES_COPIA_IDENTICA, mapa: MAPA_VACIO } })
    try { expect(await esperaBloqueo(pid)).toMatch(/FOR UPDATE/i) }
    finally { liberar.abrir(); await Promise.allSettled([edicion, copia]) }
    const r = await copia; expect(r.ok).toBe(true); if (!r.ok) throw new Error('Copia falló')
    const d = await leerDocumentoOrigen(db, r.presupuestoId)
    const origen = await leerDocumentoOrigen(db, e.presupuestoId)
    expect(d?.lineas[0].linea).toMatchObject({ referencia: 'REVISADO', cantidad: '3.00', total: null })
    expect(d?.lineas[0].cerramiento?.configuracion).toEqual(cfg)
    expect(d?.lineas[0].resultadoCerramiento).toEqual(origen?.lineas[0].resultadoCerramiento)
    expect(d?.lineas[0].resultadoCerramiento?.configuracion).toEqual(cfg)
  }, 15000)
})
