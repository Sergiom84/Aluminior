import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { catalogoDesdeCsv } from './catalogo-csv.ts'
import { despiezarLineaCatalogo } from '../../packages/core/src/despiece/linea-catalogo/despiezar.ts'

type Precio = { Acabado: string; PVP: string }
function valorar(precios: Precio[], acabado = 'LAC') {
  const carpeta = mkdtempSync(join(tmpdir(), 'aluminior-pvp-sintetico-'))
  const csv = (tabla: string, filas: Record<string, string>[]) => {
    const campos = Object.keys(filas[0] ?? { Codigo: '' })
    const q = (v: string) => `"${v.replaceAll('"', '""')}"`
    writeFileSync(join(carpeta, `${tabla}.csv`), [campos.map(q).join(','),
      ...filas.map(f => campos.map(c => q(f[c] ?? '')).join(','))].join('\n') + '\n')
  }
  // Fixture mínimo sintético, no representa un barrido del proyecto.
  for (const tabla of ['Estructuras', 'ConjuntosLin', 'ConjuntosDescuentos', 'SeriesAsocV2TiposHoja',
    'ConjuntosAsoc', 'ConjuntosOpcionesHerraje', 'FamiliasGruposAsoc', 'TAcristalamientoLin', 'ArticulosIncrPrecio']) csv(tabla, [])
  csv('Articulos', [{ Codigo: 'MO', TipoMetraje: 'UD' }])
  csv('Conjuntos', [{ Codigo: 'GMA350', TipoPerf: 'A', Familia: '001' }])
  csv('EstructurasArticulos', [{ id: '1', Estructura: '03V', TipoDoc: '', Articulo: 'SINTETICO',
    DisComponente: '16', DisGrupo: 'TMP', Cantidad: '2', Funcion: 'infTMP', DisTipoHoja: '-1' }])
  csv('MOConceptos', [{ Codigo: 'SINTETICO', TiempoFabr: '7', CodArticulo: 'MO', ModuloAsoc: '0', ArticuloAsoc: '',
    ComponenteAsoc: '!', GrupoAsoc: 'TMP', TiempoPreparacion: '0', AnchoTiempo: '0', AltoTiempo: '0', AnchoMayorMM: '0',
    AltoMayorMM: '0', Categoria: '00001', FamiliaAsoc: '001', CodSerie: '*', AsociadoSN: 'True' }])
  csv('ArticulosPVP', precios.map(p => ({ Articulo: 'MO', Tarifa: '1', ...p })))
  const catalogo = catalogoDesdeCsv(carpeta)
  return { tarifa: catalogo.tarifa('MO', acabado), resultado: despiezarLineaCatalogo(catalogo, {
    estructura: '03V', serie: 'GMA350', disenoEspecifico: false, anchoMm: 1000, altoMm: 700,
    vidrio: null, acabado: 'X', acabadoAccesorios: acabado, opcionesGuardadas: [],
  }) }
}

describe('CSV a motor: PVP seleccionado no confunde ausencia con cero', () => {
  it.each([
    { caso: 'vacío', precios: [{ Acabado: 'LAC', PVP: '' }] },
    { caso: 'inválido', precios: [{ Acabado: 'LAC', PVP: 'invalido' }] },
    { caso: 'no finito', precios: [{ Acabado: 'LAC', PVP: 'Infinity' }] },
    { caso: 'exacto inválido con genérico bueno', precios: [{ Acabado: 'LAC', PVP: '' }, { Acabado: '*', PVP: '0.5' }] },
    { caso: 'exacto duplicado inválido', precios: [{ Acabado: 'LAC', PVP: '0' }, { Acabado: 'LAC', PVP: '' }] },
    { caso: 'genérico vacío', precios: [{ Acabado: '*', PVP: '' }] },
    { caso: 'genérico inválido', precios: [{ Acabado: 'UNI', PVP: 'invalido' }] },
    { caso: 'genérico duplicado inválido', precios: [{ Acabado: '*', PVP: '0' }, { Acabado: '', PVP: '' }] },
  ])('deja sin valorar $caso', ({ precios }) => {
    const r = valorar(precios)
    expect(r.tarifa?.pvp).toBeNull()
    expect(r.resultado.importe).toBeNull()
    expect(r.resultado.filas[0]).toMatchObject({ cantidad: 14, importe: null })
    expect(r.resultado.incidencias).toContain('MO: sin PVP en la tarifa')
  })
  it.each([
    { caso: 'exacto positivo', precios: [{ Acabado: 'LAC', PVP: '0.5' }], pvp: 0.5 },
    { caso: 'exacto cero explícito', precios: [{ Acabado: 'LAC', PVP: '0' }], pvp: 0 },
    { caso: 'genérico cero explícito', precios: [{ Acabado: '*', PVP: '0' }], pvp: 0 },
    { caso: 'genérico con coma', precios: [{ Acabado: '*', PVP: '0,5' }], pvp: 0.5 },
    { caso: 'exacto bueno y ajeno inválido', precios: [{ Acabado: 'LAC', PVP: '0.5' }, { Acabado: 'ANOD', PVP: '' }], pvp: 0.5 },
    { caso: 'exacto bueno y genérico inválido', precios: [{ Acabado: 'LAC', PVP: '0.5' }, { Acabado: '*', PVP: 'invalido' }], pvp: 0.5 },
  ])('valora $caso', ({ precios, pvp }) => {
    const r = valorar(precios)
    expect(r.tarifa?.pvp).toBe(pvp)
    expect(r.resultado.importe).toBe(pvp * 14)
    expect(r.resultado.incidencias).toEqual([])
  })
})
