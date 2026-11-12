import { describe, expect, it } from 'vitest'
import {
  compactoEfectivoModulo,
  compactoModuloValido,
  indiceModuloCompacto,
  modulosSuperioresCerramiento,
  type CompactoModulo,
} from './compacto-cerramiento.ts'
import { esConfiguracionCerramiento } from './validar-configuracion-cerramiento.ts'
import { VERSION_COMPOSICION_CERRAMIENTO } from './versiones-cerramiento.ts'
import type { ConfiguracionCerramientoV3 } from './cerramiento.ts'

describe('compactoModuloValido', () => {
  it('admite undefined', () => {
    expect(compactoModuloValido(undefined)).toBe(true)
  })

  it('admite compacto con campos mínimos obligatorios', () => {
    expect(compactoModuloValido({ estructuraCodigo: 'COM009', altoCajonMm: 155 })).toBe(true)
  })

  it('admite compacto con todos los campos opcionales válidos', () => {
    const completo: CompactoModulo = {
      estructuraCodigo: 'COM009',
      altoCajonMm: 185,
      acabadoCodigo: 'BLANCO',
      opciones: ['G1O1', 'G10O2'],
      alturaTotalMm: 1550,
      vueloIzquierdoMm: 40,
      vueloDerechoMm: 40,
      posicionGuiaCentralMm: 500,
      descuentoVerticalMm: 0,
    }
    expect(compactoModuloValido(completo)).toBe(true)
  })

  it('rechaza no-objetos, nulos o arrays', () => {
    expect(compactoModuloValido(null)).toBe(false)
    expect(compactoModuloValido('COM009')).toBe(false)
    expect(compactoModuloValido([])).toBe(false)
    expect(compactoModuloValido(123)).toBe(false)
  })

  it('rechaza estructuraCodigo vacía o no string', () => {
    expect(compactoModuloValido({ estructuraCodigo: '', altoCajonMm: 155 })).toBe(false)
    expect(compactoModuloValido({ estructuraCodigo: '   ', altoCajonMm: 155 })).toBe(false)
    expect(compactoModuloValido({ altoCajonMm: 155 })).toBe(false)
  })

  it('rechaza altoCajonMm no finito, <= 0 o ausente', () => {
    expect(compactoModuloValido({ estructuraCodigo: 'COM009', altoCajonMm: 0 })).toBe(false)
    expect(compactoModuloValido({ estructuraCodigo: 'COM009', altoCajonMm: -155 })).toBe(false)
    expect(compactoModuloValido({ estructuraCodigo: 'COM009', altoCajonMm: NaN })).toBe(false)
    expect(compactoModuloValido({ estructuraCodigo: 'COM009' })).toBe(false)
  })

  it('rechaza opciones mal formateadas o no strings', () => {
    expect(compactoModuloValido({ estructuraCodigo: 'COM009', altoCajonMm: 155, opciones: [''] })).toBe(false)
    expect(compactoModuloValido({ estructuraCodigo: 'COM009', altoCajonMm: 155, opciones: [123 as unknown as string] })).toBe(false)
  })
})

describe('compactoEfectivoModulo', () => {
  it('devuelve null si no hay compacto en el módulo', () => {
    expect(compactoEfectivoModulo({}, { acabadoCodigo: 'BLANCO' })).toBeNull()
  })

  it('sin acabado propio toma el de la ventana y no el de accesorios (260504 de pruebas, 12/11/2026)', () => {
    const c1 = compactoEfectivoModulo(
      { compacto: { estructuraCodigo: 'com009', altoCajonMm: 155 } },
      { acabadoCodigo: 'blanco', acabadoAccesoriosCodigo: 'negro' },
    )
    expect(c1).toEqual({
      estructura: 'COM009',
      acabado: 'BLANCO',
      opciones: [],
      altoCajonMm: 155,
      vueloIzquierdoMm: 0,
      vueloDerechoMm: 0,
      posicionGuiaCentralMm: 0,
      descuentoVerticalMm: 0,
    })

    const c2 = compactoEfectivoModulo(
      { compacto: { estructuraCodigo: 'com009', altoCajonMm: 155 } },
      { acabadoCodigo: 'blanco' },
    )
    expect(c2?.acabado).toBe('BLANCO')

    const c3 = compactoEfectivoModulo(
      { compacto: { estructuraCodigo: 'com009', altoCajonMm: 155 } },
      {},
    )
    expect(c3?.acabado).toBe('UNI')
  })

  it('pasa al despiece las guías de cada lado en mayúsculas y omite las vacías', () => {
    const c = compactoEfectivoModulo(
      { compacto: { estructuraCodigo: 'com005', altoCajonMm: 155, guiaIzquierda: ' gmg010 ', acabadoGuiasCodigo: ' vs ' } }, {},
    )
    expect(c?.guiaIzquierda).toBe('GMG010')
    expect(c?.acabadoGuias).toBe('VS')
    expect(c && 'guiaDerecha' in c).toBe(false)
  })

  it('respeta acabado propio y opciones cuando se especifican', () => {
    const c = compactoEfectivoModulo(
      {
        compacto: {
          estructuraCodigo: 'com009',
          altoCajonMm: 155,
          acabadoCodigo: 'oro',
          opciones: ['G1O1'],
          alturaTotalMm: 1600,
        },
      },
      { acabadoCodigo: 'blanco' },
    )
    expect(c).toEqual({
      estructura: 'COM009',
      acabado: 'ORO',
      opciones: ['G1O1'],
      altoCajonMm: 155,
      vueloIzquierdoMm: 0,
      vueloDerechoMm: 0,
      posicionGuiaCentralMm: 0,
      descuentoVerticalMm: 0,
      alturaTotalMm: 1600,
    })
  })
})

