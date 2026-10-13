import { randomUUID } from 'node:crypto'
import { afterAll, describe, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { presupuestoIncompleto, type PoliticasPrecioTabla } from '@aluminior/core/precios'
import { valorarArticulo } from './valorar-articulo.ts'
import { actualizarArticulo } from './edicion/editar.ts'
import { altaLinea } from '../lineas/alta-linea.ts'
import { esquemaLinea } from '../lineas/esquema-linea.ts'

const db = crearDb(urlDePruebasValidada(process.env.TEST_DATABASE_URL))
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]
const CODIGO = '__ARTICULO_TABLA_SINTETICO'
const rollback = new Error('ROLLBACK_ARTICULO_TABLA')
const politicas: PoliticasPrecioTabla = {
  noMedidasInferiores: false, noMedidasSuperiores: false,
  soloMedidasAncho: false, soloMedidasLargo: false, noPrecioCero: false,
}
interface Configuracion {
  tipoMetraje?: string
  precioEnTabla?: boolean | null
  sinMetadatos?: boolean
  politicas?: PoliticasPrecioTabla | null
  precio?: string
}

async function caso(verificar: (tx: Tx, presupuestoId: string) => Promise<void>, config: Configuracion = {}) {
  try {
    await db.transaction(async tx => {
      await tx.insert(schema.articulos).values({ codigo: CODIGO, descripcion: 'Artículo dimensional sintético',
        tipoMetraje: config.tipoMetraje ?? 'UD' })
      if (!config.sinMetadatos) await tx.insert(schema.articulosDespiece).values({
        articuloCodigo: CODIGO, generico: false, dobleAcristalamiento: false,
        grosorAcristalar: '0', incrementosPrecio: false,
        precioEnTabla: config.precioEnTabla === undefined ? true : config.precioEnTabla,
        politicasPrecioTabla: config.politicas === undefined ? politicas : config.politicas,
      })
      await tx.insert(schema.articulosPvp).values([
        { articuloCodigo: CODIGO, acabadoCodigo: 'ACABADO-A', tarifa: 9201, precio: '1.2000' },
        { articuloCodigo: CODIGO, acabadoCodigo: 'UNI', tarifa: 9201, precio: '99.0000' },
        { articuloCodigo: CODIGO, acabadoCodigo: 'ACABADO-B', tarifa: 9201, precio: '98.0000' },
        { articuloCodigo: CODIGO, acabadoCodigo: 'ACABADO-A', tarifa: 9202, precio: '97.0000' },
      ])
      await tx.insert(schema.articulosPrecioTablaPvp).values([
        { articuloCodigo: CODIGO, acabadoCodigo: 'ACABADO-A', tarifa: 9201,
          anchoMm: '1000', largoMm: '2000', precio: config.precio ?? '80.0000', acabadoDependiente: false },
        { articuloCodigo: CODIGO, acabadoCodigo: 'ACABADO-A', tarifa: 9201,
          anchoMm: '1500', largoMm: '2000', precio: '120.0000', acabadoDependiente: false },
      ])
      const [presupuesto] = await tx.insert(schema.presupuestos).values({ numero: 1,
        serie: `ARTTAB-${randomUUID()}`, fecha: '2026-10-12', tarifa: 9201,
        nombreLibre: 'Documento sintético', creadoPor: 'sintetico@aluminior.test' }).returning({ id: schema.presupuestos.id })
      await verificar(tx, presupuesto.id)
      throw rollback
    })
  } catch (error) { if (error !== rollback) throw error }
}
afterAll(async () => { await db.$client.end({ timeout: 5 }) })

const valorar = (tx: Tx, cambios: Partial<Parameters<typeof valorarArticulo>[1]> = {}) =>
  valorarArticulo(tx as unknown as Parameters<typeof valorarArticulo>[0], {
    codigo: CODIGO, tarifa: 9201, acabadoCodigo: 'ACABADO-A', anchoMm: 850.25, altoMm: 1900.5, ...cambios,
  })
const alta = (tx: Tx, presupuestoId: string, cambios: Record<string, unknown> = {}) => altaLinea(
  tx as unknown as Parameters<typeof altaLinea>[0], esquemaLinea.parse({
    presupuestoId, solicitudId: randomUUID(), tipo: 'ARTICULO', codigo: CODIGO,
    cantidad: '2', acabadoCodigo: 'ACABADO-A', anchoMm: '850.25', altoMm: '1900.5', ...cambios,
  }),
)

async function leer(tx: Tx, presupuestoId: string) {
  return tx.select().from(schema.lineas).where(eq(schema.lineas.presupuestoId, presupuestoId))
}

