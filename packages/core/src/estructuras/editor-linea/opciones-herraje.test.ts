import { describe, expect, it } from 'vitest'
import {
  CATEGORIA_HERRAJE_TODAS, alternarOpcionHerraje, categoriasOpcionesHerraje, estadoOpcionesHerraje,
  filtrarPorCategoriaHerraje, opcionesHerrajeVisibles, seleccionInicialHerraje,
  type OpcionHerrajeCatalogo,
} from './opciones-herraje.ts'

const opcion = (codigo: string, extra: Partial<OpcionHerrajeCatalogo> = {}): OpcionHerrajeCatalogo => ({
  codigo, descripcion: `OPCION ${codigo}`, porDefecto: false, oculta: false, categoria: null, ...extra,
})

// Configuración de las capturas 5.1.2.12.7.7.2-012 a -014 del CHM.
const cerraduras = [
  opcion('11', { categoria: 'CER', incompatible: 'o12+o13' }),
  opcion('12', { categoria: 'CER', incompatible: 'o11+o13' }),
  opcion('13', { categoria: 'CER', incompatible: 'o11+o12' }),
  opcion('1', { porDefecto: true }),
  opcion('2', { porDefecto: true }),
]

describe('opciones de herraje de la línea', () => {
  it('oculta las opciones ocultas y ordena por número', () => {
    const visibles = opcionesHerrajeVisibles([opcion('12'), opcion('3', { oculta: true }), opcion('2')])
    expect(visibles.map((o) => o.codigo)).toEqual(['2', '12'])
  })

  it('la marca inicial son las opciones con Selec., incluidas las ocultas', () => {
    const inicial = seleccionInicialHerraje([
      opcion('1', { porDefecto: true }), opcion('5', { porDefecto: true, oculta: true }), opcion('11'),
    ])
    expect([...inicial].sort()).toEqual(['1', '5'])
  })

  it('al marcar 11 quedan bloqueadas 12 y 13 por incompatibles', () => {
    const marcadas = alternarOpcionHerraje(cerraduras, seleccionInicialHerraje(cerraduras), '11')
    const estado = estadoOpcionesHerraje(cerraduras, marcadas)
    const de = (c: string) => estado.find((e) => e.codigo === c)!
    expect(de('11')).toMatchObject({ seleccionada: true, operable: true })
    expect(de('12')).toMatchObject({ seleccionada: false, operable: false, motivo: 'incompatible' })
    expect(de('13').motivo).toBe('incompatible')
    expect(alternarOpcionHerraje(cerraduras, marcadas, '12')).toEqual(marcadas)
  })

  it('al desmarcar 11 se liberan las demás', () => {
    const marcadas = alternarOpcionHerraje(cerraduras, new Set(['11']), '11')
    expect(estadoOpcionesHerraje(cerraduras, marcadas).every((e) => e.operable)).toBe(true)
  })

  it('Activa sólo Si: el bombín 40 sólo es operable con 11 o 12 marcadas (5.1.2.12.7.7.2-010/-011)', () => {
    const catalogo = [opcion('11'), opcion('12'), opcion('40', { activaSoloSi: 'o11+o12' })]
    const sin = estadoOpcionesHerraje(catalogo, new Set()).find((e) => e.codigo === '40')!
    expect(sin).toMatchObject({ operable: false, motivo: 'condicion-no-cumplida' })
    expect(alternarOpcionHerraje(catalogo, new Set(), '40').has('40')).toBe(false)
    const con = alternarOpcionHerraje(catalogo, new Set(['12']), '40')
    expect(con.has('40')).toBe(true)
  })

  it('Activa sólo Si con Y lógico: 30 exige 11 y 20 a la vez', () => {
    const catalogo = [opcion('11'), opcion('20'), opcion('30', { activaSoloSi: 'o11*o20' })]
    expect(alternarOpcionHerraje(catalogo, new Set(['11']), '30').has('30')).toBe(false)
    expect(alternarOpcionHerraje(catalogo, new Set(['11', '20']), '30').has('30')).toBe(true)
  })

  it('incompatibilidad simétrica observada en la 0017: 1 CREMONA frente a 4 CERRADURA', () => {
    const catalogo = [
      opcion('1', { porDefecto: true, incompatible: 'o4' }), opcion('2', { porDefecto: true }),
      opcion('4', { incompatible: 'o1' }), opcion('980', { porDefecto: true }),
    ]
    const inicial = seleccionInicialHerraje(catalogo)
    expect([...inicial].sort()).toEqual(['1', '2', '980'])
    expect(estadoOpcionesHerraje(catalogo, inicial).find((e) => e.codigo === '4')!.motivo).toBe('incompatible')
    const sinCremona = alternarOpcionHerraje(catalogo, inicial, '1')
    const conCerradura = alternarOpcionHerraje(catalogo, sinCremona, '4')
    expect(conCerradura.has('4')).toBe(true)
    expect(estadoOpcionesHerraje(catalogo, conCerradura).find((e) => e.codigo === '1')!.motivo).toBe('incompatible')
  })

  it('categoría excluyente: sólo una opción marcada a la vez', () => {
    const catalogo = [opcion('23', { categoria: 'MAN' }), opcion('24', { categoria: 'MAN' })]
    const excluyentes = new Set(['MAN'])
    const estado = estadoOpcionesHerraje(catalogo, new Set(['23']), excluyentes)
    expect(estado.find((e) => e.codigo === '24')!.motivo).toBe('categoria-excluyente')
    expect(estadoOpcionesHerraje(catalogo, new Set(['23'])).every((e) => e.operable)).toBe(true)
  })

  it('una fórmula mal formada bloquea la opción en vez de ignorarla', () => {
    const estado = estadoOpcionesHerraje([opcion('11', { incompatible: 'o12+' })], new Set())
    expect(estado[0]).toMatchObject({ operable: false, motivo: 'formula-invalida' })
  })

  it('no se puede marcar un código ajeno al catálogo ni uno oculto', () => {
    const catalogo = [opcion('11'), opcion('3', { oculta: true })]
    expect(alternarOpcionHerraje(catalogo, new Set(), '99').size).toBe(0)
    expect(alternarOpcionHerraje(catalogo, new Set(), '3').size).toBe(0)
  })

  it('desplegable de categorías con *** TODAS y descripciones observadas', () => {
    const catalogo = [
      opcion('11', { categoria: 'CER' }), opcion('30', { categoria: 'TIR' }),
      opcion('5', { categoria: 'BIS', oculta: true }),
    ]
    expect(categoriasOpcionesHerraje(catalogo)).toEqual([
      { codigo: CATEGORIA_HERRAJE_TODAS, etiqueta: '*** TODAS' },
      { codigo: 'CER', etiqueta: 'CER CERRADURAS' },
      { codigo: 'TIR', etiqueta: 'TIR TIRADORES' },
    ])
    expect(categoriasOpcionesHerraje(catalogo, { CER: 'CIERRES' })[1].etiqueta).toBe('CER CIERRES')
    const estado = estadoOpcionesHerraje(catalogo, new Set())
    expect(filtrarPorCategoriaHerraje(estado, 'CER').map((e) => e.codigo)).toEqual(['11'])
    expect(filtrarPorCategoriaHerraje(estado, CATEGORIA_HERRAJE_TODAS)).toHaveLength(2)
  })
})
