import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { eq, inArray } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { altaLinea } from '../lineas/alta-linea.ts'
import { esquemaLinea } from '../lineas/esquema-linea.ts'
import { actualizarArticulo } from './edicion/editar.ts'
import { copiarPresupuesto } from '../copia/copiar-presupuesto.ts'
import { OPCIONES_COPIA_IDENTICA } from '../copia/plan-copia.ts'
import { MAPA_VACIO } from '../copia/mapa-sustitucion.ts'
import { cargarPresupuestoPdf } from '../../[id]/pdf/datos.ts'

const db = crearDb(urlDePruebasValidada(process.env.TEST_DATABASE_URL))
const identidad = randomUUID()
const tabla = `__ACAB_TABLA_${identidad}`, plano = `__ACAB_PLANO_${identidad}`
const codigos = [tabla, plano]
const documentos: string[] = []
const color = 'ACABADO-ELEGIDO'
let numero = 0

async function presupuesto() {
  const [p] = await db.insert(schema.presupuestos).values({ numero: ++numero, serie: `ACAB-${identidad}`,
    fecha: '2026-10-12', tarifa: 9301, nombreLibre: 'Acabado sintético', creadoPor: 'sintetico@aluminior.test' }).returning()
  documentos.push(p.id)
  return p.id
}
async function lineas(presupuestoId: string) {
  return db.select().from(schema.lineas).where(eq(schema.lineas.presupuestoId, presupuestoId))
}
async function documento(codigo = tabla, acabadoCodigo: string | null = color) {
  const presupuestoId = await presupuesto()
  const resultado = await altaLinea(db, esquemaLinea.parse({ presupuestoId, tipo: 'ARTICULO', codigo,
    acabadoCodigo: acabadoCodigo ?? undefined, cantidad: '2', referencia: 'Inicial', anchoMm: '850.25', altoMm: '1900.5' }))
  expect(resultado.ok).toBe(true)
  const [linea] = await lineas(presupuestoId)
  return { presupuestoId, linea }
}

beforeAll(async () => {
  await db.insert(schema.articulos).values(codigos.map(codigo => ({ codigo, descripcion: 'Artículo de color sintético', tipoMetraje: 'UD' })))
  await db.insert(schema.articulosDespiece).values(codigos.map(articuloCodigo => ({ articuloCodigo,
    generico: false, dobleAcristalamiento: false, grosorAcristalar: '0', incrementosPrecio: false,
    precioEnTabla: articuloCodigo === tabla,
    politicasPrecioTabla: { noMedidasInferiores: false, noMedidasSuperiores: false,
      soloMedidasAncho: false, soloMedidasLargo: false, noPrecioCero: false },
  })))
  await db.insert(schema.articulosPvp).values(codigos.map(articuloCodigo => ({ articuloCodigo,
    acabadoCodigo: 'UNI', tarifa: 9301, precio: '7.0000' })))
  await db.insert(schema.articulosPrecioTablaPvp).values({ articuloCodigo: tabla, acabadoCodigo: color,
    tarifa: 9301, anchoMm: '1000', largoMm: '2000', precio: '80.0000', acabadoDependiente: false })
})
afterAll(async () => {
  try {
    if (documentos.length) await db.delete(schema.presupuestos).where(inArray(schema.presupuestos.id, documentos))
    await db.delete(schema.articulosPrecioTablaPvp).where(inArray(schema.articulosPrecioTablaPvp.articuloCodigo, codigos))
    await db.delete(schema.articulosPvp).where(inArray(schema.articulosPvp.articuloCodigo, codigos))
    await db.delete(schema.articulosDespiece).where(inArray(schema.articulosDespiece.articuloCodigo, codigos))
    await db.delete(schema.articulos).where(inArray(schema.articulos.codigo, codigos))
  } finally { await db.$client.end({ timeout: 5 }) }
})

