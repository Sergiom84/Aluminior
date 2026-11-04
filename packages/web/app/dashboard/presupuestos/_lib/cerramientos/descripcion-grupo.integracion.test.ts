import { randomUUID } from 'node:crypto'
import { inArray } from 'drizzle-orm'
import { afterAll, expect, it } from 'vitest'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { crearConfiguracionCerramiento, esConfiguracionCerramiento, plantillaDiseno } from '@aluminior/core/estructuras'
import { esquemaLinea } from '../lineas/esquema-linea.ts'
import { altaCerramientoValorado } from './alta-valorada.ts'
import { actualizarCerramiento } from './editar-cerramiento.ts'
import { leerDocumentoOrigen } from '../copia/leer-origen.ts'
import { copiarPresupuesto } from '../copia/copiar-presupuesto.ts'
import { OPCIONES_COPIA_IDENTICA } from '../copia/plan-copia.ts'
import { MAPA_VACIO } from '../copia/mapa-sustitucion.ts'

const db = crearDb(urlDePruebasValidada(process.env.TEST_DATABASE_URL))
afterAll(async () => {
  await db.delete(schema.articulos).where(inArray(schema.articulos.codigo, ['QA-D1-VID']))
  await db.delete(schema.acabados).where(inArray(schema.acabados.codigo, ['QA-D1-L']))
  await db.delete(schema.estructuras).where(inArray(schema.estructuras.codigo, ['QA-D1-COMP']))
  await db.$client.end()
})

const ANTIGUA = 'QA-D1 DESCRIPCION ANTIGUA'

function configuracion(ancho: number, alto: number) {
  const base = crearConfiguracionCerramiento(plantillaDiseno('2O')!)
  return {
    ...base,
    version: 3 as const,
    modulos: [{
      ...base.modulos[0],
      anchoMm: ancho,
      altoMm: alto,
      compacto: { estructuraCodigo: 'QA-D1-COMP', altoCajonMm: 155 },
    }],
  }
}

function assertDescripcionNueva(texto: string, ancho: string, alto: string) {
  expect(texto).toContain(`DE MEDIDAS : ${ancho} x ${alto}`)
  expect(texto).toContain('EN COLOR QA-D1 blanco')
  expect(texto).toContain('QA-D1-SERIE')
  expect(texto).toContain('QA-D1 vidrio')
  expect(texto).toContain('QA-D1 cajón')
  expect(texto).not.toContain('CERRAMIENTO SEGÚN DIBUJO')
  expect(texto.endsWith(' ')).toBe(false)
}

