import { describe, expect, it } from 'vitest'
import { compactoModuloValido } from './compacto-cerramiento.ts'
import {
  compactoAlElegir, explicarIncidenciaCompacto, fusionarOpcionesPredeterminadas,
  marcarOpcionCompacto, opcionesPredeterminadasCompacto, opcionMarcadaCompacto,
} from './opciones-compacto.ts'

describe('opciones de compacto', () => {
  it('COM001 arranca sin guía central y con recogedor', () => {
    expect(opcionesPredeterminadasCompacto('com001')).toEqual(['G1O0', 'G2O2', 'G3O2', 'G10O0'])
  })

  it('un código desconocido no inventa opciones', () => {
    expect(opcionesPredeterminadasCompacto('NO-EXISTE')).toEqual([])
  })

  it('marcar una opción sustituye solo su grupo', () => {
    expect(marcarOpcionCompacto(['G1O0', 'G10O0'], 1, 1)).toEqual(['G10O0', 'G1O1'])
    expect(opcionMarcadaCompacto(['G10O0', 'G1O1'], 1)).toBe(1)
  })

  it('explica la falta con el título del catálogo', () => {
    expect(explicarIncidenciaCompacto('accesorio COM001: grupo G1 sin una opción marcada'))
      .toBe('compacto COM001: falta elegir Guía Central')
    expect(explicarIncidenciaCompacto('artículo X ausente del catálogo')).toBe('artículo X ausente del catálogo')
  })

  it('al elegir propone 155 y, por encima de 1600, 185, con las predeterminadas', () => {
    expect(compactoAlElegir('COM001', 1200)).toMatchObject({
      estructuraCodigo: 'COM001', altoCajonMm: 155, descontarHueco: true, opciones: ['G1O0', 'G2O2', 'G3O2', 'G10O0'],
    })
    expect(compactoAlElegir('COM001', 1601).altoCajonMm).toBe(185)
  })

  it('conserva cajón, guías y opciones si se vuelve a elegir el mismo compacto', () => {
    const previo = compactoAlElegir('COM001', 1200)
    previo.altoCajonMm = 200
    previo.guiaIzquierda = 'PSG90'
    previo.opciones = marcarOpcionCompacto(previo.opciones, 1, 1)
    expect(compactoAlElegir('COM001', 1800, previo)).toMatchObject({
      altoCajonMm: 200, guiaIzquierda: 'PSG90', opciones: ['G2O2', 'G3O2', 'G10O0', 'G1O1'],
    })
  })

  it('la base con filas gana; la vacía cae al catálogo', () => {
    const fusion = fusionarOpcionesPredeterminadas(
      ['COM001', 'COM009'],
      new Map([['COM009', ['G1O1', 'G10O2']]]),
    )
    expect(fusion.get('COM001')).toEqual(['G1O0', 'G2O2', 'G3O2', 'G10O0'])
    expect(fusion.get('COM009')).toEqual(['G1O1', 'G10O2'])
  })

  it('admite las guías y rechaza una guía vacía', () => {
    expect(compactoModuloValido({
      estructuraCodigo: 'COM001', altoCajonMm: 155, guiaIzquierda: 'PSG90', guiaDerecha: 'PSG90',
    })).toBe(true)
    expect(compactoModuloValido({
      estructuraCodigo: 'COM001', altoCajonMm: 155, guiaIzquierda: '  ',
    })).toBe(false)
  })
})
