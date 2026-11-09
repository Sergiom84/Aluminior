import { describe, expect, it } from 'vitest'
import { despiezarCompacto } from './compacto.ts'
import { AVISO_GUIAS_SIN_CONTRASTE } from './guias-compacto.ts'
import type { CatalogoLinea, CompactoLineaCatalogo, FilaPlantillaCatalogo } from './tipos.ts'

const plantilla: FilaPlantillaCatalogo[] = [{
  id: 0, articulo: 'COM005', componente: null, funcion: 'COMPVAL', cantidad: 1, posicionTrabajo: null, tipoHoja: null,
  mano: null, hoja: 0, disVidrio: null, referenciaLargo: null, referenciaAncho: null, formulaLargo: 'L',
  formulaAncho: 'A+CVI+CVD', formulaReferenciaLargo: null, formulaReferenciaAncho: null, grupo: null,
  grupoIzquierdo: null, grupoDerecho: null, grupoSuperior: null, grupoInferior: null, gruposAdicionales: [],
  perfilAdicional: null, formulaSeleccion: null,
}]
const catalogo = {
  plantilla: (e: string) => e === 'COM005' ? plantilla : [],
  articulo: (c: string) => c === 'COM005' ? { codigo: c, tipoMetraje: 'M2', componente: null } : null,
  articuloGuia: (c: string) => ({ GMG010: 'GM6805L', PSG002: 'PSG100' } as Record<string, string>)[c] ?? null,
} as unknown as CatalogoLinea
const compacto: CompactoLineaCatalogo = { estructura: 'COM005', acabado: 'VS', altoCajonMm: 155, vueloIzquierdoMm: 0,
  vueloDerechoMm: 0, posicionGuiaCentralMm: 0, descuentoVerticalMm: 0, opciones: [] }
// EMP0016, presupuesto 970: C2 de 1.100 x 1.600 con la ventana a 1.445 tras el cajón.
const ventana = { anchoMm: 1100, altoMm: 1445 }

describe('guías del compacto', () => {
  it('reproduce el presupuesto 970: GM6805L de 1.445 por lado y 5 minutos de MOCOMP por guía', () => {
    const r = despiezarCompacto(catalogo, { ...compacto, guiaIzquierda: 'GMG010', guiaDerecha: 'gmg010' }, ventana)
    expect(r.incidencias).toEqual([])
    expect(r.filas.map(f => [f.articulo, f.acabado, f.cantidad, f.funcion, f.largoMm])).toEqual([
      ['COM005', 'VS', 1, 'COMPVAL', 1600],
      ['GM6805L', 'VS', 1, 'GUIAIZ', 1445], ['MOCOMP', 'UNI', 5, null, null],
      ['GM6805L', 'VS', 1, 'GUIADE', 1445], ['MOCOMP', 'UNI', 5, null, null],
    ])
    expect(r.avisos).toEqual([AVISO_GUIAS_SIN_CONTRASTE])
  })

  it('sin guías no añade filas ni aviso', () => {
    const r = despiezarCompacto(catalogo, compacto, ventana)
    expect(r.filas.map(f => f.articulo)).toEqual(['COM005'])
    expect(r.avisos).toEqual([])
  })

  it('valora cada lado por separado y con altura total usa el compacto menos el cajón', () => {
    const r = despiezarCompacto(catalogo, { ...compacto, guiaIzquierda: 'PSG002', alturaTotalMm: 1900 }, ventana)
    expect(r.filas.filter(f => f.funcion?.startsWith('GUIA')).map(f => [f.articulo, f.funcion, f.largoMm]))
      .toEqual([['PSG100', 'GUIAIZ', 1745]])
  })

  it('una guía sin perfil en el catálogo deja la línea incompleta en vez de valorarla a cero', () => {
    const r = despiezarCompacto(catalogo, { ...compacto, guiaDerecha: 'XX9' }, ventana)
    expect(r.incidencias).toEqual(['guía XX9 sin perfil en el catálogo'])
    expect(r.filas.map(f => f.articulo)).toEqual(['COM005'])
  })
})