describe('artículo suelto con PVP dimensional: SQL y persistencia real', () => {
  it('valora el escalón de tabla por unidad y conserva el acabado exacto', async () => {
    await caso(async tx => {
      expect(await valorar(tx)).toEqual({ ok: true, descripcion: 'Artículo dimensional sintético',
        precioUnitario: '80.0000', aviso: null, acabadoAplicado: 'ACABADO-A' })
      expect(await valorar(tx, { anchoMm: 1000.01 })).toMatchObject({ ok: true, precioUnitario: '120.0000' })
    })
  })

  it.each([
    { anchoMm: null, altoMm: null }, { anchoMm: 1500.01 }, { altoMm: 2000.01 },
    { acabadoCodigo: null }, { acabadoCodigo: 'ACABADO-B' }, { tarifa: 9202 },
  ])('sin medida o clave compatible no vuelve al PVP plano: %j', async cambios => {
    await caso(async tx => {
      const resultado = await valorar(tx, cambios)
      expect(resultado).toMatchObject({ ok: true, precioUnitario: null, acabadoAplicado: null })
      expect(resultado.ok && resultado.aviso).toContain('Importe incompleto:')
    })
  })

  it.each([
    { precioEnTabla: null }, { sinMetadatos: true }, { politicas: null },
    { politicas: { ...politicas, noMedidasSuperiores: true } },
    { politicas: { ...politicas, soloMedidasLargo: undefined } },
  ])('configuración desconocida o fuera de soporte conserva precio nulo: %j', async config => {
    await caso(async tx => {
      expect(await valorar(tx)).toMatchObject({ ok: true, precioUnitario: null })
    }, config)
  })

  it('la marca false mantiene la tarifa ordinaria', async () => {
    await caso(async tx => {
      expect(await valorar(tx)).toMatchObject({ ok: true, precioUnitario: '1.2000', aviso: null })
    }, { precioEnTabla: false })
  })

  it.each(['ML', 'M2'])('%s ordinario sigue sin regla de metraje aunque capture medidas', async tipoMetraje => {
    await caso(async tx => {
      expect(await valorar(tx)).toMatchObject({ ok: true, precioUnitario: null })
    }, { tipoMetraje, precioEnTabla: false })
  })

  it('guarda medidas fraccionarias, precio de pieza y total por cantidad; una relectura los conserva', async () => {
    await caso(async (tx, presupuestoId) => {
      expect(await alta(tx, presupuestoId)).toEqual({ ok: true, id: presupuestoId, mensaje: undefined })
      expect(await leer(tx, presupuestoId)).toMatchObject([{ articuloCodigo: CODIGO, tipo: 'ARTICULO', acabadoArticuloCodigo: 'ACABADO-A',
        anchoMm: 850.25, altoMm: 1900.5, cantidad: '2.00', precioUnitario: '80.0000', total: '160.00',
        valoracionCompleta: true, avisoValoracion: null }])
      const [cabecera] = await tx.select().from(schema.presupuestos).where(eq(schema.presupuestos.id, presupuestoId))
      expect(cabecera).toMatchObject({ subtotal: '160.00', total: '193.60' })
      expect(presupuestoIncompleto(await leer(tx, presupuestoId))).toBe(false)
    })
  })

  it('editar cantidad conserva medidas y PVP guardados aunque la tabla cambie', async () => {
    await caso(async (tx, presupuestoId) => {
      await alta(tx, presupuestoId)
      const [antes] = await leer(tx, presupuestoId)
      await tx.update(schema.articulosPrecioTablaPvp).set({ precio: '900.0000' })
        .where(eq(schema.articulosPrecioTablaPvp.articuloCodigo, CODIGO))
      expect((await actualizarArticulo(tx, { presupuestoId, lineaId: antes.id, cantidad: '3', referencia: 'Después' })).ok).toBe(true)
      expect(await leer(tx, presupuestoId)).toEqual([{ ...antes, cantidad: '3.00', referencia: 'Después', total: '240.00' }])
    })
  })

  it.each([undefined, ''])('guarda medidas vacías (%s) como ausencia y precio/total nulos', async medida => {
    await caso(async (tx, presupuestoId) => {
      expect((await alta(tx, presupuestoId, { anchoMm: medida, altoMm: medida })).ok).toBe(true)
      expect(await leer(tx, presupuestoId)).toMatchObject([{ anchoMm: null, altoMm: null,
        precioUnitario: null, total: null, valoracionCompleta: false }])
      expect(presupuestoIncompleto(await leer(tx, presupuestoId))).toBe(true)
    })
  })

  it('guarda un cero explícito de tabla como precio encontrado, distinto de ausencia', async () => {
    await caso(async (tx, presupuestoId) => {
      expect((await alta(tx, presupuestoId)).ok).toBe(true)
      expect(await leer(tx, presupuestoId)).toMatchObject([{ precioUnitario: '0.0000', total: '0.00', valoracionCompleta: true }])
      expect(presupuestoIncompleto(await leer(tx, presupuestoId))).toBe(false)
    }, { precio: '0.0000' })
  })

  it('un código desconocido no crea línea ni altera los totales', async () => {
    await caso(async (tx, presupuestoId) => {
      const cabeceraAntes = await tx.select().from(schema.presupuestos).where(eq(schema.presupuestos.id, presupuestoId))
      expect(await alta(tx, presupuestoId, { codigo: '__ARTICULO_INEXISTENTE' })).toEqual({
        ok: false, errores: { codigo: ['Artículo no encontrado'] },
      })
      expect(await leer(tx, presupuestoId)).toEqual([])
      expect(await tx.select().from(schema.presupuestos).where(eq(schema.presupuestos.id, presupuestoId))).toEqual(cabeceraAntes)
    })
  })
})