describe('acabado elegido del artículo: alta, lectura, PDF y copia', () => {
  it('el alta dimensional y la lectura PDF conservan el color elegido y las medidas', async () => {
    const { presupuestoId, linea } = await documento()
    expect(linea).toMatchObject({ acabadoArticuloCodigo: color, anchoMm: 850.25, altoMm: 1900.5,
      cantidad: '2.00', precioUnitario: '80.0000', total: '160.00' })
    expect((await cargarPresupuestoPdf(db, presupuestoId))?.lineas).toMatchObject([{
      acabadoArticuloCodigo: color, anchoMm: 850.25, altoMm: 1900.5, total: '160.00',
    }])
  })

  it('el precio genérico UNI conserva el color solicitado y no lo convierte en UNI', async () => {
    const { presupuestoId, linea } = await documento(plano)
    expect(linea).toMatchObject({ precioUnitario: '7.0000', total: '14.00', acabadoArticuloCodigo: color })
    expect((await cargarPresupuestoPdf(db, presupuestoId))?.lineas[0].acabadoArticuloCodigo).toBe(color)
  })

  it('cambiar cantidad y ubicación conserva acabado, medidas y precio guardados', async () => {
    const { presupuestoId, linea } = await documento()
    await db.update(schema.articulosPrecioTablaPvp).set({ precio: '900.0000' })
      .where(eq(schema.articulosPrecioTablaPvp.articuloCodigo, tabla))
    try {
      expect((await actualizarArticulo(db, { presupuestoId, lineaId: linea.id, cantidad: '3', referencia: 'Después' })).ok).toBe(true)
      expect(await lineas(presupuestoId)).toEqual([{ ...linea, cantidad: '3.00', referencia: 'Después', total: '240.00' }])
    } finally {
      await db.update(schema.articulosPrecioTablaPvp).set({ precio: '80.0000' })
        .where(eq(schema.articulosPrecioTablaPvp.articuloCodigo, tabla))
    }
  })

  it.each(['NUEVO_NUMERO', 'MISMO_NUMERO_NUEVA_REVISION'] as const)('la copia %s conserva la elección y el snapshot', async estrategia => {
    const { presupuestoId, linea } = await documento()
    const copiado = await copiarPresupuesto(db, { presupuestoId, destino: { estrategia },
      fecha: '2026-10-12', opciones: { ...OPCIONES_COPIA_IDENTICA, mapa: MAPA_VACIO } })
    expect(copiado.ok).toBe(true)
    if (!copiado.ok) return
    documentos.push(copiado.presupuestoId)
    const [nueva] = await lineas(copiado.presupuestoId)
    expect(nueva).toEqual({ ...linea, id: nueva.id, presupuestoId: copiado.presupuestoId })
    expect((await cargarPresupuestoPdf(db, copiado.presupuestoId))?.lineas[0].acabadoArticuloCodigo).toBe(color)
    expect(await lineas(presupuestoId)).toEqual([linea])
  })

  it('un artículo sin acabado elegido conserva null aunque tenga precio genérico', async () => {
    const { presupuestoId, linea } = await documento(plano, null)
    expect(linea.acabadoArticuloCodigo).toBeNull()
    expect((await cargarPresupuestoPdf(db, presupuestoId))?.lineas[0].acabadoArticuloCodigo).toBeNull()
  })

  it('el histórico sin columna informada no inventa acabado al leerlo ni copiarlo', async () => {
    const presupuestoId = await presupuesto()
    const [linea] = await db.insert(schema.lineas).values({ presupuestoId, tipo: 'ARTICULO', orden: 1,
      articuloCodigo: plano, descripcion: 'Histórico sintético sin color conocido', cantidad: '1',
      precioUnitario: '7', total: '7' }).returning()
    expect(linea.acabadoArticuloCodigo).toBeNull()
    expect((await cargarPresupuestoPdf(db, presupuestoId))?.lineas[0].acabadoArticuloCodigo).toBeNull()
    const copia = await copiarPresupuesto(db, { presupuestoId, destino: { estrategia: 'MISMO_NUMERO_NUEVA_REVISION' },
      fecha: '2026-10-12', opciones: { ...OPCIONES_COPIA_IDENTICA, mapa: MAPA_VACIO } })
    expect(copia.ok).toBe(true)
    if (!copia.ok) return
    documentos.push(copia.presupuestoId)
    expect((await lineas(copia.presupuestoId))[0].acabadoArticuloCodigo).toBeNull()
  })

  it('la restricción SQL impide aplicar el acabado de artículo a otro tipo de línea', async () => {
    const presupuestoId = await presupuesto()
    await expect(db.insert(schema.lineas).values({ presupuestoId, tipo: 'CERRAMIENTO', orden: 1,
      descripcion: 'Tipo ajeno sintético', acabadoArticuloCodigo: color })).rejects.toMatchObject({
      cause: { code: '23514', constraint_name: 'lineas_acabado_articulo_tipo_check' },
    })
    expect(await lineas(presupuestoId)).toEqual([])
  })
})
