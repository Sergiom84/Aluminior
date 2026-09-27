import { describe, expect, it } from 'vitest'
import { generarPlantillaCatalogo, type EstructuraCatalogo, type NodoCatalogo } from './diseno-catalogo.ts'

const nodo = (id: number, tipo: number, padre: number, cambios: Partial<NodoCatalogo> = {}): NodoCatalogo => ({
  id, tipo, padre, division: 0, posicion: 0, travesano: '', invisible: false,
  hoja: 0, numeroHoja: 0, tipoCota: 0, cota: 0, equidistantes: 0,
  marco: tipo === 1 ? 'NOR' : '', variantes: [], ...cambios,
})
const estructura = (nodos: NodoCatalogo[], familiaCodigo = '009'): EstructuraCatalogo => ({
  codigo: 'SINTETICA-OPACA', descripcion: 'Fixture de traducción', familiaCodigo,
  anchoMm: 1100, altoMm: 1600, nodos,
})
const parejaConFijo = (travesano = 'HB'): EstructuraCatalogo => estructura([
  nodo(20, 1, -1),
  nodo(30, 6, 20, { division: 2, travesano, tipoCota: 1, cota: 240 }),
  nodo(40, 2, 20, { division: 2, posicion: 1 }),
  nodo(50, 2, 20, { division: 2, posicion: 2 }),
  nodo(60, 6, 40, { division: 8, travesano: 'VI', invisible: true, equidistantes: 2 }),
  nodo(70, 2, 40, { division: 8, posicion: 1 }),
  nodo(80, 2, 40, { division: 8, posicion: 2 }),
  nodo(90, 3, 70, { hoja: 10, numeroHoja: 1 }),
  nodo(100, 3, 80, { hoja: 10, numeroHoja: 2 }),
  nodo(110, 5, 90), nodo(120, 5, 100), nodo(130, 5, 50),
], '001')

describe('traducción de fijos y parejas correderas con árbol acreditado', () => {
  it('traduce un fijo de corredera con código opaco sin convertirlo en hoja móvil', () => {
    expect(generarPlantillaCatalogo(estructura([nodo(20, 1, -1), nodo(40, 5, 20)])))
      .toMatchObject({ estado: 'dibujable', familiaCodigo: '009', plantilla: {
        codigo: 'SINTETICA-OPACA', familia: 'FIJOS', composicion: { tipo: 'hueco', apertura: 'fijo' },
      } })
  })

  it('conserva el parteluz visible equidistante del fijo de corredera', () => {
    const e = estructura([
      nodo(20, 1, -1),
      nodo(30, 6, 20, { division: 7, travesano: 'VI', equidistantes: 2 }),
      nodo(40, 2, 20, { division: 7, posicion: 1 }),
      nodo(50, 2, 20, { division: 7, posicion: 2 }), nodo(60, 5, 40), nodo(70, 5, 50),
    ])
    expect(generarPlantillaCatalogo(e)).toMatchObject({ estado: 'dibujable', plantilla: {
      composicion: { eje: 'vertical', separador: 'travesano', hijos: [
        { proporcion: 550, nodo: { apertura: 'fijo' } },
        { proporcion: 550, nodo: { apertura: 'fijo' } },
      ] },
    } })
  })

  it.each(['marco', 'hoja', 'variante', 'familia'] as const)('no extiende el fijo a %s sin evidencia', cambio => {
    const e = estructura([nodo(20, 1, -1), nodo(40, 5, 20)])
    if (cambio === 'marco') e.nodos[0].marco = '3C'
    if (cambio === 'hoja') Object.assign(e.nodos[1], { tipo: 3, hoja: 5 })
    if (cambio === 'variante') e.nodos[0].variantes = ['bPerInf']
    if (cambio === 'familia') e.familiaCodigo = '013'
    expect(generarPlantillaCatalogo(e).estado).toBe('pendiente')
  })

  it.each([
    ['HB', 'fin', 1360, 240], ['HA', 'inicio', 240, 1360],
    ['VD', 'fin', 860, 240], ['VI', 'inicio', 240, 860],
  ] as const)('conserva distancia absoluta desde %s y el par corredera dentro del hueco',
    (travesano, desde, primero, segundo) => {
      const resultado = generarPlantillaCatalogo(parejaConFijo(travesano))
      expect(resultado).toMatchObject({ estado: 'dibujable', plantilla: { composicion: {
        cotaFija: { desde, mm: 240 }, hijos: [
          { proporcion: primero, nodo: { tipo: 'division', separador: 'division-invisible', hijos: [
            { nodo: { apertura: 'corredera-derecha', manilla: false } },
            { nodo: { apertura: 'corredera-izquierda', manilla: false } },
          ] } },
          { proporcion: segundo, nodo: { apertura: 'fijo' } },
        ],
      } } })
    })

  it('conserva las dos cotas independientes en divisiones anidadas', () => {
    const e = parejaConFijo()
    e.nodos[0].padre = 3
    e.nodos[0].tipo = 2
    const resultado = generarPlantillaCatalogo({ ...e, nodos: [
      nodo(0, 1, -1), nodo(1, 6, 0, { division: 1, travesano: 'HA', tipoCota: 1, cota: 180 }),
      nodo(2, 2, 0, { division: 1, posicion: 1 }),
      nodo(3, 2, 0, { division: 1, posicion: 2 }), nodo(4, 5, 2), ...e.nodos,
    ] })
    expect(resultado).toMatchObject({ estado: 'dibujable', plantilla: { composicion: {
      cotaFija: { desde: 'inicio', mm: 180 }, hijos: [
        { proporcion: 180, nodo: { apertura: 'fijo' } },
        { proporcion: 1420, nodo: { cotaFija: { desde: 'fin', mm: 240 }, hijos: [
          { proporcion: 1180 }, { proporcion: 240 },
        ] } },
      ],
    } } })
  })

  it.each(['numero', 'parentesco', 'separador', 'carril', 'extra', 'superficie', 'cota'] as const)(
    'rechaza un par corredera no acreditado: %s', cambio => {
      const e = parejaConFijo()
      if (cambio === 'numero') e.nodos[8].numeroHoja = 1
      if (cambio === 'parentesco') e.nodos[6].padre = 50
      if (cambio === 'separador') e.nodos[4].invisible = false
      if (cambio === 'carril') e.nodos[0].marco = '3C'
      if (cambio === 'extra') e.nodos = [...e.nodos, nodo(140, 3, 50, { hoja: 10, numeroHoja: 1 })]
      if (cambio === 'superficie') e.nodos[9].tipo = 2
      if (cambio === 'cota') e.nodos[1].cota = 1600
      expect(generarPlantillaCatalogo(e).estado).toBe('pendiente')
    })
})
