import { describe, expect, it } from 'vitest'
import { CATALOGO_SNAPSHOT, crearConfiguracionCerramiento, insertarModuloEnAnclaje, plantillaDiseno } from '@aluminior/core/estructuras'
import { validarConfiguracionCerramiento } from './validacion.ts'

const CATALOGO = [
  { codigo: 'GMU038', descripcion: 'Tubo editado', grosorMm: 40, unionTipo: 0 as const },
  { codigo: 'QA-U60', descripcion: 'Tubo de usuario', grosorMm: 60, unionTipo: 0 as const },
  { codigo: 'QA-E0', descripcion: 'Esquinero de usuario', grosorMm: 0, unionTipo: 4 as const },
]

function conUnion(codigo: string, grosorMm: number) {
  let config = crearConfiguracionCerramiento(plantillaDiseno('2O')!)
  config = insertarModuloEnAnclaje(config, { estructuraCodigo: '2O', anchoMm: 1200, altoMm: 1200 },
    { moduloId: 'modulo-1', lado: 'derecha' })
  return JSON.stringify({ ...config, uniones: config.uniones.map(union => ({ ...union, codigo, grosorMm })) })
}

describe('validación de escritura con el catálogo de uniones de la base', () => {
  it('admite la unión de usuario solo con el catálogo cargado', () => {
    expect(validarConfiguracionCerramiento(conUnion('QA-U60', 60), CATALOGO).ok).toBe(true)
    expect(validarConfiguracionCerramiento(conUnion('QA-U60', 60)).ok).toBe(false)
    expect(validarConfiguracionCerramiento(conUnion('XX999', 60), CATALOGO).ok).toBe(false)
  })

  it('fija el grosor del catálogo de la base, no el de la reserva', () => {
    const r = validarConfiguracionCerramiento(conUnion('GMU038', 60), CATALOGO)
    expect(r.ok && r.configuracion.uniones[0].grosorMm).toBe(40)
  })

  it('admite el esquinero de usuario de grosor cero', () => {
    expect(validarConfiguracionCerramiento(conUnion('QA-E0', 0), CATALOGO).ok).toBe(true)
    expect(validarConfiguracionCerramiento(conUnion('QA-U60', 0), CATALOGO).ok).toBe(false)
  })

  it('al leer un snapshot guardado no consulta catálogo ni cambia su grosor', () => {
    const r = validarConfiguracionCerramiento(conUnion('QA-U60', 60), CATALOGO_SNAPSHOT)
    expect(r.ok && r.configuracion.uniones[0].grosorMm).toBe(60)
  })
})
