import { afterEach, describe, expect, it } from 'vitest'
import { hueco } from './constructores.ts'
import { PLANTILLAS_DISENO } from './catalogo.ts'
import {
  plantillaDiseno, plantillasDisponibles, plantillaVerificada, registrarCatalogoDiseno,
} from './registro.ts'
import { itemsEscaparate } from '../escaparate.ts'
import type { PlantillaDiseno } from './tipos.ts'

const generada = (codigo: string, familiaCodigo = '001'): PlantillaDiseno => ({
  codigo, descripcion: `GENERADA ${codigo}`, familia: 'CATALOGO', familiaCodigo,
  anchoMm: 1200, altoMm: 1200, composicion: hueco(`h-${codigo}`, 'corredera', false),
})

describe('registro del catálogo de diseño', () => {
  afterEach(() => registrarCatalogoDiseno([]))

  it('sin registro solo ofrece las plantillas verificadas', () => {
    expect(plantillasDisponibles()).toEqual(PLANTILLAS_DISENO)
    expect(plantillaDiseno('C2')).toBeNull()
  })

  it('añade las generadas y las encuentra por código normalizado', () => {
    registrarCatalogoDiseno([generada('C2')])
    expect(plantillaDiseno(' c2 ')?.descripcion).toBe('GENERADA C2')
    expect(plantillasDisponibles()).toHaveLength(PLANTILLAS_DISENO.length + 1)
    expect(plantillaVerificada('C2')).toBe(false)
  })

  it('nunca sustituye una verificada por una generada con el mismo código', () => {
    registrarCatalogoDiseno([generada('2O', '020')])
    expect(plantillaDiseno('2O')).toBe(PLANTILLAS_DISENO.find((p) => p.codigo === '2O'))
    expect(plantillasDisponibles()).toHaveLength(PLANTILLAS_DISENO.length)
    expect(plantillaVerificada('2O')).toBe(true)
  })

  it('un registro nuevo reemplaza el anterior completo', () => {
    registrarCatalogoDiseno([generada('C2'), generada('C3')])
    registrarCatalogoDiseno([generada('C4')])
    expect(plantillaDiseno('C2')).toBeNull()
    expect(plantillaDiseno('C4')).not.toBeNull()
  })

  it('el escaparate muestra las generadas en su familia, por código', () => {
    registrarCatalogoDiseno([generada('C3'), generada('C2'), generada('C10')])
    expect(itemsEscaparate('correderas-no-perimetrales').map((p) => p.codigo)).toEqual(['C2', 'C3', 'C10'])
  })
})
