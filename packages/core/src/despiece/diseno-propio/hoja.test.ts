import { describe, expect, it } from 'vitest'
import { generarPlantillaDisenoPropio } from './generar-plantilla.ts'
import { TIPO_NODO, type NodoDiseno } from './tipos.ts'
import type { FilaPlantillaCatalogo } from '../linea-catalogo/tipos.ts'

const marco: NodoDiseno = { id: 0, tipo: TIPO_NODO.marco, contenidoEn: -1, tipoMarco: 'NOR', cortes: [1, 1, 1, 1] }
const hoja = (id: number, contenidoEn: number, tipoHoja: number, extra: Partial<NodoDiseno> = {}): NodoDiseno =>
  ({ id, tipo: TIPO_NODO.hoja, contenidoEn, tipoHoja, clase: 'V', vierteaguas: true, accesorios: ['MI'], cortes: [1, 1, 1, 1], ...extra })
const vidrio = (id: number, contenidoEn: number, articulo: string | null = null): NodoDiseno => ({ id, tipo: TIPO_NODO.vidrio, contenidoEn, vidrio: articulo })
/** Travesaño horizontal contado desde abajo con sus dos huecos (ids 2 arriba y 3 abajo). */
const partidoAbajo = (cota: Partial<NodoDiseno>): NodoDiseno[] => [
  { id: 1, tipo: TIPO_NODO.travesano, contenidoEn: 0, posicion: 'HB', division: 1, orden: 1, material: 'M', clase: 'V', ...cota },
  { id: 2, tipo: TIPO_NODO.hueco, contenidoEn: 0, division: 1, orden: 1 },
  { id: 3, tipo: TIPO_NODO.hueco, contenidoEn: 0, division: 1, orden: 2 },
]

function filas(nodos: NodoDiseno[]): FilaPlantillaCatalogo[] {
  const r = generarPlantillaDisenoPropio({ nodos })
  if (!r.ok) throw new Error(r.motivo)
  return r.filas
}
/** Resumen de una fila: componente/artículo, mano, cantidad, módulo, fórmulas, referencia y grupos. */
const resumen = (f: FilaPlantillaCatalogo) => [
  `${f.componente}/${f.articulo}`, f.mano, f.cantidad === 1 ? null : `x${f.cantidad}`, f.disVidrio, f.formulaLargo, f.formulaAncho,
  f.referenciaLargo === null ? null : `ref${f.referenciaLargo}`, f.grupo, [f.grupoIzquierdo, f.grupoDerecho].filter(Boolean).join('/') || null,
].filter(v => v !== null).join(' ')

