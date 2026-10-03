import { describe, expect, it } from 'vitest'
import { despiezarAccesoriosVentana, despiezarCompacto, terminosSeleccion } from './compacto.ts'
import type { CatalogoLinea, CompactoLineaCatalogo, FilaPlantillaCatalogo } from './tipos.ts'

// Plantilla sintética con la forma de un compacto con guía central y motor opcionales; valores inventados.
const fila = (f: Partial<FilaPlantillaCatalogo> & Pick<FilaPlantillaCatalogo, 'articulo'>): FilaPlantillaCatalogo => ({
  id: 0, componente: null, funcion: null, cantidad: 1, posicionTrabajo: null, tipoHoja: null, mano: null, hoja: 0,
  disVidrio: null, referenciaLargo: null, referenciaAncho: null, formulaLargo: null, formulaAncho: null,
  formulaReferenciaLargo: null, formulaReferenciaAncho: null, grupo: null, grupoIzquierdo: null, grupoDerecho: null,
  grupoSuperior: null, grupoInferior: null, gruposAdicionales: [], perfilAdicional: null, formulaSeleccion: null, ...f,
})
const plantilla = [
  fila({ articulo: 'LAMA', funcion: 'COMPVAL', formulaLargo: 'L', formulaAncho: 'A+CVI+CVD', formulaSeleccion: 'G1O0' }),
  fila({ articulo: 'GUIA', funcion: 'GCDP', formulaLargo: 'L-CAJ+0', formulaSeleccion: 'G1O1' }),
  fila({ articulo: 'LAMA', funcion: 'COMPVAL', formulaLargo: 'L', formulaAncho: 'A+CVI-CGC', formulaSeleccion: 'G1O1' }),
  fila({ articulo: 'LAMA', funcion: 'COMPVAL', formulaLargo: 'L', formulaAncho: 'CGC+CVD', formulaSeleccion: 'G1O1' }),
  fila({ articulo: 'MOX', funcion: 'MO', cantidad: 15 }),
  fila({ articulo: '0', funcion: 'ACC_REC', formulaSeleccion: 'G10O0' }),
  fila({ articulo: 'MOTOR', funcion: 'ACC_MOTOR1', formulaSeleccion: 'G10O2*G1O1' }),
]
const tipos: Record<string, string> = { LAMA: 'M2', GUIA: 'ML', MOX: 'UD', MOTOR: 'UD' }
const catalogo = { plantilla: e => e === 'CX' ? plantilla : [],
  articulo: c => tipos[c] ? { codigo: c, tipoMetraje: tipos[c]!, componente: null, grosorAcristalar: 0, dobleAcristalamiento: false, generico: false } : null,
} as Pick<CatalogoLinea, 'plantilla' | 'articulo'> as CatalogoLinea
const compacto: CompactoLineaCatalogo = { estructura: 'CX', acabado: 'L', altoCajonMm: 155, vueloIzquierdoMm: 0,
  vueloDerechoMm: 0, posicionGuiaCentralMm: 0, descuentoVerticalMm: 0, opciones: ['G1O0', 'G2O2', 'G10O0'] }
const resumen = (c: CompactoLineaCatalogo) => despiezarCompacto(catalogo, c, { anchoMm: 1050, altoMm: 1200 })

describe('despiezarCompacto', () => {
  it('suma el cajón al alto de la ventana y aplica solo las filas de las opciones marcadas', () => {
    const r = resumen(compacto)
    expect(r.incidencias).toEqual([])
    expect(r.filas.map(f => [f.origen, f.articulo, f.acabado, f.cantidad, f.largoMm, f.anchoMm])).toEqual([
      ['compacto', 'LAMA', 'L', 1, 1355, 1050], ['compacto', 'MOX', 'L', 15, null, null],
    ])
  })
  it('con guía central y motor cambia paños, guía y accesorio por la selección', () => {
    const r = resumen({ ...compacto, vueloIzquierdoMm: 40, vueloDerechoMm: 60, posicionGuiaCentralMm: 500, opciones: ['G1O1', 'G10O2'] })
    expect(r.filas.map(f => [f.articulo, f.largoMm, f.anchoMm])).toEqual([
      ['GUIA', 1200, null], ['LAMA', 1355, 590], ['LAMA', 1355, 560], ['MOX', null, null], ['MOTOR', null, null],
    ])
  })
  it('bloquea sin una opción por grupo condicionante, con descuento vertical o sin plantilla', () => {
    expect(resumen({ ...compacto, opciones: ['G10O0'] }).incidencias).toContain('accesorio CX: grupo G1 sin una opción marcada')
    expect(resumen({ ...compacto, opciones: ['G1O0', 'G1O1', 'G10O0'] }).incidencias).toContain('accesorio CX: grupo G1 sin una opción marcada')
    expect(resumen({ ...compacto, descuentoVerticalMm: 10 }).incidencias).toHaveLength(1)
    expect(resumen({ ...compacto, estructura: 'NADA' }).incidencias).toEqual(['accesorio NADA sin plantilla'])
  })
  it('mide mosquitera y tapajuntas con la ventana y el cajón del compacto de la línea', () => {
    const tapajuntas = [
      fila({ articulo: 'GUIA', funcion: 'TAP', formulaLargo: 'A+2*40,00', formulaSeleccion: 'G1O0' }),
      fila({ articulo: 'GUIA', funcion: 'TAPDE', formulaLargo: 'L+CAJ+2*40,00', formulaSeleccion: 'G3O0' }),
      fila({ articulo: 'MOX', funcion: 'MO', cantidad: 0 })]
    const conTap = { ...catalogo, plantilla: (e: string) => e === 'TX' ? tapajuntas : e === 'MX' ? [fila({ articulo: 'LAMA', formulaLargo: 'L', formulaAncho: 'A' })] : [] } as CatalogoLinea
    const accesorios = [{ estructura: 'TX', acabado: 'L', opciones: ['G1O0', 'G2O0', 'G3O0', 'G4O1'] }, { estructura: 'MX', acabado: 'B', opciones: [] }]
    const r = despiezarAccesoriosVentana(conTap, accesorios, { anchoMm: 597, altoMm: 1147 }, compacto)
    expect(r.incidencias).toEqual([])
    expect(r.filas.map(f => [f.articulo, f.acabado, f.cantidad, f.largoMm, f.anchoMm])).toEqual([
      ['GUIA', 'L', 1, 677, null], ['GUIA', 'L', 1, 1382, null], ['MOX', 'L', 0, null, null], ['LAMA', 'B', 1, 1147, 597]])
    expect(despiezarAccesoriosVentana(conTap, accesorios, { anchoMm: 597, altoMm: 1147 }, null).filas[1]!.largoMm).toBe(1227)
  })
  it('lee la gramática observada de OPCformulaSelec y rechaza la desconocida', () => {
    expect(terminosSeleccion('G10O2*G1O1')).toEqual([{ grupo: 10, opcion: 2 }, { grupo: 1, opcion: 1 }])
    expect(terminosSeleccion('g1o2')).toEqual([{ grupo: 1, opcion: 2 }])
    expect(terminosSeleccion(null)).toEqual([])
    expect(terminosSeleccion('G1O1+G2O1')).toBeNull()
  })
})
