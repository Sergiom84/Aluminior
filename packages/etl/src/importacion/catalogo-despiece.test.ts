import { describe, expect, it } from 'vitest'
import type { Cargar } from './cargar.ts'
import type { Resultado } from './resultado.ts'
import type { Fila } from '../csv.ts'
import { cargarCatalogoDespiece, parametrosSerie } from './catalogo-despiece.ts'

// Filas sintéticas; nunca datos de la empresa.
async function mapear(tablas: Record<string, Fila[]>, estructuras: Set<string> | null = null) {
  const salida = new Map<string, Record<string, unknown>[]>()
  const cargar: Cargar = async (origen, destino, convertir) => {
    const filas = tablas[origen] ?? []
    const r: Resultado = { tabla: destino, leidas: filas.length, insertadas: 0, descartadas: 0, excluidas: 0, motivos: new Map() }
    salida.set(destino, filas.flatMap(f => { const c = convertir(f, r); if (!c) return []; r.insertadas++; return [c] }))
    return r
  }
  const resultados = await cargarCatalogoDespiece(cargar, estructuras)
  return { resultados: new Map(resultados.map(r => [r.tabla, r])), salida }
}

describe('catálogo suplementario de despiece', () => {
  it('conserva la plantilla completa, excluye documentos y estructuras no importadas', async () => {
    const fila = { Estructura: 'QA', nLin: '10', id: '4', Articulo: 'G1', DisComponente: '21', Funcion: 'HV',
      Cantidad: '1', DisTipoHoja: '10', DisNHoja: '1', DisIdRefLargo: '1', DisIdRefAncho: '0', FormulaLargo: '1000',
      FormulaLargoCorte: 'L', DisFRefLargo: 'REF', DisGrupo: 'HVL', DisGrupoI: 'MH', DisGrupoD: 'MH',
      DisGrupoAdicional: 'B', DisIdPerAd: '-1', DisVidrio: '15' }
    const r = await mapear({ EstructurasArticulos: [fila, { ...fila, nLin: '11', TipoDoc: 'VPRES' },
      { ...fila, nLin: '12', Estructura: 'OTRA' }, { ...fila }] }, new Set(['QA']))
    expect(r.salida.get('estructura_plantilla_catalogo')).toEqual([expect.objectContaining({
      estructura_codigo: 'QA', linea_origen: 10, id_pieza: 4, formula_largo: 'L', referencia_ancho: null,
      grupos_adicionales: ['B', '', '', ''], perfil_adicional: null, dis_vidrio: '15', hoja: 1,
    })])
    expect(r.resultados.get('estructura_plantilla_catalogo')).toMatchObject({ insertadas: 1, excluidas: 2, descartadas: 1 })
  })
  it('marca rasgos no contrastados de las asociaciones y normaliza la opción', async () => {
    const r = await mapear({ ConjuntosAsoc: [{ nLin: '7', Conjunto: 'H', Articulo: 'A', Cantidad: '2', nOpcion: '014',
      ComponenteAsoc: '58', GrupoAsoc: '!', PlHojasX: '1', PVCrefuerzoSN: 'True', Descuento: '21,5' }] })
    expect(r.salida.get('conjunto_asociaciones')![0]).toMatchObject({
      id: '7', opcion: '14', componente: '58', descuento: '21.5', no_contrastado: ['plano de hojas', 'refuerzo'],
    })
  })
  it('guarda solo las ranuras vacías explícitas y los grupos como listas', async () => {
    const r = await mapear({
      ConjuntosLin: [{ Conjunto: 'S', Componente: '222', Articulo: '0' }, { Conjunto: 'S', Componente: '10', Articulo: 'P' },
        { Conjunto: 'S', Componente: '11', Articulo: '' }],
      FamiliasGruposAsoc: [{ Familia: '001', Codigo: 'ESC', Componentes: '58;59;58R;', Descripcion: 'X' }],
    })
    expect(r.salida.get('conjunto_ranuras_vacias')).toEqual([{ conjunto_codigo: 'S', componente: '222' }])
    expect(r.salida.get('grupos_asociacion')![0]).toMatchObject({ componentes: ['58', '59', '58R'] })
  })
  it('extrae claves de herraje, mano de obra y rangos de grosor de la serie', () => {
    expect(parametrosSerie({ Codigo: 'S', herr2HC: 'HU1', herr2HCP: '', mo2HC: '001', moMCHF: 'X', Modulo: 'NO', CorrGrosorVid: '10', CorrGrosorVidDA: '18' }))
      .toEqual({ conjunto_codigo: 'S', herrajes: { '2HC': 'HU1' }, mano_obra: { '2HC': '001', MCHF: 'X' }, grosor_maximo_simple: '10', grosor_maximo_doble: '18' })
  })
})