describe('plantilla de un diseño propio con una pareja de hojas', () => {
  /** Separación invisible con sus dos huecos (ids 2 izquierda y 3 derecha) dentro de `contenidoEn`. */
  const pareja = (tipoHoja: number, contenidoEn = 0, base = 0): NodoDiseno[] => [
    { id: base + 1, tipo: TIPO_NODO.travesano, contenidoEn, posicion: 'VI', division: base + 1, orden: 1, material: 'M', clase: null, invisible: true },
    { id: base + 2, tipo: TIPO_NODO.hueco, contenidoEn, division: base + 1, orden: 1 },
    { id: base + 3, tipo: TIPO_NODO.hueco, contenidoEn, division: base + 1, orden: 2 },
    hoja(base + 4, base + 2, tipoHoja, { accesorios: [] }), hoja(base + 5, base + 3, tipoHoja),
    vidrio(base + 6, base + 4), vidrio(base + 7, base + 5),
  ]

  it('la oscilobatiente a la derecha: la izquierda es pasiva y lleva batiente, retenedor y la mano de obra', () => {
    const f = filas([marco, ...pareja(8)])
    expect(f.slice(5).map(resumen)).toEqual([
      '39/148 1 L A',
      '25/10 I L ref1 HP MH/MH', '25/10 I L ref1 HP MH/MH', '26/15 I (A)/2 ref3 HP MV/MV', '26/15 I (A)/2 ref3 HP MV/MV',
      '51/73 I x2 (A)/2 ref3 HP MV/MV', '29/47 I (A)/2 ref9 VAG E/E', '50/72 I x2 1-1 L ref1 HP MH/MH', 'B/28 I L ref7 B E/E',
      'OBP/94 I L ref1 HP MH/MH', 'OBPH/168 I (A)/2 ref3 HP MV/MV', '58/105 I x4 L ref1 MH/MH', '52/85 I 1-1 L ref1 MH/MH',
      '71/156 x2 1-1 L E/E', '71/156 x2 1-1 A E/E',
      '39/148 22 L (A)/2 ref1', '39/148 10 L (A)/2 ref1', '39/148 37 L A ref1',
      '25/10 D L ref1 HP MH/MH', '25/10 D L ref1 HP MH/MH', '26/15 D (A)/2 ref3 HP MV/MV', '26/15 D (A)/2 ref3 HP MV/MV',
      '51/73 D x2 (A)/2 ref3 HP MV/MV', '29/47 D (A)/2 ref26 VAG E/E', 'OBC/91 D (A)/2 ref3 HP MV/MV', '50/72 D x2 1-1 L ref1 HP MH/MH',
      'OBM/92 D L ref1 HP MH/MH', 'OBCR/93 D L ref1 HP MH/MH', '58/105 D x4 L ref1 MH/MH',
      '1/8 L (A)/2 ref7 C HP/HP', '1/8 L (A)/2 ref24 C HP/HP',
      '39/148 x2 18 18 E/E', '39/148 21 21 E/E',
      '130/310 L E/E',
    ])
    expect(f.filter(x => x.mano).map(x => x.hoja)).toEqual([...Array(12).fill(1), ...Array(11).fill(2)])
    expect(f.filter(x => x.gruposAdicionales[0] === 'B').map(x => x.componente)).toEqual(['26', '26', '51', 'OBPH', '26', '26', '51', 'OBC'])
    expect(f.filter(x => ['22', '10', '37'].includes(x.disVidrio ?? '')).every(x => x.hoja === 1 && x.tipoHoja === '8')).toBe(true)
    expect(f.some(x => x.componente === '16' || x.disVidrio === '41' || x.articulo === '62')).toBe(false)
  })

  it('la oscilobatiente a la izquierda lleva ella el batiente y el retenedor toma la mano de la pasiva', () => {
    const f = filas([marco, ...pareja(9)])
    const de = (numero: number) => f.filter(x => x.hoja === numero && x.mano).map(x => `${x.componente}${x.mano}`).join(' ')
    expect(de(1)).toBe('25I 25I 26I 26I 51I 29I OBCI 50I BI OBMI OBCRI 58I 52D')
    expect(de(2)).toBe('25D 25D 26D 26D 51D 29D 50D OBPD OBPHD 58D')
  })

  it('una pareja bajo un travesaño mide su hueco y la zona de apertura no apoya en el marco', () => {
    const f = filas([marco, ...partidoAbajo({ tipoCota: 1, cota: 300, simbolo: 'FI' }), ...pareja(8, 2, 3), vidrio(11, 3)])
    expect(f.filter(x => x.componente === '71').map(resumen)).toEqual(['71/156 x2 1-1 L-FI', '71/156 x2 1-1 A'])
    expect(f.filter(x => x.componente === '25').map(x => `${x.formulaLargo} ${x.grupoIzquierdo}/${x.grupoDerecho}`)).toEqual(Array(4).fill('L-FI MH/TMP'))
    expect(f.filter(x => x.disVidrio === '41').map(resumen)).toEqual(['39/148 41 FI A ref1'])
    expect(f.filter(x => x.funcion === 'infMOmof').map(x => x.disVidrio)).toEqual(['1', '41', '22', '10', '37', '18', '21'])
  })
})

