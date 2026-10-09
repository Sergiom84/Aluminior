import { randomUUID } from 'node:crypto'
import { inArray } from 'drizzle-orm'
import { afterAll, expect, it } from 'vitest'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { crearConfiguracionCerramiento, plantillaDiseno } from '@aluminior/core/estructuras'
import { esquemaLinea } from '../lineas/esquema-linea.ts'
import { altaCerramientoValorado } from './alta-valorada.ts'
import { actualizarCerramiento } from './editar-cerramiento.ts'
import { leerDocumentoOrigen } from '../copia/leer-origen.ts'
import { copiarPresupuesto } from '../copia/copiar-presupuesto.ts'
import { OPCIONES_COPIA_IDENTICA } from '../copia/plan-copia.ts'
import { cargarPresupuestoPdf } from '../../[id]/pdf/datos.ts'
import { MAPA_VACIO } from '../copia/mapa-sustitucion.ts'

const db = crearDb(urlDePruebasValidada(process.env.TEST_DATABASE_URL))
afterAll(() => db.$client.end())
const configuracion = (alto: number) => {
  const c = crearConfiguracionCerramiento(plantillaDiseno('2O')!)
  c.modulos[0].anchoMm = 970.25
  c.modulos[0].altoMm = alto
  return c
}

it('alta, edición, lectura y copia conservan exteriores y snapshot sin inventar precio', async () => {
  const documentos: string[] = []
  try {
    const copiaId = await db.transaction(async tx => {
      const [p] = await tx.insert(schema.presupuestos).values({ numero: 989530, serie: `QA-DEC-${randomUUID()}`,
        revision: 0, fecha: '2026-10-09', nombreLibre: 'Medidas SINTÉTICAS', tarifa: 1 }).returning()
      documentos.push(p.id)
      const entrada = esquemaLinea.parse({ presupuestoId: p.id, codigo: 'GRUPO', tipo: 'CERRAMIENTO',
        configuracionCerramiento: JSON.stringify(configuracion(439.5)) })
      expect((await altaCerramientoValorado(tx, entrada)).ok).toBe(true)
      const original = (await leerDocumentoOrigen(tx, p.id))!.lineas[0]
      expect(original.linea).toMatchObject({ anchoMm: 970.25, altoMm: 439.5, precioUnitario: null, total: null })
      expect(original.cerramiento?.configuracion).toEqual(configuracion(439.5))

      expect((await actualizarCerramiento(tx, { ...entrada, lineaId: original.linea.id,
        configuracionSerializada: JSON.stringify(configuracion(1999.5)) })).ok).toBe(true)
      const editada = (await leerDocumentoOrigen(tx, p.id))!.lineas[0]
      expect(editada.linea).toMatchObject({ id: original.linea.id, anchoMm: 970.25, altoMm: 1999.5 })
      expect(editada.cerramiento?.configuracion).toEqual(configuracion(1999.5))
      const copia = await copiarPresupuesto(tx, { presupuestoId: p.id,
        destino: { estrategia: 'MISMO_NUMERO_NUEVA_REVISION' },
        opciones: { ...OPCIONES_COPIA_IDENTICA, mapa: MAPA_VACIO } })
      expect(copia.ok).toBe(true)
      if (!copia.ok) throw new Error(copia.errores.join(', '))
      documentos.push(copia.presupuestoId)
      const copiada = (await leerDocumentoOrigen(tx, copia.presupuestoId))!.lineas[0]
      expect(copiada.linea).toMatchObject({ anchoMm: 970.25, altoMm: 1999.5, precioUnitario: null, total: null })
      expect(copiada.cerramiento?.configuracion).toEqual(editada.cerramiento?.configuracion)
      return copia.presupuestoId
    })
    // El lector abre su propia vista MVCC: debe leer una fixture confirmada,
    // no un savepoint dentro de la transacción de escritura.
    const pdf = await cargarPresupuestoPdf(db, copiaId)
    expect(pdf?.lineas[0]).toMatchObject({ anchoMm: 970.25, altoMm: 1999.5 })
  } finally {
    if (documentos.length) await db.delete(schema.presupuestos)
      .where(inArray(schema.presupuestos.id, documentos))
  }
})
