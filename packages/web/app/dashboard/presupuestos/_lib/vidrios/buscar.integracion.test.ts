import { afterAll, describe, expect, it } from 'vitest'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { buscarVidriosCatalogo } from './buscar.ts'

const db = crearDb(urlDePruebasValidada(process.env.TEST_DATABASE_URL))
const rollback = new Error('rollback catálogo sintético')
afterAll(() => db.$client.end({ timeout: 5 }))

describe('buscador de vidrio del catálogo', () => {
  it('busca fragmentos, acentos y código, excluyendo otras familias e inactivos', async () => {
    try {
      await db.transaction(async tx => {
        await tx.insert(schema.familias).values({ codigo: '050', descripcion: 'Vidrio sintético' }).onConflictDoNothing()
        await tx.insert(schema.articulos).values([
          { codigo: 'QA-VID-01', descripcion: 'Sintético Cámara argón premium', familiaCodigo: '050', tipoMetraje: 'M2' },
          { codigo: 'QA-VID-02', descripcion: 'Sintético Panel opaco', familiaCodigo: '050', tipoMetraje: 'M2' },
          { codigo: 'QA-VID-03', descripcion: 'Sintético Cámara argón premium', familiaCodigo: '050', activo: false },
          { codigo: 'QA-VID-04', descripcion: 'Sintético Cámara argón premium', familiaCodigo: null },
        ])
        expect((await buscarVidriosCatalogo(tx, 'premium cam arg sint')).map(v => v.codigo)).toEqual(['QA-VID-01'])
        expect((await buscarVidriosCatalogo(tx, 'qa-vid-0')).map(v => v.codigo)).toEqual(['QA-VID-01', 'QA-VID-02'])
        expect((await buscarVidriosCatalogo(tx, 'sint% _panel')).map(v => v.codigo)).toEqual(['QA-VID-02'])
        expect(await buscarVidriosCatalogo(tx, 'codigo-inexistente')).toEqual([])
        throw rollback
      })
    } catch (e) { if (e !== rollback) throw e }
  })
})