describe('plantilla de un diseño propio con una hoja', () => {
  it('la hoja abatible en el marco entero sale como la ventana de una hoja del catálogo', () => {
    const f = filas([marco, hoja(1, 0, 1), vidrio(2, 1)])
    expect(f.map(x => x.id)).toEqual([...Array.from({ length: 23 }, (_, i) => i + 1), 0])
    expect(f.slice(5).map(resumen)).toEqual([
      '39/148 1 L A',
      '25/10 D L ref1 HP MH/MH', '25/10 D L ref1 HP MH/MH', '26/15 D A ref3 HP MV/MV', '26/15 D A ref3 HP MV/MV',
      '51/73 D x2 A ref3 HP MV/MV', '29/47 D A ref9 VAG E/E', 'PRC/205 D A ref3 HP MV/MV', '50/72 D x2 0-0 L ref1 HP MH/MH',
      '58/105 D x4 L ref1 MH/MH', '52/85 D 0-0 L ref1 MH/MH', '56/89 D 0-0 L ref1 HP MH/MH',
      '71/156 x2 0-0 L E/E', '71/156 x2 0-0 A E/E',
      '39/148 10 L A ref1', '39/148 29 L A ref1',
      '1/8 L A ref7 C HP/HP',
      '39/148 18 18 E/E',
      '130/310 L E/E',
    ])
    expect(f.slice(6, 22).every(x => x.tipoHoja === '1')).toBe(true)
    expect(f[21]).toMatchObject({ referenciaLargo: 7, referenciaAncho: 9, formulaReferenciaLargo: 'REF', formulaReferenciaAncho: 'REF', grupoSuperior: 'HP', grupoInferior: 'HP' })
    expect(f[22]).toMatchObject({ tipoHoja: '0' })
    expect(f[23]).toMatchObject({ id: 0, funcion: 'AccDisMI', tipoHoja: '1' })
    expect(f.some(x => x.articulo === '62')).toBe(false)
  })

  it('la mano de las filas es la contraria a la del tipo y la oscilobatiente cambia herraje y mano de obra', () => {
    const componentes = (tipo: number) => filas([marco, hoja(1, 0, tipo), vidrio(2, 1)]).filter(x => x.mano).map(x => `${x.componente}${x.mano}`).join(' ')
    expect(componentes(2)).toBe('25I 25I 26I 26I 51I 29I PRCI 50I 58I 52I 56I')
    expect(componentes(5)).toBe('25D 25D 26D 26D 51D 29D OBCD 50D OBMD OBCRD 58D')
    expect(componentes(6)).toBe('25I 25I 26I 26I 51I 29I OBCI 50I OBMI OBCRI 58I')
    expect(filas([marco, hoja(1, 0, 6), vidrio(2, 1)]).filter(x => x.funcion === 'infMOmof').map(x => x.disVidrio)).toEqual(['1', '22', '37', '18'])
  })

  it('sin vierteaguas ni manilla no salen sus filas', () => {
    const f = filas([marco, hoja(1, 0, 1, { vierteaguas: false, accesorios: [] }), vidrio(2, 1)])
    expect(f.some(x => x.componente === '29' || x.componente === '130')).toBe(false)
    expect(f.at(-1)).toMatchObject({ id: 22, disVidrio: '18' })
  })

  it('una hoja en el hueco inferior mide ese hueco y lo deja sin mano de obra de hueco', () => {
    const f = filas([marco, ...partidoAbajo({ tipoCota: 2, cota: 300 }), hoja(4, 3, 2), vidrio(5, 2), vidrio(6, 4)])
    expect(f.slice(5, 12).map(resumen)).toEqual([
      '39/148 1 L A', '16/11 A ref3 TMP MV/MV', '39/148 41 L-300 A ref1',
      '25/10 I 300 ref1 HP TMP/MH', '25/10 I 300 ref1 HP TMP/MH', '26/15 I A ref3 HP MV/MV', '26/15 I A ref3 HP MV/MV',
    ])
    expect(f.filter(x => x.componente === '71').map(resumen)).toEqual(['71/156 x2 0-0 300', '71/156 x2 0-0 A'])
    expect(f.filter(x => x.componente === '1').map(x => [x.formulaLargo, x.formulaReferenciaLargo, x.referenciaLargo, x.referenciaAncho, x.grupoInferior])).toEqual([
      ['L-300', 'REF-300', 1, 3, 'TMP'], ['300', 'REF', 9, 11, 'HP'],
    ])
    expect(f.at(-1)).toMatchObject({ id: 0, componente: '130', formulaLargo: '300' })
  })

  it('la cota variable entra en las fórmulas con su símbolo y nunca con su valor', () => {
    const f = filas([marco, ...partidoAbajo({ tipoCota: 1, cota: 500, simbolo: 'FI' }), hoja(4, 2, 6), vidrio(5, 4), vidrio(6, 3)])
    expect(f[7]).toMatchObject({ disVidrio: '41', formulaLargo: 'FI', formulaReferenciaLargo: 'FI' })
    expect(f[8]).toMatchObject({ componente: '25', formulaLargo: 'L-FI', formulaReferenciaLargo: 'REF-FI', grupoIzquierdo: 'MH', grupoDerecho: 'TMP' })
    expect(f.filter(x => x.componente === '1').map(x => x.formulaLargo)).toEqual(['L-FI', 'FI'])
    expect(JSON.stringify(f)).not.toContain('500')
  })

  it('dos hojas sueltas en huecos de un travesaño real llevan cada una sus filas completas', () => {
    const f = filas([
      marco, { id: 1, tipo: TIPO_NODO.travesano, contenidoEn: 0, posicion: 'VI', division: 1, orden: 1, material: 'M', clase: 'V' },
      { id: 2, tipo: TIPO_NODO.hueco, contenidoEn: 0, division: 1, orden: 1 }, { id: 3, tipo: TIPO_NODO.hueco, contenidoEn: 0, division: 1, orden: 2 },
      hoja(4, 2, 5), hoja(5, 3, 6), vidrio(6, 4), vidrio(7, 5),
    ])
    expect(f.filter(x => x.componente === '71').map(resumen)).toEqual(['71/156 x2 0-0 L', '71/156 x2 0-0 (A)/2', '71/156 x2 0-0 L', '71/156 x2 0-0 (A)/2'])
    expect(f.filter(x => x.funcion === 'infMOmof').map(x => x.disVidrio)).toEqual(['1', '22', '37', '22', '37', '18'])
    expect(f.filter(x => x.componente === '26').map(x => `${x.mano} ${x.grupoIzquierdo}/${x.grupoDerecho} ${x.hoja}`)).toEqual(['D MV/TMP 0', 'D MV/TMP 0', 'I TMP/MV 0', 'I TMP/MV 0'])
    expect(f.filter(x => x.id === 0).map(x => x.tipoHoja)).toEqual(['5', '6'])
    expect(f.some(x => x.disVidrio === '21')).toBe(false)
  })

  it('el barrotillo del vidrio de una hoja lleva el tipo de la hoja', () => {
    const f = filas([marco, hoja(1, 0, 5), vidrio(2, 1, 'VGS616AL33I'), { id: 3, tipo: TIPO_NODO.barrotillo, contenidoEn: 2, articulo: 'BI', horizontales: 1, verticales: 2 }])
    expect(f.filter(x => x.componente === 'BI')).toMatchObject([
      { tipoHoja: '5', cantidad: 1, posicionTrabajo: 'A', formulaLargo: 'A', referenciaLargo: 22 },
      { tipoHoja: '5', cantidad: 2, posicionTrabajo: 'L', formulaLargo: 'L', referenciaLargo: 22 },
    ])
  })
})
