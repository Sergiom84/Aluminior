import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buscarVentanasPorCodigo, registrarEstructurasSinDibujo, type EstructuraSinDibujo,
} from '@aluminior/core/estructuras'
import { resolverCodigoCatalogo } from './codigo-catalogo.ts'
import { SelectorVentana } from './dialogos-insercion.tsx'

const PCMA: EstructuraSinDibujo = { codigo: '1PCMA', descripcion: 'PUERTA SINTÉTICA', anchoMm: 900, altoMm: 2100 }

describe('código tecleado en el catálogo', () => {
  afterEach(() => registrarEstructurasSinDibujo([]))

  it('un código sin dibujo registrado se elige igual que una plantilla', () => {
    registrarEstructurasSinDibujo([PCMA])
    const busqueda = buscarVentanasPorCodigo('1pcma')
    expect(busqueda.coincidencias).toHaveLength(0)
    expect(resolverCodigoCatalogo(busqueda, true)).toEqual({ tipo: 'sinDibujo', estructura: PCMA })
  })

  it('sin quien sepa colocarlo, el código sin dibujo no existe', () => {
    registrarEstructurasSinDibujo([PCMA])
    expect(resolverCodigoCatalogo(buscarVentanasPorCodigo('1PCMA'), false))
      .toEqual({ tipo: 'desconocido', codigo: '1PCMA' })
  })

  it('una plantilla exacta manda y un código inexistente se queda en aviso', () => {
    registrarEstructurasSinDibujo([PCMA])
    expect(resolverCodigoCatalogo(buscarVentanasPorCodigo('2O'), true)).toMatchObject({
      tipo: 'plantilla', plantilla: { codigo: '2O' },
    })
    expect(resolverCodigoCatalogo(buscarVentanasPorCodigo('ZZZ9'), true)).toEqual({ tipo: 'desconocido', codigo: 'ZZZ9' })
    expect(resolverCodigoCatalogo(buscarVentanasPorCodigo('  '), true)).toEqual({ tipo: 'vacio' })
  })
})

describe('diálogo «Añadir ventana»', () => {
  /** El catálogo es el hijo del diálogo; sus props son lo que ejecuta Intro/Elegir. */
  const catalogoDe = (elemento: React.ReactElement) =>
    (elemento.props as { children: React.ReactElement<Record<string, unknown>> }).children.props

  it('elegir un código sin dibujo lo coloca y cierra, como una plantilla', () => {
    const orden: string[] = []
    const onElegirSinDibujo = vi.fn(() => { orden.push('colocar') })
    const onCerrar = vi.fn(() => { orden.push('cerrar') })
    const props = catalogoDe(SelectorVentana({ onElegir: vi.fn(), onElegirSinDibujo, onCerrar }))
    ;(props.onColocarSinDibujo as (e: EstructuraSinDibujo) => void)(PCMA)
    expect(onElegirSinDibujo).toHaveBeenCalledWith(PCMA)
    expect(orden).toEqual(['colocar', 'cerrar'])
  })

  it('sin colocador de códigos sin dibujo, el catálogo no los ofrece', () => {
    const props = catalogoDe(SelectorVentana({ onElegir: vi.fn(), onCerrar: vi.fn() }))
    expect(props.onColocarSinDibujo).toBeUndefined()
  })
})
