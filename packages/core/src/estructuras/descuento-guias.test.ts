import { describe, expect, it } from 'vitest'
import { descuentoGuiasCompactoMm, modulosConPiezaALaIzquierda } from './descuento-guias.ts'
import type { ConfiguracionCerramiento } from './cerramiento.ts'

describe('descuento de las guías de persiana en el ancho de la ventana', () => {
  it('resta el descuento de cada guía colocada (260504 de pruebas: 1.200 → 1.094 y 1.200 → 1.160)', () => {
    expect(descuentoGuiasCompactoMm({ descontarHueco: true, guiaIzquierda: 'GMG010', guiaDerecha: 'gmg010' })).toBe(106)
    expect(descuentoGuiasCompactoMm({ descontarHueco: true, guiaIzquierda: 'PSG002' })).toBe(40)
  })

  it('sin guías, sin descuento de hueco o con una guía fuera de la tabla no resta nada', () => {
    expect(descuentoGuiasCompactoMm({ descontarHueco: true })).toBe(0)
    expect(descuentoGuiasCompactoMm({ descontarHueco: false, guiaIzquierda: 'GMG010', guiaDerecha: 'GMG010' })).toBe(0)
    expect(descuentoGuiasCompactoMm({ descontarHueco: true, guiaIzquierda: 'XX9' })).toBe(0)
    expect(descuentoGuiasCompactoMm(null)).toBe(0)
  })

  it('con otra pieza a la izquierda solo descuenta la guía derecha (970 de EMP0016: 1.469 → 1.416)', () => {
    expect(descuentoGuiasCompactoMm({ descontarHueco: true, guiaIzquierda: 'GMG010', guiaDerecha: 'GMG010' }, true)).toBe(53)
  })

  it('detecta las piezas que tienen otra a su izquierda en la misma fila', () => {
    const modulo = (id: string) => ({ id, estructuraCodigo: 'C2', anchoMm: 1000, altoMm: 1000 })
    const configuracion = {
      version: 3, repartoUniones: 'PIEZAS',
      modulos: [modulo('a'), { ...modulo('b'), anclaje: { moduloId: 'a', lado: 'derecha', unionId: 'u1' } },
        { ...modulo('c'), anclaje: { moduloId: 'a', lado: 'abajo', unionId: 'u2' } }],
      uniones: [{ id: 'u1', codigo: 'U', longitudMm: 1000, grosorMm: 1 }, { id: 'u2', codigo: 'U', longitudMm: 1000, grosorMm: 1 }],
    } as unknown as ConfiguracionCerramiento
    expect([...modulosConPiezaALaIzquierda(configuracion)]).toEqual(['b'])
  })

  it('descuenta una sola guía aunque la pieza situada a su izquierda sea un fijo sin compacto (EMP0013 159/269, EMP0014 1042/1074)', () => {
    const configuracion = {
      version: 3, repartoUniones: 'PIEZAS',
      modulos: [
        { id: 'fijo-izq', estructuraCodigo: '0', anchoMm: 785, altoMm: 2215 },
        {
          id: 'ventana-der', estructuraCodigo: 'C2', anchoMm: 1560, altoMm: 2215,
          anclaje: { moduloId: 'fijo-izq', lado: 'derecha', unionId: 'u1' },
          compacto: { estructuraCodigo: 'COM001', altoCajonMm: 185, descontarHueco: true, guiaIzquierda: 'GMG001', guiaDerecha: 'GMG001' },
        },
      ],
      uniones: [{ id: 'u1', codigo: 'GMU003', longitudMm: 2215, grosorMm: 15 }],
    } as unknown as ConfiguracionCerramiento
    const conIzquierda = modulosConPiezaALaIzquierda(configuracion)
    expect(conIzquierda.has('ventana-der')).toBe(true)
    expect(descuentoGuiasCompactoMm(configuracion.modulos[1]!.compacto, conIzquierda.has('ventana-der'))).toBe(40.5)
  })
})
