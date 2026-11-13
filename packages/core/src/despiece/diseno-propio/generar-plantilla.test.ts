import { describe, expect, it } from 'vitest'
import { generarPlantillaDisenoPropio } from './generar-plantilla.ts'
import { TIPO_NODO, type NodoDiseno, type PosicionTravesano } from './tipos.ts'
import type { FilaPlantillaCatalogo } from '../linea-catalogo/tipos.ts'

const marco = (extra: Partial<NodoDiseno> = {}): NodoDiseno => ({ id: 0, tipo: TIPO_NODO.marco, contenidoEn: -1, tipoMarco: 'NOR', cortes: [1, 1, 1, 1], ...extra })
const travesano = (id: number, posicion: PosicionTravesano, extra: Partial<NodoDiseno> = {}): NodoDiseno =>
  ({ id, tipo: TIPO_NODO.travesano, contenidoEn: 0, posicion, division: id, orden: 1, tipoCota: 0, material: 'M', clase: 'V', ...extra })
const hueco = (id: number, division: number, orden: number, contenidoEn = 0): NodoDiseno => ({ id, tipo: TIPO_NODO.hueco, contenidoEn, division, orden })
const vidrio = (id: number, contenidoEn: number, articulo: string | null = null): NodoDiseno => ({ id, tipo: TIPO_NODO.vidrio, contenidoEn, vidrio: articulo })

function filas(nodos: NodoDiseno[]): FilaPlantillaCatalogo[] {
  const r = generarPlantillaDisenoPropio({ nodos })
  if (!r.ok) throw new Error(r.motivo)
  return r.filas
}
/** Resumen legible de una fila: componente, módulo o vidrio, fórmulas y grupos. */
const resumen = (f: FilaPlantillaCatalogo) => [
  f.componente ?? f.articulo, f.disVidrio, f.cantidad === 1 ? null : `x${f.cantidad}`, f.formulaLargo, f.formulaAncho,
  f.formulaReferenciaLargo, f.formulaReferenciaAncho, [f.grupoIzquierdo, f.grupoDerecho, f.grupoSuperior, f.grupoInferior].filter(Boolean).join('/') || null,
].filter(v => v !== null).join(' ')
/** Filas a partir de la sexta: las cinco primeras son siempre el marco y sus escuadras. */
const cuerpo = (nodos: NodoDiseno[]) => filas(nodos).slice(5).map(resumen)

