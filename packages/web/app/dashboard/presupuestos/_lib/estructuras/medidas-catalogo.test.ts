import { describe, expect, it } from 'vitest'
import { valorarEstructura } from './valorar-estructura.ts'
import type { ClienteEscritura } from '../cliente-db.ts'
import { erroresMedidasCatalogo } from './medidas-catalogo.ts'
import { registrarCatalogoDiseno } from '@aluminior/core/estructuras'

describe('cotas de catálogo antes de valorar una estructura simple', () => {
  it('delega las cotas explícitas de instancia al catálogo económico, sin imponer FI estándar', () => {
    expect(erroresMedidasCatalogo({ codigo: 'C2FI', anchoMm: 1200, altoMm: 250,
      cotas: { FI: 100 } })).toBeNull()
  })

  it('señala el ancho cuando la cota imposible pertenece a una división vertical', () => {
    registrarCatalogoDiseno([{ codigo: 'QA-COTA-VERTICAL', descripcion: 'Cota sintética',
      familia: 'CATALOGO', anchoMm: 1000, altoMm: 1200, composicion: {
        tipo: 'division', id: 'qa', eje: 'vertical', separador: 'travesano',
        cotaFija: { desde: 'inicio', mm: 300 }, hijos: [
          { proporcion: 1, nodo: { tipo: 'hueco', id: 'qa-a', apertura: 'fijo' } },
          { proporcion: 1, nodo: { tipo: 'hueco', id: 'qa-b', apertura: 'fijo' } },
        ],
      } }])
    try {
      expect(erroresMedidasCatalogo({ codigo: 'QA-COTA-VERTICAL', anchoMm: 299, altoMm: 1200 }))
        .toEqual({ anchoMm: ['Las medidas no admiten las cotas de esta estructura.'] })
    } finally { registrarCatalogoDiseno([]) }
  })

  it.each([['C2FI', 300], ['C2FS', 299], ['C2FSFI', 600]] as const)(
    'rechaza %s de alto %s antes de consultar o guardar datos', async (codigo, altoMm) => {
      const db = new Proxy({}, { get() { throw new Error('No debe consultar DB') } }) as ClienteEscritura
      expect(await valorarEstructura(db, { codigo, anchoMm: 1200, altoMm,
        serieCodigo: 'GMC400', vidrioCodigo: 'V484', acabadoCodigo: 'L',
        varianteAcristalamiento: '2', tarifa: 1 })).toEqual({ ok: false,
        errores: { altoMm: ['Las medidas no admiten las cotas de esta estructura.'] } })
    })

  it.each(['C2FI', 'C2FS', 'C2FSFI'])(
    '%s admite geometría válida sin afirmar que tenga precio', codigo => {
      expect(erroresMedidasCatalogo({ codigo, anchoMm: 1200, altoMm: 1800 })).toBeNull()
    })
})
