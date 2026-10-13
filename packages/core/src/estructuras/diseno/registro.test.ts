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
    expect(plantillaDiseno('C99')).toBeNull()
  })

  it('añade las generadas y las encuentra por código normalizado', () => {
    registrarCatalogoDiseno([generada('C99')])
    expect(plantillaDiseno(' c99 ')?.descripcion).toBe('GENERADA C99')
    expect(plantillasDisponibles()).toHaveLength(PLANTILLAS_DISENO.length + 1)
    expect(plantillaVerificada('C99')).toBe(false)
  })

  it('conserva C2 verificada aunque se registre una candidata con el mismo código', () => {
    registrarCatalogoDiseno([generada('C2')])
    expect(plantillaDiseno('C2')).toBe(PLANTILLAS_DISENO.find(p => p.codigo === 'C2'))
    expect(plantillaVerificada('C2')).toBe(true)
  })

  it('nunca sustituye una verificada por una generada con el mismo código', () => {
    registrarCatalogoDiseno([generada('2O', '020')])
    expect(plantillaDiseno('2O')).toBe(PLANTILLAS_DISENO.find((p) => p.codigo === '2O'))
    expect(plantillasDisponibles()).toHaveLength(PLANTILLAS_DISENO.length)
    expect(plantillaVerificada('2O')).toBe(true)
  })

  it('un registro nuevo reemplaza el anterior completo', () => {
    registrarCatalogoDiseno([generada('C99'), generada('C3')])
    registrarCatalogoDiseno([generada('C4')])
    expect(plantillaDiseno('C99')).toBeNull()
    expect(plantillaDiseno('C4')).not.toBeNull()
  })

  it('el escaparate muestra las generadas en su familia, por código', () => {
    registrarCatalogoDiseno([generada('C3'), generada('C99'), generada('C10')])
    expect(itemsEscaparate('correderas-no-perimetrales').map((p) => p.codigo)).toEqual(['C2', 'C2FI', 'C2FS', 'C2FSFI', 'C3', 'C10', 'C99'])
  })
})
