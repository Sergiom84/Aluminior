import { describe, expect, it } from 'vitest'
import { despiezarLineaCatalogo } from './despiezar.ts'
import type { CatalogoLinea, FilaPlantillaCatalogo } from './tipos.ts'
import { seleccionarPrecioTabla } from '../../precios/seleccionar-precio-tabla.ts'

const plantilla = (articulo: string): FilaPlantillaCatalogo => ({ id: 0, articulo, cantidad: 1, componente: null,
  funcion: null, posicionTrabajo: null, tipoHoja: null, mano: null, hoja: 0, disVidrio: null,
  referenciaLargo: null, referenciaAncho: null, formulaLargo: 'L', formulaAncho: 'A', formulaReferenciaLargo: null,
  formulaReferenciaAncho: null, grupo: null, grupoIzquierdo: null, grupoDerecho: null, grupoSuperior: null,
  grupoInferior: null, gruposAdicionales: [], perfilAdicional: null })
const politicas = { noMedidasInferiores: false, noMedidasSuperiores: false, soloMedidasAncho: false,
  soloMedidasLargo: false, noPrecioCero: false }
const entrada = { estructura: 'EST', serie: 'S', anchoMm: 1100, altoMm: 1800, vidrio: null,
  acabado: 'L', acabadoAccesorios: 'UNI', opcionesGuardadas: [] }
function catalogo(marca: boolean | null, resolver = false): CatalogoLinea {
  return {
    plantilla: c => [plantilla(c === 'EST' ? 'A' : 'BASE')], esAccesorio: () => true,
    articulo: c => ({ codigo: c, tipoMetraje: 'UD', componente: null, grosorAcristalar: 0,
      generico: false, dobleAcristalamiento: false, precioEnTabla: c === 'A' ? marca : false }),
    serie: c => ({ codigo: c, herrajes: {}, manoObra: {}, tablaHojas: null, tablaFijos: null,
      grosorMaximoSimple: 0, grosorMaximoDoble: 0 }),
    resolverComponente: () => null, descuentos: () => [], nombreTipoHoja: () => null,
    asociaciones: () => [], opciones: () => [], gruposAsociacion: () => new Map(),
    tablaAcristalamiento: () => [], conceptosManoObra: () => [],
    tarifa: c => ({ tipoMetraje: 'UD', pvp: c === 'A' ? 1.2 : 5, minimo: 0,
      multiploAnchoCm: 0, multiploLargoCm: 0, incrementos: [] }),
    ...resolver ? { precioTabla: (articuloCodigo: string, acabadoCodigo: string, anchoMm: number | null, largoMm: number | null) =>
      seleccionarPrecioTabla({ articuloCodigo, acabadoCodigo, tarifa: '1', anchoMm, largoMm, politicas,
        filas: [1000, 1500].map(anchoMm => ({ articuloCodigo: 'A', acabadoCodigo: 'L', tarifa: '1', anchoMm,
          largoMm: 2000, precio: anchoMm === 1000 ? 12.34 : 19.85 })) }) } : {},
  }
}

describe('precio dimensional en el despiece de catálogo', () => {
  it('sin selector nunca usa la tarifa plana y conserva las medidas UD y el acabado principal', () => {
    const r = despiezarLineaCatalogo(catalogo(true), entrada)
    expect(r.importe).toBeNull()
    expect(r.filas).toMatchObject([{ largoMm: 1800, anchoMm: 1100, acabado: 'L', importe: null }])
    expect(r.incidencias).toContain('A: valoración por tabla sin regla verificada')
  })
  it('usa el PVP por medidas verificado por unidad, sin mínimos ni precio plano de reserva', () => {
    const c = catalogo(true, true)
    const r = despiezarLineaCatalogo({ ...c, plantilla: () => [{ ...plantilla('A'), cantidad: 2 }] }, entrada)
    expect(r).toMatchObject({ importe: 39.7, incidencias: [] })
    expect(r.filas).toMatchObject([{ cantidad: 2, metraje: 2, precio: 19.85, importe: 39.7 }])
  })
  it('una tabla sin fila compatible deja nulo el importe, aunque exista PVP plano', () => {
    expect(despiezarLineaCatalogo(catalogo(true, true), { ...entrada, anchoMm: 1800 }))
      .toMatchObject({ importe: null, incidencias: ['A: Medidas fuera de la tabla de precios'] })
  })
  it('una configuración desconocida no acredita una tarifa plana', () => {
    expect(despiezarLineaCatalogo(catalogo(null, true), entrada)).toMatchObject({ importe: null })
    expect(despiezarLineaCatalogo(catalogo(null, true), entrada).incidencias[0]).toContain('actualizar el catálogo')
  })
  it('conserva la valoración previa de las unidades configuradas expresamente sin tabla', () => {
    expect(despiezarLineaCatalogo(catalogo(false), entrada)).toMatchObject({ importe: 1.2, incidencias: [],
      filas: [{ largoMm: null, anchoMm: null, acabado: 'UNI' }] })
  })
  it('aplica las mismas medidas y selección a una mosquitera dentro de la línea', () => {
    const c = catalogo(true, true)
    const r = despiezarLineaCatalogo({ ...c, plantilla: e => [plantilla(e === 'ACC' ? 'A' : 'BASE')] },
      { ...entrada, accesorios: [{ estructura: 'ACC', acabado: 'L', opciones: [] }] })
    expect(r).toMatchObject({ importe: 24.85, incidencias: [] })
    expect(r.filas[1]).toMatchObject({ origen: 'compacto', anchoMm: 1100, largoMm: 1800, precio: 19.85 })
  })
})
