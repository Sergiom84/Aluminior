import { describe, expect, it, vi } from 'vitest'
import { crearConfiguracionCerramiento, plantillaDiseno } from '@aluminior/core/estructuras'
import type { ClienteEscritura } from '../cliente-db.ts'
import { prepararAltaCerramiento } from './alta-cerramiento.ts'
import { AVISO_FI_SIN_VALORAR, prepararLineaValorada } from './preparar-linea-valorada.ts'

describe('valoración pendiente para FI explícito', () => {
  it('no consulta catálogo ni produce precio, despiece o subtotal', async () => {
    const configuracion = crearConfiguracionCerramiento(plantillaDiseno('1OFI')!)
    const alta = prepararAltaCerramiento({
      configuracionSerializada: JSON.stringify(configuracion),
      serieCodigo: 'SERIE-SINTETICA', vidrioCodigo: 'VIDRIO-SINTETICO',
      acabadoCodigo: 'ACABADO-SINTETICO', varianteAcristalamiento: '2',
    })
    if (!alta.ok) throw new Error('Fixture inválido')
    const execute = vi.fn(() => { throw new Error('no debe consultar base de datos') })

    const resultado = await prepararLineaValorada(
      { execute } as unknown as ClienteEscritura,
      alta.alta,
      { tarifa: 1, cantidad: 2, horasFabricacion: '1', horasColocacion: '1' },
    )

    expect(execute).not.toHaveBeenCalled()
    expect(resultado).toEqual({
      estado: 'FI_PENDIENTE', manoObra: [],
      importes: { precioUnitario: null, total: null, valoracionCompleta: false },
      aviso: AVISO_FI_SIN_VALORAR,
    })
  })
})
