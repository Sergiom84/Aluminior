import { describe, expect, it } from 'vitest'
import { schema } from '@aluminior/db'
import {
  anadirModuloCerramiento, crearConfiguracionCerramiento, plantillaDiseno, UNIONES_VISUALES,
} from '@aluminior/core/estructuras'
import type { ClienteEscritura } from '../cliente-db.ts'
import {
  AVISO_VALORACION_PENDIENTE, guardarAltaCerramiento, prepararAltaCerramiento,
} from './alta-cerramiento.ts'

const configuracion = anadirModuloCerramiento(
  crearConfiguracionCerramiento(plantillaDiseno('2O')!),
  plantillaDiseno('2O')!,
  UNIONES_VISUALES.find((union) => union.codigo === 'PSU001')!,
)

const datos = {
  configuracionSerializada: JSON.stringify(configuracion),
  serieCodigo: 'ELEGANTPVC',
  vidrioCodigo: 'V420AGS4',
  acabadoCodigo: 'L',
  varianteAcristalamiento: '2' as const,
  ajusteFabricacion: 25,
  ajusteColocacion: 40,
}

/**
 * Cliente de escritura de mentira. Sirve para comprobar que el módulo escribe
 * SIEMPRE por el cliente que recibe —nunca abriendo el suyo— y que no se traga
 * el fallo de la inserción.
 */
function clienteEspia(fallar = false) {
  const escrituras: { tabla: unknown; valores: Record<string, unknown> }[] = []
  const cliente = {
    insert: (tabla: unknown) => ({
      values: async (valores: Record<string, unknown>) => {
        escrituras.push({ tabla, valores })
        if (fallar) throw new Error('duplicate key value violates unique constraint')
      },
    }),
  }
  return { cliente: cliente as unknown as ClienteEscritura, escrituras }
}

describe('alta de cerramiento', () => {
  it('deriva descripción, medidas y ausencia de precio de la composición', () => {
    const resultado = prepararAltaCerramiento(datos)
    expect(resultado.ok).toBe(true)
    if (!resultado.ok) return
    expect(resultado.alta.descripcion).toBe('CERRAMIENTO SEGÚN DIBUJO · 2O + 2O')
    expect(resultado.alta.anchoMm).toBe(2500)
    expect(resultado.alta.altoMm).toBe(1200)
    expect(resultado.alta.precioUnitario).toBeNull()
    expect(resultado.alta.aviso).toBe(AVISO_VALORACION_PENDIENTE)
  })

  it('rechaza la composición antes de tocar la base de datos', () => {
    const manipulada = prepararAltaCerramiento({
      ...datos,
      configuracionSerializada: JSON.stringify({ ...configuracion, uniones: [] }),
    })
    expect(manipulada).toEqual({
      ok: false,
      errores: { configuracionCerramiento: ['La composición del cerramiento no es válida'] },
    })
    expect(prepararAltaCerramiento({ ...datos, configuracionSerializada: null }).ok).toBe(false)
  })

  it('escribe una sola fila satélite, por el cliente recibido y sin perder campos', async () => {
    const preparado = prepararAltaCerramiento(datos)
    if (!preparado.ok) throw new Error('preparación rechazada')
    const { cliente, escrituras } = clienteEspia()
    await guardarAltaCerramiento(cliente, 'linea-1', preparado.alta)

    expect(escrituras).toHaveLength(1)
    expect(escrituras[0].tabla).toBe(schema.lineasCerramiento)
    expect(escrituras[0].valores).toEqual({
      lineaId: 'linea-1',
      version: 1,
      configuracion,
      serieCodigo: 'ELEGANTPVC',
      vidrioCodigo: 'V420AGS4',
      acabadoCodigo: 'L',
      varianteAcristalamiento: '2',
      ajusteFabricacion: '25',
      ajusteColocacion: '40',
    })
  })

  it('propaga el fallo de la escritura para que la transacción se deshaga', async () => {
    const preparado = prepararAltaCerramiento(datos)
    if (!preparado.ok) throw new Error('preparación rechazada')
    const { cliente } = clienteEspia(true)
    await expect(guardarAltaCerramiento(cliente, 'linea-1', preparado.alta))
      .rejects.toThrow('duplicate key')
  })
})
