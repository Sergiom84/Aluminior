import { describe, expect, it } from 'vitest'
import {
  AVISO_COMPACTO_SIN_GUIAS, avisoCompactoSinGuias, valorarCompactoLinea, valorarMosquiteraLinea,
  type ArticuloSuperficie,
} from './accesorios-linea.ts'
import { alturaCajonCompacto } from './compacto.ts'

// Configuración leída de la 0017 (copia de la MDB, solo lectura, 19/09).
const COM001: ArticuloSuperficie = {
  codigo: 'COM001', tipoMetraje: 'M2', precioEnTabla: false, precio: '74.65',
  multiploAnchoCm: 5, multiploLargoCm: 5, minimo: '1.5',
}
const PSM001: ArticuloSuperficie = {
  codigo: 'PSM001', tipoMetraje: 'M2', precioEnTabla: false, precio: '56.76',
  multiploAnchoCm: 0, multiploLargoCm: 0, minimo: '1.25',
}
const TRAMOS_COM001 = [
  { altoCajonMm: 155, desdeMm: 1, hastaMm: 1600 },
  { altoCajonMm: 185, desdeMm: 1601, hastaMm: 2600 },
  { altoCajonMm: 200, desdeMm: 2601, hastaMm: 2900 },
]

describe('compacto y mosquitera dentro de la línea (RECON-CERRAMIENTOS §5)', () => {
  const caj = alturaCajonCompacto(TRAMOS_COM001, 1200)!
  const compacto = { altoCajonMm: caj, descontarCajon: true }

  it('COM001 propone cajón 155 a 1200 y 185 por encima de 1600', () => {
    expect(caj).toBe(155)
    expect(alturaCajonCompacto(TRAMOS_COM001, 2100)).toBe(185)
    expect(alturaCajonCompacto(TRAMOS_COM001, 2700)).toBe(200)
  })

  it('COM001 a 1200 x 1200: 1,44 sube al mínimo 1,50 M2 x 74,65 = 111,98', () => {
    expect(valorarCompactoLinea({ anchoHuecoMm: 1200, altoHuecoMm: 1200, compacto, articulo: COM001 }))
      .toEqual({ completo: true, anchoMm: 1200, altoMm: 1200, metraje: '1.50', importe: '111.98' })
  })

  it('PSM001 se valora a la ventana tras el cajón: 1200 x 1045 -> 1,25 M2 x 56,76 = 70,95', () => {
    expect(valorarMosquiteraLinea({ anchoHuecoMm: 1200, altoHuecoMm: 1200, compacto, articulo: PSM001 }))
      .toEqual({ completo: true, anchoMm: 1200, altoMm: 1045, metraje: '1.25', importe: '70.95' })
  })

  it('sin compacto la mosquitera toma la medida completa', () => {
    const valor = valorarMosquiteraLinea({ anchoHuecoMm: 1500, altoHuecoMm: 1500, compacto: null, articulo: PSM001 })
    expect(valor).toMatchObject({ altoMm: 1500, metraje: '2.25', importe: '127.71' })
  })

  it('precio en tabla (PSM004) y artículos sin tarifa no se valoran en cero', () => {
    const plisada = { ...PSM001, codigo: 'PSM004', tipoMetraje: 'UD', precioEnTabla: true }
    expect(valorarMosquiteraLinea({ anchoHuecoMm: 1200, altoHuecoMm: 1200, compacto: null, articulo: plisada }))
      .toMatchObject({ completo: false, importe: null })
    expect(valorarMosquiteraLinea({
      anchoHuecoMm: 1200, altoHuecoMm: 1200, compacto: null, articulo: { ...PSM001, precio: null },
    })).toMatchObject({ completo: false, metraje: '1.44', importe: null })
  })
})

describe('aviso de compacto sin guías', () => {
  const sin = { compacto: null, registro: null, guiaIzquierda: null, guiaDerecha: null }

  it('pide confirmación con compacto o registro y sin guías', () => {
    expect(avisoCompactoSinGuias({ ...sin, compacto: 'COM001' })).toBe(AVISO_COMPACTO_SIN_GUIAS)
    expect(avisoCompactoSinGuias({ ...sin, registro: 'REG01' })).toBe(AVISO_COMPACTO_SIN_GUIAS)
  })

  it('no avisa sin persiana o con guías', () => {
    expect(avisoCompactoSinGuias(sin)).toBeNull()
    expect(avisoCompactoSinGuias({ ...sin, compacto: 'COM001', guiaIzquierda: 'G1', guiaDerecha: 'G1' })).toBeNull()
  })
})
