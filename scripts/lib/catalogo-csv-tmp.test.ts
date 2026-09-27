import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { catalogoDesdeCsv } from './catalogo-csv.ts'
import { minutosTravesanosTmp } from '../../packages/core/src/despiece/mano-obra-tmp.ts'

const base = { Codigo: 'SINTETICO', TiempoFabr: '7', CodArticulo: 'MO', ModuloAsoc: '0', ArticuloAsoc: '',
  ComponenteAsoc: '!', GrupoAsoc: 'TMP', TiempoPreparacion: '0', AnchoTiempo: '0', AltoTiempo: '0',
  AnchoMayorMM: '0', AltoMayorMM: '0', Categoria: '00001', FamiliaAsoc: '001', CodSerie: '*', AsociadoSN: 'True' }

function leerConcepto(cambios: Record<string, string>) {
  const carpeta = mkdtempSync(join(tmpdir(), 'aluminior-tmp-sintetico-'))
  // Son entradas de un fixture mínimo, no una guarda de ausencia en el proyecto.
  for (const tabla of ['Articulos', 'EstructurasArticulos', 'Estructuras', 'Conjuntos', 'ConjuntosLin',
    'ConjuntosDescuentos', 'SeriesAsocV2TiposHoja', 'ConjuntosAsoc', 'ConjuntosOpcionesHerraje',
    'FamiliasGruposAsoc', 'TAcristalamientoLin', 'ArticulosPVP', 'ArticulosIncrPrecio']) {
    writeFileSync(join(carpeta, `${tabla}.csv`), 'Codigo\n')
  }
  const c = { ...base, ...cambios }
  writeFileSync(join(carpeta, 'MOConceptos.csv'), `${Object.keys(c).join(',')}\n${Object.values(c).join(',')}\n`)
  return catalogoDesdeCsv(carpeta).conceptosManoObra()
}
const calcular = (conceptos: ReturnType<typeof leerConcepto>) => minutosTravesanosTmp({ conceptos,
  elementos: [{ modulo: null, articuloPlantilla: 'SINTETICO', componente: '16', grupo: 'TMP', cantidad: 2 }],
  contexto: { tipoPerfiles: 'A', familia: '001', serie: 'SINTETICA' } })

describe('CSV conserva ausencia frente a cero en TMP', () => {
  it('lee los metadatos y ceros explícitos sin alterar minutos', () => {
    expect(calcular(leerConcepto({}))).toMatchObject({ resuelto: true,
      lineas: [{ articulo: 'MO', concepto: 'SINTETICO', minutos: 14 }] })
  })
  it.each(['TiempoFabr', 'TiempoPreparacion', 'AnchoTiempo', 'AltoTiempo', 'AnchoMayorMM', 'AltoMayorMM',
    'ModuloAsoc', 'Categoria', 'FamiliaAsoc', 'CodSerie', 'AsociadoSN', 'CodArticulo', 'ComponenteAsoc'])('bloquea %s ausente', campo => {
    expect(calcular(leerConcepto({ [campo]: '' }))).toMatchObject({ resuelto: false, lineas: [] })
  })
  it.each(['TiempoFabr', 'TiempoPreparacion', 'AnchoTiempo', 'AltoTiempo', 'AnchoMayorMM', 'AltoMayorMM', 'ModuloAsoc'])('bloquea %s inválido', campo => {
    expect(calcular(leerConcepto({ [campo]: 'invalido' }))).toMatchObject({ resuelto: false, lineas: [] })
  })
  it('distingue minutos cero explícitos de vacío', () => {
    expect(calcular(leerConcepto({ TiempoFabr: '0' }))).toMatchObject({ resuelto: true, lineas: [] })
    expect(Number.isNaN(leerConcepto({ TiempoFabr: '' })[0]!.minutos)).toBe(true)
  })
  it('normaliza los selectores antes de exigir tiempos válidos', () => {
    const reglas = leerConcepto({ GrupoAsoc: ' TMP ', TiempoFabr: '' })
    expect(reglas[0]!.grupoAsociado).toBe('TMP')
    expect(Number.isNaN(reglas[0]!.minutos)).toBe(true)
    expect(calcular(reglas)).toMatchObject({ resuelto: false, lineas: [] })
  })
  it('conserva un módulo positivo y bloquea su selector combinado', () => {
    const reglas = leerConcepto({ ModuloAsoc: '8' })
    expect(reglas[0]!.modulo).toBe('8')
    expect(calcular(reglas).resuelto).toBe(false)
  })
})
