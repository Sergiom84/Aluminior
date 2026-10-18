import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { multiplicarDecimal, sumarDecimal } from '@aluminior/core/precios'
import type { ResultadoCerramientoV1 } from '@aluminior/core/estructuras'
import { DespunteVista } from '../_components/despunte'
import { parametrosProduccion } from './parametros.ts'
import { prepararProduccion } from './preparar-produccion.ts'
import { fixtureProduccion } from './produccion.fixture.ts'

const parametros = parametrosProduccion({ barra: '6000', kerf: '0', inicial: '0', final: '0' })
const perfil = JSON.stringify(['QA-J04-P', 'QA-J04-L'])

/** Sólo datos sintéticos; conserva coherentes snapshot, sumas y filas relacionales. */
function conCostes(m1: string | null, m2: string | null) {
  const datos = fixtureProduccion()
  const snapshot = datos.lineas[0].resultado as ResultadoCerramientoV1
  for (const origen of snapshot.origenes) {
    for (const pieza of origen.piezas) {
      if (pieza.articuloCodigo !== 'QA-J04-P') continue
      pieza.costeUnitario = origen.origen.id === 'm1' ? m1 : m2
      pieza.costeTotal = pieza.costeUnitario === null ? null : multiplicarDecimal(
        multiplicarDecimal(pieza.cantidad, pieza.largoCorteMm!, 5),
        multiplicarDecimal(pieza.costeUnitario, '0.001', 7), 4,
      )
    }
    const completo = origen.piezas.every(pieza => pieza.costeTotal !== null)
    origen.coste = completo ? { completo: true, importe: origen.piezas.reduce(
      (total, pieza) => sumarDecimal(total, pieza.costeTotal!, 4), '0.0000',
    ) } : { completo: false, importe: null }
    if (!completo) origen.diagnosticos = [...origen.diagnosticos, { codigo: 'SIN_COSTE', ambito: 'COSTE', bloqueante: true,
      detalle: 'Coste sintético ausente' }]
  }
  const completo = snapshot.origenes.every(origen => origen.coste.completo)
  snapshot.costeMateriales = completo ? { completo: true, importe: snapshot.origenes.reduce(
    (total, origen) => sumarDecimal(total, origen.coste.importe!, 4), '0.0000',
  ) } : { completo: false, importe: null }
  datos.lineas[0].piezas = datos.lineas[0].piezas.map(fila => {
    const pieza = snapshot.origenes.find(origen => origen.origen.id === fila.origenId)!
      .piezas.find(pieza => pieza.ordinal === fila.origenOrdinal)!
    return { ...fila, costeUnitario: pieza.costeUnitario, costeTotal: pieza.costeTotal }
  })
  return datos
}

describe('igualdad decimal en el coste técnico de despunte', () => {
  it.each([['4', '4.0'], ['4', '4.0000'], ['4.0000', '4']])(
    'valora el mismo perfil entre orígenes con costes equivalentes %s y %s', (m1, m2) => {
      const resultado = prepararProduccion(conCostes(m1, m2), parametros)
      expect(resultado.despunte?.noValorables).toEqual([])
      expect(resultado.despunte).toMatchObject({ costePerfilesYCortes: '74.94', costeBarras: '116.40', importeDespunte: '41.46' })
      expect(resultado.despunte?.perfiles.find(fila => fila.perfil === perfil)).toMatchObject({
        nBarras: 3, mlNecesario: '14.0000', mlBarras: '18.0000', costeBarras: '72.00', importeDespunte: '16.00',
      })
    },
  )

  it('mantiene sin valorar un coste realmente distinto en la última cifra admitida', () => {
    const resultado = prepararProduccion(conCostes('4', '4.0001'), parametros)
    expect(resultado.despunte?.noValorables).toEqual([expect.objectContaining({ perfil, nBarras: 3, mlBarras: '18.0000' })])
    expect(resultado.despunte?.perfiles.some(fila => fila.perfil === perfil)).toBe(false)
  })

  it.each([[null, '4'], ['4', null]])('no convierte ausencia %s y valor %s en coste conocido', (m1, m2) => {
    const resultado = prepararProduccion(conCostes(m1, m2), parametros)
    expect(resultado.despunte?.noValorables).toEqual([expect.objectContaining({ perfil, nBarras: 3, mlBarras: '18.0000' })])
    expect(resultado.despunte?.perfiles.some(fila => fila.perfil === perfil)).toBe(false)
  })

  it('distingue cero explícito de coste ausente con representaciones equivalentes', () => {
    const resultado = prepararProduccion(conCostes('0', '0.0000'), parametros)
    expect(resultado.despunte?.noValorables).toEqual([])
    expect(resultado.despunte?.perfiles.find(fila => fila.perfil === perfil)).toMatchObject({
      costePerfilesYCortes: '0.00', costeBarras: '0.00', importeDespunte: '0.00',
    })
  })

  it('repetir el cálculo no acumula ni modifica la foto de producción', () => {
    const datos = conCostes('4', '4.0000')
    const foto = structuredClone(datos)
    const primero = prepararProduccion(datos, parametros)
    expect(prepararProduccion(datos, parametros)).toEqual(primero)
    expect(datos).toEqual(foto)
  })

  it('la vista existente muestra el coste completo para el mismo valor decimal', () => {
    const resultado = prepararProduccion(conCostes('4', '4.0000'), parametros)
    const html = renderToStaticMarkup(<DespunteVista datos={resultado.despunte} />)
    expect(html).toContain('Material necesario')
    expect(html).toContain('116,40')
    expect(html).toContain('41,46')
    expect(html).not.toContain('Coste incompleto')
    expect(html).toContain('Sin cargo al presupuesto.')
  })
})
