import { describe, expect, it } from 'vitest'
import { generarPlantillaCatalogo, type EstructuraCatalogo, type NodoCatalogo } from './diseno-catalogo.ts'

const nodo = (id: number, tipo: number, padre: number, cambios: Partial<NodoCatalogo> = {}): NodoCatalogo => ({
  id, tipo, padre, division: 0, posicion: 0, travesano: '', invisible: false,
  hoja: 0, numeroHoja: 0, tipoCota: 0, cota: 0, equidistantes: 0,
  marco: tipo === 1 ? 'NOR' : '', variantes: [], ...cambios,
})
const entrada = (nodos: NodoCatalogo[]): EstructuraCatalogo => ({
  codigo: 'PRUEBA-SINTETICA', descripcion: 'Prueba sintética', familiaCodigo: '005',
  anchoMm: 1200, altoMm: 1500, nodos,
})
const dividido = () => entrada([
  nodo(0, 1, -1),
  nodo(1, 6, 0, { division: 1, travesano: 'HB', tipoCota: 1, cota: 300 }),
  nodo(2, 2, 0, { division: 1, posicion: 1 }),
  nodo(3, 2, 0, { division: 1, posicion: 2 }),
  nodo(4, 3, 2, { hoja: 6 }), nodo(5, 5, 4), nodo(6, 5, 3),
])

