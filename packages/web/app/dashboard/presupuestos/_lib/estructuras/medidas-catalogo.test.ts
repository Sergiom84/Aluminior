import { describe, expect, it } from 'vitest'
import { valorarEstructura } from './valorar-estructura.ts'
import type { ClienteEscritura } from '../cliente-db.ts'
import { erroresMedidasCatalogo } from './medidas-catalogo.ts'

describe('cotas de catálogo antes de valorar una estructura simple', () => {
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
