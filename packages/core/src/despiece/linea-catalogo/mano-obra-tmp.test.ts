import { describe, expect, it } from 'vitest'
import { despiezarLineaCatalogo } from './despiezar.ts'
import type { CatalogoLinea, FilaPlantillaCatalogo } from './tipos.ts'
import type { ConceptoManoObraCatalogo } from '../mano-obra-fabricacion.ts'

// Catálogo mínimo sintético: el valor de siete minutos no procede de una empresa.
const plantilla: FilaPlantillaCatalogo = { id: 1, articulo: 'TMP-SINTETICO', componente: '16', grupo: 'TMP',
  funcion: 'infTMP', cantidad: 2, posicionTrabajo: null, tipoHoja: '-1', mano: null, hoja: 0, disVidrio: null,
  referenciaLargo: null, referenciaAncho: null, formulaLargo: null, formulaAncho: null, formulaReferenciaLargo: null,
  formulaReferenciaAncho: null, grupoIzquierdo: null, grupoDerecho: null, grupoSuperior: null, grupoInferior: null,
  gruposAdicionales: [], perfilAdicional: null }
const concepto: ConceptoManoObraCatalogo = { codigo: 'SINTETICO', minutos: 7, articulo: 'MO', modulo: null,
  articuloAsociado: null, componenteAsociado: '!', grupoAsociado: 'TMP', conIncrementos: false,
  categoria: '00001', familiaAsociada: '001', serieAsociada: '*', asociado: true }
const catalogo: CatalogoLinea = {
  plantilla: () => [plantilla], esAccesorio: () => false,
  serie: codigo => ({ codigo, familia: '001', tipoPerfiles: 'A', herrajes: {}, manoObra: {}, tablaHojas: null,
    tablaFijos: null, grosorMaximoSimple: 0, grosorMaximoDoble: 0 }),
  articulo: () => null, resolverComponente: () => null, descuentos: () => [], nombreTipoHoja: () => null,
  asociaciones: () => [], opciones: () => [], gruposAsociacion: () => new Map(), tablaAcristalamiento: () => [],
  conceptosManoObra: () => [concepto],
  tarifa: () => ({ tipoMetraje: 'UD', pvp: 0.5, multiploAnchoCm: 0, multiploLargoCm: 0, minimo: 0, incrementos: [] }),
}
const entrada = { estructura: '03V', serie: 'GMA350', disenoEspecifico: false,
  anchoMm: 1000, altoMm: 700, vidrio: null, acabado: 'X', acabadoAccesorios: 'UNI', opcionesGuardadas: [] }

describe('compositor de línea y cobertura TMP', () => {
  it('entrega contexto original, suma una aportación y valora la fila', () => {
    const r = despiezarLineaCatalogo(catalogo, entrada)
    expect(r.incidencias).toEqual([])
    expect(r.filas).toHaveLength(1)
    expect(r.filas[0]).toMatchObject({ origen: 'mano-obra', cantidad: 14, importe: 7 })
    expect(r.importe).toBe(7)
  })
  it.each([{ estructura: '03H' }, { estructura: '06' }, { serie: 'GMA50' },
    { disenoEspecifico: true }, { disenoEspecifico: undefined }])('conserva bloqueo fuera del alcance %o', cambio => {
    const r = despiezarLineaCatalogo(catalogo, { ...entrada, ...cambio })
    expect(r.importe).toBeNull()
    expect(r.filas).toEqual([])
    expect(r.incidencias).toContain('mano de obra SINTETICO: asociación por grupo sin contrastar')
  })
  it('sin metadatos de serie del adaptador no entrega precio', () => {
    const r = despiezarLineaCatalogo({ ...catalogo,
      serie: codigo => ({ ...catalogo.serie(codigo)!, tipoPerfiles: undefined, familia: undefined }) }, entrada)
    expect(r.importe).toBeNull()
    expect(r.filas).toEqual([])
    expect(r.incidencias).toContain('mano de obra TMP/16: contexto ausente o sin contrastar')
  })
  it('sin PVP de MO mantiene null aunque los minutos sean completos', () => {
    const r = despiezarLineaCatalogo({ ...catalogo, tarifa: (a, b) => ({ ...catalogo.tarifa(a, b)!, pvp: null }) }, entrada)
    expect(r.filas[0]).toMatchObject({ cantidad: 14, importe: null })
    expect(r.importe).toBeNull()
  })
})
