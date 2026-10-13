import { afterAll, describe, expect, it } from 'vitest'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { eq } from 'drizzle-orm'
import { altaCerramientoValorado } from './alta-valorada.ts'
import { actualizarCerramiento } from './editar-cerramiento.ts'
import { esquemaLinea } from '../lineas/esquema-linea.ts'
import { leerDocumentoOrigen } from '../copia/leer-origen.ts'

const db = crearDb(urlDePruebasValidada(process.env.TEST_DATABASE_URL))
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]
const rollback = new Error('rollback sintético de herrajes por defecto')
const serie = 'QA-DEFAULT-S', perfil = 'QA-DEFAULT-P', herraje = 'QA-DEFAULT-H'
afterAll(() => db.$client.end({ timeout: 5 }))

async function caso(verificar: (tx: Tx, presupuestoId: string) => Promise<void>) {
  try {
    await db.transaction(async tx => {
      await tx.insert(schema.estructuras).values({ codigo: '0', descripcion: 'Módulo SINTÉTICO' })
      await tx.insert(schema.conjuntos).values({ codigo: serie })
      await tx.insert(schema.conjuntoParametrosDespiece).values({ conjuntoCodigo: serie,
        herrajes: {}, manoObra: {}, grosorMaximoSimple: '10', grosorMaximoDoble: '20' })
      await tx.insert(schema.articulos).values([
        { codigo: perfil, descripcion: 'Perfil SINTÉTICO', tipoMetraje: 'ML' },
        { codigo: herraje, descripcion: 'Herraje SINTÉTICO', tipoMetraje: 'UD' },
      ])
      await tx.insert(schema.articulosDespiece).values([perfil, herraje].map(articuloCodigo => ({
        articuloCodigo, generico: false, dobleAcristalamiento: false, grosorAcristalar: '0', incrementosPrecio: false,
      })))
      await tx.insert(schema.articulosPvp).values([perfil, herraje].map(articuloCodigo => ({
        articuloCodigo, acabadoCodigo: 'UNI', tarifa: 1, precio: articuloCodigo === perfil ? '10' : '4',
      })))
      await tx.insert(schema.estructuraPlantillaCatalogo).values({ estructuraCodigo: '0',
        idPieza: 1, lineaOrigen: 1, cantidad: '1', tipoHoja: '-1', hoja: 0,
        gruposAdicionales: ['', '', '', ''], articulo: perfil, componente: '12', formulaLargo: 'L',
      })
      await tx.insert(schema.conjuntoAsociaciones).values({ id: 'QA-DEFAULT-ASOC', conjuntoCodigo: serie,
        articulo: herraje, cantidad: '1', acabado: '---A', intervalo: '0', medidaMin: '0', medidaMax: '0',
        unidadesMin: '0', unidadesMax: '0', tipoMedida: 'C', descuento: '0', soloUna: false,
        grupo: '!', componente: '12', apertura: 0, asociadoA: 'X', opcion: '1', noContrastado: [],
      })
      await tx.insert(schema.opcionesHerraje).values({ conjuntoCodigo: serie, opcionCodigo: '1',
        descripcion: 'Herraje de serie', porDefecto: true, oculta: false })
      const [p] = await tx.insert(schema.presupuestos).values({ numero: 989509, serie: 'QA-DEF',
        revision: 0, fecha: '2026-10-09', nombreLibre: 'QA defaults reversible', tarifa: 1 }).returning()
      await verificar(tx, p!.id)
      throw rollback
    })
  } catch (e) { if (e !== rollback) throw e }
}

const entrada = (presupuestoId: string) => esquemaLinea.parse({ presupuestoId, tipo: 'CERRAMIENTO',
  codigo: 'GRUPO', cantidad: 2, serieCodigo: serie, acabadoCodigo: 'UNI',
  configuracionCerramiento: JSON.stringify({ version: 1,
    modulos: [{ id: 'm1', estructuraCodigo: '0', anchoMm: 1000, altoMm: 1200 }], uniones: [] }),
})

describe('el configurador sin selector de herraje conserva los defaults de catálogo', () => {
  it('alta, lectura y edición incluyen el herraje y su precio', () => caso(async (tx, id) => {
    const datos = entrada(id)
    expect((await altaCerramientoValorado(tx, datos)).ok).toBe(true)
    const guardado = (await leerDocumentoOrigen(tx, id))!.lineas[0]!
    // 1,2 m a 10 + un herraje a 4 = 16 por unidad; cantidad 2.
    expect(guardado.linea).toMatchObject({ precioUnitario: '16.0000', total: '32.00', valoracionCompleta: true })
    expect(guardado.despiece.map(p => p.articuloCodigo)).toContain(herraje)
    expect(guardado.resultadoCerramiento?.origenes[0]?.opcionesHerraje).toEqual([
      { categoria: serie, opcionCodigo: '1', descripcion: 'Herraje de serie' },
    ])
    expect((await actualizarCerramiento(tx, { ...datos, lineaId: guardado.linea.id,
      configuracionSerializada: datos.configuracionCerramiento })).ok).toBe(true)
    const reabierto = (await leerDocumentoOrigen(tx, id))!.lineas[0]!
    expect(reabierto.linea).toMatchObject({ id: guardado.linea.id, precioUnitario: '16.0000', total: '32.00' })
    expect(reabierto.resultadoCerramiento).toEqual(guardado.resultadoCerramiento)
  }))

  it('un herraje predeterminado sin PVP deja toda la composición sin valorar', () => caso(async (tx, id) => {
    await tx.delete(schema.articulosPvp).where(eq(schema.articulosPvp.articuloCodigo, herraje))
    expect((await altaCerramientoValorado(tx, entrada(id))).ok).toBe(true)
    const guardado = (await leerDocumentoOrigen(tx, id))!.lineas[0]!
    expect(guardado.linea).toMatchObject({ precioUnitario: null, total: null, valoracionCompleta: false })
    expect(guardado.despiece.map(p => p.articuloCodigo)).toContain(herraje)
    expect(guardado.resultadoCerramiento?.ventaMateriales).toEqual({ completo: false, importe: null })
  }))
})
