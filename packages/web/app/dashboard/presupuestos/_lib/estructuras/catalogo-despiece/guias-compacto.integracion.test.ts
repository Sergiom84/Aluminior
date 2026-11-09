import { afterAll, describe, expect, it } from 'vitest'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { leerPerfilesGuia, listarGuiasCompacto } from './guias-compacto.ts'

const db = crearDb(urlDePruebasValidada(process.env.TEST_DATABASE_URL))
const rollback = new Error('rollback del ensayo de guías')
afterAll(() => db.$client.end({ timeout: 5 }))

describe('guías de persiana del compacto', () => {
  it('lista los conjuntos 051 con su perfil y resuelve el conjunto o el perfil antiguo', async () => {
    try {
      await db.transaction(async (tx) => {
        await tx.insert(schema.articulos).values([
          { codigo: 'QA-GP1', descripcion: 'GUIA QA 110 MM', tipoMetraje: 'ML' },
          { codigo: 'QA-GP2', descripcion: 'GUIA QA SIN PRECIO', tipoMetraje: 'ML' },
        ]).onConflictDoNothing()
        await tx.insert(schema.articulosPvp).values({ articuloCodigo: 'QA-GP1', acabadoCodigo: 'L', tarifa: 1, precio: '10' })
        await tx.insert(schema.conjuntoResoluciones).values([
          { conjuntoCodigo: 'QAG01', componente: 'GP', familia: '051', articuloCodigo: 'QA-GP1' },
          { conjuntoCodigo: 'QAG02', componente: 'GP', familia: '051', articuloCodigo: '0' },
          { conjuntoCodigo: 'QAG03', componente: 'GP', familia: '001', articuloCodigo: 'QA-GP1' },
          { conjuntoCodigo: 'QAG04', componente: 'GP', familia: '051', articuloCodigo: 'QA-GP2' },
        ])
        const lista = (await listarGuiasCompacto(tx, 1)).filter((g) => g.codigo.startsWith('QAG'))
        expect(lista).toEqual([
          { codigo: 'QAG01', descripcion: 'GUIA QA 110 MM', sinPrecio: false },
          { codigo: 'QAG04', descripcion: 'GUIA QA SIN PRECIO', sinPrecio: true },
        ])
        expect((await listarGuiasCompacto(tx, 2)).find((g) => g.codigo === 'QAG01')?.sinPrecio).toBe(true)
        const perfiles = await leerPerfilesGuia(tx, ['qag01', 'QA-GP1', 'QAG02', ''])
        expect(perfiles.get('QAG01')).toBe('QA-GP1')
        expect(perfiles.get('QA-GP1')).toBe('QA-GP1')
        expect(perfiles.has('QAG02')).toBe(false)
        expect(perfiles.has('QAG03')).toBe(false)
        expect(await leerPerfilesGuia(tx, [])).toEqual(new Map())
        throw rollback
      })
    } catch (e) { if (e !== rollback) throw e }
  })
})