it('alta, edición y copia guardan la descripción generada y no reescriben la antigua', async () => {
  expect(esConfiguracionCerramiento(configuracion(1200, 1200))).toBe(true)
  const documentos: string[] = []
  const serie = `QA-D1-${randomUUID()}`
  try {
    await db.delete(schema.articulos).where(inArray(schema.articulos.codigo, ['QA-D1-VID']))
    await db.delete(schema.acabados).where(inArray(schema.acabados.codigo, ['QA-D1-L']))
    await db.delete(schema.estructuras).where(inArray(schema.estructuras.codigo, ['QA-D1-COMP']))
    await db.insert(schema.acabados).values({ codigo: 'QA-D1-L', descripcion: 'QA-D1 blanco' }).onConflictDoNothing()
    await db.insert(schema.articulos).values({ codigo: 'QA-D1-VID', descripcion: 'QA-D1 vidrio', tipoMetraje: 'M2' }).onConflictDoNothing()
    await db.insert(schema.estructuras).values({ codigo: 'QA-D1-COMP', descripcion: 'QA-D1 cajón', esAccesorio: true }).onConflictDoNothing()

    const [presupuesto] = await db.insert(schema.presupuestos).values({
      numero: 989531, serie, revision: 0, fecha: '2026-11-04', nombreLibre: 'QA-D1 descripción', tarifa: 1,
    }).returning()
    documentos.push(presupuesto.id)

    const [antigua] = await db.insert(schema.lineas).values({
      presupuestoId: presupuesto.id, orden: 1, tipo: 'CERRAMIENTO', descripcion: ANTIGUA, cantidad: '1',
      anchoMm: 800, altoMm: 800,
    }).returning()
    await db.insert(schema.lineasCerramiento).values({
      lineaId: antigua.id, version: 1,
      configuracion: crearConfiguracionCerramiento(plantillaDiseno('0')!) as unknown as Record<string, unknown>,
      serieCodigo: 'QA-D1-SERIE', vidrioCodigo: 'QA-D1-VID', acabadoCodigo: 'QA-D1-L',
    })

    const entrada = esquemaLinea.parse({
      presupuestoId: presupuesto.id, codigo: 'GRUPO', tipo: 'CERRAMIENTO',
      serieCodigo: 'QA-D1-SERIE', vidrioCodigo: 'QA-D1-VID', acabadoCodigo: 'QA-D1-L',
      configuracionCerramiento: JSON.stringify(configuracion(1200, 1200)),
    })
    expect((await altaCerramientoValorado(db, entrada)).ok).toBe(true)
    const trasAlta = (await leerDocumentoOrigen(db, presupuesto.id))!.lineas
    expect(trasAlta[0].linea.descripcion).toBe(ANTIGUA)
    assertDescripcionNueva(trasAlta[1].linea.descripcion, '1.200,0', '1.200,0')

    expect((await actualizarCerramiento(db, {
      ...entrada, lineaId: trasAlta[1].linea.id,
      configuracionSerializada: JSON.stringify(configuracion(970, 1999.5)),
    })).ok).toBe(true)
    const trasEdicion = (await leerDocumentoOrigen(db, presupuesto.id))!.lineas
    expect(trasEdicion[0].linea.descripcion).toBe(ANTIGUA)
    assertDescripcionNueva(trasEdicion[1].linea.descripcion, '970,0', '1.999,5')
    expect(trasEdicion[1].linea.descripcion).not.toContain('1.200,0')

    const regenerada = await copiarPresupuesto(db, {
      presupuestoId: presupuesto.id,
      destino: { estrategia: 'MISMO_NUMERO_NUEVA_REVISION' },
      opciones: { ...OPCIONES_COPIA_IDENTICA, mapa: MAPA_VACIO, regenerarDescripcion: true },
    })
    expect(regenerada.ok).toBe(true)
    if (!regenerada.ok) throw new Error(regenerada.errores.join(', '))
    documentos.push(regenerada.presupuestoId)
    const copiaNueva = (await leerDocumentoOrigen(db, regenerada.presupuestoId))!.lineas
    expect(copiaNueva[0].linea.descripcion).toContain('DE MEDIDAS :')
    expect(copiaNueva[0].linea.descripcion).not.toBe(ANTIGUA)
    assertDescripcionNueva(copiaNueva[1].linea.descripcion, '970,0', '1.999,5')

    const conservada = await copiarPresupuesto(db, {
      presupuestoId: presupuesto.id,
      destino: { estrategia: 'MISMO_NUMERO_NUEVA_REVISION' },
      opciones: { ...OPCIONES_COPIA_IDENTICA, mapa: MAPA_VACIO },
    })
    expect(conservada.ok).toBe(true)
    if (!conservada.ok) throw new Error(conservada.errores.join(', '))
    documentos.push(conservada.presupuestoId)
    const copiaAntigua = (await leerDocumentoOrigen(db, conservada.presupuestoId))!.lineas
    expect(copiaAntigua[0].linea.descripcion).toBe(ANTIGUA)
    expect(copiaAntigua[1].linea.descripcion).toBe(trasEdicion[1].linea.descripcion)
    const origenTrasCopias = (await leerDocumentoOrigen(db, presupuesto.id))!.lineas
    expect(origenTrasCopias[0].linea.descripcion).toBe(ANTIGUA)
    expect(origenTrasCopias[1].linea.descripcion).toBe(trasEdicion[1].linea.descripcion)
  } finally {
    if (documentos.length) await db.delete(schema.presupuestos).where(inArray(schema.presupuestos.id, documentos))
  }
})
