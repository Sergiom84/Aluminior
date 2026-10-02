import { describe, expect, it } from 'vitest'
import type { Cargar } from './cargar.ts'
import type { Resultado } from './resultado.ts'
import type { Fila } from '../csv.ts'
import { cargarCortesCatalogo } from './cortes-catalogo.ts'

async function mapear(tablas: Record<string, Fila[]>) {
  const salida = new Map<string, Record<string, unknown>[]>()
  const cargar: Cargar = async (origen, destino, convertir) => {
    const filas = tablas[origen] ?? []
    const r: Resultado = { tabla: destino, leidas: filas.length, insertadas: 0,
      descartadas: 0, excluidas: 0, motivos: new Map() }
    salida.set(destino, filas.flatMap(f => {
      const convertida = convertir(f, r)
      if (!convertida) return []
      r.insertadas++
      return [convertida]
    }))
    return r
  }
  return { resultados: await cargarCortesCatalogo(cargar), salida }
}

describe('catálogo suplementario de cortes', () => {
  it('rechaza claves duplicadas para no ocultar reglas contradictorias con ON CONFLICT', async () => {
    const f = { Conjunto: 'QA', Familia: '001', GrupoPrinc: 'E', Grupo: 'M', TipoHoja: 'G', Descuento: '1' }
    const r = await mapear({ ConjuntosDescuentos: [f, { ...f, Descuento: '5' }] })
    expect(r.resultados[1]).toMatchObject({ insertadas: 1, descartadas: 1 })
  })
  it('conserva id de pieza, referencia, extremos y precisión sin copiar documentos', async () => {
    const f = { Estructura: 'QA', nLin: '201', id: '7', DisIdRefLargo: '3',
      FormulaLargo: 'A/2', FormulaLargoCorte: '(A-10)/2', DisFRefLargo: 'REF/2',
      DisGrupo: 'HH', DisGrupoI: 'MV', DisGrupoD: 'MV', DisTipoHoja: '10', DisIdPerAd: '-1' }
    const r = await mapear({ EstructurasArticulos: [f, { ...f, TipoDoc: 'VPRES' }],
      ConjuntosDescuentos: [{ Conjunto: 'QA', Familia: '001', GrupoPrinc: 'MV',
        Grupo: 'HH', TipoHoja: '2HC', Descuento: '-0,12500001' }] })
    expect(r.salida.get('estructura_referencias_corte')).toEqual([expect.objectContaining({
      id_pieza: 7, id_referencia: 3, linea_origen: 201,
      formula: '(A-10)/2', formula_referencia: 'REF/2', grupo_inicio: 'MV', grupo_fin: 'MV',
    })])
    expect(r.resultados[0]?.excluidas).toBe(1)
    expect(r.salida.get('conjunto_descuentos_corte')?.[0]?.descuento_mm).toBe('-0.12500001')
  })
  it('distingue descuento cero de dato ausente', async () => {
    const base = { Conjunto: 'QA', Familia: '001', GrupoPrinc: 'E', Grupo: 'M', TipoHoja: 'G' }
    const r = await mapear({ ConjuntosDescuentos: [{ ...base, Descuento: '0' }, base] })
    expect(r.resultados[1]).toMatchObject({ insertadas: 1, descartadas: 1 })
    expect(r.salida.get('conjunto_descuentos_corte')?.[0]?.descuento_mm).toBe('0')
  })
  it('normaliza referencia 0 y excluye plantillas sin identificador', async () => {
    const r = await mapear({ EstructurasArticulos: [
      { Estructura: 'QA', nLin: '1', id: '1', DisIdRefLargo: '0' },
      { Estructura: 'QA', nLin: '2' },
    ] })
    expect(r.resultados[0]).toMatchObject({ insertadas: 1, excluidas: 1 })
    expect(r.salida.get('estructura_referencias_corte')?.[0]?.id_referencia).toBeNull()
  })
})