describe('generador conservador de candidatas visuales', () => {
  it('no interpreta el código opaco y dibuja un fijo simple', () => {
    const resultado = generarPlantillaCatalogo(entrada([nodo(0, 1, -1), nodo(1, 5, 0)]))
    expect(resultado).toMatchObject({ estado: 'dibujable', familiaCodigo: '005',
      plantilla: { codigo: 'PRUEBA-SINTETICA', composicion: { tipo: 'hueco', apertura: 'fijo' } } })
  })

  it('sitúa una cota inferior de 300 y conserva la mano a la medida inicial', () => {
    const resultado = generarPlantillaCatalogo(dividido())
    expect(resultado).toMatchObject({ estado: 'dibujable', plantilla: { composicion: {
      eje: 'horizontal', separador: 'travesano', hijos: [
        { proporcion: 1200, nodo: { apertura: 'oscilobatiente-izquierda' } },
        { proporcion: 300, nodo: { apertura: 'fijo' } },
      ],
    } } })
  })

  it('mantiene divisiones invisibles y rechaza grupos incoherentes', () => {
    const e = dividido()
    Object.assign(e.nodos[1], { travesano: 'VI', tipoCota: 0, cota: 0, equidistantes: 2, invisible: true })
    expect(generarPlantillaCatalogo(e)).toMatchObject({ estado: 'dibujable', plantilla: {
      composicion: { eje: 'vertical', separador: 'division-invisible' },
    } })
    e.nodos[3].division = 99
    expect(generarPlantillaCatalogo(e)).toEqual({ estado: 'pendiente', motivos: ['división no regular'] })
  })

  it.each([4, 9, 16, 19, 999])('no oculta el nodo no soportado %i', tipo => {
    expect(generarPlantillaCatalogo(entrada([nodo(0, 1, -1), nodo(1, tipo, 0)])))
      .toMatchObject({ estado: 'pendiente', motivos: [`tipo de nodo ${tipo}`] })
  })

  it('rechaza hojas desconocidas sin aproximarlas a abatibles', () => {
    const e = dividido()
    e.nodos[4].hoja = 999
    expect(generarPlantillaCatalogo(e)).toMatchObject({ estado: 'pendiente', motivos: ['tipo de hoja 999/0'] })
  })

  it.each([
    [7, ['abatible-izquierda', 'abatible-derecha']],
    [8, ['abatible-izquierda', 'oscilobatiente-derecha']],
  ] as const)('etiqueta el par experimental tipo %s con bisagras exteriores sin deducir manillas',
    (tipoHoja, aperturas) => {
      const e = entrada([
        nodo(0, 1, -1),
        nodo(1, 6, 0, { division: 1, travesano: 'VI', invisible: true, equidistantes: 2 }),
        nodo(2, 2, 0, { division: 1, posicion: 1 }),
        nodo(3, 2, 0, { division: 1, posicion: 2 }),
        nodo(4, 3, 2, { hoja: tipoHoja, numeroHoja: 1 }), nodo(5, 5, 4),
        nodo(6, 3, 3, { hoja: tipoHoja, numeroHoja: 2 }), nodo(7, 5, 6),
      ])
      const resultado = generarPlantillaCatalogo(e)
      expect(resultado.estado).toBe('dibujable')
      if (resultado.estado !== 'dibujable' || resultado.plantilla.composicion.tipo !== 'division') return
      expect(resultado.plantilla.composicion.hijos.map((hijo) => {
        if (hijo.nodo.tipo !== 'hueco') throw new Error('Se esperaba hueco')
        return [hijo.nodo.apertura, hijo.nodo.manilla]
      })).toEqual(aperturas.map((apertura) => [apertura, undefined]))
    })

  it('rechaza IDs duplicados, nodos huérfanos y cotas imposibles', () => {
    const e = dividido()
    expect(generarPlantillaCatalogo({ ...e, nodos: [...e.nodos, e.nodos[0]] }))
      .toMatchObject({ estado: 'pendiente', motivos: ['identificadores duplicados', 'marco raíz no único'] })
    expect(generarPlantillaCatalogo({ ...e, nodos: [...e.nodos, nodo(88, 5, 99)] }))
      .toEqual({ estado: 'pendiente', motivos: ['nodos huérfanos'] })
    e.nodos[1].cota = 1500
    expect(generarPlantillaCatalogo(e)).toEqual({ estado: 'pendiente', motivos: ['regla de cota sin verificar'] })
  })

  it('rechaza una hoja con subdivisión aún no representable', () => {
    const e = dividido()
    e.nodos[5].tipo = 2
    expect(generarPlantillaCatalogo(e)).toEqual({ estado: 'pendiente', motivos: ['hoja con superficie no simple'] })
  })

  it('rechaza variantes sin evidencia en cualquier familia', () => {
    const e = dividido()
    e.familiaCodigo = '001'
    e.nodos[0].variantes = ['bPerInf']
    expect(generarPlantillaCatalogo(e)).toEqual({ estado: 'pendiente', motivos: ['variante bPerInf'] })
  })

  const pareja = (tipoHoja: number, marco = 'NOR') => entrada([
    nodo(0, 1, -1, { marco }),
    nodo(1, 6, 0, { division: 1, travesano: 'VI', invisible: true, equidistantes: 2 }),
    nodo(2, 2, 0, { division: 1, posicion: 1 }),
    nodo(3, 2, 0, { division: 1, posicion: 2 }),
    nodo(4, 3, 2, { hoja: tipoHoja, numeroHoja: 1 }), nodo(5, 5, 4),
    nodo(6, 3, 3, { hoja: tipoHoja, numeroHoja: 2 }), nodo(7, 5, 6),
  ])
  const huecos = (resultado: ReturnType<typeof generarPlantillaCatalogo>) => {
    if (resultado.estado !== 'dibujable' || resultado.plantilla.composicion.tipo !== 'division') {
      throw new Error('Se esperaba una división dibujable')
    }
    return resultado.plantilla.composicion.hijos.map((hijo) => {
      if (hijo.nodo.tipo !== 'hueco') throw new Error('Se esperaba hueco')
      return [hijo.nodo.apertura, hijo.nodo.manilla]
    })
  }

  it('dibuja la corredera de dos hojas (tipo 10) sin manilla ni sentido', () => {
    const resultado = generarPlantillaCatalogo({ ...pareja(10), familiaCodigo: '001' })
    expect(resultado).toMatchObject({ estado: 'dibujable', familiaCodigo: '001',
      plantilla: { familia: 'CATALOGO' } })
    expect(huecos(resultado)).toEqual([['corredera', false], ['corredera', false]])
  })

  it.each([13, 14, 16, 70])('reconoce la hoja corredera tipo %i', (tipoHoja) => {
    expect(huecos(generarPlantillaCatalogo(pareja(tipoHoja)))).toEqual([['corredera', false], ['corredera', false]])
  })

  it('reconoce la puerta balconera de dos hojas (15) como la ventana de dos hojas', () => {
    expect(huecos(generarPlantillaCatalogo(pareja(15, 'PTA'))))
      .toEqual([['abatible-izquierda', undefined], ['abatible-derecha', undefined]])
  })

  it('asigna la mano declarada en la descripción a las abatibles de una hoja', () => {
    const una = (hoja: number) => entrada([nodo(0, 1, -1), nodo(1, 3, 0, { hoja }), nodo(2, 5, 1)])
    expect(generarPlantillaCatalogo(una(1))).toMatchObject({ estado: 'dibujable',
      plantilla: { composicion: { apertura: 'abatible-derecha' } } })
    expect(generarPlantillaCatalogo(una(2))).toMatchObject({ estado: 'dibujable',
      plantilla: { composicion: { apertura: 'abatible-izquierda' } } })
  })

  it('no dibuja como recta una estructura con arco o inclinación', () => {
    const e = pareja(7)
    e.nodos[0].curva = 1
    expect(generarPlantillaCatalogo(e)).toEqual({ estado: 'pendiente', motivos: ['curva sin representar'] })
  })

  it('rechaza un marco desconocido', () => {
    expect(generarPlantillaCatalogo(pareja(10, 'XYZ'))).toEqual({ estado: 'pendiente', motivos: ['marco XYZ'] })
  })
})
