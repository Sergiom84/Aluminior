import { describe, expect, it } from 'vitest'
import type { crearDb } from '@aluminior/db'
import { agruparCotasCatalogo, codigosDibujables, leerCotasCatalogoDiseno, type FilaCotaCatalogo } from './cotas-catalogo.ts'

const fila = (parcial: Partial<FilaCotaCatalogo> & Pick<FilaCotaCatalogo, 'estructuraCodigo' | 'simbolo'>): FilaCotaCatalogo => ({
  valorPorDefecto: '300.00', nombre: 'Fijo inferior', orientacion: 'V', ...parcial,
})

describe('catálogo de cotas del diseñador', () => {
  it('se queda con las dibujables y los símbolos de módulo, sin convertir el vacío en cero', () => {
    const agrupadas = agruparCotasCatalogo([
      fila({ estructuraCodigo: '2OFI', simbolo: 'fi', valorPorDefecto: '280.50', nombre: ' Fijo inferior ' }),
      fila({ estructuraCodigo: '2OFI', simbolo: 'FI', valorPorDefecto: '999', nombre: 'duplicada' }),
      fila({ estructuraCodigo: '2OFI', simbolo: 'TR', valorPorDefecto: '600', nombre: 'travesaño' }),
      fila({ estructuraCodigo: '2OFI', simbolo: 'FS', valorPorDefecto: null, nombre: '' }),
      fila({ estructuraCodigo: 'NO-DIBUJABLE', simbolo: 'FI', valorPorDefecto: '100' }),
      fila({ estructuraCodigo: '1FS', simbolo: 'TD', valorPorDefecto: '700.00', nombre: null, orientacion: ' H ' }),
    ], ['2OFI', '1FS', ''])

    expect(agrupadas).toEqual({
      '2OFI': [
        { simbolo: 'FI', nombre: 'Fijo inferior', valorPorDefecto: 280.5, orientacion: 'V' },
        { simbolo: 'FS', nombre: null, valorPorDefecto: null, orientacion: 'V' },
      ],
      '1FS': [
        { simbolo: 'TD', nombre: null, valorPorDefecto: 700, orientacion: 'H' },
      ],
    })
    expect(agrupadas['2OFI'][1].valorPorDefecto).not.toBe(0)
    expect(agrupadas).not.toHaveProperty('NO-DIBUJABLE')
  })

  it('lee todas las dibujables en una consulta y no consulta si no hay ninguna', async () => {
    const consultas: unknown[] = []
    const db = {
      select: () => ({
        from: () => ({
          where: (condicion: unknown) => {
            consultas.push(condicion)
            return Promise.resolve([
              fila({ estructuraCodigo: '2OFI', simbolo: 'FI', valorPorDefecto: '280' }),
              fila({ estructuraCodigo: 'OTRA', simbolo: 'FS' }),
            ])
          },
        }),
      }),
    } as unknown as Pick<ReturnType<typeof crearDb>, 'select'>

    expect(await leerCotasCatalogoDiseno(db, [])).toEqual({})
    expect(consultas).toHaveLength(0)
    expect(await leerCotasCatalogoDiseno(db, ['2OFI', '2OFI'])).toEqual({
      '2OFI': [{ simbolo: 'FI', nombre: 'Fijo inferior', valorPorDefecto: 280, orientacion: 'V' }],
    })
    expect(consultas).toHaveLength(1)
  })
})

describe('códigos dibujables', () => {
  it('incluye las plantillas verificadas aunque el catálogo importado venga vacío', () => {
    expect(codigosDibujables([])).toEqual(expect.arrayContaining(['C2FI', '1OFI', '2O']))
    expect(codigosDibujables([{ codigo: 'QA-IMP' }, { codigo: 'C2FI' }]).filter(c => c === 'C2FI')).toHaveLength(1)
    expect(codigosDibujables([{ codigo: 'QA-IMP' }])).toContain('QA-IMP')
  })
})
