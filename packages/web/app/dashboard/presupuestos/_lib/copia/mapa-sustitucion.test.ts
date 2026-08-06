import { describe, expect, it } from 'vitest'
import {
  LIMITES_PRODUCTOR, MAPA_VACIO, mapaVacio, normalizarMapa, sustituirCodigo,
} from './mapa-sustitucion.ts'

/** Atajo: el mapa del ejemplo del vídeo (3300 -> 3900, vidrio 484 -> 4164). */
function mapaDelVideo() {
  const resultado = normalizarMapa([
    { ambito: 'SERIE', origen: '3300', destino: '3900RPT' },
    { ambito: 'VIDRIO', origen: '484', destino: '4164' },
    { ambito: 'ACABADO_ACCESORIOS', origen: 'BLANCO', destino: 'NEGRO' },
  ])
  if (!resultado.ok) throw new Error(resultado.errores.join('; '))
  return resultado.mapa
}

describe('mapa de sustitución', () => {
  it('sustituye sólo el código que coincide con un origen del mapa', () => {
    const mapa = mapaDelVideo()
    expect(sustituirCodigo(mapa, 'SERIE', '3300')).toEqual({
      valor: '3900RPT',
      sustitucion: { ambito: 'SERIE', origen: '3300', destino: '3900RPT' },
    })
    expect(sustituirCodigo(mapa, 'VIDRIO', '484').valor).toBe('4164')
    expect(sustituirCodigo(mapa, 'ACABADO_ACCESORIOS', 'BLANCO').valor).toBe('NEGRO')
  })

  it('conserva el código cuando no hay par para ese ámbito o ese valor', () => {
    const mapa = mapaDelVideo()
    // Mismo código, otro ámbito: el mapa es por ámbito, no global.
    expect(sustituirCodigo(mapa, 'VIDRIO', '3300')).toEqual({ valor: '3300', sustitucion: null })
    expect(sustituirCodigo(mapa, 'SERIE', 'ELEGANTPVC')).toEqual({
      valor: 'ELEGANTPVC', sustitucion: null,
    })
    expect(sustituirCodigo(mapa, 'ACABADO_MADERA', 'ROBLE').valor).toBe('ROBLE')
  })

  it('un destino vacío CONSERVA lo que hay: nunca borra', () => {
    const resultado = normalizarMapa([
      { ambito: 'SERIE', origen: '3300', destino: '' },
      { ambito: 'VIDRIO', origen: '484', destino: '   ' },
      { ambito: 'ACABADO_MADERA', origen: 'ROBLE', destino: null },
    ])
    expect(resultado.ok).toBe(true)
    if (!resultado.ok) return
    expect(mapaVacio(resultado.mapa)).toBe(true)
    expect(resultado.descartes.map((descarte) => descarte.motivo))
      .toEqual(['SIN_DESTINO_SE_CONSERVA', 'SIN_DESTINO_SE_CONSERVA', 'SIN_DESTINO_SE_CONSERVA'])
    // Y aplicado sobre una línea real, el código sobrevive intacto.
    expect(sustituirCodigo(resultado.mapa, 'SERIE', '3300')).toEqual({
      valor: '3300', sustitucion: null,
    })
  })

  it('un código nulo sigue nulo: la copia no rellena lo que el origen no tenía', () => {
    expect(sustituirCodigo(mapaDelVideo(), 'ACABADO_MADERA', null))
      .toEqual({ valor: null, sustitucion: null })
    expect(mapaVacio(MAPA_VACIO)).toBe(true)
  })

  it('ignora filas en blanco y pares que no cambian nada', () => {
    const resultado = normalizarMapa([
      { ambito: 'SERIE', origen: '', destino: '' },
      { ambito: 'VIDRIO', origen: '484', destino: '484' },
    ])
    expect(resultado.ok).toBe(true)
    if (!resultado.ok) return
    expect(resultado.mapa.pares).toHaveLength(0)
    expect(resultado.descartes.map((descarte) => descarte.motivo))
      .toEqual(['FILA_VACIA', 'ORIGEN_IGUAL_A_DESTINO'])
  })

  it('rechaza un destino sin origen en vez de adivinar qué hay que cambiar', () => {
    const resultado = normalizarMapa([{ ambito: 'VIDRIO', origen: '', destino: '4164' }])
    expect(resultado.ok).toBe(false)
    if (resultado.ok) return
    expect(resultado.errores[0]).toContain('sin decir qué código hay que sustituir')
  })

  it('descarta el par repetido idéntico y rechaza el origen con dos destinos', () => {
    const repetido = normalizarMapa([
      { ambito: 'SERIE', origen: '3300', destino: '3900RPT' },
      { ambito: 'SERIE', origen: '3300', destino: '3900RPT' },
    ])
    expect(repetido.ok).toBe(true)
    if (!repetido.ok) return
    expect(repetido.mapa.pares).toHaveLength(1)
    expect(repetido.descartes[0].motivo).toBe('PAR_REPETIDO')

    const conflicto = normalizarMapa([
      { ambito: 'SERIE', origen: '3300', destino: '3900RPT' },
      { ambito: 'SERIE', origen: '3300', destino: '4200' },
    ])
    expect(conflicto.ok).toBe(false)
    if (conflicto.ok) return
    expect(conflicto.errores[0]).toContain('aparece dos veces con destinos distintos')
  })

  it('respeta el límite de pares por ámbito, que es un dato configurable', () => {
    const tres = [
      { ambito: 'SERIE' as const, origen: 'A', destino: 'A2' },
      { ambito: 'SERIE' as const, origen: 'B', destino: 'B2' },
      { ambito: 'SERIE' as const, origen: 'C', destino: 'C2' },
    ]
    expect(normalizarMapa(tres).ok).toBe(true)
    expect(LIMITES_PRODUCTOR.SERIE).toBe(3)
    expect(LIMITES_PRODUCTOR.ACABADO_MADERA).toBe(1)

    const cuatro = normalizarMapa([...tres, { ambito: 'SERIE', origen: 'D', destino: 'D2' }])
    expect(cuatro.ok).toBe(false)
    if (cuatro.ok) return
    expect(cuatro.errores[0]).toBe('SERIE: 4 sustituciones para un máximo de 3')

    // El límite no está clavado en el motor: con otros límites, pasa.
    expect(normalizarMapa([...tres, { ambito: 'SERIE', origen: 'D', destino: 'D2' }], {
      ...LIMITES_PRODUCTOR, SERIE: 4,
    }).ok).toBe(true)
  })

  it('recorta espacios de los dos lados antes de comparar', () => {
    const resultado = normalizarMapa([{ ambito: 'SERIE', origen: '  3300 ', destino: ' 3900 ' }])
    expect(resultado.ok).toBe(true)
    if (!resultado.ok) return
    expect(resultado.mapa.pares[0]).toEqual({ ambito: 'SERIE', origen: '3300', destino: '3900' })
  })
})