describe('plantilla de un diseño propio de fijo', () => {
  it('el fijo sin travesaños sale como el de catálogo', () => {
    const f = filas([marco(), vidrio(1, 0)])
    expect(f.map(x => x.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(f.slice(0, 5).map(x => `${x.componente} ${x.articulo} ${x.funcion} ${x.posicionTrabajo} ${x.formulaLargo} ${x.grupo} ${x.grupoIzquierdo} x${x.cantidad}`)).toEqual([
      '12 1 MV L L MV E x1', '12 1 MV L L MV E x1', '11 2 MH A A MH E x1', '10 3 MH A A MH E x1', '58 105 infHAesc L L null E x4',
    ])
    expect(f.slice(5).map(resumen)).toEqual([
      '39 41 L A', '39 1 L A', '1 L A REF REF MV/MV/MH/MH', '39 18 18 E/E', '62 0 0 E/E',
    ])
    expect(f[7]).toMatchObject({ articulo: '8', referenciaLargo: 1, referenciaAncho: 3, grupo: 'C', tipoHoja: '-1' })
    expect(f[5]).toMatchObject({ articulo: '148', funcion: 'infMOmof', tipoHoja: '0' })
  })

  it('un travesaño vertical equidistante parte el ancho y da un vidrio por hueco', () => {
    expect(cuerpo([marco(), travesano(1, 'VI'), hueco(2, 1, 1), hueco(3, 1, 2), vidrio(4, 2), vidrio(5, 3)])).toEqual([
      '39 1 L A',
      '16 L REF MH/MH',
      '39 41 L (A)/2 REF', '39 41 L (A)/2 REF',
      '1 L (A)/2 REF (REF)/2 MV/TMP/MH/MH', '1 L (A)/2 REF (REF)/2 TMP/MV/MH/MH',
      '39 18 x2 18 E/E', '62 0 0 E/E',
    ])
  })

  it('la cota fija desde abajo deja la medida en el hueco inferior y el resto arriba', () => {
    const f = filas([marco(), travesano(1, 'HB', { tipoCota: 2, cota: 400 }), hueco(2, 1, 1), hueco(3, 1, 2), vidrio(4, 2), vidrio(5, 3)])
    expect(f.slice(5).map(resumen)).toEqual([
      '39 1 L A',
      '16 A REF MV/MV',
      '39 41 L-400 A REF-400', '39 41 400 A 400',
      '1 L-400 A REF-400 REF MV/MV/MH/TMP', '1 400 A 400 REF MV/MV/TMP/MH',
      '39 18 x2 18 E/E', '62 0 0 E/E',
    ])
    expect(f[6]).toMatchObject({ articulo: '11', funcion: 'TM', posicionTrabajo: 'A', referenciaLargo: 3, grupo: 'TMP' })
  })

  it('la cota fija desde arriba o desde la izquierda fija el primer hueco', () => {
    const con = (p: PosicionTravesano) => cuerpo([marco(), travesano(1, p, { tipoCota: 2, cota: 300 }), hueco(2, 1, 1), hueco(3, 1, 2)])
    expect(con('HA').slice(2)).toEqual(['39 41 300 A 300', '39 41 L-300 A REF-300', '62 0 0 E/E'])
    expect(con('VI').slice(2)).toEqual(['39 41 L 300 REF', '39 41 L A-300 REF', '62 0 0 E/E'])
    expect(con('VD').slice(2)).toEqual(['39 41 L A-300 REF', '39 41 L 300 REF', '62 0 0 E/E'])
  })

  it('un travesaño dentro de un hueco hereda su medida y el hueco partido no lleva mano de obra propia', () => {
    expect(cuerpo([
      marco(), travesano(1, 'HB', { tipoCota: 2, cota: 300 }), hueco(2, 1, 1), hueco(3, 1, 2),
      travesano(4, 'VI', { contenidoEn: 3 }), hueco(5, 4, 1, 3), hueco(6, 4, 2, 3), vidrio(7, 2), vidrio(8, 5), vidrio(9, 6),
    ])).toEqual([
      '39 1 L A',
      '16 A REF MV/MV',
      '39 41 L-300 A REF-300',
      '16 300 300 TMP/MH',
      '39 41 300 (A)/2 300', '39 41 300 (A)/2 300',
      '1 L-300 A REF-300 REF MV/MV/MH/TMP', '1 300 (A)/2 300 (REF)/2 MV/TMP/TMP/MH', '1 300 (A)/2 300 (REF)/2 TMP/MV/TMP/MH',
      '39 18 x3 18 E/E', '62 0 0 E/E',
    ])
  })

  it('las filas salen en el orden de los nodos: un vidrio anterior a un travesaño va antes', () => {
    const f = cuerpo([
      marco(), travesano(1, 'VI'), hueco(2, 1, 1), hueco(3, 1, 2), vidrio(5, 2),
      travesano(6, 'VD', { contenidoEn: 3, tipoCota: 2, cota: 300 }), hueco(7, 6, 1, 3), hueco(8, 6, 2, 3), vidrio(9, 7), vidrio(10, 8, 'PAN16'),
    ])
    expect(f).toEqual([
      '39 1 L A',
      '16 L REF MH/MH', '39 41 L (A)/2 REF',
      '1 L (A)/2 REF (REF)/2 MV/TMP/MH/MH',
      '16 L REF MH/MH', '39 41 L (A)/2-300 REF', '39 41 L 300 REF',
      '1 L (A)/2-300 REF (REF)/2-300 TMP/TMP/MH/MH', '1 PAN16 L 300 REF 300 TMP/MV/MH/MH',
      '39 18 x3 18 E/E', '62 0 0 E/E',
    ])
  })

  it('con dos travesaños equidistantes la mano de obra de hueco va desplazada, como en Productor', () => {
    const tres = (p: PosicionTravesano) => cuerpo([
      marco(), travesano(1, p, { orden: 1 }), travesano(2, p, { division: 1, orden: 2 }), hueco(3, 1, 1), hueco(4, 1, 2), hueco(5, 1, 3),
    ])
    expect(tres('HA')).toEqual([
      '39 1 L A',
      '16 A REF MV/MV', '39 41 A A', '39 41 (L)/3 A (REF)/3',
      '16 A REF MV/MV', '39 41 (L)/3 A (REF)/3', '39 41 (L)/3 A (REF)/3',
      '62 0 0 E/E',
    ])
    expect(tres('VI')).toEqual([
      '39 1 L A',
      '16 L REF MH/MH', '39 41 L REF', '39 41 L (A)/3 REF',
      '16 L REF MH/MH', '39 41 L (A)/3 REF', '39 41 L (A)/3 REF',
      '62 0 0 E/E',
    ])
  })

  it('con tres travesaños el primero queda con las dos filas sin hueco', () => {
    const f = cuerpo([
      marco(), travesano(1, 'VI', { orden: 1 }), travesano(2, 'VI', { division: 1, orden: 2 }), travesano(3, 'VI', { division: 1, orden: 3 }),
      hueco(4, 1, 1), hueco(5, 1, 2), hueco(6, 1, 3), hueco(7, 1, 4),
    ])
    expect(f.filter(x => x.startsWith('39 41'))).toEqual([
      '39 41 L REF', '39 41 L REF', '39 41 L REF', '39 41 L (A)/4 REF', '39 41 L (A)/4 REF', '39 41 L (A)/4 REF',
    ])
  })

  it('el vidrio propio del hueco y el barrotillo interior cuelgan de su cristal', () => {
    const f = filas([marco(), vidrio(1, 0, 'VGS616AL33I'), { id: 2, tipo: TIPO_NODO.barrotillo, contenidoEn: 1, articulo: 'BI', horizontales: 2, verticales: 1 }])
    expect(f[7]).toMatchObject({ componente: '1', disVidrio: 'VGS616AL33I', vidrioPropio: 'VGS616AL33I' })
    expect(f.slice(8, 10)).toMatchObject([
      { articulo: 'BI', componente: 'BI', cantidad: 2, posicionTrabajo: 'A', formulaLargo: 'A', referenciaLargo: 8, formulaReferenciaLargo: 'REF', grupo: 'BI', grupoIzquierdo: 'C', grupoDerecho: 'C' },
      { articulo: 'BI', componente: 'BI', cantidad: 1, posicionTrabajo: 'L', formulaLargo: 'L', referenciaLargo: 8 },
    ])
    expect(filas([marco(), vidrio(1, 0)])[7]).not.toHaveProperty('vidrioPropio')
  })

  it('el marco de corte recto apoya sus verticales en los horizontales', () => {
    const f = filas([marco({ cortes: [2, 2, 2, 2] }), vidrio(1, 0)])
    expect(f.slice(0, 4).map(x => x.grupoIzquierdo)).toEqual(['MH', 'MH', 'E', 'E'])
  })

  it.each<[string, NodoDiseno[], boolean]>([
    ['nodo de tipo 3', [marco(), { id: 1, tipo: 3, contenidoEn: 0 }], false],
    ['diseño con curva', [marco({ curva: 8 }), vidrio(1, 0)], false],
    ['marco PTA', [marco({ tipoMarco: 'PTA' }), vidrio(1, 0)], false],
    ['marco con cortes distintos en sus esquinas', [marco({ cortes: [1, 2, 1, 2] }), vidrio(1, 0)], false],
    ['travesaño con cota variable', [marco(), travesano(1, 'HB', { tipoCota: 1, cota: 300 }), hueco(2, 1, 1), hueco(3, 1, 2)], false],
    ['varios travesaños a cota fija en la misma división', [marco(), travesano(1, 'HB', { tipoCota: 2, cota: 300 }), travesano(2, 'HB', { division: 1, orden: 2, tipoCota: 2, cota: 300 }), hueco(3, 1, 1), hueco(4, 1, 2), hueco(5, 1, 3)], false],
    ['travesaño que no es de marco de ventana', [marco(), travesano(1, 'VI', { material: 'H' }), hueco(2, 1, 1), hueco(3, 1, 2)], false],
    ['división con huecos incompletos', [marco(), travesano(1, 'VI'), hueco(2, 1, 1)], false],
    ['travesaño fuera de un hueco del diseño', [marco(), travesano(1, 'VI', { contenidoEn: 9 }), hueco(2, 1, 1, 9), hueco(3, 1, 2, 9)], false],
    ['fijo independiente de corredera', [marco(), vidrio(1, 0)], true],
  ])('no inventa plantilla: %s', (motivo, nodos, fijoIndependiente) => {
    expect(generarPlantillaDisenoPropio({ nodos, fijoIndependiente })).toEqual({ ok: false, motivo })
  })
})