describe('validar-configuracion-cerramiento con compacto', () => {
  const baseV3: ConfiguracionCerramientoV3 = {
    version: VERSION_COMPOSICION_CERRAMIENTO,
    modulos: [
      { id: 'm1', estructuraCodigo: '2O', anchoMm: 1200, altoMm: 1000 },
      {
        id: 'm2',
        estructuraCodigo: '2O',
        anchoMm: 1200,
        altoMm: 1000,
        anclaje: { moduloId: 'm1', unionId: 'u1', lado: 'derecha' },
        compacto: { estructuraCodigo: 'COM009', altoCajonMm: 155 },
      },
    ],
    uniones: [{ id: 'u1', codigo: 'PSU001', longitudMm: 1000, grosorMm: 5 }],
  }

  it('acepta configuración v3 con compacto válido', () => {
    expect(esConfiguracionCerramiento(baseV3)).toBe(true)
  })

  it('rechaza configuración v3 con compacto inválido', () => {
    const invalida = {
      ...baseV3,
      modulos: [
        baseV3.modulos[0]!,
        {
          ...baseV3.modulos[1]!,
          compacto: { estructuraCodigo: '', altoCajonMm: 0 },
        },
      ],
    }
    expect(esConfiguracionCerramiento(invalida)).toBe(false)
  })

  it('rechaza versión 1 o 2 con campo compacto', () => {
    const v1ConCompacto = {
      version: 1,
      modulos: [
        {
          id: 'm1',
          estructuraCodigo: '2O',
          anchoMm: 1200,
          altoMm: 1000,
          compacto: { estructuraCodigo: 'COM009', altoCajonMm: 155 },
        },
      ],
      uniones: [],
    }
    expect(esConfiguracionCerramiento(v1ConCompacto)).toBe(false)
  })
})

describe('modulosSuperioresCerramiento e indiceModuloCompacto (EMP0016: 871, 1339, 1368)', () => {
  it('numera nModulo sobre la fila superior cuando un fijo inferior tiene Orden menor que una ventana superior', () => {
    // Caso real anonimizado de EMP0016 (presupuesto 871, caso-02815):
    // modulo-1 (2O), modulo-3 (2O a la derecha), modulo-5 (fijo 0 abajo de modulo-1), modulo-7 (1OI a la derecha de modulo-3).
    const modulos = [
      { id: 'modulo-1' },
      { id: 'modulo-3', anclaje: { moduloId: 'modulo-1', unionId: 'union-2', lado: 'derecha' as const } },
      { id: 'modulo-5', anclaje: { moduloId: 'modulo-1', unionId: 'union-4', lado: 'abajo' as const } },
      { id: 'modulo-7', anclaje: { moduloId: 'modulo-3', unionId: 'union-6', lado: 'derecha' as const } },
    ]
    expect(modulosSuperioresCerramiento(modulos)).toEqual(['modulo-1', 'modulo-3', 'modulo-7'])
    expect(indiceModuloCompacto(modulos, 1)).toBe(0)
    expect(indiceModuloCompacto(modulos, 2)).toBe(1)
    expect(indiceModuloCompacto(modulos, 3)).toBe(3)
    expect(indiceModuloCompacto(modulos, 4)).toBeNull()
  })

  it('salta toda la columna inferior cuando se apila primero hacia abajo y luego hacia la derecha (1339 y 1368)', () => {
    // Caso real anonimizado de EMP0016 (presupuesto 1368, caso-02996):
    // modulo-1 (PC2), modulo-3 (PC2 abajo de modulo-1), modulo-5 (2O derecha de modulo-1), modulo-7 (2O derecha de modulo-5).
    const modulos = [
      { id: 'modulo-1' },
      { id: 'modulo-3', anclaje: { moduloId: 'modulo-1', unionId: 'union-2', lado: 'abajo' as const } },
      { id: 'modulo-5', anclaje: { moduloId: 'modulo-1', unionId: 'union-4', lado: 'derecha' as const } },
      { id: 'modulo-7', anclaje: { moduloId: 'modulo-5', unionId: 'union-6', lado: 'derecha' as const } },
    ]
    expect(modulosSuperioresCerramiento(modulos)).toEqual(['modulo-1', 'modulo-5', 'modulo-7'])
    expect(indiceModuloCompacto(modulos, 1)).toBe(0)
    expect(indiceModuloCompacto(modulos, 2)).toBe(2)
    expect(indiceModuloCompacto(modulos, 3)).toBe(3)
  })
})
