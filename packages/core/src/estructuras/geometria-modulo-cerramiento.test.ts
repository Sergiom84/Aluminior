import { describe, expect, it } from 'vitest'
import { distribuirModuloCerramiento } from './geometria-modulo-cerramiento.ts'
import { distribuirComposicion, plantillaDiseno } from './diseno.ts'

const modulo = (altoMm: number, fiMm: number) => ({
  id: 'modulo-1', estructuraCodigo: '1OFI', anchoMm: 900, altoMm, fiMm,
})

describe('representación geométrica de módulo 1OFI', () => {
  it.each([
    [1500, 300, 1200],
    [1800, 300, 1500],
    [1800, 400, 1400],
  ])('centra el travesaño en el eje físico para alto %s y FI %s', (altoMm, fiMm, ejeY) => {
    const elementos = distribuirModuloCerramiento(
      modulo(altoMm, fiMm), { x: 0, y: 0, ancho: 900, alto: altoMm }, 18,
    )
    const travesano = elementos.find((elemento) => elemento.tipo === 'separador')!

    expect(travesano.y + travesano.alto / 2).toBe(ejeY)
    expect(altoMm - (travesano.y + travesano.alto / 2)).toBe(fiMm)
  })

  it('mantiene el reparto legado cuando FI está ausente', () => {
    const rect = { x: 0, y: 0, ancho: 900, alto: 1800 }
    const elementos = distribuirModuloCerramiento({
      id: 'modulo-1', estructuraCodigo: '1OFI', anchoMm: 900, altoMm: 1800,
    }, rect, 18)

    expect(elementos).toEqual(distribuirComposicion(
      plantillaDiseno('1OFI')!.composicion, rect, 18,
    ))
  })
})
